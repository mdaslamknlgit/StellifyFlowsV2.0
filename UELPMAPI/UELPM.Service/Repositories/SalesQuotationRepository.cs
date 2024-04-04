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
using UELPM.Util.PdfGenerator;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class SalesQuotationRepository : ISalesQuotationRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        static string SP_Name_SalesQuotation = "sp_Sales_Quotation_CRUD";
        AuditLogRepository auditLogRepository = null;
        SharedRepository sharedRepository = null;
        GenericRepository genericRepository = null;
        AdhocMasterRepository adhocMasterRepository = null;
        public SalesQuotationRepository()
        {
            auditLogRepository = new AuditLogRepository();
            genericRepository = new GenericRepository();
            sharedRepository = new SharedRepository();
            adhocMasterRepository = new AdhocMasterRepository();
        }
        public IEnumerable<SalesQuotationGrid> GetSalesQuotations(SalesQuotationSearch search)
        {
            try
            {
                var result = this.m_dbconnection.Query<SalesQuotationGrid>(SP_Name_SalesQuotation, new
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
        public SalesQuotation GetSalesQuotation(int quotationId)
        {
            try
            {
                var lookupSC = new Dictionary<int, SalesQuotation>();
                var lookupSCA = new Dictionary<int, SalesQuotationItem>();
                var lookupSCB = new Dictionary<int, BillingInfo>();
                var lookupA = new Dictionary<int, Attachments>();
                this.m_dbconnection.Query<SalesQuotation>(SP_Name_SalesQuotation, new[]
                {
                    typeof(SalesQuotation),
                    typeof(SalesQuotationItem),
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
                    typeof(BillingInfo),
                    typeof(CreditTerm),
                    typeof(SalesInvoice),
                    typeof(Attachments),
                    typeof(BankMaster)
                }
                , obj =>
                {
                    var sq = (SalesQuotation)obj[0];
                    var sqi = (SalesQuotationItem)obj[1];
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
                    var bi = (BillingInfo)obj[15];
                    var ctb = (CreditTerm)obj[16];
                    var si = (SalesInvoice)obj[17];
                    var att = (Attachments)obj[18];
                    var b = (BankMaster)obj[19];
                    SalesQuotation quotation;
                    SalesQuotationItem quotationItem;
                    BillingInfo billingInfo;
                    Attachments invAttachments;
                    if (!lookupSC.TryGetValue(sq.QuotationId, out quotation))
                    {
                        lookupSC.Add(sq.QuotationId, quotation = sq);
                        quotation.Bank = b;
                        quotation.CreditTerm = ct;
                        quotation.Location = lm;
                        quotation.Currency = cu;
                        quotation.CustomerType = cut;
                        quotation.Department = l;
                        quotation.TaxGroup = tg;
                        quotation.TaxMaster = tm;
                        quotation.WorkflowStatus = w;
                        quotation.CreatedBy = u;
                        quotation.CurrentApprover = u2;
                        quotation.Customer = sc;
                        quotation.AddressType = at;
                        quotation.Supplier = s;
                    }
                    if (!lookupSCA.TryGetValue(sqi.LineItemId, out quotationItem))
                    {
                        lookupSCA.Add(sqi.LineItemId, quotationItem = sqi);
                        quotation.LineItems.Add(sqi);
                    }
                    if (bi != null)
                    {
                        if (!lookupSCB.TryGetValue(bi.BillingInfoId, out billingInfo))
                        {
                            bi.InvoiceDocument = si;
                            bi.CreditTerm = ctb;
                            lookupSCB.Add(bi.BillingInfoId, billingInfo = bi);
                            quotation.BillingInfos.Add(bi);
                        }
                        if (att != null && !lookupA.TryGetValue(att.AttachmentId, out invAttachments))
                        {
                            lookupA.Add(att.AttachmentId, invAttachments = att);
                            quotation.BillingInfos.FirstOrDefault().Attachments.Add(att);
                        }
                    }
                    return quotation;
                }, new
                {
                    Action = "SELECT_BY_ID",
                    DocumentId = quotationId
                }, commandType: CommandType.StoredProcedure,
                splitOn: "QuotationId,LineItemId,WorkFlowStatusid,UserID,UserID,CustomerIPSId,AddressTypeId,CreditTermId,LocationId,LocationId,Id,TaxGroupId,TaxGroupId,CustomerTypeId,SupplierId,DocumentId,CreditTermId,InvoiceId,AttachmentId,BankMasterId").AsQueryable();
                var response = lookupSC.Values.FirstOrDefault();
                response.ButtonPreferences = Util.ButtonPreference.ButtonStatus.SetStatus(response.WorkflowStatus.WorkFlowStatusid);
                DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.SalesQuotation, quotationId, response.CompanyId);
                response.Address = address == null ? string.Empty : address.Address;
                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = quotationId,
                    AttachmentTypeId = Convert.ToInt32(AttachmentType.SalesQuotation)
                }, commandType: CommandType.StoredProcedure);
                response.Attachments = attachments.ToList();
                response.CustomerData = new CustomerRepository().GetCustomer(response.Customer.CustomerIPSId);
                if (quotationId > 0 && response != null)
                {
                    response.WorkFlowComments = new List<WorkflowAuditTrail>();
                    response.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = quotationId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SalesQuotation),
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
                response.CanMarkForBilling = (response.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved);
                response.ShowMarkForBilling = (response.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved ||
                     response.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Invoiced);
                return response;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostSalesQuotation(SalesQuotation salesQuotation)
        {
            int _quotationId = salesQuotation.QuotationId;
            SalesQuotation _old = _quotationId == 0 ? new SalesQuotation() : this.GetSalesQuotation(_quotationId);
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    if (_quotationId == 0)
                    {
                        salesQuotation.DraftCode = string.Concat(ConfigurationManager.AppSettings["DraftCode"].ToString(), ModuleCodes.SalesQuotation);
                    }
                    if ((string.IsNullOrEmpty(salesQuotation.DocumentCode) || salesQuotation.DocumentCode.IndexOf("D") == 0) && salesQuotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.SendForApproval)
                    {
                        var _documentData = new ProjectDocument
                        {
                            CompanyId = salesQuotation.CompanyId,
                            DraftCode = salesQuotation.DraftCode,
                            DocumentCode = ModuleCodes.SalesQuotation,
                            DocumentTypeId = (int)WorkFlowProcessTypes.SalesQuotation
                        };
                        salesQuotation.DocumentCode = genericRepository.GenerateDocumentCode(_documentData, transactionObj, m_dbconnection);
                    }
                    //else if (salesCustomer.CustomerIPSId == 0 && salesCustomer.MasterCustomerIPSId > 0)
                    //{
                    //    salesCustomer.CustomerIPSId = this.ReverifyCustomer(salesCustomer, transactionObj);
                    //}
                    salesQuotation.QuotationId = this.PostSalesQuotation(salesQuotation, transactionObj);
                    PostSalesQuotationItems(salesQuotation, transactionObj);
                    #region Save Document Address Details.
                    this.sharedRepository = new SharedRepository();
                    this.sharedRepository.PostDocumentAddress(new DocumentAddress
                    {
                        Address = salesQuotation.Address,
                        CompanyId = salesQuotation.CompanyId,
                        DocumentId = salesQuotation.QuotationId,
                        ProcessId = (int)WorkFlowProcessTypes.SalesQuotation
                    }, transactionObj);
                    #endregion
                    if (salesQuotation.files != null)
                    {
                        SaveFiles(salesQuotation, transactionObj);
                    }
                    if (_quotationId == 0)
                    {
                        genericRepository.InsertDocumentWFStatus(new WorkFlowParameter
                        {
                            DocumentId = salesQuotation.QuotationId,
                            ProcessId = (int)WorkFlowProcessTypes.SalesQuotation,
                            WorkFlowStatusId = salesQuotation.WorkflowStatus.WorkFlowStatusid
                        }, m_dbconnection, transactionObj);
                        auditLogRepository.LogSaveDocument(new AuditLogData
                        {
                            DocumentId = salesQuotation.QuotationId,
                            PageName = WorkFlowProcessTypes.SalesQuotation.ToString(),
                            Logger = salesQuotation.CreatedBy.UserID,
                            Action = "SAVE",
                            CompanyId = salesQuotation.CompanyId,
                        }, transactionObj, m_dbconnection);
                    }
                    WorkFlowParameter workFlowParameter = new WorkFlowParameter
                    {
                        CompanyId = salesQuotation.CompanyId,
                        DocumentCode = salesQuotation.DocumentCode,
                        DocumentId = salesQuotation.QuotationId,
                        ProcessId = (int)WorkFlowProcessTypes.SalesQuotation,
                        Value = salesQuotation.TotalBeforeTax.ToString(),
                        LocationId = salesQuotation.Department.LocationID,
                        UserID = salesQuotation.CreatedBy.UserID,
                        WorkFlowStatusId = (int)WorkFlowStatus.ApprovalInProgress
                    };
                    if (salesQuotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.SendForApproval)
                    {
                        genericRepository.SendDocument(workFlowParameter, transactionObj, m_dbconnection);
                    }
                    if (salesQuotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.ApprovalInProgress)
                    {
                        genericRepository.ModifyWorkflow(workFlowParameter, transactionObj, m_dbconnection);
                    }
                    if (salesQuotation.WorkflowStatus.WorkFlowStatusid == (int)WorkFlowStatus.Approved)
                    {
                        auditLogRepository.LogVerifyDocument(_old, salesQuotation, new WorkFlowApproval
                        {
                            DocumentId = salesQuotation.QuotationId,
                            ProcessId = (int)WorkFlowProcessTypes.SalesQuotation,
                            UserId = salesQuotation.UpdatedBy.UserID,
                            CompanyId = salesQuotation.CompanyId
                        }, transactionObj, m_dbconnection);
                    }
                    transactionObj.Commit();
                    return salesQuotation.QuotationId;
                }
                catch (Exception e)
                {
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }
        public int PostSalesQuotationBillingInfo(SalesQuotation salesQuotation)
        {
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                    this.m_dbconnection.Execute(SP_Name_SalesQuotation, new
                    {
                        Action = "UPDATE_BILLING_SECTION",
                        DocumentId = salesQuotation.QuotationId,
                        MarkForBilling = salesQuotation.MarkForBilling,
                        BillingInstruction = salesQuotation.MarkForBilling ? salesQuotation.BillingInstruction : string.Empty,
                        FileDetails = salesQuotation.FileDetails,
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj);
                    if (salesQuotation.MarkForBilling)
                    {
                        foreach (var item in salesQuotation.BillingInfos)
                        {
                            var param = new DynamicParameters();
                            param.Add("@Action", item.BillingInfoId == 0 ? "INSERT_QUOTATION_BILLING_INFO" : "UPDATE_QUOTATION_BILLING_INFO", DbType.String, ParameterDirection.Input);
                            param.Add("@DocumentId", salesQuotation.QuotationId, DbType.Int32, ParameterDirection.Input);
                            param.Add("@ShortNarration", item.ShortNarration, DbType.String, ParameterDirection.Input);
                            param.Add("@PercentageToBill", item.PercentageToBill, DbType.Double, ParameterDirection.Input);
                            param.Add("@AmountToBill", item.AmountToBill, DbType.Double, ParameterDirection.Input);
                            param.Add("@ExpectedBillingDate", item.ExpectedBillingDate, DbType.Date, ParameterDirection.Input);
                            param.Add("@CreditTermId", item.CreditTerm.CreditTermId, DbType.Int32, ParameterDirection.Input);
                            param.Add("@InvoiceDocumentId", 0, DbType.Int32, ParameterDirection.Input);
                            itemToAdd.Add(param);
                            item.BillingInfoId = this.m_dbconnection.Query<int>(SP_Name_SalesQuotation, param, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();
                        }
                        UserProfile user = new UserProfileRepository().GetUserById(salesQuotation.UpdatedBy.UserID);
                        string billinguser = string.Format("{0} {1}", user.FirstName, user.LastName);
                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = salesQuotation.QuotationId,
                            PageName = WorkFlowProcessTypes.SalesQuotation.ToString(),
                            Logger = salesQuotation.UpdatedBy.UserID,
                            Action = "BILLING",
                            CompanyId = salesQuotation.CompanyId,
                            Message = string.Format("Quotation marked for billing by {0} on {1}", billinguser, DateTime.Now)
                        };
                        auditLogRepository.PostAuditLog(auditLogData, transactionObj, m_dbconnection);
                    }
                    else
                    {
                        genericRepository.UpdateDocumentWFStatus(new WorkFlowParameter
                        {
                            DocumentId = salesQuotation.QuotationId,
                            ProcessId = (int)WorkFlowProcessTypes.SalesQuotation,
                            WorkFlowStatusId = (int)WorkFlowStatus.Void
                        }, m_dbconnection, transactionObj);
                        AuditLogData auditLogData = new AuditLogData
                        {
                            DocumentId = salesQuotation.QuotationId,
                            PageName = WorkFlowProcessTypes.SalesQuotation.ToString(),
                            Logger = salesQuotation.UpdatedBy.UserID,
                            Action = "VOID",
                            CompanyId = salesQuotation.CompanyId,
                            Remarks = salesQuotation.Remarks
                        };
                        auditLogRepository._LogVoidDocument(auditLogData, transactionObj, m_dbconnection);
                    }
                    transactionObj.Commit();
                    return salesQuotation.QuotationId;
                }
                catch (Exception e)
                {
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }
        private void SaveFiles(SalesQuotation salesQuotation, IDbTransaction transactionObj)
        {
            FileSave fileSave = new FileSave
            {
                CompanyName = "UEL",
                ModuleName = AttachmentFolderNames.SalesQuotation,
                Files = salesQuotation.files,
                UniqueId = Convert.ToString(salesQuotation.QuotationId),
                UploadUser = salesQuotation.CreatedBy
            };
            this.sharedRepository.UploadAttachments(fileSave, this.m_dbconnection, transactionObj);
        }
        private int PostSalesQuotation(SalesQuotation salesQuotation, IDbTransaction transactionObj)
        {
            return this.m_dbconnection.Query<int>(SP_Name_SalesQuotation, new
            {
                Action = salesQuotation.QuotationId == 0 ? "INSERT_SALES_QUOTATION" : "UPDATE_SALES_QUOTATION",
                DocumentId = salesQuotation.QuotationId,
                CompanyId = salesQuotation.CompanyId,
                CustomerTypeId = salesQuotation.CustomerType.CustomerTypeId,
                DraftCode = salesQuotation.DraftCode,
                DocumentCode = string.IsNullOrEmpty(salesQuotation.DocumentCode) ? null : salesQuotation.DocumentCode,
                CustomerIPSId = salesQuotation.Customer.CustomerIPSId,
                DepartmentId = salesQuotation.Department.LocationID,
                LocationId = salesQuotation.Location == null ? (int?)null : salesQuotation.Location.LocationId,
                UnitNo = salesQuotation.UnitNo,
                Reference = salesQuotation.Reference,
                Attention = salesQuotation.Attention,
                AddressTypeId = salesQuotation.AddressType.AddressTypeId,
                CustomerEmail = salesQuotation.CustomerEmail,
                Subject = salesQuotation.Subject,
                ValidityDate = salesQuotation.ValidityDate,
                ProjectName = salesQuotation.ProjectName,
                CreditTermId = salesQuotation.CreditTerm.CreditTermId,
                CurrencyId = salesQuotation.Currency.Id,
                BankId = salesQuotation.Bank.BankMasterId,
                Remarks = salesQuotation.Remarks,
                TaxGroupId = salesQuotation.TaxGroup != null ? salesQuotation.TaxGroup.TaxGroupId : (int?)null,
                //TaxTypeId = salesQuotation.TaxType != null ? salesQuotation.TaxType.TaxTypeId : (int?)null,
                CustomerRefNo = salesQuotation.CustomerRefNo,
                CustomerAcceptanceDate = salesQuotation.CustomerAcceptanceDate,
                PurchaseIncurred = salesQuotation.PurchaseIncurred,
                SupplierId = salesQuotation.Supplier == null ? 0 : salesQuotation.Supplier.SupplierId,
                PoRef = salesQuotation.POCode,
                JobSheetNo = salesQuotation.JobSheetNo,
                JobSheetStatus = salesQuotation.JobSheetStatus,
                JobSheetDescription = salesQuotation.JobSheetDescription,
                JobCompletedDate = salesQuotation.JobCompletedDate,
                TotalLineAmount = salesQuotation.TotalLineAmount,
                Discount = salesQuotation.Discount,
                TotalBeforeTax = salesQuotation.TotalBeforeTax,
                TaxAmount = salesQuotation.TaxAmount,
                Total = salesQuotation.Total,
                MarkForBilling = salesQuotation.MarkForBilling,
                BillingInstruction = salesQuotation.BillingInstruction,
                FileDetails = salesQuotation.FileDetails,
                WorkFlowStatusId = salesQuotation.WorkflowStatus.WorkFlowStatusid,
                UserId = salesQuotation.QuotationId == 0 ? salesQuotation.CreatedBy.UserID : salesQuotation.UpdatedBy.UserID
            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
        }
        private void PostSalesQuotationItems(SalesQuotation salesQuotation, IDbTransaction transactionObj)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var item in salesQuotation.LineItems)
            {
                var param = new DynamicParameters();
                param.Add("@Action", item.LineItemId == 0 ? "INSERT_QUOTATION_ITEMS" : "UPDATE_QUOTATION_ITEMS", DbType.String, ParameterDirection.Input);
                param.Add("@LineItemId", item.LineItemId, DbType.Int32, ParameterDirection.Input);
                param.Add("@DocumentId", salesQuotation.QuotationId, DbType.Int32, ParameterDirection.Input);
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
            this.m_dbconnection.Execute(SP_Name_SalesQuotation, itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
        }
        public SalesQuotationMailData GetQuotationEmailData(int documentId, IDbConnection connection, IDbTransaction transaction)
        {
            try
            {
                var lookupSC = new Dictionary<int, SalesQuotationMailData>();
                connection.Query<SalesQuotationMailData>(SP_Name_SalesQuotation, new[]
                {
                    typeof(SalesQuotationMailData),
                    typeof(WorkFlowStatuses)
                }
                , obj =>
                {
                    var sq = (SalesQuotationMailData)obj[0];
                    var w = (WorkFlowStatuses)obj[1];
                    SalesQuotationMailData quotation;
                    if (!lookupSC.TryGetValue(sq.QuotationId, out quotation))
                    {
                        lookupSC.Add(sq.QuotationId, quotation = sq);
                        quotation.WorkflowStatus = w;
                    }
                    return quotation;
                }, new
                {
                    Action = "GET_EMAIL_DATA",
                    DocumentId = documentId
                }, transaction: transaction, commandType: CommandType.StoredProcedure,
                splitOn: "QuotationId,WorkflowStatusId").AsQueryable();
                return lookupSC.Values.FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public IEnumerable<SalesQuotationGrid> GetQuotationsSearch(SalesQuotationSearch search)
        {
            try
            {
                var result = this.m_dbconnection.Query<SalesQuotationGrid>(SP_Name_SalesQuotation, new
                {
                    Action = "QUOTATION_SEARCH",
                    SearchTerm = search.SearchTerm.Trim(),
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
        public bool UpdateSalesQuotationStatus(InvoiceLink invoiceLink)
        {
            bool statusUpdated = false;
            if (this.m_dbconnection.State == ConnectionState.Closed)
                this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    this.m_dbconnection.Query<int>(SP_Name_SalesQuotation, new
                    {
                        Action = "UPDATE_INVOICE_ID",
                        DocumentId = invoiceLink.QuotationId,
                        InvoiceDocumentId = invoiceLink.InvoiceId
                    }, transactionObj, commandType: CommandType.StoredProcedure);
                    genericRepository.UpdateDocumentWFStatus(new WorkFlowParameter
                    {
                        DocumentId = invoiceLink.QuotationId,
                        ProcessId = (int)WorkFlowProcessTypes.SalesQuotation,
                        WorkFlowStatusId = (int)WorkFlowStatus.Invoiced
                    }, m_dbconnection, transactionObj);

                    //string pageName = Enum.GetName(typeof(WorkFlowProcessTypes), (int)WorkFlowProcessTypes.SalesInvoice);
                    AuditLogData logData = new AuditLogData
                    {
                        DocumentId = invoiceLink.QuotationId,
                        PageName = WorkFlowProcessTypes.SalesQuotation.ToString(),
                        Action = "OPEN",
                        Logger = invoiceLink.UserId,
                        DocumentCode = "",
                        CompanyId = invoiceLink.CompanyId,
                        Message = "Sales Invoice by {1} on {2}. Status = Open"
                    };
                    auditLogRepository.UpdateLogInParentDocument(logData, transactionObj, m_dbconnection);
                    transactionObj.Commit();
                }
                catch (Exception)
                {
                    transactionObj.Rollback();
                }
            }
            return statusUpdated;
        }
        public PDFData GetPDFData(ProjectDocument document)
        {
            PDFData data = null;
            var quotation = this.GetSalesQuotation(document.DocumentId);
            if (quotation != null)
            {
                data = new PDFData
                {
                    CreatedBy = quotation.CreatedBy.UserID,
                    DynamicProp1 = quotation.Attention,
                    CreditTerm = quotation.CreditTerm.NoOfDays.ToString(),
                    SupplierName = quotation.Customer.CustomerName,
                    DynamicProp2 = quotation.Customer.CustomerId,
                    DynamicProp3 = (quotation.ValidityDate) == null ? "" : (quotation.ValidityDate).ToString("dd-MM-yyyy"),
                    DynamicProp4 = quotation.Subject,
                    DynamicProp5 = quotation.TaxMaster.TaxName,
                    DynamicProp6 = quotation.TaxGroup.TaxGroupName,
                    SupplierAddress = quotation.Address,
                    DocumentCode = quotation.DocumentCode,
                    Requestor = quotation.CreatedBy.UserName,
                    TemplateFileName = WorkFlowProcessTypes.SalesQuotation.ToString(),
                    CreatedDate = (quotation.CreatedDate) == null ? "" : (quotation.CreatedDate).ToString("dd-MM-yyyy"),
                    ProcessId = (int)WorkFlowProcessTypes.SalesQuotation,
                    Department = quotation.Department.Name,
                    //Reason = quotation.Remarks,
                    DocumentStatus = quotation.WorkflowStatus.Statustext,
                    TotalBeforeDiscount = $"{ ((decimal)quotation.TotalLineAmount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Discount = $"{ ((decimal)quotation.Discount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TotalBeforeTax = $"{  ((decimal)quotation.TotalBeforeTax).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxValue = $"{ ((decimal)quotation.TaxAmount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxPercentage = $"{ (quotation.LineItems.FirstOrDefault().TaxPercentage)}",
                    //TaxAdjustment = $"{ ((decimal)quotation.SubItemGSTAdjustment).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    //NetTotal = $"{ ((decimal)quotation.NetTotal).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    //TotalAdjustment = $"{ ((decimal)quotation.TotalAdjustment).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Total = $"{ ((decimal)quotation.Total).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Company = this.sharedRepository.GetCompanyDetails(quotation.CompanyId),
                    PDFTitle = "Quotation",
                    Currency = quotation.Currency.Symbol,
                };
                data.Company.CompanyName = data.Company.CompanyName.ToUpper();
                //int type = Convert.ToInt32(quotation.quotationLineItems.FirstOrDefault().POTypeId);
                //data.LinkCssClass = (type == 5 || type == 6) ? "hidecontent" : "";
                int sno = 1;
                foreach (var item in quotation.LineItems)
                {
                    data.ItemDetails.Add(new LineItem
                    {
                        SNo = sno,
                        Item = item.Code,
                        Description = item.Description,
                        UOM = item.UOM,
                        Quantity = $"{item.Qty.ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                        UnitPrice = $"{ item.UnitPrice.ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                        Total = $"{ item.TotalAfterTax.ToString("#,##0.00", CultureInfo.InvariantCulture)}"
                    });
                    sno++;
                }
            }
            return data;
        }
    }
}