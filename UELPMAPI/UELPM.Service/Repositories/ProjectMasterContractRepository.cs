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
using UELPM.Util.FileOperations;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class ProjectMasterContractRepository : IProjectMasterContractRepository
    {
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        SharedRepository sharedRepository = null;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public List<CostType> CostTypes()
        {
            try
            {
                var result = this.m_dbconnection.Query<CostType>("CostType_CRUD").ToList();
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateProjectMasterContract(ProjectMasterContract projectMasterContract)
        {
            try
            {

                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var paramaterObj = new DynamicParameters();
                        string poCode = transactionObj.Connection.QueryFirstOrDefault<string>("ProjectContractMasterNew_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        string draftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string popMasterCode = draftCode + ModuleCodes.ProjectMasterContract + "-" + poCode; ;
                        int projectMasterContractId = this.m_dbconnection.QueryFirstOrDefault<int>("ProjectContractMasterNew_CRUD", new
                        {
                            Action = "INSERT",
                            POPMasterCode = popMasterCode,
                            ExpensesTypeId = projectMasterContract.ExpensesTypeId,
                            IsRetentionApplicable = projectMasterContract.IsRetentionApplicable,
                            RetentionMaxLimit = projectMasterContract.RetentionMaxLimit,
                            SupplierId = projectMasterContract.Supplier.SupplierId,
                            ContractStartDate = projectMasterContract.ContractStartDate,
                            ContractEndDate = projectMasterContract.ContractEndDate,
                            CurrencyId = projectMasterContract.CurrencyId,
                            PaymentTermsId = projectMasterContract.PaymentTermsId,
                            OriginalContractSum = projectMasterContract.OriginalContractSum,
                            TotalVOSum = projectMasterContract.TotalVOSum,
                            AdjustedContractSum = projectMasterContract.AdjustedContractSum,
                            RetentionSupplierCode = projectMasterContract.RetentionSupplierCode,
                            ServiceTypeId = projectMasterContract.ServiceType,
                            TaxAuthorityId = projectMasterContract.TaxAuthorityId,
                            TaxId = projectMasterContract.TaxId,
                            Remarks = projectMasterContract.Remarks,
                            CreatedBy = projectMasterContract.CreatedBy,
                            CreatedDate = DateTime.Now,
                            WorkFlowStatusId = projectMasterContract.WorkFlowStatusId,
                            ProjectName = projectMasterContract.ProjectName,
                            CompanyId = projectMasterContract.CompanyId,
                            RetentionPercentage = projectMasterContract.RetentionPercentage,
                            LocationId = projectMasterContract.LocationId,
                            SupplierSubCodeId = projectMasterContract.SupplierSubCodeId,
                            RetentionTypeId = projectMasterContract.RetentionTypeId,
                            ContractDescription = projectMasterContract.ContractDescription
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);


                        #region  we are saving purchase order master contract items...
                        if (projectMasterContract.ProjectMasterContractItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of project master contract items...
                            foreach (var record in projectMasterContract.ProjectMasterContractItems)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@POPId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemId", record.ItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemTypeId", 1, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                if (record.Expense.AccountCodeId > 0)
                                {
                                    itemObj.Add("@AccountCodeId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                }
                                itemObj.Add("@AccountCodeCategoryId", record.Expense.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@TypeOfCostName", record.TypeOfCostName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ApportionmentMethod", record.ApportionmentMethod, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectMasterContractItems_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region  we are saving purchase order master discount line items...
                        if (projectMasterContract.DiscountLineItems != null)
                        {

                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of project master contract items...
                            foreach (var record in projectMasterContract.DiscountLineItems)
                            {
                                if (record.DisItemDescription.Length > 0)
                                {


                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@POPId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ItemId", record.ItemId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ItemTypeId", 2, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                                    if (record.Expense.AccountCodeId > 0)
                                    {
                                        itemObj.Add("@AccountCodeId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                    }
                                    itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                                    if (record.Expense != null)
                                    {
                                        itemObj.Add("@AccountCodeCategoryId", record.Expense.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);

                                    }
                                    itemObj.Add("@ContractValue", record.DiscountValue, DbType.Decimal, ParameterDirection.Input);
                                    itemObj.Add("@TypeOfCostName", record.DisTypeOfCostName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@ApportionmentMethod", record.DisApportionmentMethod, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                    itemToAdd.Add(itemObj);
                                }
                            }

                            var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectMasterContractItems_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        //#region  we are saving departments...
                        //if (projectMasterContract.Departments != null)
                        //{
                        //    List<DynamicParameters> depToAdd = new List<DynamicParameters>();
                        //    //looping through the list of departments...
                        //    foreach (var record in projectMasterContract.Departments)
                        //    {
                        //        var itemObj = new DynamicParameters();
                        //        itemObj.Add("@Action", "INSERTDEPARTMENT", DbType.String, ParameterDirection.Input);
                        //        itemObj.Add("@ProjectMasterContractId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                        //        itemObj.Add("@DepartmentId", record.LocationID, DbType.Int32, ParameterDirection.Input);
                        //        itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        //        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                        //        depToAdd.Add(itemObj);
                        //    }
                        //    var projectMasterContractItemsSaveResult = this.m_dbconnection.Execute("ProjectMasterContract_CRUD", depToAdd, transaction: transactionObj,
                        //                                        commandType: CommandType.StoredProcedure);
                        //}
                        //#endregion
                        List<DynamicParameters> categoriesToAdd = new List<DynamicParameters>();
                        #region  we are saving type of cost category...
                        if (projectMasterContract.POPCostCategory != null)
                        {

                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPCostCategory)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TypeOfCost", record.TypeOfCost, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CostDescription", record.CostDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_Cost", record.GL_Cost, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GST_Group", record.GST_Group, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GST_Class", record.GST_Class, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_Retention", record.GL_Retention, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_GroupRetention", record.GL_GroupRetention, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_ClassRetention", record.GL_ClassRetention, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Prefix", record.Prefix, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@POPCostCategoryId", dbType: DbType.Int32, direction: ParameterDirection.Output);

                                categoriesToAdd.Add(itemObj);
                            }
                            var projectMasterContractCategorySaveResult = this.m_dbconnection.Execute("ProjectMasterContractCostCategory_CRUD", categoriesToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        #region  we are saving apportionment details...
                        if (projectMasterContract.POPApportionment != null)
                        {
                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPApportionment)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Method", record.Method, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Remarks", record.Remarks, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@POPApportionmentId", dbType: DbType.Int32, direction: ParameterDirection.Output);
                                this.m_dbconnection.Execute("POPApportionment_CRUD", itemObj, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                record.POPApportionmentId = itemObj.Get<int>("@POPApportionmentId");
                            }


                            List<DynamicParameters> apportionmentDetailsToAdd = new List<DynamicParameters>();
                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPApportionment)
                            {
                                foreach (var record2 in record.ApportionmentDetails)
                                {
                                    var popCostCategoryId = categoriesToAdd.Where(j => j.Get<string>("@TypeOfCost") == record2.TypeOfCost).Select(k => k.Get<int>("@POPCostCategoryId")).FirstOrDefault();
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERTDETAIL", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@POPApportionmentId", record.POPApportionmentId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@POPCostCategoryId", popCostCategoryId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@Amount", record2.Amount, DbType.Decimal, ParameterDirection.Input);
                                    apportionmentDetailsToAdd.Add(itemObj);
                                }
                            }
                            var apportionmentDetailsSaveResult = this.m_dbconnection.Execute("POPApportionment_CRUD", apportionmentDetailsToAdd, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        #region  we are saving distribution summary items...
                        if (projectMasterContract.POPDistributionSummaryItems != null)
                        {
                            List<DynamicParameters> distributionItemsToAdd = new List<DynamicParameters>();
                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPDistributionSummaryItems)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DepartmentId", record.DepartmentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DisturbutionPercentage", record.DistributionPercentage, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@ContractAmount", record.ContractAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@ThisCerification", record.ThisCerification, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@RetentionAmount", record.RetentionAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@RetentionCode", record.RetentionCode, DbType.String, ParameterDirection.Input);

                                distributionItemsToAdd.Add(itemObj);
                            }
                            var projectMasterContractDistributionSummarySaveResult = this.m_dbconnection.Execute("POPDistributionSummary_CRUD", distributionItemsToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = projectMasterContract.SupplierAddress,
                            CompanyId = projectMasterContract.CompanyId,
                            DocumentId = projectMasterContractId,
                            ProcessId = (int)WorkFlowProcessTypes.ProjectMasterContract
                        }, transactionObj);
                        #endregion
                        #region saving files here...
                        if (projectMasterContract.files != null)
                        {
                            try
                            {
                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.ProjectMasterContract,
                                    Files = projectMasterContract.files,
                                    UniqueId = projectMasterContractId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < projectMasterContract.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ProjectMasterContract), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", projectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", projectMasterContract.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
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
                        #endregion
                        //commiting the transaction...

                        //UserProfileRepository userProfileRepository = new UserProfileRepository();
                        //string UserName = userProfileRepository.GetUserById(projectMasterContract.CreatedBy).UserName;
                        //if (string.IsNullOrEmpty(projectMasterContract.POPMasterCode) && !string.IsNullOrEmpty(projectMasterContract.POPMasterCode))
                        //{
                        //    AuditLog.Info("ProjectMasterContractCreation", "create", projectMasterContract.CreatedBy.ToString(), projectMasterContract.ProjectMasterContractId.ToString(), "CreateProjectMasterContract", "Project Master Contract " + popMasterCode + " with draft status created by " + UserName + "", projectMasterContract.CompanyId);
                        //}
                        //else
                        //{
                        //    AuditLog.Info("ProjectMasterContractCreation", "create", projectMasterContract.CreatedBy.ToString(), projectMasterContract.ProjectMasterContractId.ToString(), "CreateProjectMasterContract", "Project Master Contract " + projectMasterContract.POPMasterCode + " created by " + UserName + "", projectMasterContract.CompanyId);
                        //}
                        if (projectMasterContract.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(projectMasterContract.CreatedBy);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            DateTime now = DateTime.Now;
                            if (projectMasterContract.WorkFlowStatusId != (int)WorkFlowStatus.ApprovalInProgress)
                            {
                                AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "create", projectMasterContract.CreatedBy.ToString(), projectMasterContractId.ToString(), "CreatePOP", "Created by " + UserName + " on " + now + "", projectMasterContract.CompanyId);
                                AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "create", projectMasterContract.CreatedBy.ToString(), projectMasterContractId.ToString(), "CreatePOP", "Saved as Draft " + UserName + " on " + now + "", projectMasterContract.CompanyId);
                            }
                        }
                        #region
                        if (projectMasterContract.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            projectMasterContract.ProjectMasterContractId = projectMasterContractId;
                            new SharedRepository().SendForApproval(new WorkFlowParameter
                            {
                                CompanyId = projectMasterContract.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                                Value = Convert.ToString(projectMasterContract.AdjustedContractSum),
                                DocumentId = projectMasterContract.ProjectMasterContractId,
                                CreatedBy = projectMasterContract.CreatedBy,
                                DocumentCode = projectMasterContract.POPMasterCode,
                                ItemCategory = "",
                                ItemQuantity = "0",
                                WorkFlowStatusId = projectMasterContract.WorkFlowStatusId,
                                LocationId = projectMasterContract.LocationId
                            }, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        return projectMasterContractId;
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

        public int DeleteProjectMasterContract(ProjectMasterContract projectMasterContract)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ProjectContractMasterNew_CRUD",
                    new
                    {
                        Action = "DELETE",
                        ProjectMasterContractId = projectMasterContract.ProjectMasterContractId,
                        CreatedBy = projectMasterContract.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ProjectMasterContract GetProjectMasterContractDetails(int projectMasterContractId)
        {
            try
            {
                ProjectMasterContract projectMasterContractObj = new ProjectMasterContract();
                if (projectMasterContractId > 0)
                {
                    using (var result = this.m_dbconnection.QueryMultiple("ProjectContractMasterNew_CRUD", new
                    {
                        Action = "SELECTBYID",
                        ProjectMasterContractId = projectMasterContractId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract)
                    }, commandType: CommandType.StoredProcedure))
                    {
                        var POP = result.Read<ProjectMasterContract>().First();
                        var Supplier = result.Read<Suppliers>().FirstOrDefault();
                        var supplierSC = result.Read<SupplierSubCode>().FirstOrDefault();
                        //project mater contract details..
                        //projectMasterContractObj = result.Read<ProjectMasterContract, Suppliers, SupplierSubCode, ProjectMasterContract>((Pc, Su, Ssc) =>
                        //{
                        //    Pc.Supplier = Su;
                        //    Pc.SupplierSubCode = Ssc;
                        //    return Pc;
                        //}, splitOn: "SupplierId, SubCodeId").FirstOrDefault();
                        projectMasterContractObj = POP;
                        projectMasterContractObj.Supplier = Supplier;
                        projectMasterContractObj.SupplierSubCode = supplierSC;

                        if (projectMasterContractObj != null)
                        {
                            //projectMasterContractObj.Departments = result.Read<Locations>().ToList();
                            // projectMasterContractObj.ProjectMasterContractItems = result.Read<ProjectMasterContractItems>().ToList();
                            List<ProjectMasterContractItems> allProjectMasterLineItems = result.Read<ProjectMasterContractItems>().Where(x => x.ItemTypeId == 1).ToList();
                            List<DiscountLineItems> allDiscountLineItems = result.Read<DiscountLineItems>().Where(x => x.ItemTypeId == 2).ToList();
                            //List<ProjectMasterContractItems> allProjectMasterLineItems = result.Read<ProjectMasterContractItems, AccountCode, ProjectMasterContractItems>((Pc, Ac) =>
                            //{

                            //    if (Ac != null && Ac.AccountCodeId > 0)
                            //    {
                            //        Pc.Expense = Ac;
                            //    }
                            //    else
                            //    {
                            //        Pc.Expense = new AccountCode() { AccountCodeId = 0, Description = "" };
                            //    }
                            //    return Pc;
                            //}, splitOn: "AccountCodeId").Where(x => x.ItemTypeId == 1).ToList();
                            //List<DiscountLineItems> allDiscountLineItems = result.Read<DiscountLineItems, AccountCode, DiscountLineItems>((Dc, Ac) =>
                            //{

                            //    if (Ac != null && Ac.AccountCodeId > 0)
                            //    {
                            //        Dc.Expense = Ac;
                            //    }
                            //    else
                            //    {
                            //        Dc.Expense = new AccountCode() { AccountCodeId = 0, Description = "" };
                            //    }
                            //    return Dc;
                            //}, splitOn: "AccountCodeId").Where(x => x.ItemTypeId == 2).ToList();
                            projectMasterContractObj.ProjectMasterContractItems = allProjectMasterLineItems;

                            projectMasterContractObj.DiscountLineItems = allDiscountLineItems;

                            projectMasterContractObj.POPCostCategory = result.Read<POPCostCategory>().ToList();
                            projectMasterContractObj.POPApportionment = result.Read<POPApportionment>().ToList();

                            var apportionmentDetails = result.Read<ApportionmentDetails>().ToList();

                            projectMasterContractObj.POPApportionment.ForEach(data =>
                            {
                                data.ApportionmentDetails = apportionmentDetails.Where(k => k.POPApportionmentId == data.POPApportionmentId).ToList();
                                data.Total = data.ApportionmentDetails.Sum(k => k.Amount);
                            });
                            projectMasterContractObj.POPDistributionSummaryItems = result.Read<POPDistributionSummary>().ToList();

                            //projectMasterContractObj.POPDistributionSummaryItems = result.Read<POPDistributionSummary, Companies, POPDistributionSummary>((Pc, Su) =>
                            //                                                        {
                            //                                                            Pc.Company = Su;
                            //                                                            return Pc;
                            //                                                        }, splitOn: "CompanyId").ToList();

                            UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                            if (currentApproverDetails != null)
                            {
                                //updated approver user name and approver user id...
                                projectMasterContractObj.CurrentApproverUserId = currentApproverDetails.UserID;
                                projectMasterContractObj.CurrentApproverUserName = currentApproverDetails.UserName;
                            }

                            //projectMasterContractObj.CertificateNumber = result.ReadFirstOrDefault<int>();
                        }

                        decimal subTotal = 0;
                        decimal discountTotal = 0;
                        subTotal = projectMasterContractObj.ProjectMasterContractItems.Sum(i => i.ContractValue);
                        projectMasterContractObj.SubTotal = subTotal;
                        discountTotal = projectMasterContractObj.DiscountLineItems.Sum(i => i.DiscountValue);
                        projectMasterContractObj.TotalBefTax = subTotal + discountTotal;
                        decimal? totalTax = ((projectMasterContractObj.TotalBefTax) * projectMasterContractObj.TaxAmount / 100);
                        totalTax = totalTax != null ? Convert.ToDecimal(string.Format("{0:0.00}", totalTax)) : 0.00M;
                        projectMasterContractObj.TotalTax = totalTax;

                        projectMasterContractObj.TotalAmount = projectMasterContractObj.TotalBefTax + (totalTax == null ? 0 : Convert.ToDecimal(totalTax));

                    }

                    if (projectMasterContractObj != null)
                    {
                        projectMasterContractObj.ContractTerms = GetContractTerms(projectMasterContractObj.ContractStartDate, projectMasterContractObj.ContractEndDate);
                        projectMasterContractObj.WorkFlowComments = new List<WorkflowAuditTrail>();
                        projectMasterContractObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                        {
                            Documentid = projectMasterContractObj.ProjectMasterContractId,
                            ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                            DocumentUserId = projectMasterContractObj.CreatedBy,
                            UserId = Convert.ToInt32(projectMasterContractObj.CreatedBy)
                        }).ToList();
                        if (projectMasterContractObj.WorkFlowComments != null)
                        {
                            var cancelReasons = projectMasterContractObj.WorkFlowComments.Where(x => x.Statusid == (int)WorkFlowStatus.CancelledApproval).ToList();
                            var wfComments = projectMasterContractObj.WorkFlowComments.Where(x => x.Statusid != (int)WorkFlowStatus.CancelledApproval).ToList();
                            projectMasterContractObj.ReasonsToCancel = cancelReasons.Select(x => x.Remarks).ToArray();
                            if (projectMasterContractObj.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                            {
                                projectMasterContractObj.ReasonsToReject = wfComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                            }
                        }
                    }
                    if (projectMasterContractObj != null)
                    {
                        var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                        {
                            Action = "SELECT",
                            RecordId = projectMasterContractId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.ProjectMasterContract) //static value need to change

                        }, commandType: CommandType.StoredProcedure);

                        projectMasterContractObj.Attachments = attachments.ToList();
                    }
                    this.sharedRepository = new SharedRepository();
                    DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.ProjectMasterContract, projectMasterContractId, projectMasterContractObj.CompanyId);
                    projectMasterContractObj.SupplierAddress = address == null ? string.Empty : address.Address;
                }
                return projectMasterContractObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ProjectMasterContractDisplayResult GetProjectMasterContracts(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ProjectMasterContractDisplayResult projectMasterContractDisplayResult = new ProjectMasterContractDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractMasterNew_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId,
                    UserId = gridDisplayInput.UserId
                }, commandType: CommandType.StoredProcedure))
                {
                    //projectMasterContractDisplayResult.ProjectMasterContractList = result.Read<ProjectMasterContract>().AsList();
                    //if (gridDisplayInput.Take > 0)
                    //{
                    //    projectMasterContractDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //}

                    projectMasterContractDisplayResult.ProjectMasterContractList = result.Read<ProjectMasterContract, Suppliers, ProjectMasterContract>((Pc, Su) =>
                    {

                        Pc.Supplier = Su;

                        return Pc;
                    }, splitOn: "SupplierId").ToList();
                    //total number of purchase orders
                    projectMasterContractDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return projectMasterContractDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public ProjectMasterContractDisplayResult GetProjectMasterContractsForApproval(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ProjectMasterContractDisplayResult projectMasterContractDisplayResult = new ProjectMasterContractDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractMasterNew_CRUD", new
                {
                    Action = "SELECTAPPROVALLIST",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId,
                    ApproverUserId = gridDisplayInput.UserId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract)
                }, commandType: CommandType.StoredProcedure))
                {
                    projectMasterContractDisplayResult.ProjectMasterContractList = result.Read<ProjectMasterContract>().ToList();
                    if (gridDisplayInput.Take > 0)
                    {
                        projectMasterContractDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return projectMasterContractDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public int UpdateProjectMasterContract(ProjectMasterContract projectMasterContract)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {

                        #region purchase order updation...

                        var updateResult = this.m_dbconnection.Query<int>("ProjectContractMasterNew_CRUD",
                                new
                                {
                                    Action = "UPDATE",
                                    ProjectMasterContractId = projectMasterContract.ProjectMasterContractId,
                                    ExpensesTypeId = projectMasterContract.ExpensesTypeId,
                                    IsRetentionApplicable = projectMasterContract.IsRetentionApplicable,
                                    RetentionMaxLimit = projectMasterContract.RetentionMaxLimit,
                                    SupplierId = projectMasterContract.Supplier.SupplierId,
                                    ContractStartDate = projectMasterContract.ContractStartDate,
                                    ContractEndDate = projectMasterContract.ContractEndDate,
                                    OriginalContractSum = projectMasterContract.OriginalContractSum,
                                    CurrencyId = projectMasterContract.CurrencyId,
                                    PaymentTermsId = projectMasterContract.PaymentTermsId,
                                    TotalVOSum = projectMasterContract.TotalVOSum,
                                    AdjustedContractSum = projectMasterContract.AdjustedContractSum,
                                    RetentionSupplierCode = projectMasterContract.RetentionSupplierCode,
                                    ServiceTypeId = projectMasterContract.ServiceType,
                                    TaxAuthorityId = projectMasterContract.TaxAuthorityId,
                                    TaxId = projectMasterContract.TaxId,
                                    Remarks = projectMasterContract.Remarks,
                                    CreatedBy = projectMasterContract.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    WorkFlowStatusId = projectMasterContract.WorkFlowStatusId,
                                    ProjectName = projectMasterContract.ProjectName,
                                    CompanyId = projectMasterContract.CompanyId,
                                    RetentionPercentage = projectMasterContract.RetentionPercentage,
                                    LocationId = projectMasterContract.LocationId,
                                    SupplierSubCodeId = projectMasterContract.SupplierSubCodeId,
                                    RetentionTypeId = projectMasterContract.RetentionTypeId,
                                    ContractDescription = projectMasterContract.ContractDescription
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                        #endregion
                        #region we are saving project master contract items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in projectMasterContract.ProjectMasterContractItems.Where(i => i.ProjectMasterContractItemId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();


                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@POPId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            if (record.Expense.AccountCodeId > 0)
                            {
                                itemObj.Add("@AccountCodeId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            }
                            itemObj.Add("@AccountCodeCategoryId", record.Expense.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@ItemTypeId", 1, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TypeOfCostName", record.TypeOfCostName, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.ApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }

                        //var projectMasterContractSaveResult = this.m_dbconnection.Execute("[ProjectMasterContractItems_CRUD]", itemToAdd,
                        //                                            transaction: transactionObj,
                        //                                            commandType: CommandType.StoredProcedure);


                        #endregion

                        #region  we are saving purchase order master discount line items...
                        //  List<DynamicParameters> itemToAdd1 = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in projectMasterContract.DiscountLineItems.Where(i => i.ProjectMasterContractItemId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();


                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@POPId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                            //if (record.Expense != null)
                            //{
                            //    itemObj.Add("@AccountCodeId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            //}
                            //if (record.Expense != null)
                            //{
                            //    itemObj.Add("@AccountCodeCategoryId", record.Expense.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            //}
                            itemObj.Add("@ContractValue", record.DiscountValue, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TypeOfCostName", record.DisTypeOfCostName, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.DisApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemTypeId", 2, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }

                        var projectMasterContractSaveResult1 = this.m_dbconnection.Execute("[ProjectMasterContractItems_CRUD]", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);

                        #endregion

                        #region updating project master contract items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in projectMasterContract.ProjectMasterContractItems.Where(i => i.ProjectMasterContractItemId > 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@POPId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            if (record.Expense != null && record.Expense.AccountCodeId > 0)
                            {
                                itemObj.Add("@AccountCodeId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            }
                            itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ContractValue", record.ContractValue, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TypeOfCostName", record.TypeOfCostName, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.ApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemsToUpdate.Add(itemObj);
                        }
                        //var projectMasterContractUpdateResult = this.m_dbconnection.Execute("[ProjectMasterContractItems_CRUD]", itemsToUpdate,
                        //                                            transaction: transactionObj,
                        //                                            commandType: CommandType.StoredProcedure);
                        #endregion

                        #region updating project master discount line items...

                        // List<DynamicParameters> itemsToUpdate1 = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in projectMasterContract.DiscountLineItems.Where(i => i.ProjectMasterContractItemId > 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@POPId", record.ProjectMasterContractItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.DisItemDescription, DbType.String, ParameterDirection.Input);
                            //if (record.Expense != null && record.Expense.AccountCodeId > 0)
                            //{
                            //    itemObj.Add("@AccountCodeId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            //}
                            //itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ContractValue", record.DiscountValue, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TypeOfCostName", record.DisTypeOfCostName, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ApportionmentMethod", record.DisApportionmentMethod, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemsToUpdate.Add(itemObj);
                        }
                        var projectMasterContractUpdateResult1 = this.m_dbconnection.Execute("[ProjectMasterContractItems_CRUD]", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting project master contract items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (projectMasterContract.ProjectMasterContractItemsToDelete != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var purchaseOrderItemId in projectMasterContract.ProjectMasterContractItemsToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@POPId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToDelete.Add(itemObj);
                            }
                        }

                        if (projectMasterContract.ProjectMasterDiscountItemsToDelete != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var purchaseOrderItemId in projectMasterContract.ProjectMasterDiscountItemsToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@POPId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToDelete.Add(itemObj);
                            }
                        }

                        var projectMasterContractDeleteResult = this.m_dbconnection.Execute("ProjectMasterContractItems_CRUD", itemsToDelete,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting attachments
                        //looping through attachments
                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                        if (projectMasterContract.Attachments != null)
                        {
                            for (var i = 0; i < projectMasterContract.Attachments.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@AttachmentTypeId", projectMasterContract.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@AttachmentId", projectMasterContract.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                fileToDelete.Add(fileObj);
                                var purchaseOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                      commandType: CommandType.StoredProcedure);
                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.ProjectMasterContract,
                                    FilesNames = projectMasterContract.Attachments.Select(j => j.FileName).ToArray(),
                                    UniqueId = projectMasterContract.ProjectMasterContractId.ToString()
                                });
                            }
                        }
                        #endregion

                        #region deleting pop apportionments...
                        var itemdelete = new DynamicParameters();
                        itemdelete.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                        itemdelete.Add("@ProjectMasterContractId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                        this.m_dbconnection.Execute("POPApportionment_CRUD", itemdelete, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        #endregion

                        #region  we are saving type of cost category...
                        List<DynamicParameters> categoriesToAdd = new List<DynamicParameters>();
                        if (projectMasterContract.POPCostCategory != null)
                        {
                            foreach (var record in projectMasterContract.POPCostCategory)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TypeOfCost", record.TypeOfCost, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CostDescription", record.CostDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_Cost", record.GL_Cost, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_Cost_Description", record.GL_Cost_Description, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GST_Group", record.GST_Group, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GST_Class", record.GST_Class, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_Retention", record.GL_Retention, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_Retention_Description", record.GL_Retention_Description, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_GroupRetention", record.GL_GroupRetention, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GL_ClassRetention", record.GL_ClassRetention, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Prefix", record.Prefix, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@POPCostCategoryId", dbType: DbType.Int32, direction: ParameterDirection.Output);

                                categoriesToAdd.Add(itemObj);
                            }
                            var projectMasterContractCategorySaveResult = this.m_dbconnection.Execute("ProjectMasterContractCostCategory_CRUD", categoriesToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region  we are saving apportionment details...
                        if (projectMasterContract.POPApportionment != null)
                        {

                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPApportionment)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Method", record.Method, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Remarks", record.Remarks, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@POPApportionmentId", dbType: DbType.Int32, direction: ParameterDirection.Output);
                                this.m_dbconnection.Execute("POPApportionment_CRUD", itemObj, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                record.POPApportionmentId = itemObj.Get<int>("@POPApportionmentId");
                            }
                            List<DynamicParameters> apportionmentDetailsToAdd = new List<DynamicParameters>();
                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPApportionment)
                            {
                                foreach (var record2 in record.ApportionmentDetails)
                                {
                                    var popCostCategoryId = categoriesToAdd.Where(j => j.Get<string>("@TypeOfCost") == record2.TypeOfCost).Select(k => k.Get<int>("@POPCostCategoryId")).FirstOrDefault();
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERTDETAIL", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@POPApportionmentId", record.POPApportionmentId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@POPCostCategoryId", popCostCategoryId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@Amount", record2.Amount, DbType.Decimal, ParameterDirection.Input);
                                    apportionmentDetailsToAdd.Add(itemObj);
                                }
                            }
                            var apportionmentDetailsSaveResult = this.m_dbconnection.Execute("POPApportionment_CRUD", apportionmentDetailsToAdd, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region  we are saving distribution summary items...
                        if (projectMasterContract.POPDistributionSummaryItems != null)
                        {
                            List<DynamicParameters> distributionItemsToAdd = new List<DynamicParameters>();
                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPDistributionSummaryItems.Where(j => j.DisturbutionSummaryId == 0))
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DepartmentId", record.DepartmentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DisturbutionPercentage", record.DistributionPercentage, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@ContractAmount", record.ContractAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@ThisCerification", record.ThisCerification, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@RetentionAmount", record.RetentionAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@RetentionCode", record.RetentionCode, DbType.String, ParameterDirection.Input);


                                distributionItemsToAdd.Add(itemObj);
                            }
                            var projectMasterContractDistributionSummarySaveResult = this.m_dbconnection.Execute("POPDistributionSummary_CRUD", distributionItemsToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region  we are updating distribution summary items...
                        if (projectMasterContract.POPDistributionSummaryItems != null)
                        {
                            List<DynamicParameters> distributionItemsToUpdate = new List<DynamicParameters>();
                            //looping through the list of pop cost categories....
                            foreach (var record in projectMasterContract.POPDistributionSummaryItems.Where(j => j.DisturbutionSummaryId > 0))
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ProjectMasterContractId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DistributionSummaryId", record.DisturbutionSummaryId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DepartmentId", record.DepartmentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@DisturbutionPercentage", record.DistributionPercentage, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@ContractAmount", record.ContractAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@ThisCerification", record.ThisCerification, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@RetentionAmount", record.RetentionAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@RetentionCode", record.RetentionCode, DbType.String, ParameterDirection.Input);


                                distributionItemsToUpdate.Add(itemObj);
                            }
                            var projectMasterContractDistributionSummaryUpdateResult = this.m_dbconnection.Execute("POPDistributionSummary_CRUD", distributionItemsToUpdate, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region deleting pop distributions list....

                        List<DynamicParameters> popDistributionToDelete = new List<DynamicParameters>();

                        if (projectMasterContract.POPDistributionSummaryToDelete != null)
                        {
                            //looping through the list of distribution summaries...
                            foreach (var disturbutionSummaryId in projectMasterContract.POPDistributionSummaryToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@DistributionSummaryId", disturbutionSummaryId, DbType.Int32, ParameterDirection.Input);

                                popDistributionToDelete.Add(itemObj);
                            }
                        }

                        var popDistributionListDeleteResult = this.m_dbconnection.Execute("POPDistributionSummary_CRUD", popDistributionToDelete,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = projectMasterContract.SupplierAddress,
                            CompanyId = projectMasterContract.CompanyId,
                            DocumentId = projectMasterContract.ProjectMasterContractId,
                            ProcessId = (int)WorkFlowProcessTypes.ProjectMasterContract
                        }, transactionObj);
                        #endregion

                        #region saving files here...
                        if (projectMasterContract.files != null)
                        {
                            try
                            {
                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.ProjectMasterContract,
                                    Files = projectMasterContract.files,
                                    UniqueId = projectMasterContract.ProjectMasterContractId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < projectMasterContract.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ProjectMasterContract), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", projectMasterContract.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", projectMasterContract.CreatedBy, DbType.Int32, ParameterDirection.Input);
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
                        #endregion
                        //commiting the transaction...
                        #region
                        //if (projectMasterContract.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        //{
                        //    new SharedRepository().SendForApproval(new WorkFlowParameter
                        //    {
                        //        CompanyId = projectMasterContract.CompanyId,
                        //        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                        //        Value =Convert.ToString(projectMasterContract.AdjustedContractSum),
                        //        DocumentId = projectMasterContract.ProjectMasterContractId,
                        //        CreatedBy = projectMasterContract.CreatedBy,
                        //        DocumentCode = projectMasterContract.POPMasterCode,
                        //        ItemCategory = "",
                        //        ItemQuantity = "0",
                        //        WorkFlowStatusId = projectMasterContract.WorkFlowStatusId,
                        //        LocationId = projectMasterContract.LocationId
                        //    }, false, transactionObj, this.m_dbconnection);
                        //}
                        //else
                        //{
                        //  transactionObj.Commit();
                        // }

                        if (projectMasterContract.IsVerifier)
                        {
                            int approvalCount = 0;
                            int status = 0;
                            string approvalStatus = string.Empty;
                            workFlowConfigRepository = new WorkFlowConfigurationRepository();
                            int deletedWorkFlowId = 0;
                            var approverList = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD",
                         new
                         {
                             Action = "VERIFY_IS_VERIFIER",
                             DocumentId = projectMasterContract.ProjectMasterContractId,
                             ProcessId = WorkFlowProcessTypes.ProjectMasterContract,
                             CompanyId = projectMasterContract.CompanyId,
                             PageName = "Project Contract Master"
                         }, transaction: transactionObj,
                         commandType: CommandType.StoredProcedure).ToList();

                            var verificationApprover = approverList.Where(app => app.IsSupplierVerrfier == true).FirstOrDefault();
                            int count = 0;
                            var updatedApproverList = this.workFlowConfigRepository.GetWorkFlowApprovers(new WorkFlowParameter
                            {
                                CompanyId = projectMasterContract.CompanyId,
                                LocationId = projectMasterContract.LocationId,
                                DocumentId = projectMasterContract.ProjectMasterContractId,
                                ProcessId = (int)WorkFlowProcessTypes.ProjectMasterContract,
                                Value = projectMasterContract.AdjustedContractSum.ToString()
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
                                    //if (supplier.WorkFlowDetails.IsCreditLimitChanged && isCreditLimit != null)
                                    //{
                                    approvalCount = approverList.Count;
                                    List<DynamicParameters> itemToAddWF = new List<DynamicParameters>();
                                    foreach (var approver in approverList)
                                    {
                                        if (verificationApprover != null && verificationApprover.NextValue != null)
                                        {
                                            if (verificationApprover.NextValue == approver.ApproverUserId)
                                            {
                                                if (projectMasterContract.OriginalContractSum == 0)
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

                                    //checking supplier credit limit                             

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
                                                //status = Convert.ToInt32(WorkFlowStatus.Initiated);

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
                                            itemObj.Add("@DocumentId", projectMasterContract.ProjectMasterContractId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@ProcessId", updatedApprover.ProcessId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CompanyId", projectMasterContract.CompanyId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@ApproverUserId", updatedApprover.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@WorkFlowOrder", updatedApprover.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@WorkFlowStatusId", status, DbType.Int32, ParameterDirection.Input);
                                            itemToAddWF.Add(itemObj);
                                            count = 0;

                                        }

                                    }



                                    var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", itemToAddWF, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                    //}
                                }
                            }
                        }
                        if (projectMasterContract.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress) && projectMasterContract.Action == "send")
                        {
                            SendForApproval(projectMasterContract, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user = userProfileRepository.GetUserById(projectMasterContract.CreatedBy);
                        string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        DateTime now = DateTime.Now;
                        if (string.IsNullOrEmpty(projectMasterContract.POPMasterCode) && !string.IsNullOrEmpty(projectMasterContract.DraftCode))
                        {
                            AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "update", projectMasterContract.CreatedBy.ToString(), projectMasterContract.ProjectMasterContractId.ToString(), "UpdateProjectMasterContract", "Project Contract Master updated by " + UserName + " on " + now + "", projectMasterContract.CompanyId);

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

        public void SendForApproval(ProjectMasterContract projectMasterContract, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {
            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                workFlowConfigRepository = new WorkFlowConfigurationRepository();
                SharedRepository sharedRepository = new SharedRepository();
                sharedRepository.SendForApproval(new WorkFlowParameter
                {
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                    CompanyId = projectMasterContract.CompanyId,
                    Value = Convert.ToString(projectMasterContract.AdjustedContractSum),
                    DocumentId = projectMasterContract.ProjectMasterContractId,
                    CreatedBy = projectMasterContract.CreatedBy,
                    DocumentCode = projectMasterContract.POPMasterCode,
                    WorkFlowStatusId = projectMasterContract.WorkFlowStatusId,
                    LocationId = Convert.ToInt32(projectMasterContract.LocationId),
                }, false, dbTransaction, dbConnection);
                //IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>(){
                //               new  WorkFlowParameter{
                //                    ProcessId =Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                //                    CompanyId = projectMasterContract.CompanyId,
                //                    Value = Convert.ToString(projectMasterContract.AdjustedContractSum),
                //                    DocumentId = projectMasterContract.ProjectMasterContractId,
                //                    CreatedBy = projectMasterContract.CreatedBy,
                //                    DocumentCode =projectMasterContract.POPMasterCode,
                //                    WorkFlowStatusId = projectMasterContract.WorkFlowStatusId,
                //                    LocationId = Convert.ToInt32(projectMasterContract.LocationId),
                //               }
                //            }, dbTransaction, dbConnection);



                //DateTime now = DateTime.Now;
                //UserProfileRepository userProfileRepository = new UserProfileRepository();
                //var user = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                //string Workflowname = string.Format("{0} {1}", user.FirstName, user.LastName);



            }
            catch (Exception e)
            {
                if (isFromUi == true)
                {
                    dbTransaction.Rollback();
                    dbTransaction.Dispose();
                }
                throw e;
            }
        }


        public ProjectMasterContractDisplayResult GetProjectMasterContractsSearchResult(ProjectMasterContractSearch projectMasterContractSearch)
        {
            try
            {
                ProjectMasterContractDisplayResult projectMasterContractDisplayResult = new ProjectMasterContractDisplayResult();
                string searchQuery = "";
                //getting contract asset purchase orders...
                searchQuery = @" 
                                        from
		                                    dbo.ProjectMasterContract as PMC
	                                    join
		                                    dbo.WorkFlowStatus as WFS
		                                    ON
		                                    pmc.WorkFlowStatusId = wfs.WorkFlowStatusid join Supplier S ON PMC.SupplierId = s.SupplierId ";
                if (projectMasterContractSearch.IsApprovalPage == true)
                {

                    searchQuery += @" join
	                                (
	                                    SELECT *  FROM  dbo.GetWorkFlowDocuments(@ApproverUserId,str(@ProcessId))
	                                ) as db on
	                                PMC.ProjectMasterContractId = db.DocumentId";
                }
                searchQuery += @" where ";

                if (projectMasterContractSearch.ProjectMasterContractId > 0)
                {
                    searchQuery += "PMC.ProjectMasterContractId = @ProjectMasterContractId  and ";
                }
                else if (projectMasterContractSearch.Supplier != null && projectMasterContractSearch.Supplier.SupplierId > 0)
                {
                    searchQuery += "PMC.SupplierId = @SupplierId and ";
                }

                if (projectMasterContractSearch.DocumentCode != "" && projectMasterContractSearch.DocumentCode != null && projectMasterContractSearch.DocumentCode != "null")
                {
                    searchQuery += @"( 
                                                PMC.POPMasterCode LIKE concat('%',@DocumentCode,'%')
                                               
                                            )
                                            and ";
                }
                else if (projectMasterContractSearch.FromDate != null && projectMasterContractSearch.ToDate != null)
                {
                    searchQuery += @"( 
                                                   -- PMC.ContractStartDate BETWEEN @FromDate and @ToDate 
PMC.ContractStartDate >= @FromDate and  PMC.ContractEndDate <=@ToDate
                                                ) 
                                                and ";
                }
                if (projectMasterContractSearch.SupplierName != null && projectMasterContractSearch.SupplierName != "")
                {
                    searchQuery += @"( 
                                                    S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                ) 
                                                and ";
                }
                else if (projectMasterContractSearch.Search != "" && projectMasterContractSearch.Search != null && projectMasterContractSearch.Search != "null")
                {
                    searchQuery += @"( 
                                            PMC.ProjectName LIKE concat('%',@Search,'%') 
                                            or
                                            PMC.POPMasterCode LIKE concat('%',@Search,'%') 
                                            or
                                          
                                            PMC.CreatedDate LIKE concat('%',@Search,'%')
                                    ) and ";
                }
                if (projectMasterContractSearch.WorkFlowStatusId > 0)
                {
                    searchQuery += " PMC.WorkFlowStatusId = @WorkFlowStatusId and ";
                }
                searchQuery += " PMC.Isdeleted = 0 ";

                if (!projectMasterContractSearch.IsApprovalPage)
                {
                    searchQuery += " and PMC.CompanyId=@CompanyId ";
                }

                if (projectMasterContractSearch.RequestFrom == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
                {
                    searchQuery += "  and PMC.ProjectMasterContractId NOT IN (SELECT ProjectMasterContractId FROM dbo.ProjectContractVariationOrder) ";
                }

                string purchaseOrderSearchQuery = @" select PMC.ProjectMasterContractId,
                                                    
		                                            PMC.POPMasterCode,
                                                    PMC.OriginalContractSum,
		                                            PMC.DraftCode,
		                                            PMC.WorkFlowStatusId,
		                                            WFS.Statustext AS WorkFlowStatus,
		                                            PMC.ProjectName,
		                                            PMC.ContractStartDate,
                                                    S.SupplierName,
                                                    PMC.CreatedDate ";

                purchaseOrderSearchQuery += searchQuery;

                purchaseOrderSearchQuery += @"  order by PMC.UpdatedDate desc ";
                if (projectMasterContractSearch.Take > 0)
                {
                    purchaseOrderSearchQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ;";
                    purchaseOrderSearchQuery += " select COUNT(*) ";
                    purchaseOrderSearchQuery += searchQuery;
                }
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple(purchaseOrderSearchQuery, new
                {
                    Action = "SELECT",
                    Skip = projectMasterContractSearch.Skip,
                    Take = projectMasterContractSearch.Take,
                    Search = projectMasterContractSearch.Search,
                    SupplierId = projectMasterContractSearch.SupplierId,
                    SupplierName = projectMasterContractSearch.SupplierName,
                    ProjectMasterContractId = projectMasterContractSearch.ProjectMasterContractId,
                    WorkFlowStatusId = projectMasterContractSearch.WorkFlowStatusId,
                    CompanyId = projectMasterContractSearch.CompanyId,
                    DocumentCode = projectMasterContractSearch.DocumentCode,
                    FromDate = projectMasterContractSearch.FromDate,
                    ToDate = projectMasterContractSearch.ToDate,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract),
                    ApproverUserId = projectMasterContractSearch.UserId
                }, commandType: CommandType.Text))
                {
                    projectMasterContractDisplayResult.ProjectMasterContractList = result.Read<ProjectMasterContract>().ToList();
                    if (projectMasterContractSearch.Take > 0)
                    {
                        projectMasterContractDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return projectMasterContractDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string GetContractTerms(DateTime StartDate, DateTime EndDate)
        {
            var totalDays = EndDate.Subtract(StartDate).Days;
            var years = Math.Floor(totalDays / 365.25);
            var totalMonths = Math.Ceiling(years / 12);
            var months = (totalMonths) - (years * 12);
            var contractTerms = "";
            if (years > 0)
            {
                contractTerms = years + (years == 1 ? " Year " : " Years ");
            }
            if (months > 0)
            {
                contractTerms += months + (months == 1 ? " Month " : " Months ");
            }
            return contractTerms;
        }
        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();

                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.ProjectMasterContract,
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

        public ProjectMasterContractDisplayResult GetProjectMasterApprovedDetails(int companyId, int userId)
        {
            try
            {
                ProjectMasterContractDisplayResult projectMasterContractObj = new ProjectMasterContractDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ProjectContractMasterNew_CRUD", new
                {
                    Action = "ApprovedList",
                    CompanyId = companyId,
                    CreatedBy = userId
                }, commandType: CommandType.StoredProcedure))
                {
                    projectMasterContractObj.ProjectMasterContractList = result.Read<ProjectMasterContract>().AsList();
                }
                return projectMasterContractObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ProjectMasterContractDisplayResult GetPaymentProjectMasterFilterData(ProjectMasterContractFilter filters)
        {
            try
            {
                var result = this.GetProjectMasterApprovedDetails(filters.CompanyId, filters.CreatedBy);

                if (result != null && result.ProjectMasterContractList.Count > 0)
                {
                    if (!StringOperations.IsNullOrEmpty(filters.SupplierName))
                    {
                        result.ProjectMasterContractList = result.ProjectMasterContractList.Where(x => x.SupplierName.ToLower() == filters.SupplierName.ToLower()).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(filters.ProjectName))
                    {
                        result.ProjectMasterContractList = result.ProjectMasterContractList.Where(x => x.ProjectName.ToLower().IndexOf(filters.ProjectName.ToLower()) > -1).ToList();
                    }
                }
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}
