using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Service.Exceptions;
using UELPM.Util.FileOperations;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class SharedRepository : ISharedRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        UserProfileRepository objUserRepository = null;
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        SupplierRepository supplierRepository = null;
        AuditLogRepository logRepository = null;
        public static string GenerateCode(string prefix)
        {
            string code = "";
            code = prefix + "-" + new Random().Next(1000000);
            return code;
        }

        public static string GetNotificationType(int processId)
        {
            string notificationType = "";
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest)
                || processId == Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest)
                || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))
            {
                notificationType = "Purchase Order Request";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {
                notificationType = "Purchase Order";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Ticket))
            {
                notificationType = "Ticket";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer))
            {
                notificationType = "Asset Transfer";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer))
            {
                notificationType = "Location Transfer";
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
            {
                notificationType = "Sales Order";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal))
            {
                notificationType = "Asset Disposal";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
            {
                notificationType = "Supplier";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation))
            {
                notificationType = "Asset Depreciation";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.CreditNote))
            {
                notificationType = "Credit Note";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes))
            {
                notificationType = "Goods Return Note";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
            {
                notificationType = "Project Master Contract";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
            {
                notificationType = "Project Invoice";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
            {
                notificationType = "Invoice";
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
            {
                notificationType = "Project Contract Variation Order";
            }
            else
            {
                notificationType = StringOperations.PascalCase(Enum.GetName(typeof(WorkFlowProcessTypes), processId));
            }
            return notificationType;
        }

        public static string GetWorkFlowStatusText(int workFlowStatusId)
        {
            string status = string.Empty;
            if (workFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
            {
                status = "Rejected";
            }
            else if (workFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
            {
                status = "Approved";
            }
            else if (workFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
            {
                status = "Approved";
            }
            else if (workFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
            {
                status = "Asked For Clarification";
            }
            else if (workFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
            {
                status = "Sent for Approval Successfully";
            }
            return status;
        }

        public static string GetProcessCode(int processId)
        {
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo))
            {
                return ModuleCodes.InventoryPurchaseOrder;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO))
            {
                return ModuleCodes.AssetPurchaseOrder;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
            {
                return ModuleCodes.ContractPurchaseOrder;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {
                return ModuleCodes.ExpensePurchaseOrder;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest))
            {
                return ModuleCodes.InventoryPurchaseOrderRequest;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest))
            {
                return ModuleCodes.AssetPurchaseOrderRequest;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))
            {
                return ModuleCodes.ExpensePurchaseOrderReq;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
            {
                return ModuleCodes.SaleseOrder;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.CreditNote))
            {
                return ModuleCodes.CreditNote;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes))
            {
                return ModuleCodes.GoodsReturnedNotes;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodRecievedNotes))
            {
                return ModuleCodes.GoodsRecievedNotes;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
            {
                return ModuleCodes.Supplier;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
            {
                return ModuleCodes.ProjectMasterContract;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
            {
                return ModuleCodes.ProjectPaymentContract;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
            {
                return ModuleCodes.SupplierInvoice;
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
            {
                return ModuleCodes.ProjectContractVariationOrder;
            }
            return "";
        }

        public void UploadAttachments(FileSave fileSave, IDbConnection m_dbconnection, IDbTransaction transactionObj)
        {
            try
            {
                FileOperations fileOperationsObj = new FileOperations();
                fileOperationsObj.SaveFile(fileSave);
                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                for (var i = 0; i < fileSave.Files.Count; i++)
                {
                    var itemObj = new DynamicParameters();
                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                    itemObj.Add("@AttachmentTypeId", (int)Enum.Parse(typeof(AttachmentType), fileSave.ModuleName), DbType.Int32, ParameterDirection.Input);//static value need to change
                    itemObj.Add("@RecordId", Convert.ToString(fileSave.UniqueId), DbType.Int32, ParameterDirection.Input);
                    itemObj.Add("@FileName", fileSave.Files[i].FileName, DbType.String, ParameterDirection.Input);
                    itemObj.Add("@CreatedBy", fileSave.UploadUser.UserID, DbType.Int32, ParameterDirection.Input);
                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                    fileToSave.Add(itemObj);
                }
                m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transactionObj, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public static Tuple<string, string> GetMasterTableName(int processId)
        {
            string tableName = string.Empty;
            string columnName = string.Empty;
            switch (processId)
            {
                case (int)WorkFlowProcessTypes.ProjectPaymentContract:
                    tableName = "ProjectPaymentContract";
                    columnName = "PaymentContractId";
                    break;
                case (int)WorkFlowProcessTypes.ProjectContractVariationOrder:
                    tableName = "VariationOrder";
                    columnName = "VOId";
                    break;
                default:
                    break;
            }
            return Tuple.Create(tableName, columnName);
        }
        public static void GetPurchaseOrderItemPrice(decimal Unitprice, decimal ItemQty, decimal TaxAmount,
        decimal Discount, bool IsGstBeforeDiscount, out decimal TaxTotal, out decimal ItemTotalPrice, out decimal Totalprice, out decimal TotalbefTax)
        {
            if (IsGstBeforeDiscount == true)
            {
                TaxTotal = ((Unitprice * ItemQty) * TaxAmount / 100);
            }
            else
            {
                TaxTotal = (((Unitprice * ItemQty) - Discount) * TaxAmount / 100);
            }
            ItemTotalPrice = (Unitprice * ItemQty) + TaxTotal - Discount;
            Totalprice = (Unitprice * ItemQty);
            TotalbefTax = Totalprice - Discount;
        }


        public static string GetNotificationMessage(int processId, int workFlowStatuId = 0, int terminateStatusId = 0)
        {
            string notificationType = "";
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest)
              || processId == Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest)
              || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))
            {
                notificationType = "Request for  Purchase Order Request Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {

                if (workFlowStatuId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                {
                    notificationType = "Request for Purchase Order Void Approval";
                }
                else if (workFlowStatuId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                {
                    notificationType = "Request for Purchase Order Approval";
                }
                else if (workFlowStatuId == Convert.ToInt32(WorkFlowStatus.Void))
                {
                    notificationType = "Purchase Order is Voided";
                }
                else if (terminateStatusId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval) || terminateStatusId == Convert.ToInt32(WorkFlowStatus.ReturnForVoidClarifications))
                {
                    notificationType = "Request for Purchase Order Void Approval";
                }
                else
                {
                    notificationType = "Request for Purchase Order Approval";
                }
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Ticket))
            {
                notificationType = "New Comment for Ticket";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer))
            {
                notificationType = "Request for Asset Transfer Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer))
            {
                notificationType = "Request for Location Transfer Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
            {
                notificationType = "Request for Sales Order Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal))
            {
                notificationType = "Request for Asset Disposal Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
            {
                notificationType = "Request for Supplier Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation))
            {
                notificationType = "Request for Asset Depreciation Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.CreditNote))
            {
                notificationType = "Request for Credit Note Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes))
            {
                notificationType = "Request for Goods Return Note Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
            {
                notificationType = "Request for Project Master Contract Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
            {
                notificationType = "Request for Project Invoice Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
            {
                notificationType = "Request for Project Contract Variation Order Approval";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
            {
                notificationType = "Request for Invoice Approval";
            }
            else
            {
                string type = StringOperations.PascalCase(Enum.GetName(typeof(WorkFlowProcessTypes), processId));
                notificationType = string.Format("Request for {0} Approval", type);
            }
            return notificationType;
        }

        public static int getWorkFlowProcessIdForPO(int poTypeId, bool isPoRequest)
        {
            var processId = 0;
            if (poTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
            {
                if (isPoRequest == true)
                {
                    processId = Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest);
                }
                else
                {
                    processId = Convert.ToInt32(WorkFlowProcessTypes.InventoryPo);
                }
            }
            else if (poTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
            {
                if (isPoRequest == true)
                {
                    processId = Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest);
                }
                else
                {
                    processId = Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO);
                }
            }
            else if (poTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed))
            {

                processId = Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed);

            }
            else if (poTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
            {
                processId = Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable);
            }
            else if (poTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
            {
                if (isPoRequest == true)
                {
                    processId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest);
                }
                else
                {
                    processId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo);
                }
            }
            else if (poTypeId == Convert.ToInt32(PurchaseOrderType.ProjectPo))
            {
                processId = Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract);
            }
            return processId;
        }
        /*

           this method is used to get the list of item masters from ItemListing....     
       */
        public IEnumerable<GetItemMasters> GetItemMasters(int? locationId, int companyId, string searchKey)
        {
            try
            {

                return this.m_dbconnection.Query<GetItemMasters>("[GetItemMaster]",
                                         new
                                         {
                                             LocationId = locationId,
                                             CompanyId = companyId,
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<CostCentre> GetCostCentres()
        {
            try
            {
                return this.m_dbconnection.Query<CostCentre>("CostCenter_CRUD", new
                {

                    Action = "SELECTALL"
                },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        // this method show all item only based on location 
        public IEnumerable<GetItemMasters> GetItemMastersbasedLocationID(int? locationId, string searchKey)
        {
            try
            {

                return this.m_dbconnection.Query<GetItemMasters>("[GetItemMasterBasedonlocationId]",
                                         new
                                         {
                                             LocationId = locationId,
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<WorkFlowStatuses> GetWorkFlowStatus(int? WorkFlowPrcoessId)
        {
            try
            {
                return this.m_dbconnection.Query<WorkFlowStatuses>("[usp_GetWorkFlowStatus]",
                                        new
                                        {
                                            WorkFlowPrcoessId = WorkFlowPrcoessId
                                        },
                                        commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /*
            this method is used to get the list of locations....     
        */
        public IEnumerable<Locations> GetLocations(string searchKey, int? companyId)
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<Locations>("usp_GetLocations",
                                         new
                                         {
                                             SearchKey = searchKey,
                                             CompanyId = companyId
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<GRNS> GetGRNS(string searchKey, int? companyId, int? statusId)
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<GRNS>("GetGRNS",
                                         new
                                         {
                                             SearchKey = searchKey,
                                             CompanyId = companyId,
                                             StatusId = statusId
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<SupplierCategorys> GetSupplierCategory()
        {
            try
            {

                var result = this.m_dbconnection.Query<SupplierCategorys>("[GetSupplierCategory]",
                                                                                commandType: CommandType.StoredProcedure);

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> GetAllDepartments()
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<Locations>("usp_GetDepartments",
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<Locations> GetAllUniqueDepartments()
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<Locations>("usp_GetUniqueDepartments",
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> GetDepartmentsByCompany(int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Locations>("usp_GetDepartments",
                                       new
                                       {
                                           CompanyId = companyId
                                       },
                                       commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> getDepartmentsWorkFlow(int companyId, int processId)
        {
            try
            {
                return this.m_dbconnection.Query<Locations>("usp_GetDepartments", new
                {
                    CompanyId = companyId,
                    processId = processId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> getUserDepartments(int companyId, int processId, int userId)
        {
            try
            {
                return this.m_dbconnection.Query<Locations>("usp_GetUserDepartments", new
                {
                    CompanyId = companyId,
                    processId = processId,
                    UserId = userId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> GetUserCompanyDepartments(int companyId, int userId)
        {
            try
            {
                return this.m_dbconnection.Query<Locations>("usp_GetUserCompanyDepartments",
                                       new
                                       {
                                           CompanyId = companyId,
                                           UserId = userId
                                       },
                                       commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<Locations> GetAllSearchDepartments(string searchKey, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Locations>("usp_GetDepartments", new
                {
                    Search = searchKey,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
            this method is used to get the list of suppliers....     
        */
        public IEnumerable<Suppliers> GetAllSuppliers(string searchKey, int supplierTypeId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Suppliers>("usp_GetSuppliers", new
                {

                    SearchKey = (string.IsNullOrEmpty(searchKey)) ? string.Empty : searchKey,
                    SupplierTypeId = supplierTypeId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).GroupBy(j => j.SupplierId).Select(j => new Suppliers
                {

                    SupplierId = j.Select(k => k.SupplierId).FirstOrDefault(),
                    SupplierTypeID = j.Select(k => k.SupplierTypeID).FirstOrDefault(),
                    SupplierName = j.Select(k => k.SupplierName).FirstOrDefault(),
                    SupplierShortName = j.Select(k => k.SupplierShortName).FirstOrDefault(),
                    BillingAddress1 = j.Select(k => k.BillingAddress1).FirstOrDefault(),
                    BillingAddress2 = j.Select(k => k.BillingAddress2).FirstOrDefault(),
                    BillingFax = j.Select(k => k.BillingFax).FirstOrDefault(),
                    BillingTelephone = j.Select(k => k.BillingTelephone).FirstOrDefault(),
                    SupplierEmail = j.Select(k => k.SupplierEmail).FirstOrDefault(),
                    SupplierCode = j.Select(k => k.SupplierCode).FirstOrDefault(),
                    ServiceName = String.Join(",", j.Select(k => k.ServiceName).ToArray()),
                    GSTStatusId = j.Select(k => k.GSTStatusId).FirstOrDefault(),
                    TaxGroupId = j.Select(k => k.TaxGroupId).FirstOrDefault(),
                    SubCodeCount = j.Select(k => k.SubCodeCount).FirstOrDefault(),
                    WorkFlowStatus = j.Select(k => k.WorkFlowStatus).FirstOrDefault(),
                    IsFreezed = j.Select(k => k.IsFreezed).FirstOrDefault(),
                    TaxID = j.Select(k => k.TaxID).FirstOrDefault(),
                    TaxAmount = j.Select(k => k.TaxAmount).FirstOrDefault(),
                    SupplierAddress = j.Select(k => k.SupplierAddress).FirstOrDefault(),
                    Description = j.Select(k => k.Description).FirstOrDefault(),
                    defaulttaxgroup = j.Select(k => k.defaulttaxgroup).FirstOrDefault(),
                    PaymentTermsId = j.Select(k => k.PaymentTermsId).FirstOrDefault(),
                    CurrencyId = j.Select(k => k.CurrencyId).FirstOrDefault(),
                }).ToList().OrderBy(a => a.SupplierName);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Suppliers> getActiveSuppliers(string searchKey, int supplierTypeId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Suppliers>("usp_GetACtiveSuppliers", new
                {

                    SearchKey = (string.IsNullOrEmpty(searchKey)) ? string.Empty : searchKey,
                    SupplierTypeId = supplierTypeId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).GroupBy(j => j.SupplierId).Select(j => new Suppliers
                {

                    SupplierId = j.Select(k => k.SupplierId).FirstOrDefault(),
                    SupplierTypeID = j.Select(k => k.SupplierTypeID).FirstOrDefault(),
                    SupplierName = j.Select(k => k.SupplierName).FirstOrDefault(),
                    SupplierShortName = j.Select(k => k.SupplierShortName).FirstOrDefault(),
                    BillingAddress1 = j.Select(k => k.BillingAddress1).FirstOrDefault(),
                    BillingAddress2 = j.Select(k => k.BillingAddress2).FirstOrDefault(),
                    BillingFax = j.Select(k => k.BillingFax).FirstOrDefault(),
                    BillingTelephone = j.Select(k => k.BillingTelephone).FirstOrDefault(),
                    SupplierEmail = j.Select(k => k.SupplierEmail).FirstOrDefault(),
                    SupplierCode = j.Select(k => k.SupplierCode).FirstOrDefault(),
                    ServiceName = String.Join(",", j.Select(k => k.ServiceName).ToArray()),
                    GSTStatusId = j.Select(k => k.GSTStatusId).FirstOrDefault(),
                    TaxGroupId = j.Select(k => k.TaxGroupId).FirstOrDefault(),
                    SubCodeCount = j.Select(k => k.SubCodeCount).FirstOrDefault(),
                    WorkFlowStatus = j.Select(k => k.WorkFlowStatus).FirstOrDefault(),
                    IsFreezed = j.Select(k => k.IsFreezed).FirstOrDefault(),
                    TaxID = j.Select(k => k.TaxID).FirstOrDefault(),
                    TaxAmount = j.Select(k => k.TaxAmount).FirstOrDefault(),
                    SupplierAddress = j.Select(k => k.SupplierAddress).FirstOrDefault(),
                    Description = j.Select(k => k.Description).FirstOrDefault(),
                    defaulttaxgroup = j.Select(k => k.defaulttaxgroup).FirstOrDefault(),
                    PaymentTermsId = j.Select(k => k.PaymentTermsId).FirstOrDefault(),
                    CurrencyId = j.Select(k => k.CurrencyId).FirstOrDefault(),
                }).ToList().OrderBy(a => a.SupplierName);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
          this method is used to get the list of suppliers....     
        */
        public IEnumerable<Suppliers> GetSupplierTypes(string searchKey, int supplierTypeId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Suppliers>("usp_GetSuppliers", new
                {

                    SearchKey = searchKey,
                    SupplierTypeId = supplierTypeId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).GroupBy(j => j.SupplierId).Select(j => new Suppliers
                {

                    SupplierId = j.Select(k => k.SupplierId).FirstOrDefault(),
                    SupplierTypeID = j.Select(k => k.SupplierTypeID).FirstOrDefault(),
                    SupplierName = j.Select(k => k.SupplierName).FirstOrDefault(),
                    SupplierShortName = j.Select(k => k.SupplierShortName).FirstOrDefault(),
                    BillingAddress1 = j.Select(k => k.BillingAddress1).FirstOrDefault(),
                    BillingAddress2 = j.Select(k => k.BillingAddress2).FirstOrDefault(),
                    BillingFax = j.Select(k => k.BillingFax).FirstOrDefault(),
                    BillingTelephone = j.Select(k => k.BillingTelephone).FirstOrDefault(),
                    SupplierEmail = j.Select(k => k.SupplierEmail).FirstOrDefault(),
                    SupplierCode = j.Select(k => k.SupplierCode).FirstOrDefault(),
                    ServiceName = String.Join(",", j.Select(k => k.ServiceName).ToArray()),
                }).ToList().OrderBy(a => a.SupplierName);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Suppliers> GetOtherEntitySuppliers(string searchKey, int companyId)
        {
            try
            {
                searchKey = (!string.IsNullOrEmpty(searchKey)) ? searchKey.Trim() : searchKey;
                return this.m_dbconnection.Query<Suppliers>("usp_GetOtherEntitySuppliers", new
                {

                    SearchKey = searchKey,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).GroupBy(j => j.SupplierId).Select(j => new Suppliers
                {

                    SupplierId = j.Select(k => k.SupplierId).FirstOrDefault(),
                    CompanyId = j.Select(k => k.CompanyId).FirstOrDefault(),
                    SupplierTypeID = j.Select(k => k.SupplierTypeID).FirstOrDefault(),
                    SupplierName = j.Select(k => k.SupplierName).FirstOrDefault(),
                    SupplierShortName = j.Select(k => k.SupplierShortName).FirstOrDefault(),
                    BillingAddress1 = j.Select(k => k.BillingAddress1).FirstOrDefault(),
                    BillingAddress2 = j.Select(k => k.BillingAddress2).FirstOrDefault(),
                    BillingFax = j.Select(k => k.BillingFax).FirstOrDefault(),
                    BillingTelephone = j.Select(k => k.BillingTelephone).FirstOrDefault(),
                    SupplierEmail = j.Select(k => k.SupplierEmail).FirstOrDefault(),
                    SupplierCode = j.Select(k => k.SupplierCode).FirstOrDefault(),
                    ServiceName = String.Join(",", j.Select(k => k.ServiceName).ToArray()),
                    CategoryName = j.Select(k => k.CategoryName).FirstOrDefault(),
                    WorkFlowStatus = j.Select(k => k.WorkFlowStatus).FirstOrDefault(),
                    AssociatedEntities = j.Select(k => k.AssociatedEntities).FirstOrDefault(),
                }).ToList().OrderBy(a => a.SupplierName);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<Suppliers> GetSuppliersByKey(string searchKey, int CategoryId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Suppliers>("usp_GetSuppliersByKey", new
                {

                    SearchKey = searchKey,
                    CategoryId = CategoryId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
          this method is used to get the list of currencies... 
        */
        public IEnumerable<Currency> GetCurrencies()
        {

            try
            {
                return this.m_dbconnection.Query<Currency>("usp_GetCurrencies", commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<GetItemMasters> GetItemsfortransfer(int? locationId, string searchKey)
        {
            try
            {

                return this.m_dbconnection.Query<GetItemMasters>("[GetItemsforLocationTransfer]",
                                         new
                                         {
                                             LocationId = locationId,
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<PaymentTerm> GetPaymentTerms(int CompanyId)
        {
            return this.m_dbconnection.Query<PaymentTerm>("usp_GetPaymentTerms", new { CompanyId = CompanyId }, commandType: CommandType.StoredProcedure).ToList();
        }

        public IEnumerable<Facilities> GetFacilities(string searchKey, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Facilities>("GetFacility",
                                         new
                                         {
                                             SearchKey = searchKey,
                                             CompanyId = companyId
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<UOM> GetUOMList()
        {
            try
            {
                return this.m_dbconnection.Query<UOM>("usp_GetUOM", commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IEnumerable<Priority> GetPriorityList()
        {
            try
            {
                return this.m_dbconnection.Query<Priority>("usp_GetPriority", commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IEnumerable<EngineerList> GetEngineerList(int ticketId)
        {
            try
            {
                return this.m_dbconnection.Query<EngineerList>("usp_GetEngineerList",
                                                new
                                                {
                                                    TicketId = ticketId

                                                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IEnumerable<Companies> GetCompanies(string searchKey)
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<Companies>("GetCompanies",
                                         new
                                         {
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<Taxes> GetTaxes(int taxClass)
        {
            try
            {
                return this.m_dbconnection.Query<Taxes>("usp_GetTaxes",
                                         new
                                         {
                                             TaxClass = taxClass
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Engineer> GetEngineers(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<Engineer>("GetEngineers",
                                         new
                                         {
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<DeliveryTerms> GetAllDeliveryTerms(int CompanyId)
        {
            try
            {
                return this.m_dbconnection.Query<DeliveryTerms>("DeliveryTerms_CRUD", new
                {
                    Action = "SELECTALL",
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<GetAssets> GetAssets(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<GetAssets>("usp_GetAssets", new
                {

                    SearchKey = searchKey,
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<PurchaseOrderRequests> GetAllPORequest(string searchKey, int CompanyId)
        {
            try
            {
                //usp_GetPORequest
                return this.m_dbconnection.Query<PurchaseOrderRequests>("usp_GetPORequest", new
                {
                    //Action = "SELECTBYID",
                    SearchKey = searchKey,
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<PurchaseOrderRequests> GetAllPORequestForQuotation(string searchKey, int CompanyId)
        {
            try
            {
                //usp_GetPORequest
                return this.m_dbconnection.Query<PurchaseOrderRequests>("usp_GetPORequestForQuotations", new
                {
                    //Action = "SELECTBYID",
                    SearchKey = searchKey,
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<Invoices> GetAllINVRequest(GridDisplayInput gridDisplayInput)
        {
            try
            {
                //usp_GetPORequest
                return this.m_dbconnection.Query<Invoices>("usp_GetInvoiceRequest", new
                {
                    //Action = "SELECTBYID",
                    SearchKey = gridDisplayInput.Search,
                    Supplierid = gridDisplayInput.SupplierId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<PaymentType> GetAllPaymentType()
        {
            try
            {
                return this.m_dbconnection.Query<PaymentType>("GetPaymentType", commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public CompanyDetails GetCompanyDetails(int companyId)
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<CompanyDetails>("Company_CRUD",
                                         new
                                         {
                                             CompanyId = companyId
                                         },
                                         commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public CompanyDetails GetCompanyDetails(string companyName)
        {
            try
            {
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<CompanyDetails>("Company_CRUD",
                                         new
                                         {
                                             CompanyName = companyName
                                         },
                                         commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<UserRoles> GetUserRoles()
        {
            return this.m_dbconnection.Query<UserRoles>("usp_GetUserRoles", commandType: CommandType.StoredProcedure).ToList();
        }


        public byte[] GetUserProfileImage(int userId)
        {
            try
            {
                string userImageQuery = "select " +
                                        " ProfileImage " +
                                        "from " +
                                        "    dbo.UserProfile " +
                                        "where " +
                                        " UserID = @UserID";
                //to get the list of locations based on search key...
                return this.m_dbconnection.Query<byte[]>(userImageQuery,
                                         new
                                         {
                                             userId = userId
                                         },
                                         commandType: CommandType.Text).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<Customer> GetAllSearchCustomers(string searchKey, int customerCategoryId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Customer>("usp_GetAllSearchCustomers", new
                {
                    SearchKey = searchKey,
                    CustomerCategoryId = customerCategoryId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<UserProfile> GetUsersByCompany(string userName, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<UserProfile>("usp_GetUsers",
                    new
                    {
                        Action = "SELECTBYCOMPANY",
                        CompanyId = companyId,
                        UserName = userName
                    }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<UserProfile> GetAllUsers()
        {
            try
            {
                return this.m_dbconnection.Query<UserProfile>("usp_GetUsers",
                    new
                    {
                        Action = "SELECTALL",
                    }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<ExpenseTypes> GetExpenseTypes()
        {
            try
            {
                return this.m_dbconnection.Query<ExpenseTypes>("usp_GetExpenseTypes", commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<BillingFrequency> GetBillingFrequencies()
        {
            try
            {
                return this.m_dbconnection.Query<BillingFrequency>("usp_BillingFrequency", commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public void SendForApproval(WorkFlowParameter workFlowApproval, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {

            UserProfileRepository userProfileRepository = new UserProfileRepository();
            string nextUserRole = string.Empty;
            workFlowConfigRepository = new WorkFlowConfigurationRepository();
            string itemCategory = string.Empty;
            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>() { workFlowApproval }, dbTransaction, dbConnection);
                UserProfile nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)workFlowConfig.First().ApproverUserId, workFlowApproval.CompanyId);
                nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                int processId = workFlowApproval.ProcessId;
                if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
                {
                    //Get Purchase Order code here
                    string PurchaseOrderCode = GetPurchaseOrderCode(workFlowApproval.DocumentId, processId);
                    var user = userProfileRepository.GetUserById(workFlowApproval.CreatedBy);
                    string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                    DateTime now = DateTime.Now;
                    var workflow = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                    string Workflowname = string.Format("{0} {1}", workflow.FirstName, workflow.LastName);

                    if (workFlowApproval.PurchaseOrderStatusId == (int)WorkFlowStatus.CancelledApproval)
                        //AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "resend for approval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "SendForApproval", string.Format("Purchase Order Resend for {0} to {1} on {2} {3}", nextUserRole == "V" ? " Verification " : " Approval ", Workflowname, now, workFlowApproval.RemarksQuotation), workFlowApproval.CompanyId);
                        AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "resend for approval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "SendForApproval", string.Format("Purchase Order Resend for {0} to {1} on {2}", nextUserRole == "V" ? " Verification " : " Approval ", Workflowname, now), workFlowApproval.CompanyId);
                    else
                        AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "sent for approval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "SendForApproval", string.Format("Sent to {0} for {1} on {2}", Workflowname, nextUserRole == "V" ? " Verification " : " Approval ", now), workFlowApproval.CompanyId);

                }
                else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
                {
                    //  Get SupplierCode here
                    string SupplierCode = GetSupplierCode(workFlowApproval.DocumentId);
                    DateTime now = DateTime.Now;
                    var user = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                    string userName = string.Format("{0} {1}", user.FirstName, user.LastName);
                    AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", string.Format("Sent to {0} for {1} on {2}", userName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApproval.CompanyId);
                }
                else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
                {
                    // GetInvoiceCode here}
                    string InvoiceCode = GetInvoiceCode(workFlowApproval.DocumentId);
                    DateTime now = DateTime.Now;

                    if (workFlowConfig != null && workFlowConfig.Count() > 0)
                    {
                        var user = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                        string userName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        if (workFlowApproval.CurrentWorkFlowStatusId == (int)WorkFlowStatus.CancelledApproval)
                            AuditLog.Info("SupplierInvoice", "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", string.Format("Supplier Invoice Resend for {0} to {1} on {2}", nextUserRole == "V" ? " Verification " : " Approval ", userName, now), workFlowApproval.CompanyId);
                        //AuditLog.Info("Shared work flow ", "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", "Supplier Invoice " + InvoiceCode + " sent for approval.", workFlowApproval.CompanyId);
                        else
                            AuditLog.Info("SupplierInvoice", "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", string.Format("Sent to {0} for {1} on {2}", userName, nextUserRole == "V" ? " Verification " : " Approval ", now), workFlowApproval.CompanyId);
                    }

                }

                else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
                {
                    // string SupplierCode = GetSupplierCode(workFlowApproval.DocumentId);
                    DateTime now = DateTime.Now;
                    var user = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                    string userName = string.Format("{0} {1}", user.FirstName, user.LastName);
                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", string.Format("Sent to {0} for {1} on {2}", userName, nextUserRole == "V" ? " Verification " : " Approval ", now), workFlowApproval.CompanyId);


                    //AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", "Sent to " + userName + " for approver on " + now, workFlowApproval.CompanyId);
                }
                else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
                {
                    // string SupplierCode = GetSupplierCode(workFlowApproval.DocumentId);
                    DateTime now = DateTime.Now;
                    int firstApprover = Convert.ToInt32(workFlowConfig.First().ApproverUserId);
                    if (firstApprover != workFlowApproval.UserID)
                    {
                        var user = userProfileRepository.GetUserById(firstApprover);
                        string userName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", string.Format("Sent to {0} for {1} on {2}", userName, nextUserRole == "V" ? " Verification " : " Approval ", now), workFlowApproval.CompanyId);
                    }
                }
                else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
                {

                    DateTime now = DateTime.Now;
                    int firstApprover = Convert.ToInt32(workFlowConfig.First().ApproverUserId);
                    if (firstApprover != workFlowApproval.UserID)
                    {
                        var user = userProfileRepository.GetUserById(firstApprover);
                        string userName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", string.Format("Sent to {0} for {1} on {2}", userName, nextUserRole == "V" ? " Verification " : " Approval ", now), workFlowApproval.CompanyId);
                    }

                    //AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendForApproval", workFlowApproval.CreatedBy.ToString(), workFlowApproval.DocumentId.ToString(), "Send for Approval", "Sent to " + userName + " for approver on " + now, workFlowApproval.CompanyId);
                }
            }
            catch (Exception e)
            {
                if (isFromUi == true)
                {
                    dbTransaction.Rollback();
                    dbTransaction.Dispose();
                }
                //throw e;
            }
        }

        public int WorkFlowRequestStatusUpdate(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                string status = string.Empty;
                this.m_dbconnection.Open();//opening the connection...
                int nextApproverUserId = 0;
                string processType = string.Empty;
                UserProfile currentUserRoles = new UserProfile();
                UserProfile nextUserRoles = new UserProfile();
                string currentUserRole = string.Empty;
                string nextUserRole = string.Empty;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        currentUserRoles = userProfileRepository.GetUserRolesInCompany(workFlowApprovals.UserId, workFlowApprovals.CompanyId);
                        currentUserRole = currentUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                        #region update record in work flow table        
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = workFlowApprovals.DocumentId,
                            ProcessId = workFlowApprovals.ProcessId,
                            WorkFlowStatusId = workFlowApprovals.WorkFlowStatusId,
                            ApproverUserId = workFlowApprovals.UserId,
                            CompanyId = workFlowApprovals.CompanyId,
                            IsReApproval = workFlowApprovals.IsReApproval
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (nextWorkFlowDetails.ApproverUserId > 0)
                        {
                            nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)nextWorkFlowDetails.ApproverUserId, workFlowApprovals.CompanyId);
                            nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                        }

                        #region Supplier Invoic Audit Log...
                        //region added by sateesh on 15-04-2020 for supplier invoice audit log
                        if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.SupplierInvoice)
                        {

                            var currentApprover = userProfileRepository.GetUserById(workFlowApprovals.UserId);
                            DateTime logTime = DateTime.Now;
                            if (workFlowApprovals.WorkFlowStatusId == (int)WorkFlowStatus.Completed)
                            {
                                if (nextWorkFlowDetails.ApproverUserId > 0)  //&& workFlowApprovals.UserId != nextWorkFlowDetails.ApproverUserId
                                {
                                    var nextApprover = userProfileRepository.GetUserById(nextWorkFlowDetails.ApproverUserId);
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("{0} by {1} {2} on {3}", currentUserRole == "V" ? "Verified" : "Approved", currentApprover.FirstName, currentApprover.LastName, logTime), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("Sent to {0} {1} for {2} on {3}", nextApprover.FirstName, nextApprover.LastName, nextUserRole == "V" ? "Verification" : "Approval", logTime), workFlowApprovals.CompanyId);
                                }
                                else
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("{0} by {1} {2} on {3}", currentUserRole == "V" ? "Verified" : "Approved", currentApprover.FirstName, currentApprover.LastName, logTime), workFlowApprovals.CompanyId);
                                }
                            }
                            else if (workFlowApprovals.WorkFlowStatusId == (int)WorkFlowStatus.Rejected)
                            {
                                if (nextWorkFlowDetails.ApproverUserId > 0 && workFlowApprovals.UserId != nextWorkFlowDetails.ApproverUserId)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("Disagreed by {0} {1} on {2}", currentApprover.FirstName, currentApprover.LastName, logTime), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("Reason for disagreement is : {0}", workFlowApprovals.Remarks), workFlowApprovals.CompanyId);
                                }
                                else
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("Rejected by {0} {1} on {2}", currentApprover.FirstName, currentApprover.LastName, logTime), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendForApproval", string.Format("Reason for rejection is : {0}", workFlowApprovals.Remarks), workFlowApprovals.CompanyId);
                                }
                            }
                            else if (workFlowApprovals.WorkFlowStatusId == (int)WorkFlowStatus.AskedForClarification)
                            {
                                AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "AskedForClarification", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "AskedForClarification", string.Format("Supplier Invoice Return for Clarification by {0} {1} on {2}. {3}", currentApprover.FirstName, currentApprover.LastName, logTime, workFlowApprovals.Remarks), workFlowApprovals.CompanyId);
                            }
                        }
                        #endregion


                        #endregion

                        string procedureName = GetProcedureName(workFlowApprovals.ProcessId);

                        #region request status update..

                        int updateStatus = this.m_dbconnection.Execute(procedureName, new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = workFlowApprovals.DocumentId,
                            UserId = workFlowApprovals.UserId,
                            WorkFlowStatusId = nextWorkFlowDetails.OverAllWorkFlowStatusId,
                            CompanyId = workFlowApprovals.CompanyId,
                            ProcessId = workFlowApprovals.ProcessId,
                            DocumentCode = (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved) || nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) ? SharedRepository.GetProcessCode(workFlowApprovals.ProcessId) : null
                        },
                            transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = workFlowApprovals.DocumentId,
                            ProcessId = workFlowApprovals.ProcessId,
                            Remarks = workFlowApprovals.Remarks,
                            StatusId = workFlowApprovals.WorkFlowStatusId,
                            UserId = workFlowApprovals.UserId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion


                        #region inserting record in notification
                        //if partially approved...
                        string notificationMessage = "";
                        string notificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId);
                        int? notificationToUserId = 0;
                        int messageType = 0;
                        int notificationCreatedUserId = workFlowApprovals.UserId;
                        if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved) || workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                        {
                            if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            {
                                notificationMessage = $"Request For { notificationType } Approval";
                                notificationToUserId = nextWorkFlowDetails.ApproverUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Requested);
                                notificationCreatedUserId = workFlowApprovals.RequestUserId;
                            }
                            else if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved) || nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                notificationMessage = $" { notificationType } Approved";
                                notificationToUserId = workFlowApprovals.RequestUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Approved);
                            }
                        }
                        else if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            notificationMessage = $"{ notificationType } Rejected";
                            notificationToUserId = workFlowApprovals.RequestUserId;
                            messageType = Convert.ToInt32(NotificationMessageTypes.Rejected);
                            //UserProfileRepository userProfileRepository = new UserProfileRepository();
                            DateTime now = DateTime.Now;
                            var user = userProfileRepository.GetUserById(workFlowApprovals.UserId);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            if (workFlowApprovals.ProcessId == 13)
                            {
                                if (workFlowApprovals.IsReApproval == false)
                                {
                                    if (nextWorkFlowDetails.ApproverUserId > 0 && workFlowApprovals.UserId != nextWorkFlowDetails.ApproverUserId)
                                    {
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed  by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                    }
                                    else
                                    {
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);

                                    }
                                }
                                else
                                {
                                    if (workFlowApprovals.IsReApproval == true && workFlowApprovals.ParentSupplierId > 0 && workFlowApprovals.UserId != nextWorkFlowDetails.ApproverUserId)
                                    {
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed  by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);

                                    }
                                    else
                                    {
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SendSupplierRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);

                                    }
                                }


                            }
                            if (workFlowApprovals.ProcessId == 22)
                            {

                                if (nextWorkFlowDetails.ApproverUserId > 0 && workFlowApprovals.UserId != nextWorkFlowDetails.ApproverUserId)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendPOPRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", " Disagreed  by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendPOPRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", " Reason for disagreement is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                }
                                else
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendPOPRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendPOPRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", " Reason for rejection is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);

                                }




                            }
                            if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                            {
                                if (nextWorkFlowDetails.ApproverUserId > 0 && workFlowApprovals.UserId != nextWorkFlowDetails.ApproverUserId)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "SendPPCRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendPPCRejectionMail", " Disagreed  by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "SendPPCRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendPPCRejectionMail", " Reason for disagreement is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                }
                                else
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "SendPPCRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendPPCRejectionMail", " Rejected by " + UserName + " on " + now + " ", workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "SendPPCRejectionMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SendPPCRejectionMail", " Reason for rejection is : " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);

                                }
                            }

                        }
                        else if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                        {
                            notificationMessage = "Need Clarification";
                            notificationToUserId = workFlowApprovals.RequestUserId;
                            messageType = Convert.ToInt32(NotificationMessageTypes.AskedForClarification);
                        }
                        try
                        {
                            //if asset depreciation is approved then we will post the depreciation details...
                            if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved) && workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation))
                            {
                                PostAssetDepreciation(this.m_dbconnection, transactionObj, workFlowApprovals.DocumentId);
                            }
                            NotificationsRepository notificationObj = new NotificationsRepository();
                            notificationObj.CreateNotification(new Notifications()
                            {

                                NotificationId = 0,
                                //NotificationType = SharedRepository.GetNotificationType(workFlowApprovals.ProcessId),
                                //NotificationMessage = SharedRepository.GetNotificationMessage(workFlowApprovals.ProcessId, workFlowApprovals.WorkFlowStatusId),
                                NotificationType = notificationType,
                                NotificationMessage = notificationMessage,
                                ProcessId = workFlowApprovals.ProcessId,
                                ProcessName = "",
                                DocumentId = workFlowApprovals.DocumentId,
                                UserId = Convert.ToInt32(notificationToUserId),
                                IsRead = false,
                                CreatedBy = notificationCreatedUserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = workFlowApprovals.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = messageType,
                                DocumentCode = workFlowApprovals.DocumentCode
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

                        if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved) || workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                        {
                            nextApproverUserId = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlow_CRUD", new
                            {
                                Action = "SELECTNEXTLEVEL",
                                DocumentId = workFlowApprovals.DocumentId,
                                ProcessId = workFlowApprovals.ProcessId,
                                CompanyId = workFlowApprovals.CompanyId
                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        int tempnextApproverUserId = nextApproverUserId;

                        if (workFlowApprovals.ProcessId == 13 || workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectMasterContract
                            || workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                        {
                            nextApproverUserId = this.m_dbconnection.Query<int>("SELECT  top 1  ApproverUserId FROM WorkFlow WHERE DocumentId = @DocumentId and CompanyId = @CompanyId  AND ProcessId = @ProcessId AND status=@status ORDER BY WorkFlowId ASC",
                                new { DocumentId = workFlowApprovals.DocumentId, workFlowApprovals.ProcessId, status = 3, CompanyId = workFlowApprovals.CompanyId }).FirstOrDefault();
                            nextApproverUserId = nextApproverUserId == 0 ? tempnextApproverUserId : nextApproverUserId;
                        }

                        status = SharedRepository.GetWorkFlowStatusText(workFlowApprovals.WorkFlowStatusId);
                        if (nextApproverUserId > 0)
                        {
                            nextUserRoles = userProfileRepository.GetUserRolesInCompany(nextApproverUserId, workFlowApprovals.CompanyId);
                            nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                            var result = SendDocumentRequestMail(nextApproverUserId, workFlowApprovals.DocumentId, workFlowApprovals.ProcessId, workFlowApprovals.CompanyId);
                            if (result)
                            {
                                status = "Waiting For Approval";
                                SendDocumentApprovalMail(workFlowApprovals.UserId, workFlowApprovals.DocumentId, status, workFlowApprovals.ProcessId, nextApproverUserId, workFlowApprovals.CompanyId);
                                //UserProfileRepository userProfileRepository = new UserProfileRepository();
                                DateTime now = DateTime.Now;
                                var user = userProfileRepository.GetUserById(nextApproverUserId);
                                string nextApproverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                                var previoususer = userProfileRepository.GetUserById(workFlowApprovals.UserId);
                                string previoususername = string.Format("{0} {1}", previoususer.FirstName, previoususer.LastName);
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.Supplier)
                                {
                                    if (workFlowApprovals.IsReApproval == true)
                                    {


                                        // int parentsupplierid = m_dbconnection.Query<int>("select SupplierId from Supplier where SupplierCode=" +"'"+ workFlowApprovals.DocumentCode+"'").First();
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "SupplierRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), workFlowApprovals.CompanyId);
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "SupplierRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApprovals.CompanyId);

                                        //AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SupplierRequestStatusUpdate", " Consent given by " + previoususername + " and sent to " + nextApproverUserName + " for approval on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                    }

                                    AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SupplierRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SupplierRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApprovals.CompanyId);
                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectMasterContract)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApprovals.CompanyId);

                                    //AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", " Consent given by " + previoususername + " and sent to " + nextApproverUserName + " for approval on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectContractVariationOrder)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApprovals.CompanyId);

                                    //AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", " Consent given by " + previoususername + " and sent to " + nextApproverUserName + " for approval on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PPCRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), workFlowApprovals.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "NextLevelApproval", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PPCRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApprovals.CompanyId);
                                }
                            }
                        }
                        else
                        {
                            if (nextApproverUserId == 0 && workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved) || workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                SendDocumentApprovalMail(workFlowApprovals.UserId, workFlowApprovals.DocumentId, status, workFlowApprovals.ProcessId, nextApproverUserId, workFlowApprovals.CompanyId);
                                //UserProfileRepository userProfileRepository = new UserProfileRepository();
                                DateTime now = DateTime.Now;
                                var user = userProfileRepository.GetUserById(workFlowApprovals.UserId);
                                string approverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.Supplier)
                                {
                                    supplierRepository = new SupplierRepository();
                                    supplierRepository.UpdateAttachStatus(workFlowApprovals.DocumentId, workFlowApprovals.CompanyId, true);
                                    if (workFlowApprovals.IsReApproval == true)
                                    {
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SupplierApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.ParentSupplierId.ToString(), "SupplierStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), workFlowApprovals.CompanyId);

                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SupplierApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SupplierStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), workFlowApprovals.CompanyId);

                                        Supplier childSupplier = supplierRepository.GetSupplier(workFlowApprovals.DocumentId, workFlowApprovals.CompanyId);
                                        supplierRepository.DeleteSupplier((int)childSupplier.ParentSupplierId, workFlowApprovals.UserId, workFlowApprovals.CompanyId, workFlowApprovals.IsReApproval);
                                        supplierRepository.UpdateSupplierIdInDocuments((int)childSupplier.ParentSupplierId, childSupplier.SupplierId);

                                    }
                                    else
                                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SupplierApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "SupplierStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), workFlowApprovals.CompanyId);

                                }

                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectMasterContract)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "POPApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPApprove", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), workFlowApprovals.CompanyId);

                                    //AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "POPApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPApprove", "Approved by " + approverUserName + " on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);

                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectContractVariationOrder)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "POPApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPApprove", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), workFlowApprovals.CompanyId);
                                    ProjectContractVariationOrderRepository projectContractVariationOrderRepository = null;
                                    projectContractVariationOrderRepository = new ProjectContractVariationOrderRepository();
                                    bool isRevised = projectContractVariationOrderRepository.ReviseContractSum(workFlowApprovals.DocumentId, transactionObj);
                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "POPApproved", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPApprove", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), workFlowApprovals.CompanyId);
                                }
                            }
                            else if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                            {
                                SendDocumentApprovalMail(Convert.ToInt32(notificationToUserId), workFlowApprovals.DocumentId, status, workFlowApprovals.ProcessId, nextApproverUserId, workFlowApprovals.CompanyId);
                                if (workFlowApprovals.IsReApproval == true)
                                {
                                    supplierRepository = new SupplierRepository();
                                    Supplier childSupplier = this.m_dbconnection.Query<Supplier>("select * from supplier where supplierid=@supplierid",
                                        new { supplierid = workFlowApprovals.DocumentId }, transaction: transactionObj).FirstOrDefault();

                                    supplierRepository.DeleteSupplier(workFlowApprovals.DocumentId, workFlowApprovals.UserId, workFlowApprovals.CompanyId, workFlowApprovals.IsReApproval);
                                    this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                                    {
                                        Action = "INSERT",
                                        DocumentId = childSupplier.ParentSupplierId,
                                        ProcessId = workFlowApprovals.ProcessId,
                                        Remarks = workFlowApprovals.Remarks,
                                        StatusId = workFlowApprovals.WorkFlowStatusId,
                                        UserId = workFlowApprovals.UserId
                                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                }
                            }
                            else if (workFlowApprovals.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                            {
                                if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract) ||
                                    workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract) ||
                                    workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
                                {
                                    SendReturnForClarificationMail(workFlowApprovals);
                                }
                                else
                                {
                                    SendDocumentRequestClarificationMail(workFlowApprovals.UserId, workFlowApprovals.RequestUserId, workFlowApprovals.Remarks, workFlowApprovals.DocumentId, workFlowApprovals.ProcessId, workFlowApprovals.DocumentCode, workFlowApprovals.CompanyId);
                                }
                                var user = userProfileRepository.GetUserById(workFlowApprovals.UserId);
                                string approverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                                DateTime now = DateTime.Now;
                                if (workFlowApprovals.ProcessId == 22)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "SendPOPRequestClarificationMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "POPRequestStatusUpdate", "Project Contract Master Return for Clarification  by  " + approverUserName + " on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "SendPPCRequestClarificationMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PPCRequestStatusUpdate", "Project Invoice Return for Clarification  by  " + approverUserName + " on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
                                }
                                if (workFlowApprovals.ProcessId == (int)WorkFlowProcessTypes.ProjectContractVariationOrder)
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "SendPVORequestClarificationMail", workFlowApprovals.UserId.ToString(), workFlowApprovals.DocumentId.ToString(), "PVORequestStatusUpdate", "Project Variation Order Return for Clarification  by  " + approverUserName + " on " + now + " " + workFlowApprovals.Remarks, workFlowApprovals.CompanyId);
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

        private void SendReturnForClarificationMail(WorkFlowApproval workFlowApprovals)
        {
            objUserRepository = new UserProfileRepository();
            UserProfile approver = objUserRepository.GetUserById(workFlowApprovals.UserId);
            UserProfile sender = objUserRepository.GetUserById(workFlowApprovals.RequestUserId);
            CompanyDetails company = GetCompanyDetails(workFlowApprovals.CompanyId);
            string type = GetNotificationMessage(workFlowApprovals.ProcessId);
            DocumentMailData documentMailData = new DocumentMailData
            {
                CompanyId = workFlowApprovals.CompanyId,
                DocumentId = workFlowApprovals.DocumentId,
                DocumentStatus = "Return for clarifications",
                MailTemplatepath = ("~/EmailTemplates/ReturnForClarificationMail.txt"),
                ProcessId = workFlowApprovals.ProcessId,
                MailTitle = type,
                Clarification = workFlowApprovals.Remarks,
                Receiver = approver,
                CompanyShortName = company.CompanyShortName,
                Sender = sender
            };
            if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
            {
                var projectMasterContractDetails = new ProjectMasterContractRepository().GetProjectMasterContractDetails(workFlowApprovals.DocumentId);
                documentMailData.DocumentValue = projectMasterContractDetails.OriginalContractSum.ToString();
                documentMailData.DocumentCode = projectMasterContractDetails.POPMasterCode;
                documentMailData.Supplier = projectMasterContractDetails.Supplier;
                documentMailData.DocumentSubjectCode = "POP Contract";
                documentMailData.AmountHeaderText = "Original Contract Sum";
                documentMailData.MailLink = ConfigurationManager.AppSettings["ProjectMasterContract"] + "request?id=" + workFlowApprovals.DocumentId + "&cid=" + projectMasterContractDetails.CompanyId;
                documentMailData.DocumentCurrencySymbol = projectMasterContractDetails.CurrencySymbol;
            }
            if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
            {
                var paymentDetails = new ProjectPaymentContractRepository().getCertificatesByPaymentContractId(0, workFlowApprovals.DocumentId);
                documentMailData.DocumentValue = paymentDetails.Certificate.CPGrandTotal.ToString();
                documentMailData.DocumentCode = paymentDetails.DocumentCode;
                documentMailData.Supplier = paymentDetails.ProjectMasterContract.Supplier;
                documentMailData.DocumentSubjectCode = "POP Pyt";
                documentMailData.AmountHeaderText = "Payment Amount";
                documentMailData.MailLink = ConfigurationManager.AppSettings["ProjectPaymentContract"] + "request/" + paymentDetails.ProjectMasterContract.ProjectMasterContractId + "/" + paymentDetails.PaymentContractId + "/" + paymentDetails.CompanyId;
                documentMailData.DocumentCurrencySymbol = paymentDetails.ProjectMasterContract.CurrencySymbol;
            }
            if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
            {
                var variationOrder = new ProjectContractVariationOrderRepository().getVODetailsbyId(0, workFlowApprovals.DocumentId);
                documentMailData.DocumentValue = variationOrder.CurrentVOSum.ToString();
                documentMailData.DocumentCode = variationOrder.VODocumentCode;
                documentMailData.Supplier = variationOrder.Supplier;
                documentMailData.DocumentSubjectCode = "POP VO";
                documentMailData.AmountHeaderText = "VO Sum";
                documentMailData.MailLink = ConfigurationManager.AppSettings["ProjectContractVariationOrder"] + "request/" + variationOrder.ProjectMasterContractId + "/" + workFlowApprovals.DocumentId + "/" + variationOrder.CompanyId;
                documentMailData.DocumentCurrencySymbol = variationOrder.CurrencySymbol;
            }
            var result = Util.Email.GenericEmailProvider.SendReturnForClarificationMail(documentMailData);
        }

        private void SendReplyForClarificationMail(WorkFlowApproval workFlowApprovals)
        {
            objUserRepository = new UserProfileRepository();
            UserProfile approver = objUserRepository.GetUserById(workFlowApprovals.ApproverUserId);
            UserProfile sender = objUserRepository.GetUserById(workFlowApprovals.RequestUserId);
            CompanyDetails company = GetCompanyDetails(workFlowApprovals.CompanyId);
            string type = GetNotificationMessage(workFlowApprovals.ProcessId);
            DocumentMailData documentMailData = new DocumentMailData
            {
                CompanyId = workFlowApprovals.CompanyId,
                DocumentId = workFlowApprovals.DocumentId,
                DocumentStatus = "Reply for clarifications",
                MailTemplatepath = ("~/EmailTemplates/ReplyForClarificationMail.txt"),
                ProcessId = workFlowApprovals.ProcessId,
                MailTitle = type,
                Clarification = workFlowApprovals.Remarks,
                Receiver = approver,
                CompanyShortName = company.CompanyShortName,
                Sender = sender
            };
            if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
            {
                var projectMasterContractDetails = new ProjectMasterContractRepository().GetProjectMasterContractDetails(workFlowApprovals.DocumentId);
                documentMailData.DocumentValue = projectMasterContractDetails.OriginalContractSum.ToString();
                documentMailData.DocumentCode = projectMasterContractDetails.POPMasterCode;
                documentMailData.Supplier = projectMasterContractDetails.Supplier;
                documentMailData.DocumentSubjectCode = "POP Contract";
                documentMailData.AmountHeaderText = "Original Contract Sum";
                documentMailData.MailLink = ConfigurationManager.AppSettings["ProjectMasterContract"] + "approval?id=" + workFlowApprovals.DocumentId + "&cid=" + projectMasterContractDetails.CompanyId;
                documentMailData.DocumentCurrencySymbol = projectMasterContractDetails.CurrencySymbol;
            }
            if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
            {
                var paymentDetails = new ProjectPaymentContractRepository().getCertificatesByPaymentContractId(0, workFlowApprovals.DocumentId);
                documentMailData.DocumentValue = paymentDetails.Certificate.CPGrandTotal.ToString();
                documentMailData.DocumentCode = paymentDetails.DocumentCode;
                documentMailData.Supplier = paymentDetails.ProjectMasterContract.Supplier;
                documentMailData.DocumentSubjectCode = "POP Pyt";
                documentMailData.AmountHeaderText = "Payment Amount";
                documentMailData.MailLink = ConfigurationManager.AppSettings["ProjectPaymentContract"] + "approval/" + paymentDetails.ProjectMasterContract.ProjectMasterContractId + "/" + paymentDetails.PaymentContractId + "/" + paymentDetails.CompanyId;
                documentMailData.DocumentCurrencySymbol = paymentDetails.ProjectMasterContract.CurrencySymbol;
            }
            if (workFlowApprovals.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
            {
                var variationOrder = new ProjectContractVariationOrderRepository().getVODetailsbyId(0, workFlowApprovals.DocumentId);
                documentMailData.DocumentValue = variationOrder.CurrentVOSum.ToString();
                documentMailData.DocumentCode = variationOrder.VODocumentCode;
                documentMailData.Supplier = variationOrder.Supplier;
                documentMailData.DocumentSubjectCode = "POP VO";
                documentMailData.AmountHeaderText = "VO Sum";
                documentMailData.MailLink = ConfigurationManager.AppSettings["ProjectContractVariationOrder"] + "approval/" + variationOrder.ProjectMasterContractId + "/" + workFlowApprovals.DocumentId + "/" + variationOrder.CompanyId;
                documentMailData.DocumentCurrencySymbol = variationOrder.CurrencySymbol;
            }
            var result = Util.Email.GenericEmailProvider.SendReplyForClarificationMail(documentMailData);
        }

        public string GetProcedureName(int processId)
        {
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer))
            {
                return "AssetTransfer_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer))
            {
                return "LocationTransfer_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed)
                   || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
            {
                return "ContractPurchaseOrderItem_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO))
            {
                return "FixedAssetPurchaseOrderCreation_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {
                return "ExpensePurchaserOrderCreation_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo))
            {
                return "PurchaseOrderCreation_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
            {
                return "SalesOrder_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest)
                  || processId == Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest)
                  || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))
            {
                return "PurchaseOrderRequest_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal))
            {
                return "AssetDisposal_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
            {
                return "Supplier_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation))
            {
                return "AssetDepreciation_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.CreditNote))
            {
                return "CreditNote_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes))
            {
                return "GoodsReturnedNotes_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))
            {
                return "ProjectContractMasterNew_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
            {
                return "Projectpaymentcontract_crud";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
            {
                return "ProjectContractVariationOrderNew_CRUD";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
            {
                return "Invoice_CRUD";
            }
            return "";
        }

        /*
            a) for updating the purchase request created user  coments....
        */
        public int WorkFlowClarificationReply(WorkFlowApproval requestApproval)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region inserting record in work flow table     

                        //changing the work flow order status from "Asked for clarification" to "Waiting for Approval"
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = requestApproval.DocumentId,
                            ProcessId = requestApproval.ProcessId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ApproverUserId = requestApproval.ApproverUserId,
                            CompanyId = requestApproval.CompanyId,
                            IsReApproval = requestApproval.IsReApproval
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..

                        string procedureName = GetProcedureName(requestApproval.ProcessId);

                        //int updateStatus = this.m_dbconnection.QueryFirstOrDefault<int>(procedureName, new
                        //{
                        //    Action = "UPDATEWORKFLOWSTATUS",
                        //    DocumentId = requestApproval.DocumentId,
                        //    WorkFlowStatusId = requestApproval.WorkFlowStatusId
                        //},
                        //transaction: transactionObj,
                        //commandType: CommandType.StoredProcedure);

                        int updateStatus = this.m_dbconnection.Execute(procedureName, new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = requestApproval.DocumentId,
                            CompanyId = requestApproval.CompanyId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId
                        },
                          transaction: transactionObj,
                      commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = requestApproval.DocumentId,
                            ProcessId = requestApproval.ProcessId,
                            Remarks = requestApproval.Remarks,
                            StatusId = requestApproval.WorkFlowStatusId,
                            UserId = requestApproval.UserId
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
                                NotificationType = SharedRepository.GetNotificationType(requestApproval.ProcessId),
                                NotificationMessage = SharedRepository.GetNotificationMessage(requestApproval.ProcessId, requestApproval.WorkFlowStatusId),
                                ProcessId = requestApproval.ProcessId,
                                ProcessName = "",
                                DocumentId = requestApproval.DocumentId,
                                UserId = requestApproval.ApproverUserId,
                                IsRead = false,
                                CreatedBy = requestApproval.UserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = requestApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                                DocumentCode = requestApproval.DocumentCode
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...                      
                        transactionObj.Commit();
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress) || requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                        {
                            if (requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract) ||
                                requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract) ||
                                requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))
                            {
                                SendReplyForClarificationMail(requestApproval);
                            }
                            else
                            {
                                this.SendDocumentRequestReplyMail(requestApproval.ApproverUserId, requestApproval.RequestUserId, requestApproval.Remarks, requestApproval.DocumentId, requestApproval.ProcessId, requestApproval.DocumentCode, requestApproval.CompanyId);
                            }
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(requestApproval.UserId);
                            string approverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            DateTime now = DateTime.Now;
                            //if (requestApproval.ProcessId == 22)
                            //{


                            //    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.DocumentId.ToString(), "POPStatusUpdate", "Reply sent for clarification for the Project Contract Master " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                            //}
                            if (requestApproval.ProcessId == (int)WorkFlowProcessTypes.ProjectMasterContract)
                            {
                                AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.DocumentId.ToString(), "PPCStatusUpdate", "Reply sent for clarification for the Project Contract Master by " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);
                            }
                            if (requestApproval.ProcessId == (int)WorkFlowProcessTypes.ProjectPaymentContract)
                            {
                                AuditLog.Info(WorkFlowProcessTypes.ProjectPaymentContract.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.DocumentId.ToString(), "PPCStatusUpdate", "Reply sent for clarification for the Project Invoice by " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);
                            }
                            if (requestApproval.ProcessId == (int)WorkFlowProcessTypes.ProjectContractVariationOrder)
                            {
                                AuditLog.Info(WorkFlowProcessTypes.ProjectContractVariationOrder.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.DocumentId.ToString(), "PVOStatusUpdate", "Reply sent for clarification for the Project Variation Order by " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);
                            }
                            if (requestApproval.ProcessId == (int)WorkFlowProcessTypes.SupplierInvoice)
                            {
                                AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.DocumentId.ToString(), "PVOStatusUpdate", "Reply sent for clarification for the Supplier Invoice by " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);
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

        public bool SendDocumentRequestMail(int approverUserId, int documentId, int processId, int companyId)
        {
            objUserRepository = new UserProfileRepository();
            UserProfile approverDetails = objUserRepository.GetUserById(approverUserId);//getting the approver details based on user id..
            string type = GetNotificationMessage(processId);
            string docType = string.Empty;
            CompanyDetails companyDetails = GetCompanyDetails(companyId);
            bool result = false;
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer))// asset transfer request...
            {
                var assetDetails = new AssetTransferRepository().GetAssetTransferRequestDetails(documentId);
                result = Util.Email.AssetTransferEmailProvider.SendAssetTransferRequestMail(documentId, type, assetDetails, approverDetails);
            }
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer))// location transfer request...
            {
                var itemDetails = new LocationTransferRepository().GetLocationTransferDetails(documentId);
                result = Util.Email.LocationTransferEmailProvider.SendLocationTransferRequestMail(documentId, type, itemDetails, approverDetails);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal)) // asset disposal request..
            {
                var assetDetails = new AssetDisposalRepository().GetAssetDisposalRequestDetails(documentId);
                result = Util.Email.AssetDisposalEmailProvider.SendAssetDisposalRequestMail(documentId, type, assetDetails, approverDetails);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation)) // asset depreciation request...
            {
                var assetDepDetails = new AssetDepreciationRepository().GetAssetDepreciationRequestDetails(documentId);
                result = Util.Email.AssetDepreciationEmailProvider.SendAssetDepreciationRequestMail(documentId, type, assetDepDetails, approverDetails);
            }
            //else if (processId == Convert.ToInt32(WorkFlowProcessTypes.CreditNote)) // credit note request...
            //{
            //    var creditNoteDetails = new CreditNoteRepository().GetCreditNoteDetails(documentId);
            //    result = Util.Email.CreditNoteEmailProvider.SendCreditNoteRequestMail(documentId, type, creditNoteDetails, approverDetails);
            //}
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes)) // goods return note...
            {
                var goodreturnNoteDetails = new GoodsReturnedNotesRepository().GetGoodsReturnedNotesDetails(documentId);
                result = Util.Email.GoodsReturnedNotesEmailProvider.SendGoodsReturnNoteRequestMail(documentId, type, goodreturnNoteDetails, approverDetails);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier)) // goods return note...
            {
                docType = "SS";
                var supplierDetails = new SupplierRepository().GetSupplier(documentId, companyId);
                UserProfile sender = objUserRepository.GetUserById(supplierDetails.CreatedBy);
                result = Util.Email.SupplierEmailProvider.SendSupplierRequestMail(documentId, docType, type, supplierDetails, approverDetails, sender, companyDetails);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract)) // project master contract next approver mail
            {
                docType = "POP Contract";
                var projectMasterContractDetails = new ProjectMasterContractRepository().GetProjectMasterContractDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(projectMasterContractDetails.CreatedBy);
                result = Util.Email.ProjectMasterContractProvider.SendProjectMasterContractRequestMail(documentId, docType, companyDetails.CompanyShortName, type, projectMasterContractDetails, approverDetails, sender);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract)) // Project Payment Contract
            {
                docType = "POP Pyt";
                var projectPaymentContractDetails = new ProjectPaymentContractRepository().getCertificatesByPaymentContractId(0, documentId);
                UserProfile sender = objUserRepository.GetUserById(projectPaymentContractDetails.CreatedBy);
                result = Util.Email.ProjectPaymentContractEmailProvider.SendProjectPaymentContractRequestMail(documentId, docType, companyDetails.CompanyShortName, type, projectPaymentContractDetails, approverDetails, sender);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice)) // Supplier Invoice...
            {
                docType = "INV";
                var invoiceTypeId = new InvoiceRepository().UpdateInvoiceType(documentId);
                var invoicePOTypeId = new InvoiceRepository().GetInvoicePOType(documentId);

                var invoiceDetails = new InvoiceRepository().GetInvoiceDetails(documentId, invoiceTypeId, invoicePOTypeId, companyId);
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                UserProfile requestor = userProfileRepository.GetUserById(invoiceDetails.RequestedBy);
                invoiceDetails.RequestedByUserName = requestor.FirstName + " " + requestor.LastName;
                result = Util.Email.InvoiceEmailProvider.SendInvoiceRequestMail(documentId, docType, companyDetails.CompanyShortName, type, invoiceDetails, approverDetails);
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder)) // project variation order
            {
                docType = "POP VO";
                var variationOrder = new ProjectContractVariationOrderRepository().getVODetailsbyId(0, documentId);
                variationOrder.VOId = documentId;
                UserProfile sender = objUserRepository.GetUserById(variationOrder.CreatedBy);
                result = Util.Email.ProjectContractVariationOrderEmailProvider.SendProjectContractVariationOrderRequestMail(documentId, docType, companyDetails.CompanyShortName, type, variationOrder, approverDetails, sender);
            }
            return result;
        }

        public void SendDocumentApprovalMail(int previousApproverUserId, int documentId, string status, int processId, int nextApproverUserId, int companyId)
        {
            string type = string.Empty;
            string docType = string.Empty;
            string companyShortName = GetCompanyDetails(companyId).CompanyShortName;
            objUserRepository = new UserProfileRepository();
            string previousApproverStatus = string.Empty;
            UserProfile previousApprover = objUserRepository.GetUserById(previousApproverUserId);
            UserProfile nextapprovUser = null;
            if (nextApproverUserId > 0)
            {
                UserProfile nextapprover = objUserRepository.GetUserById(nextApproverUserId);
                nextapprovUser = objUserRepository.GetUserById(nextApproverUserId);
                previousApproverStatus = $"{"Approved by "}{ previousApprover.FirstName} { previousApprover.LastName}";
                var currentApproverStatus = $"{status} {" [ "} {nextapprover.FirstName} {nextapprover.LastName} {" ] "}";
                if (nextapprover != null)
                {
                    status = $"{currentApproverStatus}";
                }
            }
            else
            {
                previousApproverStatus = status;
            }
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer))// asset transfer request...
            {
                var assetTransferDetails = new AssetTransferRepository().GetAssetTransferRequestDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(assetTransferDetails.CreatedBy);
                if (assetTransferDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.AssetTransferEmailProvider.SendAssetTransferRequestApprovalMail(assetTransferDetails, previousApprover, type, status, previousApproverStatus, sender);
                }
            }
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer))// location transfer request...
            {
                var locationTransferDetails = new LocationTransferRepository().GetLocationTransferDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(locationTransferDetails.CreatedBy);
                var value = new LocationTransferRepository().CreateItemMasterThrowLocationTransfer(locationTransferDetails, sender);
                if (locationTransferDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.LocationTransferEmailProvider.SendLocationTransferRequestApprovalMail(locationTransferDetails, previousApprover, type, status, previousApproverStatus, sender);
                }
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal))// asset disposal request...
            {
                var assetDisposalDetails = new AssetDisposalRepository().GetAssetDisposalRequestDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(assetDisposalDetails.CreatedBy);
                if (assetDisposalDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.AssetDisposalEmailProvider.SendAssetDisposalRequestApprovalMail(assetDisposalDetails, previousApprover, type, status, previousApproverStatus, sender);
                }
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDepreciation))//asset depreciation
            {
                var assetDepDetails = new AssetDepreciationRepository().GetAssetDepreciationRequestDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(assetDepDetails.CreatedBy);
                if (assetDepDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.AssetDepreciationEmailProvider.SendAssetDepreciationRequestApprovalMail(assetDepDetails, previousApprover, type, status, previousApproverStatus, sender);
                }
            }
            //else if (processId == Convert.ToInt32(WorkFlowProcessTypes.CreditNote))//Credit Note
            //{
            //    var creditNoteDetails = new CreditNoteRepository().GetCreditNoteDetails(documentId);
            //    UserProfile sender = objUserRepository.GetUserById(creditNoteDetails.CreatedBy);
            //    if (creditNoteDetails != null)
            //    {
            //        type = GetNotificationMessage(processId);
            //        Util.Email.CreditNoteEmailProvider.SendCreditNoteRequestApprovalMail(creditNoteDetails, previousApprover, type, status, previousApproverStatus, sender);
            //    }
            //}
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes))//goods Return Note
            {
                var goodsreturnNoteDetails = new GoodsReturnedNotesRepository().GetGoodsReturnedNotesDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(goodsreturnNoteDetails.CreatedBy);
                var value = new GoodsReturnedNotesRepository().IncreaseQuantity(goodsreturnNoteDetails, sender);
                if (goodsreturnNoteDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.GoodsReturnedNotesEmailProvider.SendGoodsReturnNoteRequestApprovalMail(goodsreturnNoteDetails, previousApprover, type, status, previousApproverStatus, sender);
                }
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))//Supplier
            {
                docType = "SS";
                var supplierDetails = new SupplierRepository().GetSupplier(documentId, companyId);
                UserProfile sender = objUserRepository.GetUserById(supplierDetails.CreatedBy);
                if (supplierDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.SupplierEmailProvider.SendSupplierRequestApprovalMail(supplierDetails, docType, companyShortName, previousApprover, type, status, previousApproverStatus, sender);
                }
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectMasterContract))//project master contract
            {
                var projectMasterContractDetails = new ProjectMasterContractRepository().GetProjectMasterContractDetails(documentId);
                UserProfile sender = objUserRepository.GetUserById(projectMasterContractDetails.CreatedBy);
                if (projectMasterContractDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.ProjectMasterContractProvider.SendProjectMasterContractRequestApprovalMail(projectMasterContractDetails, companyShortName, previousApprover, type, status, previousApproverStatus, sender, nextapprovUser);
                }
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))//project payment contract
            {
                var projectPaymentContractDetails = new ProjectPaymentContractRepository().getCertificatesByPaymentContractId(0, documentId);
                UserProfile sender = objUserRepository.GetUserById(projectPaymentContractDetails.CreatedBy);
                if (projectPaymentContractDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.ProjectPaymentContractEmailProvider.SendProjectPaymentContractRequestApprovalMail(projectPaymentContractDetails, companyShortName, previousApprover, type, status, previousApproverStatus, sender, nextapprovUser);
                }
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectContractVariationOrder))//project variation order
            {
                var variationOrder = new ProjectContractVariationOrderRepository().getVODetailsbyId(0, documentId);
                variationOrder.VOId = documentId;
                UserProfile sender = objUserRepository.GetUserById(variationOrder.CreatedBy);
                if (variationOrder != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.ProjectContractVariationOrderEmailProvider.SendProjectContractVariationOrderRequestApprovalMail(variationOrder, companyShortName, previousApprover, type, status, previousApproverStatus, sender, nextapprovUser);
                }
            }

            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))//Supplier Invoice
            {
                docType = "INV";
                var invoiceTypeId = new InvoiceRepository().UpdateInvoiceType(documentId);
                var invoicePOTypeId = new InvoiceRepository().GetInvoicePOType(documentId);
                var invoiceDetails = new InvoiceRepository().GetInvoiceDetails(documentId, invoiceTypeId, invoicePOTypeId, companyId);
                if (invoiceDetails.InvoiceTypeId == 1)
                {
                    var GrnUpdate = new InvoiceRepository().UpdateGRNStatus(invoiceDetails);
                }
                UserProfile sender = objUserRepository.GetUserById(invoiceDetails.CreatedBy);
                UserProfile requetor = objUserRepository.GetUserById(invoiceDetails.RequestedBy);
                invoiceDetails.RequestedByUserName = requetor.FirstName + " " + requetor.LastName;
                if (invoiceDetails != null)
                {
                    type = GetNotificationMessage(processId);
                    Util.Email.InvoiceEmailProvider.SendInvoiceRequestApprovalMail(companyShortName, docType, invoiceDetails, previousApprover, type, status, previousApproverStatus, sender);
                }
            }
        }

        public void SendDocumentRequestClarificationMail(int approverUserId, int requesterId, string approverComments, int documentId, int processId, string documentCode, int CompanyId)
        {
            DocumentRequestClarificationMail documentRequestClarficationMail = PrepareDocumentRequestMailData(approverUserId, requesterId, approverComments, documentId, documentCode);
            string type = string.Empty;
            string docType = string.Empty;
            string routePath = string.Empty;
            type = GetNotificationMessage(processId);
            documentRequestClarficationMail.CompanyShortName = GetCompanyDetails(CompanyId).CompanyShortName;
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
            {
                supplierRepository = new SupplierRepository();
                Supplier supplier = supplierRepository.GetSupplier(documentId, CompanyId);
                documentRequestClarficationMail.SupplierShortName = supplier.SupplierShortName;
                documentRequestClarficationMail.DocumentCode = supplier.SupplierCode;
                documentRequestClarficationMail.WorkflowStatus = supplier.WorkFlowStatus;
                type = $"{"Supplier"}";
                docType = $"{"SS"}";
                routePath = ConfigurationManager.AppSettings["SupplierReq"];
            }
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
            {
                docType = $"{"INV"}";
                documentRequestClarficationMail.WorkflowStatus = "Return for clarifications";
                routePath = ConfigurationManager.AppSettings["InvoiceRequest"];
            }
            if (documentRequestClarficationMail != null)
            {
                documentRequestClarficationMail.CompanyId = CompanyId;
                documentRequestClarficationMail.ProcessId = processId;
                Util.Email.SharedEmailProvider.SendClarificationMail(documentRequestClarficationMail, docType, routePath, type);
            }
        }

        public void SendDocumentRequestReplyMail(int? approverUserId, int requesterId, string approverComments, int documentId, int processId, string documentCode, int CompanyId)
        {
            string type = string.Empty;
            string docType = string.Empty;
            string routePath = string.Empty;
            CompanyDetails company = GetCompanyDetails(CompanyId);
            DocumentRequestClarificationMail documentRequestClarficationMail = new DocumentRequestClarificationMail();
            documentRequestClarficationMail = PrepareDocumentRequestMailData(approverUserId, requesterId, approverComments, documentId, documentCode);
            type = GetNotificationMessage(processId);
            documentRequestClarficationMail.WorkflowStatus = "Reply for Confirmation";
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
            {
                supplierRepository = new SupplierRepository();
                Supplier supplier = supplierRepository.GetSupplier(documentId, CompanyId);
                documentRequestClarficationMail.SupplierShortName = supplier.SupplierShortName;
                documentRequestClarficationMail.DocumentCode = supplier.SupplierCode;

                type = $"{"Supplier"}";
                docType = $"{"SS"}";
                routePath = ConfigurationManager.AppSettings["SupplierRequestApproval"];
            }
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
            {
                docType = $"{"INV"}";
                routePath = ConfigurationManager.AppSettings["InvoiceRequestApproval"];
            }

            if (documentRequestClarficationMail != null)
            {
                documentRequestClarficationMail.ProcessId = processId;
                documentRequestClarficationMail.CompanyId = CompanyId;
                documentRequestClarficationMail.CompanyShortName = company.CompanyShortName;
                Util.Email.SharedEmailProvider.SendClarificationReplyMail(documentRequestClarficationMail, docType, routePath, type);
            }
        }

        private DocumentRequestClarificationMail PrepareDocumentRequestMailData(int? approverUserId, int requesterId, string approverComments, int documentId, string documentCode)
        {
            objUserRepository = new UserProfileRepository();
            DocumentRequestClarificationMail documentRequestClarficationMail = new DocumentRequestClarificationMail();
            UserProfile approver = objUserRepository.GetUserById(approverUserId);
            UserProfile requester = objUserRepository.GetUserById(requesterId);
            if (approver != null)
            {
                documentRequestClarficationMail.ApproverName = approver.FirstName;
                documentRequestClarficationMail.ApproverEmail = approver.EmailId;
            }

            if (requester != null)
            {
                documentRequestClarficationMail.RequesterName = requester.FirstName;
                documentRequestClarficationMail.RequesterEmail = requester.EmailId;
            }

            if (approver != null && requester != null)
            {
                documentRequestClarficationMail.DocumentId = documentId;
                documentRequestClarficationMail.ApproverComments = approverComments;
                documentRequestClarficationMail.DocumentCode = documentCode;
            }

            return documentRequestClarficationMail;
        }

        public IEnumerable<SupplierService> GetJobCategory(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<SupplierService>("usp_GetJobCategory",
                    new
                    {
                        SearchKey = searchKey
                    }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<ItemCategory> GetItemCategorys(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<ItemCategory>("usp_GetAllDetails",
                                         new
                                         {
                                             Action = "ITEMCATEGORY",
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<ItemType> GetItemTypes(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<ItemType>("usp_GetAllDetails",
                                         new
                                         {
                                             Action = "ITEMTYPE",
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<ItemMasters> GetItemMasterName(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<ItemMasters>("usp_GetAllDetails",
                                         new
                                         {
                                             Action = "ITEMNAME",
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void PostAssetDepreciation(IDbConnection dbConnection, IDbTransaction dbTransaction, int assetDepreciationId)
        {

            List<AssetDetails> assetDetails = new List<AssetDetails>();
            List<AssetDetails> assetDepDetails = new List<AssetDetails>();
            using (var result = dbConnection.QueryMultiple("AssetDepreciation_CRUD", new
            {
                Action = "DEPDETAILS",
                AssetDepreciationId = assetDepreciationId
            }, commandType: CommandType.StoredProcedure, transaction: dbTransaction))
            {
                assetDetails = result.Read<AssetDetails>().ToList();
                assetDepDetails = result.Read<AssetDetails>().ToList();
            };

            List<DynamicParameters> dynamicParameters = new List<DynamicParameters>();
            assetDetails.ForEach(data =>
            {
                //total number of years for which depreciation has been calculated
                var depCalYears = assetDepDetails.Where(i => i.AssetDetailsId == data.AssetDetailsId).Count();
                var dep_amount = (data.CurrentValue - data.SalvageValue) / (data.DepreciationYears - (depCalYears));
                var acc_dep_amount = (depCalYears + 1) * dep_amount;
                DynamicParameters dynamicObj = new DynamicParameters();
                dynamicObj.AddDynamicParams(new
                {
                    Action = "POSTDEPRECIATION",
                    BeginningValue = data.CurrentValue,
                    SalvageValue = data.SalvageValue,
                    DepreciationAmount = dep_amount,
                    AccDepreciationAmount = acc_dep_amount,
                    EndingValue = data.CurrentValue - dep_amount,
                    DateOfPosting = DateTime.Now,
                    AssetDetailsId = data.AssetDetailsId,
                    AssetDepreciationId = assetDepreciationId
                });
                dynamicParameters.Add(dynamicObj);
            });

            var assetDepreciationResult = dbConnection.Execute("AssetDepreciation_CRUD", dynamicParameters, transaction: dbTransaction,
                                                     commandType: CommandType.StoredProcedure);

        }

        public IEnumerable<AccountCode> GetAllSearchServices(string searchKey, int companyId, int categoryId)
        {
            try
            {
                return this.m_dbconnection.Query<AccountCode>("AccountCodes_CRUD", new
                {
                    Action = "SERVICES",
                    Search = searchKey,
                    AccountCodeCategoryId = categoryId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<AccountCode> GetAccountCodesByCategory(int categoryId, int companyId, string searchkey)
        {
            try
            {
                return this.m_dbconnection.Query<AccountCode>("AccountCodes_CRUD", new
                {
                    Action = "EXPENSES",
                    AccountCodeCategoryId = categoryId,
                    CompanyId = companyId,
                    Search = searchkey != null ? searchkey.Trim() : searchkey
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<AccountCode> GetAccountCodesBySubCategory(int categoryId, int accountTypeId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<AccountCode>("sp_AccountCodesbySubCat", new
                {

                    AccountCodeCategoryId = categoryId,
                    AccountTypeId = accountTypeId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<AccountCode> GetAccountCodesByAccountType(int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<AccountCode>("usp_AccountCodes", new
                {
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<TaxGroup> GetTaxGroups()
        {
            return this.m_dbconnection.Query<TaxGroup>("GetTaxGroups", commandType: CommandType.StoredProcedure).ToList();
        }

        public TaxGroup GetTaxGroups(string groupName)
        {
            return this.m_dbconnection.Query<TaxGroup>("select * from TaxGroup where TaxGroupName ='" + groupName + "'", commandType: CommandType.Text).FirstOrDefault();
        }

        public IEnumerable<Organization> getOrganizations()
        {
            try
            {
                return this.m_dbconnection.Query<Organization>("GetOrganizations", commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DashboardCount GetDashboardCount(int CompanyId)
        {
            try
            {
                return this.m_dbconnection.Query<DashboardCount>("getDashboardCount", new
                {
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Taxes> GetTaxClassesByTaxGroup(int taxGroupId)
        {
            try
            {
                return this.m_dbconnection.Query<Taxes>("usp_GetTaxes",
                                       new
                                       {
                                           Action = "TAXCLASSES",
                                           TaxGroupId = taxGroupId
                                       },
                                       commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<ServiceType> GetAllServiceTypes()
        {
            try
            {
                var result = this.m_dbconnection.Query<ServiceType>("ServiceType_CRUD", new
                {
                    Action = "SELECTALL",
                }, commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IEnumerable<SupplierSubCode> GetSupplierSubCodes(SupplierSubCode subCode)
        {
            try
            {
                return this.m_dbconnection.Query<SupplierSubCode>("SearchSupplierSubCodes",
                                       new
                                       {
                                           SupplierId = subCode.SupplierId,
                                           CompanyId = subCode.CompanyId
                                       },
                                       commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<SupplierContactPerson> GetSupplierContact(int supplierId, int companyId, int purchaseOrderId, int poTYpeId)
        {
            List<SupplierContactPerson> list = new List<SupplierContactPerson>();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("GetSupplierContact", new
                {
                    // Action = "SELECTBYID",
                    supplierId = supplierId,
                    companyId = companyId,
                    PurchaseOrderId = purchaseOrderId,
                    POTypeId = poTYpeId
                }, commandType: CommandType.StoredProcedure))
                {
                    var list1 = result.Read<SupplierContactPerson>().ToList();
                    var list2 = result.Read<SupplierContactPerson>().FirstOrDefault();
                    for (int i = 0; i < list1.Count; i++)
                    {
                        list.Add(list1[i]);
                    }
                    if (list2.Name != null || list2.EmailId != null)
                    {
                        list.Add(list2);
                    }
                }

                return list;
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        public IEnumerable<COAAccountType> GetAccountType()
        {
            try
            {
                return this.m_dbconnection.Query<COAAccountType>("usp_COAAccountType",
                                       commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string SupplierVerificationApproval(WorkFlowParameter workFlowApproval)
        {
            this.m_dbconnection.Open();//opening the connection...
            int approvalCount = 0;
            int status = 0;
            bool isNextApprover = false;
            int workFlowStatusId = 0;
            string approvalStatus = string.Empty;
            workFlowConfigRepository = new WorkFlowConfigurationRepository();
            supplierRepository = new SupplierRepository();
            Supplier supplier = null;
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    //Updating supplier attached companies details with new one
                    var supplierCompanies = this.m_dbconnection.Query<SupplierAttachedCompanies>("SupplierAttachedCompanies",
                      new
                      {
                          Action = "SELECT",
                          SupplierId = workFlowApproval.ParentDocumentId,
                          CompanyId = workFlowApproval.CompanyId,
                      }, transaction: transactionObj,
                      commandType: CommandType.StoredProcedure).ToList();

                    if (supplierCompanies != null)
                    {
                        if (supplierCompanies.Count > 0)
                        {
                            foreach (var supplierCompany in supplierCompanies)
                            {
                                supplier = new Supplier();
                                //supplier = supplierRepository.GetSupplier(supplierCompany.SupplierId, supplierCompany.CompanyId);
                                supplier = GetSupplier(supplierCompany.SupplierId, supplierCompany.CompanyId, transactionObj);
                                if (supplier != null)
                                {
                                    if (supplier.SupplierCompanyDetails != null)
                                    {
                                        var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                                       new
                                       {
                                           Action = "INSERT",
                                           SupplierId = workFlowApproval.DocumentId,
                                           CompanyId = supplier.SupplierCompanyDetails.CompanyId,
                                           TaxId = supplier.SupplierCompanyDetails.TaxId,
                                           TaxClass = supplier.SupplierCompanyDetails.TaxClass,
                                           RateType = supplier.SupplierCompanyDetails.RateType,
                                           Justification = string.IsNullOrEmpty(supplier.SupplierCompanyDetails.Justification) ? string.Empty : supplier.SupplierCompanyDetails.Justification,
                                           CurrencyId = supplier.SupplierCompanyDetails.CurrencyId,
                                           CreditLimit = supplier.SupplierCompanyDetails.CreditLimit,
                                           BankCode = supplier.SupplierCompanyDetails.BankCode,
                                           GLAccount = supplier.SupplierCompanyDetails.GLAccount,
                                           ReviewedDate = supplier.SupplierCompanyDetails.ReviewedDate,
                                           PaymentTermsId = supplier.SupplierCompanyDetails.PaymentTermsId
                                       }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                                    }


                                    if (supplier.SupplierApproval != null)
                                    {
                                        var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierApproval_CRUD",
                                       new
                                       {
                                           Action = "INSERT",
                                           SupplierId = workFlowApproval.DocumentId,
                                           CompanyId = supplier.SupplierApproval.CompanyId,
                                           WorkFlowStatusId = supplier.SupplierApproval.WorkFlowStatusId
                                       }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                                    }

                                    if (supplier.SupplierServices != null)
                                    {
                                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                        foreach (var record in supplier.SupplierServices)
                                        {
                                            var itemObj = new DynamicParameters();

                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@SupplierId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@SupplierServiceID", record.SupplierServiceID, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                                            itemToAdd.Add(itemObj);
                                        }
                                        var result = this.m_dbconnection.Execute("SupplierSelectedService_CRUD", itemToAdd, transaction: transactionObj,
                                                                            commandType: CommandType.StoredProcedure);
                                    }

                                    if (supplier.Attachments != null)
                                    {
                                        List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                                        for (var i = 0; i < supplier.Attachments.Count; i++)
                                        {
                                            if (supplier.Attachments[i].AttachmentId == 0)
                                            {
                                                var itemObj = new DynamicParameters();
                                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                                itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Supplier), DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@RecordId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@FileName", supplier.Attachments[i].FileName, DbType.String, ParameterDirection.Input);
                                                itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                                fileToSave.Add(itemObj);
                                            }

                                            if (supplier.Attachments[i].IsDelete)
                                            {
                                                if (supplier.Attachments[i].AttachmentId > 0)
                                                {
                                                    var fileObj = new DynamicParameters();
                                                    fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                                    fileObj.Add("@AttachmentTypeId", supplier.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                                    fileObj.Add("@RecordId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                                                    fileObj.Add("@AttachmentId", supplier.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                                    fileToDelete.Add(fileObj);
                                                }
                                            }
                                        }

                                        var salesOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                            commandType: CommandType.StoredProcedure);

                                        //deleting files in the folder...
                                        var result = from a in supplier.Attachments
                                                     where a.IsDelete == true
                                                     select a;

                                        var deleteCount = result.Count();

                                        if (deleteCount > 0)
                                        {
                                            var salesOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                            commandType: CommandType.StoredProcedure);

                                            FileOperations fileOperationsObj = new FileOperations();
                                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                            {
                                                CompanyName = "UEL",
                                                ModuleName = AttachmentFolderNames.Supplier,
                                                //FilesNames = supplier.Attachments.Select(j => j.FileName ).ToArray(),
                                                FilesNames = supplier.Attachments.Where(j => j.IsDelete == true).Select(j => j.FileName).ToArray(),
                                                UniqueId = supplier.SupplierId.ToString()
                                            });
                                        }
                                    }

                                    if (supplier.SubCodes != null)
                                    {
                                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                        foreach (var record in supplier.SubCodes)
                                        {
                                            var itemObj = new DynamicParameters();

                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@SupplierId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@SubCodeDescription", record.SubCodeDescription, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@SubCode", record.SubCode, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@AccountSetId", record.AccountSetId, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@LocationId", supplier.LocationId, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                            itemToAdd.Add(itemObj);
                                        }
                                        var subCodesaveResult = this.m_dbconnection.Execute("SupplierSubCode_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                                    }

                                    if (supplier.ContactPersons != null)
                                    {
                                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                        foreach (var record in supplier.ContactPersons)
                                        {
                                            var itemObj = new DynamicParameters();

                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@SupplierId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            itemObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);

                                            itemToAdd.Add(itemObj);
                                        }
                                        var contactPersonSaveResult = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", itemToAdd, transaction: transactionObj,
                                                                            commandType: CommandType.StoredProcedure);
                                    }

                                    var approvers = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD",
                                      new
                                      {
                                          Action = "VERIFIERAPPROVER",
                                          DocumentId = workFlowApproval.ParentDocumentId,
                                          ProcessId = workFlowApproval.ProcessId,
                                          CompanyId = supplierCompany.CompanyId,
                                      }, transaction: transactionObj,
                                      commandType: CommandType.StoredProcedure).ToList();

                                    if (approvers != null)
                                    {
                                        if (approvers.Count > 0)
                                        {
                                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                            foreach (var approver in approvers)
                                            {
                                                var itemObj = new DynamicParameters();
                                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                                itemObj.Add("@DocumentId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@ProcessId", approver.ProcessId, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@CompanyId", supplierCompany.CompanyId, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@ApproverUserId", approver.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@WorkFlowOrder", approver.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                                                itemObj.Add("@WorkFlowStatusId", approver.Status, DbType.Int32, ParameterDirection.Input);
                                                itemToAdd.Add(itemObj);
                                            }

                                            var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                        }
                                    }
                                }
                            }
                        }
                    }


                    //var verificationApprover = approverList.Where(app => app.RoleID == workFlowApproval.RoleID && app.CompanyId == workFlowApproval.CompanyId).FirstOrDefault();

                    var approverList = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD",
                      new
                      {
                          Action = "VERIFIERAPPROVER",
                          DocumentId = workFlowApproval.ParentDocumentId,
                          ProcessId = workFlowApproval.ProcessId,
                          CompanyId = workFlowApproval.CompanyId,
                      }, transaction: transactionObj,
                      commandType: CommandType.StoredProcedure).ToList();

                    var verificationApprover = approverList.Where(app => app.IsSupplierVerrfier == true).FirstOrDefault();

                    //if (approverList != null)
                    //{
                    //    if (approverList.Count > 0)
                    //    {
                    //        approvalCount = approverList.Count;
                    //        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                    //        List<DynamicParameters> itemToRemove= new List<DynamicParameters>();
                    //        foreach (var approver in approverList)
                    //        {
                    //            var itemObj = new DynamicParameters();
                    //            if (verificationApprover != null && verificationApprover.NextValue != null)
                    //            {
                    //                if (verificationApprover.NextValue == approver.ApproverUserId)
                    //                {
                    //                    status = Convert.ToInt32(WorkFlowStatus.ApprovalInProgress);
                    //                    isNextApprover = true;
                    //                }
                    //                else
                    //                {
                    //                    if (isNextApprover)
                    //                    {
                    //                        status = Convert.ToInt32(WorkFlowStatus.Initiated);
                    //                    }
                    //                    else
                    //                    {
                    //                        status = approver.Status;
                    //                    }
                    //                }
                    //            }
                    //            else
                    //            {
                    //                status = approver.Status;
                    //            }


                    //            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                    //            itemObj.Add("@DocumentId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                    //            itemObj.Add("@ProcessId", approver.ProcessId, DbType.Int32, ParameterDirection.Input);
                    //            itemObj.Add("@CompanyId", workFlowApproval.CompanyId, DbType.Int32, ParameterDirection.Input);
                    //            itemObj.Add("@ApproverUserId", approver.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                    //            itemObj.Add("@WorkFlowOrder", approver.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                    //            itemObj.Add("@WorkFlowStatusId", status, DbType.Int32, ParameterDirection.Input);
                    //            itemToAdd.Add(itemObj);
                    //        }

                    //        //checking supplier credit limit
                    //        int count = 0;
                    //        var updatedApproverList = this.workFlowConfigRepository.GetWorkFlowApprovers(workFlowApproval);
                    //        var isCreditLimit = updatedApproverList.FirstOrDefault(x => x.IsCreditLimit == true);
                    //        var itemDeleteObj = new DynamicParameters();
                    //        bool isSame = true;

                    //        var updatedLst = from u in updatedApproverList
                    //                         orderby u.ApproverUserId ascending
                    //                         select u.ApproverUserId;

                    //        var appLst = from a in approverList
                    //                     orderby a.ApproverUserId ascending
                    //                     select a.ApproverUserId;

                    //        isSame = updatedLst.SequenceEqual(appLst);
                    //        if (workFlowApproval.IsCreditLimitChanged || !isSame)   //&& isCreditLimit!=null
                    //        {
                    //            foreach (var item in itemToAdd)
                    //            {
                    //                foreach (var name in item.ParameterNames)
                    //                {
                    //                    if (name.Trim().ToLower() == "approveruserid")
                    //                    {
                    //                        var pValue = item.Get<dynamic>(name);
                    //                        if (itemToRemove != null)
                    //                        {
                    //                            if (itemToRemove.Count() > 0)
                    //                            {
                    //                                if (verificationApprover.NextValue == null)
                    //                                {
                    //                                    verificationApprover.NextValue = pValue;
                    //                                }
                    //                            }
                    //                        }

                    //                        var match = updatedApproverList.FirstOrDefault(x => x.ApproverUserId == pValue);
                    //                        if (match == null)
                    //                        {
                    //                            itemDeleteObj = item;
                    //                        }

                    //                        if (!isSame)
                    //                        {
                    //                            if (verificationApprover != null)
                    //                            {
                    //                                if (pValue == verificationApprover.NextValue)
                    //                                {
                    //                                    itemDeleteObj = item;
                    //                                    verificationApprover.NextValue = null;
                    //                                    itemToRemove.Add(itemDeleteObj);
                    //                                }
                    //                            }
                    //                        }
                    //                    }
                    //                }                                   

                    //            }

                    //            if (itemToRemove != null)
                    //            {
                    //                if (itemToRemove.Count() > 0)
                    //                {
                    //                    foreach (var deleteObj in itemToRemove)
                    //                    {
                    //                        if (deleteObj.ParameterNames.Count() > 0)
                    //                        {
                    //                            itemToAdd.Remove(deleteObj);
                    //                        }
                    //                    }
                    //                }
                    //            }


                    //            var workFlowOrder = itemToAdd.OrderByDescending(x => x.Get<dynamic>("WorkFlowOrder")).FirstOrDefault();
                    //            int order = workFlowOrder.Get<dynamic>("WorkFlowOrder");
                    //            foreach (var updatedApprover in updatedApproverList)
                    //            {
                    //                var match = approverList.FirstOrDefault(x => x.ApproverUserId == updatedApprover.ApproverUserId);
                    //                var itemObj = new DynamicParameters();
                    //                if (match == null)
                    //                {
                    //                    count++;
                    //                    order += 1;
                    //                    if (count == 1)
                    //                    {                                           
                    //                        if (verificationApprover.NextValue == null)
                    //                        {
                    //                            verificationApprover.NextValue = updatedApprover.ApproverUserId;
                    //                            status = Convert.ToInt32(WorkFlowStatus.ApprovalInProgress);
                    //                        }
                    //                        else
                    //                        {
                    //                            status = Convert.ToInt32(WorkFlowStatus.Initiated);
                    //                        }
                    //                    }

                    //                    if (workFlowApproval.IsCreditLimitChanged || !isSame)  // && updatedApprover.IsCreditLimit
                    //                    {
                    //                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                    //                        itemObj.Add("@DocumentId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                    //                        itemObj.Add("@ProcessId", updatedApprover.ProcessId, DbType.Int32, ParameterDirection.Input);
                    //                        itemObj.Add("@CompanyId", workFlowApproval.CompanyId, DbType.Int32, ParameterDirection.Input);
                    //                        itemObj.Add("@ApproverUserId", updatedApprover.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                    //                        //itemObj.Add("@WorkFlowOrder", updatedApprover.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                    //                        itemObj.Add("@WorkFlowOrder", order, DbType.Int32, ParameterDirection.Input);
                    //                        itemObj.Add("@WorkFlowStatusId", status, DbType.Int32, ParameterDirection.Input);
                    //                        itemToAdd.Add(itemObj);
                    //                        count = 0;
                    //                    }
                    //                }
                    //            }

                    //        }
                    //        var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                    //    }
                    //}

                    try
                    {
                        ///
                        var updatedApproverList = this.workFlowConfigRepository.GetWorkFlowApprovers(workFlowApproval);
                        var isCreditLimit = updatedApproverList.FirstOrDefault(x => x.IsCreditLimit == true);
                        List<DynamicParameters> workflowItems = new List<DynamicParameters>();
                        DynamicParameters workflowItem = new DynamicParameters();
                        int currentstatus = Convert.ToInt32(WorkFlowStatus.Approved);
                        bool initiated = false;
                        bool isVerifierOver = false;
                        int cnt = 0;
                        foreach (var updatedApprover in updatedApproverList)
                        {
                            cnt++;
                            workflowItem = new DynamicParameters();
                            if (updatedApprover.IsVerifier && !isVerifierOver && updatedApprover.ApproverUserId == workFlowApproval.UserID)
                            {
                                isVerifierOver = updatedApprover.IsVerifier;
                                if (verificationApprover != null && (verificationApprover.NextValue == null || (updatedApproverList.Count() == cnt && isCreditLimit == null)))
                                {
                                    verificationApprover.NextValue = null;
                                    currentstatus = Convert.ToInt32(WorkFlowStatus.Approved);
                                }
                            }
                            else if (isVerifierOver)
                            {
                                if (verificationApprover == null)
                                {
                                    verificationApprover = new SupplierVerificationApprover();
                                    verificationApprover.ApproverUserId = updatedApprover.ApproverUserId;
                                }
                                verificationApprover.NextValue = updatedApprover.ApproverUserId;
                                currentstatus = Convert.ToInt32(WorkFlowStatus.ApprovalInProgress);
                                isVerifierOver = false;
                                initiated = true;
                            }
                            else if (initiated)
                            {
                                currentstatus = Convert.ToInt32(WorkFlowStatus.Initiated);
                            }




                            workflowItem.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            workflowItem.Add("@DocumentId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                            workflowItem.Add("@ProcessId", updatedApprover.ProcessId, DbType.Int32, ParameterDirection.Input);
                            workflowItem.Add("@CompanyId", workFlowApproval.CompanyId, DbType.Int32, ParameterDirection.Input);
                            workflowItem.Add("@ApproverUserId", updatedApprover.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                            workflowItem.Add("@WorkFlowOrder", updatedApprover.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                            workflowItem.Add("@WorkFlowStatusId", currentstatus, DbType.Int32, ParameterDirection.Input);
                            workflowItems.Add(workflowItem);

                        }
                        var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", workflowItems, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                        ///
                    }
                    catch (Exception ex)
                    {

                        throw ex;
                    }

                    this.m_dbconnection.Query<int>("Supplier_CRUD", new
                    {
                        Action = "UPDATESUPPLIERCODE",
                        ParentDocumentId = workFlowApproval.ParentDocumentId,
                        DocumentId = workFlowApproval.DocumentId,
                        CompanyId = workFlowApproval.CompanyId,
                        WorkFlowStatusId = workFlowApproval.WorkFlowStatusId,
                    }, transaction: transactionObj,
                         commandType: CommandType.StoredProcedure).FirstOrDefault();

                    if (verificationApprover != null && verificationApprover.NextValue != null)
                    {
                        transactionObj.Commit();
                    }

                    //sending mail
                    if (verificationApprover != null && verificationApprover.NextValue != null)
                    {
                        SharedRepository sharedRepositoryObj = new SharedRepository();
                        sharedRepositoryObj.SendDocumentRequestMail((int)verificationApprover.NextValue, (int)workFlowApproval.DocumentId, workFlowApproval.ProcessId, workFlowApproval.CompanyId);

                        NotificationsRepository notificationObj = new NotificationsRepository();
                        notificationObj.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(workFlowApproval.ProcessId),
                            NotificationMessage = SharedRepository.GetNotificationMessage(workFlowApproval.ProcessId, workFlowApproval.WorkFlowStatusId),
                            ProcessId = workFlowApproval.ProcessId,
                            ProcessName = "",
                            DocumentId = workFlowApproval.DocumentId,
                            UserId = Convert.ToInt32(verificationApprover.NextValue),
                            IsRead = false,
                            CreatedBy = workFlowApproval.UserID,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = workFlowApproval.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                            DocumentCode = workFlowApproval.DocumentCode
                        });

                        approvalStatus = SharedRepository.GetWorkFlowStatusText(workFlowApproval.WorkFlowStatusId);
                    }
                    else
                    {
                        workFlowStatusId = Convert.ToInt32(WorkFlowStatus.Approved);
                        string procedureName = GetProcedureName(workFlowApproval.ProcessId);

                        #region request status update..

                        int updateStatus = this.m_dbconnection.Execute(procedureName, new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = workFlowApproval.DocumentId,
                            WorkFlowStatusId = workFlowStatusId,
                            CompanyId = workFlowApproval.CompanyId,
                            ProcessId = workFlowApproval.ProcessId,
                            DocumentCode = workFlowApproval.DocumentCode
                        },
                            transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        transactionObj.Commit();

                        approvalStatus = SharedRepository.GetWorkFlowStatusText(workFlowStatusId);
                        if (verificationApprover != null && verificationApprover.NextValue != null)
                        {
                            SendDocumentApprovalMail((int)verificationApprover.ApproverUserId, workFlowApproval.DocumentId, approvalStatus, workFlowApproval.ProcessId, 0, workFlowApproval.CompanyId);
                        }

                        #endregion

                    }
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    DateTime now = DateTime.Now;
                    if (verificationApprover.NextValue != null)
                    {
                        var user = userProfileRepository.GetUserById(verificationApprover.NextValue);
                        string nextApproverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        var nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)verificationApprover.NextValue, workFlowApproval.CompanyId);
                        string nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                        if (workFlowApproval.ProcessId == (int)WorkFlowProcessTypes.Supplier)
                        {
                            AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApproval.UserID.ToString(), workFlowApproval.ParentDocumentId.ToString(), "SupplierRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApproval.CompanyId);

                            AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "NextLevelApproval", workFlowApproval.UserID.ToString(), workFlowApproval.DocumentId.ToString(), "SupplierRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), workFlowApproval.CompanyId);
                        }
                    }
                }
                catch (Exception e)
                {
                    transactionObj.Rollback();
                    throw e;
                }

                return approvalStatus;
            }
        }

        private Supplier GetSupplier(int supplierId, int companyId, IDbTransaction transactionObj, int loggedInUserId = 0)
        {
            Supplier supplierDetails = new Supplier();
            if (this.m_dbconnection.State == ConnectionState.Closed)
                this.m_dbconnection.Open();
            using (var result = this.m_dbconnection.QueryMultiple("Supplier_CRUD", new
            {
                Action = "SELECTBYID",
                SupplierId = supplierId,
                CompanyId = companyId,
                UserId = loggedInUserId,
                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.Supplier)
            }, commandType: CommandType.StoredProcedure, transaction: transactionObj))
            {
                supplierDetails = result.Read<Supplier>().FirstOrDefault();
                if (supplierDetails != null)
                {
                    supplierDetails.IsWFVerifier = new WorkFlowConfigurationRepository().CheckIsWFVerifier(companyId, (int)WorkFlowProcessTypes.Supplier, supplierDetails.LocationId, loggedInUserId);
                    UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                    if (userProfile != null)
                    {
                        supplierDetails.CurrentApproverUserId = userProfile.UserID;
                        supplierDetails.CurrentApproverUserName = userProfile.UserName;
                    }

                    supplierDetails.Country = this.m_dbconnection.Query<Country>("usp_GetCountries", new
                    {
                        CountryId = supplierDetails.BillingCountryId
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                }
            }
            if (supplierDetails != null)
            {
                supplierDetails.SupplierCompanyDetails = this.m_dbconnection.Query<SupplierCompanyDetails>("SupplierCompanyDetails_CRUD", new
                {
                    Action = "SELECTBYID",
                    SupplierId = supplierId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

            }

            if (supplierDetails != null)
            {
                supplierDetails.SupplierAttachedCompanies = this.m_dbconnection.Query<SupplierAttachedCompanies>("SupplierAttachedCompanies", new
                {
                    Action = "SELECT",
                    SupplierId = supplierId
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).ToList();

            }



            if (supplierDetails != null)
            {
                if (supplierDetails.SupplierCompanyDetails == null)
                {
                    SupplierCompanyDetails objSupplierCompanyDetails = null;
                    objSupplierCompanyDetails = new SupplierCompanyDetails();
                    supplierDetails.SupplierCompanyDetails = objSupplierCompanyDetails;
                }
                supplierDetails.SupplierApproval = this.m_dbconnection.Query<SupplierApproval>("SupplierApproval_CRUD", new
                {
                    Action = "SELECT",
                    SupplierId = supplierId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

            }

            if (supplierDetails != null)
            {
                supplierDetails.SupplierServices = this.m_dbconnection.Query<SupplierService>("SupplierSelectedService_CRUD", new
                {
                    Action = "SELECT",
                    SupplierId = supplierId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).ToList();

            }




            if (supplierDetails != null)
            {
                if (supplierDetails.SupplierServices.Count > 0)
                {
                    foreach (var record in supplierDetails.SupplierServices)
                    {
                        supplierDetails.ServiceName += record.ServiceName + ", ";
                    }

                    supplierDetails.ServiceName = supplierDetails.ServiceName.Remove(supplierDetails.ServiceName.Length - 2);
                }
                supplierDetails.ContactPersons = this.m_dbconnection.Query<SupplierContactPerson>("SupplierContactPerson_CRUD", new
                {
                    Action = "SELECT",
                    SupplierId = supplierId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).ToList();

            }

            if (supplierDetails != null)
            {
                supplierDetails.SubCodes = this.m_dbconnection.Query<SupplierSubCode>("SupplierSubCode_CRUD", new
                {
                    Action = "SELECT",
                    SupplierId = supplierId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).ToList();
                if (supplierDetails.WorkFlowStatusId == 3)
                {
                    supplierDetails.WorkFlowStatus += " [" + supplierDetails.CurrentApproverUserName + "]";
                    supplierDetails.SupplierApproval.WorkFlowStatus += " [" + supplierDetails.CurrentApproverUserName + "]";
                }
            }

            if (supplierDetails != null)
            {
                if (loggedInUserId != 0)
                {
                    supplierDetails.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = supplierDetails.SupplierId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.Supplier),
                        UserId = loggedInUserId,
                        DocumentUserId = supplierDetails.CreatedBy
                    }, this.m_dbconnection).ToList();
                }

                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = supplierDetails.SupplierId,
                    AttachmentTypeId = Convert.ToInt32(AttachmentType.Supplier)

                }, commandType: CommandType.StoredProcedure, transaction: transactionObj);

                supplierDetails.Attachments = attachments.ToList();
            }

            if (supplierDetails != null)
            {
                supplierDetails.SupplierEntities = this.m_dbconnection.Query<Company>("SupplierCompanyDetails_CRUD", new
                {
                    Action = "ENTITIES",
                    SupplierId = supplierId,
                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).ToList();

            }

            return supplierDetails;
        }

        public IEnumerable<JVACode> getJVACode()

        {
            try
            {
                //return this.m_dbconnection.Query<JVACode>("select JVAId,JVANumber from JVACode", commandType: CommandType.Text);
                return this.m_dbconnection.Query<JVACode>("UPS_GetJvaNumber", commandType: CommandType.StoredProcedure);

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public void setJVACode(int JVANumber)

        {
            try
            {
                this.m_dbconnection.Query<JVACode>("update JVACode set JVANumber =@JVANumber", new
                {
                    JVANumber = JVANumber
                }, commandType: CommandType.Text);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool CheckIsSupplierVerifier(int userId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("Supplier_CRUD",
                                       new
                                       {
                                           Action = "CHECKSUPPLIERVERIFIER",
                                           UserId = userId,
                                           CompanyId = companyId
                                       },
                                       commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public static String changeToWords(String numb, bool isCurrency)
        {
            String val = "", wholeNo = numb, points = "", andStr = "", pointStr = "";
            String endStr = (isCurrency) ? ("Only") : ("");
            try
            {
                int decimalPlace = numb.IndexOf(".");
                if (decimalPlace > 0)
                {
                    wholeNo = numb.Substring(0, decimalPlace);
                    points = numb.Substring(decimalPlace + 1);
                    if (Convert.ToInt32(points) > 0)
                    {
                        andStr = (isCurrency) ? ("and") : ("point");// just to separate whole numbers from points/cents
                        endStr = (isCurrency) ? ("Cents " + endStr) : ("");
                        pointStr = translateCents(points);
                    }
                }
                val = String.Format("{0} {1}{2} {3}", translateWholeNumber(wholeNo).Trim(), andStr, pointStr, endStr);
            }
            catch {; }
            return val;
        }
        private static String translateWholeNumber(String number)
        {
            string word = "";
            try
            {
                bool beginsZero = false;//tests for 0XX
                bool isDone = false;//test if already translated
                double dblAmt = (Convert.ToDouble(number));
                //if ((dblAmt > 0) && number.StartsWith("0"))
                if (dblAmt > 0)
                {//test for zero or digit zero in a nuemric
                    beginsZero = number.StartsWith("0");
                    int numDigits = number.Length;
                    int pos = 0;//store digit grouping
                    String place = "";//digit grouping name:hundres,thousand,etc...
                    switch (numDigits)
                    {
                        case 1://ones' range
                            word = ones(number);
                            isDone = true;
                            break;
                        case 2://tens' range
                            word = tens(number);
                            isDone = true;
                            break;
                        case 3://hundreds' range
                            pos = (numDigits % 3) + 1;
                            place = beginsZero == false ? " Hundred " : " ";
                            break;
                        case 4://thousands' range
                        case 5:
                        case 6:
                            pos = (numDigits % 4) + 1;
                            place = beginsZero == false ? " Thousand " : " ";
                            break;
                        case 7://millions' range
                        case 8:
                        case 9:
                            pos = (numDigits % 7) + 1;
                            place = beginsZero == false ? " Million " : " ";
                            break;
                        case 10://Billions's range
                            pos = (numDigits % 10) + 1;
                            place = beginsZero == false ? " Billion " : " ";
                            break;
                        //add extra case options for anything above Billion...
                        default:
                            isDone = true;
                            break;
                    }
                    if (!isDone)
                    {//if transalation is not done, continue...(Recursion comes in now!!)
                        word = translateWholeNumber(number.Substring(0, pos)) + place + translateWholeNumber(number.Substring(pos));
                        //check for trailing zeros
                        if (beginsZero) word = " and " + word.Trim();
                    }
                    //ignore digit grouping names
                    if (word.Trim().Equals(place.Trim())) word = "";
                }
            }
            catch {; }
            return word.Trim();
        }
        private static String tens(String digit)
        {
            int digt = Convert.ToInt32(digit);
            String name = null;
            switch (digt)
            {
                case 10:
                    name = "Ten";
                    break;
                case 11:
                    name = "Eleven";
                    break;
                case 12:
                    name = "Twelve";
                    break;
                case 13:
                    name = "Thirteen";
                    break;
                case 14:
                    name = "Fourteen";
                    break;
                case 15:
                    name = "Fifteen";
                    break;
                case 16:
                    name = "Sixteen";
                    break;
                case 17:
                    name = "Seventeen";
                    break;
                case 18:
                    name = "Eighteen";
                    break;
                case 19:
                    name = "Nineteen";
                    break;
                case 20:
                    name = "Twenty";
                    break;
                case 30:
                    name = "Thirty";
                    break;
                case 40:
                    name = "Fourty";
                    break;
                case 50:
                    name = "Fifty";
                    break;
                case 60:
                    name = "Sixty";
                    break;
                case 70:
                    name = "Seventy";
                    break;
                case 80:
                    name = "Eighty";
                    break;
                case 90:
                    name = "Ninety";
                    break;
                default:
                    if (digt > 0)
                    {
                        name = tens(digit.Substring(0, 1) + "0") + " " + ones(digit.Substring(1));
                    }
                    break;
            }
            return name;
        }
        private static String ones(String digit)
        {
            int digt = Convert.ToInt32(digit);
            String name = "";
            switch (digt)
            {
                case 1:
                    name = "One";
                    break;
                case 2:
                    name = "Two";
                    break;
                case 3:
                    name = "Three";
                    break;
                case 4:
                    name = "Four";
                    break;
                case 5:
                    name = "Five";
                    break;
                case 6:
                    name = "Six";
                    break;
                case 7:
                    name = "Seven";
                    break;
                case 8:
                    name = "Eight";
                    break;
                case 9:
                    name = "Nine";
                    break;
            }
            return name;
        }
        private static String translateCents(String cents)
        {

            return " " + translateWholeNumber(cents);
        }


        public IEnumerable<UserRoles> GetuserManagementRole(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<UserRoles>("GetUserManagementRoles",
                                         new
                                         {
                                             SearchKey = searchKey
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<BillingType> GetBillingTypes()
        {
            try
            {
                return this.m_dbconnection.Query<BillingType>("GetBillingTypes",
                                       commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Companies> GetCompaniesByUserId(int userId)
        {
            try
            {
                return this.m_dbconnection.Query<Companies>("GetCompaniesByUserId",
                                         new
                                         {
                                             UserID = userId
                                         },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<AssetSubCategory> GetAssetSubCategories(int companyId, string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<AssetSubCategory>("IPS_ReadAssetSubcategories",
                                          new
                                          {
                                              SearchKey = searchKey,
                                              CompanyId = companyId
                                          },
                                          commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<PageAccessLevel> GetRoleAccessLevel(string roleIds)
        {
            try
            {
                return this.m_dbconnection.Query<PageAccessLevel>("RoleAccessLevel_CRUD",
                                         new
                                         {
                                             Action = "GETROLESACCESSDETAILS",
                                             UserRoleIds = roleIds
                                         },
                                         commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        private bool IsNumbersOnly(string s)
        {
            if (s == null || s == string.Empty)
                return false;

            foreach (char c in s)
            {
                if (c == '.')
                {
                    continue;
                }
                if (c < '0' || c > '9') // Avoid using .IsDigit or .IsNumeric as they will return true for other characters
                    return false;
            }

            return true;
        }

        public IEnumerable<UserProfile> GetSupplierVerifiers()
        {
            try
            {
                return this.m_dbconnection.Query<UserProfile>("usp_GetUsers",
                    new
                    {
                        Action = "SELECTVERIFIER",
                    }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private string GetPurchaseOrderCode(int PurchaseOrderId, int processId)
        {
            string PurchaseorderNumber = null;
            if (processId == 1)
            {
                PurchaseorderNumber = this.m_dbconnection.Query<string>("select (case  when  charindex('-', PurchaseOrderCode) > 0  then  PurchaseOrderCode  ELSE DraftCode end) from PurchaseOrder where PurchaseOrderId=" + PurchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            if (processId == 2)
            {
                PurchaseorderNumber = this.m_dbconnection.Query<string>("select (case  when  charindex('-', FixedAssetPurchaseOrderCode) > 0  then  FixedAssetPurchaseOrderCode  ELSE DraftCode end) from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId=" + PurchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            if (processId == 15)
            {
                PurchaseorderNumber = this.m_dbconnection.Query<string>("select (case  when  charindex('-', ExpensesPurchaseOrderCode) > 0  then  ExpensesPurchaseOrderCode  ELSE DraftCode end) from ExpensesPurchaseOrder where ExpensesPurchaseOrderId=" + PurchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            if (processId == 5 || processId == 6)
            {
                PurchaseorderNumber = this.m_dbconnection.Query<string>("select (case  when  charindex('-', CPONumber) > 0  then  CPONumber  ELSE DraftCode end) from ContractPurchaseOrder where CPOID=" + PurchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            return PurchaseorderNumber;
        }

        private string GetSupplierCode(int SupplierId)
        {
            string SupplierNumber = null;
            SupplierNumber = this.m_dbconnection.Query<string>("select (case  when  charindex('-', SupplierCode) > 0  then  SupplierCode  ELSE DraftCode end) from Supplier where SupplierId=" + SupplierId, commandType: CommandType.Text).FirstOrDefault().ToString();
            return SupplierNumber;
        }

        private string GetInvoiceCode(int InvoiceId)
        {
            string InvoiceNumber = null;
            InvoiceNumber = this.m_dbconnection.Query<string>("select (case  when  charindex('-', InvoiceCode) > 0  then  InvoiceCode  ELSE DraftCode end) from Invoice where InvoiceId=" + InvoiceId, commandType: CommandType.Text).FirstOrDefault().ToString();
            return InvoiceNumber;
        }

        public IEnumerable<UserProfile> GetUsersByCompany(string searchKey, int roleId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<UserProfile>("User_CRUD",
                 new
                 {
                     Action = "SELECTBYCOMPANY",
                     Search = searchKey,
                     RoleID = roleId,
                     CompanyId = companyId
                 }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<ItemGLCode> GetGlcodes(int? InvoiceTypeId, int companyId, string searchKey, int PoTypeId, int TypeId, string AccountCodeName, int AccountType, int AccountCodeCategoryId)
        {
            try
            {
                if (searchKey == null)
                {
                    searchKey = string.Empty;
                }

                return this.m_dbconnection.Query<ItemGLCode>("[Ips_Sp_GetGlCode]",
                                         new
                                         {
                                             InvoiceTypeId = InvoiceTypeId,
                                             CompanyId = companyId,
                                             Search = searchKey != null ? searchKey.Trim() : searchKey,
                                             PoTypeId = PoTypeId,
                                             TypeId = TypeId,
                                             AccountCodeName = AccountCodeName,
                                             AccountTypeid = AccountType,
                                             AccountCategoryid = AccountCodeCategoryId
                                         },
                                         commandType: CommandType.StoredProcedure).ToList().OrderBy(x => x.ItemName);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Roles> GetUserRolesByCompany(int userId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Roles>("User_CRUD",
                                       new
                                       {
                                           Action = "GETUSERROLES",
                                           UserId = userId,
                                           CompanyId = companyId
                                       },
                                       commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<AccountCode> GetExpenseBykey(string searchkey, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<AccountCode>("AccountCodes_CRUD", new
                {
                    Action = "WPOEXPENSE",
                    CompanyId = companyId,
                    Search = searchkey != null ? searchkey.Trim() : searchkey
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Country> GetAllCountries(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<Country>("usp_GetAllSearchCountries", new
                {

                    SearchKey = searchKey
                }, commandType: CommandType.StoredProcedure).GroupBy(j => j.Id).Select(j => new Country
                {

                    Id = j.Select(k => k.Id).FirstOrDefault(),
                    Code = j.Select(k => k.Code).FirstOrDefault(),
                    Name = j.Select(k => k.Name).FirstOrDefault()

                }).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public void UpdateReadNotifications(int processId, int documentId, int companyId)
        {
            try
            {
                this.m_dbconnection.Query("Notifications_CRUD", new
                {
                    Action = "UPDATETOREAD",
                    CompanyId = companyId,
                    ProcessId = processId,
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DocumentAddress GetDocumentAddress(int processId, int documentId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<DocumentAddress>("DocumentAddress_CRUD", new
                {
                    Action = "SELECT",
                    DocumentId = documentId,
                    ProcessId = processId == 3 ? (int)WorkFlowProcessTypes.ExpensesPo : processId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int PostDocumentAddress(DocumentAddress address, IDbTransaction dbTransaction = null)
        {
            int returnResult = 0;
            string addresss = "";
            bool commitNow = false;

            if(string.IsNullOrEmpty(address.Address))
            {
                addresss = "..";
            }
            if (dbTransaction == null)
            {
                commitNow = true;
                this.m_dbconnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                var result = dbTransaction.Connection.Query<int>("DocumentAddress_CRUD", new
                {
                    Action = "POST",
                    DocumentId = address.DocumentId,
                    ProcessId = address.ProcessId,
                    CompanyId = address.CompanyId,
                    Address = addresss
                }, transaction: dbTransaction, commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (commitNow)
                    dbTransaction.Commit();

                returnResult = result;
                return returnResult;
            }
            catch(Exception exp)
            {
                returnResult = 0;
            }
            return returnResult;

        }

        public IEnumerable<TransactionType> GetTransactionTypes()
        {
            try
            {
                return this.m_dbconnection.Query<TransactionType>("select * from transactiontype").ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Nationality> GetNationalities()
        {
            try
            {
                return this.m_dbconnection.Query<Nationality>("select * from Nationality").ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<AddressType> GetAddressTypes()
        {
            try
            {
                return this.m_dbconnection.Query<AddressType>("select * from AddressType").ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
