using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Helpers;
using UELPM.Service.Interface;
using UELPM.Util.Email;
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class GenericRepository : IGenericRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        AuditLogRepository auditLogRepository = null;
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        UserProfileRepository userProfileRepository = null;
        SharedRepository sharedRepository = null;
        public GenericRepository()
        {
            auditLogRepository = new AuditLogRepository();
            userProfileRepository = new UserProfileRepository();
            workFlowConfigRepository = new WorkFlowConfigurationRepository();
            sharedRepository = new SharedRepository();
        }

        public bool RecallDocumentApproval(ProjectDocument document)
        {
            bool isCancelled = false;
            DateTime now = DateTime.Now;
            try
            {
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                var user = userProfileRepository.GetUserById(document.CreatedBy);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                string documentTitle = SharedRepository.GetNotificationType(document.DocumentTypeId);
                var tableDetails = SharedRepository.GetMasterTableName(document.DocumentTypeId);
                string deleteWF = @" DELETE dbo.workflow WHERE  documentid = @DocumentId AND processid = @ProcessId;";
                string changeStatus = @"UPDATE {0} SET workflowstatusid = @DocumentWFStatusId,UpdatedBy=@UpdatedBy,UpdatedDate=GETDATE()  
                                        WHERE  {1} = @DocumentId;";
                if (this.m_dbconnection.State == ConnectionState.Closed)
                    this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    LogDocumentWorkflow(document, transactionObj);
                    var deleteCount = this.m_dbconnection.Execute(deleteWF, new
                    {
                        DocumentId = document.DocumentId,
                        ProcessId = document.DocumentTypeId,
                    }, transaction: transactionObj);
                    var updateCount = this.m_dbconnection.Execute(string.Format(changeStatus, tableDetails.Item1, tableDetails.Item2), new
                    {
                        DocumentId = document.DocumentId,
                        DocumentWFStatusId = document.DocumentWFStatusId,
                        UpdatedBy = document.CreatedBy,
                    }, transaction: transactionObj);
                    if (deleteCount > 0 && updateCount > 0)
                    {
                        transactionObj.Commit();
                        sendRecallApprovalMail(document);
                        createNotification(document);

                        AuditLog.Info(Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId), "Recall Approval", document.CreatedBy.ToString(), document.DocumentId.ToString(), "RecallPoApproval", string.Format("Cancelled Approval by {0} on {1} ", UserName, now));
                        AuditLog.Info(Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId), "Recall Approval", document.CreatedBy.ToString(), document.DocumentId.ToString(), "RecallPoApproval", string.Format("Reason for cancel approval is : {0} ", document.Remarks));
                        isCancelled = true;
                    }
                    else
                    {
                        transactionObj.Rollback();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return isCancelled;
        }

        private void createNotification(ProjectDocument document)
        {
            try
            {
                string documentTitle = SharedRepository.GetNotificationType(document.DocumentTypeId);
                NotificationsRepository notificationObj = new NotificationsRepository();
                notificationObj.CreateNotification(new Notifications()
                {
                    NotificationId = 0,
                    NotificationType = documentTitle,
                    NotificationMessage = SharedRepository.GetNotificationMessage(document.DocumentTypeId, 0, 0) + " has been recalled",
                    ProcessId = document.DocumentTypeId,
                    ProcessName = "",
                    DocumentId = document.DocumentId,
                    UserId = document.CurrentApproverUserId,
                    IsRead = false,
                    CreatedBy = document.CreatedBy,
                    CreatedDate = DateTime.Now,
                    IsNew = true,
                    CompanyId = document.CompanyId,
                    CompanyName = "",
                    IsforAll = false,
                    MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                    DocumentCode = document.DocumentCode
                });
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void sendRecallApprovalMail(ProjectDocument document)
        {
            try
            {
                var company = new SharedRepository().GetCompanyDetails(document.CompanyId);
                var mailData = new DocumentMailData()
                {
                    DocumentCode = document.DocumentCode,
                    DocumentValue = Convert.ToString(document.DocumentValue),
                    Receiver = new UserProfileRepository().GetUserById(document.CurrentApproverUserId),
                    Sender = new UserProfileRepository().GetUserById(document.CreatedBy),
                    DocumentStatus = "ReCall",
                    CompanyShortName = company.CompanyShortName,
                    ProcessId = document.DocumentTypeId
                };
                if (document.DocumentTypeId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                {
                    var repository = new ProjectPaymentContractRepository();
                    var data = repository.getCertificatesByPaymentContractId(0, document.DocumentId);
                    mailData.DocumentSubjectCode = "POP Pyt";
                    mailData.MailTemplatepath = ("~/EmailTemplates/POPPaymentRecallEmail.txt");
                    mailData.Supplier = data.ProjectMasterContract.Supplier;
                }
                else if (document.DocumentTypeId == (int)WorkFlowProcessTypes.ProjectContractVariationOrder)
                {
                    var repository = new ProjectContractVariationOrderRepository();
                    var data = repository.getVODetailsbyId(0, document.DocumentId);
                    mailData.DocumentSubjectCode = "POP VO";
                    mailData.MailTemplatepath = ("~/EmailTemplates/POPVORecallEmail.txt");
                    mailData.Supplier = data.Supplier;
                }
                else if (document.DocumentTypeId == (int)WorkFlowProcessTypes.Supplier)
                {
                    var repository = new SupplierRepository();
                    var data = repository.GetSupplier(document.DocumentId, document.CompanyId);
                    mailData.DocumentSubjectCode = "SS";
                    mailData.MailTemplatepath = ("~/EmailTemplates/SupplierRecallEmail.txt");
                    mailData.Supplier = new Suppliers
                    {
                        SupplierCode = data.SupplierCode,
                        SupplierName = data.SupplierName,
                        CategoryName = data.CategoryName,
                        WorkFlowStatus = data.WorkFlowStatus,
                        CreatedDate = data.CreatedDate
                    };
                }
                var mailStatus = Util.Email.GenericEmailProvider.SendRecallApprovalMail(mailData);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = Enum.GetName(typeof(AttachmentType), attachment.AttachmentTypeId),
                    FilesNames = new string[] { attachment.FileName },
                    UniqueId = attachment.RecordId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void LogDocumentWorkflow(ProjectDocument document, IDbTransaction transactionObj)
        {
            try
            {
                this.m_dbconnection.Query<int>("WorkflowAuditTrail_CRUD", new
                {
                    Action = "INSERT",
                    Documentid = document.DocumentId,
                    ProcessId = document.DocumentTypeId,
                    UserId = document.CreatedBy,
                    Remarks = document.Remarks,
                    Statusid = document.DocumentWFStatusId,
                    CreatedDate = DateTime.Now,
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool VoidDocument(WorkFlowApproval workFlowApproval)
        {
            bool voidStatus = false;
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                        {
                            #region inserting record in work flow table

                            WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                            {
                                Action = "UPDATESTATUS",
                                DocumentId = workFlowApproval.DocumentId,
                                ProcessId = workFlowApproval.ProcessId,
                                WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                                ApproverUserId = workFlowApproval.ApproverUserId,
                                CompanyId = workFlowApproval.CompanyId,
                                IsReApproval = workFlowApproval.IsReApproval
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                            #endregion

                            #region request status update..

                            string procedureName = new SharedRepository().GetProcedureName(workFlowApproval.ProcessId);

                            int updateStatus = this.m_dbconnection.Execute(procedureName, new
                            {
                                Action = "UPDATEWORKFLOWSTATUS",
                                DocumentId = workFlowApproval.DocumentId,
                                CompanyId = workFlowApproval.CompanyId,
                                WorkFlowStatusId = workFlowApproval.WorkFlowStatusId
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                            #endregion

                            #region inserting record in work flow audit trial

                            int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                            {
                                Action = "INSERT",
                                DocumentId = workFlowApproval.DocumentId,
                                ProcessId = workFlowApproval.ProcessId,
                                Remarks = workFlowApproval.Remarks,
                                StatusId = workFlowApproval.WorkFlowStatusId,
                                UserId = workFlowApproval.UserId
                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                            #endregion

                            #region inserting record in notification
                            try
                            {
                                NotificationsRepository notificationObj = new NotificationsRepository();
                                notificationObj.CreateNotification(new Notifications()
                                {

                                    NotificationId = 0,
                                    NotificationType = SharedRepository.GetNotificationType(workFlowApproval.ProcessId),
                                    NotificationMessage = SharedRepository.GetNotificationMessage(workFlowApproval.ProcessId, workFlowApproval.WorkFlowStatusId),
                                    ProcessId = workFlowApproval.ProcessId,
                                    ProcessName = "",
                                    DocumentId = workFlowApproval.DocumentId,
                                    UserId = workFlowApproval.ApproverUserId,
                                    IsRead = false,
                                    CreatedBy = workFlowApproval.UserId,
                                    CreatedDate = DateTime.Now,
                                    IsNew = true,
                                    CompanyId = workFlowApproval.CompanyId,
                                    CompanyName = "",
                                    IsforAll = false,
                                    MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                                    DocumentCode = workFlowApproval.DocumentCode
                                });

                            }
                            catch (Exception e)
                            {
                                throw e;
                            }
                            #endregion

                            #region VoidAuditLod


                            #endregion
                            transactionObj.Commit();


                            ProjectDocument documentData = new ProjectDocument
                            {
                                CompanyId = workFlowApproval.CompanyId,
                                DocumentId = workFlowApproval.DocumentId,
                                UserId = workFlowApproval.UserId,
                                DocumentTypeId = workFlowApproval.ProcessId
                            };
                            auditLogRepository.LogVoidDocument(documentData);


                            voidStatus = true;
                            return voidStatus;
                        }
                        else
                        {
                            _VoidDocument(workFlowApproval, transactionObj, this.m_dbconnection);
                            transactionObj.Commit();
                            voidStatus = true;
                            return voidStatus;
                        }
                    }
                    catch (Exception e)
                    {
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void ModifyWorkflow(WorkFlowParameter workFlowParameter, IDbTransaction transactionObj, IDbConnection m_dbconnection)
        {
            workFlowConfigRepository = new WorkFlowConfigurationRepository();
            var approverList = m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD", new
            {
                Action = "VERIFY_IS_VERIFIER",
                DocumentId = workFlowParameter.DocumentId,
                ProcessId = workFlowParameter.ProcessId,
                CompanyId = workFlowParameter.CompanyId,
                PageName = "Customer"
            }, transaction: transactionObj, commandType: CommandType.StoredProcedure).ToList();
            var inUsers = approverList.TakeWhile(x => x.Status != (int)WorkFlowStatus.Initiated).ToList();
            var outUsers = approverList.SkipWhile(x => x.Status == (int)WorkFlowStatus.Approved || x.Status == (int)WorkFlowStatus.ApprovalInProgress).ToList();
            if (approverList.Count > 0)
            {
                List<DynamicParameters> itemToDelete = new List<DynamicParameters>();
                foreach (var item in outUsers)
                {
                    if (item.Status != (int)WorkFlowStatus.Approved && item.Status != (int)WorkFlowStatus.ApprovalInProgress)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@WorkFlowId", item.WorkFlowId, DbType.Int32, ParameterDirection.Input);
                        itemToDelete.Add(itemObj);
                    }
                }
                m_dbconnection.Execute("WorkFlow_CRUD", itemToDelete, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                var latestWF = this.workFlowConfigRepository.GetWorkFlowApprovers(workFlowParameter);
                List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                int i = 0;
                bool canInsert = false;
                foreach (var item in latestWF)
                {
                    try
                    {
                        canInsert = (inUsers[i].ApproverUserId == item.ApproverUserId && inUsers[i].Status != 4 && inUsers[i].Status != 3) ? true : false;
                    }
                    catch (Exception)
                    {
                        canInsert = true;
                    }
                    if (canInsert)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@DocumentId", workFlowParameter.DocumentId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@ProcessId", workFlowParameter.ProcessId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CompanyId", workFlowParameter.CompanyId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@ApproverUserId", item.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@WorkFlowOrder", item.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@WorkFlowStatusId", (int)WorkFlowStatus.Initiated, DbType.Int32, ParameterDirection.Input);
                        itemToAdd.Add(itemObj);
                    }
                    i++;
                }
                m_dbconnection.Execute("WorkFlow_CRUD", itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
            }
        }

        private void _VoidDocument(WorkFlowApproval workFlowApproval, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            this.UpdateDocumentWFStatus(new WorkFlowParameter
            {
                WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                ProcessId = workFlowApproval.ProcessId,
                DocumentId = workFlowApproval.DocumentId
            }, m_dbconnection, transaction);
            this.InsertWFAuditTrail(workFlowApproval, m_dbconnection, transaction);

            //this.SendPurchaseOrderReplyMail(requestApproval.ApproverUserId, requestApproval.UserId, requestApproval.Remarks, requestApproval.PurchaseOrderId, requestApproval.PurchaseOrderCode, requestApproval.ProcessId, requestApproval.CompanyId);

            AuditLogData auditLogData = new AuditLogData
            {
                DocumentId = workFlowApproval.DocumentId,
                PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApproval.ProcessId),
                Logger = workFlowApproval.UserId,
                Action = "VOID",
                CompanyId = workFlowApproval.CompanyId,
                Remarks = workFlowApproval.Remarks
            };
            auditLogRepository._LogVoidDocument(auditLogData, transaction, m_dbconnection);

            if (workFlowApproval.ReferenceDocumentId != 0)
            {
                string pageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApproval.ProcessId);
                AuditLogData logData = new AuditLogData
                {
                    DocumentId = workFlowApproval.ReferenceDocumentId,
                    PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApproval.ReferenceProcessId),
                    Logger = workFlowApproval.RequestUserId,
                    DocumentCode = workFlowApproval.DocumentCode,
                    CompanyId = workFlowApproval.CompanyId,
                    Message = pageName + " ({0}) by {1} on {2}. Status = Voided"
                };
                auditLogRepository.UpdateLogInParentDocument(logData, transaction, m_dbconnection);
            }
        }

        public string GenerateDocumentCode(ProjectDocument documentData, IDbTransaction transactionObj, IDbConnection dbConnection)
        {
            string documentCode = string.Empty;
            documentCode = dbConnection.ExecuteScalar<string>("SP_Document_Code", new
            {
                Action = "Generate_Document_Code",
                CompanyId = documentData.CompanyId,
                ProcessId = documentData.DocumentTypeId,
                DocumentCode = documentData.DocumentCode
            }, transactionObj, commandType: CommandType.StoredProcedure);
            return documentCode;
        }

        public bool checkPendingDocuments(ProjectDocument document)
        {
            bool hasPendingDocuments = false;
            string query = string.Empty;
            try
            {
                if (document.DocumentTypeId == (int)WorkFlowProcessTypes.ProjectContractVariationOrder)
                {
                    query = @"if exists (select top 1 * from variationorder where POPId=@DocumentId and WorkFlowStatusId not in (4,5) order by VOId desc)
                                    select 1
                                else
                                    select 0";
                }
                else if (document.DocumentTypeId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                {
                    query = @"if exists (select top 1 POPId from ProjectPaymentContract where POPId=@DocumentId and WorkFlowStatusId not in (4,5,12,14,25,26) order by PaymentContractId desc
                                         union all
                                         select top 1 POPId from variationorder where POPId=@DocumentId and WorkFlowStatusId not in (4,5) order by VOId desc
                                         )
                                    select 1
                                else
                                    select 0";
                }
                else if (document.DocumentTypeId == (int)WorkFlowProcessTypes.SupplierInvoice)
                {
                    query = @"if exists (select * from Invoice as I inner join InvoiceGRN as IG on I.InvoiceId = IG.InvoiceId and I.WorkFlowStatusId not in (12,24)
                                         where IG.IsDeleted=0 and IG.GoodsReceivedNoteId=@DocumentId and IG.PoTypeId in (1,2,3))
                                            select 1
                                            else 
                                            select 0";
                }
                hasPendingDocuments = this.m_dbconnection.ExecuteScalar<bool>(query, new
                {
                    DocumentId = document.DocumentId
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return hasPendingDocuments;
        }

        public bool CancelDraftDocument(WorkFlowApproval workFlowApproval)
        {
            bool voidStatus = false;
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region inserting record in work flow table
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = workFlowApproval.DocumentId,
                            ProcessId = workFlowApproval.ProcessId,
                            WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                            ApproverUserId = workFlowApproval.ApproverUserId,
                            CompanyId = workFlowApproval.CompanyId,
                            IsReApproval = workFlowApproval.IsReApproval
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();
                        #endregion                     

                        #region request status update..
                        string procedureName = new SharedRepository().GetProcedureName(workFlowApproval.ProcessId);
                        int updateStatus = this.m_dbconnection.Execute(procedureName, new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = workFlowApproval.DocumentId,
                            CompanyId = workFlowApproval.CompanyId,
                            WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                            DocumentCode = workFlowApproval.DocumentCode
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        #endregion

                        #region inserting record in work flow audit trial
                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = workFlowApproval.DocumentId,
                            ProcessId = workFlowApproval.ProcessId,
                            Remarks = workFlowApproval.Remarks,
                            StatusId = workFlowApproval.WorkFlowStatusId,
                            UserId = workFlowApproval.UserId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion

                        transactionObj.Commit();

                        #region VoidAuditLod
                        ProjectDocument documentData = new ProjectDocument
                        {
                            CompanyId = workFlowApproval.CompanyId,
                            DocumentId = workFlowApproval.DocumentId,
                            UserId = workFlowApproval.UserId,
                            DocumentTypeId = workFlowApproval.ProcessId
                        };
                        auditLogRepository.LogCancelDraftDocument(documentData);
                        #endregion

                        voidStatus = true;
                        return voidStatus;
                    }
                    catch (Exception e)
                    {
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool CreateNotification(Notifications notifications, IDbConnection dbConnection, IDbTransaction dbTransaction)
        {
            try
            {
                var result = dbConnection.Query("Notifications_CRUD", new
                {
                    Action = "INSERT",
                    CompanyId = notifications.CompanyId,
                    IsforAll = notifications.IsforAll,
                    IsNew = notifications.IsNew,
                    IsRead = notifications.IsRead,
                    NotificationMessage = notifications.NotificationMessage,
                    NotificationType = notifications.NotificationType,
                    UserId = notifications.UserId,
                    CreatedBy = notifications.CreatedBy,
                    CreatedDate = DateTime.Now,
                    ProcessId = notifications.ProcessId,
                    DocumentId = notifications.DocumentId,
                    MessageType = notifications.MessageType,
                    DocumentCode = notifications.DocumentCode
                }, dbTransaction, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                ErrorLog.Log("GenericController", "Send Document", "CreateNotification", ex.ToString());
            }
            return true;
        }

        public bool InsertDocumentWFStatus(WorkFlowParameter workFlowApproval, IDbConnection dbConnection, IDbTransaction dbTransaction)
        {
            try
            {
                var result = dbConnection.Query("WorkFlow_CRUD", new
                {
                    Action = "INSERT_DOC_WF_STATUS",
                    WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                    ProcessId = workFlowApproval.ProcessId,
                    DocumentId = workFlowApproval.DocumentId
                }, dbTransaction, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                ErrorLog.Log("GenericController", "Send Document", "UpdateDocumentWFStatus", ex.ToString());
            }
            return true;
        }

        public bool UpdateDocumentWFStatus(WorkFlowParameter workFlowApproval, IDbConnection dbConnection, IDbTransaction dbTransaction)
        {
            try
            {
                var result = dbConnection.Query("WorkFlow_CRUD", new
                {
                    Action = "UPDATE_DOC_WF_STATUS",
                    WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                    ProcessId = workFlowApproval.ProcessId,
                    DocumentId = workFlowApproval.DocumentId
                }, dbTransaction, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                ErrorLog.Log("GenericController", "Send Document", "UpdateDocumentWFStatus", ex.ToString());
            }
            return true;
        }

        public bool SendDocument(WorkFlowParameter workFlowApproval, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {
            bool isSent = false;
            bool commitTrans = false;
            if (dbConnection == null && dbTransaction == null)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
                commitTrans = true;
            }
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            string nextUserRole = string.Empty;
            workFlowConfigRepository = new WorkFlowConfigurationRepository();
            int NextApprover = 0;
            try
            {
                //get workflow configuration
                var workFlowConfiguration = workFlowConfigRepository.GetWorkFlowConfiguration(workFlowApproval.ProcessId, workFlowApproval.CompanyId, workFlowApproval.LocationId);
                //get users based on condition
                List<WorkFlow> workFlowUsers = GetWorkflowUsers(workFlowApproval, workFlowConfiguration);
                //saving users to workflow table
                if (workFlowUsers != null && workFlowUsers.Count > 0)
                {
                    workFlowUsers.FirstOrDefault().Status = ((int)WorkFlowStatus.ApprovalInProgress).ToString();
                    try
                    {
                        List<DynamicParameters> wfUsers = new List<DynamicParameters>();
                        foreach (var workFlow in workFlowUsers)
                        {
                            var param = new DynamicParameters();
                            param.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            param.Add("@DocumentId", workFlow.DocumentId, DbType.Int32, ParameterDirection.Input);
                            param.Add("@ProcessId", workFlow.ProcessId, DbType.Int32, ParameterDirection.Input);
                            param.Add("@CompanyId", workFlowApproval.CompanyId, DbType.Int32, ParameterDirection.Input);
                            param.Add("@ApproverUserId", workFlow.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                            param.Add("@WorkFlowOrder", workFlow.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                            param.Add("@WorkFlowStatusId", workFlow.Status, DbType.Int32, ParameterDirection.Input);
                            wfUsers.Add(param);
                        }
                        var workFlowStatus = dbConnection.Execute("WorkFlow_CRUD", wfUsers, transaction: dbTransaction, commandType: CommandType.StoredProcedure);
                    }
                    catch (Exception ex)
                    {
                        ErrorLog.Log("GenericController", "Send Document", "INSERTING WF", ex.ToString());
                    }
                    UpdateDocumentWFStatus(workFlowApproval, dbConnection, dbTransaction);
                    NextApprover = (int)workFlowUsers.First().ApproverUserId;
                    UserProfile nextUserRoles = userProfileRepository.GetUserRolesInCompany(NextApprover, workFlowApproval.CompanyId);
                    nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                    // audit log for send for approval
                    AuditLogData auditLogData = new AuditLogData
                    {
                        DocumentId = workFlowApproval.DocumentId,
                        PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApproval.ProcessId),
                        Logger = NextApprover,
                        Action = "SEND",
                        CompanyId = workFlowApproval.CompanyId,
                        LoggerRole = nextUserRole
                    };
                    auditLogRepository.LogSendForApprovalDocument(auditLogData, dbTransaction, dbConnection);
                    ErrorLog.Log("Generic592", "", "SendForApprovalDocument", "Mail send Started");
                    SendWorkflowEmailNotification(new MailData
                    {
                        DocumentId = workFlowApproval.DocumentId,
                        Sender = workFlowApproval.UserID,
                        Receiver = NextApprover,
                        CompanyId = workFlowApproval.CompanyId,
                        ProcessId = workFlowApproval.ProcessId
                    }, dbConnection, dbTransaction);
                    ErrorLog.Log("Generic601", "", "SendForApprovalDocument", "Mail send Ended");
                    // notification to first approver/verifier
                    workFlowApproval.UserID = NextApprover;
                    SendForApprovalNotification(workFlowApproval, dbConnection, dbTransaction);
                    if (commitTrans)
                        dbTransaction.Commit();
                }
            }
            catch (Exception ex)
            {
                dbTransaction.Rollback();
                throw ex;
            }
            return isSent;
        }

        private DocumentMailData GetDocumentMailData(WorkFlowParameter workFlowApproval, IDbConnection connection, IDbTransaction transaction)
        {
            DocumentMailData documentMailData = new DocumentMailData();
            string landPage = "approval";
            documentMailData.MailTemplatepath = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApproval.ProcessId);
            try
            {
                if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.CreditNote)
                {
                    var creditNoteDetails = new CreditNoteRepository().GetCreditNoteEmailData(workFlowApproval.DocumentId, connection, transaction);
                    if (creditNoteDetails.WorkFlowStatusId == (int)WorkFlowStatus.Completed ||
                        creditNoteDetails.WorkFlowStatusId == (int)WorkFlowStatus.AskedForClarification ||
                        creditNoteDetails.WorkFlowStatusId == (int)WorkFlowStatus.Rejected)
                    {
                        landPage = "request";
                    }
                    int sno = 1;
                    foreach (var item in creditNoteDetails.CreditNoteLineItems)
                    {
                        documentMailData.ItemDetails.Add(new LineItem
                        {
                            SNo = sno,
                            Item = item.ItemType,
                            Description = item.GlDescription,
                            Quantity = $"{item.ReturnQty.ToString("0.0000", CultureInfo.InvariantCulture)}",
                            UnitPrice = $"{((decimal)item.Unitprice).ToString("0,0.0000", CultureInfo.InvariantCulture)}",
                            Total = item.CNTotalValue == null ? "0.0000" : $"{((decimal)item.CNTotalValue).ToString("0,0.0000", CultureInfo.InvariantCulture)}"
                        });
                        sno++;
                    }
                    documentMailData.DocumentValue = $"{((decimal)creditNoteDetails.CreditNoteTotal).ToString("0.00", CultureInfo.InvariantCulture)}";
                    documentMailData.DocumentCode = creditNoteDetails.DocumentCode;
                    documentMailData.InvoiceCode = creditNoteDetails.InvoiceCode;
                    documentMailData.DocumentStatus = creditNoteDetails.WorkFlowStatus;
                    documentMailData.WFStatusId = creditNoteDetails.WorkFlowStatusId;
                    documentMailData.Supplier = new Suppliers
                    {
                        SupplierCode = creditNoteDetails.SupplierCode,
                        SupplierName = creditNoteDetails.SupplierName,
                        SupplierShortName = creditNoteDetails.SupplierShortName
                    };
                    documentMailData.DocumentSubjectCode = "CN";
                    documentMailData.MailLink = ConfigurationManager.AppSettings["CreditNoteRequestApproval"] + landPage + "?id=" + workFlowApproval.DocumentId + "&cid=" + workFlowApproval.CompanyId;
                    documentMailData.DocumentCurrencySymbol = creditNoteDetails.CurrencySymbol;
                }
                if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.CustomerMaster)
                {
                    SalesCustomer customer = new CustomerRepository().GetCustomerEmailData(workFlowApproval.DocumentId, connection, transaction);
                    if (customer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved ||
                        customer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.AskedForClarification ||
                        customer.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Rejected)
                    {
                        landPage = "request";
                    }

                    documentMailData.DocumentCode = string.IsNullOrEmpty(customer.CustomerId) ? customer.CustomerName : customer.CustomerId;
                    documentMailData.CustomerName = customer.CustomerName;
                    documentMailData.CustomerType = customer.CustomerType.CustomerTypeName;
                    documentMailData.DocumentStatus = customer.WorkflowStatus.Statustext;
                    documentMailData.WFStatusId = customer.WorkflowStatus.WorkFlowStatusid;

                    documentMailData.DocumentSubjectCode = "Customer";
                    documentMailData.MailLink = ConfigurationManager.AppSettings["CustomerRequestApproval"] + landPage + "?id=" + workFlowApproval.DocumentId + "&cid=" + workFlowApproval.CompanyId;

                }
                if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.SalesQuotation)
                {
                    SalesQuotationMailData quotation = new SalesQuotationRepository().GetQuotationEmailData(workFlowApproval.DocumentId, connection, transaction);
                    if (quotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved ||
                        quotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.AskedForClarification ||
                        quotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Rejected)
                    {
                        landPage = "request";
                    }
                    documentMailData.DocumentCode = quotation.DocumentCode;
                    documentMailData.CustomerName = quotation.CustomerName;
                    documentMailData.CustomerShortName = quotation.CustomerShortName;
                    documentMailData.CreditTerm = quotation.CreditTerm;
                    documentMailData.Subject = quotation.Subject;
                    documentMailData.DocumentValue = $"{quotation.Amount.ToString("0.00", CultureInfo.InvariantCulture)}";
                    documentMailData.DocumentStatus = quotation.WorkflowStatus.Statustext;
                    documentMailData.WFStatusId = quotation.WorkflowStatus.WorkFlowStatusid;
                    documentMailData.DocumentSubjectCode = "SQ";
                    documentMailData.MailLink = ConfigurationManager.AppSettings["SalesQuotationRequestApproval"] + landPage + "?id=" + workFlowApproval.DocumentId + "&cid=" + workFlowApproval.CompanyId;
                }
                if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.SalesInvoice)
                {
                    SalesInvoiceMailData quotation = new SalesInvoiceRepository().GetInvoiceEmailData(workFlowApproval.DocumentId, connection, transaction);
                    if (quotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved ||
                        quotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.AskedForClarification ||
                        quotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Rejected)
                    {
                        landPage = "request";
                    }
                    documentMailData.DocumentCode = quotation.DocumentCode;
                    documentMailData.CustomerName = quotation.CustomerName;
                    documentMailData.CustomerShortName = quotation.CustomerShortName;
                    documentMailData.CreditTerm = quotation.CreditTerm;
                    documentMailData.Subject = quotation.Subject;
                    documentMailData.DocumentValue = $"{quotation.Amount.ToString("0.00", CultureInfo.InvariantCulture)}";
                    documentMailData.DocumentStatus = quotation.WorkflowStatus.Statustext;
                    documentMailData.WFStatusId = quotation.WorkflowStatus.WorkFlowStatusid;
                    documentMailData.DocumentSubjectCode = "SI";
                    documentMailData.MailLink = ConfigurationManager.AppSettings["SalesInvoiceRequestApproval"] + landPage + "?id=" + workFlowApproval.DocumentId + "&cid=" + workFlowApproval.CompanyId;
                }
            }
            catch (Exception)
            {
                throw;
            }
            return documentMailData;
        }

        private void SendWorkflowEmailNotification(MailData mailData, IDbConnection connection, IDbTransaction transaction)
        {
            try
            {
                DocumentMailData documentMailData = GetDocumentMailData(new WorkFlowParameter
                {
                    CompanyId = mailData.CompanyId,
                    DocumentId = mailData.DocumentId,
                    ProcessId = mailData.ProcessId
                }, connection, transaction);
                userProfileRepository = new UserProfileRepository();
                CompanyDetails company = sharedRepository.GetCompanyDetails(mailData.CompanyId);
                documentMailData.ProcessId = mailData.ProcessId;
                documentMailData.CompanyShortName = company.CompanyShortName;
                documentMailData.ChatRemarks = mailData.ChatRemarks;
                documentMailData.MailTitle = StringOperations.ToSentence(Enum.GetName(typeof(WorkFlowProcessTypes), mailData.ProcessId));
                documentMailData.Receiver = userProfileRepository.GetUserById(mailData.Receiver);
                documentMailData.Sender = userProfileRepository.GetUserById(mailData.Sender);
                Util.Email.GenericEmailProvider.SendWorkflowEmailNotification(documentMailData);
            }
            catch (Exception ex)
            {
                ErrorLog.Log("GenericController", "Send Document", "SendWorkflowEmailNotification", ex.ToString());
            }

        }

        public bool SendDocumentForApproval(WorkFlowParameter workFlowApproval)
        {
            return this.SendDocument(workFlowApproval);
        }

        private bool SendForApprovalNotification(WorkFlowParameter workFlowApproval, IDbConnection dbConnection, IDbTransaction dbTransaction)
        {
            var notification = new Notifications
            {
                NotificationId = 0,
                NotificationType = SharedRepository.GetNotificationType(workFlowApproval.ProcessId),
                NotificationMessage = SharedRepository.GetNotificationMessage(workFlowApproval.ProcessId, (int)WorkFlowStatus.ApprovalInProgress),
                ProcessId = workFlowApproval.ProcessId,
                ProcessName = "",
                DocumentId = workFlowApproval.DocumentId,
                UserId = Convert.ToInt32(workFlowApproval.UserID),
                IsRead = false,
                CreatedBy = workFlowApproval.CreatedBy,
                CreatedDate = DateTime.Now,
                IsNew = true,
                CompanyId = workFlowApproval.CompanyId,
                CompanyName = "",
                IsforAll = false,
                MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                DocumentCode = workFlowApproval.DocumentCode
            };
            dbConnection.Query("Notifications_CRUD", new
            {
                Action = "UPDATETOREAD",
                CompanyId = workFlowApproval.CompanyId,
                ProcessId = workFlowApproval.ProcessId,
                DocumentId = workFlowApproval.DocumentId
            }, dbTransaction, commandType: CommandType.StoredProcedure);
            return CreateNotification(notification, dbConnection, dbTransaction);
        }

        private List<WorkFlow> GetWorkflowUsers(WorkFlowParameter workFlow, WorkFlowConfiguration workFlowConfiguration)
        {
            List<WorkFlow> objWorkFlowList = new List<WorkFlow>();
            int conditionCount = 0;
            bool isBeforeCondition = false;
            bool isValid = false;
            int order = 0;
            bool isNumerical = false;
            WorkFlowFieldNames filedNames;
            foreach (var workProcess in workFlowConfiguration.WorkFlowProcess)
            {
                WorkFlow objWorkFlow = null;
                int conditions = workProcess.WorkFlowLevels.Where(x => x.IsCondition == true).Count();
                foreach (var workLevel in workProcess.WorkFlowLevels)
                {
                    objWorkFlow = new WorkFlow();
                    if (workLevel.IsCondition)
                    {
                        conditionCount += 1;
                    }

                    if (conditionCount > 1 && workLevel.IsCondition)
                    {
                        isBeforeCondition = false;
                    }
                    if ((workLevel.IsCondition) || (isBeforeCondition))
                    {
                        isBeforeCondition = true;
                        if (conditions > 0)
                        {
                            if (isValid && !workLevel.IsCondition)
                            {
                                order++;
                                objWorkFlow.ProcessId = workFlow.ProcessId;
                                //objWorkFlow.WorkFlowOrder = workLevel.LevelIndex;
                                objWorkFlow.WorkFlowOrder = order;
                                objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                objWorkFlow.Status = "1";
                                objWorkFlow.DocumentId = workFlow.DocumentId;
                                objWorkFlowList.Add(objWorkFlow);
                            }

                            if (workLevel.IsCondition)
                            {
                                if (Enum.TryParse(workLevel.FieldName, out filedNames))
                                {
                                    switch (filedNames)
                                    {
                                        case WorkFlowFieldNames.TotalAmount:
                                            isNumerical = StringOperations.IsNumbersOnly(workFlow.Value);
                                            if (isNumerical)
                                            {
                                                isValid = StringOperations.CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlow.Value), workLevel.Operator);
                                            }
                                            break;
                                        case WorkFlowFieldNames.CreditLimit:
                                            isNumerical = StringOperations.IsNumbersOnly(workFlow.Value);
                                            if (isNumerical)
                                            {
                                                isValid = StringOperations.CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlow.Value), workLevel.Operator);
                                            }
                                            break;
                                        case WorkFlowFieldNames.ItemQty:
                                            isNumerical = StringOperations.IsNumbersOnly(Convert.ToString(workFlow.ItemQuantity));
                                            if (isNumerical)
                                            {
                                                isValid = StringOperations.CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlow.ItemQuantity), workLevel.Operator);
                                            }
                                            break;
                                        case WorkFlowFieldNames.AssetQty:
                                            isNumerical = StringOperations.IsNumbersOnly(Convert.ToString(workFlow.ItemQuantity));
                                            if (isNumerical)
                                            {
                                                isValid = StringOperations.CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlow.ItemQuantity), workLevel.Operator);
                                            }
                                            break;
                                        case WorkFlowFieldNames.ItemCategory:
                                            if (!string.IsNullOrEmpty(workFlow.ItemCategory))
                                            {
                                                if (workLevel.Value.Trim().ToLower() == workFlow.ItemCategory.Trim().ToLower())
                                                {
                                                    isValid = true;
                                                }
                                            }
                                            break;
                                        case WorkFlowFieldNames.Unitprice:
                                            isNumerical = StringOperations.IsNumbersOnly(workFlow.UnitPrice);
                                            if (isNumerical)
                                            {
                                                isValid = StringOperations.CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlow.UnitPrice), workLevel.Operator);
                                            }
                                            break;
                                        case WorkFlowFieldNames.ContractSum:
                                            isNumerical = StringOperations.IsNumbersOnly(workFlow.Value);
                                            if (isNumerical)
                                            {
                                                isValid = StringOperations.CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlow.Value), workLevel.Operator);
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                }

                            }
                        }
                        else
                        {
                            order++;
                            objWorkFlow.ProcessId = workFlow.ProcessId;
                            //objWorkFlow.WorkFlowOrder = workLevel.LevelIndex;
                            objWorkFlow.WorkFlowOrder = order;
                            objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                            objWorkFlow.Status = "1";
                            objWorkFlow.DocumentId = workFlow.DocumentId;
                            objWorkFlowList.Add(objWorkFlow);
                        }
                    }
                    else
                    {
                        if (!isBeforeCondition)
                        {
                            order++;
                            objWorkFlow.ProcessId = workFlow.ProcessId;
                            //objWorkFlow.WorkFlowOrder = workLevel.LevelIndex;
                            objWorkFlow.WorkFlowOrder = order;
                            objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                            objWorkFlow.Status = "1";
                            objWorkFlow.DocumentId = workFlow.DocumentId;
                            objWorkFlowList.Add(objWorkFlow);
                        }
                    }

                }
            }
            return objWorkFlowList;
        }

        public bool ApproveDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                UserProfile currentUserRoles = new UserProfile();
                UserProfile nextUserRoles = new UserProfile();
                string currentUserRole = string.Empty;
                string nextUserRole = string.Empty;
                this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        MailData mailData = new MailData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            CompanyId = workFlowApprovals.CompanyId,
                            ProcessId = workFlowApprovals.ProcessId
                        };
                        this.workFlowConfigRepository.UpdateWorkflowStatus(workFlowApprovals, m_dbconnection, transaction);
                        currentUserRoles = userProfileRepository.GetUserRolesInCompany(workFlowApprovals.ApproverUserId, workFlowApprovals.CompanyId);
                        currentUserRole = currentUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                        workFlowApprovals.Remarks = (currentUserRole == "V") ? "Verified" : "Approved";
                        this.InsertWFAuditTrail(workFlowApprovals, m_dbconnection, transaction);
                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                            Logger = workFlowApprovals.ApproverUserId,
                            Action = "APPROVED",
                            LoggerRole = currentUserRole,
                            CompanyId = workFlowApprovals.CompanyId,
                            Message = workFlowApprovals.Remarks
                        };
                        auditLogRepository.LogApproveDocument(auditLogData, transaction, m_dbconnection);
                        List<WorkFlow> users = workFlowConfigRepository.GetDocumentWFUsers(workFlowApprovals, m_dbconnection, transaction);
                        int approvedWFOrder = (int)users.Where(x => x.Status == workFlowApprovals.WorkFlowStatusId.ToString()).LastOrDefault().WorkFlowOrder;
                        WorkFlow nextApprover = users.Where(x => x.WorkFlowOrder == approvedWFOrder + 1).FirstOrDefault();
                        if (nextApprover == null)
                        {
                            this.UpdateDocumentWFStatus(new WorkFlowParameter
                            {
                                WorkFlowStatusId = this.GetFinalStatus(workFlowApprovals.ProcessId),
                                ProcessId = workFlowApprovals.ProcessId,
                                DocumentId = workFlowApprovals.DocumentId
                            }, m_dbconnection, transaction);
                            if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.CreditNote)
                            {
                                CreditNoteRepository creditNoteRepository = new CreditNoteRepository();
                                creditNoteRepository.deleteUnAssignedLineItems(workFlowApprovals.DocumentId, transaction, m_dbconnection);
                            }

                            if (workFlowApprovals.ReferenceDocumentId != 0)
                            {
                                string pageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId);
                                AuditLogData logData = new AuditLogData
                                {
                                    DocumentId = workFlowApprovals.ReferenceDocumentId,
                                    PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ReferenceProcessId),
                                    Action = "OPEN",
                                    Logger = workFlowApprovals.RequestUserId,
                                    DocumentCode = workFlowApprovals.DocumentCode,
                                    CompanyId = workFlowApprovals.CompanyId,
                                    Message = pageName + " ({0}) by {1} on {2}. Status = Open"
                                };
                                auditLogRepository.UpdateLogInParentDocument(logData, transaction, m_dbconnection);
                            }
                            this.CreateNotification(new Notifications()
                            {
                                NotificationId = 0,
                                NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                                NotificationMessage = string.Format("{0} {1}", StringOperations.PascalCase(Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId)), WorkFlowStatus.Approved.ToString()),
                                ProcessId = workFlowApprovals.ProcessId,
                                ProcessName = "",
                                DocumentId = workFlowApprovals.DocumentId,
                                UserId = workFlowApprovals.UserId,
                                IsRead = false,
                                CreatedBy = workFlowApprovals.ApproverUserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = workFlowApprovals.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = (int)NotificationMessageTypes.Approved,
                                DocumentCode = workFlowApprovals.DocumentCode
                            }, m_dbconnection, transaction);
                            mailData.Sender = workFlowApprovals.UserId;
                            mailData.Receiver = workFlowApprovals.RequestUserId;
                        }
                        else
                        {
                            nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)nextApprover.ApproverUserId, workFlowApprovals.CompanyId);
                            nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                            workFlowApprovals.WorkFlowOrder = (int)nextApprover.WorkFlowOrder;
                            workFlowApprovals.NextApproverUserId = (int)nextApprover.ApproverUserId;
                            workFlowApprovals.WorkflowId = nextApprover.WorkFlowId;
                            workFlowConfigRepository.SetDocumentPendingStatus(workFlowApprovals, m_dbconnection, transaction);
                            this.CreateNotification(new Notifications()
                            {
                                NotificationId = 0,
                                NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                                NotificationMessage = SharedRepository.GetNotificationMessage(workFlowApprovals.ProcessId),
                                ProcessId = workFlowApprovals.ProcessId,
                                ProcessName = "",
                                DocumentId = workFlowApprovals.DocumentId,
                                UserId = workFlowApprovals.NextApproverUserId,
                                IsRead = false,
                                CreatedBy = workFlowApprovals.ApproverUserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = workFlowApprovals.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = (int)NotificationMessageTypes.Requested,
                                DocumentCode = workFlowApprovals.DocumentCode
                            }, m_dbconnection, transaction);
                            AuditLogData sendData = new AuditLogData
                            {
                                DocumentId = workFlowApprovals.DocumentId,
                                PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                                Logger = workFlowApprovals.NextApproverUserId,
                                Action = "APPROVED",
                                LoggerRole = nextUserRole,
                                CompanyId = workFlowApprovals.CompanyId,
                                Message = workFlowApprovals.Remarks
                            };
                            auditLogRepository.LogSendForApprovalDocument(sendData, transaction, m_dbconnection);
                            mailData.Sender = workFlowApprovals.RequestUserId;
                            mailData.Receiver = workFlowApprovals.NextApproverUserId;
                        }
                        //DocumentMailData documentMailData = GetDocumentMailData(new WorkFlowParameter
                        //{
                        //    CompanyId = workFlowApprovals.CompanyId,
                        //    DocumentId = workFlowApprovals.DocumentId,
                        //    ProcessId = workFlowApprovals.ProcessId
                        //}, m_dbconnection, transaction);
                        ErrorLog.Log("Generic985", "", "ApproveDocument", "Mail send Started");
                        SendWorkflowEmailNotification(mailData, m_dbconnection, transaction);
                        ErrorLog.Log("Generic987", "", "ApproveDocument", "Mail send Ended");
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private int GetFinalStatus(int processId)
        {
            int finalStatusId = 0;
            switch (processId)
            {
                case (int)WorkFlowProcessTypes.CustomerMaster:
                case (int)WorkFlowProcessTypes.SalesQuotation:
                    finalStatusId = (int)WorkFlowStatus.Approved;
                    break;
                case (int)WorkFlowProcessTypes.SalesInvoice:
                    finalStatusId = (int)WorkFlowStatus.Open;
                    break;
                default:
                    finalStatusId = (int)WorkFlowStatus.Completed;
                    break;
            }
            return finalStatusId;
        }

        public bool RejectDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                string status = string.Empty;
                this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        this.workFlowConfigRepository.UpdateWorkflowStatus(workFlowApprovals, m_dbconnection, transaction);
                        this.UpdateDocumentWFStatus(new WorkFlowParameter
                        {
                            WorkFlowStatusId = workFlowApprovals.WorkFlowStatusId,
                            ProcessId = workFlowApprovals.ProcessId,
                            DocumentId = workFlowApprovals.DocumentId
                        }, m_dbconnection, transaction);
                        this.InsertWFAuditTrail(workFlowApprovals, m_dbconnection, transaction);
                        List<WorkFlow> users = workFlowConfigRepository.GetDocumentWFUsers(workFlowApprovals, m_dbconnection, transaction);
                        int rejectedWFOrder = (int)users.Where(x => x.Status == workFlowApprovals.WorkFlowStatusId.ToString()).FirstOrDefault().WorkFlowOrder;
                        WorkFlow nextApprover = users.Where(x => x.WorkFlowOrder == rejectedWFOrder + 1).FirstOrDefault();
                        status = nextApprover == null ? WorkFlowStatus.Rejected.ToString() : "Disagreed";
                        this.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                            NotificationMessage = string.Format("{0} {1}", StringOperations.PascalCase(Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId)), "Rejected"),
                            ProcessId = workFlowApprovals.ProcessId,
                            ProcessName = "",
                            DocumentId = workFlowApprovals.DocumentId,
                            UserId = workFlowApprovals.UserId,
                            IsRead = false,
                            CreatedBy = workFlowApprovals.ApproverUserId,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = workFlowApprovals.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = (int)NotificationMessageTypes.Rejected,
                            DocumentCode = workFlowApprovals.DocumentCode
                        }, m_dbconnection, transaction);

                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                            Logger = workFlowApprovals.ApproverUserId,
                            Action = status,
                            CompanyId = workFlowApprovals.CompanyId,
                            Remarks = workFlowApprovals.Remarks
                        };
                        auditLogRepository.LogRejectDocument(auditLogData, transaction, m_dbconnection);
                        ErrorLog.Log("Generic1056", "", "RejectDocument", "Mail send Ended");
                        SendWorkflowEmailNotification(new MailData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            Sender = workFlowApprovals.ApproverUserId,
                            Receiver = workFlowApprovals.RequestUserId,
                            CompanyId = workFlowApprovals.CompanyId,
                            ProcessId = workFlowApprovals.ProcessId
                        }, m_dbconnection, transaction);
                        ErrorLog.Log("Generic1065", "", "RejectDocument", "Mail send Ended");
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SendForClarificationDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        this.UpdateDocumentWFStatus(new WorkFlowParameter
                        {
                            WorkFlowStatusId = workFlowApprovals.WorkFlowStatusId,
                            ProcessId = workFlowApprovals.ProcessId,
                            DocumentId = workFlowApprovals.DocumentId
                        }, m_dbconnection, transaction);
                        this.InsertWFAuditTrail(workFlowApprovals, m_dbconnection, transaction);

                        this.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                            NotificationMessage = "Need Clarification",
                            ProcessId = workFlowApprovals.ProcessId,
                            ProcessName = "",
                            DocumentId = workFlowApprovals.DocumentId,
                            UserId = workFlowApprovals.RequestUserId,
                            IsRead = false,
                            CreatedBy = workFlowApprovals.UserId,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = workFlowApprovals.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = (int)NotificationMessageTypes.AskedForClarification,
                            DocumentCode = workFlowApprovals.DocumentCode
                        }, m_dbconnection, transaction);
                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                            Logger = workFlowApprovals.UserId,
                            Action = "SEND",
                            CompanyId = workFlowApprovals.CompanyId,
                            Remarks = workFlowApprovals.Remarks
                        };
                        auditLogRepository.LogSendForClarificationDocument(auditLogData, transaction, m_dbconnection);
                        ErrorLog.Log("Generic1128", "", "SendForClarificationDocument", "Mail send Started");
                        SendWorkflowEmailNotification(new MailData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            Sender = workFlowApprovals.UserId,
                            Receiver = workFlowApprovals.RequestUserId,
                            CompanyId = workFlowApprovals.CompanyId,
                            ProcessId = workFlowApprovals.ProcessId,
                            ChatRemarks = workFlowApprovals.Remarks
                        }, m_dbconnection, transaction);
                        ErrorLog.Log("Generic1138", "", "SendForClarificationDocument", "Mail send Ended");
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private void InsertWFAuditTrail(WorkFlowApproval workFlowApprovals, IDbConnection m_dbconnection, IDbTransaction transaction)
        {
            try
            {
                m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                {
                    Action = "INSERT",
                    DocumentId = workFlowApprovals.DocumentId,
                    ProcessId = workFlowApprovals.ProcessId,
                    Remarks = workFlowApprovals.Remarks.Trim(),
                    StatusId = workFlowApprovals.WorkFlowStatusId,
                    UserId = workFlowApprovals.UserId
                }, transaction: transaction, commandType: CommandType.StoredProcedure);
            }
            catch (Exception)
            {

                throw;
            }
        }

        public bool ReplyDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        this.UpdateDocumentWFStatus(new WorkFlowParameter
                        {
                            WorkFlowStatusId = workFlowApprovals.WorkFlowStatusId,
                            ProcessId = workFlowApprovals.ProcessId,
                            DocumentId = workFlowApprovals.DocumentId
                        }, m_dbconnection, transaction);
                        this.InsertWFAuditTrail(workFlowApprovals, m_dbconnection, transaction);

                        this.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                            NotificationMessage = SharedRepository.GetNotificationMessage(workFlowApprovals.ProcessId),
                            ProcessId = workFlowApprovals.ProcessId,
                            ProcessName = "",
                            DocumentId = workFlowApprovals.DocumentId,
                            UserId = workFlowApprovals.ApproverUserId,
                            IsRead = false,
                            CreatedBy = workFlowApprovals.UserId,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = workFlowApprovals.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = (int)NotificationMessageTypes.Requested,
                            DocumentCode = workFlowApprovals.DocumentCode
                        }, m_dbconnection, transaction);

                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                            Logger = workFlowApprovals.UserId,
                            Action = "SEND",
                            CompanyId = workFlowApprovals.CompanyId,
                            Remarks = workFlowApprovals.Remarks
                        };
                        auditLogRepository.LogReplyForClarificationDocument(auditLogData, transaction, m_dbconnection);
                        ErrorLog.Log("Generic1223", "", "ReplyForClarificationDocument", "Mail send Started");
                        SendWorkflowEmailNotification(new MailData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            Sender = workFlowApprovals.UserId,
                            Receiver = workFlowApprovals.ApproverUserId,
                            CompanyId = workFlowApprovals.CompanyId,
                            ProcessId = workFlowApprovals.ProcessId,
                            ChatRemarks = workFlowApprovals.Remarks
                        }, m_dbconnection, transaction);
                        ErrorLog.Log("Generic1233", "", "ReplyForClarificationDocument", "Mail send Ended");
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool CancelApprovalDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        this.UpdateDocumentWFStatus(new WorkFlowParameter
                        {
                            WorkFlowStatusId = workFlowApprovals.WorkFlowStatusId,
                            ProcessId = workFlowApprovals.ProcessId,
                            DocumentId = workFlowApprovals.DocumentId
                        }, m_dbconnection, transaction);

                        workFlowConfigRepository.DeleteDocumentWorkflow(workFlowApprovals, m_dbconnection, transaction);

                        this.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                            NotificationMessage = string.Format("{0} {1}", StringOperations.PascalCase(Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId)), "has been recalled"),
                            ProcessId = workFlowApprovals.ProcessId,
                            ProcessName = "",
                            DocumentId = workFlowApprovals.DocumentId,
                            UserId = workFlowApprovals.ApproverUserId,
                            IsRead = false,
                            CreatedBy = workFlowApprovals.UserId,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = workFlowApprovals.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = (int)NotificationMessageTypes.Requested,
                            DocumentCode = workFlowApprovals.DocumentCode
                        }, m_dbconnection, transaction);

                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                            Logger = workFlowApprovals.UserId,
                            Action = "CANCEL",
                            CompanyId = workFlowApprovals.CompanyId,
                            Remarks = workFlowApprovals.Remarks
                        };
                        auditLogRepository.LogCancelApprovalDocument(auditLogData, transaction, m_dbconnection);
                        ErrorLog.Log("Generic1298", "", "LogCancelApprovalDocument", "Mail send Started");
                        SendWorkflowEmailNotification(new MailData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            Sender = workFlowApprovals.RequestUserId,
                            Receiver = workFlowApprovals.ApproverUserId,
                            CompanyId = workFlowApprovals.CompanyId,
                            ProcessId = workFlowApprovals.ProcessId
                        }, m_dbconnection, transaction);
                        ErrorLog.Log("Generic1307", "", "LogCancelApprovalDocument", "Mail send Ended");
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool _CancelDraftDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        this.UpdateDocumentWFStatus(new WorkFlowParameter
                        {
                            WorkFlowStatusId = workFlowApprovals.WorkFlowStatusId,
                            ProcessId = workFlowApprovals.ProcessId,
                            DocumentId = workFlowApprovals.DocumentId
                        }, m_dbconnection, transaction);
                        this.InsertWFAuditTrail(workFlowApprovals, m_dbconnection, transaction);
                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = workFlowApprovals.DocumentId,
                            PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApprovals.ProcessId),
                            Logger = workFlowApprovals.UserId,
                            Action = "CANCEL_DRAFT",
                            CompanyId = workFlowApprovals.CompanyId,
                            Message = workFlowApprovals.Remarks
                        };
                        auditLogRepository._LogCancelDraftDocument(auditLogData, transaction, m_dbconnection);
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] PrintDocument(ProjectDocument document)
        {
            byte[] pdfContent;
            PdfGenerator pdfGenerator = new PdfGenerator();
            PDFData data = null;
            switch (document.DocumentTypeId)
            {
                case (int)WorkFlowProcessTypes.CreditNote:
                    {
                        CreditNoteRepository creditNoteRepository = new CreditNoteRepository();
                        data = creditNoteRepository.GetPDFData(document);
                        break;
                    }
            }
            UserProfile user = userProfileRepository.GetUserById(data.CreatedBy);
            data.RequestedByUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
            data.RequestorContactNo = user.PhoneNumber;
            data.RequestorEmailID = user.EmailId;
            if (document.IsPrintAuditLog)
            {  //audit log to be shown only in print pdf
                data.AuditLogData = auditLogRepository.GetAuditLogsByDocumentId(new AuditLogSearch
                {
                    CompanyId = document.CompanyId,
                    DocumentId = document.DocumentId,
                    PageName = Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId)
                }).ToList();
                foreach (var log in data.AuditLogData)
                {
                    if (log.AuditChanges != null)
                    {
                        string content = pdfGenerator.getAuditLogTemplate(log);
                        log.Message = log.Message + content;
                    }
                }
            }
            pdfContent = pdfGenerator.getPDFTemplate(data);
            return pdfContent;
        }

        public byte[] PrintSalesDocument(ProjectDocument document)
        {
            byte[] pdfContent;
            PdfGenerator pdfGenerator = new PdfGenerator();
            PDFData data = null;
            switch (document.DocumentTypeId)
            {
                case (int)WorkFlowProcessTypes.SalesQuotation:
                    {
                        SalesQuotationRepository repository = new SalesQuotationRepository();
                        data = repository.GetPDFData(document);
                        data.PDFTitle = WorkFlowProcessTypes.SalesQuotation.ToString();
                        data.LogoURL = HttpContext.Current.Server.MapPath(" ~/" + data.Company.ImageSource);
                        if (string.IsNullOrEmpty(data.DynamicProp1))  //attention
                            data.DynamicHideContent1 = "hidecontent";
                        if (data.Discount == "0.00")
                            data.DynamicHideContent2 = "hidecontent";
                        break;
                    }
                case (int)WorkFlowProcessTypes.SalesInvoice:
                    {
                        SalesInvoiceRepository repository = new SalesInvoiceRepository();
                        data = repository.GetPDFData(document);
                        data.PDFTitle = WorkFlowProcessTypes.SalesInvoice.ToString();
                        data.LogoURL = HttpContext.Current.Server.MapPath(" ~/" + data.Company.ImageSource);
                        if (string.IsNullOrEmpty(data.DynamicProp1))  //attention
                            data.DynamicHideContent1 = "hidecontent";
                        if (string.IsNullOrEmpty(data.DocumentCode))  //quotation code
                            data.DynamicHideContent2 = "hidecontent";
                        if (string.IsNullOrEmpty(data.POCode))  //PO code
                            data.DynamicHideContent3 = "hidecontent";
                        if (data.Discount == "0.00")
                            data.DynamicHideContent4 = "hidecontent";
                        if (data.TaxAdjustment == "0.00")
                            data.DynamicHideContent5 = "hidecontent";
                        if (data.TotalAdjustment == "0.00")
                            data.DynamicHideContent6 = "hidecontent";
                        break;
                    }
            }
            UserProfile user = userProfileRepository.GetUserById(data.CreatedBy);
            data.RequestedByUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
            data.RequestorContactNo = user.PhoneNumber;
            data.RequestorEmailID = user.EmailId;
            if (document.IsPrintAuditLog)
            {  //audit log to be shown only in print pdf
                data.AuditLogData = auditLogRepository.GetAuditLogsByDocumentId(new AuditLogSearch
                {
                    CompanyId = document.CompanyId,
                    DocumentId = document.DocumentId,
                    PageName = Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId)
                }).ToList();
                foreach (var log in data.AuditLogData)
                {
                    if (log.AuditChanges != null)
                    {
                        string content = pdfGenerator.getAuditLogTemplate(log);
                        log.Message = log.Message + content;
                    }
                }
            }
            pdfContent = pdfGenerator.getSalesPDFTemplate(data);
            return pdfContent;
        }
        //Sales Invoice
        //Sales Quotation
        public bool SendDocumentEmail(ProjectDocument document)
        {
            string subject = string.Empty;
            byte[] pdfContent = { };
            switch (document.DocumentTypeId)
            {
                case (int)WorkFlowProcessTypes.SalesQuotation:
                case (int)WorkFlowProcessTypes.SalesInvoice:
                    {
                        pdfContent = this.PrintSalesDocument(document);
                        break;
                    }
                default:
                    break;
            }
            CompanyDetails company = sharedRepository.GetCompanyDetails(document.CompanyId);
            string body = ReadHtml.RetrieveTemplate("EmailTemplates", string.Format("{0}Email", Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId)));
            List<string> To = new List<string>();
            Attachment attachment = new Attachment(new MemoryStream(pdfContent), string.Format("{0}{1}.pdf", Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId), DateTime.Now));
            EmailConfiguration emailConfiguration = new AdhocMasterRepository().GetEmailConfigurations(document.CompanyId)
                .Where(x => (x.ProcessType.ProcessId == document.DocumentTypeId) && (x.Department.LocationID == document.DepartmentId)).FirstOrDefault();
            PDFData data = null;
            switch (document.DocumentTypeId)
            {
                case (int)WorkFlowProcessTypes.SalesQuotation:
                    {
                        SalesQuotation salesQuotation = new SalesQuotationRepository().GetSalesQuotation(document.DocumentId);
                        subject = string.Format("{0} - Quotation ({1})", company.CompanyName, salesQuotation.DocumentCode);
                        data = new PDFData();
                        UserProfile user = userProfileRepository.GetUserById(salesQuotation.CreatedBy.UserID);
                        data.RequestedByUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        data.RequestorEmailID = user.EmailId;
                        data.DocumentCode = salesQuotation.DocumentCode;
                        data.CreatedDate = salesQuotation.CreatedDate.ToString("dd-MM-yyyy");
                        data.DynamicProp1 = salesQuotation.Subject;
                        data.Total = $"{salesQuotation.Total.ToString("#,##0.00", CultureInfo.InvariantCulture)}";
                        data.DynamicProp2 = company.CompanyName;
                        To.Add(salesQuotation.CustomerEmail);
                        break;
                    }
                case (int)WorkFlowProcessTypes.SalesInvoice:
                    {
                        SalesInvoice salesInvoice = new SalesInvoiceRepository().GetSalesInvoice(document.DocumentId);
                        subject = string.Format("{0} - Invoice ({1})", company.CompanyName, salesInvoice.DocumentCode);
                        data = new PDFData();
                        data.DocumentCode = salesInvoice.DocumentCode;
                        data.CreatedDate = salesInvoice.CreatedDate.ToString("dd-MM-yyyy");
                        data.DynamicProp1 = salesInvoice.Subject;
                        data.Total = $"{salesInvoice.Total.ToString("#,##0.00", CultureInfo.InvariantCulture)}";
                        data.DynamicProp2 = company.CompanyName;
                        To.Add(salesInvoice.CustomerEmail);
                        break;
                    }
            }
            body = EmailBody.PrepareBodyFromHtml(body, data);
            List<string> bcc = new List<string>();
            List<string> cc = new List<string>();
            try
            {
                if (!string.IsNullOrEmpty(emailConfiguration.GroupEmail))
                    bcc.Add(emailConfiguration.GroupEmail);
                cc = emailConfiguration.Users.Select(x => x.Email).ToList();
            }
            catch (Exception)
            {

            }

            List<Attachment> attachments = new List<Attachment>();
            attachments.Add(attachment);
            try
            {
                return MailHelper.SendEmail(new MailInfo
                {
                    From = ConfigurationManager.AppSettings["adminEmail"],
                    To = To,
                    CC = cc,
                    BCC = bcc,
                    Attachments = attachments,
                    Body = body,
                    FromDisplayName = company.CompanyName,
                    Subject = subject,
                    ToMailName = company.CompanyName
                });
            }
            catch (Exception ex)
            {
                ErrorLog.Log("GenericRepository", "SendDocumentEmail", "sendemail", ex.Message.ToString());
                return false;
            }

        }

        public bool UpdateDocumentStatus(WorkFlowApproval workFlowApproval)
        {
            try
            {
                if (this.m_dbconnection.State == ConnectionState.Closed)
                    this.m_dbconnection.Open();
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                        {
                            string procedureName = new SharedRepository().GetProcedureName(workFlowApproval.ProcessId);

                            int updateStatus = this.m_dbconnection.Execute(procedureName, new
                            {
                                Action = "UPDATEWORKFLOWSTATUS",
                                DocumentId = workFlowApproval.DocumentId,
                                CompanyId = workFlowApproval.CompanyId,
                                WorkFlowStatusId = (int)WorkFlowStatus.Exported,
                                SentForApproval = false
                            }, transaction: transaction, commandType: CommandType.StoredProcedure);
                        }
                        else
                        {
                            this.UpdateDocumentWFStatus(new WorkFlowParameter
                            {
                                WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                                ProcessId = workFlowApproval.ProcessId,
                                DocumentId = workFlowApproval.DocumentId
                            }, m_dbconnection, transaction);
                        }
                        if (workFlowApproval.WorkFlowStatusId == (int)WorkFlowStatus.Exported)
                        {
                            var auditLogData = new AuditLogData
                            {
                                DocumentId = workFlowApproval.DocumentId,
                                PageName = Enum.GetName(typeof(WorkFlowProcessTypes), workFlowApproval.ProcessId),
                                Logger = workFlowApproval.UserId,
                                Action = "EXPORTED",
                                CompanyId = workFlowApproval.CompanyId
                            };
                            auditLogRepository.LogExportDocument(auditLogData, transaction, m_dbconnection);
                        }
                        transaction.Commit();
                        return true;
                    }
                    catch (Exception e)
                    {
                        transaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}