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
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class CreditNoteRepository : ICreditNoteRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        AuditLogRepository auditLogRepository = null;
        SharedRepository sharedRepository = null;
        GenericRepository genericRepository = null;

        public CreditNoteRepository()
        {
            auditLogRepository = new AuditLogRepository();
            genericRepository = new GenericRepository();
            sharedRepository = new SharedRepository();
        }

        public List<CreditNoteData> GetCreditNotesList(GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = this.m_dbconnection.Query<CreditNoteData>("Credit_Note_CRUD", new
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
                    if (!StringOperations.IsNullOrEmpty(gridDisplayInput.DocumentCode))
                    {
                        result = result.Where(x => x.DocumentCode.ToLower().IndexOf(gridDisplayInput.DocumentCode.ToLower()) > -1).ToList();
                    }
                    if (!StringOperations.IsNullOrEmpty(gridDisplayInput.InvoiceCode))
                    {
                        result = result.Where(x => x.InvoiceDocumentCode.ToLower().IndexOf(gridDisplayInput.InvoiceCode.ToLower()) > -1).ToList();
                    }
                    //if (gridDisplayInput.ProjectMasterContractId > 0)
                    //{
                    //    result = result.Where(x => x.DocumentId == gridDisplayInput.DocumentId).ToList();
                    //}
                }
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<CreditNote> GetOriginalQTYPRICE(int InvoiceId)
        {
            try
            {
                List<CreditNote> creditNote = new List<CreditNote>();
                using (var result = this.m_dbconnection.QueryMultiple("Credit_Note_CRUD", new
                {
                    Action = "SelectOriginalsQTyPrice",
                    InvoiceId = InvoiceId
                }, commandType: CommandType.StoredProcedure))
                {
                    creditNote = result.Read<CreditNote>().ToList();
                }

                return creditNote;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public CreditNote GetCreditNoteEmailData(int CreditnoteId, IDbConnection connection, IDbTransaction transaction)
        {
            try
            {
                const string query = @"Credit_Note_CRUD";
                var lookup = new Dictionary<int, CreditNote>();
                CreditNote creditNote = new CreditNote();
                connection.Query<CreditNote, CreditNoteLineItems, CreditNote>(query, (c, p) =>
                {
                    if (!lookup.TryGetValue(c.CreditNoteId, out creditNote))
                    {
                        lookup.Add(c.CreditNoteId, creditNote = c);
                    }
                    if (creditNote.CreditNoteLineItems == null)
                        creditNote.CreditNoteLineItems = new List<CreditNoteLineItems>();
                    creditNote.CreditNoteLineItems.Add(p);
                    return creditNote;
                }, new
                {
                    Action = "SelectById",
                    CreditNoteId = CreditnoteId
                }, transaction, commandType: CommandType.StoredProcedure, splitOn: "CreditNoteId,CNDetailsId").AsQueryable();
                var resultList = lookup.Values.ToList();
                try
                {
                    connection.Query<CreditNote, GetItemMasters, CreditNote>(query, (c, g) =>
                    {
                        if (!lookup.TryGetValue(c.CreditNoteId, out creditNote))
                        {
                            lookup.Add(c.CreditNoteId, creditNote = c);
                        }
                        if (creditNote.GetItemMasters == null)
                            creditNote.GetItemMasters = new List<GetItemMasters>();
                        creditNote.GetItemMasters.Add(g);
                        return creditNote;
                    }, new
                    {
                        Action = "SelectById",
                        CreditNoteId = CreditnoteId
                    }, transaction, commandType: CommandType.StoredProcedure, splitOn: "CreditNoteId,ItemMasterId").AsQueryable();
                    var resultList2 = lookup.Values.ToList();
                }
                catch (Exception ex)
                {

                }
                try
                {
                    connection.Query<CreditNote, AccountCode, CreditNote>(query, (c, s) =>
                    {
                        if (!lookup.TryGetValue(c.CreditNoteId, out creditNote))
                        {
                            lookup.Add(c.CreditNoteId, creditNote = c);
                        }
                        if (creditNote.GetServiceMasters == null)
                            creditNote.GetServiceMasters = new List<AccountCode>();
                        creditNote.GetServiceMasters.Add(s);
                        return creditNote;
                    }, new
                    {
                        Action = "SelectById",
                        CreditNoteId = CreditnoteId
                    }, transaction, commandType: CommandType.StoredProcedure, splitOn: "CreditNoteId,AccountCodeId").AsQueryable();
                    var resultList3 = lookup.Values.ToList();
                }
                catch (Exception e)
                {

                }
                return creditNote;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public CreditNote GetCreditNotesById(int CreditnoteId)
        {
            try
            {
                const string query = @"Credit_Note_CRUD";
                var lookup = new Dictionary<int, CreditNote>();
                CreditNote creditNote = new CreditNote();
                this.m_dbconnection.Query<CreditNote, CreditNoteLineItems, CreditNote>(query, (c, p) =>
                {
                    if (!lookup.TryGetValue(c.CreditNoteId, out creditNote))
                    {
                        lookup.Add(c.CreditNoteId, creditNote = c);
                    }
                    if (creditNote.CreditNoteLineItems == null)
                        creditNote.CreditNoteLineItems = new List<CreditNoteLineItems>();
                    creditNote.CreditNoteLineItems.Add(p);
                    return creditNote;
                }, new
                {
                    Action = "SelectById",
                    CreditNoteId = CreditnoteId
                }, commandType: CommandType.StoredProcedure, splitOn: "CreditNoteId,CNDetailsId").AsQueryable();
                var resultList = lookup.Values.ToList();
                this.m_dbconnection.Query<CreditNote, GetItemMasters, CreditNote>(query, (c, g) =>
                {
                    if (!lookup.TryGetValue(c.CreditNoteId, out creditNote))
                    {
                        lookup.Add(c.CreditNoteId, creditNote = c);
                    }
                    if (creditNote.GetItemMasters == null)
                        creditNote.GetItemMasters = new List<GetItemMasters>();
                    creditNote.GetItemMasters.Add(g);
                    return creditNote;
                }, new
                {
                    Action = "SelectById",
                    CreditNoteId = CreditnoteId
                }, commandType: CommandType.StoredProcedure, splitOn: "CreditNoteId,ItemMasterId").AsQueryable();
                var resultList2 = lookup.Values.ToList();
                this.m_dbconnection.Query<CreditNote, AccountCode, CreditNote>(query, (c, s) =>
                {
                    if (!lookup.TryGetValue(c.CreditNoteId, out creditNote))
                    {
                        lookup.Add(c.CreditNoteId, creditNote = c);
                    }
                    if (creditNote.GetServiceMasters == null)
                        creditNote.GetServiceMasters = new List<AccountCode>();
                    creditNote.GetServiceMasters.Add(s);
                    return creditNote;
                }, new
                {
                    Action = "SelectById",
                    CreditNoteId = CreditnoteId
                }, commandType: CommandType.StoredProcedure, splitOn: "CreditNoteId,AccountCodeId").AsQueryable();
                var resultList3 = lookup.Values.ToList();

                if (CreditnoteId > 0 && creditNote != null)
                {
                    creditNote.WorkFlowComments = new List<WorkflowAuditTrail>();
                    creditNote.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = CreditnoteId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.CreditNote),
                        DocumentUserId = creditNote.CreatedBy,
                        UserId = Convert.ToInt32(creditNote.CreatedBy)
                    }).ToList();
                    if (creditNote.WorkFlowComments != null)
                    {
                        var cancelReasons = creditNote.WorkFlowComments.Where(x => x.Statusid == (int)WorkFlowStatus.CancelledApproval).ToList();
                        var wfComments = creditNote.WorkFlowComments.Where(x => x.Statusid != (int)WorkFlowStatus.CancelledApproval).ToList();
                        creditNote.ReasonsToCancel = cancelReasons.Select(x => x.Remarks).ToArray();
                        if (creditNote.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            creditNote.ReasonsToReject = wfComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                        }
                        if (creditNote.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Void))
                        {
                            creditNote.ReasonsToVoid = wfComments.Where(x => x.Statusid == (int)WorkFlowStatus.Void).FirstOrDefault().Remarks;
                        }
                    }
                }

                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = CreditnoteId,
                    AttachmentTypeId = Convert.ToInt32(AttachmentType.CreditNote) //static value need to change
                }, commandType: CommandType.StoredProcedure);
                creditNote.Attachments = attachments.ToList();
                this.sharedRepository = new SharedRepository();
                DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.CreditNote, creditNote.CreditNoteId, creditNote.CompanyId);
                creditNote.SupplierAddress = address == null ? string.Empty : address.Address;
                //if (creditNote.WorkFlowStatusId == (int)WorkFlowStatus.Completed)
                //{
                //    creditNote.CreditNoteLineItems = creditNote.CreditNoteLineItems.Where(x => x.ReturnQty > 0 || x.DecreaseInUnitPrice > 0).ToList();
                //}
                creditNote.ButtonPreferences = Util.ButtonPreference.ButtonStatus.SetStatus(creditNote.WorkFlowStatusId);
                return creditNote;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public PDFData GetPDFData(ProjectDocument document)
        {
            PDFData data = null;
            CreditNote creditNote = this.GetCreditNotesById(document.DocumentId);
            if (creditNote != null)
            {
                string Total = $"{ ((decimal)creditNote.CreditNoteTotal).ToString("#,##0.00", CultureInfo.InvariantCulture)}";
                data = new PDFData
                {
                    CreatedBy = creditNote.CreatedBy,
                    DocumentCode = creditNote.DocumentCode,
                    InvoiceCode = creditNote.InvoiceCode,
                    POCode = creditNote.POCode,
                    Requestor = creditNote.CreditNoteRequestor,
                    TemplateFileName = WorkFlowProcessTypes.CreditNote.ToString(),
                    CreatedDate = (creditNote.CreatedDate) == null ? "" : (creditNote.CreatedDate).ToString("dd-MM-yyyy"),
                    ProcessId = (int)WorkFlowProcessTypes.CreditNote,
                    CreditNoteType = creditNote.InvoiceId == 0 ? "Without Invoice" : "With Invoice",
                    Department = creditNote.Name,
                    Reason = creditNote.Reasons,
                    SupplierCode = creditNote.SupplierCode,
                    SupplierName = creditNote.SupplierName,
                    SupplierAddress = creditNote.SupplierAddress,
                    DocumentStatus = creditNote.WorkFlowStatus,
                    SupplierCreditNoteDate = (creditNote.SupplierCreditNoteDate) == null ? "" : ((DateTime)creditNote.SupplierCreditNoteDate).ToString("dd-MM-yyyy"),
                    SupplierCreditNoteNo = creditNote.SupplierCreditNoteNo,
                    SupplierInvoiceDate = (creditNote.SupplierCreditNoteInvoiceDate) == null ? "" : ((DateTime)creditNote.SupplierCreditNoteInvoiceDate).ToString("dd-MM-yyyy"),
                    SupplierInvoiceNo = creditNote.SupplierCreditNoteInvoiceNo,
                    TotalBeforeDiscount = $"{ ((decimal)creditNote.SubTotal).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Discount = (creditNote.Discount == null) ? "0.00" : $"{ ((decimal)creditNote.Discount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TotalBeforeTax = $"{ ((decimal)creditNote.SubTotal - ((creditNote.Discount == null) ? 0 : (decimal)creditNote.Discount)).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxValue = $"{ ((decimal)creditNote.TotalGSTAmount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxPercentage = $"{ (creditNote.CreditNoteLineItems.FirstOrDefault().TaxAmount).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TaxAdjustment = $"{ ((decimal)creditNote.SubItemGSTAdjustment).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    NetTotal = $"{ ((decimal)creditNote.NetTotal).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    TotalAdjustment = $"{ ((decimal)creditNote.TotalAdjustment).ToString("#,##0.00", CultureInfo.InvariantCulture)}",
                    Total = Total,
                    Company = this.sharedRepository.GetCompanyDetails(creditNote.CompanyId),
                    PDFTitle = "(AP) Credit Note",
                    AmountInWords = SharedRepository.changeToWords(Total, true),
                    Currency = creditNote.CurrencySymbol,
                };
                data.Header1 = "Open Qty";
                data.Header2 = "Decrease In Unit Price";
                int type = Convert.ToInt32(creditNote.CreditNoteLineItems.FirstOrDefault().POTypeId);
                data.LinkCssClass = (type == 5 || type == 6) ? "hidecontent" : "";
                int sno = 1;
                foreach (var item in creditNote.CreditNoteLineItems)
                {
                    decimal qty = (item.ReturnQty == 0) ? (Convert.ToDecimal(item.DecreaseInUnitPrice) == 0) ? 0 : item.ItemQty : item.ReturnQty;
                    decimal unitPrice = (Convert.ToDecimal(item.DecreaseInUnitPrice) == 0) ? (item.ReturnQty == 0) ? 0 : Convert.ToDecimal(item.Unitprice) : Convert.ToDecimal(item.DecreaseInUnitPrice);
                    //decimal total = (item.ReturnValue == null || item.ReturnValue == 0) ? Convert.ToDecimal(item.TotalbefTax) : Convert.ToDecimal(item.ReturnValue);
                    decimal total = (qty * unitPrice);
                    data.ItemDetails.Add(new LineItem
                    {
                        SNo = sno,
                        Item = item.GlDescription,
                        Description = item.ItemDescription,
                        Quantity = $"{qty.ToString("#,##0.0000", CultureInfo.InvariantCulture)}",
                        UnitPrice = $"{ unitPrice.ToString("#,##0.0000", CultureInfo.InvariantCulture)}",
                        Total = $"{ total.ToString("#,##0.0000", CultureInfo.InvariantCulture)}"
                    });
                    if (sno == 1 && item.DecreaseInUnitPrice == 0)
                    {
                        data.Header1 = "Return Qty";
                        data.Header2 = "Unit Price";
                    }
                    sno++;
                }
                data.LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            }
            return data;
        }

        public List<Invoice> GetInvoiceBySupplier(int supplierId, int companyid)
        {
            try
            {
                //executing the stored procedure to get the list of credit notes
                var result = this.m_dbconnection.Query<Invoice>("Credit_Note_CRUD", new
                {
                    Action = "SEARCH_INVOICE_BY_SUPPLIER",
                    SupplierId = supplierId,
                    CompanyId = companyid
                }, commandType: CommandType.StoredProcedure).ToList();

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int PostCreditNote(CreditNote creditNote)
        {
            int ReturnValue = 0;

            if (creditNote.CreditNoteId == 0)
            {
                ReturnValue = this.CreateCreditNote(creditNote);
            }
            else
            {
                ReturnValue = this.UpdateCreditNote(creditNote);
            }
            return ReturnValue;
        }

        public int CreateCreditNote(CreditNote creditNoteObj)
        {
            try
            {
                if (this.ValidateCNNo(creditNoteObj.SupplierCreditNoteNo, 0))
                {
                    string DraftCode = string.Empty;
                    this.m_dbconnection.Open();
                    using (var transactionObj = this.m_dbconnection.BeginTransaction())
                    {
                        try
                        {
                            #region purchase order creation...
                            var paramaterObj = new DynamicParameters();
                            DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                            if (creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.Completed || creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
                            {
                                var _documentData = new ProjectDocument
                                {
                                    CompanyId = creditNoteObj.CompanyId,
                                    DraftCode = DraftCode,
                                    DocumentCode = ModuleCodes.CreditNote,
                                    DocumentTypeId = (int)WorkFlowProcessTypes.CreditNote
                                };
                                creditNoteObj.CreditNoteCode = genericRepository.GenerateDocumentCode(_documentData, transactionObj, m_dbconnection);
                            }
                            creditNoteObj.CreditNoteId = this.m_dbconnection.QueryFirstOrDefault<int>("Credit_Note_CRUD", new
                            {
                                Action = "INSERT",
                                DraftCode = string.Concat(DraftCode, ModuleCodes.CreditNote),
                                DocumentCode = creditNoteObj.CreditNoteCode,
                                SupplierId = creditNoteObj.Supplier,
                                SubCodeId = creditNoteObj.SubCodeId,
                                CompanyId = creditNoteObj.CompanyId,
                                InvoiceId = creditNoteObj.InvoiceId,
                                Discount = creditNoteObj.Discount,
                                InvoiceCode = creditNoteObj.InvoiceCode,
                                Reasons = (creditNoteObj.Reasons == null ? string.Empty : creditNoteObj.Reasons),
                                SubTotal = creditNoteObj.SubTotal,
                                Total = creditNoteObj.Total,
                                WorkFlowStatusId = creditNoteObj.WorkFlowStatusId,
                                SupplierCreditNoteDate = creditNoteObj.SupplierCreditNoteDate,
                                SupplierCreditNoteNo = creditNoteObj.SupplierCreditNoteNo,
                                InvoiceOSAmount = creditNoteObj.InvoiceOSAmount,
                                InvoiceTotalAmount = creditNoteObj.InvoiceTotalAmount ?? 0,
                                LocationID = creditNoteObj.LocationID,
                                Adjustment = creditNoteObj.Adjustment == null ? 0 : creditNoteObj.Adjustment,
                                CreatedBy = creditNoteObj.CreatedBy,
                                CreatedDate = DateTime.Now,
                                SubItemGSTAdjustment = creditNoteObj.SubItemGSTAdjustment == null ? 0 : creditNoteObj.SubItemGSTAdjustment,
                                TotalAdjustment = creditNoteObj.TotalAdjustment == null ? 0 : creditNoteObj.TotalAdjustment,
                                NetTotal = creditNoteObj.NetTotal == null ? 0 : creditNoteObj.NetTotal,
                                CreditNoteTotal = creditNoteObj.CreditNoteTotal == null ? 0 : creditNoteObj.CreditNoteTotal,
                                //SupplierAddress = creditNoteObj.SupplierAddress,
                                SupplierType = creditNoteObj.SupplierType,
                                CurrencyType = creditNoteObj.CurrencyType,
                                CNTotalValue = creditNoteObj.CNTotalValue,
                                TotalGSTAmount = creditNoteObj.TotalGSTAmount,
                                SubTotalDiscount = creditNoteObj.SubTotalDiscount,
                                CreationDate = creditNoteObj.CreationDate,
                                SchedulerNo = creditNoteObj.SchedulerNo
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                            #endregion
                            #region  we are saving credit note items...
                            if (creditNoteObj.CreditNoteLineItems != null)
                            {
                                this.InsertCreditNoteLineItems(creditNoteObj, transactionObj);
                            }
                            #endregion
                            #region saving files here...
                            if (creditNoteObj.files != null)
                            {
                                try
                                {
                                    //saving files in the folder...
                                    FileOperations fileOperationsObj = new FileOperations();
                                    bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                    {
                                        CompanyName = "UEL",
                                        ModuleName = AttachmentFolderNames.CreditNote,
                                        Files = creditNoteObj.files,
                                        UniqueId = Convert.ToString(creditNoteObj.CreditNoteId)
                                    });
                                    List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                    //looping through the list of purchase order items...
                                    for (var i = 0; i < creditNoteObj.files.Count; i++)
                                    {
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.CreditNote), DbType.Int32, ParameterDirection.Input);//static value need to change
                                        itemObj.Add("@RecordId", Convert.ToString(creditNoteObj.CreditNoteId), DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", creditNoteObj.files[i].FileName, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", creditNoteObj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        fileToSave.Add(itemObj);
                                    }
                                    var creditNoteFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                                }
                                catch (Exception e)
                                {
                                    throw e;
                                }

                            }
                            #endregion
                            #region Save Document Address Details.
                            this.sharedRepository = new SharedRepository();
                            this.sharedRepository.PostDocumentAddress(new DocumentAddress
                            {
                                Address = creditNoteObj.SupplierAddress,
                                CompanyId = creditNoteObj.CompanyId,
                                DocumentId = creditNoteObj.CreditNoteId,
                                ProcessId = (int)WorkFlowProcessTypes.CreditNote
                            }, transactionObj);
                            #endregion
                            AuditLogData auditLogData = new AuditLogData
                            {
                                DocumentId = creditNoteObj.CreditNoteId,
                                PageName = WorkFlowProcessTypes.CreditNote.ToString(),
                                Logger = creditNoteObj.CreatedBy,
                                Action = "SAVE",
                                CompanyId = creditNoteObj.CompanyId,
                            };
                            auditLogRepository.LogSaveDocument(auditLogData, transactionObj, m_dbconnection);
                            if (creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.Completed)
                            {
                                this.deleteUnAssignedLineItems(creditNoteObj.CreditNoteId, transactionObj, m_dbconnection);
                                auditLogRepository.LogSubmitDocument(auditLogData, transactionObj, m_dbconnection);
                                if (creditNoteObj.InvoiceId != 0)
                                {
                                    string pageName = Enum.GetName(typeof(WorkFlowProcessTypes), (int)WorkFlowProcessTypes.CreditNote);
                                    AuditLogData logData = new AuditLogData
                                    {
                                        DocumentId = creditNoteObj.InvoiceId,
                                        PageName = Enum.GetName(typeof(WorkFlowProcessTypes), (int)WorkFlowProcessTypes.SupplierInvoice),
                                        Action = "OPEN",
                                        Logger = creditNoteObj.CreatedBy,
                                        DocumentCode = creditNoteObj.CreditNoteCode,
                                        CompanyId = creditNoteObj.CompanyId,
                                        Message = pageName + " ({0}) by {1} on {2}. Status = Open"
                                    };
                                    auditLogRepository.UpdateLogInParentDocument(logData, transactionObj, m_dbconnection);
                                }
                            }

                            if (creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
                            {
                                WorkFlowParameter workFlowParameter = new WorkFlowParameter
                                {
                                    CompanyId = creditNoteObj.CompanyId,
                                    DocumentCode = creditNoteObj.CreditNoteCode,
                                    DocumentId = creditNoteObj.CreditNoteId,
                                    ProcessId = (int)WorkFlowProcessTypes.CreditNote,
                                    Value = creditNoteObj.SubTotal.ToString(),
                                    LocationId = creditNoteObj.LocationID,
                                    UserID = creditNoteObj.CreatedBy,
                                    WorkFlowStatusId = (int)WorkFlowStatus.ApprovalInProgress
                                };
                                genericRepository.SendDocument(workFlowParameter, transactionObj, m_dbconnection);
                            }
                            transactionObj.Commit();
                            return creditNoteObj.CreditNoteId;
                        }
                        catch (Exception e)
                        {
                            transactionObj.Rollback();
                            throw e;
                        }
                    }
                }
                else
                    return -1;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private int InsertCreditNoteLineItems(CreditNote creditNote, IDbTransaction transaction)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var record in creditNote.CreditNoteLineItems.Where(i => i.CNDetailsId == 0 || i.CNDetailsId == null).Select(i => i))
            {
                var itemObj = new DynamicParameters();
                itemObj.Add("@Action", "Insert", DbType.String, ParameterDirection.Input);
                itemObj.Add("@CNId", creditNote.CreditNoteId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@InvoiceItemId", record.InvoiceItemId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@OriginaltemQty", record.OriginaltemQty, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@OriginalUnitprice", record.OriginalUnitprice, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@OriginalDiscount", record.OriginalDiscount == null ? 0 : record.OriginalDiscount, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                itemObj.Add("@CPONumber", record.CPONumber, DbType.String, ParameterDirection.Input);
                itemObj.Add("@UnitPrice", record.Unitprice == null ? 0 : record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@TaxId", record.TaxID, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@Tax", record.Tax == null ? 0 : record.Tax, DbType.Decimal, ParameterDirection.Input);
                //itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@TaxAmount", record.TaxAmount == null ? 0 : record.TaxAmount, DbType.Decimal, ParameterDirection.Input);
                //itemObj.Add("@GSTAmount", record.GSTAmount == null ? 0 : record.GSTAmount, DbType.Decimal, ParameterDirection.Input);
                //itemObj.Add("@GSTAdjustment", record.GSTAdjustment == null ? 0 : record.GSTAdjustment, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@ReturnQty", record.ReturnQty == null ? 0 : record.ReturnQty, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@DecreaseInUnitPrice", record.DecreaseInUnitPrice == null ? 0 : record.DecreaseInUnitPrice, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@ReturnValue", record.ReturnValue == null ? 0 : record.ReturnValue, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@CNTotalValue", record.CNTotalValue == null ? 0 : record.CNTotalValue, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@Item", record.Item == null ? null : record.Item.ItemName, DbType.String, ParameterDirection.Input);
                itemObj.Add("@ItemType", record.ItemType, DbType.String, ParameterDirection.Input);
                itemObj.Add("@AccountType", record.AccountType, DbType.String, ParameterDirection.Input);
                itemObj.Add("@AccountCodeName", record.AccountCodeName, DbType.String, ParameterDirection.Input);
                itemObj.Add("@Code", record.Code, DbType.String, ParameterDirection.Input);
                itemObj.Add("@GlDescription", record.GlDescription, DbType.String, ParameterDirection.Input);
                itemObj.Add("@ItemMasterId", record.Item == null ? 0 : record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@AccountCodeId", record.Service == null ? 0 : record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@POTypeId", record.POTypeId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@CreatedBy", creditNote.CreatedBy, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                itemObj.Add("@TaxGroupName", record.TaxGroupName, DbType.String, ParameterDirection.Input);
                itemObj.Add("@TotalbefTax", record.TotalbefTax, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@TaxGroupId", creditNote.InvoiceId == 0 ? Convert.ToInt32(record.TaxGroupName) : record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);

                itemToAdd.Add(itemObj);
            }
            return this.m_dbconnection.Execute("Credit_Note_Details_CRUD", itemToAdd, transaction: transaction, commandType: CommandType.StoredProcedure);
        }

        private int UpdateCreditNoteLineItems(CreditNote creditNote, IDbTransaction transaction)
        {
            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
            foreach (var record in creditNote.CreditNoteLineItems.Where(i => i.CNDetailsId > 0).Select(i => i))
            {
                var itemObj = new DynamicParameters();
                itemObj.Add("@Action", "Update", DbType.String, ParameterDirection.Input);
                itemObj.Add("@CNDetailsId", record.CNDetailsId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@CNId", creditNote.CreditNoteId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@InvoiceItemId", record.InvoiceItemId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@ItemQty", record.ItemQty == null ? 0 : record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@OriginaltemQty", record.OriginaltemQty, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@OriginalUnitprice", record.OriginalUnitprice, DbType.Decimal, ParameterDirection.Input);
                //itemObj.Add("@OriginalDiscount", record.OriginalDiscount, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                itemObj.Add("@UnitPrice", record.Unitprice == null ? 0 : record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@TaxId", record.TaxID, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@Tax", record.Tax == null ? 0 : record.Tax, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@TaxAmount", record.TaxAmount == null ? 0 : record.TaxAmount, DbType.Decimal, ParameterDirection.Input);
                //itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                //itemObj.Add("@GSTAmount", record.GSTAmount == null ? 0 : record.GSTAmount, DbType.Decimal, ParameterDirection.Input);
                //itemObj.Add("@GSTAdjustment", record.GSTAdjustment == null ? 0 : record.GSTAdjustment, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@ReturnQty", record.ReturnQty == null ? 0 : record.ReturnQty, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@DecreaseInUnitPrice", record.DecreaseInUnitPrice == null ? 0 : record.DecreaseInUnitPrice, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@ReturnValue", record.ReturnValue == null ? 0 : record.ReturnValue, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@CNTotalValue", record.CNTotalValue == null ? 0 : record.CNTotalValue, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@Item", record.Item == null ? null : record.Item.ItemName, DbType.String, ParameterDirection.Input);
                itemObj.Add("@ItemMasterId", record.Item == null ? 0 : record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@AccountCodeId", record.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@POTypeId", record.POTypeId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@ItemType", record.ItemType, DbType.String, ParameterDirection.Input);
                itemObj.Add("@AccountType", record.AccountType, DbType.String, ParameterDirection.Input);
                itemObj.Add("@GlDescription", record.GlDescription, DbType.String, ParameterDirection.Input);
                itemObj.Add("@AccountCodeName", record.AccountCodeName, DbType.String, ParameterDirection.Input);
                itemObj.Add("@Code", record.Code, DbType.String, ParameterDirection.Input);
                itemObj.Add("@UpdatedBy", record.UpdatedBy, DbType.String, ParameterDirection.Input);
                itemObj.Add("@UpdatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                itemObj.Add("@TaxGroupName", record.TaxGroupName, DbType.String, ParameterDirection.Input);
                itemObj.Add("@TotalbefTax", record.TotalbefTax, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                itemObj.Add("@CPONumber", record.CPONumber, DbType.String, ParameterDirection.Input);

                itemToAdd.Add(itemObj);
            }
            return this.m_dbconnection.Execute("Credit_Note_Details_CRUD", itemToAdd, transaction: transaction, commandType: CommandType.StoredProcedure);
        }

        public int UpdateCreditNote(CreditNote creditNoteObj)
        {
            try
            {
                if (this.ValidateCNNo(creditNoteObj.SupplierCreditNoteNo, creditNoteObj.CreditNoteId))
                {
                    this.m_dbconnection.Open();
                    var old = this.GetCreditNotesById(creditNoteObj.CreditNoteId);
                    using (var transactionObj = this.m_dbconnection.BeginTransaction())
                    {
                        try
                        {
                            #region credit note updation...
                            if (StringOperations.HasDraftCode(creditNoteObj.DocumentCode) && (creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.Completed || creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress))
                            {
                                var _documentData = new ProjectDocument
                                {
                                    CompanyId = creditNoteObj.CompanyId,
                                    DocumentCode = ModuleCodes.CreditNote,
                                    DocumentTypeId = (int)WorkFlowProcessTypes.CreditNote
                                };
                                creditNoteObj.DocumentCode = genericRepository.GenerateDocumentCode(_documentData, transactionObj, m_dbconnection);
                            }
                            int updateResult = this.m_dbconnection.Query<int>("Credit_Note_CRUD", new
                            {
                                Action = "Update",
                                CreditNoteId = creditNoteObj.CreditNoteId,
                                DocumentCode = creditNoteObj.DocumentCode,
                                SupplierId = creditNoteObj.SupplierId,
                                SubCodeId = creditNoteObj.SubCodeId,
                                InvoiceId = creditNoteObj.InvoiceId,
                                Discount = creditNoteObj.Discount,
                                SupplierCreditNoteDate = creditNoteObj.SupplierCreditNoteDate,
                                SupplierCreditNoteNo = creditNoteObj.SupplierCreditNoteNo,
                                InvoiceOSAmount = creditNoteObj.InvoiceOSAmount,
                                InvoiceTotalAmount = creditNoteObj.InvoiceTotalAmount,
                                Adjustment = creditNoteObj.Adjustment == null ? 0 : creditNoteObj.Adjustment,
                                Reasons = creditNoteObj.Reasons == null ? string.Empty : creditNoteObj.Reasons,
                                SubTotal = creditNoteObj.SubTotal,
                                LocationID = creditNoteObj.LocationID,
                                Total = creditNoteObj.Total,
                                UpdatedBy = creditNoteObj.UpdatedBy,
                                UpdatedDate = DateTime.Now,
                                WorkFlowStatusId = creditNoteObj.WorkFlowStatusId,
                                CompanyId = creditNoteObj.CompanyId,
                                SubItemGSTAdjustment = creditNoteObj.SubItemGSTAdjustment == null ? 0 : creditNoteObj.SubItemGSTAdjustment,
                                TotalAdjustment = creditNoteObj.TotalAdjustment == null ? 0 : creditNoteObj.TotalAdjustment,
                                NetTotal = creditNoteObj.NetTotal == null ? 0 : creditNoteObj.NetTotal,
                                CreditNoteTotal = creditNoteObj.CreditNoteTotal == null ? 0 : creditNoteObj.CreditNoteTotal,
                                ReasonToVoid = creditNoteObj.ReasonToVoid,
                                //SupplierAddress = creditNoteObj.SupplierAddress,
                                SupplierType = creditNoteObj.SupplierType,
                                CurrencyType = creditNoteObj.CurrencyType,
                                CNTotalValue = creditNoteObj.CNTotalValue,
                                TotalGSTAmount = creditNoteObj.TotalGSTAmount,
                                SubTotalDiscount = creditNoteObj.SubTotalDiscount,
                                SchedulerNo = creditNoteObj.SchedulerNo
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                            #endregion

                            #region  we are saving credit note items...
                            if (creditNoteObj.CreditNoteLineItems != null)
                            {
                                this.InsertCreditNoteLineItems(creditNoteObj, transactionObj);
                            }
                            #endregion

                            #region updating credit items...

                            this.UpdateCreditNoteLineItems(creditNoteObj, transactionObj);
                            #endregion

                            #region deleting credit items...

                            List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                            if (creditNoteObj.CreditNoteItemsToDelete != null)
                            {
                                //looping through the list of credit note items...
                                foreach (var creditNoteDetailId in creditNoteObj.CreditNoteItemsToDelete)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CNDetailsId", creditNoteDetailId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", creditNoteObj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    itemsToDelete.Add(itemObj);
                                }
                            }

                            var creditNoteItemDeleteResult = this.m_dbconnection.Execute("Credit_Note_CRUD", itemsToDelete,
                                                                        transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                            #endregion

                            #region Save Document Address Details.
                            this.sharedRepository = new SharedRepository();
                            this.sharedRepository.PostDocumentAddress(new DocumentAddress
                            {
                                Address = creditNoteObj.SupplierAddress,
                                CompanyId = creditNoteObj.CompanyId,
                                DocumentId = creditNoteObj.CreditNoteId,
                                ProcessId = (int)WorkFlowProcessTypes.CreditNote
                            }, transactionObj);
                            #endregion

                            //#region deleting attachments
                            ////looping through attachments
                            List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                            for (var i = 0; i < creditNoteObj.Attachments.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@AttachmentTypeId", creditNoteObj.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", creditNoteObj.CreditNoteId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@AttachmentId", creditNoteObj.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                fileToDelete.Add(fileObj);
                                var creditNoteFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                      commandType: CommandType.StoredProcedure);
                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.CreditNote,
                                    FilesNames = creditNoteObj.Attachments.Select(j => j.FileName).ToArray(),
                                    UniqueId = creditNoteObj.CreditNoteId.ToString()
                                });
                            }

                            //#endregion

                            #region saving files uploaded files...
                            try
                            {
                                List<DynamicParameters> filetosave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < creditNoteObj.files.Count; i++)
                                {
                                    var itemobj = new DynamicParameters();
                                    itemobj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemobj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.CreditNote), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemobj.Add("@RecordId", Convert.ToString(creditNoteObj.CreditNoteId), DbType.Int32, ParameterDirection.Input);
                                    itemobj.Add("@FileName", creditNoteObj.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemobj.Add("@CreatedBy", creditNoteObj.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemobj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    filetosave.Add(itemobj);
                                }

                                var creditNoteFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", filetosave, transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);

                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.CreditNote,
                                    Files = creditNoteObj.files,
                                    UniqueId = creditNoteObj.CreditNoteId.ToString()
                                });

                            }
                            catch (Exception e)
                            {
                                throw e;
                            }
                            #endregion

                            if (creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.Completed)
                            {
                                this.deleteUnAssignedLineItems(creditNoteObj.CreditNoteId, transactionObj, m_dbconnection);
                                AuditLogData auditLogData = new AuditLogData
                                {
                                    DocumentId = creditNoteObj.CreditNoteId,
                                    PageName = WorkFlowProcessTypes.CreditNote.ToString(),
                                    Logger = creditNoteObj.UpdatedBy,
                                    Action = "SUBMIT",
                                    CompanyId = creditNoteObj.CompanyId,
                                };
                                auditLogRepository.LogSubmitDocument(auditLogData, transactionObj, m_dbconnection);
                                if (creditNoteObj.InvoiceId != 0)
                                {
                                    string pageName = Enum.GetName(typeof(WorkFlowProcessTypes), (int)WorkFlowProcessTypes.CreditNote);
                                    AuditLogData logData = new AuditLogData
                                    {
                                        DocumentId = creditNoteObj.InvoiceId,
                                        PageName = Enum.GetName(typeof(WorkFlowProcessTypes), (int)WorkFlowProcessTypes.SupplierInvoice),
                                        Action = "OPEN",
                                        Logger = creditNoteObj.CreatedBy,
                                        DocumentCode = creditNoteObj.DocumentCode,
                                        CompanyId = creditNoteObj.CompanyId,
                                        Message = pageName + " ({0}) by {1} on {2}. Status = Open"
                                    };
                                    auditLogRepository.UpdateLogInParentDocument(logData, transactionObj, m_dbconnection);
                                }
                            }
                            if (creditNoteObj.Action.ToLower() == "reverify" || creditNoteObj.Action.ToLower() == "verify")
                            {
                                auditLogRepository.LogVerifyDocument(old, creditNoteObj, new WorkFlowApproval
                                {
                                    DocumentId = creditNoteObj.CreditNoteId,
                                    ProcessId = (int)WorkFlowProcessTypes.CreditNote,
                                    UserId = creditNoteObj.UpdatedBy,
                                    CompanyId = creditNoteObj.CompanyId
                                }, transactionObj, m_dbconnection);
                            }
                            if (creditNoteObj.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress && creditNoteObj.Action.ToLower() != "verify")
                            {
                                WorkFlowParameter workFlowParameter = new WorkFlowParameter
                                {
                                    CompanyId = creditNoteObj.CompanyId,
                                    DocumentCode = creditNoteObj.DocumentCode,
                                    DocumentId = creditNoteObj.CreditNoteId,
                                    ProcessId = (int)WorkFlowProcessTypes.CreditNote,
                                    Value = creditNoteObj.SubTotal.ToString(),
                                    LocationId = creditNoteObj.LocationID,
                                    UserID = creditNoteObj.UpdatedBy,
                                    WorkFlowStatusId = (int)WorkFlowStatus.ApprovalInProgress
                                };
                                genericRepository.SendDocument(workFlowParameter, transactionObj, m_dbconnection);
                            }
                            transactionObj.Commit();
                            return creditNoteObj.CreditNoteId;
                        }
                        catch (Exception e)
                        {
                            //rollback transaction..
                            transactionObj.Rollback();
                            throw e;
                        }
                    }
                }
                else
                    return -1;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void deleteUnAssignedLineItems(int documentId, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            try
            {
                m_dbconnection.Query<bool>("Credit_Note_CRUD", new
                {
                    Action = "DELETE_UNASSIGNED",
                    @DocumentId = documentId
                }, transaction, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            {

            }
        }

        public bool DeleteContractCreditNote(CreditNoteDelete creditNoteDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region delete purchase order...
                        var creditNoteDeleteResult = this.m_dbconnection.Execute("CreditNote_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    CreditNoteId = creditNoteDelete.CreditNoteId,
                                                                    CreatedBy = creditNoteDelete.ModifiedBy
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #endregion

                        #region deleting purchase order items...
                        var creditNoteItemDeleteResult = this.m_dbconnection.Execute("CreditNote_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            CreditNoteId = creditNoteDelete.CreditNoteId,
                            CreatedBy = creditNoteDelete.ModifiedBy,
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
                            parameterObj.Add("@RecordId", creditNoteDelete.CreditNoteId, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.CreditNote), DbType.Int32, ParameterDirection.Input);
                            var deletedAttachmentNames = this.m_dbconnection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.CreditNote,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = creditNoteDelete.CreditNoteId.ToString()
                            });

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

        public IEnumerable<Invoices> GetCreditNoteAllINVRequest(GridDisplayInput gridDisplayInput)
        {
            try
            {
                //usp_GetPORequest
                return this.m_dbconnection.Query<Invoices>("Credit_Note_CRUD", new
                {
                    Action = "SEARCH_INVOICE_BY_SUPPLIER",
                    Search = gridDisplayInput.Search,
                    Supplierid = gridDisplayInput.SupplierId,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<CreditNoteLineItems> GetCreditNoteINVDetails(int InvoiceId)
        {
            try
            {
                var Result = this.m_dbconnection.Query<CreditNoteLineItems>("Credit_Note_CRUD", new
                {
                    Action = "GET_INV_DETAILS",
                    InvoiceId = InvoiceId
                }, commandType: CommandType.StoredProcedure).ToList();
                var LineItems_DETAILS = this.m_dbconnection.Query<CreditNoteLineItems>("Credit_Note_CRUD", new
                {
                    Action = "GET_CRN_LineItems_DETAILS",
                    InvoiceId = InvoiceId
                }, commandType: CommandType.StoredProcedure).ToList();
                foreach (var item in Result)
                {
                    item.OriginaltemQty = item.ItemQty;
                    var ReturnQTY = LineItems_DETAILS
                              .Where(x => x.InvoiceItemId == item.InvoiceItemId)
                              .Sum(x => x.ItemQty);
                    item.ItemQty = (decimal)item.OriginaltemQty - ReturnQTY;

                    item.OriginalUnitprice = item.Unitprice;
                    var ReturnUnitprice = LineItems_DETAILS
                              .Where(x => x.InvoiceItemId == item.InvoiceItemId)
                              .Sum(x => x.Unitprice);
                    item.Unitprice = item.OriginalUnitprice - ReturnUnitprice;

                    //if (item.ReturnQty > 0 || item.DecreaseInUnitPrice > 0)
                    //{
                    item.OriginalDiscount = item.Discount;
                    var ReturnDiscount = LineItems_DETAILS
                              .Where(x => x.InvoiceItemId == item.InvoiceItemId)
                              .Sum(x => x.Discount);
                    item.Discount = (decimal)item.OriginalDiscount - ReturnDiscount;
                    //}


                }
                return Result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Tax> GetTaxesByTaxId(int taxId)
        {
            return this.m_dbconnection.Query<Tax>("Credit_Note_CRUD",
                                          new
                                          {
                                              Action = "TAXES",
                                              TaxId = taxId
                                          }, commandType: CommandType.StoredProcedure).ToList();
        }

        public CreditNotesDisplayResult Get_Existing_InvoiceId(int InvoiceId)
        {
            try
            {
                CreditNotesDisplayResult creditNotesDisplayResult = new CreditNotesDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("Credit_Note_CRUD", new
                {
                    Action = "Get_Existing_InvoiceId",
                    InvoiceId = InvoiceId

                }, commandType: CommandType.StoredProcedure))
                {
                    creditNotesDisplayResult.CreditNotes = result.Read<CreditNote>().AsList();
                }
                var Result = this.GetCreditNoteINVDetails(InvoiceId);
                return creditNotesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DocumentExportData ExportCNDocument(int documentId)
        {
            DocumentExportData documentExportData = new DocumentExportData();
            try
            {
                Invoice invoice = GetInvoiceDetails(documentId);
                documentExportData.Invoices = this.m_dbconnection.Query<InvoiceSection>("Sp_creditnote_export", new
                {
                    Action = "INVOICES",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                var taxDetails = this.m_dbconnection.Query<dynamic>("Sp_creditnote_export", new
                {
                    Action = "GET_TAX_ADJ",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                decimal taxAdj = Convert.ToDecimal(taxDetails.TAXADJ);
                decimal totalAdj = Convert.ToDecimal(taxDetails.TOTADJ);
                var detailsData = this.m_dbconnection.Query<dynamic>("Sp_creditnote_export", new
                {
                    Action = "INVOICE_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                foreach (var item in detailsData)
                {
                    string _IDGLACCT = item.IDGLACCT;
                    if (invoice != null)
                    {
                        InvoiceItems invoiceItems = invoice.InvoiceItems.Where(x => x.InvoiceItemId == item.InvoiceItemId).FirstOrDefault();
                        _IDGLACCT = invoiceItems.Item.GLCode == null ? invoiceItems.Service.Code : invoiceItems.Item.GLCode;
                    }
                    documentExportData.InvoiceDetails.Add(new InvoiceDetailsSection
                    {
                        AMTDIST = item.AMTDIST,
                        AMTTAX1 = item.AMTTAX1,
                        AMTTOTTAX = item.AMTTOTTAX,
                        BASETAX1 = item.BASETAX1,
                        CNTBTCH = Convert.ToString(item.CNTBTCH),
                        CNTITEM = Convert.ToString(item.CNTITEM),
                        CNTLINE = Convert.ToString(item.CNTLINE),
                        COMMENT = item.COMMENT,
                        IDDIST = item.IDDIST,
                        IDGLACCT = _IDGLACCT,
                        RATETAX1 = item.RATETAX1,
                        SWIBT = item.SWIBT,
                        TAXCLASS1 = item.TAXCLASS1,
                        TEXTDESC = item.TEXTDESC
                    });
                }
                string maxTax = documentExportData.InvoiceDetails.OrderByDescending(x => x.AMTTOTTAX).FirstOrDefault().AMTTOTTAX;
                string maxTotal = documentExportData.InvoiceDetails.OrderByDescending(x => x.BASETAX1).FirstOrDefault().BASETAX1;
                foreach (var item in documentExportData.InvoiceDetails)
                {
                    if (item.AMTTOTTAX == maxTax)
                    {
                        item.AMTTOTTAX = (Convert.ToDecimal(item.AMTTOTTAX) + taxAdj).ToString();
                        item.AMTTAX1 = (Convert.ToDecimal(item.AMTTAX1) + taxAdj).ToString();
                        break;
                    }
                }

                foreach (var item in documentExportData.InvoiceDetails)
                {
                    if (item.BASETAX1 == maxTotal)
                    {
                        item.BASETAX1 = (Convert.ToDecimal(item.BASETAX1) + totalAdj).ToString();
                        item.AMTDIST = (Convert.ToDecimal(item.AMTDIST) + totalAdj).ToString();
                        break;
                    }
                }
                documentExportData.InvoicePaymentScheduleSections = this.m_dbconnection.Query<InvoicePaymentScheduleSection>("Sp_creditnote_export", new
                {
                    Action = "INVOICE_PAYMENT_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                documentExportData.InvoiceOptinalFieldsSections = this.m_dbconnection.Query<InvoiceOptinalFieldsSection>("Sp_creditnote_export", new
                {
                    Action = "INVOICE_OPTIONAL_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
                documentExportData.InvoiceDetailsOptinalFieldsSections = this.m_dbconnection.Query<InvoiceDetailsOptinalFieldsSection>("Sp_creditnote_export", new
                {
                    Action = "INVOICE_DETAILS_OPTIONAL_DETAILS",
                    DocumentId = documentId
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            {

            }
            return documentExportData;
        }

        private Invoice GetInvoiceDetails(int documentId)
        {
            Invoice invoice = null;
            try
            {
                int invoiceId = this.m_dbconnection.ExecuteScalar<int>("select invoiceid from creditnote where creditnoteid = @documentId",
                    new { documentId = documentId });
                InvoiceRepository invoiceRepository = new InvoiceRepository();
                invoice = invoiceRepository.GetInvoiceDetails(invoiceId, 1, 0, 0);
            }
            catch (Exception)
            {

                throw;
            }
            return invoice;
        }

        public bool ValidateCNNo(string CNNo, int CNId)
        {
            bool count = false;
            if (string.IsNullOrEmpty(CNNo.Trim()))
            {
                count = true;
            }
            else
            {
                count = this.m_dbconnection.ExecuteScalar<bool>("Credit_Note_CRUD", new
                {
                    Action = "CHECK_DUPLICATE",
                    SupplierCreditNoteNo = CNNo,
                    CreditNoteId = CNId
                }, commandType: CommandType.StoredProcedure);
            }
            return count;
        }
    }
}

