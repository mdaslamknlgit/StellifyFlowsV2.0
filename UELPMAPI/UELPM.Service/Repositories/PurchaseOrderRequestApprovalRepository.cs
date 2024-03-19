using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.PdfGenerator;
using UELPM.Service.Exceptions;

namespace UELPM.Service.Repositories
{
    public class PurchaseOrderRequestApprovalRepository: IPurchaseOrderRequestApprovalRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        PurchaseOrderRequestRepository objPurchaseOrderRequestRepository = null;
        /*
            this method is used to get the list of purchase order request....... 
        */
        SharedRepository sharedRepository = null;
        public PurchaseOrderRequestDisplayResult GetPurchaseOrderRequestsApproval(GridDisplayInput purchaseOrderRequestInput)
        {
            try
            {

                PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();

                //executing the stored procedure to get the list of purchase orders request
                using (var result = this.m_dbconnection.QueryMultiple("PurchaseOrderRequestApproval_CRUD", new
                {

                    Action = "SELECT",
                    WorkFlowStatusId = WorkFlowStatus.Initiated,
                    Skip = purchaseOrderRequestInput.Skip,
                    Take = purchaseOrderRequestInput.Take,
                    UserId = purchaseOrderRequestInput.UserId,
                    CompanyId= purchaseOrderRequestInput.CompanyId,
                    ProcessIds = String.Join(",", Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest), Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest),Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    purchaseOrderRequestDisplayResult.PurchaseOrdersRequest = result.Read<PurchaseOrderRequestList>().AsList();
                    //total number of purchase orders
                    purchaseOrderRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return purchaseOrderRequestDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequestApproval(PORSearch purchaseOrderRequestInput)
        {
            try
            {
                PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();

                string workFlowStatusQuery = @"
                                                from  
                                                dbo.PurchaseOrderRequest as POR  
                                                left join dbo.Supplier as S  
                                                on  
                                                POR.Supplierid = S.SupplierId  
                                                join dbo.WorkFlowStatus as WFS  
                                                on  
                                                POR.WorkFlowStatusid = WFS.WorkFlowStatusid  
                                                where
                                               POR.WorkFlowStatusId not in(4,5) 
                                                and  
                                                POR.PurchaseOrderRequestId in  
                                               (  
                                                   SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId,@ProcessIds)	
                                               ) and  POR.Isdeleted = 0 ";

                if (purchaseOrderRequestInput.PurchaseOrderReqId > 0)
                {
                    workFlowStatusQuery += " and POR.PurchaseOrderRequestId=@PurchaseOrderRequestId  ";
                }
                else if (purchaseOrderRequestInput.WorkFlowStatusId != null)
                {
                    workFlowStatusQuery += " and POR.WorkFlowStatusId=@WorkFlowStatusId ";
                }

                if (purchaseOrderRequestInput.PORCodeFilter != "" && purchaseOrderRequestInput.PORCodeFilter != null)
                {
                    workFlowStatusQuery += @" and  ( 
                                                      POR.PurchaseOrderRequestCode LIKE concat('%',@PoCode,'%') 
                                                    ) 
                                            ";
                }
                if (purchaseOrderRequestInput.SupplierNameFilter != "" && purchaseOrderRequestInput.SupplierNameFilter != null)
                {
                    workFlowStatusQuery += @" and ( 
                                                    S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                  ) 
                                           ";
                }
                if (purchaseOrderRequestInput.Search != "" && purchaseOrderRequestInput.Search != null && purchaseOrderRequestInput.Search != "null")
                {
                      workFlowStatusQuery += @" and ( 
                                                    POR.PurchaseOrderRequestCode LIKE concat('%',@Search,'%') 
                                                    or 
                                                    S.SupplierName LIKE concat('%',@Search,'%') 
                                                    or 
                                                    WFS.Statustext LIKE concat('%',@Search,'%') 
                                                ) 
                                             ";
                }

                string purchaseOrderRequestSearchQuery = @"select POR.PurchaseOrderRequestCode,POR.PurchaseOrderRequestId,POR.POTypeId,S.SupplierName,WFS.Statustext  as WorkFlowStatusText,WF.WorkFlowStatusid as WorkFlowStatusId ";
               
                purchaseOrderRequestSearchQuery += workFlowStatusQuery;
                purchaseOrderRequestSearchQuery += @" 
                                                      order by 
                                                      POR.UpdatedDate ";

                if (purchaseOrderRequestInput.Take > 0)
                {
                    purchaseOrderRequestSearchQuery += "OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";
                   
                }
                purchaseOrderRequestSearchQuery += $"select count(*) { workFlowStatusQuery }";
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple(purchaseOrderRequestSearchQuery, new
                {

                    Action = "SELECT",
                    Skip = purchaseOrderRequestInput.Skip,
                    Take = purchaseOrderRequestInput.Take,
                    Search = purchaseOrderRequestInput.Search,
                    WorkFlowStatusId = purchaseOrderRequestInput.WorkFlowStatusId,
                    PurchaseOrderRequestId = purchaseOrderRequestInput.PurchaseOrderReqId,
                    UserId = purchaseOrderRequestInput.UserId,
                    ProcessIds = string.Join(",", Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest), Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest),(Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))),
                    PoCode = purchaseOrderRequestInput.PORCodeFilter,
                    SupplierName = purchaseOrderRequestInput.SupplierNameFilter
                }, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    purchaseOrderRequestDisplayResult.PurchaseOrdersRequest = result.Read<PurchaseOrderRequestList>().AsList();
                    //total number of purchase orders
                    purchaseOrderRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return purchaseOrderRequestDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
         this method is used to get the purchase order details....... 
        */
        public PurchaseOrderRequest GetPurchaseOrderRequestApprovalDetails(int purchaseOrderRequestId, int processId, int loggedInUserId = 0)
        {
            try
            {
                PurchaseOrderRequest purchaseOrderRequestDetailsObj = new PurchaseOrderRequest();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("PurchaseOrderRequest_CRUD", new
                {

                    Action = "SELECTBYID",
                    PurchaseOrderRequestId = purchaseOrderRequestId,
                    ProcessId = processId

                }, commandType: CommandType.StoredProcedure))
                {
                    //purchase order details..
                    purchaseOrderRequestDetailsObj = result.Read<PurchaseOrderRequest, Suppliers, PurchaseOrderRequest>((Pc, Su) => {

                        Pc.Supplier = Su;
                        return Pc;
                    }, splitOn: "SupplierId").FirstOrDefault();

                    if (purchaseOrderRequestDetailsObj != null)
                    {
                        //Quotation record
                        purchaseOrderRequestDetailsObj.PurchaseOrderRequestVendorItems = result.Read<PurchaseOrderRequestVendorItems, Suppliers, PurchaseOrderRequestVendorItems>((Pcv, Su) =>
                        {
                            Pcv.QuotationSupplier = Su;
                            return Pcv;
                        }, splitOn: "SupplierId").ToList();

                        if (purchaseOrderRequestDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                        {
                            //purchase order items.
                            purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, GetItemMasters,AccountCode, PurchaseOrderRequestItems>((Pc, IM, Ac) =>
                            {
                                Pc.Item = IM;
                                if (Ac != null)
                                {
                                    Pc.Service = Ac;
                                }
                                return Pc;
                            }, splitOn: "ItemMasterId, AccountCodeId").ToList();
                        }
                        else if (purchaseOrderRequestDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                        {
                            //purchase order items.
                            purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, GetAssets, AccountCode, PurchaseOrderRequestItems>((Pc, IM, Ac) =>
                            {
                                Pc.Asset = IM;
                                if (Ac != null)
                                {
                                    Pc.Service = Ac;
                                }
                                return Pc;
                            }, splitOn: "AssetId, AccountCodeId").ToList();
                        }
                        else if (purchaseOrderRequestDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            //purchase order items.
                            purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, AccountCode, PurchaseOrderRequestItems>((Pc, IM) =>
                            {
                                Pc.Expense = IM;
                                return Pc;
                            }, splitOn: "ExpensesMasterId").ToList();
                        }
                        purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems.ForEach(data => {

                            decimal taxTotal = 0;
                            decimal itemTotalPrice = 0;
                            decimal totalPrice = 0;
                            decimal totalbefTax = 0;
                            SharedRepository.GetPurchaseOrderItemPrice(data.Unitprice, data.ItemQty,
                            data.TaxAmount, data.Discount, true, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                            data.TaxTotal = taxTotal;
                            data.ItemTotalPrice = itemTotalPrice;
                        });
                        decimal subTotal = 0;
                        subTotal = purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems.Sum(i => i.ItemTotalPrice);
                        var totalTax = 0;
                        purchaseOrderRequestDetailsObj.SubTotal = subTotal;
                        purchaseOrderRequestDetailsObj.TotalAmount = (subTotal - purchaseOrderRequestDetailsObj.Discount) + totalTax + purchaseOrderRequestDetailsObj.ShippingCharges + purchaseOrderRequestDetailsObj.OtherCharges;

                        UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                        if (currentApproverDetails != null)
                        {
                            //purchase order items.
                            purchaseOrderRequestDetailsObj.CurrentApproverUserId = currentApproverDetails.UserID;
                            purchaseOrderRequestDetailsObj.CurrentApproverUserName = currentApproverDetails.UserName;
                        }
                        purchaseOrderRequestDetailsObj.QuotationRequestRemarks = result.Read<string>().FirstOrDefault();
                        if (loggedInUserId != 0)
                        {
                            purchaseOrderRequestDetailsObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                            {
                                Documentid = purchaseOrderRequestDetailsObj.PurchaseOrderRequestId,
                                ProcessId = processId,
                                UserId = loggedInUserId,
                                DocumentUserId = purchaseOrderRequestDetailsObj.CreatedBy
                            }, this.m_dbconnection).ToList();
                        }
                    }
                }

                if (purchaseOrderRequestDetailsObj != null)
                {
                    var quotationattachments = this.m_dbconnection.Query<QuotationAttachments>("QuotationFileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        PurchaseOrderRequestId = purchaseOrderRequestId,
                        //AttachmentTypeId = 3 //static value need to change

                    }, commandType: CommandType.StoredProcedure);

                    purchaseOrderRequestDetailsObj.QuotationAttachment = quotationattachments.ToList();


                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = purchaseOrderRequestId,
                        AttachmentTypeId = AttachmentType.PurchaseOrderRequest //static value need to change

                    }, commandType: CommandType.StoredProcedure);

                    purchaseOrderRequestDetailsObj.Attachments = attachments.ToList();

                }

                return purchaseOrderRequestDetailsObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval)
        {
            try
            {
                string status = string.Empty;
                this.m_dbconnection.Open();//opening the connection...
                int nextApproverUserId = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        //#region sending mail to next approver  

                        ////int nextApproverUserId = GetNextLevelApprover(requestApproval.PurchaseOrderRequestId);                       
                        //if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        //{
                        //    nextApproverUserId = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlow_CRUD", new
                        //    {
                        //        Action = "SELECTNEXTLEVEL",
                        //        DocumentId = requestApproval.PurchaseOrderRequestId,
                        //        ProcessId = requestApproval.ProcessId

                        //    },
                        //    transaction: transactionObj,
                        //    commandType: CommandType.StoredProcedure);
                        //}
                        //#endregion

                        #region inserting record in work flow table                     
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = requestApproval.PurchaseOrderRequestId,
                            ProcessId = requestApproval.ProcessId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ApproverUserId = requestApproval.UserId,
                            CompanyId = requestApproval.CompanyId,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..
                        int updateStatus = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = requestApproval.PurchaseOrderRequestId,
                            //UserId = requestApproval.UserId,
                            WorkFlowStatusId = nextWorkFlowDetails.OverAllWorkFlowStatusId,
                            CompanyId = requestApproval.CompanyId,
                            ProcessId = requestApproval.ProcessId,
                            DocumentCode = (nextWorkFlowDetails.OverAllWorkFlowStatusId==Convert.ToInt32(WorkFlowStatus.Approved))?SharedRepository.GetProcessCode(requestApproval.ProcessId):null
                        },
                            transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = requestApproval.PurchaseOrderRequestId,
                            ProcessId = requestApproval.ProcessId,
                            Remarks = requestApproval.Remarks,
                            StatusId = requestApproval.WorkFlowStatusId,
                            UserId = requestApproval.UserId
                           
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion


                        #region inserting record in notification

                        //if partially approved...
                        string notificationMessage = "";
                        string notificationType = SharedRepository.GetNotificationType(requestApproval.ProcessId);
                        int? notificationToUserId = 0;
                        int messageType = 0;
                        int notificationCreatedUserId = requestApproval.UserId;
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            {
                                notificationMessage = "Request For Purchase Order Request Approval";
                                notificationToUserId = nextWorkFlowDetails.ApproverUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Requested);
                                notificationCreatedUserId = requestApproval.PurchaseOrderRequestUserId;
                            }
                            else if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                notificationMessage = "Purchase Order Request Approved";
                                notificationToUserId = requestApproval.PurchaseOrderRequestUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Approved);
                            }
                        }
                        else if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            notificationMessage = "Purchase Order Request Rejected";
                            notificationToUserId = requestApproval.PurchaseOrderRequestUserId;
                            messageType = Convert.ToInt32(NotificationMessageTypes.Rejected);
                        }
                        else if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                        {
                            notificationMessage = "Need Clarification";
                            notificationToUserId = requestApproval.PurchaseOrderRequestUserId;
                            messageType = Convert.ToInt32(NotificationMessageTypes.AskedForClarification);
                        }

                        try
                        {
                            NotificationsRepository notificationObj = new NotificationsRepository();
                            notificationObj.CreateNotification(new Notifications()
                            {

                                NotificationId = 0,
                                NotificationType = notificationType,
                                NotificationMessage = notificationMessage,
                                ProcessId = requestApproval.ProcessId,
                                ProcessName = "",
                                DocumentId = requestApproval.PurchaseOrderRequestId,
                                UserId = Convert.ToInt32(notificationToUserId),
                                IsRead = false,
                                CreatedBy = notificationCreatedUserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = requestApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = messageType,
                                DocumentCode = requestApproval.PurchaseOrderRequestCode
                            });
                        }
                        catch (Exception e)
                        {
                            throw e;
                        }

                        #endregion
                        //commiting the transaction...                      
                        transactionObj.Commit();

                        #region sending mail to next approver  

                        //int nextApproverUserId = GetNextLevelApprover(requestApproval.PurchaseOrderRequestId);                       
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            nextApproverUserId = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlow_CRUD", new
                            {
                                Action = "SELECTNEXTLEVEL",
                                DocumentId = requestApproval.PurchaseOrderRequestId,
                                ProcessId = requestApproval.ProcessId

                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        objPurchaseOrderRequestRepository = new PurchaseOrderRequestRepository();

                        status = SharedRepository.GetWorkFlowStatusText(requestApproval.WorkFlowStatusId);
                        if (nextApproverUserId > 0)
                        {
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            string nextApproverUserName = userProfileRepository.GetUserById(nextApproverUserId).UserName;
                            var result = objPurchaseOrderRequestRepository.SendPurchaseOrderRequestMail(nextApproverUserId, requestApproval.PurchaseOrderRequestId,requestApproval.ProcessId);
                            if(result)
                            {
                                status = "Waiting For Approval";
                                objPurchaseOrderRequestRepository.SendPurchaseOrderRequestApprovalMail(requestApproval.UserId, requestApproval.PurchaseOrderRequestId, status,requestApproval.ProcessId, nextApproverUserId);
                                AuditLog.Info("PurchaseOrderRequestApproval", "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderRequestCode.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order "+requestApproval.PurchaseOrderRequestCode+" sent to  " + nextApproverUserName + "for next level approval", requestApproval.CompanyId);
                            }
                        }
                        else
                        {
                            if (nextApproverUserId == 0 && requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                UserProfileRepository userProfileRepository = new UserProfileRepository();
                                string approverUserName = userProfileRepository.GetUserById(requestApproval.ApproverUserId).UserName;
                                objPurchaseOrderRequestRepository.SendPurchaseOrderRequestApprovalMail(requestApproval.UserId, requestApproval.PurchaseOrderRequestId, status,requestApproval.ProcessId, nextApproverUserId);
                                AuditLog.Info("PurchaseOrderRequestApproval", "PORequestApproved", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderRequestCode.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order "+requestApproval.PurchaseOrderRequestCode+" approved by "+ approverUserName + "", requestApproval.CompanyId);
                            }
                            else
                            {
                                UserProfileRepository userProfileRepository = new UserProfileRepository();
                                string approverUserName = userProfileRepository.GetUserById(requestApproval.ApproverUserId).UserName;
                                if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                                {
                                    
                                    objPurchaseOrderRequestRepository = new PurchaseOrderRequestRepository();
                                    objPurchaseOrderRequestRepository.SendPurchaseOrderRequestClarificationMail(requestApproval.UserId, requestApproval.PurchaseOrderRequestUserId, requestApproval.Remarks, requestApproval.PurchaseOrderRequestId, requestApproval.PurchaseOrderRequestCode);
                                    AuditLog.Info("PurchaseOrderRequestApproval", "SendPurchaseOrderRequestClarificationMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderRequestCode.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order "+requestApproval.PurchaseOrderRequestCode+" sent for clarification by" + approverUserName + "", requestApproval.CompanyId);
                                }
                                if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                                {
                                    objPurchaseOrderRequestRepository.SendPurchaseOrderRequestApprovalMail(notificationToUserId, requestApproval.PurchaseOrderRequestId, status,requestApproval.ProcessId, nextApproverUserId);
                                    AuditLog.Info("PurchaseOrderRequestApproval", "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderRequestCode.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order "+requestApproval.PurchaseOrderRequestCode+" rejected by" + approverUserName + "", requestApproval.CompanyId);
                                }
                            }
                        }

                        return auditTrialStatus;
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
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

        public byte[] PurchaseOrderRequestApprovalPrint(int purchaseOrderRequestId,int processId, int companyId)
        {
            try
            {
                var result = GetPurchaseOrderRequestApprovalPDFTemplate(purchaseOrderRequestId, processId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetPurchaseOrderRequestApprovalPDFTemplate(int purchaseOrderRequestId,int processId, int companyId)
        {
            try
            {
                string type = "PURCHASE ORDER REQUEST";
                PdfGenerator pdfGeneratorObj = null;
                PurchaseOrderRequest purchaseOrderRequestDetails = GetPurchaseOrderRequestApprovalDetails(purchaseOrderRequestId, processId);
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetPurchaseOrderRequestApprovalPDFTemplate(purchaseOrderRequestDetails, companyDetails, type);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private CompanyDetails GetCompanyDetails(int companyId)
        {
            sharedRepository = new SharedRepository();
            return sharedRepository.GetCompanyDetails(companyId);
        }
    }
}
