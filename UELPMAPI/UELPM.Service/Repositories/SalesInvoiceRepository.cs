using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Web;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class SalesInvoiceRepository : ISalesInvoiceRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        static string SP_Name_SalesInvoice = "sp_Sales_Invoice_CRUD";
        static string SP_NAME_SALESINVOICE_EXPORT = "Sp_salesinvoice_export";
        AuditLogRepository auditLogRepository = null;
        SharedRepository sharedRepository = null;
        GenericRepository genericRepository = null;
        AdhocMasterRepository adhocMasterRepository = null;
        public SalesInvoiceRepository()
        {
            auditLogRepository = new AuditLogRepository();
            genericRepository = new GenericRepository();
            sharedRepository = new SharedRepository();
            adhocMasterRepository = new AdhocMasterRepository();
        }
        public IEnumerable<SalesInvoiceGrid> GetSalesInvoices(SalesInvoiceSearch search)
        {
            try
            {
                var result = this.m_dbconnection.Query<SalesInvoiceGrid>(SP_Name_SalesInvoice, new
                {
                    Action = "SELECT_ALL",
                    IsApprovalPage = search.IsApprovalPage,
                    UserId = search.UserId,
                    CompanyId = search.CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
                if (search.FetchFilterData && result.Count > 0)
                {
                    if (!StringOperations.IsNullOrEmpty(search.DocumentCode))
                    {
                        result = result.Where(x => x.DocumentCode.ToLower().IndexOf(search.DocumentCode.ToLower()) >= 0).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(search.CustomerName))
                    {
                        result = result.Where(x => x.CustomerName.ToLower().IndexOf(search.CustomerName.ToLower()) >= 0).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(search.CustomerId))
                    {
                        result = result.Where(x => x.CustomerId.ToLower().IndexOf(search.CustomerId.ToLower()) >= 0).ToList();
                    }
                }
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<SalesInvoiceGrid> GetOpenSalesInvoices(SalesInvoiceSearch search)
        {
            try
            {
                var result = this.m_dbconnection.Query<SalesInvoiceGrid>(SP_Name_SalesInvoice, new
                {
                    Action = "SELECT_ALL",
                    IsApprovalPage = search.IsApprovalPage,
                    UserId = search.UserId,
                    CompanyId = search.CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
                result = result.Where(x => x.WorkFlowStatus == "Open").ToList();
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public SalesInvoice GetSalesInvoice(int InvoiceId)
        {
            try
            {
                var lookupSC = new Dictionary<int, SalesInvoice>();
                var lookupSCA = new Dictionary<int, SalesInvoiceItem>();
                this.m_dbconnection.Query<SalesInvoice>(SP_Name_SalesInvoice, new[]
                {
                    typeof(SalesInvoice),
                    typeof(SalesInvoiceItem),
                    typeof(WorkFlowStatuses),
                    typeof(User),
                    typeof(User),
                    typeof(SalesCustomerGrid),
                    typeof(AddressType),
                    typeof(CreditTerm),
                    typeof(Locations),
                    typeof(Location),
                    typeof(Currency),
                    typeof(SalesTaxGroup),
                    typeof(TaxMaster),
                    typeof(CustomerType),
                    typeof(Supplier),
                    typeof(BankMaster),
                    typeof(SchedulerNo)
                }
                , obj =>
                {
                    var sq = (SalesInvoice)obj[0];
                    var sqi = (SalesInvoiceItem)obj[1];
                    var w = (WorkFlowStatuses)obj[2];
                    var u = (User)obj[3];
                    var u2 = (User)obj[4];
                    var sc = (SalesCustomerGrid)obj[5];
                    var at = (AddressType)obj[6];
                    var ct = (CreditTerm)obj[7];
                    var l = (Locations)obj[8];
                    var lm = (Location)obj[9];
                    var cu = (Currency)obj[10];
                    var tg = (SalesTaxGroup)obj[11];
                    var tm = (TaxMaster)obj[12];
                    var cut = (CustomerType)obj[13];
                    var s = (Supplier)obj[14];
                    var b = (BankMaster)obj[15];
                    var sn = (SchedulerNo)obj[16];
                    SalesInvoice Invoice;
                    SalesInvoiceItem InvoiceItem;
                    if (!lookupSC.TryGetValue(sq.InvoiceId, out Invoice))
                    {
                        lookupSC.Add(sq.InvoiceId, Invoice = sq);
                        Invoice.Scheduler = sn;
                        Invoice.Bank = b;
                        Invoice.CreditTerm = ct;
                        Invoice.Location = lm;
                        Invoice.Currency = cu;
                        Invoice.CustomerType = cut;
                        Invoice.Department = l;
                        Invoice.TaxGroup = tg;
                        Invoice.TaxMaster = tm;
                        Invoice.WorkflowStatus = w;
                        Invoice.CreatedBy = u;
                        Invoice.CurrentApprover = u2;
                        Invoice.Customer = sc;
                        Invoice.AddressType = at;
                        Invoice.Supplier = s;
                    }
                    if (!lookupSCA.TryGetValue(sqi.LineItemId, out InvoiceItem))
                    {
                        lookupSCA.Add(sqi.LineItemId, InvoiceItem = sqi);
                        Invoice.LineItems.Add(sqi);
                    }
                    return Invoice;
                }, new
                {
                    Action = "SELECT_BY_ID",
                    DocumentId = InvoiceId
                }, commandType: CommandType.StoredProcedure,
                splitOn: "InvoiceId,LineItemId,WorkFlowStatusid,UserID,UserID,CustomerIPSId,AddressTypeId,CreditTermId,LocationId,LocationId,Id,TaxGroupId,TaxGroupId,CustomerTypeId,SupplierId,BankMasterId,SchedulerNoId").AsQueryable();
                var response = lookupSC.Values.FirstOrDefault();
                response.ButtonPreferences = Util.ButtonPreference.ButtonStatus.SetStatus(response.WorkflowStatus.WorkFlowStatusid);
                DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.SalesInvoice, InvoiceId, response.CompanyId);
                response.Address = address == null ? string.Empty : address.Address;
                response.CustomerData = new CustomerRepository().GetCustomer(response.Customer.CustomerIPSId);
                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = InvoiceId,
                    AttachmentTypeId = Convert.ToInt32(AttachmentType.SalesInvoice)
                }, commandType: CommandType.StoredProcedure);
                response.Attachments = attachments.ToList();
                if (InvoiceId > 0 && response != null)
                {
                    response.WorkFlowComments = new List<WorkflowAuditTrail>();
                    response.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = InvoiceId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SalesInvoice),
                        DocumentUserId = response.CreatedBy.UserID,
                        UserId = Convert.ToInt32(response.CreatedBy.UserID)
                    }).ToList();
                    if (response.WorkFlowComments != null)
                    {
                        if (response.WorkflowStatus.WorkFlowStatusid == Convert.ToInt32(WorkFlowStatus.CancelDraft))
                        {
                            response.Reason = response.WorkFlowComments.FirstOrDefault().Remarks;
                        }
                        else if (response.WorkflowStatus.WorkFlowStatusid == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            response.Reason = response.WorkFlowComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                        }
                    }
                }
                return response;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostSalesInvoice(SalesInvoice salesInvoice)
        {
            int _InvoiceId = salesInvoice.InvoiceId;
            SalesInvoice _old = _InvoiceId == 0 ? new SalesInvoice() : this.GetSalesInvoice(_InvoiceId);
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (_InvoiceId == 0)
                    {
                        salesInvoice.DraftCode = string.Concat(ConfigurationManager.AppSettings["DraftCode"].ToString(), ModuleCodes.SalesInvoice);
                    }
                    if (((string.IsNullOrEmpty(salesInvoice.DocumentCode) || salesInvoice.DocumentCode.IndexOf("D") == 0) && salesInvoice.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.SendForApproval) ||
                        _InvoiceId == 0 && salesInvoice.QuotationId > 0)
                    {
                        var _documentData = new ProjectDocument
                        {
                            CompanyId = salesInvoice.CompanyId,
                            DraftCode = salesInvoice.DraftCode,
                            DocumentCode = ModuleCodes.SalesInvoice,
                            DocumentTypeId = (int)WorkFlowProcessTypes.SalesInvoice
                        };
                        salesInvoice.DocumentCode = genericRepository.GenerateDocumentCode(_documentData, transactionObj, m_dbconnection);
                    }
                    //else if (salesCustomer.CustomerIPSId == 0 && salesCustomer.MasterCustomerIPSId > 0)
                    //{
                    //    salesCustomer.CustomerIPSId = this.ReverifyCustomer(salesCustomer, transactionObj);
                    //}
                    salesInvoice.InvoiceId = this.PostSalesInvoice(salesInvoice, transactionObj);
                    PostSalesInvoiceItems(salesInvoice, transactionObj);
                    #region Save Document Address Details.
                    this.sharedRepository = new SharedRepository();
                    this.sharedRepository.PostDocumentAddress(new DocumentAddress
                    {
                        Address = salesInvoice.Address,
                        CompanyId = salesInvoice.CompanyId,
                        DocumentId = salesInvoice.InvoiceId,
                        ProcessId = (int)WorkFlowProcessTypes.SalesInvoice
                    }, transactionObj);
                    #endregion
                    SaveFiles(salesInvoice, transactionObj);
                    if (_InvoiceId == 0)
                    {
                        genericRepository.InsertDocumentWFStatus(new WorkFlowParameter
                        {
                            DocumentId = salesInvoice.InvoiceId,
                            ProcessId = (int)WorkFlowProcessTypes.SalesInvoice,
                            WorkFlowStatusId = salesInvoice.WorkflowStatus.WorkFlowStatusid
                        }, m_dbconnection, transactionObj);
                        if (salesInvoice.QuotationId > 0)
                        {
                            UserProfile user = new UserProfileRepository().GetUserById(salesInvoice.CreatedBy.UserID);
                            string Invoiceuser = string.Format("{0} {1}", user.FirstName, user.LastName);
                            auditLogRepository.PostAuditLog(new AuditLogData
                            {
                                DocumentId = salesInvoice.InvoiceId,
                                PageName = WorkFlowProcessTypes.SalesInvoice.ToString(),
                                Message = string.Format("Invoice created from quotation ({0}) by {1} on {2}", salesInvoice.QuotationCode, Invoiceuser, DateTime.Now),
                                Action = "SAVE",
                                CompanyId = salesInvoice.CompanyId,
                            }, transactionObj, m_dbconnection);
                        }
                        else
                        {
                            auditLogRepository.LogSaveDocument(new AuditLogData
                            {
                                DocumentId = salesInvoice.InvoiceId,
                                PageName = WorkFlowProcessTypes.SalesInvoice.ToString(),
                                Logger = salesInvoice.CreatedBy.UserID,
                                Action = "SAVE",
                                CompanyId = salesInvoice.CompanyId,
                            }, transactionObj, m_dbconnection);
                        }
                    }
                    WorkFlowParameter workFlowParameter = new WorkFlowParameter
                    {
                        CompanyId = salesInvoice.CompanyId,
                        DocumentCode = salesInvoice.DocumentCode,
                        DocumentId = salesInvoice.InvoiceId,
                        ProcessId = (int)WorkFlowProcessTypes.SalesInvoice,
                        Value = salesInvoice.TotalBeforeTax.ToString(),
                        LocationId = salesInvoice.Department.LocationID,
                        UserID = salesInvoice.CreatedBy.UserID,
                        WorkFlowStatusId = (int)WorkFlowStatus.ApprovalInProgress
                    };
                    if (salesInvoice.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.SendForApproval)
                    {
                        genericRepository.SendDocument(workFlowParameter, transactionObj, m_dbconnection);
                    }
                    if (salesInvoice.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.ApprovalInProgress)
                    {
                        genericRepository.ModifyWorkflow(workFlowParameter, transactionObj, m_dbconnection);
                    }
                    if (_InvoiceId > 0 && salesInvoice.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Open)
                    {
                        auditLogRepository.LogVerifyDocument(_old, salesInvoice, new WorkFlowApproval
                        {
                            DocumentId = salesInvoice.InvoiceId,
                            ProcessId = (int)WorkFlowProcessTypes.SalesInvoice,
                            UserId = salesInvoice.UpdatedBy.UserID,
                            CompanyId = salesInvoice.CompanyId
                        }, transactionObj, m_dbconnection);
                    }
                    transactionObj.Commit();
                    return salesInvoice.InvoiceId;
                }
                catch (Exception e)
                {
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }
        private void SaveFiles(SalesInvoice salesInvoice, IDbTransaction transactionObj)
        {
            FileSave fileSave = new FileSave
            {
                CompanyName = "UEL",
                ModuleName = AttachmentFolderNames.SalesInvoice,
                Files = salesInvoice.files,
                UniqueId = Convert.ToString(salesInvoice.InvoiceId),
                UploadUser = salesInvoice.CreatedBy
            };
            this.sharedRepository.UploadAttachments(fileSave, this.m_dbconnection, transactionObj);
        }
        private int PostSalesInvoice(SalesInvoice salesInvoice, IDbTransaction transactionObj)
        {
            return this.m_dbconnection.Query<int>(SP_Name_SalesInvoice, new
            {
                Action = salesInvoice.InvoiceId == 0 ? "INSERT_SALES_INVOICE" : "UPDATE_SALES_INVOICE",
                DocumentId = salesInvoice.InvoiceId,
                CompanyId = salesInvoice.CompanyId,
                QuotationId = salesInvoice.QuotationId,
                CustomerTypeId = salesInvoice.CustomerType.CustomerTypeId,
                DraftCode = salesInvoice.DraftCode,
                DocumentCode = string.IsNullOrEmpty(salesInvoice.DocumentCode) ? null : salesInvoice.DocumentCode,
                CustomerIPSId = salesInvoice.Customer.CustomerIPSId,
                DepartmentId = salesInvoice.Department.LocationID,
                LocationId = salesInvoice.Location == null ? (int?)null : salesInvoice.Location.LocationId,
                UnitNo = salesInvoice.UnitNo,
                Reference = salesInvoice.Reference,
                Attention = salesInvoice.Attention,
                AddressTypeId = salesInvoice.AddressType.AddressTypeId,
                CustomerEmail = salesInvoice.CustomerEmail,
                Subject = salesInvoice.Subject,
                ProjectName = salesInvoice.ProjectName,
                CreditTermId = salesInvoice.CreditTerm.CreditTermId,
                CurrencyId = salesInvoice.Currency.Id,
                Remarks = salesInvoice.Remarks,
                TaxGroupId = salesInvoice.TaxGroup != null ? salesInvoice.TaxGroup.TaxGroupId : (int?)null,
                //TaxTypeId = salesInvoice.TaxType != null ? salesInvoice.TaxType.TaxTypeId : (int?)null,
                BankId = salesInvoice.Bank.BankMasterId,
                SchedulerId = salesInvoice.Scheduler == null ? 0 : salesInvoice.Scheduler.SchedulerNoId,
                InvoiceDetail = salesInvoice.InvoiceDetail,
                CustomerRefNo = salesInvoice.CustomerRefNo,
                CustomerAcceptanceDate = salesInvoice.CustomerAcceptanceDate,
                PurchaseIncurred = salesInvoice.PurchaseIncurred,
                SupplierId = salesInvoice.Supplier == null ? 0 : salesInvoice.Supplier.SupplierId,
                PoRef = salesInvoice.POCode,
                JobSheetNo = salesInvoice.JobSheetNo,
                JobSheetStatus = salesInvoice.JobSheetStatus,
                JobSheetDescription = salesInvoice.JobSheetDescription,
                JobCompletedDate = salesInvoice.JobCompletedDate,
                TotalLineAmount = salesInvoice.TotalLineAmount,
                Discount = salesInvoice.Discount,
                TotalBeforeTax = salesInvoice.TotalBeforeTax,
                TaxAmount = salesInvoice.TaxAmount,
                SubTotal = salesInvoice.SubTotal,
                TaxAdjustment = salesInvoice.TaxAdjustment,
                NetTotal = salesInvoice.NetTotal,
                TotalAdjustment = salesInvoice.TotalAdjustment,
                Total = salesInvoice.Total,
                WorkFlowStatusId = salesInvoice.WorkflowStatus.WorkFlowStatusid,
                UserId = salesInvoice.InvoiceId == 0 ? salesInvoice.CreatedBy.UserID : salesInvoice.UpdatedBy.UserID
            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
        }
        private void PostSalesInvoiceItems(SalesInvoice salesInvoice, IDbTransaction transactionObj)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var item in salesInvoice.LineItems)
            {
                var param = new DynamicParameters();
                param.Add("@Action", item.LineItemId == 0 ? "INSERT_INVOICE_ITEMS" : "UPDATE_INVOICE_ITEMS", DbType.String, ParameterDirection.Input);
                param.Add("@LineItemId", item.LineItemId, DbType.Int32, ParameterDirection.Input);
                param.Add("@DocumentId", salesInvoice.InvoiceId, DbType.Int32, ParameterDirection.Input);
                param.Add("@AccountTypeId", item.AccountTypeId, DbType.Int32, ParameterDirection.Input);
                param.Add("@SubCategoryId", item.SubCategoryId, DbType.Int32, ParameterDirection.Input);
                param.Add("@AccountCodeId", item.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                param.Add("@Description", item.Description, DbType.String, ParameterDirection.Input);
                param.Add("@Qty", item.Qty, DbType.Decimal, ParameterDirection.Input);
                param.Add("@UOMId", item.UOMId, DbType.Int32, ParameterDirection.Input);
                param.Add("@UnitPrice", item.UnitPrice, DbType.Decimal, ParameterDirection.Input);
                param.Add("@TotalBeforeDiscount", item.TotalBeforeDiscount, DbType.Decimal, ParameterDirection.Input);
                param.Add("@Discount", item.Discount, DbType.Decimal, ParameterDirection.Input);
                param.Add("@TotalBeforeTax", item.TotalBeforeTax, DbType.Decimal, ParameterDirection.Input);
                param.Add("@TaxTypeId", item.TaxTypeId, DbType.Int32, ParameterDirection.Input);
                param.Add("@TaxAmount", item.TaxAmount, DbType.Decimal, ParameterDirection.Input);
                param.Add("@TotalAfterTax", item.TotalAfterTax, DbType.Decimal, ParameterDirection.Input);
                itemToAdd.Add(param);
            }
            this.m_dbconnection.Execute(SP_Name_SalesInvoice, itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
        }
        public SalesInvoiceMailData GetInvoiceEmailData(int documentId, IDbConnection connection, IDbTransaction transaction)
        {
            try
            {
                var lookupSC = new Dictionary<int, SalesInvoiceMailData>();
                connection.Query<SalesInvoiceMailData>(SP_Name_SalesInvoice, new[]
                {
                    typeof(SalesInvoiceMailData),
                    typeof(WorkFlowStatuses)
                }
                , obj =>
                {
                    var sq = (SalesInvoiceMailData)obj[0];
                    var w = (WorkFlowStatuses)obj[1];
                    SalesInvoiceMailData Invoice;
                    if (!lookupSC.TryGetValue(sq.InvoiceId, out Invoice))
                    {
                        lookupSC.Add(sq.InvoiceId, Invoice = sq);
                        Invoice.WorkflowStatus = w;
                    }
                    return Invoice;
                }, new
                {
                    Action = "GET_EMAIL_DATA",
                    DocumentId = documentId
                }, transaction: transaction, commandType: CommandType.StoredProcedure,
                splitOn: "InvoiceId,WorkflowStatusId").AsQueryable();
                return lookupSC.Values.FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public IEnumerable<SalesInvoiceGrid> GetInvoicesSearch(SalesInvoiceSearch search)
        {
            try
            {
                var result = this.m_dbconnection.Query<SalesInvoiceGrid>(SP_Name_SalesInvoice, new
                {
                    Action = "Invoice_SEARCH",
                    SearchTerm = search.SearchTerm,
                    CustomerIPSId = search.CustomerIPSId,
                    CompanyId = search.CompanyId
                }, commandType: CommandType.StoredProcedure).ToList();
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public PDFData GetPDFData(ProjectDocument document)
        {
            PDFData data = null;
            SalesInvoice invoice = this.GetSalesInvoice(document.DocumentId);
            if (invoice != null)
            {
                string Total = $"{((decimal)invoice.Total).ToString("#,##0.00", CultureInfo.InvariantCulture)}";
                data = new PDFData
                {
                    CreatedBy = invoice.CreatedBy.UserID,
                    DynamicProp1 = invoice.Attention,
                    CreditTerm = invoice.CreditTerm.NoOfDays.ToString(),
                    SupplierName = invoice.Customer.CustomerName,
                    DynamicProp2 = invoice.Customer.CustomerId,
                    DynamicProp3 = invoice.InvoiceDetail,
                    DynamicProp4 = invoice.CustomerEmail,
                    DynamicProp5 = invoice.Bank.BankName,
                    DynamicProp6 = invoice.Bank.BankCode,
                    DynamicProp7 = invoice.Bank.BranchCode,
                    DynamicProp8 = invoice.Bank.SwiftCode,
                    DynamicProp9 = invoice.Bank.BankACNo,
                    DynamicProp10 = invoice.Bank.Misc1Information,
                    DynamicProp11 = invoice.Bank.Misc2Information,
                    DynamicProp12 = HttpContext.Current.Server.MapPath(string.Concat("~/", invoice.Bank.ImageSource)),
                    DynamicProp15 = invoice.TaxMaster.TaxName,
                    DynamicProp16 = invoice.TaxGroup.TaxGroupName,
                    SupplierAddress = invoice.Address,
                    DocumentCode = invoice.QuotationCode,
                    InvoiceCode = invoice.DocumentCode,
                    POCode = invoice.CustomerRefNo,
                    Requestor = invoice.CreatedBy.UserName,
                    TemplateFileName = WorkFlowProcessTypes.SalesInvoice.ToString(),
                    CreatedDate = (invoice.CreatedDate) == null ? "" : (invoice.CreatedDate).ToString("dd-MM-yyyy"),
                    ProcessId = (int)WorkFlowProcessTypes.SalesInvoice,
                    DocumentStatus = invoice.WorkflowStatus.Statustext,
                    TotalBeforeDiscount = $"{((decimal)invoice.SubTotal).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Discount = $"{((decimal)invoice.Discount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TotalBeforeTax = $"{((decimal)invoice.TotalBeforeTax).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxValue = $"{((decimal)invoice.TaxAmount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxPercentage = $"{(invoice.LineItems.FirstOrDefault().TaxPercentage)}",
                    TaxAdjustment = $"{((decimal)invoice.TaxAdjustment).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    NetTotal = $"{((decimal)invoice.NetTotal).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TotalAdjustment = $"{((decimal)invoice.TotalAdjustment).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Total = Total,
                    Company = this.sharedRepository.GetCompanyDetails(invoice.CompanyId),
                    PDFTitle = "TAX INVOICE",
                    Currency = invoice.Currency.Symbol,
                };
                data.DynamicProp13 = data.Company.CompanyName.ToUpper();
                data.Company.CompanyName = data.Company.CompanyName.ToUpper();
                data.DynamicProp14 = data.Company.Fax;
                //data.LinkCssClass = (type == 5 || type == 6) ? "hidecontent" : "";
                int sno = 1;
                foreach (var item in invoice.LineItems)
                {
                    data.ItemDetails.Add(new LineItem
                    {
                        SNo = sno,
                        Item = item.Code,
                        Description = item.Description,
                        UOM = item.UOM,
                        Quantity = $"{item.Qty.ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                        UnitPrice = $"{item.UnitPrice.ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                        Total = $"{item.TotalAfterTax.ToString("#,##0.00", CultureInfo.InvariantCulture)}"
                    });
                    sno++;
                }
            }
            return data;
        }

        public SalesExportData ExportSIDocument(string documentId, int userId)
        {
            SalesExportData documentExportData = new SalesExportData();
            try
            {
                documentExportData.Invoices = this.m_dbconnection.Query<dynamic>(SP_NAME_SALESINVOICE_EXPORT, new
                {
                    Action = "INVOICES",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                documentExportData.InvoiceDetails = this.m_dbconnection.Query<dynamic>(SP_NAME_SALESINVOICE_EXPORT, new
                {
                    Action = "INVOICE_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                documentExportData.InvoicePaymentScheduleSections = this.m_dbconnection.Query<dynamic>(SP_NAME_SALESINVOICE_EXPORT, new
                {
                    Action = "INVOICE_PAYMENT_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                documentExportData.InvoiceOptinalFieldsSections = this.m_dbconnection.Query<dynamic>(SP_NAME_SALESINVOICE_EXPORT, new
                {
                    Action = "INVOICE_OPTIONAL_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                documentExportData.InvoiceDetailsOptinalFieldsSections = this.m_dbconnection.Query<dynamic>(SP_NAME_SALESINVOICE_EXPORT, new
                {
                    Action = "INVOICE_DETAILS_OPTIONAL_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                if (documentExportData.Invoices.Count > 0)
                {
                    string[] documentIds = documentId.Split(',');
                    foreach (var item in documentIds)
                    {
                        genericRepository.UpdateDocumentStatus(new WorkFlowApproval
                        {
                            ProcessId = (int)WorkFlowProcessTypes.SalesInvoice,
                            CompanyId = 0,
                            DocumentId = Convert.ToInt32(item),
                            WorkFlowStatusId = (int)WorkFlowStatus.Exported,
                            UserId = userId
                        });
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return documentExportData;
        }
    }
}
