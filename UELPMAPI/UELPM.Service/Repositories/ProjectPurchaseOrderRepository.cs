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
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class ProjectPurchaseOrderRepository: IProjectPurchaseOrderRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        string draftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string popMasterCode = draftCode + ModuleCodes.ProjectPurchaseOrder;
                        int projectPurchaseOrderId = this.m_dbconnection.Query<int>("ProjectPurchaseOrder_CRUD",
                                new
                                {
                                    Action = "INSERT",
                                    PoCode = popMasterCode,
                                    SupplierInvoiceDate = projectPurchaseOrder.SupplierInvoiceDate,
                                    SupplierInvoiceNo = projectPurchaseOrder.SupplierInvoiceNo,
                                    JobCompletionDate = projectPurchaseOrder.JobCompletionDate,
                                    DateOfValuation = projectPurchaseOrder.DateOfValuation,
                                    DateOfCertification = projectPurchaseOrder.DateOfCertification,
                                    CertificateNumber = projectPurchaseOrder.CertificateNumber,
                                    ProjectMasterContractId = projectPurchaseOrder.ProjectMasterContractId,
                                    ContractValueTotal = projectPurchaseOrder.ContractValueTotal,
                                    PrevAccumulatedPaymentTotal = projectPurchaseOrder.PrevAccumulatedPaymentTotal,
                                    CurrentPaymentTotal = projectPurchaseOrder.CurrentPaymentTotal,
                                    AccumulatedTotal = projectPurchaseOrder.AccumulatedTotal,
                                    TaxId = projectPurchaseOrder.TaxId,
                                    SubjectToRetentionPercentageA1 = projectPurchaseOrder.SubjectToRetentionPercentageA1,
                                    SubjectToRetentionPercentageA2 = projectPurchaseOrder.SubjectToRetentionPercentageA2,
                                    SubjectToRetentionAmountA1 = projectPurchaseOrder.SubjectToRetentionAmountA1,
                                    SubjectToRetentionAmountA2 = projectPurchaseOrder.SubjectToRetentionAmountA2,
                                    NoRetentiontionAmount = projectPurchaseOrder.NoRetentiontionAmount,
                                    RetentionSum = projectPurchaseOrder.RetentionSum,
                                    RetentionSumForThismonth = projectPurchaseOrder.RetentionSumForThismonth,
                                    GrandTotal = projectPurchaseOrder.GrandTotal,
                                    WorkflowStatusId = projectPurchaseOrder.WorkFlowStatusId,
                                    CreatedBy = projectPurchaseOrder.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    CompanyId = projectPurchaseOrder.CompanyId,
                                    CommercialDiscount = projectPurchaseOrder.CommercialDiscount
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();


                        #region  we are saving project purchase order items...
                        if (projectPurchaseOrder.ProjectPurchaseOrderItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of project purchase order items.....
                            foreach (var record in projectPurchaseOrder.ProjectPurchaseOrderItems)
                            {

                                var status = Math.Round(Convert.ToDecimal((record.AccumulatedPayment / record.ContractValue) * 100),2);
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectPurchaseOrderId", projectPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TypeOfCost", record.TypeOfCost, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ApportionmentId", record.ApportionmentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CurrentPayment", record.AccumulatedPayment- record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@OverallStatus", status, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectPurchaseOrderItem_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                                  
                        //commiting the transaction...
                        #region
                        if (projectPurchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            projectPurchaseOrder.ProjectPurchaseOrderId = projectPurchaseOrderId;
                            new SharedRepository().SendForApproval(new WorkFlowParameter
                            {
                                CompanyId = projectPurchaseOrder.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectPO),
                                Value = "0",
                                DocumentId = projectPurchaseOrder.ProjectPurchaseOrderId,
                                CreatedBy = projectPurchaseOrder.CreatedBy,
                                DocumentCode = "",
                                ItemCategory = "",
                                ItemQuantity = "0",
                                WorkFlowStatusId = projectPurchaseOrder.WorkFlowStatusId,
                                LocationId = 0
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(projectPurchaseOrder.CreatedBy).UserName;
                        if (string.IsNullOrEmpty(projectPurchaseOrder.PoCode) && !string.IsNullOrEmpty(projectPurchaseOrder.PoCode))
                        {
                            AuditLog.Info("ProjectPurchaseOrderCreation", "create", projectPurchaseOrder.CreatedBy.ToString(), projectPurchaseOrder.ProjectMasterContractId.ToString(), "CreateProjectPurchaseOrder", "Project Purchase Order " + popMasterCode + " with draft status created by " + UserName + "", projectPurchaseOrder.CompanyId);
                        }
                        else
                        {
                            AuditLog.Info("ProjectPurchaseOrderCreation", "create", projectPurchaseOrder.CreatedBy.ToString(), projectPurchaseOrder.ProjectMasterContractId.ToString(), "CreateProjectPurchaseOrder", "Project Purchase Order " + projectPurchaseOrder.PoCode + " created by " + UserName + "", projectPurchaseOrder.CompanyId);
                        }
                        return projectPurchaseOrderId;
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

        public int DeleteProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ProjectPurchaseOrder_CRUD",
                    new
                    {
                        Action = "DELETE",
                        ProjectPurchaseOrderId = projectPurchaseOrder.ProjectPurchaseOrderId,
                        CreatedBy = projectPurchaseOrder.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ProjectPurchaseOrderDisplayResult GetProjectPurchaseOrders(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ProjectPurchaseOrderDisplayResult projectPurchaseOrderDisplayResult = new ProjectPurchaseOrderDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectPurchaseOrder_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    projectPurchaseOrderDisplayResult.ProjectPurchaseOrders = result.Read<ProjectPurchaseOrder>().ToList();
                    if (gridDisplayInput.Take > 0)
                    {
                        projectPurchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return projectPurchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public ProjectPurchaseOrder GetProjectPurchaseOrderDetails(int projectPurchaseOrderId)
        {
            try
            {
                ProjectPurchaseOrder projectPurchaseOrderObj = new ProjectPurchaseOrder();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectPurchaseOrder_CRUD", new
                {
                    Action = "SELECTBYID",
                    ProjectPurchaseOrderId = projectPurchaseOrderId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectPO)
                }, commandType: CommandType.StoredProcedure))
                {
                    //project purchase order details..
                    projectPurchaseOrderObj = result.Read<ProjectPurchaseOrder, Suppliers, ProjectPurchaseOrder>((Pc, Su) =>
                    {
                        Pc.Supplier = Su;
                        return Pc;
                    }, splitOn: "SupplierId").FirstOrDefault();

                    if (projectPurchaseOrderObj != null)
                    {
                        projectPurchaseOrderObj.ProjectPurchaseOrderItems = result.Read<ProjectPurchaseOrderItems>().ToList();

                        decimal ContractValueSubTotal = 0;
                        decimal PrevAccumulatedPaymentSubTotal = 0;
                        decimal CurrentPaymentSubTotal = 0;
                        decimal AccumulatedSubTotal = 0;
                        projectPurchaseOrderObj.ProjectPurchaseOrderItems.ForEach(dta =>
                        {
                            ContractValueSubTotal = ContractValueSubTotal + dta.ContractValue;
                            PrevAccumulatedPaymentSubTotal = PrevAccumulatedPaymentSubTotal + dta.PrevAccumulatedAmount;
                            CurrentPaymentSubTotal = CurrentPaymentSubTotal + dta.CurrentPayment;
                            AccumulatedSubTotal = AccumulatedSubTotal + dta.AccumulatedPayment;
                        });
                        projectPurchaseOrderObj.ContractValueSubTotal = ContractValueSubTotal;
                        projectPurchaseOrderObj.PrevAccumulatedPaymentSubTotal = PrevAccumulatedPaymentSubTotal;
                        projectPurchaseOrderObj.CurrentPaymentSubTotal = CurrentPaymentSubTotal;
                        projectPurchaseOrderObj.AccumulatedSubTotal = AccumulatedSubTotal;
                    }
                }

                //if (projectMasterContractObj != null)
                //{
                //    projectMasterContractObj.ContractTerms = GetContractTerms(projectMasterContractObj.ContractStartDate, projectMasterContractObj.ContractEndDate);
                //    projectMasterContractObj.WorkFlowComments = new List<WorkflowAuditTrail>();
                //    projectMasterContractObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                //    {
                //        Documentid = projectMasterContractObj.ProjectMasterContractId,
                //        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                //        DocumentUserId = projectMasterContractObj.CreatedBy,
                //        UserId = Convert.ToInt32(projectMasterContractObj.CreatedBy)
                //    }).ToList();
                //}
                return projectPurchaseOrderObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {

                        #region project purchase order updation...

                       
                        var updateResult = this.m_dbconnection.Query<int>("ProjectPurchaseOrder_CRUD",
                                new
                                {
                                    Action = "UPDATE",
                                   // PoCode = popMasterCode,
                                    ProjectPurchaseOrderId = projectPurchaseOrder.ProjectPurchaseOrderId,
                                    SupplierInvoiceDate = projectPurchaseOrder.SupplierInvoiceDate,
                                    SupplierInvoiceNo = projectPurchaseOrder.SupplierInvoiceNo,
                                    JobCompletionDate = projectPurchaseOrder.JobCompletionDate,
                                    DateOfValuation = projectPurchaseOrder.DateOfValuation,
                                    DateOfCertification = projectPurchaseOrder.DateOfCertification,
                                    CertificateNumber = projectPurchaseOrder.CertificateNumber,
                                    ProjectMasterContractId = projectPurchaseOrder.ProjectMasterContractId,
                                    ContractValueTotal = projectPurchaseOrder.ContractValueTotal,
                                    PrevAccumulatedPaymentTotal = projectPurchaseOrder.PrevAccumulatedPaymentTotal,
                                    CurrentPaymentTotal = projectPurchaseOrder.CurrentPaymentTotal,
                                    AccumulatedTotal = projectPurchaseOrder.AccumulatedTotal,
                                    TaxId = projectPurchaseOrder.TaxId,
                                    SubjectToRetentionPercentageA1 = projectPurchaseOrder.SubjectToRetentionPercentageA1,
                                    SubjectToRetentionPercentageA2 = projectPurchaseOrder.SubjectToRetentionPercentageA2,
                                    SubjectToRetentionAmountA1 = projectPurchaseOrder.SubjectToRetentionAmountA1,
                                    SubjectToRetentionAmountA2 = projectPurchaseOrder.SubjectToRetentionAmountA2,
                                    NoRetentiontionAmount = projectPurchaseOrder.NoRetentiontionAmount,
                                    RetentionSum = projectPurchaseOrder.RetentionSum,
                                    RetentionSumForThismonth = projectPurchaseOrder.RetentionSumForThismonth,
                                    GrandTotal = projectPurchaseOrder.GrandTotal,
                                    WorkflowStatusId = projectPurchaseOrder.WorkFlowStatusId,
                                    CreatedBy = projectPurchaseOrder.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    CompanyId = projectPurchaseOrder.CompanyId,
                                    CommercialDiscount = projectPurchaseOrder.CommercialDiscount
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                        #endregion
                        #region we are saving project purchase order...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of project purchase order items...
                        foreach (var record in projectPurchaseOrder.ProjectPurchaseOrderItems.Where(i => i.ProjectPurchaseOrderItemId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ProjectPurchaseOrderId", projectPurchaseOrder.ProjectPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ProjectMasterContractItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TypeOfCost", record.TypeOfCost, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentId", record.ApportionmentId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CurrentPayment", record.AccumulatedPayment - record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@OverallStatus", (record.AccumulatedPayment / record.ContractValue) * 100, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }
                        var projectMasterContractSaveResult = this.m_dbconnection.Execute("[ProjectPurchaseOrderItem_CRUD]", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);

                        #endregion
                        #region updating project purchase order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in projectPurchaseOrder.ProjectPurchaseOrderItems.Where(i => i.ProjectPurchaseOrderItemId > 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ProjectPurchaseOrderId", projectPurchaseOrder.ProjectPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ProjectMasterContractItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ProjectPurchaseOrderItemId", record.ProjectPurchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TypeOfCost", record.TypeOfCost, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentId", record.ApportionmentId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CurrentPayment", record.AccumulatedPayment - record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@OverallStatus", (record.AccumulatedPayment / record.ContractValue) * 100, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemsToUpdate.Add(itemObj);
                        }
                        var projectMasterContractUpdateResult = this.m_dbconnection.Execute("[ProjectPurchaseOrderItem_CRUD]", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion
                        #region deleting project purchase order items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (projectPurchaseOrder.DeletedProjectPurchaseOrderItems != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var purchaseOrderItemId in projectPurchaseOrder.DeletedProjectPurchaseOrderItems)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectPurchaseOrderItemId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", projectPurchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToDelete.Add(itemObj);
                            }
                        }

                        var projectPurchaseOrderDeleteResult = this.m_dbconnection.Execute("ProjectPurchaseOrderItem_CRUD", itemsToDelete,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        //commiting the transaction...
                        #region
                        if (projectPurchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            new SharedRepository().SendForApproval(new WorkFlowParameter
                            {
                                CompanyId = projectPurchaseOrder.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                                Value = "0",
                                DocumentId = projectPurchaseOrder.ProjectMasterContractId,
                                CreatedBy = projectPurchaseOrder.CreatedBy,
                                DocumentCode = projectPurchaseOrder.PoCode,
                                ItemCategory = "",
                                ItemQuantity = "0",
                                WorkFlowStatusId = projectPurchaseOrder.WorkFlowStatusId,
                                LocationId = 0
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(projectPurchaseOrder.CreatedBy).UserName;
                        if (string.IsNullOrEmpty(projectPurchaseOrder.PoCode) && !string.IsNullOrEmpty(projectPurchaseOrder.DraftCode))
                        {
                            AuditLog.Info("ProjectPurchaseOrderCreation", "update", projectPurchaseOrder.CreatedBy.ToString(), projectPurchaseOrder.ProjectMasterContractId.ToString(), "UpdateProjectPurchaseOrder", "Project Purchase Order " + projectPurchaseOrder.DraftCode + " with draft status updated by " + UserName + "", projectPurchaseOrder.CompanyId);
                        }
                        else
                        {
                            AuditLog.Info("ProjectPurchaseOrderCreation", "update", projectPurchaseOrder.CreatedBy.ToString(), projectPurchaseOrder.ProjectMasterContractId.ToString(), "UpdateProjectPurchaseOrder", "Project Purchase Order " + projectPurchaseOrder.PoCode + " updated by " + UserName + "", projectPurchaseOrder.CompanyId);
                        }
                        return updateResult;
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
            finally
            {
                this.m_dbconnection.Close();
            }
        }
    }
}
