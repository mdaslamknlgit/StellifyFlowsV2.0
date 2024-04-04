using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;
using UELPM.Util.Templates;

namespace UELPM.Service.Repositories
{
    public class PurchaseOrderRequestRepository : IPurchaseOrderRequestRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        UserProfileRepository objUserRepository = null;
        SharedRepository sharedRepository = null;
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        public PurchaseOrderRequestDisplayResult GetPurchaseOrdersRequest(GridDisplayInput purchaseOrderRequestInput)
        {
            try
            {
                PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();
                //executing the stored procedure to get the list of purchase orders Request
                using (var result = this.m_dbconnection.QueryMultiple("PurchaseOrderRequest_CRUD", new
                {
                    Action = "SELECT",
                    Skip = purchaseOrderRequestInput.Skip,
                    Take = purchaseOrderRequestInput.Take,
                    CompanyId= purchaseOrderRequestInput.CompanyId
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


        public int CreatePurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order Request...

                        string purchaseOrderRequestCode = "";
                        string draftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string poCode = this.m_dbconnection.QueryFirstOrDefault<string>("PurchaseOrderRequest_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))//for inventory
                        {
                            purchaseOrderRequestCode = ModuleCodes.InventoryPurchaseOrderRequest;
                        }
                        else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))//for asset purchase order request..
                        {
                            purchaseOrderRequestCode = ModuleCodes.AssetPurchaseOrderRequest;
                        }
                        else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))//for contract purchase order request..
                        {
                            purchaseOrderRequestCode = ModuleCodes.ContractPurchaseOrderRequest;
                        }
                        else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))//expense purchase order request...
                        {
                            purchaseOrderRequestCode = ModuleCodes.ExpensePurchaseOrderReq;
                        }
                        purchaseOrderRequestCode = purchaseOrderRequestCode + '-' + poCode + "-" + draftCode;
                        var paramaterObj = new DynamicParameters();
                        int purchaseOrderRequestId = this.m_dbconnection.QueryFirstOrDefault<int>("PurchaseOrderRequest_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentCode = purchaseOrderRequestCode,
                            CompanyId = purchaseOrderRequest.CompanyId,
                            LocationId = purchaseOrderRequest.LocationId,
                            Supplierid = purchaseOrderRequest.Supplier == null ? 0 : purchaseOrderRequest.Supplier.SupplierId,
                            RequestedBy = purchaseOrderRequest.RequestedBy,
                            Discount = purchaseOrderRequest.Discount,
                            //TaxRate = purchaseOrderRequest.TaxRate,
                            ShippingCharges = purchaseOrderRequest.ShippingCharges,
                            OtherCharges = purchaseOrderRequest.OtherCharges,
                            TotalAmount = purchaseOrderRequest.TotalAmount,
                            CreatedBy = purchaseOrderRequest.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrderRequest.CostOfServiceId,
                            POTypeId = purchaseOrderRequest.POTypeId,
                            ExpectedDeliveryDate = purchaseOrderRequest.ExpectedDeliveryDate,
                            VendorReferences = purchaseOrderRequest.VendorReferences,
                            CurrencyId = purchaseOrderRequest.CurrencyId,
                            WorkFlowStatusId = purchaseOrderRequest.WorkFlowStatusId,
                            StatusId = 8,
                            Instructions = purchaseOrderRequest.Instructions,
                            Justifications = purchaseOrderRequest.Justifications,
                            IsGstRequired = purchaseOrderRequest.IsGstRequired,
                            DeliveryAddress = purchaseOrderRequest.DeliveryAddress,
                            DeliveryTerm = purchaseOrderRequest.DeliveryTerm,
                            PaymentTermId = purchaseOrderRequest.PaymentTermId,
                            DeliveryTermId = purchaseOrderRequest.DeliveryTermId,
                            Reasons = purchaseOrderRequest.Reasons,
                        },
                                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);
                        #endregion
                        #region  we are saving purchase order request Quotation items..
                        if (purchaseOrderRequest.PurchaseOrderRequestVendorItems != null)
                        {
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            int count = 0;
                            foreach (var record in purchaseOrderRequest.PurchaseOrderRequestVendorItems)
                            {
                                int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("PurchaseOrderRequest_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    QuotationSupplier = record.QuotationSupplier.SupplierId,
                                    PurchaseOrderRequestId = purchaseOrderRequestId,
                                    QuotatedAmount = record.QuotatedAmount,
                                    CreatedBy = purchaseOrderRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < purchaseOrderRequest.files.Count; i++)
                                {

                                    if (purchaseOrderRequest.files[i].FileName.Contains("Quotation@" + count))
                                    {
                                        string[] name = purchaseOrderRequest.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        string Filname = name[2];
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@PurchaseOrderRequestId", purchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToAdd.Add(itemObj);
                                    }
                                }
                                count++;

                            }
                            var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("QuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }

                        #endregion

                        #region  we are saving purchase order items...
                        if (purchaseOrderRequest.PurchaseOrderRequestItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrderRequest.PurchaseOrderRequestItems)
                            {
                                var itemObj = new DynamicParameters();

                                int itemMasterId = 0;
                                if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                                {
                                    if(record.Item == null)
                                        itemMasterId = record.Service != null ? record.Service.AccountCodeId : 0;
                                    else if (record.Service == null)
                                        itemMasterId = record.Item != null ? record.Item.ItemMasterId : 0;
                                }
                                else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                                {
                                    if(record.Asset == null)
                                        itemMasterId = record.Service != null ? record.Service.AccountCodeId : 0;
                                    else if(record.Service == null)
                                    itemMasterId = record.Asset != null? record.Asset.AssetId : 0;
                                    
                                }
                                else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                                {
                                    itemMasterId = record.Expense.AccountCodeId;
                                }

                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@PurchaseOrderRequestId", purchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@IsDetailed", record.IsDetailed, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@ItemMasterId", itemMasterId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                   
                        
                        #region saving files here...
                        if (purchaseOrderRequest.files != null)
                        {
                            try
                            {
                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();


                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < purchaseOrderRequest.files.Count; i++)
                                {
                                    if (!purchaseOrderRequest.files[i].FileName.Contains("Quotation"))
                                    {
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.PurchaseOrderRequest), DbType.Int32, ParameterDirection.Input);//static value need to change
                                        itemObj.Add("@RecordId", purchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", purchaseOrderRequest.files[i].FileName, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        fileToSave.Add(itemObj);
                                    }
                                }
                                var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);

                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.PurchaseOrderRequest,
                                    Files = purchaseOrderRequest.files,
                                    UniqueId = purchaseOrderRequestId.ToString()
                                });
                            }
                            catch (Exception e)
                            {
                                throw e;
                            }
                            #endregion
                        }
                        //commiting the transaction...
                       // transactionObj.Commit();
                        #region
                        if (purchaseOrderRequest.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            purchaseOrderRequest.PurchaseOrderRequestId = purchaseOrderRequestId;
                            purchaseOrderRequest.PurchaseOrderRequestCode = purchaseOrderRequestCode;
                            SendForApproval(purchaseOrderRequest,false,transactionObj,this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        return purchaseOrderRequestId;
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

        public void SendForApproval(PurchaseOrderRequest purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {
            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                string itemCategory = string.Empty;
                decimal totalQuantity = 0;

                if (purchaseOrder.PurchaseOrderRequestItems != null)
                {

                    if(purchaseOrder.POTypeId==Convert.ToInt32(PurchaseOrderType.InventoryPo))
                    {
                        itemCategory = purchaseOrder.PurchaseOrderRequestItems.Select(x => x.Item.ItemCategoryName).FirstOrDefault();
                    }
                    else if (purchaseOrder.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    {
                        itemCategory = purchaseOrder.PurchaseOrderRequestItems.Select(x => x.Asset.AssetName).FirstOrDefault();
                    }
                    else if (purchaseOrder.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                    {
                        itemCategory = purchaseOrder.PurchaseOrderRequestItems.Select(x => x.Expense.Code).FirstOrDefault();
                    }
                    totalQuantity = purchaseOrder.PurchaseOrderRequestItems.Sum(d => d.ItemQty);
                }

                workFlowConfigRepository = new WorkFlowConfigurationRepository();
                IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>(){
                                   new  WorkFlowParameter{
                                        ProcessId = SharedRepository.getWorkFlowProcessIdForPO(purchaseOrder.POTypeId,true),
                                        CompanyId = purchaseOrder.CompanyId,
                                        Value = Convert.ToString(purchaseOrder.TotalAmount),
                                        DocumentId = purchaseOrder.PurchaseOrderRequestId,
                                        CreatedBy = purchaseOrder.CreatedBy,
                                        DocumentCode =purchaseOrder.PurchaseOrderRequestCode,
                                        ItemCategory = itemCategory,
                                        ItemQuantity = totalQuantity.ToString(),
                                        WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                                        LocationId = purchaseOrder.LocationId
                                   }
                                }, dbTransaction, dbConnection);

                //int updateResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", new
                //{
                //    Action = "UPDATEWORKFLOWSTATUS",
                //    WorkFlowStatusId = (workFlowConfig == null || workFlowConfig.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.Approved) : purchaseOrder.WorkFlowStatusId,
                //    PurchaseOrderRequestId = purchaseOrder.PurchaseOrderRequestId
                //}, commandType: CommandType.StoredProcedure);

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
        public int UpdatePurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order Request updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", new
                        {
                            Action = "UPDATE",
                            CompanyId = purchaseOrderRequest.CompanyId,
                            LocationId = purchaseOrderRequest.LocationId,
                            Supplierid = purchaseOrderRequest.Supplier==null?0:purchaseOrderRequest.Supplier.SupplierId,
                            RequestedBy = purchaseOrderRequest.RequestedBy,
                            Discount = purchaseOrderRequest.Discount,
                            //TaxRate = purchaseOrderRequest.TaxRate,
                            ShippingCharges = purchaseOrderRequest.ShippingCharges,
                            OtherCharges = purchaseOrderRequest.OtherCharges,
                            TotalAmount = purchaseOrderRequest.TotalAmount,
                            CreatedBy = purchaseOrderRequest.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrderRequest.CostOfServiceId,
                            POTypeId = purchaseOrderRequest.POTypeId,
                            ExpectedDeliveryDate = purchaseOrderRequest.ExpectedDeliveryDate,
                            VendorReferences = purchaseOrderRequest.VendorReferences,
                            CurrencyId = purchaseOrderRequest.CurrencyId,
                            WorkFlowStatusId = purchaseOrderRequest.WorkFlowStatusId,
                            StatusId = 8,
                            Instructions = purchaseOrderRequest.Instructions,
                            Justifications = purchaseOrderRequest.Justifications,
                            PurchaseOrderRequestId = purchaseOrderRequest.PurchaseOrderRequestId,
                            IsGstRequired = purchaseOrderRequest.IsGstRequired,
                            PaymentTermId = purchaseOrderRequest.PaymentTermId,
                            DeliveryTerm = purchaseOrderRequest.DeliveryTerm,
                            DeliveryAddress = purchaseOrderRequest.DeliveryAddress,
                            DeliveryTermId = purchaseOrderRequest.DeliveryTermId,
                            Reasons = purchaseOrderRequest.Reasons,
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        #endregion

                        #region we are saving purchase order items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrderRequest.PurchaseOrderRequestItems.Where(i => i.PurchaseOrderRequestItemId == 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();
                            int itemMasterId = 0;
                            if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                            {
                                itemMasterId = record.Item.ItemMasterId;
                            }
                            else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                            {
                                itemMasterId = record.Asset.AssetId;
                            }
                            else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                            {
                                itemMasterId = record.Expense.AccountCodeId;
                            }
                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@PurchaseOrderRequestId", purchaseOrderRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemMasterId", itemMasterId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@IsDetailed", record.IsDetailed, DbType.Boolean, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }


                        var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                      
                        #region  we are saving Quotation records
                        if (purchaseOrderRequest.PurchaseOrderRequestVendorItems != null)
                        {
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrderRequest.PurchaseOrderRequestVendorItems.Where(j => j.QuotationId == 0).Select(j => j))
                            {
                                int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("PurchaseOrderRequest_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    QuotationSupplier = record.QuotationSupplier.SupplierId,
                                    PurchaseOrderRequestId = purchaseOrderRequest.PurchaseOrderRequestId,
                                    QuotatedAmount = record.QuotatedAmount,
                                    CreatedBy = purchaseOrderRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                },
                                  transaction: transactionObj,
                                                  commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < purchaseOrderRequest.files.Count; i++)
                                {
                                    if (purchaseOrderRequest.files[i].FileName.Contains("Quotation@"))
                                    {
                                        string[] name = purchaseOrderRequest.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        string Filename = name[2];
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@PurchaseOrderRequestId", purchaseOrderRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", Filename, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToAdd.Add(itemObj);
                                    }
                                }
                            }
                            var purchaseOrderRequestVendorItemSaveResult = this.m_dbconnection.Execute("QuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        }

                        #endregion

                        #region  we are saving purchase order request Quotation items..
                        if (purchaseOrderRequest.PurchaseOrderRequestVendorItems != null)
                        {
                            List<DynamicParameters> quotationItemToUpdate = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrderRequest.PurchaseOrderRequestVendorItems.Where(k => k.QuotationId > 0).Select(k => k))
                            {
                                int updatequotationResult = this.m_dbconnection.Execute("[PurchaseOrderRequest_CRUD]", new
                                {
                                    Action = "UPDATEQUOTATIONITEM",
                                    QuotationId = record.QuotationId,
                                    QuotatedAmount = record.QuotatedAmount,
                                    CreatedBy= purchaseOrderRequest.CreatedBy,
                                    CreatedDate= DateTime.Now
                                    
                                },
                                 transaction: transactionObj,
                                 commandType: CommandType.StoredProcedure);
                                
                                for (var i = 0; i < purchaseOrderRequest.files.Count; i++)
                                {
                                    if (purchaseOrderRequest.files[i].FileName.Contains("Quotation@"))
                                    {
                                        string[] name = purchaseOrderRequest.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        string Filename = name[2];
                                        var itemObj1 = new DynamicParameters();
                                        itemObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj1.Add("@PurchaseOrderRequestId", purchaseOrderRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@QuotationId", record.QuotationId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@FileName", Filename, DbType.String, ParameterDirection.Input);
                                        itemObj1.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToUpdate.Add(itemObj1);
                                    }
                                }                                
                            }   
                            var purchaseOrderRequestVendorItemSaveResult = this.m_dbconnection.Execute("QuotationFileOperations_CRUD", quotationItemToUpdate, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }

                        #endregion

                        #region updating purchase order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrderRequest.PurchaseOrderRequestItems.Where(i => i.PurchaseOrderRequestItemId > 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            int itemMasterId = 0;
                            if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                            {
                                itemMasterId = record.Item.ItemMasterId;
                            }
                            else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                            {
                                itemMasterId = record.Asset.AssetId;
                            }
                            else if (purchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                            {
                                itemMasterId = record.Expense.AccountCodeId;
                            }

                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@PurchaseOrderRequestItemId", record.PurchaseOrderRequestItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemMasterId", itemMasterId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@IsDetailed", record.IsDetailed, DbType.Boolean, ParameterDirection.Input);

                            itemsToUpdate.Add(itemObj);
                        }


                        var purchaseOrderItemUpdateResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting purchase order items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (purchaseOrderRequest.PurchaseOrderRequestItemsToDelete != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var purchaseOrderRequestItemId in purchaseOrderRequest.PurchaseOrderRequestItemsToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@PurchaseOrderRequestItemId", purchaseOrderRequestItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToUpdate.Add(itemObj);
                            }
                        }

                        var purchaseOrderRequestItemDeleteResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting Quotations...
                        List<DynamicParameters> quotationsitemsToDelete = new List<DynamicParameters>();


                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrderRequest.PurchaseOrderRequestVendorItemsToDelete)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "DELETEQUOTATIONITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@QuotationId", record, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            //quotationsitemsToDelete.Add(itemObj);


                            var purchaseOrderrequestquotationDeleteResult = this.m_dbconnection.Query<string>("PurchaseOrderRequest_CRUD", itemObj, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "Quotations",
                                FilesNames = purchaseOrderrequestquotationDeleteResult.ToArray(),
                                UniqueId = purchaseOrderRequest.PurchaseOrderRequestId.ToString()
                            });


                        }





                        #endregion

                        #region deleting quotation attachments
                        if (purchaseOrderRequest.QuotationAttachmentDelete != null)
                        {
                            for (var i = 0; i < purchaseOrderRequest.QuotationAttachmentDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@QuotationAttachmentId", purchaseOrderRequest.QuotationAttachmentDelete[i].QuotationAttachmentId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@QuotationId", purchaseOrderRequest.QuotationAttachmentDelete[i].QuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrderRequest.QuotationAttachmentDelete[i].RowId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@PurchaseOrderRequestId", purchaseOrderRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);

                                var purchaseOrderrequestquotationFileDeleteResult = this.m_dbconnection.Query<string>("QuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);

                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = "Quotations",
                                    FilesNames = purchaseOrderrequestquotationFileDeleteResult.ToArray(),
                                    UniqueId = purchaseOrderRequest.PurchaseOrderRequestId.ToString()
                                });
                            }
                        }

                        #endregion

                        #region deleting attachments
                        //looping through attachments
                        if (purchaseOrderRequest.AttachmentsDelete != null)
                        {
                            List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                            for (var i = 0; i < purchaseOrderRequest.AttachmentsDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@AttachmentTypeId", purchaseOrderRequest.AttachmentsDelete[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrderRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@AttachmentId", purchaseOrderRequest.AttachmentsDelete[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                fileToDelete.Add(fileObj);
                                var purchaseOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                      commandType: CommandType.StoredProcedure);
                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.PurchaseOrderRequest,
                                    FilesNames = purchaseOrderRequest.AttachmentsDelete.Select(j => j.FileName).ToArray(),
                                    UniqueId = purchaseOrderRequest.PurchaseOrderRequestId.ToString()
                                });
                            }
                        }

                        #endregion

                        #region saving files uploaded files...
                        try
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            //looping through the list of purchase order items...                            
                            for (var i = 0; i < purchaseOrderRequest.files.Count; i++)
                            {
                                if (!purchaseOrderRequest.files[i].FileName.Contains("Quotation"))
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", 3, DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", purchaseOrderRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", purchaseOrderRequest.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", purchaseOrderRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    fileToSave.Add(itemObj);
                                }
                            }

                            var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);
                            

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.PurchaseOrderRequest,
                                Files = purchaseOrderRequest.files,
                                UniqueId = purchaseOrderRequest.PurchaseOrderRequestId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion

                        //commiting the transaction...
                       // transactionObj.Commit();
                        #region
                        if (purchaseOrderRequest.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            SendForApproval(purchaseOrderRequest, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        return 1;
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

        public bool DeletePurchaseOrderRequest(PurchaseOrderRequestDelete purchaseOrderRequestDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region delete purchase order Request...
                        var purchaseOrderRequestDeleteResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    PurchaseOrderRequestId = purchaseOrderRequestDelete.PurchaseOrderRequestId,
                                                                    CreatedBy = purchaseOrderRequestDelete.ModifiedBy
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #endregion                        

                        #region deleting purchase order items...
                        var purchaseOrderRequestItemDeleteResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            PurchaseOrderRequestId = purchaseOrderRequestDelete.PurchaseOrderRequestId,
                            CreatedBy = purchaseOrderRequestDelete.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                                                            transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting all the files related to this purchase order
                        try
                        {

                            var parameterObj = new DynamicParameters();
                            parameterObj.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj.Add("@RecordId", purchaseOrderRequestDelete.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId",Convert.ToInt32(AttachmentType.PurchaseOrderRequest), DbType.Int32, ParameterDirection.Input);


                            var deletedAttachmentNames = this.m_dbconnection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            var parameterObj1 = new DynamicParameters();
                            parameterObj1.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj1.Add("@PurchaseOrderRequestId", purchaseOrderRequestDelete.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);

                            var deletedQuotationAttachmentNames = this.m_dbconnection.Query<string>("QuotationFileOperations_CRUD", parameterObj1, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);


                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName =  AttachmentFolderNames.PurchaseOrderRequest,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderRequestDelete.PurchaseOrderRequestId.ToString()
                            });

                            bool quotationfileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "Quotations",
                                FilesNames = deletedQuotationAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderRequestDelete.PurchaseOrderRequestId.ToString()
                            });

                            #region deleting purchase order Quotations...
                            var purchaseOrderRequestQuotationItemDeleteResult = this.m_dbconnection.Execute("PurchaseOrderRequest_CRUD", new
                            {

                                Action = "DELETEQUOTATIONALLITEMS",
                                PurchaseOrderRequestId = purchaseOrderRequestDelete.PurchaseOrderRequestId,
                                CreatedBy = purchaseOrderRequestDelete.ModifiedBy,
                                CreatedDate = DateTime.Now
                            },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                            #endregion


                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
                        return true;
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


        public IEnumerable<PurchaseOrderRequestTypes> GetPurchaseOrderRequestTypes()
        {
            try
            {
                PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();
                //executing the stored procedure to get the list of purchase order Request types
                var result = this.m_dbconnection.Query<PurchaseOrderRequestTypes>("usp_GetPurchaseOrderTypes",
                                                commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<CostOfServiceTypes> PORequestGetCostOfServiceTypes()
        {
            try
            {
                var result = this.m_dbconnection.Query<CostOfServiceTypes>("usp_CostOfService", commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> PORequestGetDepartments()
        {
            try
            {
                var result = this.m_dbconnection.Query<Locations>("usp_GetDepartments", commandType: CommandType.StoredProcedure);

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
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
                    ModuleName = AttachmentFolderNames.PurchaseOrderRequest,
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

        public byte[] DownloadQuotationFile(QuotationAttachments quotationAttachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadQuotationFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = "Quotations",
                    FilesNames = new string[] { quotationAttachment.FileName },
                    UniqueId = quotationAttachment.QuotationRequestId.ToString()+"\\"+quotationAttachment.RowId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public PurchaseOrderRequest GetPurchaseOrderRequestDetails(int purchaseOrderRequestId,int processId)
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
                            purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, GetItemMasters,  AccountCode, PurchaseOrderRequestItems>((Pc, IM, Ac) =>
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
                            purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems,GetAssets, AccountCode, PurchaseOrderRequestItems>((Pc, IM, Ac) =>
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
                            purchaseOrderRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, AccountCode, PurchaseOrderRequestItems>((Pc, Ac) =>
                            {
                                Pc.Expense = Ac;
                                return Pc;
                            }, splitOn: "ExpensesMasterId, AccountCodeId").ToList();
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
                            data.AccountCodeCategoryId = data.TypeId;                         

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
                        purchaseOrderRequestDetailsObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                        {
                            Documentid = purchaseOrderRequestDetailsObj.PurchaseOrderRequestId,
                            ProcessId = processId,
                            UserId = 0, //user id is not used in the audit trial comments...
                            DocumentUserId = purchaseOrderRequestDetailsObj.CreatedBy
                        }, this.m_dbconnection).ToList();
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
                        AttachmentTypeId = Convert.ToInt32(AttachmentType.PurchaseOrderRequest) //static value need to change
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

        public PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequest(PORSearch purchaseOrderRequestInput)
        {
            try
            {
                PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();


                string whereCondition = @" from 
                                            dbo.PurchaseOrderRequest as POR 
                                           left join dbo.Supplier as S 
                                            on 
                                            POR.Supplierid = S.SupplierId 
                                           join dbo.WorkFlowStatus as WFS 
                                            on 
                                            POR.WorkFlowStatusid = WFS.WorkFlowStatusid 
                                           join dbo.UserProfile as usr 
                                            on usr.UserID = POR.RequestedBy 
                                            where POR.Isdeleted = 0 and POR.CompanyId=@companyId ";

                if (purchaseOrderRequestInput.PurchaseOrderReqId > 0)
                {
                    whereCondition += " and POR.PurchaseOrderRequestId=@PurchaseOrderRequestId   ";
                }
                else if (purchaseOrderRequestInput.WorkFlowStatusId != null)
                {
                    whereCondition += " and POR.WorkFlowStatusId=@WorkFlowStatusId ";
                }

                if (purchaseOrderRequestInput.PORCodeFilter != "" && purchaseOrderRequestInput.PORCodeFilter != null)
                {
                    whereCondition += @" and ( 
                                            POR.PurchaseOrderRequestCode LIKE concat('%',@PoCode,'%')
                                            or 
                                            POR.DraftCode LIKE concat('%',@PoCode,'%')
                                         ) ";
                }
                if (purchaseOrderRequestInput.SupplierNameFilter != "" && purchaseOrderRequestInput.SupplierNameFilter != null)
                {
                    whereCondition += @" and ( 
                                              S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                          )  ";
                }
                if (purchaseOrderRequestInput.Search != "" && purchaseOrderRequestInput.Search != null && purchaseOrderRequestInput.Search !="null")
                {
                    whereCondition += @" and ( 
                                            POR.PurchaseOrderRequestCode LIKE concat('%',@Search,'%') 
                                            or 
                                            POR.DraftCode LIKE concat('%',@Search,'%')
                                            or 
                                            S.SupplierName LIKE concat('%',@Search,'%') 
                                            or
                                            WFS.Statustext LIKE concat('%',@Search,'%') 
                                        ) 
                                         ";
                }
                if (purchaseOrderRequestInput.POTypeId != 0 && purchaseOrderRequestInput.POTypeId != null)
                {
                    whereCondition += " and POR.POTypeId = @POTypeId  ";
                }

                string purchaseOrderRequestSearchQuery = @"select POR.PurchaseOrderRequestCode,POR.DraftCode,WFS.IsApproved as IsDocumentApproved,POR.PurchaseOrderRequestId,POR.POTypeId,S.SupplierName,WFS.WorkFlowStatusid as WorkFlowStatusId,WFS.Statustext  as WorkFlowStatusText,POR.UpdatedDate,POR.TotalAmount,POR.CreatedDate, CONCAT(usr.firstName,usr.LastName) as UserName ";

                purchaseOrderRequestSearchQuery += whereCondition;

                purchaseOrderRequestSearchQuery += " order by POR.UpdatedDate desc ";

                if(purchaseOrderRequestInput.Take >0)
                {         
                    purchaseOrderRequestSearchQuery += "OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";      
                }
                purchaseOrderRequestSearchQuery += $"select count(*) { whereCondition } ";
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple(purchaseOrderRequestSearchQuery, new
                {

                    Action = "SELECT",
                    Skip = purchaseOrderRequestInput.Skip,
                    Take = purchaseOrderRequestInput.Take,
                    Search = purchaseOrderRequestInput.Search,
                    WorkFlowStatusId = purchaseOrderRequestInput.WorkFlowStatusId,
                    CompanyId=purchaseOrderRequestInput.CompanyId,
                    PurchaseOrderRequestId = purchaseOrderRequestInput.PurchaseOrderReqId,
                    POTypeId = purchaseOrderRequestInput.POTypeId,
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

        //public PurchaseOrderRequestDisplayResult GetAllFilterPurchaseOrdersRequest(PORSearch porFilterDisplayInput)
        //{
        //    try
        //    {
        //        PurchaseOrderRequestDisplayResult purchaseOrderRequestDisplayResult = new PurchaseOrderRequestDisplayResult();

        //        string purchaseOrderRequestFilterQuery = "select POR.PurchaseOrderRequestCode,POR.PurchaseOrderRequestId,S.SupplierName,WFS.Statustext  as WorkFlowStatusText " +
        //                                          "from " +
        //                                          "dbo.PurchaseOrderRequest as POR " +
        //                                          "left join dbo.Supplier as S " +
        //                                          "on " +
        //                                          "POR.Supplierid = S.SupplierId " +
        //                                          "join dbo.WorkFlowStatus as WFS " +
        //                                          "on " +
        //                                          "POR.WorkFlowStatusid = WFS.WorkFlowStatusid " +
        //                                          "where " +
        //                                          "( " +
        //                                              "POR.PurchaseOrderRequestCode LIKE concat('%',@PORCodeFilter,'%') " +
        //                                              "and " +
        //                                              "S.SupplierName LIKE concat('%',@SupplierNameFilter,'%') " +                                                    
        //                                           ") " +
        //                                           "and " +

        //                                           "POR.Isdeleted = 0 and POR.CompanyId=@companyId " +
        //                                           "order by " +
        //                                           "POR.UpdatedDate desc " +
        //                                           "OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

        //        purchaseOrderRequestFilterQuery += "select count(*) " +
        //                                          "from " +
        //                                          "dbo.PurchaseOrderRequest as POR " +
        //                                          "left join dbo.Supplier as S " +
        //                                          "on " +
        //                                          "POR.Supplierid = S.SupplierId " +
        //                                          "join dbo.WorkFlowStatus as WFS " +
        //                                          "on " +
        //                                          "POR.WorkFlowStatusid = WFS.WorkFlowStatusid " +
        //                                          "where " +
        //                                          "( " +
        //                                              "POR.PurchaseOrderRequestCode LIKE concat('%',@PORCodeFilter,'%') " +
        //                                              "and " +
        //                                              "S.SupplierName LIKE concat('%',@SupplierNameFilter,'%') " +                                                   
        //                                           ") " +
        //                                     "and " +
        //                                     "POR.Isdeleted = 0 and POR.CompanyId=@companyId ";

        //        //executing the stored procedure to get the list of purchase orders
        //        using (var result = this.m_dbconnection.QueryMultiple(purchaseOrderRequestFilterQuery, new
        //        {

        //            Action = "SELECT",
        //            Skip = porFilterDisplayInput.Skip,
        //            Take = porFilterDisplayInput.Take,
        //            PORCodeFilter = porFilterDisplayInput.PORCodeFilter,
        //            SupplierNameFilter = porFilterDisplayInput.SupplierNameFilter,
        //            CompanyId= porFilterDisplayInput.CompanyId
        //        }, commandType: CommandType.Text))
        //        {
        //            //list of purchase orders..
        //            purchaseOrderRequestDisplayResult.PurchaseOrdersRequest = result.Read<PurchaseOrderRequestList>().AsList();

        //            //total number of purchase orders
        //            purchaseOrderRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
        //        }

        //        return purchaseOrderRequestDisplayResult;

        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }
        //}

        public byte[] PurchaseOrderRequestPrint(int purchaseOrderRequestId, int companyId , int processId)
        {
            try
            {                       
                var result  = GetPurchaseOrderRequestPDFTemplate(purchaseOrderRequestId, companyId , processId);
                return result;             
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetPurchaseOrderRequestPDFTemplate(int purchaseOrderRequestId, int companyId,int processId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                PurchaseOrderRequest purchaseOrderRequestDetails = GetPurchaseOrderRequestDetails(purchaseOrderRequestId,processId);
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetPurchaseOrderRequestPDFTemplate(purchaseOrderRequestDetails, null, companyDetails);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SendPurchaseOrderMailtoSupplier(int purchaseOrderRequestId, int companyId,int processId)
        {
            try
            {               
                PurchaseOrderRequest purchaseOrderRequestDetails = GetPurchaseOrderRequestDetails(purchaseOrderRequestId,processId);
                PdfGenerator pdfGeneratorObj = new PdfGenerator();
                var pdfResult = pdfGeneratorObj.GetPurchaseOrderRequestPDFTemplate(purchaseOrderRequestDetails, null, null);
                var companyDetails = GetCompanyDetails(companyId);
                var result = Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderToSupplier(companyDetails, pdfResult, null, null, null,null, purchaseOrderRequestDetails);
                return true;
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
        public bool SendPurchaseOrderRequestMail(int? approverUserId, int purchaseOrderRequestId ,int processId )
        {
            bool result = false;
            string type = string.Empty;
            objUserRepository = new UserProfileRepository();
            PurchaseOrderRequestMail objPurchaseOrderRequestMail = null;
            objPurchaseOrderRequestMail = new PurchaseOrderRequestMail();
            var approver = objUserRepository.GetUserById(approverUserId);
            var purchaseRequestDetails = GetPurchaseOrderRequestDetails(purchaseOrderRequestId,processId);
            if (approver != null)
            {
                objPurchaseOrderRequestMail.ApproverName = approver.FirstName;
                objPurchaseOrderRequestMail.ApproverEmail = approver.EmailId;
            }
         
            if (purchaseRequestDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = purchaseRequestDetails.PurchaseOrderRequestId;
                objPurchaseOrderRequestMail.RequestCode = purchaseRequestDetails.PurchaseOrderRequestCode;
                objPurchaseOrderRequestMail.SenderName = purchaseRequestDetails.RequestedByUserName;          
                objPurchaseOrderRequestMail.Supplier = purchaseRequestDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierName = purchaseRequestDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.SupplierEmail = purchaseRequestDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = purchaseRequestDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.DeliveryDate = purchaseRequestDetails.ExpectedDeliveryDate;
                objPurchaseOrderRequestMail.PurchaseOrderType = purchaseRequestDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = purchaseRequestDetails.Location;              
                objPurchaseOrderRequestMail.TotalAmount = $"{purchaseRequestDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            }

            if (objPurchaseOrderRequestMail != null)
            {
                type = "Purchase Order Request";
                result = Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderRequestMail(objPurchaseOrderRequestMail, type);
            }

            return result;
          
        }

        public bool SendPurchaseOrderRequestApprovalMail(int? approverUserId, int purchaseOrderRequestId, string status,int processId, int nextApprovalUserId)
        {
            bool result = false;
            string type = string.Empty;
            objUserRepository = new UserProfileRepository();
            PurchaseOrderRequestMail objPurchaseOrderRequestMail = null;
            string previousApproverStatus = string.Empty;
            objPurchaseOrderRequestMail = new PurchaseOrderRequestMail();
            var approver = objUserRepository.GetUserById(approverUserId);            
            var purchaseRequestDetails = GetPurchaseOrderRequestDetails(purchaseOrderRequestId,processId);
            if (approver != null)
            {
                objPurchaseOrderRequestMail.ApproverName = approver.FirstName;
                objPurchaseOrderRequestMail.ApproverEmail = approver.EmailId;
            }

            var sender = objUserRepository.GetUserById(purchaseRequestDetails.CreatedBy);
            if (sender != null)
            {
                objPurchaseOrderRequestMail.SenderEmail = sender.EmailId;              
            }

            if (purchaseRequestDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = purchaseRequestDetails.PurchaseOrderRequestId;
                objPurchaseOrderRequestMail.RequestCode = purchaseRequestDetails.PurchaseOrderRequestCode;
                objPurchaseOrderRequestMail.SenderName = purchaseRequestDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = purchaseRequestDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierName = purchaseRequestDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.SupplierEmail = purchaseRequestDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = purchaseRequestDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.DeliveryDate = purchaseRequestDetails.ExpectedDeliveryDate;
                objPurchaseOrderRequestMail.PurchaseOrderType = purchaseRequestDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = purchaseRequestDetails.Location;
                objPurchaseOrderRequestMail.TotalAmount = $"{purchaseRequestDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            }

            if (nextApprovalUserId > 0)
            {
                var nextapprover = objUserRepository.GetUserById(nextApprovalUserId);
                previousApproverStatus = $"{"Approved by "}{ objPurchaseOrderRequestMail.ApproverName}";
                var currentApproverStatus = $"{status} {" [ "} {nextapprover.FirstName}{nextapprover.LastName} {" ] "}";
                if (nextapprover != null)
                {
                    status = $"{currentApproverStatus}";
                }

            }
            else
            {
                previousApproverStatus = status;
            }

            if (objPurchaseOrderRequestMail != null)
            {
                type = "Purchase Order Request";
                Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderRequestApprovalMail(objPurchaseOrderRequestMail, type, status, previousApproverStatus);
            }

            return result;

        }      
        /*
          a) for updating the purchase request created user  coments....
        */
        public int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval)
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
                            DocumentId = requestApproval.PurchaseOrderRequestId,
                            ProcessId = requestApproval.ProcessId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ApproverUserId = requestApproval.ApproverUserId,
                            CompanyId = requestApproval.CompanyId,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..

                        int updateStatus = this.m_dbconnection.QueryFirstOrDefault<int>("PurchaseOrderRequestApproval_CRUD", new
                        {
                            Action = "UPDATE",
                            PurchaseOrderRequestId = requestApproval.PurchaseOrderRequestId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId
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
                        try
                        {
                            NotificationsRepository notificationObj = new NotificationsRepository();
                            notificationObj.CreateNotification(new Notifications()
                            {

                                NotificationId = 0,
                                NotificationType = SharedRepository.GetNotificationType(requestApproval.ProcessId),
                                NotificationMessage = SharedRepository.GetNotificationMessage(requestApproval.ProcessId),
                                ProcessId = requestApproval.ProcessId,
                                ProcessName = "",
                                DocumentId = requestApproval.PurchaseOrderRequestId,
                                UserId = requestApproval.ApproverUserId,
                                IsRead = false,
                                CreatedBy = requestApproval.UserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = requestApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
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
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {

                            this.SendPurchaseOrderRequestReplyMail(requestApproval.ApproverUserId, requestApproval.PurchaseOrderRequestUserId, requestApproval.Remarks, requestApproval.PurchaseOrderRequestId, requestApproval.PurchaseOrderRequestCode);
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

        public void SendPurchaseOrderRequestClarificationMail(int? approverUserId, int requesterId, string approverComments, int purchaseOrderRequestId, string purchaseOrderNumber)
        {
            string type = string.Empty;
            PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail = null;
            objPurchaseOrderRequestClarficationMail = new PurchaseOrderRequestClarificationMail();

            objPurchaseOrderRequestClarficationMail = PreparePurchaseOrderRequestMailData(approverUserId, requesterId, approverComments, purchaseOrderRequestId, purchaseOrderNumber);
            if (objPurchaseOrderRequestClarficationMail != null)
            {
                type = "Purchase Order Request";
                Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderRequestClarificationMail(objPurchaseOrderRequestClarficationMail, type);
            }
        }

        public void SendPurchaseOrderRequestReplyMail(int? approverUserId, int requesterId, string approverComments, int purchaseOrderRequestId, string purchaseOrderNumber)
        {
            string type = string.Empty;
            PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail = null;
            objPurchaseOrderRequestClarficationMail = new PurchaseOrderRequestClarificationMail();

            objPurchaseOrderRequestClarficationMail = PreparePurchaseOrderRequestMailData(approverUserId, requesterId, approverComments, purchaseOrderRequestId, purchaseOrderNumber);
            if (objPurchaseOrderRequestClarficationMail != null)
            {
                type = "Purchase Order Request";
                Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderRequestReplyMail(objPurchaseOrderRequestClarficationMail, type);
            }
        }
        
        private PurchaseOrderRequestClarificationMail PreparePurchaseOrderRequestMailData(int? approverUserId, int requesterId, string approverComments, int purchaseOrderRequestId, string purchaseOrderNumber)
        {          
            objUserRepository = new UserProfileRepository();
            PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail = null;
            objPurchaseOrderRequestClarficationMail = new PurchaseOrderRequestClarificationMail();
            var approver = objUserRepository.GetUserById(approverUserId);
            var requester = objUserRepository.GetUserById(requesterId);
            if (approver != null)
            {
                objPurchaseOrderRequestClarficationMail.ApproverName = approver.FirstName;
                objPurchaseOrderRequestClarficationMail.ApproverEmail = approver.EmailId;
            }

            if (requester != null)
            {
                objPurchaseOrderRequestClarficationMail.RequesterName = requester.FirstName;
                objPurchaseOrderRequestClarficationMail.RequesterEmail = requester.EmailId;
            }

            if (approver != null && requester != null)
            {               
                objPurchaseOrderRequestClarficationMail.RequestId = purchaseOrderRequestId;
                objPurchaseOrderRequestClarficationMail.ApproverComments = approverComments;
                objPurchaseOrderRequestClarficationMail.PurchaseOrderNumber = purchaseOrderNumber;               
            }

            return objPurchaseOrderRequestClarficationMail;
        }
    }
}
