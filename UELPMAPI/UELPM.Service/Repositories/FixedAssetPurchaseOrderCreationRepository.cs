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
using UELPM.Util.FileOperations;
using UELPM.Service.Exceptions;
using System.Globalization;

namespace UELPM.Service.Repositories
{
    public class FixedAssetPurchaseOrderCreationRepository : IFixedAssetPurchaseOrderCreationRepository

    {
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        SharedRepository sharedRepository = null;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        /*
            this method is used to get the list of purchase orders....... 
        */

        public PurchaseOrderDisplayResult GetFixedAssetPurchaseOrders(GridDisplayInput purchaseOrderInput)
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("FixedAssetPurchaseOrderCreation_CRUD", new
                {
                    Action = "SELECT",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<PurchaseOrderList>().AsList();
                    //total number of purchase orders
                    purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return purchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        /*
         this method is used to get thE purchase order details....... 
        */
        public FixedAssetPurchaseOrder GetFixedAssetPurchaseOrderDetails(string purchaseOrderId, int companyId)
        {
            try
            {
                FixedAssetPurchaseOrder purchaseOrderDetailsObj = new FixedAssetPurchaseOrder();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("FixedAssetPurchaseOrderCreation_CRUD", new
                {

                    Action = "SELECTBYID",
                    FixedAssetPurchaseOrderId = purchaseOrderId,
                    ProcessId = WorkFlowProcessTypes.FixedAssetPO,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //purchase order details..
                    purchaseOrderDetailsObj = result.Read<FixedAssetPurchaseOrder, Suppliers, SupplierSubCode, FixedAssetPurchaseOrder>((Pc, Su, Ssc) =>
                    {

                        Pc.Supplier = Su;
                        Pc.SupplierSubCode = Ssc;
                        return Pc;
                    }, splitOn: "SupplierId, SubCodeId").FirstOrDefault();
                    if (purchaseOrderDetailsObj != null)
                    {
                        //purchase order items.
                        purchaseOrderDetailsObj.PurchaseOrderItems = result.Read<FixedAssetPurchaseOrderItems, AssetSubCategory, AccountCode, FixedAssetPurchaseOrderItems>((Pc, IM, Ac) =>
                        {
                            decimal taxTotal = 0;
                            decimal itemTotalPrice = 0;
                            decimal totalPrice = 0;
                            decimal totalbefTax = 0;
                            if (IM != null && IM.AssetSubcategoryId > 0)
                            {
                                Pc.AssetSubCategory = IM;
                            }
                            else
                            {
                                Pc.Asset = new GetAssets() { AssetId = 0, AssetName = Pc.ServiceText };
                                Pc.AssetSubCategory = new AssetSubCategory() { AssetSubcategoryId = 0, AssetSubcategory = Pc.ServiceText, Description = Pc.AssetDescription };
                            }

                            if ((Pc.TypeId == Convert.ToInt32(FixedAssetTypes.Asset)) || (Pc.TypeId == 0))
                            {
                                Pc.ItemType = "Asset";
                            }
                            if (Pc.TypeId == Convert.ToInt32(FixedAssetTypes.Service))
                            {
                                Pc.ItemType = "Service";
                            }

                            if (Ac != null && Ac.AccountCodeId > 0)
                            {
                                Pc.Service = Ac;
                            }
                            else
                            {
                                Pc.Service = new AccountCode() { AccountCodeId = 0, Description = "" };
                            }

                            SharedRepository.GetPurchaseOrderItemPrice(Pc.Unitprice, Pc.AssetQty,
                                            Pc.TaxAmount, Pc.Discount, purchaseOrderDetailsObj.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                            Pc.TaxTotal = taxTotal;
                            Pc.ItemTotalPrice = itemTotalPrice;
                            Pc.Totalprice = totalPrice;
                            Pc.TotalbefTax = totalbefTax;
                            return Pc;
                        }, splitOn: "AssetId, AccountCodeId").ToList();
                        //purchaseOrderDetailsObj.APOQuotationItem = result.Read<APOQuotationItem, Suppliers, APOQuotationItem>((Pc, IM) =>
                        //{
                        //    Pc.Supplier = IM;
                        //    return Pc;
                        //}, splitOn: "SupplierId").ToList();
                        purchaseOrderDetailsObj.APOQuotationItem = result.Read<APOQuotationItem>().ToList();

                        UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                        if (currentApproverDetails != null)
                        {
                            //purchase order items.
                            purchaseOrderDetailsObj.CurrentApproverUserId = currentApproverDetails.UserID;
                            purchaseOrderDetailsObj.CurrentApproverUserName = currentApproverDetails.UserName;
                        }

                        decimal subTotal = 0;
                        subTotal = purchaseOrderDetailsObj.PurchaseOrderItems.Sum(i => i.ItemTotalPrice);
                        // var totalTax = (subTotal * purchaseOrderDetailsObj.TaxRate / 100);
                        var totalTax = 0;
                        // purchaseOrderDetailsObj.TotalTax = totalTax;
                        purchaseOrderDetailsObj.SubTotal = subTotal;
                        purchaseOrderDetailsObj.TotalAmount = (subTotal - purchaseOrderDetailsObj.Discount) + totalTax + purchaseOrderDetailsObj.ShippingCharges + purchaseOrderDetailsObj.OtherCharges;
                        purchaseOrderDetailsObj.ContactPersons = result.Read<SupplierContactPerson>().ToList();
                        purchaseOrderDetailsObj.AmountinWords = SharedRepository.changeToWords(purchaseOrderDetailsObj.TotalAmount.ToString("0.00"), true);
                        try
                        {
                            var quotationattachment = this.m_dbconnection.Query<APOQuotationAttachments>("SPOQuotationFileOperations_CRUD", new
                            {
                                Action = "SELECTSPOQUOTATION",
                                PurchaseOrderId = purchaseOrderId,
                                POTypeId = PurchaseOrderType.FixedAssetPo
                            }, commandType: CommandType.StoredProcedure);

                            purchaseOrderDetailsObj.APOQuotationAttachment = quotationattachment.ToList();
                        }
                        catch { }
                        var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                        {
                            Action = "SELECT",
                            RecordId = purchaseOrderId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.FixedAssetPurchaseOrder) //static value need to change
                        }, commandType: CommandType.StoredProcedure);

                        purchaseOrderDetailsObj.Attachments = attachments.ToList();
                        this.sharedRepository = new SharedRepository();
                        DocumentAddress address = this.sharedRepository.GetDocumentAddress(purchaseOrderDetailsObj.POTypeId, purchaseOrderDetailsObj.FixedAssetPurchaseOrderId, purchaseOrderDetailsObj.CompanyId);
                        purchaseOrderDetailsObj.SupplierAddress = address == null ? string.Empty : address.Address;
                    }
                    return purchaseOrderDetailsObj;
                }
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        /*
            this method is used to create the purchase order...
        */
        public int CreateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder)
        {
            try
            {

                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region purchase order creation...
                        var paramaterObj = new DynamicParameters();
                        string poCode = transactionObj.Connection.QueryFirstOrDefault<string>("FixedAssetPurchaseOrderCreation_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string fixedAssetPoCode = DraftCode + ModuleCodes.AssetPurchaseOrder + "-" + poCode;
                        int purchaseOrderId = transactionObj.Connection.QueryFirstOrDefault<int>("FixedAssetPurchaseOrderCreation_CRUD", new
                        {
                            Action = "INSERT",
                            FixedAssetPurchaseOrderCode = fixedAssetPoCode,
                            CompanyId = purchaseOrder.CompanyId,
                            LocationId = purchaseOrder.LocationId,
                            Supplierid = purchaseOrder.Supplier.SupplierId,
                            RequestedBy = purchaseOrder.RequestedBy,
                            Discount = purchaseOrder.Discount,
                            TaxRate = purchaseOrder.TaxRate,
                            ShippingCharges = purchaseOrder.ShippingCharges,
                            OtherCharges = purchaseOrder.OtherCharges,
                            TotalAmount = purchaseOrder.TotalAmount,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrder.CostOfServiceId,
                            POTypeId = purchaseOrder.POTypeId,
                            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                            VendorReferences = purchaseOrder.VendorReferences,
                            CurrencyId = purchaseOrder.CurrencyId,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            Instructions = purchaseOrder.Instructions,
                            Justifications = purchaseOrder.Justifications,
                            IsGstRequired = purchaseOrder.IsGstRequired,
                            DeliveryAddress = purchaseOrder.DeliveryAddress,
                            DeliveryTermId = purchaseOrder.DeliveryTermId,
                            Reasons = purchaseOrder.Reasons,
                            PaymentTermId = purchaseOrder.PaymentTermId,
                            IsGstBeforeDiscount = purchaseOrder.IsGstBeforeDiscount,
                            RemarksQuotation = purchaseOrder.RemarksQuotation,
                            //SupplierSubCodeId = purchaseOrder.SupplierSubCode == null ? (int?)null : purchaseOrder.SupplierSubCode.SubCodeId,
                            SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                            ContactPersonName = purchaseOrder.ContactPersonName,
                            ContactNo = purchaseOrder.ContactNo,
                            ContactEmail = purchaseOrder.ContactEmail,
                            InventoryRequestId = purchaseOrder.InventoryRequestId
                        },
                                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);
                        #endregion

                        #region  we are saving Quotation items...
                        if (purchaseOrder.APOQuotationItem.Count > 0)
                        {
                            int count = 0;
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            foreach (var record in purchaseOrder.APOQuotationItem)
                            {
                                int QuotationId = transactionObj.Connection.QueryFirstOrDefault<int>("FixedAssetPurchaseOrderCreation_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    //SupplierId = record.Supplier.SupplierId,
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    FixedAssetPurchaseOrderId = purchaseOrderId,
                                    QuotationAmount = record.QuotationAmount,
                                    QuotationRemarks = record.QuotationRemarks,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    POTypeId = purchaseOrder.POTypeId,
                                    CreatedDate = DateTime.Now,
                                },
                                   transaction: transactionObj,
                                   commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);

                                        //if (purchaseOrder.files[i].FileName.Contains("APOFiles@" + count))
                                        //{           
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filname = name[2];
                                            var itemObj = new DynamicParameters();
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@PurchaseOrderId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            quotationItemToAdd.Add(itemObj);
                                        }
                                    }
                                    catch { }
                                }
                                count++;
                            }
                            var SPOQuotationItemSaveResult = transactionObj.Connection.Execute("SPOQuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region  we are saving purchase order items...
                        if (purchaseOrder.PurchaseOrderItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrder.PurchaseOrderItems)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@IsDetailed", record.IsDetailed, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@AssetAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@FixedAssetPurchaseOrderId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);

                                if (record.TypeId == Convert.ToInt32(FixedAssetTypes.Asset))
                                {
                                    if (record.AssetSubCategory.AssetSubcategoryId > 0)
                                    {
                                        itemObj.Add("@AssetId", record.AssetSubCategory.AssetSubcategoryId, DbType.Int32, ParameterDirection.Input);
                                    }

                                    itemObj.Add("@ServiceText", record.AssetSubCategory.AssetSubcategoryId == 0 ? record.AssetSubCategory.AssetSubcategory : "", DbType.String, ParameterDirection.Input);
                                }

                                if (record.TypeId == Convert.ToInt32(FixedAssetTypes.Service))
                                {
                                    itemObj.Add("@AssetId", record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ServiceText", record.Service.AccountCodeId == 0 ? record.Service.Description : "", DbType.String, ParameterDirection.Input);
                                }

                                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@AssetDescription", record.AssetDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AssetQty", record.AssetQty, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        #region saving files here...
                        if (purchaseOrder.files != null)
                        {
                            try
                            {
                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                                    Files = purchaseOrder.files,
                                    UniqueId = purchaseOrderId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    if (!purchaseOrder.files[i].FileName.Contains("APOFiles@"))
                                    {
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.FixedAssetPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                        itemObj.Add("@RecordId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        fileToSave.Add(itemObj);
                                    }
                                }
                                var purchaseOrderFileSaveResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                            }
                            catch (Exception e)
                            {
                                throw e;
                            }
                            #endregion

                        }
                        //commiting the transaction...
                        // transactionObj.Commit();
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrderId,
                            ProcessId = (int)WorkFlowProcessTypes.FixedAssetPO
                        }, transactionObj);
                        #endregion
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            purchaseOrder.FixedAssetPurchaseOrderId = purchaseOrderId;
                            purchaseOrder.FixedAssetPurchaseOrderCode = fixedAssetPoCode;
                            SendForApproval(purchaseOrder, false, transactionObj, transactionObj.Connection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                        string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        DateTime now = DateTime.Now;
                        //if (string.IsNullOrEmpty(purchaseOrder.FixedAssetPurchaseOrderCode) && !string.IsNullOrEmpty(fixedAssetPoCode))
                        //{
                        //AuditLog.Info("FixedAssetPurchaseOrderCreation", "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreateFixedAssetPurchaseOrder", "Fixed Asset Purchase Order " + fixedAssetPoCode + " with draft status  created by " + UserName + "", purchaseOrder.CompanyId);
                        AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Created by " + UserName + " on " + now + "", purchaseOrder.CompanyId);
                        AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Saved as Draft " + UserName + " on " + now + "", purchaseOrder.CompanyId);

                        //}
                        //else
                        //{
                        //    AuditLog.Info("FixedAssetPurchaseOrderCreation", "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreateFixedAssetPurchaseOrder", "Fixed Asset Purchase Order " + purchaseOrder.FixedAssetPurchaseOrderCode + " created by " + UserName + "", purchaseOrder.CompanyId);
                        //}
                        return purchaseOrderId;
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


        /*
            this method is used to update the purchase order...
        */
        public int UpdateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder)
        {
            try
            {
                string check = null;

                FixedAssetPurchaseOrder poItem = GetFixedAssetPurchaseOrderDetails(purchaseOrder.FixedAssetPurchaseOrderId.ToString(), purchaseOrder.CompanyId);
                purchaseOrder.CurrentWorkFlowStatusId = poItem.WorkFlowStatusId;


                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", new
                        {

                            Action = "UPDATE",
                            CompanyId = purchaseOrder.CompanyId,
                            LocationId = purchaseOrder.LocationId,
                            Supplierid = purchaseOrder.Supplier.SupplierId,
                            RequestedBy = purchaseOrder.RequestedBy,
                            Discount = purchaseOrder.Discount,
                            TaxRate = purchaseOrder.TaxRate,
                            ShippingCharges = purchaseOrder.ShippingCharges,
                            OtherCharges = purchaseOrder.OtherCharges,
                            TotalAmount = purchaseOrder.TotalAmount,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrder.CostOfServiceId,
                            POTypeId = purchaseOrder.POTypeId,
                            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                            VendorReferences = purchaseOrder.VendorReferences,
                            CurrencyId = purchaseOrder.CurrencyId,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            Instructions = purchaseOrder.Instructions,
                            Justifications = purchaseOrder.Justifications,
                            FixedAssetPurchaseOrderId = purchaseOrder.FixedAssetPurchaseOrderId,
                            IsGstRequired = purchaseOrder.IsGstRequired,
                            PaymentTermId = purchaseOrder.PaymentTermId,
                            DeliveryTermId = purchaseOrder.DeliveryTermId,
                            Reasons = purchaseOrder.Reasons,
                            DeliveryAddress = purchaseOrder.DeliveryAddress,
                            IsGstBeforeDiscount = purchaseOrder.IsGstBeforeDiscount,
                            RemarksQuotation = purchaseOrder.RemarksQuotation,
                            //SupplierSubCodeId = purchaseOrder.SupplierSubCode == null ? (int?)null : purchaseOrder.SupplierSubCode.SubCodeId,
                            SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                            ContactPersonName = purchaseOrder.ContactPersonName,
                            ContactNo = purchaseOrder.ContactNo,
                            ContactEmail = purchaseOrder.ContactEmail,
                            CurrentWorkFlowStatusId = poItem.WorkFlowStatusId,
                            InventoryRequestId = purchaseOrder.InventoryRequestId

                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);


                        #endregion

                        #region  we are saving Quotation items..
                        if (purchaseOrder.APOQuotationItem != null)
                        {
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            int count = 0;
                            foreach (var record in purchaseOrder.APOQuotationItem.Where(j => j.QuotationId == 0).Select(j => j))
                            {
                                int QuotationId = transactionObj.Connection.QueryFirstOrDefault<int>("FixedAssetPurchaseOrderCreation_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    //SupplierId = record.Supplier.SupplierId,
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    FixedAssetPurchaseOrderId = purchaseOrder.FixedAssetPurchaseOrderId,
                                    QuotationAmount = record.QuotationAmount,
                                    QuotationRemarks = record.QuotationRemarks,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    POTypeId = purchaseOrder.POTypeId,
                                    CreatedDate = DateTime.Now
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);

                                int countvalue = transactionObj.Connection.QueryFirstOrDefault<int>("SPOQuotationFileOperations_CRUD", new
                                {
                                    Action = "FETCHSPOQUOTATIONITEM",
                                    PurchaseOrderId = purchaseOrder.FixedAssetPurchaseOrderId,
                                    POTypeId = PurchaseOrderType.FixedAssetPo
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);
                                if (countvalue >= 0)
                                {
                                    if (count == 0)
                                    {
                                        count = countvalue + 1;
                                    }
                                }
                                //countvalue = countvalue;
                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        //if (purchaseOrder.files[i].FileName.Contains("APOFiles@" + count))
                                        //{
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filname = name[2];
                                            var itemObj = new DynamicParameters();
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@PurchaseOrderId", purchaseOrder.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            quotationItemToAdd.Add(itemObj);
                                        }
                                    }
                                    catch { }
                                }
                                check += count + ",";
                                count++;
                            }
                            var purchaseOrderRequestItemSaveResult = transactionObj.Connection.Execute("SPOQuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }

                        #endregion


                        #region  we are updating Quotation items..
                        if (purchaseOrder.APOQuotationItem != null)
                        {
                            int add = 0;
                            int count = 0;
                            List<DynamicParameters> quotationItemToUpdate = new List<DynamicParameters>();
                            foreach (var record in purchaseOrder.APOQuotationItem.Where(k => k.QuotationId > 0).Select(k => k))
                            {
                                for (var i = 0; i <= purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        string RowID = (name[1]);
                                        if (check == null)
                                        {
                                            count = Convert.ToInt32(RowID);
                                            check += RowID + ",";
                                            break;
                                        }
                                        if (!check.Contains(RowID))
                                        {
                                            count = Convert.ToInt32(RowID);
                                            check += RowID + ",";
                                            break;
                                        }
                                    }
                                    catch { }
                                }
                                int updatequotationResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", new
                                {
                                    Action = "UPDATEQUOTATIONITEM",
                                    QuotationId = record.QuotationId,
                                    QuotationRemarks = record.QuotationRemarks,
                                    //SupplierId = record.Supplier.SupplierId,
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    QuotationAmount = record.QuotationAmount,
                                    POTypeId = purchaseOrder.POTypeId,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    CreatedDate = DateTime.Now
                                },
                                 transaction: transactionObj,
                                 commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        //if (purchaseOrder.files[i].FileName.Contains("APOFiles@" + count))
                                        //{
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filename = name[2];
                                            var itemObj1 = new DynamicParameters();
                                            itemObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj1.Add("@PurchaseOrderId", purchaseOrder.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@QuotationId", record.QuotationId, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@FileName", Filename, DbType.String, ParameterDirection.Input);
                                            itemObj1.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            quotationItemToUpdate.Add(itemObj1);
                                        }
                                    }
                                    catch { }
                                }
                                //count++;
                                add++;

                            }
                            var purchaseOrderquotationItemSaveResult = transactionObj.Connection.Execute("SPOQuotationFileOperations_CRUD", quotationItemToUpdate, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }

                        #endregion


                        #region we are saving purchase order items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.PurchaseOrderItems.Where(i => i.FixedAssetPOItemId == 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AssetAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@IsDetailed", record.IsDetailed, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@FixedAssetPurchaseOrderId", purchaseOrder.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);

                            if (record.TypeId == Convert.ToInt32(FixedAssetTypes.Asset))
                            {
                                if (record.AssetSubCategory.AssetSubcategoryId > 0)
                                {
                                    itemObj.Add("@AssetId", record.AssetSubCategory.AssetSubcategoryId, DbType.Int32, ParameterDirection.Input);
                                }

                                itemObj.Add("@ServiceText", record.AssetSubCategory.AssetSubcategoryId == 0 ? record.AssetSubCategory.AssetSubcategory : "", DbType.String, ParameterDirection.Input);
                            }

                            if (record.TypeId == Convert.ToInt32(FixedAssetTypes.Service))
                            {
                                itemObj.Add("@AssetId", record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ServiceText", record.Service.AccountCodeId == 0 ? record.Service.Description : "", DbType.String, ParameterDirection.Input);
                            }

                            itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@AssetDescription", record.AssetDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AssetQty", record.AssetQty, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }


                        var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);


                        #endregion

                        #region updating purchase order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.PurchaseOrderItems.Where(i => i.FixedAssetPOItemId > 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@IsDetailed", record.IsDetailed, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@AssetAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@FixedAssetPOItemId", record.FixedAssetPOItemId, DbType.Int32, ParameterDirection.Input);

                            if (record.TypeId == Convert.ToInt32(FixedAssetTypes.Asset))
                            {
                                if (record.AssetSubCategory.AssetSubcategoryId > 0)
                                {
                                    itemObj.Add("@AssetId", record.AssetSubCategory.AssetSubcategoryId, DbType.Int32, ParameterDirection.Input);
                                }

                                itemObj.Add("@ServiceText", record.AssetSubCategory.AssetSubcategoryId == 0 ? record.AssetSubCategory.AssetSubcategory : "", DbType.String, ParameterDirection.Input);
                            }

                            if (record.TypeId == Convert.ToInt32(FixedAssetTypes.Service))
                            {
                                itemObj.Add("@AssetId", record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ServiceText", record.Service.AccountCodeId == 0 ? record.Service.Description : "", DbType.String, ParameterDirection.Input);
                            }

                            itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@AssetDescription", record.AssetDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AssetQty", record.AssetQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToUpdate.Add(itemObj);
                        }


                        var purchaseOrderItemUpdateResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting purchase order items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (purchaseOrder.PurchaseOrderItemsToDelete != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var purchaseOrderItemId in purchaseOrder.PurchaseOrderItemsToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@FixedAssetPOItemId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToDelete.Add(itemObj);
                            }
                        }

                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", itemsToDelete,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting attachments
                        //looping through attachments
                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                        for (var i = 0; i < purchaseOrder.Attachments.Count; i++)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@AttachmentTypeId", purchaseOrder.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", purchaseOrder.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", purchaseOrder.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var purchaseOrderFileDeleteResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);
                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                                FilesNames = purchaseOrder.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = purchaseOrder.FixedAssetPurchaseOrderId.ToString()
                            });
                        }

                        #endregion

                        #region deleting quotation items...

                        List<DynamicParameters> itemsToDelete2 = new List<DynamicParameters>();

                        if (purchaseOrder.APOQuotationItemToDelete != null)
                        {
                            foreach (var quotationId in purchaseOrder.APOQuotationItemToDelete)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "DELETEQUOTATIONITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@QuotationId", quotationId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemsToDelete2.Add(itemObj);
                            }
                        }

                        var SPOItemDeleteResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", itemsToDelete2,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion


                        #region deleting quotation attachments
                        if (purchaseOrder.APOQuotationAttachmentDelete != null)
                        {
                            for (var i = 0; i < purchaseOrder.APOQuotationAttachmentDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@SPOQuotationId", purchaseOrder.APOQuotationAttachmentDelete[i].SPOQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@QuotationId", purchaseOrder.APOQuotationAttachmentDelete[i].QuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrder.APOQuotationAttachmentDelete[i].RowId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@PurchaseOrderId", purchaseOrder.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                var spoquotationFileDeleteResult = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);

                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                                    FilesNames = spoquotationFileDeleteResult.ToArray(),
                                    UniqueId = purchaseOrder.FixedAssetPurchaseOrderId.ToString()
                                });

                            }
                        }

                        #endregion

                        #region updating quotation attachments rowid
                        if (purchaseOrder.APOQuotationAttachmentUpdateRowId != null)
                        {
                            for (var i = 0; i < purchaseOrder.APOQuotationAttachmentUpdateRowId.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "UPDATEROW", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@SPOQuotationId", purchaseOrder.APOQuotationAttachmentUpdateRowId[i].SPOQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrder.APOQuotationAttachmentUpdateRowId[i].RowId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                var Quotationrowupdate = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);
                            }
                        }

                        #endregion



                        #region saving files uploaded files...
                        try
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            for (var i = 0; i < purchaseOrder.files.Count; i++)
                            {
                                var itemObj = new DynamicParameters();
                                if (!purchaseOrder.files[i].FileName.Contains("APOFiles@"))
                                {
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.FixedAssetPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", purchaseOrder.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    fileToSave.Add(itemObj);
                                }
                            }

                            var purchaseOrderFileSaveResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                                Files = purchaseOrder.files,
                                UniqueId = purchaseOrder.FixedAssetPurchaseOrderId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...
                        //transactionObj.Commit();
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrder.FixedAssetPurchaseOrderId,
                            ProcessId = (int)WorkFlowProcessTypes.FixedAssetPO
                        }, transactionObj);
                        #endregion
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            SendForApproval(purchaseOrder, false, transactionObj, transactionObj.Connection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(purchaseOrder.CreatedBy).UserName;
                        string FixedAssetPurchaseOrderCode = GetFixedPurchaseOrderCode(purchaseOrder.FixedAssetPurchaseOrderId);
                        //if (string.IsNullOrEmpty(purchaseOrder.FixedAssetPurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                        //if(purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Draft))
                        //{
                        DateTime now = DateTime.Now;
                        if (poItem.TotalAmount != purchaseOrder.TotalAmount)
                        {
                            AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "UpdateFixedAssetPurchaseOrder", "Purchase Order total recalculated, new total is " + string.Format(new CultureInfo("en-US"), "{0:C}", purchaseOrder.TotalAmount) + " " + now + "", purchaseOrder.CompanyId);
                        }
                        //}
                        //else
                        //{
                        //  AuditLog.Info("FixedAssetPurchaseOrderCreation", "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "UpdateFixedAssetPurchaseOrder", "Fixed Asset Purchase Order " + FixedAssetPurchaseOrderCode + " updated by " + UserName + "",purchaseOrder.CompanyId);
                        //}
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

        public string GetFixedPurchaseOrderCode(int fixedAssetPurchaseOrderId)
        {
            return this.m_dbconnection.Query<string>("select (case  when  FixedAssetPurchaseOrderCode != null OR FixedAssetPurchaseOrderCode <> ''  then  FixedAssetPurchaseOrderCode   ELSE DraftCode end) from FixedAssetPurchaseOrder  where FixedAssetPurchaseOrderId=" + fixedAssetPurchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
        }

        public void SendForApproval(FixedAssetPurchaseOrder purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {
            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                UserProfile nextUserRoles = new UserProfile();
                string nextUserRole = string.Empty;
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                workFlowConfigRepository = new WorkFlowConfigurationRepository();
                string itemCategory = string.Empty;
                decimal totalQuantity = 0;
                if (purchaseOrder.PurchaseOrderItems != null && purchaseOrder.PurchaseOrderItems.Count > 0)
                {
                    itemCategory = purchaseOrder.PurchaseOrderItems[0].Asset != null ? purchaseOrder.PurchaseOrderItems.Select(x => x.Asset.AssetName).FirstOrDefault() : string.Empty;
                    totalQuantity = purchaseOrder.PurchaseOrderItems.Sum(d => d.AssetQty);
                }

                IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>(){
                                   new  WorkFlowParameter{
                                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO),
                                        CompanyId = purchaseOrder.CompanyId,
                                        Value = Convert.ToString(purchaseOrder.TotalbefTaxSubTotal),
                                        DocumentId = purchaseOrder.FixedAssetPurchaseOrderId,
                                        CreatedBy = purchaseOrder.CreatedBy,
                                        DocumentCode =purchaseOrder.FixedAssetPurchaseOrderCode,
                                        ItemCategory = itemCategory,
                                        ItemQuantity = totalQuantity.ToString(),
                                        WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                                        LocationId = purchaseOrder.LocationId
                                   }
                                }, dbTransaction, dbConnection);
                string PurchaseOrderCode = GetPurchaseOrderCode(purchaseOrder.FixedAssetPurchaseOrderId, purchaseOrder.POTypeId);


                var user1 = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                string.Format("{0} {1}", user1.FirstName, user1.LastName);
                DateTime now = DateTime.Now;
                nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)workFlowConfig.First().ApproverUserId, purchaseOrder.CompanyId);
                nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                var user = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                string Workflowname = string.Format("{0} {1}", user.FirstName, user.LastName);

                //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                //{
                if (purchaseOrder.PurchaseOrderStatusId == (int)WorkFlowStatus.CancelledApproval)
                    //AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "resend for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "SendForApproval", string.Format("Purchase Order Resend for {0} to {1} on {2} {3}", nextUserRole == "V" ? "Verification" : "Approval", Workflowname, now, purchaseOrder.RemarksQuotation), purchaseOrder.CompanyId);
                    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "resend for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "SendForApproval", string.Format("Purchase Order Resend for {0} to {1} on {2}", nextUserRole == "V" ? "Verification" : "Approval", Workflowname, now), purchaseOrder.CompanyId);

                else
                    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "sent for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "SendForApproval", string.Format("Sent to {0} for {1} on {2}", Workflowname, nextUserRole == "V" ? "Verification" : "Approval", now), purchaseOrder.CompanyId);
                //if (workFlowConfig.ToList().Count > 2)
                //{
                //    string Workflowname2 = userProfileRepository.GetUserById(workFlowConfig.ToList()[1].ApproverUserId).UserName;
                //    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "sent for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "SendForApproval", "Consent by " + Workflowname + " and sent to " + Workflowname2 + "  consent on " + now + " ", purchaseOrder.CompanyId);

                //}


                //AuditLog.Info("FixedAssetPurchaseOrder", "send approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "SendForApproval", "Fixed Asset Purchase Order " + PurchaseOrderCode + " sent for Approval",purchaseOrder.CompanyId);
                //int updateResult = this.m_dbconnection.Execute("FixedAssetPurchaseOrderCreation_CRUD", new
                //{
                //    Action = "UPDATEWORKFLOWSTATUS",
                //    WorkFlowStatusId = (workFlowConfig == null || workFlowConfig.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.Approved) : purchaseOrder.WorkFlowStatusId,
                //    FixedAssetPurchaseOrderId = purchaseOrder.FixedAssetPurchaseOrderId
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

        public string GetPurchaseOrderCode(int fixedAssetPurchaseOrderId, int PoTypeId)
        {
            return this.m_dbconnection.Query<string>("select FixedAssetPurchaseOrderCode from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId=" + fixedAssetPurchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
        }

        /*
            this method is used to delete the purchase order...
        */
        public bool DeleteFixedAssetPurchaseOrder(FixedAssetPurchaseOrderDelete purchaseOrderDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region delete purchase order...

                        var purchaseOrderDeleteResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    FixedAssetPurchaseOrderId = purchaseOrderDelete.FixedAssetPurchaseOrderId,
                                                                    CreatedBy = purchaseOrderDelete.ModifiedBy
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #endregion

                        #region deleting purchase order items...
                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("FixedAssetPurchaseOrderCreation_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            FixedAssetPurchaseOrderId = purchaseOrderDelete.FixedAssetPurchaseOrderId,
                            CreatedBy = purchaseOrderDelete.ModifiedBy,
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
                            parameterObj.Add("@RecordId", purchaseOrderDelete.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.FixedAssetPurchaseOrder), DbType.Int32, ParameterDirection.Input);

                            var deletedAttachmentNames = transactionObj.Connection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.FixedAssetPurchaseOrderId.ToString()
                            });

                            var parameterObj1 = new DynamicParameters();
                            parameterObj1.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj1.Add("@PurchaseOrderId", purchaseOrderDelete.FixedAssetPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            parameterObj1.Add("@POTypeId", PurchaseOrderType.FixedAssetPo, DbType.Int32, ParameterDirection.Input);

                            var deletedQuotationAttachmentNames = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", parameterObj1, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                            //saving files in the folder...
                            bool fileStatus1 = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                                FilesNames = deletedQuotationAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.FixedAssetPurchaseOrderId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(purchaseOrderDelete.ModifiedBy).UserName;
                        //  int CompanyId = GetCompanyId(purchaseOrderDelete.FixedAssetPurchaseOrderId);
                        AuditLog.Info("FixedAssetPurchaseOrderCreation", "Delete", purchaseOrderDelete.ModifiedBy.ToString(), purchaseOrderDelete.FixedAssetPurchaseOrderId.ToString(), "DeleteFixedAssetPurchaseOrder", "Fixed Asset Purchase Order with ID " + purchaseOrderDelete.FixedAssetPurchaseOrderId + " deleted by " + UserName, 0);
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
        //public int GetCompanyId(int FixedAssetPurchaseOrderId)
        //{
        //    int CompanyId = 0;
        //    try
        //    {
        //        CompanyId = this.m_dbconnection.Query<int>("select CompanyId from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId=" + FixedAssetPurchaseOrderId).FirstOrDefault();
        //    }
        //    catch (Exception e)
        //    {

        //    }

        //    return CompanyId;
        //}

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();

                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
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

        public byte[] DownloadAPOQuotationFile(APOQuotationAttachments aPOQuotationAttachments)
        {
            try
            {
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadQuotationFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.AssetPurchaseOrder,
                    FilesNames = new string[] { aPOQuotationAttachments.FileName },
                    UniqueId = aPOQuotationAttachments.PurchaseOrderId.ToString() + "\\" + aPOQuotationAttachments.RowId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /* public string ConvertPurchaseOrderToPdf(int purchaseOrderId)
         {
             try
             {
                 PurchaseOrder purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId);
                 string template = PurchaseOrderTemplate.PurchaseOrderCreationTemplate(purchaseOrderDetails);
                 return template;
                 // PdfGenerator pdfGeneratorObj = new PdfGenerator();
                 // return pdfGeneratorObj.GeneratePDF(template, "");
             }
             catch (Exception e)
             {
                 throw e;
             }
         } */
    }
}
