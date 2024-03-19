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
//using UELPM.Service.Repositories;
using UELPM.Util.FileOperations;
using UELPM.Service.Exceptions;
using System.Globalization;

namespace UELPM.Service.Repositories
{
    public class ExpensesPurchaseOrderCreationRepository : IExpensesPurchaseOrderCreationRepository
    {
        SharedRepository sharedRepository = null;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrder)
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

                        string poCode = transactionObj.Connection.QueryFirstOrDefault<string>("ExpensePurchaserOrderCreation_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string purchaseOrderCode = DraftCode+ModuleCodes.ExpensePurchaseOrder + "-" + poCode;
                        int purchaseOrderId = transactionObj.Connection.QueryFirstOrDefault<int>("ExpensePurchaserOrderCreation_CRUD", new
                        {
                            Action = "INSERT",
                            ExpensesPurchaseOrderCode = purchaseOrderCode,
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
                            CurrencyId = purchaseOrder.CurrencyId,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                            Instructions = purchaseOrder.Instructions,
                            Justifications = purchaseOrder.Justifications,
                            IsGstRequired = purchaseOrder.IsGstRequired,
                            DeliveryAddress = purchaseOrder.DeliveryAddress,
                            DeliveryTermId = purchaseOrder.DeliveryTermId,
                            PaymentTermId = purchaseOrder.PaymentTermId,
                            Reasons = purchaseOrder.Reasons,
                            IsGstBeforeDiscount = purchaseOrder.IsGstBeforeDiscount,
                            VendorReferences = purchaseOrder.VendorReferences,
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
                        if (purchaseOrder.EXPOQuotationItem.Count > 0)
                        {
                            int count = 0;
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            foreach (var record in purchaseOrder.EXPOQuotationItem)
                            {
                                int QuotationId = transactionObj.Connection.QueryFirstOrDefault<int>("ExpensePurchaserOrderCreation_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    //SupplierId = record.Supplier.SupplierId,
                                    SupplierId = 0,
                                    Supplier= record.Supplier.Trim(),
                                    ExpensesPurchaseOrderId = purchaseOrderId,
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
                                        //if (purchaseOrder.files[i].FileName.Contains("EXPOFiles@" + count))
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
                                itemObj.Add("@AccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ExpensesPurchaseOrderId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                                //if (record.Expense.ExpensesMasterId > 0)
                                //{
                                //    itemObj.Add("@ExpensesMasterId", record.Expense.ExpensesMasterId, DbType.Int32, ParameterDirection.Input);
                                //}
                                //itemObj.Add("@ServiceText", record.Expense.ExpensesMasterId == 0 ? record.Expense.ExpensesDetail : "", DbType.String, ParameterDirection.Input);

                                if (record.Expense.AccountCodeId > 0)
                                {
                                    itemObj.Add("@ExpensesMasterId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                }

                                itemObj.Add("@ServiceText", record.Expense.AccountCodeId == 0 ? record.Expense.Description : "", DbType.String, ParameterDirection.Input);

                                itemObj.Add("@ExpensesDescription", record.ExpensesDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ExpensesQty", record.ExpensesQty, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                if (record.TaxID > 0)
                                {
                                    itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                }

                                itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", itemToAdd, transaction: transactionObj,
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
                                    ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                                    Files = purchaseOrder.files,
                                    UniqueId = purchaseOrderId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    if (!purchaseOrder.files[i].FileName.Contains("EXPOFiles@"))
                                    {
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ExpensePurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
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

                        }
                        //commiting the transaction...

                        #endregion
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrderId,
                            ProcessId = (int)WorkFlowProcessTypes.ExpensesPo
                        }, transactionObj);
                        #endregion
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            purchaseOrder.ExpensesPurchaseOrderId = purchaseOrderId;
                            purchaseOrder.ExpensesPurchaseOrderCode = purchaseOrderCode;
                            new SharedRepository().SendForApproval(new WorkFlowParameter
                            {
                                CompanyId = purchaseOrder.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo),
                                Value = Convert.ToString(purchaseOrder.TotalbefTaxSubTotal),
                                DocumentId = purchaseOrder.ExpensesPurchaseOrderId,
                                CreatedBy = purchaseOrder.CreatedBy,
                                DocumentCode = purchaseOrder.ExpensesPurchaseOrderCode,
                                ItemCategory = "",
                                ItemQuantity = "0",
                                WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                                LocationId = purchaseOrder.LocationId
                            }, false, transactionObj, transactionObj.Connection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user= userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                        string UserName= string.Format("{0} {1}", user.FirstName, user.LastName);
                        DateTime now = DateTime.Now;
                        //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrderCode))
                        //{
                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Created by " + UserName + " on " + now + "", purchaseOrder.CompanyId);
                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Saved as Draft " + UserName + " on " + now + "", purchaseOrder.CompanyId);

                        //}
                        //if (string.IsNullOrEmpty(purchaseOrder.ExpensesPurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrderCode))
                        //{
                        //AuditLog.Info("ExpensePurchaseOrderCreation", "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreateExpensePurchaseOrder", "Expense Purchase Order " + purchaseOrderCode + " with draft status created by " + UserName + "", purchaseOrder.CompanyId);
                        //}
                        //else
                        //{
                        //    AuditLog.Info("ExpensePurchaseOrderCreation", "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreateExpensePurchaseOrder", "Expense Purchase Order " + purchaseOrder.ExpensesPurchaseOrderCode + " created by " + UserName + "", purchaseOrder.CompanyId);
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

        public bool DeleteExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrderDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region delete purchase order...

                        var purchaseOrderDeleteResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    ExpensesPurchaseOrderId = purchaseOrderDelete.ExpensesPurchaseOrderId,
                                                                    CreatedBy = purchaseOrderDelete.CreatedBy,
                                                                    CreatedDate = DateTime.Now
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        #endregion
                        #region deleting purchase order items...
                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            ExpensesPurchaseOrderId = purchaseOrderDelete.ExpensesPurchaseOrderId,
                            CreatedBy = purchaseOrderDelete.CreatedBy,
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
                            parameterObj.Add("@RecordId", purchaseOrderDelete.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ExpensePurchaseOrder), DbType.Int32, ParameterDirection.Input);

                            var deletedAttachmentNames = transactionObj.Connection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.ExpensesPurchaseOrderId.ToString()
                            });

                            //QUOTATION ATTACHMENT DELETE
                            var parameterObj1 = new DynamicParameters();
                            parameterObj1.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj1.Add("@PurchaseOrderId", purchaseOrderDelete.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            parameterObj1.Add("@POTypeId", PurchaseOrderType.ExpensePo, DbType.Int32, ParameterDirection.Input);

                            var deletedQuotationAttachmentNames = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", parameterObj1, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                            //saving files in the folder...
                            bool fileStatus1 = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                                FilesNames = deletedQuotationAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.ExpensesPurchaseOrderId.ToString()
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
                        string UserName = userProfileRepository.GetUserById(purchaseOrderDelete.CreatedBy).UserName;
                        AuditLog.Info("ExpensePurchaseOrderCreation", "Delete", purchaseOrderDelete.CreatedBy.ToString(), purchaseOrderDelete.ExpensesPurchaseOrderId.ToString(), "DeleteExpensePurchaseOrder", "Expense Purchase Order with ID " + purchaseOrderDelete.ExpensesPurchaseOrderId+ " deleted by " + UserName, purchaseOrderDelete.CompanyId);
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

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();

                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
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

        public ExpensesPurchaseOrder GetExpensesPurchaseOrderDetails(string purchaseOrderId, int loggedInUserId, int companyId)
        {
            try
            {
                ExpensesPurchaseOrder purchaseOrderDetailsObj = new ExpensesPurchaseOrder();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("ExpensePurchaserOrderCreation_CRUD", new
                {

                    Action = "SELECTBYID",
                    ExpensesPurchaseOrderId = purchaseOrderId,
                    POTypeId = PurchaseOrderType.ExpensePo,
                    ProcessId = WorkFlowProcessTypes.ExpensesPo,
                    CompanyId = companyId

                }, commandType: CommandType.StoredProcedure))
                {
                    //purchase order details..
                    purchaseOrderDetailsObj = result.Read<ExpensesPurchaseOrder, Suppliers, SupplierSubCode, ExpensesPurchaseOrder>((Pc, Su, Ssc) => {

                        Pc.Supplier = Su;
                        Pc.SupplierSubCode = Ssc;
                        return Pc;
                    }, splitOn: "SupplierId, SubCodeId").FirstOrDefault();
                    if (purchaseOrderDetailsObj != null)
                    {
                        //purchase order items.
                        //purchaseOrderDetailsObj.PurchaseOrderItems = result.Read<ExpensesPurchaseOrderItems,ExpenseMaster, ExpensesPurchaseOrderItems>((Pc, IM) =>
                        //{
                        //    decimal taxTotal = 0;
                        //    decimal itemTotalPrice = 0;

                        //    if (IM != null && IM.ExpensesMasterId > 0)
                        //    {
                        //        Pc.Expense = IM;
                        //    }
                        //    else
                        //    {
                        //        Pc.Expense = new ExpenseMaster() { ExpensesMasterId = 0, ExpensesDetail = Pc.ServiceText };
                        //    }
                        //    SharedRepository.GetPurchaseOrderItemPrice(Pc.Unitprice, Pc.ExpensesQty,
                        //        Pc.TaxAmount, Pc.Discount, purchaseOrderDetailsObj.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice);
                        //    Pc.TaxTotal = taxTotal;
                        //    Pc.ItemTotalPrice = itemTotalPrice;
                        //    return Pc;
                        //}, splitOn: "ExpensesMasterId").ToList();

                        purchaseOrderDetailsObj.PurchaseOrderItems = result.Read<ExpensesPurchaseOrderItems, AccountCode, ExpensesPurchaseOrderItems>((Pc, Ac) =>
                         {
                             decimal taxTotal = 0;
                             decimal itemTotalPrice = 0;
                             decimal totalPrice = 0;
                             decimal totalbefTax = 0;
                             if (Ac != null && Ac.AccountCodeId > 0)
                             {
                                 Pc.Expense = Ac;
                             }
                             else
                             {
                                 Pc.Expense = new AccountCode() { AccountCodeId = 0, Description = "" };
                             }
                             SharedRepository.GetPurchaseOrderItemPrice(Pc.Unitprice, Pc.ExpensesQty,
                                 Pc.TaxAmount, Pc.Discount, purchaseOrderDetailsObj.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                             Pc.TaxTotal = taxTotal;
                             Pc.ItemTotalPrice = itemTotalPrice;
                             Pc.Totalprice = totalPrice;
                             Pc.TotalbefTax = totalbefTax;
                             return Pc;
                         }, splitOn: "AccountCodeId").ToList();
                        //purchaseOrderDetailsObj.EXPOQuotationItem = result.Read<EXPOQuotationItem, Suppliers, EXPOQuotationItem>((Pc, IM) =>
                        //{
                        //    Pc.Supplier = IM;
                        //    return Pc;
                        //}, splitOn: "SupplierId").ToList();

                        purchaseOrderDetailsObj.EXPOQuotationItem = result.Read<EXPOQuotationItem>().ToList();

                        UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                        if (currentApproverDetails != null)
                        {
                            //purchase order items.
                            purchaseOrderDetailsObj.CurrentApproverUserId = currentApproverDetails.UserID;
                            purchaseOrderDetailsObj.CurrentApproverUserName = currentApproverDetails.UserName;
                        }

                        decimal subTotal = 0;
                        subTotal = purchaseOrderDetailsObj.PurchaseOrderItems.Sum(i => i.ItemTotalPrice);
                        var totalTax = 0;
                        purchaseOrderDetailsObj.SubTotal = subTotal;
                        purchaseOrderDetailsObj.TotalAmount = (subTotal - purchaseOrderDetailsObj.Discount) + totalTax + purchaseOrderDetailsObj.ShippingCharges + purchaseOrderDetailsObj.OtherCharges;
                        purchaseOrderDetailsObj.ContactPersons = result.Read<SupplierContactPerson>().ToList();
                        purchaseOrderDetailsObj.AmountInWords = SharedRepository.changeToWords(purchaseOrderDetailsObj.TotalAmount.ToString("0.00"), true);
                    }
                }

                if (purchaseOrderDetailsObj != null)
                {
                    purchaseOrderDetailsObj.WorkFlowComments = new List<WorkflowAuditTrail>();
                    purchaseOrderDetailsObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = purchaseOrderDetailsObj.ExpensesPurchaseOrderId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo),
                        DocumentUserId = purchaseOrderDetailsObj.CreatedBy,
                        UserId = Convert.ToInt32(purchaseOrderDetailsObj.CreatedBy)
                    }).ToList();
                    try
                    {
                        var quotationattachment = this.m_dbconnection.Query<EXPOQuotationAttachments>("SPOQuotationFileOperations_CRUD", new
                        {
                            Action = "SELECTSPOQUOTATION",
                            PurchaseOrderId = purchaseOrderId,
                            POTypeId = PurchaseOrderType.ExpensePo
                        }, commandType: CommandType.StoredProcedure);

                        purchaseOrderDetailsObj.EXPOQuotationAttachment = quotationattachment.ToList();
                    }
                    catch { }

                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = purchaseOrderId,
                        AttachmentTypeId = Convert.ToInt32(AttachmentType.ExpensePurchaseOrder) //static value need to change

                    }, commandType: CommandType.StoredProcedure);

                    purchaseOrderDetailsObj.Attachments = attachments.ToList();
                    this.sharedRepository = new SharedRepository();
                    DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.ExpensesPo, purchaseOrderDetailsObj.ExpensesPurchaseOrderId, purchaseOrderDetailsObj.CompanyId);
                    purchaseOrderDetailsObj.SupplierAddress = address == null ? string.Empty : address.Address;
                    //if (purchaseOrderDetailsObj.CreatedDate != null && purchaseOrderDetailsObj.NoOfDays > 0)
                    //{
                    //    purchaseOrderDetailsObj.ExpectedDeliveryDate = purchaseOrderDetailsObj.CreatedDate.AddDays(purchaseOrderDetailsObj.NoOfDays);
                    //}
                }
                return purchaseOrderDetailsObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ExpensesPurchaseOrderDisplayResult GetExpensesPurchaseOrders(GridDisplayInput purchaseOrderInput)
        {
            throw new NotImplementedException();
        }

        public int UpdateExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrder)
        {
            try
            {
                string check = null;

                ExpensesPurchaseOrder poItem = GetExpensesPurchaseOrderDetails(purchaseOrder.ExpensesPurchaseOrderId.ToString(),0, purchaseOrder.CompanyId);
                purchaseOrder.CurrentWorkFlowStatusId = poItem.WorkFlowStatusId;

                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", new
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
                            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrder.CostOfServiceId,
                            POTypeId = purchaseOrder.POTypeId,
                            CurrencyId = purchaseOrder.CurrencyId,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            Instructions = purchaseOrder.Instructions,
                            Justifications = purchaseOrder.Justifications,
                            ExpensesPurchaseOrderId = purchaseOrder.ExpensesPurchaseOrderId,
                            IsGstRequired = purchaseOrder.IsGstRequired,
                            PaymentTermId = purchaseOrder.PaymentTermId,
                            DeliveryTermId = purchaseOrder.DeliveryTermId,
                            Reasons = purchaseOrder.Reasons,
                            DeliveryAddress = purchaseOrder.DeliveryAddress,
                            IsGstBeforeDiscount = purchaseOrder.IsGstBeforeDiscount,
                            VendorReferences = purchaseOrder.VendorReferences,
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
                        if (purchaseOrder.EXPOQuotationItem != null)
                        {
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            int count = 0;
                            foreach (var record in purchaseOrder.EXPOQuotationItem.Where(j => j.QuotationId == 0).Select(j => j))
                            {
                                int QuotationId = transactionObj.Connection.QueryFirstOrDefault<int>("ExpensePurchaserOrderCreation_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    //SupplierId = record.Supplier.SupplierId,
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    ExpensesPurchaseOrderId = purchaseOrder.ExpensesPurchaseOrderId,
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
                                    PurchaseOrderId = purchaseOrder.ExpensesPurchaseOrderId,
                                    POTypeId = PurchaseOrderType.ExpensePo
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
                                        //if (purchaseOrder.files[i].FileName.Contains("EXPOFiles@" + count))
                                        //{
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filname = name[2];
                                            var itemObj = new DynamicParameters();
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@PurchaseOrderId", purchaseOrder.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
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
                        if (purchaseOrder.EXPOQuotationItem != null)
                        {
                            int add = 0;
                            int count = 0;
                            List<DynamicParameters> quotationItemToUpdate = new List<DynamicParameters>();
                            foreach (var record in purchaseOrder.EXPOQuotationItem.Where(k => k.QuotationId > 0).Select(k => k))
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
                                int updatequotationResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", new
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
                                        //if (purchaseOrder.files[i].FileName.Contains("EXPOFiles@" + count))
                                        //{
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filename = name[2];
                                            var itemObj1 = new DynamicParameters();
                                            itemObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj1.Add("@PurchaseOrderId", purchaseOrder.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
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
                        foreach (var record in purchaseOrder.PurchaseOrderItems.Where(i => i.ExpensesPOItemId == 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ExpensesPurchaseOrderId", purchaseOrder.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            //if (record.Expense.ExpensesMasterId > 0)
                            //{
                            //    itemObj.Add("@ExpensesMasterId", record.Expense.ExpensesMasterId, DbType.Int32, ParameterDirection.Input);
                            //}
                            //itemObj.Add("@ServiceText", record.Expense.ExpensesMasterId == 0 ? record.Expense.ExpensesDetail : "", DbType.String, ParameterDirection.Input);

                            if (record.Expense.AccountCodeId > 0)
                            {
                                itemObj.Add("@ExpensesMasterId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            }

                            itemObj.Add("@ServiceText", record.Expense.AccountCodeId == 0 ? record.Expense.Description : "", DbType.String, ParameterDirection.Input);

                            itemObj.Add("@ExpensesDescription", record.ExpensesDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ExpensesQty", record.ExpensesQty, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            if (record.TaxID > 0)
                            {
                                itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            }

                            itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }


                        var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);


                        #endregion

                        #region updating purchase order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.PurchaseOrderItems.Where(i => i.ExpensesPOItemId > 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ExpensesPOItemId", record.ExpensesPOItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            //if (record.Expense.ExpensesMasterId > 0)
                            //{
                            //    itemObj.Add("@ExpensesMasterId", record.Expense.ExpensesMasterId, DbType.Int32, ParameterDirection.Input);
                            //}
                            //itemObj.Add("@ServiceText", record.Expense.ExpensesMasterId == 0 ? record.Expense.ExpensesDetail : "", DbType.String, ParameterDirection.Input);

                            if (record.Expense.AccountCodeId > 0)
                            {
                                itemObj.Add("@ExpensesMasterId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            }
                            itemObj.Add("@ServiceText", record.Expense.AccountCodeId == 0 ? record.Expense.Description : "", DbType.String, ParameterDirection.Input);

                            itemObj.Add("@ExpensesDescription", record.ExpensesDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ExpensesQty", record.ExpensesQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            if (record.TaxID > 0)
                            {
                                itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            }
                            itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToUpdate.Add(itemObj);
                        }


                        var purchaseOrderItemUpdateResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", itemsToUpdate,
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
                                itemObj.Add("@ExpensesPOItemId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToUpdate.Add(itemObj);
                            }
                        }

                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", itemsToUpdate,
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
                            fileObj.Add("@RecordId", purchaseOrder.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", purchaseOrder.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var purchaseOrderFileDeleteResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);
                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                                FilesNames = purchaseOrder.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = purchaseOrder.ExpensesPurchaseOrderId.ToString()
                            });
                        }

                        #endregion

                        #region deleting quotation items...

                        List<DynamicParameters> itemsToDelete2 = new List<DynamicParameters>();

                        if (purchaseOrder.EXPOQuotationItemToDelete != null)
                        {
                            foreach (var quotationId in purchaseOrder.EXPOQuotationItemToDelete)
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

                        var SPOItemDeleteResult = transactionObj.Connection.Execute("ExpensePurchaserOrderCreation_CRUD", itemsToDelete2,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion


                        #region deleting quotation attachments
                        if (purchaseOrder.EXPOQuotationAttachmentDelete != null)
                        {
                            for (var i = 0; i < purchaseOrder.EXPOQuotationAttachmentDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@SPOQuotationId", purchaseOrder.EXPOQuotationAttachmentDelete[i].SPOQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@QuotationId", purchaseOrder.EXPOQuotationAttachmentDelete[i].QuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrder.EXPOQuotationAttachmentDelete[i].RowId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@PurchaseOrderId", purchaseOrder.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                var spoquotationFileDeleteResult = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);

                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                                    FilesNames = spoquotationFileDeleteResult.ToArray(),
                                    UniqueId = purchaseOrder.ExpensesPurchaseOrderId.ToString()
                                });

                            }
                        }

                        #endregion

                        #region updating quotation attachments rowid
                        if (purchaseOrder.EXPOQuotationAttachmentUpdateRowId != null)
                        {
                            for (var i = 0; i < purchaseOrder.EXPOQuotationAttachmentUpdateRowId.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "UPDATEROW", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@SPOQuotationId", purchaseOrder.EXPOQuotationAttachmentUpdateRowId[i].SPOQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrder.EXPOQuotationAttachmentUpdateRowId[i].RowId, DbType.Int32, ParameterDirection.Input);
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
                                if (!purchaseOrder.files[i].FileName.Contains("EXPOFiles@"))
                                {
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ExpensePurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", purchaseOrder.ExpensesPurchaseOrderId, DbType.Int32, ParameterDirection.Input);
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
                                ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                                Files = purchaseOrder.files,
                                UniqueId = purchaseOrder.ExpensesPurchaseOrderId.ToString()
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
                            DocumentId = purchaseOrder.ExpensesPurchaseOrderId,
                            ProcessId = (int)WorkFlowProcessTypes.ExpensesPo
                        }, transactionObj);
                        #endregion
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            new SharedRepository().SendForApproval(new WorkFlowParameter
                            {
                                CompanyId = purchaseOrder.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo),
                                Value = Convert.ToString(purchaseOrder.TotalbefTaxSubTotal),
                                DocumentId = purchaseOrder.ExpensesPurchaseOrderId,
                                CreatedBy = purchaseOrder.CreatedBy,
                                DocumentCode = purchaseOrder.ExpensesPurchaseOrderCode,
                                ItemCategory = "",
                                ItemQuantity = "0",
                                WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                                LocationId = purchaseOrder.LocationId
                            }, false, transactionObj, transactionObj.Connection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(purchaseOrder.CreatedBy).UserName;
                        //if (string.IsNullOrEmpty(purchaseOrder.ExpensesPurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                        //{
                        if (poItem.TotalAmount != purchaseOrder.TotalAmount)
                        {
                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.ExpensesPurchaseOrderId.ToString(), "UpdatePurchaseOrder", "Purchase Order total recalculated, new total is " + string.Format(new CultureInfo("en-US"), "{0:C}", purchaseOrder.TotalAmount)  ,  purchaseOrder.CompanyId);
                        }
                            //}
                        //else
                        //{
                            //AuditLog.Info("ExpensePurchaseOrderCreation", "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.ExpensesPurchaseOrderId.ToString(), "UpdatePurchaseOrder", "Expense Purchase Order " + purchaseOrder.ExpensesPurchaseOrderCode+ " updated by " + UserName + "", purchaseOrder.CompanyId);
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

        public byte[] DownloadEXPOQuotationFile(EXPOQuotationAttachments eXPOQuotationAttachments)
        {
            try
            {
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadQuotationFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.ExpensePurchaseOrder,
                    FilesNames = new string[] { eXPOQuotationAttachments.FileName },
                    UniqueId = eXPOQuotationAttachments.PurchaseOrderId.ToString() + "\\" + eXPOQuotationAttachments.RowId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
       
    }
}

