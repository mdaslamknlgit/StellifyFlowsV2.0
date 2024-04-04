using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class ProjectContractVariationOrderRepository : IProjectContractVariationOrderRepository
    {
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        ProjectMasterContractRepository projectMasterContractRepository = null;
        SharedRepository sharedRepository = null;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public ProjectContractVariationOrderDisplayResult GetProjectContractVariationOrders(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ProjectContractVariationOrderDisplayResult projectContractVariationOrderDisplayResult = new ProjectContractVariationOrderDisplayResult();
                //using (var result = this.m_dbconnection.QueryMultiple("ProjectContractVariationOrder_CRUD", new
                //{
                //    Action = "SELECT",
                //    Skip = gridDisplayInput.Skip,
                //    Take = gridDisplayInput.Take,
                //    CompanyId = gridDisplayInput.CompanyId
                //}, commandType: CommandType.StoredProcedure))
                //{
                //    projectContractVariationOrderDisplayResult.ProjectContractVariationOrderList = result.Read<ProjectContractVariationOrder>().ToList();
                //    if (gridDisplayInput.Take > 0)
                //    {
                //        projectContractVariationOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                //    }
                //}
                return projectContractVariationOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public ProjectContractVariationOrderDisplayResult GetProjectContractVariationOrdersForApproval(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ProjectContractVariationOrderDisplayResult projectContractVariationOrderDisplayResult = new ProjectContractVariationOrderDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractVariationOrder_CRUD", new
                {
                    Action = "SELECTAPPROVALLIST",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId,
                    ApproverUserId = gridDisplayInput.UserId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder)
                }, commandType: CommandType.StoredProcedure))
                {
                    projectContractVariationOrderDisplayResult.ProjectContractVariationOrderList = result.Read<ProjectContractVariationOrder>().ToList();
                    if (gridDisplayInput.Take > 0)
                    {
                        projectContractVariationOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return projectContractVariationOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public ProjectContractVariationOrderDisplayResult GetAllSearchProjectContractVariationOrders(ProjectContractVariationOrderSearch projectContractVariationOrderSearch)
        {
            try
            {
                ProjectContractVariationOrderDisplayResult projectContractVariationOrderDisplayResult = new ProjectContractVariationOrderDisplayResult();
                string searchQuery = "";
                searchQuery = @" 
                                        from
		                                    dbo.ProjectContractVariationOrder as pcv
	                                    join
		                                    dbo.WorkFlowStatus as wfs
		                                    ON
		                                    pcv.WorkFlowStatusId = wfs.WorkFlowStatusid 
                                         join 
                                            dbo.ProjectMasterContract as pmc
                                            ON
                                            pmc.ProjectMasterContractId = pcv.ProjectMasterContractId
                                         ";
                if (projectContractVariationOrderSearch.IsApprovalPage == true)
                {

                    searchQuery += @" join
	                                (
	                                    SELECT *  FROM  dbo.GetWorkFlowDocuments(@ApproverUserId,str(@ProcessId))
	                                ) as db on
	                                pcv.ProjectContractVariationOrderId = db.DocumentId";
                }
                searchQuery += @" where ";

                if (projectContractVariationOrderSearch.ProjectContractVariationOrderId > 0)
                {
                    searchQuery += "pcv.ProjectContractVariationOrderId = @ProjectContractVariationOrderId  and ";
                }

                if (projectContractVariationOrderSearch.DocumentCode != "" && projectContractVariationOrderSearch.DocumentCode != null && projectContractVariationOrderSearch.DocumentCode != "null")
                {
                    searchQuery += @"( 
                                                pcv.PCVariationOrderCode LIKE concat('%',@DocumentCode,'%')
                                                or
                                                pcv.DraftCode LIKE concat('%',@DocumentCode,'%')
                                            )
                                            and ";
                }
                else if (projectContractVariationOrderSearch.ProjectName != null)
                {
                    searchQuery += @"( 
                                                    pmc.ProjectName LIKE concat('%',@ProjectName,'%')
                                                ) 
                                                and ";
                }
                else if (projectContractVariationOrderSearch.Search != "" && projectContractVariationOrderSearch.Search != null && projectContractVariationOrderSearch.Search != "null")
                {
                    searchQuery += @"( 
                                            pmc.ProjectName LIKE concat('%',@Search,'%') 
                                            or
                                            pcv.PCVariationOrderCode LIKE concat('%',@Search,'%') 
                                            or
                                            pcv.DraftCode LIKE concat('%',@Search,'%')
                                            or
                                            pcv.CreatedDate LIKE concat('%',@Search,'%')
                                    ) and ";
                }
                if (projectContractVariationOrderSearch.WorkFlowStatusId > 0)
                {
                    searchQuery += " pcv.WorkFlowStatusId = @WorkFlowStatusId and ";
                }
                searchQuery += " pcv.Isdeleted = 0 ";

                if (!projectContractVariationOrderSearch.IsApprovalPage)
                {
                    searchQuery += " and pcv.CompanyId=@CompanyId ";
                }

                string contractVariationOrderSearchQuery = @" select 		
                                                    pcv.ProjectContractVariationOrderId,
		                                            pcv.PCVariationOrderCode,
		                                            pcv.DraftCode,
		                                            pcv.WorkFlowStatusId,
                                                    pmc.ProjectName,
		                                            WFS.Statustext AS WorkFlowStatus,		                                          	                                       
                                                    pcv.CreatedDate ";

                contractVariationOrderSearchQuery += searchQuery;

                contractVariationOrderSearchQuery += @"  order by pmc.UpdatedDate desc ";
                if (projectContractVariationOrderSearch.Take > 0)
                {
                    contractVariationOrderSearchQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ;";
                    contractVariationOrderSearchQuery += " select COUNT(*) ";
                    contractVariationOrderSearchQuery += searchQuery;
                }

                using (var result = this.m_dbconnection.QueryMultiple(contractVariationOrderSearchQuery, new
                {
                    Action = "SELECT",
                    Skip = projectContractVariationOrderSearch.Skip,
                    Take = projectContractVariationOrderSearch.Take,
                    Search = projectContractVariationOrderSearch.Search,
                    ProjectContractVariationOrderId = projectContractVariationOrderSearch.ProjectContractVariationOrderId,
                    WorkFlowStatusId = projectContractVariationOrderSearch.WorkFlowStatusId,
                    CompanyId = projectContractVariationOrderSearch.CompanyId,
                    DocumentCode = projectContractVariationOrderSearch.DocumentCode,
                    ProjectName = projectContractVariationOrderSearch.ProjectName,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder),
                    ApproverUserId = projectContractVariationOrderSearch.UserId
                }, commandType: CommandType.Text))
                {
                    projectContractVariationOrderDisplayResult.ProjectContractVariationOrderList = result.Read<ProjectContractVariationOrder>().ToList();
                    if (projectContractVariationOrderSearch.Take > 0)
                    {
                        projectContractVariationOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return projectContractVariationOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ProjectContractVariationOrder GetProjectContractVariationOrderDetails(int ProjectContractVariationOrderId, int companyId)
        {
            try
            {
                ProjectContractVariationOrder projectContractVariationOrderObj = new ProjectContractVariationOrder();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractVariationOrder_CRUD", new
                {
                    Action = "SELECTBYID",
                    ProjectContractVariationOrderId = ProjectContractVariationOrderId,
                    CompanyId = companyId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder)
                }, commandType: CommandType.StoredProcedure))
                {
                    //project contract variation order details..
                    //projectContractVariationOrderObj = result.Read<ProjectContractVariationOrder>().FirstOrDefault();

                    //project mater contract details..
                    projectContractVariationOrderObj = result.Read<ProjectContractVariationOrder, Suppliers, ProjectContractVariationOrder>((Pv, Su) =>
                    {
                        Pv.Supplier = Su;
                        return Pv;
                    }, splitOn: "SupplierId").FirstOrDefault();

                    if (projectContractVariationOrderObj != null)
                    {
                        projectContractVariationOrderObj.ProjectContractVariationOrderItems = result.Read<ProjectContractVariationOrderItems>().ToList();
                        projectContractVariationOrderObj.CostCategories = result.Read<POPCostCategory>().ToList();
                        projectContractVariationOrderObj.ApportionmentMethods = result.Read<POPApportionment>().ToList();


                        UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                        if (currentApproverDetails != null)
                        {
                            //updated approver user name and approver user id...
                            projectContractVariationOrderObj.CurrentApproverUserId = currentApproverDetails.UserID;
                            projectContractVariationOrderObj.CurrentApproverUserName = currentApproverDetails.UserName;
                        }
                    }
                }

                if (projectContractVariationOrderObj != null)
                {
                    projectContractVariationOrderObj.WorkFlowComments = new List<WorkflowAuditTrail>();
                    projectContractVariationOrderObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = projectContractVariationOrderObj.ProjectContractVariationOrderId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder),
                        DocumentUserId = projectContractVariationOrderObj.CreatedBy,
                        UserId = Convert.ToInt32(projectContractVariationOrderObj.CreatedBy)
                    }).ToList();
                }
                return projectContractVariationOrderObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateProjectContractVariationOrder(ProjectMasterContract projectContractVariationOrder)
        {
            int returnId = 0;
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (projectContractVariationOrder.VOId == 0)
                        returnId = InsertVariationOrder(projectContractVariationOrder, transactionObj);

                    else
                        returnId = UpdateVariationOrder(projectContractVariationOrder, transactionObj);



                    //if (returnId > 0)
                    transactionObj.Commit();

                    return returnId;
                }
                catch (Exception e)
                {
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        private int InsertVariationOrder(ProjectMasterContract obj, IDbTransaction transactionObj)
        {
            int projectVariationOrderId = 0;
            try
            {

                #region Saving Master Table...
                string popMasterCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                projectVariationOrderId = this.m_dbconnection.QueryFirstOrDefault<int>("ProjectContractVariationOrderNew_CRUD", new
                {
                    Action = "INSERT_MASTER",
                    DocumentCode = popMasterCode,
                    POPId = obj.ProjectMasterContractId,
                    WorkFlowStatusId = obj.WorkFlowStatusId,
                    CompanyId = obj.CompanyId,
                    CreatedBy = obj.CreatedBy,
                    VOSum = obj.TotalVOSum,
                    RevisedContractValueSum = obj.SubTotalRevisedContractValue,
                    VODescription = obj.VODescription,
                    CMTotalVOSum = obj.CMTotalVOSum,
                    CMAdjustedContractSum = obj.CMAdjustedContractSum,
                    CMRetentionMaxLimit = obj.CMRetentionMaxLimit
                },
                transaction: transactionObj,
                commandType: CommandType.StoredProcedure);
                #endregion

                #region  Saving project line items...
                if (obj.ProjectMasterContractItems != null)
                {
                    List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                    foreach (var record in obj.ProjectMasterContractItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERTVOITEMS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@VOId", projectVariationOrderId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@VOSum", record.VOSum, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@PreviousVOSum", record.PreviousVOSum, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ItemTypeId", 1, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", obj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                        itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@TypeOfCostName", record.TypeOfCostName, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ApportionmentMethod", record.ApportionmentMethod, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@RevisedContractValue", record.RevisedContractValue, DbType.String, ParameterDirection.Input);
                        itemToAdd.Add(itemObj);
                    }
                    var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectContractVariationOrderNew_CRUD", itemToAdd, transaction: transactionObj,
                                                        commandType: CommandType.StoredProcedure);
                }

                #endregion
                #region  we are saving project discount line items...
                if (obj.DiscountLineItems != null)
                {
                    List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                    foreach (var record in obj.DiscountLineItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERTVOITEMS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@VOId", projectVariationOrderId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@VOSum", record.VOSum, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@PreviousVOSum", record.PreviousVOSum, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ItemTypeId", 2, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", obj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                        itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ContractValue", record.DiscountValue, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ApportionmentMethod", record.DisApportionmentMethod, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@RevisedContractValue", record.RevisedContractValue, DbType.String, ParameterDirection.Input);
                        itemToAdd.Add(itemObj);
                    }
                    var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectContractVariationOrderNew_CRUD", itemToAdd, transaction: transactionObj,
                                                        commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region Save Document Address Details.
                this.sharedRepository = new SharedRepository();
                this.sharedRepository.PostDocumentAddress(new DocumentAddress
                {
                    Address = obj.SupplierAddress,
                    CompanyId = obj.CompanyId,
                    DocumentId = projectVariationOrderId,
                    ProcessId = (int)WorkFlowProcessTypes.ProjectContractVariationOrder
                }, transactionObj);
                #endregion

                #region saving files here...

                SaveFiles(obj, projectVariationOrderId, transactionObj);

                #endregion

                UserProfileRepository userProfileRepository = new UserProfileRepository();
                var user = userProfileRepository.GetUserById(obj.CreatedBy);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                DateTime now = DateTime.Now;
                AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "create", obj.CreatedBy.ToString(), projectVariationOrderId.ToString(), "CreatePVO", "Created by " + UserName + " on " + now + "", obj.CompanyId);
                AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "create", obj.CreatedBy.ToString(), projectVariationOrderId.ToString(), "CreatePVO", "Saved as Draft " + UserName + " on " + now + "", obj.CompanyId);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return projectVariationOrderId;
        }


        private int UpdateVariationOrder(ProjectMasterContract obj, IDbTransaction transactionObj)
        {
            int projectVariationOrderId = 0;
            try
            {
                #region Upating Master Table...
                projectVariationOrderId = this.m_dbconnection.Query<int>("ProjectContractVariationOrderNew_CRUD", new
                {
                    Action = "UPDATE_MASTER",
                    VOId = obj.VOId,
                    POPId = obj.ProjectMasterContractId,
                    VOSum = obj.TotalVOSum,
                    RevisedContractValueSum = obj.SubTotalRevisedContractValue,
                    WorkFlowStatusId = obj.WorkFlowStatusId,
                    UpdatedBy = obj.UpdatedBy,
                    VODescription = obj.VODescription,
                    CMTotalVOSum = obj.CMTotalVOSum,
                    CMAdjustedContractSum = obj.CMAdjustedContractSum,
                    CMRetentionMaxLimit = obj.CMRetentionMaxLimit
                },
                transaction: transactionObj,
                commandType: CommandType.StoredProcedure).FirstOrDefault();
                #endregion

                #region  Saving project line items...
                if (obj.ProjectMasterContractItems != null)
                {
                    List<DynamicParameters> voLineItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in obj.ProjectMasterContractItems)
                    {
                        if (record.ProjectMasterContractItemId > 0)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "UPDATE_VO_ITEMS", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@VOId", obj.VOId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@VOSum", record.VOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@PreviousVOSum", record.PreviousVOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@RevisedContractValue", record.RevisedContractValue, DbType.String, ParameterDirection.Input);
                            voLineItemsToAdd.Add(itemObj);
                        }
                    }
                    var projectVariationOrderSaveResult = this.m_dbconnection.Execute("ProjectContractVariationOrderNew_CRUD", voLineItemsToAdd,
                        transaction: transactionObj, commandType: CommandType.StoredProcedure);

                    this.m_dbconnection.Execute("delete from VariationOrderItems where POPItemId=0 and VOId=@VOId", new { VOId = obj.VOId }, transaction: transactionObj);
                    List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                    foreach (var record in obj.ProjectMasterContractItems)
                    {
                        if (record.ProjectMasterContractItemId == 0)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERTVOITEMS", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@VOId", obj.VOId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemTypeId", 1, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@VOSum", record.VOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@PreviousVOSum", record.PreviousVOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", obj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.ApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@RevisedContractValue", record.RevisedContractValue, DbType.String, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }
                    }
                    foreach (var record in obj.DiscountLineItems)
                    {
                        if (record.ProjectMasterContractItemId == 0)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERTVOITEMS", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@VOId", obj.VOId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemTypeId", 2, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@VOSum", record.VOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@PreviousVOSum", record.PreviousVOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", obj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ContractValue", 0, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.DisApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@RevisedContractValue", record.RevisedContractValue, DbType.String, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }
                    }
                    var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectContractVariationOrderNew_CRUD", itemToAdd, transaction: transactionObj,
                                                        commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region  we are saving project discount line items...
                if (obj.DiscountLineItems != null)
                {
                    List<DynamicParameters> voLineItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in obj.DiscountLineItems)
                    {
                        if (record.ProjectMasterContractItemId > 0)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "UPDATE_VO_ITEMS", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@VOId", obj.VOId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@UpdatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@UpdatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.DisApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@PreviousVOSum", record.PreviousVOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@VOSum", record.VOSum, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@RevisedContractValue", record.RevisedContractValue, DbType.String, ParameterDirection.Input);
                            voLineItemsToAdd.Add(itemObj);
                        }
                    }
                    var projectVariationOrderSaveResult = this.m_dbconnection.Execute("ProjectContractVariationOrderNew_CRUD", voLineItemsToAdd,
                        transaction: transactionObj, commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region deleting attachments
                List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                if (obj.Attachments != null)
                {
                    for (var i = 0; i < obj.Attachments.Count; i++)
                    {
                        if (obj.Attachments[i].IsDelete)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@AttachmentTypeId", obj.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", obj.VOId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", obj.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var purchaseOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);

                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ProjectVariationOrder,
                                FilesNames = obj.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = obj.VOId.ToString()
                            });
                        }
                    }
                }
                #endregion

                #region Save Document Address Details.
                this.sharedRepository = new SharedRepository();
                this.sharedRepository.PostDocumentAddress(new DocumentAddress
                {
                    Address = obj.SupplierAddress,
                    CompanyId = obj.CompanyId,
                    DocumentId = obj.VOId,
                    ProcessId = (int)WorkFlowProcessTypes.ProjectContractVariationOrder
                }, transactionObj);
                #endregion

                #region saving files here...

                SaveFiles(obj, obj.VOId, transactionObj);

                #endregion

                #region UpdateWorkflow

                if (obj.IsVerifier && obj.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
                {
                    int approvalCount = 0;
                    int status = 0;
                    string approvalStatus = string.Empty;
                    workFlowConfigRepository = new WorkFlowConfigurationRepository();
                    int deletedWorkFlowId = 0;
                    var approverList = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD", new
                    {
                        Action = "VERIFY_IS_VERIFIER",
                        DocumentId = obj.VOId,
                        ProcessId = WorkFlowProcessTypes.ProjectContractVariationOrder,
                        CompanyId = obj.CompanyId,
                        PageName = "Project Variation Order"
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure).ToList();

                    var verificationApprover = approverList.Where(app => app.IsSupplierVerrfier == true).FirstOrDefault();
                    int count = 0;
                    var updatedApproverList = this.workFlowConfigRepository.GetWorkFlowApprovers(new WorkFlowParameter
                    {
                        CompanyId = obj.CompanyId,
                        LocationId = obj.LocationId,
                        DocumentId = obj.VOId,
                        ProcessId = (int)WorkFlowProcessTypes.ProjectContractVariationOrder,
                        Value = obj.TotalVOSum.ToString()
                    });
                    var isCreditLimit = updatedApproverList.FirstOrDefault(x => x.IsCreditLimit == true);
                    bool isSame = true;
                    var matchedCount = updatedApproverList.Except(updatedApproverList.Where(o => approverList.Select(s => s.ApproverUserId).ToList().Contains(o.ApproverUserId))).ToList();
                    if (matchedCount.Count() > 0)
                    {
                        isSame = false;
                    }
                    if (approverList != null)
                    {
                        if (approverList.Count > 0)
                        {
                            approvalCount = approverList.Count;
                            List<DynamicParameters> itemToAddWF = new List<DynamicParameters>();
                            foreach (var approver in approverList)
                            {
                                if (verificationApprover != null && verificationApprover.NextValue != null)
                                {
                                    if (verificationApprover.NextValue == approver.ApproverUserId)
                                    {
                                        if (obj.TotalVOSum == 0)
                                        {
                                            if (approver.ApproverUserId == verificationApprover.NextValue && !isSame)
                                            {
                                                deletedWorkFlowId = (from a in approverList
                                                                     where a.ApproverUserId == approver.ApproverUserId
                                                                     select a.WorkFlowId).FirstOrDefault();
                                            }
                                        }
                                        else
                                        {
                                            if (!isSame)
                                            {
                                                if (approver.ApproverUserId == verificationApprover.NextValue)
                                                {
                                                    deletedWorkFlowId = (from a in approverList
                                                                         where a.ApproverUserId == approver.ApproverUserId
                                                                         select a.WorkFlowId).FirstOrDefault();
                                                }
                                            }

                                        }
                                    }
                                }
                            }

                            if (deletedWorkFlowId > 0)
                            {
                                var itemObj = new DynamicParameters();
                                List<DynamicParameters> itemToDelete = new List<DynamicParameters>();

                                itemObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@WorkFlowId", deletedWorkFlowId, DbType.Int32, ParameterDirection.Input);
                                itemToDelete.Add(itemObj);

                                this.m_dbconnection.Execute("WorkFlow_CRUD", itemToDelete, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                verificationApprover.NextValue = null;

                            }

                            foreach (var updatedApprover in updatedApproverList)
                            {
                                var match = approverList.FirstOrDefault(x => x.ApproverUserId == updatedApprover.ApproverUserId);
                                var itemObj = new DynamicParameters();
                                if (match == null)
                                {
                                    count++;
                                    if (count == 1)
                                    {
                                        if (verificationApprover.NextValue == null)
                                        {
                                            verificationApprover.NextValue = updatedApprover.ApproverUserId;
                                            status = Convert.ToInt32(WorkFlowStatus.ApprovalInProgress);
                                        }
                                        else
                                        {
                                            status = Convert.ToInt32(WorkFlowStatus.Initiated);
                                        }
                                    }
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@DocumentId", obj.VOId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ProcessId", updatedApprover.ProcessId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CompanyId", obj.CompanyId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ApproverUserId", updatedApprover.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@WorkFlowOrder", updatedApprover.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@WorkFlowStatusId", status, DbType.Int32, ParameterDirection.Input);
                                    itemToAddWF.Add(itemObj);
                                    count = 0;
                                }
                            }
                            var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", itemToAddWF, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        }
                    }
                }

                #endregion
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return obj.VOId;
        }
        private void SaveFiles(ProjectMasterContract projectPaymentContract, int VOId, IDbTransaction transactionObj)
        {
            if (projectPaymentContract.files != null)
            {
                try
                {
                    FileOperations fileOperationsObj = new FileOperations();
                    bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                    {
                        CompanyName = "UEL",
                        ModuleName = AttachmentFolderNames.ProjectVariationOrder,
                        Files = projectPaymentContract.files,
                        UniqueId = VOId.ToString()
                    });
                    List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                    for (var i = 0; i < projectPaymentContract.files.Count; i++)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ProjectVariationOrder), DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@RecordId", VOId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@FileName", projectPaymentContract.files[i].FileName, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", projectPaymentContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                        fileToSave.Add(itemObj);
                    }
                    var projectMasterContractFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                        commandType: CommandType.StoredProcedure);
                }
                catch (Exception e)
                {
                    throw e;
                }
            }
        }

        public List<VariationOrder> getVOList(GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = this.m_dbconnection.Query<VariationOrder>("ProjectContractVariationOrderNew_CRUD", new
                {
                    Action = "SELECT",
                    IsApprovalPage = gridDisplayInput.IsApprovalPage,
                    UserId = gridDisplayInput.UserId,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
                if (gridDisplayInput.FetchFilterData && result.Count > 0)
                {
                    if (!StringOperations.IsNullOrEmpty(gridDisplayInput.SupplierName))
                    {
                        result = result.Where(x => x.SupplierName.ToLower() == gridDisplayInput.SupplierName.ToLower()).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(gridDisplayInput.POPDocumentCode))
                    {
                        result = result.Where(x => x.POPDocumentCode.ToLower().IndexOf(gridDisplayInput.POPDocumentCode.ToLower()) > -1).ToList();
                        //result = result.Where(x => x.POPDocumentCode.ToLower()==gridDisplayInput.POPDocumentCode.ToLower()).ToList();
                    }
                    if (gridDisplayInput.ProjectMasterContractId > 0)
                    {
                        result = result.Where(x => x.POPId == gridDisplayInput.ProjectMasterContractId).ToList();
                    }
                }
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<ProjectContractVariationOrderItems> GetProjectLineItems(int VOId)
        {
            try
            {

                string sql = @"select VOI.VOId as ProjectContractVariationOrderId ,VOI.POPItemId as ProjectMasterContractItemId ,VOI.VOSum as TotalVOSum ,VOI.CreatedBy ,VOI.ItemDescription,VOI.AccountCodeId,VOI.AccountCodeCategoryId
		                            ,VOI.ContractValue,VOI.TypeOfCostName,VOI.ApportionmentMethod ,VOI.RevisedContractValue  
                                  FROM dbo.VariationOrderItems as VOI  where VOI.VOId=@VOId";
                var result = this.m_dbconnection.Query<ProjectContractVariationOrderItems>(sql, new
                {
                    VOId = VOId

                }).ToList();
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public ProjectMasterContract getVODetailsbyId(int POPId, int VOId)
        {
            try
            {
                ProjectMasterContract projectMasterContract = new ProjectMasterContract();
                ProjectContractVariationOrder projectContractVariationOrder = new ProjectContractVariationOrder();
                projectMasterContractRepository = new ProjectMasterContractRepository();
                if (POPId == 0 && VOId > 0)
                {
                    POPId = getPOPId(VOId);
                }
                projectMasterContract = projectMasterContractRepository.GetProjectMasterContractDetails(POPId);
                projectMasterContract.WorkFlowStatusId = 0;
                projectMasterContract.WorkFlowComments = new List<WorkflowAuditTrail>();
                projectMasterContract.Attachments = new List<Attachments>();
                if (VOId == 0)
                {
                    foreach (var item in projectMasterContract.ProjectMasterContractItems)
                    {
                        item.VOSum = 0;
                    }
                    foreach (var item in projectMasterContract.DiscountLineItems)
                    {
                        item.VOSum = 0;
                    }
                }
                else
                {
                    projectContractVariationOrder = GetVODetails(POPId, VOId);
                    projectMasterContract.ProjectMasterContractItems = GetVOLineItems(POPId, VOId).ToList();
                    projectMasterContract.DiscountLineItems = GetVODiscountItems(POPId, VOId).ToList();
                    projectMasterContract.CurrentVOSum = projectContractVariationOrder.VOSum;
                    projectMasterContract.TotalVOSum = Convert.ToDecimal(projectContractVariationOrder.CMTotalVOSum);
                    projectMasterContract.AdjustedContractSum = Convert.ToDecimal(projectContractVariationOrder.CMAdjustedContractSum);
                    projectMasterContract.RetentionMaxLimit = Convert.ToDecimal(projectContractVariationOrder.CMRetentionMaxLimit);
                    projectMasterContract.WorkFlowStatusId = projectContractVariationOrder.WorkFlowStatusId;
                    projectMasterContract.CreatedBy = projectContractVariationOrder.CreatedBy;
                    projectMasterContract.VOWorkFlowStatus = projectContractVariationOrder.Status;
                    projectMasterContract.VODocumentCode = projectContractVariationOrder.DocumentCode;
                    projectMasterContract.CurrentApproverUserName = projectContractVariationOrder.CurrentApproverUserName;
                    projectMasterContract.CurrentApproverUserId = projectContractVariationOrder.CurrentApproverUserId;
                    projectMasterContract.Attachments = projectContractVariationOrder.Attachments;
                    projectMasterContract.WorkFlowComments = projectContractVariationOrder.WorkFlowComments;
                    projectMasterContract.ReasonsToReject = projectContractVariationOrder.ReasonsToReject;
                    projectMasterContract.ReasonsToCancel = projectContractVariationOrder.ReasonsToCancel;
                    projectMasterContract.VODescription = projectContractVariationOrder.VODescription;
                    //projectContractVariationOrder.ProjectContractVariationOrderItems = GetProjectLineItems(VOId);
                    //projectContractVariationOrder.ProjectMasterContract = projectMasterContractRepository.GetProjectMasterContractDetails(POPId);
                }
                if (projectMasterContract != null && projectMasterContract.ProjectMasterContractItems != null)
                {
                    foreach (var item in projectMasterContract.ProjectMasterContractItems)
                    {
                        item.RevisedContractValue = item.ContractValue + item.PreviousVOSum + item.VOSum;
                    }
                }
                if (projectMasterContract != null && projectMasterContract.DiscountLineItems != null)
                {
                    foreach (var item in projectMasterContract.DiscountLineItems)
                    {
                        item.RevisedContractValue = item.DiscountValue - item.PreviousVOSum - item.VOSum;
                    }
                }
                if (VOId > 0)
                {
                    this.sharedRepository = new SharedRepository();
                    DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.ProjectContractVariationOrder, VOId, projectContractVariationOrder.CompanyId);
                    projectMasterContract.SupplierAddress = address == null ? string.Empty : address.Address;
                }
                return projectMasterContract;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private List<ProjectMasterContractItems> GetVOLineItems(int pOPId, int vOId)
        {
            List<ProjectMasterContractItems> lst = new List<ProjectMasterContractItems>();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractVariationOrderNew_CRUD", new
                {
                    Action = "SELECTVOITEMS",
                    POPId = pOPId,
                    ProjectContractVariationOrderId = vOId,
                    ItemTypeId = 1,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder)
                }, commandType: CommandType.StoredProcedure))
                {
                    lst = result.Read<ProjectMasterContractItems>().ToList();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return lst;
        }

        private List<DiscountLineItems> GetVODiscountItems(int pOPId, int vOId)
        {
            List<DiscountLineItems> lst = new List<DiscountLineItems>();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractVariationOrderNew_CRUD", new
                {
                    Action = "SELECTVOITEMS",
                    POPId = pOPId,
                    ProjectContractVariationOrderId = vOId,
                    ItemTypeId = 2,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder)
                }, commandType: CommandType.StoredProcedure))
                {
                    lst = result.Read<DiscountLineItems>().ToList();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return lst;
        }

        private List<ProjectContractVariationOrderItems> GetVOAddedItems(int vOId)
        {
            List<ProjectContractVariationOrderItems> lstVOItems = new List<ProjectContractVariationOrderItems>();
            try
            {
                string qry = @"SELECT VOI.void AS ProjectContractVariationOrderId,  VOI.popitemid  AS ProjectMasterContractItemId, VOI.vosum, VOI.createdby, 
                               VOI.itemdescription, VOI.accountcodeid, VOI.accountcodecategoryid, VOI.contractvalue,  VOI.typeofcostname, 
                               VOI.apportionmentmethod, 
                               VOI.revisedcontractvalue, 
                               ac.accountcodeid, 
                               ac.accountcodecategoryid, 
                               ac.accountcode AS Code, 
                               acc.accountcodename, 
                               Ac.accountcode , CAT.AccountTypeText AS AccountType,Ac.Description
                        FROM   dbo.variationorderitems AS VOI 
                               INNER JOIN dbo.accountcode AS Ac 
                                       ON VOI.accountcodeid = ac.accountcodeid 
                               INNER JOIN coaaccounttype AS CAT 
                                       ON AC.accounttypeid = CAT.coaaccounttypeid 
                               LEFT JOIN dbo.accountcodecategory acc 
                                      ON acc.accountcodecategoryid = ac.accountcodecategoryid 
                        WHERE  VOI.void = @VOId 
                               AND voi.popitemid = 0 ";
                lstVOItems = this.m_dbconnection.Query<ProjectContractVariationOrderItems>(qry, new
                {
                    VOId = vOId,
                }).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return lstVOItems;
        }

        private int getPOPId(int vOId)
        {
            int POPId = 0;
            try
            {
                string sql = @"select popid from VariationOrder where VOId=@VOId";
                POPId = this.m_dbconnection.ExecuteScalar<int>(sql, new
                {
                    VOId = vOId
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return POPId;
        }

        private ProjectContractVariationOrder GetVODetails(int POPId, int VOId)
        {
            ProjectContractVariationOrder projectContractVariationOrder = new ProjectContractVariationOrder();
            try
            {
                string sql = string.Empty;
                string currentUsers = string.Empty;
                if (VOId > 0)
                {
                    sql = @"select *,ws.Statustext as Status,ISNULL(DocumentCode,DraftCode ) as DocumentCode
                          from VariationOrder as VO
                          inner join WorkFlowStatus as ws on VO.WorkFlowStatusId=ws.WorkFlowStatusid
                          where VO.VOId=@VOId";

                    projectContractVariationOrder = this.m_dbconnection.Query<ProjectContractVariationOrder>(sql, new
                    {
                        VOId = VOId,
                        POPId = POPId
                    }).FirstOrDefault();
                }


                currentUsers = @" select Top(1) ApproverUserId  as UserID, concat(UP.FirstName,' ',UP.LastName) as UserName                            
                               from dbo.WorkFlow as WFL join dbo.UserProfile as UP on WFL.ApproverUserId = up.UserID where DocumentId = @DocumentId                            
                    and ProcessId = @ProcessId and (Status=1 or Status=2 or Status=3 or Status=5 or Status=20 );";
                UserProfile currentApproverDetails = this.m_dbconnection.Query<UserProfile>(currentUsers, new
                {
                    DocumentId = VOId,
                    ProcessId = (int)WorkFlowProcessTypes.ProjectContractVariationOrder
                }).FirstOrDefault();
                if (currentApproverDetails != null && projectContractVariationOrder != null)
                {
                    projectContractVariationOrder.CurrentApproverUserId = currentApproverDetails.UserID;
                    projectContractVariationOrder.CurrentApproverUserName = currentApproverDetails.UserName;
                }
                if (VOId > 0 && projectContractVariationOrder != null)
                {
                    projectContractVariationOrder.WorkFlowComments = new List<WorkflowAuditTrail>();
                    projectContractVariationOrder.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = VOId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder),
                        DocumentUserId = projectContractVariationOrder.CreatedBy,
                        UserId = Convert.ToInt32(projectContractVariationOrder.CreatedBy)
                    }).ToList();
                    if (projectContractVariationOrder.WorkFlowComments != null)
                    {
                        var cancelReasons = projectContractVariationOrder.WorkFlowComments.Where(x => x.Statusid == (int)WorkFlowStatus.CancelledApproval).ToList();
                        var wfComments = projectContractVariationOrder.WorkFlowComments.Where(x => x.Statusid != (int)WorkFlowStatus.CancelledApproval).ToList();
                        projectContractVariationOrder.ReasonsToCancel = cancelReasons.Select(x => x.Remarks).ToArray();
                        if (projectContractVariationOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            projectContractVariationOrder.ReasonsToReject = wfComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                        }
                    }
                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = VOId,
                        AttachmentTypeId = Convert.ToInt32(AttachmentType.ProjectVariationOrder)

                    }, commandType: CommandType.StoredProcedure);
                    projectContractVariationOrder.Attachments = attachments.ToList();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return projectContractVariationOrder;
        }

        public bool ReviseContractSum(int documentId, IDbTransaction transactionObj)
        {
            bool isRevised = false;
            List<ProjectContractVariationOrderItems> voitems = null;
            try
            {
                int popId = getPOPId(documentId);
                projectMasterContractRepository = new ProjectMasterContractRepository();
                ProjectMasterContract projectMasterContract = projectMasterContractRepository.GetProjectMasterContractDetails(popId);
                voitems = new List<ProjectContractVariationOrderItems>();

                string script = @"select *,POPitemId as ProjectMasterContractItemId from VariationOrderItems where VOId=@VOId";
                voitems = this.m_dbconnection.Query<ProjectContractVariationOrderItems>(script, new
                {
                    VOId = documentId,
                }).ToList();
                foreach (ProjectContractVariationOrderItems item in voitems)
                {
                    script = @"update ProjectMasterContractItems set VOSum=VOSum+ @VOSUM where ProjectMasterContractItemId=@POPItemId and POPId=@POPId;";
                    int result = this.m_dbconnection.Execute(script, new
                    {
                        VOSUM = Convert.ToDecimal(item.VOSum),
                        POPItemId = item.ProjectMasterContractItemId,
                        POPId = popId
                    });
                }
                script = @"declare @totalLineVOSum decimal(18,2)= isnull((select SUM(vosum) from VariationOrderItems where VOId=@VOId and itemTypeid=1),0) ;
                           declare @totalDiscountVOSum decimal(18,2)= isnull((select SUM(vosum) from VariationOrderItems where VOId=@VOId and itemTypeid=2),0);
                           declare @totalVOSum decimal(18,2)= (@totalLineVOSum-@totalDiscountVOSum);
                          update ProjectMasterContract set TotalVOSum=TotalVOSum+ @totalVOSum , AdjustedContractSum= AdjustedContractSum+ @totalVOSum
                          where ProjectMasterContractId=@POPId;";
                this.m_dbconnection.Execute(script, new
                {
                    VOId = documentId,
                    POPId = popId
                });
                AddNewVOItemsToPOPItems(documentId, popId, transactionObj);
                if (projectMasterContract.IsRetentionApplicable && projectMasterContract.RetentionTypeId == 2)
                {
                    script = @"update ProjectMasterContract set RetentionMaxLimit= round( (AdjustedContractSum*RetentionPercentage)/100,2)
                              where ProjectMasterContractId=@POPId";
                    this.m_dbconnection.Execute(script, new
                    {
                        VOId = documentId,
                        POPId = popId
                    });
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return isRevised;
        }

        private void AddNewVOItemsToPOPItems(int documentId, int popId, IDbTransaction transactionObj)
        {
            try
            {
                string addedVOItemsscript = @"select *,POPitemId as ProjectMasterContractItemId from VariationOrderItems where VOId=@VOId and POPItemId=0";
                var addedVOItems = this.m_dbconnection.Query<ProjectContractVariationOrderItems>(addedVOItemsscript, new
                {
                    VOId = documentId,
                }).ToList();
                List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                foreach (var addedVOItem in addedVOItems)
                {
                    string insertScript = @"INSERT INTO ProjectMasterContractItems
                                       (POPId ,ItemDescription ,ItemTypeId ,ApportionmentMethod
                                       ,TypeOfCostName ,ContractValue,VOSum ,CreatedBy ,CreatedDate)
                                 VALUES
                                       (@POPId ,@ItemDescription ,@ItemTypeId ,@ApportionmentMethod
                                       ,@TypeOfCostName ,@ContractValue,@VOSum ,@CreatedBy ,GETDATE())";
                    //AccountCodeId ,AccountCodeCategoryId ,@AccountCodeId ,@AccountCodeCategoryId ,
                    this.m_dbconnection.Query<int>(insertScript, new
                    {
                        POPId = popId,
                        ItemDescription = addedVOItem.ItemDescription,
                        //AccountCodeId = addedVOItem.AccountCodeId,
                        //AccountCodeCategoryId = addedVOItem.AccountCodeCategoryId,
                        ItemTypeId = addedVOItem.ItemTypeID,
                        ApportionmentMethod = addedVOItem.ApportionmentMethod,
                        TypeOfCostName = addedVOItem.TypeOfCostName,
                        VOSum = addedVOItem.VOSum,
                        ContractValue = 0,
                        CreatedBy = addedVOItem.CreatedBy,
                        CreatedDate = DateTime.Now
                    });
                }
            }
            catch (Exception ex)
            {

                throw;
            }
        }
    }
}
