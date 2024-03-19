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
    public class ProjectPaymentContractRepository : IProjectPaymentContractRepository
    {
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        ProjectMasterContractRepository projectMasterContractRepository = null;
        SharedRepository sharedRepository = null;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        public int CreateProjectPaymentContract(ProjectPaymentContract projectPaymentContract)
        {
            int returnId = 0;
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (VerifyDocument(projectPaymentContract, transactionObj))
                    {
                        if (projectPaymentContract.PaymentContractId == 0)
                            returnId = InsertPaymentContract(projectPaymentContract, transactionObj);

                        else
                            returnId = UpdatePaymentContract(projectPaymentContract, transactionObj);

                        //if (returnId > 0)
                        transactionObj.Commit();
                    }
                    else
                    {
                        returnId = -1;
                    }
                    return returnId;
                }
                catch (Exception e)
                {
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        private bool VerifyDocument(ProjectPaymentContract projectPaymentContract, IDbTransaction transactionObj)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>("ProjectPaymentContract_CRUD", new
            {
                Action = "CHECK_DUPLICATE",
                PaymentContractId = projectPaymentContract.PaymentContractId,
                SupplierInvoiceNumber = projectPaymentContract.SupplierInvoiceNumber
            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
            return count;
        }

        private int InsertPaymentContract(ProjectPaymentContract projectPaymentContract, IDbTransaction transactionObj)
        {
            int projectPaymentContractId = 0;
            try
            {

                #region Saving Master Table...
                string popMasterCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                projectPaymentContractId = this.m_dbconnection.QueryFirstOrDefault<int>("ProjectPaymentContract_CRUD", new
                {
                    Action = "INSERT_MASTER",
                    PreviousPaymentContractId = projectPaymentContract.PreviousPaymentContractId,
                    PPCMasterCode = popMasterCode,
                    POPId = projectPaymentContract.POPId,
                    DateOfValuation = projectPaymentContract.DateOfValuation,
                    DateOfCertification = projectPaymentContract.DateOfCertification,
                    CertificateNo = projectPaymentContract.CertificateNo,
                    PaymentNo = projectPaymentContract.PaymentNo,
                    CompanyId = projectPaymentContract.CompanyId,
                    SupplierInvoiceNumber = projectPaymentContract.SupplierInvoiceNumber,
                    DateOfDocument = projectPaymentContract.DateOfDocument,
                    WorkFlowStatusId = projectPaymentContract.WorkFlowStatusId,
                    CreatedBy = projectPaymentContract.CreatedBy,
                    PaymentDescription = projectPaymentContract.PaymentDescription,
                    LocationId = projectPaymentContract.LocationId,
                    CMTotalVOSum = projectPaymentContract.CMTotalVOSum,
                    CMAdjustedContractSum = projectPaymentContract.CMAdjustedContractSum,
                    CMRetentionMaxLimit = projectPaymentContract.CMRetentionMaxLimit,
                    BalanceAmount = projectPaymentContract.ProjectMasterContractItems.Sum(x => x.CurrentPayment)
                },
                transaction: transactionObj,
                commandType: CommandType.StoredProcedure);
                #endregion

                #region  Saving interim line items...
                if (projectPaymentContract.ProjectMasterContractItems != null)
                {
                    List<DynamicParameters> paymentLineItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in projectPaymentContract.ProjectMasterContractItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERT_PROJECT_PAYMENT_LINE_ITEMS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@PaymentContractId", projectPaymentContractId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPId", projectPaymentContract.POPId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CMContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ItemTypeId", 1, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CurrentPayment", record.CurrentPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@OverallStatus", record.OverallStatus, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", projectPaymentContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        paymentLineItemsToAdd.Add(itemObj);
                    }
                    var projectPaymentContractSaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", paymentLineItemsToAdd,
                        transaction: transactionObj, commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region  we are saving interim discount line items...
                if (projectPaymentContract.DiscountLineItems != null)
                {
                    List<DynamicParameters> paymentLineItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in projectPaymentContract.DiscountLineItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERT_PROJECT_PAYMENT_LINE_ITEMS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@PaymentContractId", projectPaymentContractId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPId", projectPaymentContract.POPId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CMContractValue", record.DiscountValue, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ItemTypeId", 2, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CurrentPayment", record.CurrentPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@OverallStatus", record.OverallStatus, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", projectPaymentContract.CreatedBy, DbType.Int32, ParameterDirection.Input);


                        paymentLineItemsToAdd.Add(itemObj);
                    }
                    var projectPaymentContractSaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", paymentLineItemsToAdd, transaction: transactionObj,
                                                        commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region Saving Payment Summary
                if (projectPaymentContract.Certificate != null && projectPaymentContract.Certificate.Retentions != null)
                {
                    int ProjectPaymentItemId = this.m_dbconnection.QueryFirstOrDefault<int>("ProjectPaymentContract_CRUD", new
                    {
                        Action = "INSERT_PROJECT_PAYMENT_ITEMS",
                        POPId = projectPaymentContract.POPId,
                        PaymentContractId = projectPaymentContractId,
                        TotalValueOfWorkDone = projectPaymentContract.Certificate.TotalValueOfWorkDone,
                        RetentionSumCalculated = projectPaymentContract.Certificate.RetentionSumCalculated,
                        RetentionSumPreviouslyReleased = projectPaymentContract.Certificate.RetentionSumPreviouslyReleased,
                        RetentionSumBalBeforeCurrentRelease = projectPaymentContract.Certificate.RetentionSumBalBeforeCurrentRelease,
                        RetentionSumReleaseInTheMonth = projectPaymentContract.Certificate.RetentionSumReleaseInTheMonth,
                        NettRetention = projectPaymentContract.Certificate.NettRetention,
                        ContractSumPreviouslyCertifiedToDate = projectPaymentContract.Certificate.ContractSumPreviouslyCertifiedToDate,
                        AmountDueUnderThisCerificate = projectPaymentContract.Certificate.AmountDueUnderThisCerificate,
                        GST = projectPaymentContract.Certificate.GST,
                        GSTAdjustment = projectPaymentContract.Certificate.GSTAdjustment,
                        GrandTotal = projectPaymentContract.Certificate.GrandTotal,
                        CPTotalValueOfWorkDone = projectPaymentContract.Certificate.CPTotalValueOfWorkDone,
                        CPRetentionSumCalculated = projectPaymentContract.Certificate.CPRetentionSumCalculated,
                        CPRetentionSumReleaseInTheMonth = projectPaymentContract.Certificate.CPRetentionSumReleaseInTheMonth,
                        CPNettRetention = projectPaymentContract.Certificate.CPNettRetention,
                        CPAmountDueUnderThisCerificate = projectPaymentContract.Certificate.CPAmountDueUnderThisCerificate,
                        CPGST = projectPaymentContract.Certificate.CPGST,
                        CPGSTAdjustment = projectPaymentContract.Certificate.CPGSTAdjustment,
                        CPGrandTotal = projectPaymentContract.Certificate.CPGrandTotal,
                        CreatedBy = projectPaymentContract.CreatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                    SaveRetentions(projectPaymentContract, transactionObj, ProjectPaymentItemId, projectPaymentContractId);
                }
                #endregion

                #region  we are saving distribution summary items...
                if (projectPaymentContract.POPDistributionSummaryItems != null)
                {
                    List<DynamicParameters> distributionItemsToAdd = new List<DynamicParameters>();
                    //looping through the list of pop cost categories....
                    foreach (var record in projectPaymentContract.POPDistributionSummaryItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERT_PAYMENT_DISTRIBUTIONS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@PaymentContractId", projectPaymentContractId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@DistributionPercentage", record.DistributionPercentage, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ContractAmount", record.PayContractAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ThisCertification", record.ThisCertification, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@RetentionAmount", record.RetentionAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", projectPaymentContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@DepartmentId", record.DepartmentId, DbType.Int32, ParameterDirection.Input);


                        distributionItemsToAdd.Add(itemObj);
                    }
                    var projectMasterContractDistributionSummarySaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", distributionItemsToAdd, transaction: transactionObj,
                                                        commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region saving files here...

                SaveFiles(projectPaymentContract, projectPaymentContractId, transactionObj);

                #endregion

                #region Save Document Address Details.
                this.sharedRepository = new SharedRepository();
                this.sharedRepository.PostDocumentAddress(new DocumentAddress
                {
                    Address = projectPaymentContract.SupplierAddress,
                    CompanyId = projectPaymentContract.CompanyId,
                    DocumentId = projectPaymentContractId,
                    ProcessId = (int)WorkFlowProcessTypes.ProjectPaymentContract
                }, transactionObj);
                #endregion

                #region Draft Audit Log..
                if (projectPaymentContractId > 0)
                {
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    var user = userProfileRepository.GetUserById(projectPaymentContract.CreatedBy);
                    string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                    DateTime now = DateTime.Now;
                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "create", projectPaymentContract.CreatedBy.ToString(), projectPaymentContractId.ToString(), "CreatePPC", "Created by " + UserName + " on " + now + "", projectPaymentContract.CompanyId);
                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "create", projectPaymentContract.CreatedBy.ToString(), projectPaymentContractId.ToString(), "CreatePPC", "Saved as Draft " + UserName + " on " + now + "", projectPaymentContract.CompanyId);
                }
                #endregion
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return projectPaymentContractId;
        }
        private void SaveRetentions(ProjectPaymentContract projectPaymentContract, IDbTransaction transactionObj, int projectPaymentItemId, int projectPaymentContractId = 0)
        {
            try
            {
                int id = this.m_dbconnection.Query<int>("ProjectPaymentContract_CRUD", new
                {
                    Action = "DELETE_PROJECT_PAYMENT_RETENTIONS",
                    PaymentContractId = projectPaymentContract.PaymentContractId,
                }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();
                List<DynamicParameters> retentionsToAdd = new List<DynamicParameters>();
                foreach (var record in projectPaymentContract.Certificate.Retentions)
                {
                    var itemObj = new DynamicParameters();
                    itemObj.Add("@Action", "INSERT_PROJECT_PAYMENT_RETENTIONS", DbType.String, ParameterDirection.Input);
                    itemObj.Add("@ProjectPaymentItemId", projectPaymentItemId, DbType.Int32, ParameterDirection.Input);
                    itemObj.Add("@PaymentContractId", projectPaymentContractId == 0 ? projectPaymentContract.PaymentContractId : projectPaymentContractId, DbType.Int32, ParameterDirection.Input);
                    itemObj.Add("@RetentionPercentage", record.RetentionPercentage, DbType.Decimal, ParameterDirection.Input);
                    itemObj.Add("@RetentionAmount", record.RetentionAmount, DbType.Decimal, ParameterDirection.Input);
                    itemObj.Add("@RetentionSum", record.RetentionSum, DbType.Decimal, ParameterDirection.Input);
                    itemObj.Add("@IsRetention", record.IsRetention, DbType.Decimal, ParameterDirection.Input);
                    itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                    retentionsToAdd.Add(itemObj);
                }
                var projectPaymentContractSaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", retentionsToAdd, transaction: transactionObj,
                                                    commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private void SaveFiles(ProjectPaymentContract projectPaymentContract, int projectPaymentContractId, IDbTransaction transactionObj)
        {
            if (projectPaymentContract.files != null)
            {
                try
                {
                    FileOperations fileOperationsObj = new FileOperations();
                    bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                    {
                        CompanyName = "UEL",
                        ModuleName = AttachmentFolderNames.ProjectPaymentContract,
                        Files = projectPaymentContract.files,
                        UniqueId = projectPaymentContractId.ToString()
                    });
                    List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                    for (var i = 0; i < projectPaymentContract.files.Count; i++)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ProjectPaymentContract), DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@RecordId", projectPaymentContractId, DbType.Int32, ParameterDirection.Input);
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
        private int UpdatePaymentContract(ProjectPaymentContract projectPaymentContract, IDbTransaction transactionObj)
        {
            int projectPaymentContractId = 0;
            try
            {
                #region Upating Master Table...
                projectPaymentContractId = this.m_dbconnection.Query<int>("ProjectPaymentContract_CRUD", new
                {
                    Action = "UPDATE_MASTER",
                    DateOfValuation = projectPaymentContract.DateOfValuation,
                    DateOfCertification = projectPaymentContract.DateOfCertification,
                    WorkFlowStatusId = projectPaymentContract.WorkFlowStatusId,
                    UpdatedBy = projectPaymentContract.UpdatedBy,
                    CertificateNo = projectPaymentContract.CertificateNo,
                    SupplierInvoiceNumber = projectPaymentContract.SupplierInvoiceNumber,
                    DateOfDocument = projectPaymentContract.DateOfDocument,
                    PaymentContractId = projectPaymentContract.PaymentContractId,
                    POPId = projectPaymentContract.POPId,
                    PaymentDescription = projectPaymentContract.PaymentDescription,
                    LocationId = projectPaymentContract.LocationId,
                    CMTotalVOSum = projectPaymentContract.CMTotalVOSum,
                    CMAdjustedContractSum = projectPaymentContract.CMAdjustedContractSum,
                    CMRetentionMaxLimit = projectPaymentContract.CMRetentionMaxLimit,
                    BalanceAmount = projectPaymentContract.ProjectMasterContractItems.Sum(x => x.CurrentPayment)
                },
                transaction: transactionObj,
                commandType: CommandType.StoredProcedure).FirstOrDefault();
                #endregion

                #region  Saving interim line items...
                if (projectPaymentContract.ProjectMasterContractItems != null)
                {
                    List<DynamicParameters> paymentLineItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in projectPaymentContract.ProjectMasterContractItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "UPDATE_PROJECT_PAYMENT_LINE_ITEMS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@PaymentContractId", projectPaymentContract.PaymentContractId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPId", projectPaymentContract.POPId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CMContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ItemTypeId", 1, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CurrentPayment", record.CurrentPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@OverallStatus", record.OverallStatus, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@UpdatedBy", projectPaymentContract.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                        paymentLineItemsToAdd.Add(itemObj);
                    }
                    var projectPaymentContractSaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", paymentLineItemsToAdd,
                        transaction: transactionObj, commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region  we are saving interim discount line items...
                if (projectPaymentContract.DiscountLineItems != null)
                {
                    List<DynamicParameters> paymentLineItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in projectPaymentContract.DiscountLineItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "UPDATE_PROJECT_PAYMENT_LINE_ITEMS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@PaymentContractId", projectPaymentContract.PaymentContractId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPId", projectPaymentContract.POPId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@POPItemId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CMContractValue", record.DiscountValue, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ItemTypeId", 2, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@PrevAccumulatedAmount", record.PrevAccumulatedAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CurrentPayment", record.CurrentPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@AccumulatedPayment", record.AccumulatedPayment, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@OverallStatus", record.OverallStatus, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@UpdatedBy", projectPaymentContract.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                        paymentLineItemsToAdd.Add(itemObj);
                    }
                    var projectPaymentContractSaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", paymentLineItemsToAdd,
                        transaction: transactionObj, commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region Saving Payment Summary
                if (projectPaymentContract.Certificate != null && projectPaymentContract.Certificate.Retentions != null)
                {
                    int ProjectPaymentItemId = this.m_dbconnection.Query<int>("ProjectPaymentContract_CRUD", new
                    {
                        Action = "UPDATE_PROJECT_PAYMENT_ITEMS",
                        POPId = projectPaymentContract.POPId,
                        PaymentContractId = projectPaymentContract.PaymentContractId,
                        TotalValueOfWorkDone = projectPaymentContract.Certificate.TotalValueOfWorkDone,
                        RetentionSumCalculated = projectPaymentContract.Certificate.RetentionSumCalculated,
                        RetentionSumPreviouslyReleased = projectPaymentContract.Certificate.RetentionSumPreviouslyReleased,
                        RetentionSumBalBeforeCurrentRelease = projectPaymentContract.Certificate.RetentionSumBalBeforeCurrentRelease,
                        RetentionSumReleaseInTheMonth = projectPaymentContract.Certificate.RetentionSumReleaseInTheMonth,
                        NettRetention = projectPaymentContract.Certificate.NettRetention,
                        ContractSumPreviouslyCertifiedToDate = projectPaymentContract.Certificate.ContractSumPreviouslyCertifiedToDate,
                        AmountDueUnderThisCerificate = projectPaymentContract.Certificate.AmountDueUnderThisCerificate,
                        GST = projectPaymentContract.Certificate.GST,
                        GSTAdjustment = projectPaymentContract.Certificate.GSTAdjustment,
                        GrandTotal = projectPaymentContract.Certificate.GrandTotal,
                        CPTotalValueOfWorkDone = projectPaymentContract.Certificate.CPTotalValueOfWorkDone,
                        CPRetentionSumCalculated = projectPaymentContract.Certificate.CPRetentionSumCalculated,
                        CPRetentionSumReleaseInTheMonth = projectPaymentContract.Certificate.CPRetentionSumReleaseInTheMonth,
                        CPNettRetention = projectPaymentContract.Certificate.CPNettRetention,
                        CPAmountDueUnderThisCerificate = projectPaymentContract.Certificate.CPAmountDueUnderThisCerificate,
                        CPGST = projectPaymentContract.Certificate.CPGST,
                        CPGSTAdjustment = projectPaymentContract.Certificate.CPGSTAdjustment,
                        CPGrandTotal = projectPaymentContract.Certificate.CPGrandTotal,
                        UpdatedBy = projectPaymentContract.UpdatedBy
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                    SaveRetentions(projectPaymentContract, transactionObj, ProjectPaymentItemId);
                }
                #endregion

                #region  we are saving distribution summary items...
                if (projectPaymentContract.POPDistributionSummaryItems != null)
                {
                    List<DynamicParameters> distributionItemsToAdd = new List<DynamicParameters>();
                    foreach (var record in projectPaymentContract.POPDistributionSummaryItems)
                    {
                        var itemObj = new DynamicParameters();
                        itemObj.Add("@Action", "UPDATE_PAYMENT_DISTRIBUTIONS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@PaymentContractId", projectPaymentContract.PaymentContractId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@DistributionPercentage", record.DistributionPercentage, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ContractAmount", record.PayContractAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@ThisCertification", record.ThisCertification, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@RetentionAmount", record.RetentionAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@UpdatedBy", projectPaymentContract.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@DepartmentId", record.DepartmentId, DbType.Int32, ParameterDirection.Input);
                        distributionItemsToAdd.Add(itemObj);
                    }
                    var projectMasterContractDistributionSummarySaveResult = this.m_dbconnection.Execute("ProjectPaymentContract_CRUD", distributionItemsToAdd,
                        transaction: transactionObj, commandType: CommandType.StoredProcedure);
                }
                #endregion

                #region Save Document Address Details.
                this.sharedRepository = new SharedRepository();
                this.sharedRepository.PostDocumentAddress(new DocumentAddress
                {
                    Address = projectPaymentContract.SupplierAddress,
                    CompanyId = projectPaymentContract.CompanyId,
                    DocumentId = projectPaymentContract.PaymentContractId,
                    ProcessId = (int)WorkFlowProcessTypes.ProjectPaymentContract
                }, transactionObj);
                #endregion

                #region deleting attachments
                List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                if (projectPaymentContract.Attachments != null)
                {
                    for (var i = 0; i < projectPaymentContract.Attachments.Count; i++)
                    {
                        if (projectPaymentContract.Attachments[i].IsDelete)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@AttachmentTypeId", projectPaymentContract.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", projectPaymentContract.PaymentContractId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", projectPaymentContract.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var purchaseOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);

                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ProjectPaymentContract,
                                FilesNames = projectPaymentContract.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = projectPaymentContract.PaymentContractId.ToString()
                            });
                        }
                    }
                }
                #endregion

                #region saving files here...

                SaveFiles(projectPaymentContract, projectPaymentContract.PaymentContractId, transactionObj);

                #endregion

                #region UpdateWorkflow

                if (projectPaymentContract.IsVerifier && projectPaymentContract.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
                {
                    int approvalCount = 0;
                    int status = 0;
                    string approvalStatus = string.Empty;
                    workFlowConfigRepository = new WorkFlowConfigurationRepository();
                    int deletedWorkFlowId = 0;
                    var approverList = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD", new
                    {
                        Action = "VERIFY_IS_VERIFIER",
                        DocumentId = projectPaymentContract.PaymentContractId,
                        ProcessId = WorkFlowProcessTypes.ProjectPaymentContract,
                        CompanyId = projectPaymentContract.CompanyId,
                        PageName = "Project Contract Payment"
                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure).ToList();

                    var verificationApprover = approverList.Where(app => app.IsSupplierVerrfier == true).FirstOrDefault();
                    int count = 0;
                    var updatedApproverList = this.workFlowConfigRepository.GetWorkFlowApprovers(new WorkFlowParameter
                    {
                        CompanyId = projectPaymentContract.CompanyId,
                        LocationId = projectPaymentContract.LocationId,
                        DocumentId = projectPaymentContract.PaymentContractId,
                        ProcessId = (int)WorkFlowProcessTypes.ProjectPaymentContract,
                        Value = projectPaymentContract.Certificate.CPGrandTotal.ToString()
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
                                        if (projectPaymentContract.CurrentPaymentTotalAmount == 0)
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
                                    itemObj.Add("@DocumentId", projectPaymentContract.PaymentContractId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ProcessId", updatedApprover.ProcessId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CompanyId", projectPaymentContract.CompanyId, DbType.Int32, ParameterDirection.Input);
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
            return projectPaymentContract.PaymentContractId;
        }
        public ProjectPaymentContract getCertificatesByPaymentContractId(int POPId, int PaymentContractId)
        {
            try
            {
                ProjectPaymentContract Certificate = new ProjectPaymentContract();
                projectMasterContractRepository = new ProjectMasterContractRepository();
                Certificate = GetCertificate(POPId, PaymentContractId);
                if (Certificate != null)
                {
                    POPId = POPId == 0 ? Certificate.POPId : POPId;
                    Certificate.ProjectMasterContract = projectMasterContractRepository.GetProjectMasterContractDetails(POPId);
                    if (PaymentContractId == 0)
                    {
                        Certificate.CMAdjustedContractSum = Certificate.ProjectMasterContract.AdjustedContractSum;
                        Certificate.CMRetentionMaxLimit = Certificate.ProjectMasterContract.RetentionMaxLimit;
                        Certificate.CMTotalVOSum = Certificate.ProjectMasterContract.TotalVOSum;
                    }
                    if (PaymentContractId > 0)
                    {
                        if (Certificate.ProjectMasterContract.ProjectMasterContractItems != null)
                        {
                            Certificate.ProjectMasterContract.ProjectMasterContractItems = getPaymentLineItems(POPId, PaymentContractId);
                        }
                        if (Certificate.ProjectMasterContract.DiscountLineItems != null)
                        {
                            Certificate.ProjectMasterContract.DiscountLineItems = getPaymentDiscountItems(POPId, PaymentContractId);
                        }
                    }
                    foreach (var item in Certificate.ProjectMasterContract.ProjectMasterContractItems)
                    {
                        PaymentInterimLineItems items = GetPreviousItems(POPId, item.ProjectMasterContractItemId, PaymentContractId);
                        if (items != null)
                        {
                            if (Certificate.PaymentNo > 1 || PaymentContractId == 0)
                            {
                                item.PrevAccumulatedAmount = items.AccumulatedPayment;
                            }
                            if (PaymentContractId > 0)
                            {
                                item.PrevAccumulatedAmount = items.PrevAccumulatedAmount;
                                item.CurrentPayment = items.CurrentPayment;
                            }
                            item.AccumulatedPayment = items.AccumulatedPayment;
                        }
                    }
                    foreach (var item in Certificate.ProjectMasterContract.DiscountLineItems)
                    {
                        PaymentInterimLineItems items = GetPreviousItems(POPId, item.ProjectMasterContractItemId, PaymentContractId);
                        if (items != null)
                        {
                            if (Certificate.PaymentNo > 1 || PaymentContractId == 0)
                            {
                                item.PrevAccumulatedAmount = items.AccumulatedPayment;
                            }
                            if (PaymentContractId > 0)
                            {
                                item.PrevAccumulatedAmount = items.PrevAccumulatedAmount;
                                item.CurrentPayment = items.CurrentPayment;
                            }
                            item.AccumulatedPayment = items.AccumulatedPayment;
                        }
                    }
                    Certificate.Certificate = GetCertificateDetails(POPId, PaymentContractId);
                    Certificate.PreviousCertificate = GetCertificateDetails(POPId, PaymentContractId, true);
                    if (Certificate.PreviousCertificate != null)
                    {
                        Certificate.PreviousRetentionSum = GetPreviousRetentionSum(POPId, PaymentContractId);
                        Certificate.PreviousPaymentContractId = Certificate.PreviousCertificate.PaymentContractId;
                    }
                    Certificate.POPDistributionSummaryItems = GetCertificateDistributionSummary(PaymentContractId);
                }
                else
                {
                    Certificate = new ProjectPaymentContract();
                    Certificate.ProjectMasterContract = projectMasterContractRepository.GetProjectMasterContractDetails(POPId);
                    Certificate.CMAdjustedContractSum = Certificate.ProjectMasterContract.AdjustedContractSum;
                    Certificate.CMRetentionMaxLimit = Certificate.ProjectMasterContract.RetentionMaxLimit;
                    Certificate.CMTotalVOSum = Certificate.ProjectMasterContract.TotalVOSum;
                }
                if (Certificate.ProjectMasterContract != null && Certificate.ProjectMasterContract.ProjectMasterContractItems != null)
                {
                    foreach (var item in Certificate.ProjectMasterContract.ProjectMasterContractItems)
                    {
                        item.ContractValue = item.ContractValue + item.VOSum;
                    }
                }
                if (Certificate.ProjectMasterContract != null && Certificate.ProjectMasterContract.DiscountLineItems != null)
                {
                    foreach (var item in Certificate.ProjectMasterContract.DiscountLineItems)
                    {
                        item.DiscountValue = Convert.ToDecimal(item.DiscountValue - item.VOSum);
                    }
                }
                this.sharedRepository = new SharedRepository();
                DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.ProjectPaymentContract, Certificate.PaymentContractId, Certificate.CompanyId);
                Certificate.SupplierAddress = address == null ? string.Empty : address.Address;
                return Certificate;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private List<ProjectMasterContractItems> getPaymentLineItems(int POPId, int paymentContractId)
        {
            List<ProjectMasterContractItems> lst = new List<ProjectMasterContractItems>();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("Projectpaymentcontract_crud", new
                {
                    Action = "SELECT_PAYMENTS_ITEMS",
                    POPId = POPId,
                    paymentContractId = paymentContractId,
                    ItemTypeId = 1
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

        private List<DiscountLineItems> getPaymentDiscountItems(int POPId, int paymentContractId)
        {
            List<DiscountLineItems> lst = new List<DiscountLineItems>();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("Projectpaymentcontract_crud", new
                {
                    Action = "SELECT_PAYMENTS_ITEMS",
                    POPId = POPId,
                    paymentContractId = paymentContractId,
                    ItemTypeId = 2
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

        private decimal GetPreviousRetentionSum(int pOPId, int paymentContractId)
        {
            decimal returnVal = 0;
            try
            {
                string sql = @"select ISNULL(sum(ppr.retentionsum),0) from ProjectPaymentRetentions ppr inner join ProjectPaymentContract ppc
                             on ppc.PaymentContractId=ppr.PaymentContractId where ppc.POPId=@POPId and ppc.paymentcontractid<>@paymentContractId and ppc.WorkflowStatusId not in (5,12)";
                returnVal = this.m_dbconnection.ExecuteScalar<decimal>(sql, new
                {
                    POPId = pOPId,
                    paymentContractId = paymentContractId
                });
            }
            catch (Exception ex)
            {

                throw ex;
            }
            return returnVal;
        }
        private ProjectPaymentContract GetCertificate(int POPId, int paymentContractId)
        {
            ProjectPaymentContract projectPaymentContract = new ProjectPaymentContract();
            try
            {
                string sql = string.Empty;
                string currentUsers = string.Empty;
                if (paymentContractId > 0)
                    sql = @"select *,ws.Statustext,ISNULL(DocumentCode,DraftDocumentCode ) as DocumentCode,(select name from Location where LocationID=ppc.locationid) as LocationName,
                          (select  top 1 case PaymentContractId when @PaymentContractId then 1 else 0 end from ProjectPaymentContract where POPId=@POPId and WorkflowStatusId in (4) order by PaymentContractId desc) as CanVoidable
                          from ProjectPaymentContract as ppc
                          inner join WorkFlowStatus as ws on ppc.WorkflowStatusId=ws.WorkFlowStatusid
                          where ppc.PaymentContractId=@PaymentContractId";
                else
                    sql = @"select top 1 PaymentNo from ProjectPaymentContract where POPId =@POPId order by PaymentContractId desc";
                projectPaymentContract = this.m_dbconnection.Query<ProjectPaymentContract>(sql, new
                {
                    PaymentContractId = paymentContractId,
                    POPId = POPId
                }).FirstOrDefault();

                currentUsers = @" select Top(1) ApproverUserId  as UserID, concat(UP.FirstName,' ',UP.LastName) as UserName                            
                               from dbo.WorkFlow as WFL join dbo.UserProfile as UP on WFL.ApproverUserId = up.UserID where DocumentId = @DocumentId                            
                    and ProcessId = @ProcessId and (Status=1 or Status=2 or Status=3 or Status=5 or Status=20 );";
                UserProfile currentApproverDetails = this.m_dbconnection.Query<UserProfile>(currentUsers, new
                {
                    DocumentId = paymentContractId,
                    ProcessId = (int)WorkFlowProcessTypes.ProjectPaymentContract
                }).FirstOrDefault();
                if (currentApproverDetails != null && projectPaymentContract != null)
                {
                    projectPaymentContract.CurrentApproverUserId = currentApproverDetails.UserID;
                    projectPaymentContract.CurrentApproverUserName = currentApproverDetails.UserName;
                }
                if (paymentContractId > 0 && projectPaymentContract != null)
                {
                    projectPaymentContract.WorkFlowComments = new List<WorkflowAuditTrail>();
                    projectPaymentContract.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = paymentContractId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract),
                        DocumentUserId = projectPaymentContract.CreatedBy,
                        UserId = Convert.ToInt32(projectPaymentContract.CreatedBy)
                    }).ToList();
                    if (projectPaymentContract.WorkFlowComments != null)
                    {
                        var cancelReasons = projectPaymentContract.WorkFlowComments.Where(x => x.Statusid == (int)WorkFlowStatus.CancelledApproval).ToList();
                        var wfComments = projectPaymentContract.WorkFlowComments.Where(x => x.Statusid != (int)WorkFlowStatus.CancelledApproval).ToList();
                        projectPaymentContract.ReasonsToCancel = cancelReasons.Select(x => x.Remarks).ToArray();
                        if (projectPaymentContract.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            projectPaymentContract.ReasonsToReject = wfComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                        }
                        if (projectPaymentContract.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Void))
                        {
                            projectPaymentContract.ReasonsToVoid = wfComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                        }
                    }
                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = paymentContractId,
                        AttachmentTypeId = Convert.ToInt32(AttachmentType.ProjectPaymentContract)

                    }, commandType: CommandType.StoredProcedure);
                    projectPaymentContract.Attachments = attachments.ToList();
                }

            }
            catch (Exception e)
            {
                throw e;
            }
            return projectPaymentContract;
        }
        private PaymentInterimLineItems GetPreviousItems(int popId, int itemId, int paymentContractId)
        {
            PaymentInterimLineItems items = new PaymentInterimLineItems();
            try
            {
                string sql = @"select top 1 * from ProjectPaymentContractInterimLineItems as ppci
                             inner join projectpaymentcontract as ppc on ppci.paymentcontractid=ppc.paymentcontractid
                             where ppci.POPId=@popId and ppci.POPItemId=@itemId 
                                {0} order by ppci.ProjectPaymentContractItemId desc";

                if (paymentContractId == 0)
                {
                    sql = string.Format(sql, @"and ppci.PaymentContractId=(select top 1 PaymentContractId from ProjectPaymentContract where PaymentContractId<>@paymentContractId and POPId=@popId
                               and WorkFlowStatusId not in (5,12)
                               order by PaymentContractId desc)");
                }
                else
                {
                    sql = string.Format(sql, "and ppci.PaymentContractId=@paymentContractId");
                }
                items = this.m_dbconnection.Query<PaymentInterimLineItems>(sql, new
                {
                    itemId = itemId,
                    popId = popId,
                    paymentContractId = paymentContractId
                }).FirstOrDefault();
                return items;
            }
            catch (Exception e)
            {
                return items;
            }
        }
        private List<POPDistributionSummary> GetCertificateDistributionSummary(int paymentContractId)
        {
            List<POPDistributionSummary> distributionSummaries = null;
            try
            {
                if (paymentContractId > 0)
                {
                    string sql = @"select LO.Name as LocationName,pds.DistributionPercentage,pds.ContractAmount,pds.ThisCertification,pds.RetentionAmount,pds.DepartmentId from PaymentDistributionSummary pds join Location as LO ON PDS.DepartmentId=LO.LocationID where paymentcontractId=@paymentcontractId";
                    distributionSummaries = this.m_dbconnection.Query<POPDistributionSummary>(sql, new
                    {
                        paymentcontractId = paymentContractId
                    }).ToList();
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return distributionSummaries;
        }
        private ProjectPaymentItems GetCertificateDetails(int POPId, int ContractId, bool NeedPrevCertificate = false)
        {
            try
            {
                string sql = @"select * from ProjectPaymentItems as ppi inner join ProjectPaymentRetentions ppr on ppi.ProjectPaymentItemId=ppr.ProjectPaymentItemId where ";
                if (NeedPrevCertificate)
                {
                    if (ContractId > 0)
                    {
                        sql += @"ppi.PaymentContractId = (select PreviousPaymentContractId from ProjectPaymentContract where PaymentContractId=@ContractId and POPId=@POPId)";
                    }
                    else
                    {
                        sql += @"ppi.PaymentContractId = (select top 1 PaymentContractId from ProjectPaymentContract where PaymentContractId<>@ContractId and POPId=@POPId
                               and WorkFlowStatusId not in (5,12)
                               order by PaymentContractId desc)";
                    }
                }
                else
                {
                    sql += @"ppi.PaymentContractId = @ContractId";
                }
                var lookup = new Dictionary<int, ProjectPaymentItems>();
                var parameters = new Dictionary<string, object> { { "POPId", POPId }, { "ContractId", ContractId } };
                this.m_dbconnection.Query<ProjectPaymentItems, ProjectPaymentRetentions, ProjectPaymentItems>(sql, (c, p) =>
                {
                    ProjectPaymentItems paymentItems;
                    if (!lookup.TryGetValue(c.ProjectPaymentItemId, out paymentItems))
                    {
                        lookup.Add(c.ProjectPaymentItemId, paymentItems = c);
                    }
                    if (paymentItems.Retentions == null)
                        paymentItems.Retentions = new List<ProjectPaymentRetentions>();
                    paymentItems.Retentions.Add(p);
                    return paymentItems;
                }, parameters, splitOn: "ProjectPaymentItemId,ProjectPaymentRetentionId").AsQueryable();
                var resultList = lookup.Values;
                return resultList.FirstOrDefault();
            }
            catch (Exception ex)
            {

                throw;
            }
        }
        public List<ProjectPayment> getProjectPaymentContracts(GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = this.m_dbconnection.Query<ProjectPayment>("Projectpaymentcontract_crud", new
                {
                    Action = "SELECT",
                    IsApprovalPage = gridDisplayInput.IsApprovalPage,
                    UserId = gridDisplayInput.UserId,
                    CompanyId = gridDisplayInput.CompanyId
                    //FetchFilterData = gridDisplayInput.FetchFilterData,
                    //FromTime = gridDisplayInput.FromTime,
                    //ToTime = gridDisplayInput.ToTime,
                    //SupplierName = gridDisplayInput.SupplierName,
                    //POPDocumentCode = gridDisplayInput.POPDocumentCode
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
        public bool CheckPendingApprovals(int pOPId)
        {
            bool returnVal = false;
            try
            {
                string sql = @"select count(*) from ProjectPaymentContract where WorkflowStatusId not in (4,5,12)";
                var result = this.m_dbconnection.ExecuteScalar<int>(sql, new
                {
                    CompanyId = pOPId
                });
                returnVal = result > 0 ? false : true;
            }
            catch (Exception e)
            {
                throw e;
            }
            return returnVal;
        }
        public List<ProjectPayment> getPaymentListFilterData(ProjectPaymentListFilter projectPaymentListFilter)
        {
            try
            {
                string sql = @"select ppc.PaymentContractId,ppc.POPId,s.suppliername ,pmc.originalcontractsum ,pmc.totalvosum,  pmc.POPMasterCode as POPDocumentCode,ppc.draftdocumentcode as PaymentDocumentCode,ppc.PaymentNo,ppi.grandtotal 
                               from ProjectMasterContract as pmc inner join ProjectPaymentContract as ppc on pmc.ProjectMasterContractId=ppc.POPId
							   inner join supplier as s on s.supplierid =pmc.supplierid
                               inner join ProjectPaymentItems as ppi on ppc.PaymentContractId =ppi.PaymentContractId where pmc.CompanyId=@CompanyId and pmc.POPMasterCode=@POPDocumentCode or s.SupplierName =@SupplierName order by ppc.PaymentContractId desc";
                var result = this.m_dbconnection.Query<ProjectPayment>(sql, new
                {
                    CompanyId = projectPaymentListFilter.CompanyId,
                    POPDocumentCode = projectPaymentListFilter.POPDocumentCode,
                    SupplierName = projectPaymentListFilter.SupplierName,

                }).ToList();
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ProjectPaymentExport getProjectPaymentReport(ReportParams reportParams)
        {
            ProjectPaymentExport reportData = null;
            projectMasterContractRepository = new ProjectMasterContractRepository();
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            try
            {
                foreach (var doc in reportParams.DocumentsData)
                {
                    var paymentData = this.getCertificatesByPaymentContractId(doc.POPId, doc.PaymentContractId);
                    reportData = new ProjectPaymentExport
                    {
                        Apportionments = paymentData.ProjectMasterContract.POPApportionment,
                        CostCategories = paymentData.ProjectMasterContract.POPCostCategory,
                        MasterDocumentCode = paymentData.ProjectMasterContract.POPMasterCode
                    };
                    reportData.TypeOfCostLineItems = new List<TypeOfCostLineItem>();
                    foreach (var costCategory in paymentData.ProjectMasterContract.POPCostCategory)
                    {
                        decimal sumRet = reportData.TypeOfCostLineItems.Sum(x => x.AppPerForRetPrevAccPayment);
                        reportData.TypeOfCostLineItems.Add(getTypeOfCostLineItem(costCategory, paymentData, sumRet));
                    }
                    if (reportParams.Type.ToUpper() == "PRINT")
                    {
                        List<decimal> gstAmounts = new List<decimal>();
                        gstAmounts.Add(reportData.TypeOfCostLineItems.Sum(x => x.GSTAMountPrevAccPayment));
                        gstAmounts.Add(reportData.TypeOfCostLineItems.Sum(x => x.GSTAMountCurrentPayment));
                        gstAmounts.Add(reportData.TypeOfCostLineItems.Sum(x => x.GSTAMountAccPayment));
                        reportData.TypeOfCostLineItems.Add(getTypeOfCostLineItem(new POPCostCategory { TypeOfCost = "Total" }, paymentData, 0, gstAmounts));
                    }
                    //if (reportParams.Type.ToUpper() == "EXPORT")
                    //{
                    //    DateTime now = DateTime.Now;
                    //    UserManagementRepository userManagementRepository = new UserManagementRepository();
                    //    var exporter = userProfileRepository.GetUserById(reportParams.UserId);
                    //    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "export", reportParams.UserId.ToString(), doc.PaymentContractId.ToString(), "export", string.Format("Payment exported by {0} {1} on {2}", exporter.FirstName, exporter.LastName, now), paymentData.CompanyId);
                    //}
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            return reportData;
        }

        private TypeOfCostLineItem getTypeOfCostLineItem(POPCostCategory costCategory, ProjectPaymentContract paymentData, decimal sumRet, List<decimal> gstAmounts = null)
        {
            bool isLastTOC = (paymentData.ProjectMasterContract.POPCostCategory.IndexOf(costCategory) == paymentData.ProjectMasterContract.POPCostCategory.Count - 1);
            var typeOfCostLineItem = new TypeOfCostLineItem
            {
                IsRetentionApplicable = paymentData.ProjectMasterContract.IsRetentionApplicable,
                RetSupplierSubCode = paymentData.ProjectMasterContract.RetentionSubCode,
                SupplierSubCode = paymentData.ProjectMasterContract.SupplierSubCode.SubCode,
                AccountSetId = paymentData.ProjectMasterContract.SupplierSubCode.AccountSetId,
                RetentionAccountSetId = paymentData.ProjectMasterContract.RetentionAccountSetId,
                TaxGroup = costCategory.GST_GroupName,
                RetTaxGroup = costCategory.GL_GroupRetentionName,
                TaxAmount = costCategory.TaxAmount,
                GLCost = costCategory.GL_Cost,
                GLRet = costCategory.GL_Retention,
                TaxClass = costCategory.GST_TaxClassName,
                RetTaxClass = costCategory.GL_TaxClassRetentionName,
                TypeOfCost = costCategory.TypeOfCost,
                DocumentDescription = paymentData.PaymentDescription,
                SupplierInvoiceNo = paymentData.SupplierInvoiceNumber,
                Suffix = costCategory.Prefix,
                SupplierId = paymentData.ProjectMasterContract.Supplier.SupplierCode,
                SupplierShortName = paymentData.ProjectMasterContract.Supplier.SupplierShortName,
                PaymentTerm = paymentData.ProjectMasterContract.PaymentTermCode,
                DocumentCurrency = paymentData.ProjectMasterContract.CurrencyCode,
                PaymentDocumentCode = paymentData.DocumentCode,
                SupplierInvoiceDate = Convert.ToDateTime(paymentData.DateOfDocument).ToString("dd-MM-yyyy"),
                InvoiceDueDate = Convert.ToDateTime(paymentData.DateOfDocument).AddDays(Convert.ToInt32(paymentData.ProjectMasterContract.NoOfDays)).ToString("dd-MM-yyyy")
            };
            typeOfCostLineItem.LineItems = new List<PaymentLineItem>();
            foreach (var lineItem in paymentData.ProjectMasterContract.ProjectMasterContractItems)
            {
                var pop = paymentData.ProjectMasterContract.POPApportionment.Where(x => x.Method.ToUpper().Trim() == lineItem.ApportionmentMethod.ToUpper().Trim()).FirstOrDefault();
                var costcategory = pop.ApportionmentDetails.Where(x => x.TypeOfCost.ToUpper().Trim() == costCategory.TypeOfCost.ToUpper().Trim()).FirstOrDefault();
                decimal factor = costcategory == null ? 1 : (costcategory.Amount / pop.Total);
                decimal status = 0;
                try
                {
                    status = Convert.ToDecimal(lineItem.AccumulatedPayment * factor) / Convert.ToDecimal(lineItem.ContractValue * factor);
                }
                catch (Exception)
                {
                    status = 0;
                }
                typeOfCostLineItem.LineItems.Add(new PaymentLineItem
                {
                    LineItemDescription = lineItem.ItemDescription,
                    ApportionmentMethod = lineItem.ApportionmentMethod,
                    ContractValue = Convert.ToDecimal(lineItem.ContractValue * factor),
                    PrevAccPayment = Convert.ToDecimal(lineItem.PrevAccumulatedAmount * factor),
                    CurrentPayment = Convert.ToDecimal(lineItem.CurrentPayment * factor),
                    AccPayment = Convert.ToDecimal(lineItem.AccumulatedPayment * factor),
                    Status = status
                });
            }
            typeOfCostLineItem.DiscountItems = new List<PaymentLineItem>();
            foreach (var lineItem in paymentData.ProjectMasterContract.DiscountLineItems)
            {
                if (!string.IsNullOrEmpty(lineItem.DisApportionmentMethod))
                {
                    var pop = paymentData.ProjectMasterContract.POPApportionment.Where(x => x.Method.ToUpper().Trim() == lineItem.DisApportionmentMethod.ToUpper().Trim()).FirstOrDefault();
                    var costcategory = pop.ApportionmentDetails.Where(x => x.TypeOfCost.ToUpper().Trim() == costCategory.TypeOfCost.ToUpper().Trim()).FirstOrDefault();
                    decimal factor = costcategory == null ? 1 : (costcategory.Amount / pop.Total);
                    decimal status = 0;
                    try
                    {
                        status = Convert.ToDecimal(lineItem.AccumulatedPayment * factor) / Convert.ToDecimal(lineItem.DiscountValue * factor);
                    }
                    catch (Exception)
                    {
                        status = 0;
                    }
                    typeOfCostLineItem.DiscountItems.Add(new PaymentLineItem
                    {
                        LineItemDescription = lineItem.DisItemDescription,
                        ApportionmentMethod = lineItem.DisApportionmentMethod,
                        ContractValue = Convert.ToDecimal(lineItem.DiscountValue * factor),
                        PrevAccPayment = Convert.ToDecimal(lineItem.PrevAccumulatedAmount * factor),
                        CurrentPayment = Convert.ToDecimal(lineItem.CurrentPayment * factor),
                        AccPayment = Convert.ToDecimal(lineItem.AccumulatedPayment * factor),
                        Status = status
                    });
                }
            }
            decimal sumDiscountContractValue = typeOfCostLineItem.DiscountItems.Sum(x => x.ContractValue);
            typeOfCostLineItem.STContractValue = typeOfCostLineItem.LineItems.Sum(x => x.ContractValue);

            typeOfCostLineItem.TBTContractValue = typeOfCostLineItem.STContractValue + sumDiscountContractValue;

            decimal sumDiscountCurrentPayment = typeOfCostLineItem.DiscountItems.Sum(x => x.CurrentPayment);
            typeOfCostLineItem.STCurrentPayment = typeOfCostLineItem.LineItems.Sum(x => x.CurrentPayment);
            typeOfCostLineItem.TBTCurrentPayment = typeOfCostLineItem.STCurrentPayment + sumDiscountCurrentPayment;

            decimal sumDiscountPrevAccPayment = typeOfCostLineItem.DiscountItems.Sum(x => x.PrevAccPayment);
            typeOfCostLineItem.STPrevAccPayment = typeOfCostLineItem.LineItems.Sum(x => x.PrevAccPayment);
            typeOfCostLineItem.TBTPrevAccPayment = typeOfCostLineItem.STPrevAccPayment + sumDiscountPrevAccPayment;

            decimal sumDiscountAccPayment = typeOfCostLineItem.DiscountItems.Sum(x => x.AccPayment);
            typeOfCostLineItem.STAccPayment = typeOfCostLineItem.LineItems.Sum(x => x.AccPayment);
            typeOfCostLineItem.TBTAccPayment = typeOfCostLineItem.STAccPayment + sumDiscountAccPayment;

            try
            {
                typeOfCostLineItem.STStatus = typeOfCostLineItem.STAccPayment / typeOfCostLineItem.STContractValue;
            }
            catch (DivideByZeroException ex)
            {
                typeOfCostLineItem.STStatus = 0;
            }
            try
            {
                typeOfCostLineItem.TBTStatus = typeOfCostLineItem.TBTAccPayment / typeOfCostLineItem.TBTContractValue;
            }
            catch (DivideByZeroException ex)
            {
                typeOfCostLineItem.TBTStatus = 0;
            }


            decimal sumContractValue = paymentData.ProjectMasterContract.ProjectMasterContractItems.Sum(x => x.ContractValue);
            decimal sumDiscountValue = paymentData.ProjectMasterContract.DiscountLineItems.Sum(x => x.DiscountValue);
            typeOfCostLineItem.AppPerForRetContractValue = typeOfCostLineItem.TBTContractValue / (sumContractValue + sumDiscountValue);

            decimal sumPrevContractValue = paymentData.ProjectMasterContract.ProjectMasterContractItems.Sum(x => x.PrevAccumulatedAmount);
            decimal sumPrevDiscountValue = paymentData.ProjectMasterContract.DiscountLineItems.Sum(x => x.PrevAccumulatedAmount);
            try
            {
                if (isLastTOC)
                    typeOfCostLineItem.AppPerForRetPrevAccPayment = 1 - sumRet;
                else
                    typeOfCostLineItem.AppPerForRetPrevAccPayment = typeOfCostLineItem.TBTPrevAccPayment / (sumPrevContractValue + sumPrevDiscountValue);
            }
            catch (DivideByZeroException ex)
            {
                typeOfCostLineItem.AppPerForRetPrevAccPayment = 0;
            }

            decimal sumcurrentPayment = paymentData.ProjectMasterContract.ProjectMasterContractItems.Sum(x => x.CurrentPayment);
            decimal sumDiscountPayment = paymentData.ProjectMasterContract.DiscountLineItems.Sum(x => x.CurrentPayment);
            try
            {
                typeOfCostLineItem.AppPerForRetCurrentPayment = typeOfCostLineItem.TBTCurrentPayment / (sumcurrentPayment + sumDiscountPayment);
            }
            catch (DivideByZeroException ex)
            {
                typeOfCostLineItem.AppPerForRetCurrentPayment = 0;
            }
            if (typeOfCostLineItem.TBTCurrentPayment == 0)
            {
                //decimal sumLineContractValue = paymentData.ProjectMasterContract.ProjectMasterContractItems.Sum(x => x.ContractValue);
                //decimal sumDiscContractValue = paymentData.ProjectMasterContract.DiscountLineItems.Sum(x => x.DiscountValue);
                //typeOfCostLineItem.AppPerForRetCurrentPayment = typeOfCostLineItem.TBTContractValue / (sumLineContractValue + sumDiscContractValue);
                if (paymentData.Certificate.CPTotalValueOfWorkDone == 0)
                {
                    typeOfCostLineItem.AppPerForRetCurrentPayment = typeOfCostLineItem.AppPerForRetPrevAccPayment;
                }

            }

            decimal sumAccPayment = paymentData.ProjectMasterContract.ProjectMasterContractItems.Sum(x => x.AccumulatedPayment);
            decimal sumDisAccPayment = paymentData.ProjectMasterContract.DiscountLineItems.Sum(x => x.AccumulatedPayment);
            typeOfCostLineItem.AppPerForRetAccPayment = typeOfCostLineItem.TBTAccPayment / (sumAccPayment + sumDisAccPayment);

            if (paymentData.PreviousCertificate == null)
                typeOfCostLineItem.NRPrevAccPayment = 0;
            else
                typeOfCostLineItem.NRPrevAccPayment = paymentData.PreviousCertificate.NettRetention * typeOfCostLineItem.AppPerForRetPrevAccPayment;

            typeOfCostLineItem.NRCurrentPayment = paymentData.Certificate.CPNettRetention * typeOfCostLineItem.AppPerForRetCurrentPayment;
            typeOfCostLineItem.NRAccPayment = paymentData.Certificate.NettRetention * typeOfCostLineItem.AppPerForRetAccPayment;

            typeOfCostLineItem.ADUCPrevAccPayment = typeOfCostLineItem.TBTPrevAccPayment - typeOfCostLineItem.NRPrevAccPayment;
            typeOfCostLineItem.ADUCCurrentPayment = typeOfCostLineItem.TBTCurrentPayment - typeOfCostLineItem.NRCurrentPayment;
            typeOfCostLineItem.ADUCAccPayment = typeOfCostLineItem.TBTAccPayment - typeOfCostLineItem.NRAccPayment;

            if (gstAmounts == null)
            {
                typeOfCostLineItem.GSTAMountPrevAccPayment = typeOfCostLineItem.ADUCPrevAccPayment * Convert.ToDecimal(costCategory.TaxAmount / 100);
                typeOfCostLineItem.GSTAMountCurrentPayment = typeOfCostLineItem.ADUCCurrentPayment * Convert.ToDecimal(costCategory.TaxAmount / 100);
                typeOfCostLineItem.GSTAMountAccPayment = typeOfCostLineItem.ADUCAccPayment * Convert.ToDecimal(costCategory.TaxAmount / 100);
            }
            else
            {
                typeOfCostLineItem.GSTAMountPrevAccPayment = gstAmounts[0];
                typeOfCostLineItem.GSTAMountCurrentPayment = gstAmounts[1];
                typeOfCostLineItem.GSTAMountAccPayment = gstAmounts[2];
            }

            typeOfCostLineItem.GSTAdjustmentAccPayment = paymentData.Certificate.GSTAdjustment * typeOfCostLineItem.AppPerForRetAccPayment;
            if (paymentData.PreviousCertificate == null)
                typeOfCostLineItem.GSTAdjustmentPrevAccPayment = 0;
            else
                typeOfCostLineItem.GSTAdjustmentPrevAccPayment = paymentData.PreviousCertificate.GSTAdjustment * typeOfCostLineItem.AppPerForRetPrevAccPayment;

            //typeOfCostLineItem.GSTAdjustmentCurrentPayment = typeOfCostLineItem.GSTAdjustmentAccPayment - typeOfCostLineItem.GSTAdjustmentPrevAccPayment;

            typeOfCostLineItem.GSTAdjustmentCurrentPayment = paymentData.Certificate.CPGSTAdjustment * typeOfCostLineItem.AppPerForRetCurrentPayment;


            typeOfCostLineItem.TotalPrevAccPayment = typeOfCostLineItem.ADUCPrevAccPayment + typeOfCostLineItem.GSTAMountPrevAccPayment + typeOfCostLineItem.GSTAdjustmentPrevAccPayment;
            typeOfCostLineItem.TotalCurrentPayment = typeOfCostLineItem.ADUCCurrentPayment + typeOfCostLineItem.GSTAMountCurrentPayment + typeOfCostLineItem.GSTAdjustmentCurrentPayment;
            typeOfCostLineItem.TotalAccPayment = typeOfCostLineItem.ADUCAccPayment + typeOfCostLineItem.GSTAMountAccPayment + typeOfCostLineItem.GSTAdjustmentAccPayment;
            return typeOfCostLineItem;
        }
    }
}
