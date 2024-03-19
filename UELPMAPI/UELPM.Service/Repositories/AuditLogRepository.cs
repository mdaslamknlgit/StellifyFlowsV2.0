using Dapper;
using KellermanSoftware.CompareNetObjects;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Helpers;
using UELPM.Service.Interface;
using UELPM.Util.StringOperations;

namespace UELPM.Service.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        UserProfileRepository userProfileRepository = null;
        public AuditLogRepository()
        {
            userProfileRepository = new UserProfileRepository();
        }

        public IEnumerable<AuditLogData> GetAuditLogs(AuditLogSearch auditlogdata)
        {
            return this.m_dbconnection.Query<AuditLogData>("GetAuditLogs",
                                          new
                                          {
                                              FromDate = auditlogdata.FromDate.ToString("yyyy/MM/dd").Replace('-', '/'),
                                              ToDate = auditlogdata.ToDate.ToString("yyyy/MM/dd").Replace('-', '/'),
                                              CompanyId = auditlogdata.CompanyId
                                          }, commandType: CommandType.StoredProcedure).ToList();
        }

        public IEnumerable<AuditLogData> GetAuditLogsByDocumentId(AuditLogSearch auditLogSearch)
        {
            if (auditLogSearch.PageName == "Supplier")
            {
                var data = this.m_dbconnection.Query<AuditLogData>("GetAuditLogsByDocumentId", new
                {
                    Action = "Supplier",
                    companyid = auditLogSearch.CompanyId,
                    documentId = auditLogSearch.DocumentId,
                    PageName = auditLogSearch.PageName
                }, commandType: CommandType.StoredProcedure).ToList();
                foreach (var item in data)
                {
                    if (!string.IsNullOrEmpty(item.Changes))
                    {
                        item.AuditChanges = JsonConvert.DeserializeObject<List<AuditDelta>>(item.Changes.ToString());
                    }
                }
                return data;
            }
            else
            {
                var data = this.m_dbconnection.Query<AuditLogData>("GetAuditLogsByDocumentId", new
                {
                    Action = "Other",
                    documentId = auditLogSearch.DocumentId,
                    PageName = auditLogSearch.PageName
                }, commandType: CommandType.StoredProcedure).ToList();
                foreach (var item in data)
                {
                    if (!string.IsNullOrEmpty(item.Changes))
                    {
                        item.AuditChanges = JsonConvert.DeserializeObject<List<AuditDelta>>(item.Changes.ToString());
                    }
                }
                return data;
            }
        }

        public IEnumerable<AuditLogData> SearchAuditLogs(AuditLogSearch auditlogdata)
        {
            return this.m_dbconnection.Query<AuditLogData>("SearchAuditLogs",
                                          new
                                          {

                                              FromDate = auditlogdata.FromDate.ToString("yyyy/MM/dd").Replace('-', '/'),
                                              ToDate = auditlogdata.ToDate.ToString("yyyy/MM/dd").Replace('-', '/'),
                                              CompanyId = auditlogdata.CompanyId

                                          }, commandType: CommandType.StoredProcedure).ToList();
        }

        public void WriteAuditLog(string moduleName, string action, string user, string docId, string level, string method, string message, string changes, int companyId = 0)
        {
            var test = this.m_dbconnection.Query<int>("IPS_SpWriteAuditLog", new
            {
                DocumentId = docId,
                Level = level,
                Logger = user,
                Message = message,
                Exception = string.Empty,
                PageName = moduleName,
                Method = method,
                Action = action,
                CompanyId = companyId,
                Changes = changes
            }, commandType: CommandType.StoredProcedure).FirstOrDefault();

        }

        public bool PostAuditLog(AuditLogData auditLogData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            var result = dbConnection.Query<bool>("IPS_SpWriteAuditLog", new
            {
                DocumentId = auditLogData.DocumentId,
                Level = "INFO",
                Logger = auditLogData.Logger,
                Message = auditLogData.Message,
                Exception = string.Empty,
                PageName = auditLogData.PageName,
                Method = auditLogData.Method,
                Action = auditLogData.Action,
                CompanyId = auditLogData.CompanyId,
                Changes = auditLogData.Changes
            }, dbTransaction, commandType: CommandType.StoredProcedure).FirstOrDefault();
            return result;
        }

        public string CheckAuditTrail(Object OldObject, Object NewObject, int processTypeId, IDbTransaction transaction = null)
        {
            string changes = string.Empty;
            try
            {
                List<Difference> diffs = new List<Difference>();
                switch (processTypeId)
                {
                    case (int)WorkFlowProcessTypes.CreditNote:
                        diffs = FindCNDifference(OldObject, NewObject);
                        break;
                    case (int)WorkFlowProcessTypes.ContractPOFixed:
                    case (int)WorkFlowProcessTypes.ContractPOVariable:
                        diffs = FindPOCItemsDifference(OldObject, NewObject);
                        break;
                    case (int)WorkFlowProcessTypes.SupplierInvoice:
                        diffs = FindInvoiceDifference(OldObject, NewObject);
                        break;
                    case (int)WorkFlowProcessTypes.CustomerMaster:
                        diffs = FindCustomerMasterDifference(OldObject, NewObject);
                        break;
                    case (int)WorkFlowProcessTypes.SalesQuotation:
                        diffs = FindSalesQuotationDifference(OldObject, NewObject);
                        break;
                    case (int)WorkFlowProcessTypes.SalesInvoice:
                        diffs = FindSalesInvoiceDifference(OldObject, NewObject);
                        break;
                    default:
                        break;
                }
                List<AuditDelta> DeltaList = new List<AuditDelta>();
                foreach (var change in diffs)
                {
                    AuditDelta delta = new AuditDelta();
                    delta.FieldName = change.PropertyName.ToString();
                    if (delta.FieldName == "GlDescription")
                    {
                        delta.FieldName = "GLCode";
                    }
                    try
                    {
                        switch (change.Object1TypeName)
                        {
                            case "Decimal":
                                delta.ValueBefore = $"{ Convert.ToDecimal(change.Object1Value).ToString("0,0.00", CultureInfo.InvariantCulture)}";
                                delta.ValueAfter = $"{ Convert.ToDecimal(change.Object2Value).ToString("0,0.00", CultureInfo.InvariantCulture)}";
                                break;
                            case "DateTime":
                                delta.ValueBefore = Convert.ToDateTime(change.Object1Value).ToString("dd-MM-yyyy");
                                delta.ValueAfter = Convert.ToDateTime(change.Object2Value).ToString("dd-MM-yyyy");
                                break;
                            default:
                                delta.ValueBefore = StringOperations.IsNullOrEmpty(change.Object1Value) ? string.Empty : change.Object1Value;
                                delta.ValueAfter = StringOperations.IsNullOrEmpty(change.Object2Value) ? string.Empty : change.Object2Value;
                                break;
                        }
                    }
                    catch (Exception)
                    {
                        delta.ValueBefore = string.Empty;
                        delta.ValueAfter = string.Empty;
                    }

                    DeltaList.Add(delta);
                }
                changes = diffs.Count > 0 ? JsonConvert.SerializeObject(DeltaList) : null;
            }
            catch (Exception ex)
            {

                throw;
            }
            return changes;
        }

        private List<Difference> FindCustomerMasterDifference(object oldObject, object newObject)
        {
            List<Difference> mainChanges = new List<Difference>();
            SalesCustomer _old = (SalesCustomer)oldObject;
            SalesCustomer _new = (SalesCustomer)newObject;
            CompareLogic compObjects = new CompareLogic();
            compObjects.Config.MaxDifferences = 200;
            compObjects.Config.IgnoreCollectionOrder = true;
            compObjects.Config.CompareChildren = true;
            compObjects.Config.IgnoreObjectDisposedException = true;
            compObjects.Config.IgnoreUnknownObjectTypes = true;

            var Changes = compObjects.Compare(_old, _new);
            mainChanges = Changes.Differences;
            mainChanges.RemoveAll(x => x.PropertyName == "files");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "ButtonPreferences");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "CustomerAddresses");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "CustomerContacts" || x.PropertyName == "CustomerContacts");
            mainChanges.RemoveAll(x => x.PropertyName == "CurrentApprover");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "WorkflowStatus");
            mainChanges.RemoveAll(x => x.PropertyName == "WorkFlowComments" || x.ParentPropertyName == "WorkFlowComments");
            mainChanges.RemoveAll(x => x.PropertyName == "DocumentCode");
            mainChanges.RemoveAll(x => x.PropertyName == "UpdatedBy");
            mainChanges.RemoveAll(x => x.PropertyName == "CustomerIPSId");
            mainChanges.RemoveAll(x => x.PropertyName == "MasterCustomerIPSId");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "Currency" && x.PropertyName != "Currency.Code");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "Department");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "CreditTerm");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "CustomerType");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "TaxGroup" || x.PropertyName == "TaxGroup");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "TaxType" || x.PropertyName == "TaxType");
            mainChanges.RemoveAll(x => x.ParentPropertyName == "TenantType" && x.PropertyName != "TenantType.TenantTypeName");
            var taxGroupChanges = compObjects.Compare(_old.TaxGroup == null ? new SalesTaxGroup() : _old.TaxGroup, _new.TaxGroup).Differences;
            taxGroupChanges.RemoveAll(x => x.PropertyName != "TaxGroupName");
            var taxTypeChanges = compObjects.Compare(_old.TaxType == null ? new TaxType() : _old.TaxType, _new.TaxType).Differences;
            taxTypeChanges.RemoveAll(x => x.PropertyName != "TaxClass");
            var addressChanges = this.FindCustomerAddressChanges(_new.CustomerAddresses, _old.CustomerAddresses);
            var contactChanges = this.FindCustomerContactChanges(_new.CustomerContacts, _old.CustomerContacts);
            mainChanges.AddRange(addressChanges);
            mainChanges.AddRange(contactChanges);
            mainChanges.AddRange(taxGroupChanges);
            mainChanges.AddRange(taxTypeChanges);
            return mainChanges;
        }

        private List<Difference> FindCustomerContactChanges(List<SalesCustomerContact> _new, List<SalesCustomerContact> _old)
        {
            var contactChanges = new List<Difference>();
            CompareLogic compObjects = new CompareLogic();
            compObjects.Config.MaxDifferences = 200;
            compObjects.Config.IgnoreCollectionOrder = true;
            compObjects.Config.CompareChildren = false;
            compObjects.Config.IgnoreObjectDisposedException = true;
            compObjects.Config.IgnoreUnknownObjectTypes = true;
            int currUCount = _new != null ? _new.Count : 0;
            int prevUCount = _old != null ? _old.Count : 0;
            int Umaxcount = (currUCount > prevUCount) ? currUCount : prevUCount;
            for (int i = 0; i < Umaxcount; i++)
            {
                SalesCustomerContact prev = null;
                SalesCustomerContact curr = null;
                try
                {
                    prev = _old[i];
                }
                catch (Exception)
                {
                    prev = new SalesCustomerContact();
                }
                try
                {
                    curr = _new[i];
                }
                catch (Exception)
                {
                    curr = new SalesCustomerContact();
                }
                List<Difference> lineDiffs = compObjects.Compare(prev, curr).Differences;
                lineDiffs.RemoveAll(x => x.Object1Value == "(null)" && x.Object2Value == "");
                contactChanges.AddRange(lineDiffs);
            }
            return contactChanges;
        }

        private List<Difference> FindCustomerAddressChanges(List<SalesCustomerAddress> _new, List<SalesCustomerAddress> _old)
        {
            var addressChanges = new List<Difference>();
            CompareLogic compObjects = new CompareLogic();
            compObjects.Config.MaxDifferences = 200;
            compObjects.Config.IgnoreCollectionOrder = true;
            compObjects.Config.CompareChildren = false;
            compObjects.Config.IgnoreObjectDisposedException = true;
            compObjects.Config.IgnoreUnknownObjectTypes = true;
            int currUCount = _new != null ? _new.Count : 0;
            int prevUCount = _old != null ? _old.Count : 0;
            int Umaxcount = (currUCount > prevUCount) ? currUCount : prevUCount;
            for (int i = 0; i < Umaxcount; i++)
            {
                SalesCustomerAddress prevUser = null;
                SalesCustomerAddress currUser = null;
                try
                {
                    prevUser = _old[i];
                }
                catch (Exception)
                {
                    prevUser = new SalesCustomerAddress();
                }
                try
                {
                    currUser = _new[i];
                }
                catch (Exception)
                {
                    currUser = new SalesCustomerAddress();
                }
                List<Difference> lineDiffs = compObjects.Compare(prevUser, currUser).Differences;
                lineDiffs.RemoveAll(x => x.PropertyName == "CustomerAddressId");
                addressChanges.AddRange(lineDiffs);
            }
            return addressChanges;
        }

        private List<Difference> FindInvoiceDifference(object OldObject, object NewObject)
        {
            List<Difference> mainChanges = new List<Difference>();
            try
            {

                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;
                try
                {
                    var Changes = compObjects.Compare(OldObject, NewObject);
                    mainChanges = Changes.Differences;
                }
                catch (Exception)
                {

                }
                mainChanges.RemoveAll(x => x.PropertyName == "PriceSubTotal");
                mainChanges.RemoveAll(x => x.PropertyName == "TotalbefTaxSubTotal");
                mainChanges.RemoveAll(x => x.PropertyName == "UpdatedBy");
            }
            catch (Exception)
            {

            }
            return mainChanges;
        }

        private List<Difference> FindPOCItemsDifference(Object OldObject, Object NewObject)
        {
            CompareLogic compObjects = new CompareLogic();
            compObjects.Config.MaxDifferences = 99;
            compObjects.Config.IgnoreCollectionOrder = true;
            Type type = NewObject.GetType();
            ComparisonResult compResult = compObjects.Compare(OldObject, NewObject);
            compResult.Differences.RemoveAll(x => x.ParentPropertyName == "Attachments");
            compResult.Differences.RemoveAll(x => x.PropertyName == "Attachments");
            compResult.Differences.RemoveAll(x => x.PropertyName == "UpdatedBy");
            compResult.Differences.RemoveAll(x => x.PropertyName == "AccrualCode");
            compResult.Differences.RemoveAll(x => x.PropertyName == "TaxId");
            compResult.Differences.RemoveAll(x => x.PropertyName == "TaxGroupName");
            compResult.Differences.RemoveAll(x => x.PropertyName == "TaxGroupId");
            compResult.Differences.RemoveAll(x => x.ParentPropertyName == "ContractPurchaseOrderItems");
            compResult.Differences.RemoveAll(x => x.PropertyName == "TenureToDisplay");
            ContractPurchaseOrder oldPO = (ContractPurchaseOrder)OldObject;
            ContractPurchaseOrder newPO = (ContractPurchaseOrder)NewObject;
            List<ContractPurchaseOrderItems> oldItems = (List<ContractPurchaseOrderItems>)oldPO.ContractPurchaseOrderItems;
            List<ContractPurchaseOrderItems> newItems = (List<ContractPurchaseOrderItems>)newPO.ContractPurchaseOrderItems;
            ComparisonResult items = compObjects.Compare(oldItems, newItems);
            items.Differences.RemoveAll(x => x.PropertyName.IndexOf("ExpenseCategoryId") > -1);
            items.Differences.RemoveAll(x => x.PropertyName.IndexOf("AccountCodeId") > -1);
            items.Differences.RemoveAll(x => x.PropertyName.IndexOf("AccountCodeCategoryId") > -1);
            items.Differences.RemoveAll(x => x.PropertyName.IndexOf("Expense.Description") > -1);
            items.Differences.RemoveAll(x => x.PropertyName.IndexOf("Expense.Code") > -1);
            foreach (var item in items.Differences)
            {
                if (item.ParentPropertyName.Contains("["))
                {
                    item.PropertyName = item.PropertyName.Replace(item.ParentPropertyName, "").Replace(".", " ").Trim();
                }
            }
            compResult.Differences.AddRange(items.Differences);
            return compResult.Differences;
        }

        private List<Difference> FindCNDifference(Object OldObject, Object NewObject)
        {
            List<Difference> mainChanges = new List<Difference>();
            try
            {

                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;
                try
                {
                    var Changes = compObjects.Compare(OldObject, NewObject);
                    mainChanges = Changes.Differences;
                }
                catch (Exception)
                {
                    CreditNote _oldCN = (CreditNote)OldObject;
                    CreditNote _newCN = (CreditNote)NewObject;
                    var Changes = compObjects.Compare(_oldCN, _newCN);
                    mainChanges = Changes.Differences;
                }
                mainChanges.RemoveAll(x => x.PropertyName == "CreationDate");
                mainChanges.RemoveAll(x => x.PropertyName == "SupplierShortName");
                mainChanges.RemoveAll(x => x.PropertyName == "CanVoid");
                mainChanges.RemoveAll(x => x.PropertyName == "ButtonPreferences");
                mainChanges.RemoveAll(x => x.PropertyName == "ReasonsToCancel");
                mainChanges.RemoveAll(x => x.PropertyName == "WorkFlowComments");
                mainChanges.RemoveAll(x => x.PropertyName == "CreatedDate");
                mainChanges.RemoveAll(x => x.ParentPropertyName == "Attachments");
                mainChanges.RemoveAll(x => x.PropertyName == "Attachments");
                mainChanges.RemoveAll(x => x.PropertyName == "UpdatedBy");
                mainChanges.RemoveAll(x => x.PropertyName == "SupplierType");
                mainChanges.RemoveAll(x => x.PropertyName == "Action");
                mainChanges.RemoveAll(x => x.PropertyName == "CurrentApproverUserId");
                mainChanges.RemoveAll(x => x.PropertyName == "WorkFlowStatus");
                mainChanges.RemoveAll(x => x.PropertyName == "files");
                mainChanges.RemoveAll(x => x.PropertyName == "CreditNoteItemsToDelete");
                mainChanges.RemoveAll(x => x.ParentPropertyName == "GetServiceMasters");
                mainChanges.RemoveAll(x => x.PropertyName == "GetServiceMasters");
                mainChanges.RemoveAll(x => x.ParentPropertyName == "GetItemMasters");
                mainChanges.RemoveAll(x => x.PropertyName == "GetItemMasters");
                mainChanges.RemoveAll(x => x.PropertyName == "UpdatedDate");
                mainChanges.RemoveAll(x => x.ParentPropertyName == "CreditNoteLineItems");
                mainChanges.RemoveAll(x => x.PropertyName == "InvoiceOSAmount");
                mainChanges.RemoveAll(x => x.PropertyName == "POCode");
                mainChanges.RemoveAll(x => x.PropertyName == "SubTotalDiscount");
                CreditNote oldCN = (CreditNote)OldObject;
                CreditNote newCN = (CreditNote)NewObject;
                List<Difference> diffs = new List<Difference>();
                if (oldCN.InvoiceId == 0)
                {
                    int currBasicCount = newCN.CreditNoteLineItems != null ? newCN.CreditNoteLineItems.Count : 0;
                    int prevBasicCount = oldCN.CreditNoteLineItems != null ? oldCN.CreditNoteLineItems.Count : 0;
                    int basicmaxcount = (currBasicCount > prevBasicCount) ? currBasicCount : prevBasicCount;
                    for (int i = 0; i < basicmaxcount; i++)
                    {
                        CreditNoteLineItems prevPurchaser = null;
                        CreditNoteLineItems currPurchaser = null;
                        try
                        {
                            prevPurchaser = oldCN.CreditNoteLineItems[i];
                        }
                        catch (Exception)
                        {
                            prevPurchaser = new CreditNoteLineItems();
                        }
                        try
                        {
                            currPurchaser = newCN.CreditNoteLineItems[i];
                        }
                        catch (Exception)
                        {
                            currPurchaser = new CreditNoteLineItems();
                        }
                        List<Difference> lineDiffs = compObjects.Compare(prevPurchaser, currPurchaser).Differences;
                        lineDiffs.RemoveAll(x => x.PropertyName == "CNId");
                        lineDiffs.RemoveAll(x => x.PropertyName == "CNDetailsId");
                        lineDiffs.RemoveAll(x => x.PropertyName == "IsDeleted");
                        lineDiffs.RemoveAll(x => x.PropertyName == "GSTAmount");
                        lineDiffs.RemoveAll(x => x.PropertyName == "GSTAdjustment");
                        lineDiffs.RemoveAll(x => x.PropertyName == "OriginalDiscount");
                        lineDiffs.RemoveAll(x => x.PropertyName == "ItemMasterId");
                        lineDiffs.RemoveAll(x => x.PropertyName == "TypeId");
                        lineDiffs.RemoveAll(x => x.PropertyName == "AccountCodeId");
                        lineDiffs.RemoveAll(x => x.PropertyName == "Item");
                        lineDiffs.RemoveAll(x => x.PropertyName == "AccountCodeName");
                        lineDiffs.RemoveAll(x => x.PropertyName == "Code");
                        lineDiffs.RemoveAll(x => x.PropertyName == "ItemType");
                        lineDiffs.RemoveAll(x => x.PropertyName == "ItemName");
                        lineDiffs.RemoveAll(x => x.PropertyName == "Service");
                        mainChanges.AddRange(lineDiffs);
                    }
                }
                foreach (var change in mainChanges)
                {
                    switch (change.PropertyName)
                    {
                        case "SubTotal":
                            int poTypeId = Convert.ToInt32(oldCN.CreditNoteLineItems.FirstOrDefault().POTypeId);
                            change.PropertyName = (poTypeId == 5 || poTypeId == 6) ? "TotalBeforeTax" : "TotalBeforeDiscount";
                            break;
                        case "SubItemGSTAdjustment":
                            change.PropertyName = "TaxAdjustment";
                            break;
                        case "TotalGSTAmount":
                            change.PropertyName = "TaxAmount";
                            break;
                        default:
                            break;
                    }
                }
            }
            catch (Exception)
            {

            }
            return mainChanges;
        }

        private List<Difference> FindSalesInvoiceDifference(Object OldObject, Object NewObject)
        {
            List<Difference> mainChanges = new List<Difference>();
            try
            {

                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;

                SalesInvoice _oldSI = (SalesInvoice)OldObject;
                SalesInvoice _newSI = (SalesInvoice)NewObject;
                mainChanges = compObjects.Compare(_oldSI, _newSI).Differences;
                mainChanges.RemoveAll(x => x.PropertyName == "QuotationId");
                mainChanges.RemoveAll(x => x.PropertyName == "SchedulerInfo");
                var bankChanges = compObjects.Compare(_oldSI.Bank, _newSI.Bank).Differences;
                bankChanges.RemoveAll(x => x.PropertyName != "BankName" && x.PropertyName != "BankACNo");
                mainChanges.AddRange(bankChanges);

                var scheduleChanges = compObjects.Compare(_oldSI.Scheduler == null ? new SchedulerNo() : _oldSI.Scheduler, _newSI.Scheduler).Differences;
                scheduleChanges.RemoveAll(x => x.PropertyName != "SchedulerNumber");
                mainChanges.AddRange(scheduleChanges);

                var taxGroupChanges = compObjects.Compare(_oldSI.TaxGroup, _newSI.TaxGroup).Differences;
                taxGroupChanges.RemoveAll(x => x.PropertyName != "TaxGroupName");
                mainChanges.AddRange(taxGroupChanges);

                List<Difference> diffs = new List<Difference>();

                int currBasicCount = _newSI.LineItems != null ? _newSI.LineItems.Count : 0;
                int prevBasicCount = _oldSI.LineItems != null ? _oldSI.LineItems.Count : 0;
                int basicmaxcount = (currBasicCount > prevBasicCount) ? currBasicCount : prevBasicCount;
                for (int i = 0; i < basicmaxcount; i++)
                {
                    SalesInvoiceItem prevItem = null;
                    SalesInvoiceItem currItem = null;
                    try
                    {
                        prevItem = _oldSI.LineItems[i];
                    }
                    catch (Exception)
                    {
                        prevItem = new SalesInvoiceItem();
                    }
                    try
                    {
                        currItem = _newSI.LineItems[i];
                    }
                    catch (Exception)
                    {
                        currItem = new SalesInvoiceItem();
                    }
                    List<Difference> lineDiffs = compObjects.Compare(prevItem, currItem).Differences;
                    lineDiffs.RemoveAll(x => x.PropertyName.IndexOf("Id") > 0);
                    mainChanges.AddRange(lineDiffs);
                }
            }
            catch (Exception)
            {

            }
            return mainChanges;
        }

        private List<Difference> FindSalesQuotationDifference(Object OldObject, Object NewObject)
        {
            List<Difference> mainChanges = new List<Difference>();
            try
            {

                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;

                SalesQuotation _oldSI = (SalesQuotation)OldObject;
                SalesQuotation _newSI = (SalesQuotation)NewObject;
                mainChanges = compObjects.Compare(_oldSI, _newSI).Differences;
                var supplierChanges = compObjects.Compare(_oldSI.Supplier == null ? new Supplier(): _oldSI.Supplier, _newSI.Supplier).Differences;
                supplierChanges.RemoveAll(x => x.PropertyName != "SupplierName");
                mainChanges.AddRange(supplierChanges);
                //List<Difference> diffs = new List<Difference>();
                //int currBasicCount = _newSI.LineItems != null ? _newSI.LineItems.Count : 0;
                //int prevBasicCount = _oldSI.LineItems != null ? _oldSI.LineItems.Count : 0;
                //int basicmaxcount = (currBasicCount > prevBasicCount) ? currBasicCount : prevBasicCount;
                //for (int i = 0; i < basicmaxcount; i++)
                //{
                //    SalesQuotationItem prevItem = null;
                //    SalesQuotationItem currItem = null;
                //    try
                //    {
                //        prevItem = _oldSI.LineItems[i];
                //    }
                //    catch (Exception)
                //    {
                //        prevItem = new SalesQuotationItem();
                //    }
                //    try
                //    {
                //        currItem = _newSI.LineItems[i];
                //    }
                //    catch (Exception)
                //    {
                //        currItem = new SalesQuotationItem();
                //    }
                //    List<Difference> lineDiffs = compObjects.Compare(prevItem, currItem).Differences;
                //    lineDiffs.RemoveAll(x => x.PropertyName.IndexOf("Id") > 0);
                //    mainChanges.AddRange(lineDiffs);
                //}
            }
            catch (Exception)
            {

            }
            return mainChanges;
        }

        public void LogSaveDocument(AuditLogData logData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Created by {0} on {1}", logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, dbTransaction, dbConnection);
            logData.Message = string.Format("Saved as draft by {0} on {1}", logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, dbTransaction, dbConnection);
        }

        public void LogSubmitDocument(AuditLogData logData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Submitted by {0} on {1}", logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, dbTransaction, dbConnection);
        }

        public void LogCancelDraftDocument(ProjectDocument document)
        {
            string cancelDraftLog = string.Empty;
            UserProfile user = userProfileRepository.GetUserById(document.UserId);
            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
            DateTime logTime = DateTime.Now;
            cancelDraftLog = string.Format("Cancelled draft by {0} on {1}", UserName, logTime);
            AuditLog.Info(Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId), "CancelDraft", document.UserId.ToString(), document.DocumentId.ToString(), "CancelDraft", cancelDraftLog, document.CompanyId);
        }

        public void LogVoidDocument(ProjectDocument document)
        {
            string voidlog = string.Empty;
            UserProfile user = userProfileRepository.GetUserById(document.UserId);
            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
            DateTime logTime = DateTime.Now;
            voidlog = string.Format("Voided by {0} on {1}", UserName, logTime);
            AuditLog.Info(Enum.GetName(typeof(WorkFlowProcessTypes), document.DocumentTypeId), "Void", document.UserId.ToString(), document.DocumentId.ToString(), "Void", voidlog, document.CompanyId);
        }

        public void LogSendForApprovalDocument(AuditLogData logData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            try
            {
                UserProfile user = userProfileRepository.GetUserById(logData.Logger);
                logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
                logData.LogDate = DateTime.Now;
                logData.Message = string.Format("Sent to {0} for {1} on {2}", logData.LoggedInUser, logData.LoggerRole == "V" ? "Verification " : "Approval", logData.LogDate);
                this.PostAuditLog(logData, dbTransaction, dbConnection);
            }
            catch (Exception ex)
            {
                //ErrorLog.Log("GenericController", "Send Document", "LogSendForApprovalDocument", ex.ToString());
            }

        }

        public void LogApproveDocument(AuditLogData logData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("{0} by {1} on {2}", logData.LoggerRole == "V" ? "Verified" : "Approved", logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, dbTransaction, dbConnection);
        }

        public void LogRejectDocument(AuditLogData logData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("{0} by {1} on {2}", logData.Action, logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, dbTransaction, dbConnection);
            logData.Message = string.Format("Reason for {0} is : {1}", logData.Action == WorkFlowStatus.Rejected.ToString() ? "rejection" : "disagreement", logData.Remarks);
            this.PostAuditLog(logData, dbTransaction, dbConnection);
        }

        public void LogSendForClarificationDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("{0} Return for Clarification by {1} on {2}. {3}", logData.PageName, logData.LoggedInUser, logData.LogDate, logData.Remarks);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void LogReplyForClarificationDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Reply sent for clarification for the {0} by {1} on {2}. {3}", logData.PageName, logData.LoggedInUser, logData.LogDate, logData.Remarks);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void LogCancelApprovalDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            string reason =
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Cancelled Approval by {0} on {1}. {2} ", logData.LoggedInUser, logData.LogDate, logData.Remarks);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void _LogCancelDraftDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Cancelled Draft by {0} on {1} ", logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void LogVerifyDocument(object _old, object _new, WorkFlowApproval documentData, IDbTransaction dbTransaction, IDbConnection dbConnection)
        {
            string changes = CheckAuditTrail(_old, _new, documentData.ProcessId, null);
            UserProfile user = userProfileRepository.GetUserById(documentData.UserId);
            string message = "Document {0} by {1} {2} on {3}. {4}";
            AuditLogData logData = new AuditLogData
            {
                DocumentId = documentData.DocumentId,
                PageName = Enum.GetName(typeof(WorkFlowProcessTypes), documentData.ProcessId),
                Logger = documentData.UserId,
                Action = "SUBMIT",
                CompanyId = documentData.CompanyId,
                Message = string.Format(message, "Verified", user.FirstName, user.LastName, DateTime.Now, string.IsNullOrEmpty(changes) ? "" : "Below are the changes,"),
                Changes = changes
            };
            this.PostAuditLog(logData, dbTransaction, dbConnection);
        }

        public void _LogVoidDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Voided by {0} on {1}. {2}", logData.LoggedInUser, logData.LogDate, logData.Remarks);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void LogExportDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Exported by {0} on {1}. {2}", logData.LoggedInUser, logData.LogDate, logData.Remarks);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        internal void LogImportDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format("Imported by {0} on {1}", logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void UpdateLogInParentDocument(AuditLogData logData, IDbTransaction transaction, IDbConnection m_dbconnection)
        {
            UserProfile user = userProfileRepository.GetUserById(logData.Logger);
            logData.LoggedInUser = string.Format("{0} {1}", user.FirstName, user.LastName);
            logData.LogDate = DateTime.Now;
            logData.Message = string.Format(logData.Message, logData.DocumentCode, logData.LoggedInUser, logData.LogDate);
            this.PostAuditLog(logData, transaction, m_dbconnection);
        }

        public void LogSupplierReverify(Supplier _old, Supplier _new)
        {
            var globalChanges = GetGlobalSupplierChanges(_old, _new);
            var comapnyChanges = GetCurrentCompanySupplierChanges(_old, _new);
            Difference pCode = globalChanges.Where(x => x.PropertyName == "PaymentTermCode").FirstOrDefault();
            Difference _ServiceName = globalChanges.Where(x => x.PropertyName == "ServiceName").FirstOrDefault();
            if (pCode != null)
                comapnyChanges.Add(pCode);
            if (_ServiceName != null)
                comapnyChanges.Add(_ServiceName);
            globalChanges.RemoveAll(x => x.PropertyName == "PaymentTermCode");
            globalChanges.RemoveAll(x => x.PropertyName == "ServiceName");
            var mergedChanges = comapnyChanges.Concat(globalChanges).ToList();
            mergedChanges.RemoveAll(x => x.PropertyName == "SupplierId");
            mergedChanges.RemoveAll(x => x.PropertyName == "SupplierCompanyId");
            UserProfile user = userProfileRepository.GetUserById(_new.UpdatedBy);
            this.m_dbconnection.Open();
            var supplierCompanies = this.m_dbconnection.Query<SupplierAttachedCompanies>("select SupplierId,CompanyId from SupplierCompanyDetails where SupplierId =@SupplierId and IsDetached=0", new
            {
                SupplierId = _new.SupplierId
            }).ToList();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                if (globalChanges.Count > 0)
                {
                    foreach (var item in supplierCompanies)
                    {
                        string changes = string.Empty;
                        if (comapnyChanges.Count > 0 && item.CompanyId == Convert.ToInt32(_new.SupplierCompanyDetails.CompanyId))
                        {
                            changes = GetJsonChanges(mergedChanges);
                        }
                        else
                        {
                            changes = GetJsonChanges(globalChanges);
                        }
                        AuditLogData logData = new AuditLogData
                        {
                            DocumentId = _new.SupplierId,
                            PageName = WorkFlowProcessTypes.Supplier.ToString(),
                            Logger = _new.UpdatedBy,
                            Action = "REVERIFY",
                            CompanyId = item.CompanyId,
                            Message = $"Supplier reverified by {user.FirstName} {user.LastName} on {DateTime.Now}. Below are the changes,",
                            Changes = changes
                        };
                        this.PostAuditLog(logData, transactionObj, this.m_dbconnection);
                    }
                }
                if (globalChanges.Count == 0 && comapnyChanges.Count > 0)
                {
                    AuditLogData logData = new AuditLogData
                    {
                        DocumentId = _new.SupplierId,
                        PageName = WorkFlowProcessTypes.Supplier.ToString(),
                        Logger = _new.UpdatedBy,
                        Action = "REVERIFY",
                        CompanyId = Convert.ToInt32(_new.SupplierCompanyDetails.CompanyId),
                        Message = $"Supplier reverified by {user.FirstName} {user.LastName} on {DateTime.Now}. Below are the changes,",
                        Changes = GetJsonChanges(comapnyChanges)
                    };
                    this.PostAuditLog(logData, transactionObj, this.m_dbconnection);
                }
                transactionObj.Commit();
            }

        }

        private List<Difference> GetCurrentCompanySupplierChanges(Supplier _old, Supplier _new)
        {
            List<Difference> diffs = new List<Difference>();
            try
            {
                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;
                int currCPCount = _new.ContactPersons != null ? _new.ContactPersons.Count : 0;
                int prevCPCount = _old.ContactPersons != null ? _old.ContactPersons.Count : 0;
                int CPmaxcount = (currCPCount > prevCPCount) ? currCPCount : prevCPCount;
                for (int i = 0; i < CPmaxcount; i++)
                {
                    SupplierContactPerson prevPurchaser = null;
                    SupplierContactPerson currPurchaser = null;
                    try
                    {
                        prevPurchaser = _old.ContactPersons[i];
                    }
                    catch (Exception)
                    {
                        prevPurchaser = new SupplierContactPerson();
                    }
                    try
                    {
                        currPurchaser = _new.ContactPersons[i];
                    }
                    catch (Exception)
                    {
                        currPurchaser = new SupplierContactPerson();
                    }
                    List<Difference> lineDiffs = compObjects.Compare(prevPurchaser, currPurchaser).Differences;
                    lineDiffs.RemoveAll(x => x.PropertyName == "ContactPersonId");

                    diffs.AddRange(lineDiffs);
                }

                int currSSCCount = _new.SubCodes != null ? _new.SubCodes.Count : 0;
                int prevSSCCount = _old.SubCodes != null ? _old.SubCodes.Count : 0;
                int SSCmaxcount = (currSSCCount > prevSSCCount) ? currSSCCount : prevSSCCount;
                for (int i = 0; i < SSCmaxcount; i++)
                {
                    SupplierSubCode prevSSC = null;
                    SupplierSubCode currSSC = null;
                    try
                    {
                        prevSSC = _old.SubCodes[i];
                    }
                    catch (Exception)
                    {
                        prevSSC = new SupplierSubCode();
                    }
                    try
                    {
                        currSSC = _new.SubCodes[i];
                    }
                    catch (Exception)
                    {
                        currSSC = new SupplierSubCode();
                    }
                    List<Difference> lineDiffs = compObjects.Compare(prevSSC, currSSC).Differences;
                    lineDiffs.RemoveAll(x => x.PropertyName == "SubCodeId");
                    lineDiffs.RemoveAll(x => x.PropertyName == "SupplierId");
                    lineDiffs.RemoveAll(x => x.PropertyName == "CompanyId");
                    lineDiffs.RemoveAll(x => x.PropertyName == "UpdatedBy");
                    lineDiffs.RemoveAll(x => x.PropertyName == "UpdatedDate");
                    lineDiffs.RemoveAll(x => x.PropertyName == "CreatedBy");
                    lineDiffs.RemoveAll(x => x.PropertyName == "CreatedDate");
                    lineDiffs.RemoveAll(x => x.PropertyName == "IsSubCodeRequired");
                    diffs.AddRange(lineDiffs);
                }
                var _oldSCDetails = _old.SupplierCompanyDetails;
                var _newSCDetails = _new.SupplierCompanyDetails;
                List<Difference> scDiffs = compObjects.Compare(_oldSCDetails, _newSCDetails).Differences;
                scDiffs.RemoveAll(x => x.PropertyName == "TaxId");
                scDiffs.RemoveAll(x => x.PropertyName == "CurrencyId");
                scDiffs.RemoveAll(x => x.PropertyName == "CurrencySymbol");
                scDiffs.RemoveAll(x => x.PropertyName == "PaymentTermsId");
                diffs.AddRange(scDiffs);
            }
            catch (Exception ex)
            {
                throw;
            }
            return diffs;
        }

        private List<Difference> GetGlobalSupplierChanges(Supplier _old, Supplier _new)
        {
            List<Difference> diffs = new List<Difference>();
            try
            {
                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;
                diffs = compObjects.Compare(_old, _new).Differences;
                diffs.RemoveAll(x => x.PropertyName == "SupplierId");
                diffs.RemoveAll(x => x.PropertyName == "CompanyId");
                diffs.RemoveAll(x => x.PropertyName == "GSTStatusId");
                diffs.RemoveAll(x => x.PropertyName == "CreatedDate");
                diffs.RemoveAll(x => x.PropertyName == "ParentSupplierId");
                diffs.RemoveAll(x => x.PropertyName == "PreviousSupplierName");
                diffs.RemoveAll(x => x.PropertyName == "UpdatedDate");
                diffs.RemoveAll(x => x.PropertyName == "UpdatedBy");
                diffs.RemoveAll(x => x.PropertyName == "AttachedBy");
                diffs.RemoveAll(x => x.PropertyName == "SupplierCategoryID");
                diffs.RemoveAll(x => x.PropertyName == "IsActive");
                diffs.RemoveAll(x => x.PropertyName == "BillingCountryId");
                diffs.RemoveAll(x => x.PropertyName == "IsSubCodeRequired");
                diffs.RemoveAll(x => x.PropertyName == "PaymentTermsId");
            }
            catch (Exception ex)
            {
                throw;
            }
            return diffs;
        }

        private string GetJsonChanges(List<Difference> changes)
        {
            List<AuditDelta> DeltaList = new List<AuditDelta>();
            foreach (var change in changes)
            {
                AuditDelta delta = new AuditDelta();
                delta.FieldName = change.PropertyName.ToString();
                if (delta.FieldName == "GlDescription")
                {
                    delta.FieldName = "GLCode";
                }
                try
                {
                    switch (change.Object1TypeName)
                    {
                        case "Decimal":
                            delta.ValueBefore = $"{ Convert.ToDecimal(change.Object1Value).ToString("0,0.00", CultureInfo.InvariantCulture)}";
                            delta.ValueAfter = $"{ Convert.ToDecimal(change.Object2Value).ToString("0,0.00", CultureInfo.InvariantCulture)}";
                            break;
                        case "DateTime":
                            delta.ValueBefore = Convert.ToDateTime(change.Object1Value).ToString("dd-MM-yyyy");
                            delta.ValueAfter = Convert.ToDateTime(change.Object2Value).ToString("dd-MM-yyyy");
                            break;
                        default:
                            delta.ValueBefore = StringOperations.IsNullOrEmpty(change.Object1Value) ? string.Empty : change.Object1Value;
                            delta.ValueAfter = StringOperations.IsNullOrEmpty(change.Object2Value) ? string.Empty : change.Object2Value;
                            break;
                    }
                }
                catch (Exception)
                {
                    delta.ValueBefore = string.Empty;
                    delta.ValueAfter = string.Empty;
                }

                DeltaList.Add(delta);
            }
            return changes.Count > 0 ? JsonConvert.SerializeObject(DeltaList) : null;
        }

        public string CheckMasterAuditTrail(Object OldObject, Object NewObject, MasterProcessTypes processTypeId)
        {
            string changes = string.Empty;
            try
            {
                List<Difference> diffs = new List<Difference>();
                switch (processTypeId)
                {
                    case MasterProcessTypes.CustomerType:
                    case MasterProcessTypes.CreditTerm:
                    case MasterProcessTypes.Location:
                    case MasterProcessTypes.BankMaster:
                    case MasterProcessTypes.TenantType:
                    case MasterProcessTypes.TaxGroup:
                    case MasterProcessTypes.TaxMaster:
                    case MasterProcessTypes.TaxType:
                        diffs = FindMasterProcessDifference(OldObject, NewObject);
                        break;
                    case MasterProcessTypes.EmailConfiguration:
                        diffs = FindEmailConfigurationDifference(OldObject, NewObject);
                        break;
                    default:
                        break;
                }
                changes = diffs.Count > 0 ? GetJsonChanges(diffs) : null;
            }
            catch (Exception)
            {

            }
            return changes;
        }

        private List<Difference> FindEmailConfigurationDifference(object oldObject, object newObject)
        {
            EmailConfiguration _old = (EmailConfiguration)oldObject;
            EmailConfiguration _new = (EmailConfiguration)newObject;
            var diffs = this.FindMasterProcessDifference(_old, _new);
            CompareLogic compObjects = new CompareLogic();
            compObjects.Config.MaxDifferences = 200;
            compObjects.Config.IgnoreCollectionOrder = true;
            compObjects.Config.CompareChildren = false;
            compObjects.Config.IgnoreObjectDisposedException = true;
            compObjects.Config.IgnoreUnknownObjectTypes = true;
            int currUCount = _new.Users != null ? _new.Users.Count : 0;
            int prevUCount = _old.Users != null ? _old.Users.Count : 0;
            int Umaxcount = (currUCount > prevUCount) ? currUCount : prevUCount;
            for (int i = 0; i < Umaxcount; i++)
            {
                UserEmail prevUser = null;
                UserEmail currUser = null;
                try
                {
                    prevUser = _old.Users[i];
                }
                catch (Exception)
                {
                    prevUser = new UserEmail();
                }
                try
                {
                    currUser = _new.Users[i];
                }
                catch (Exception)
                {
                    currUser = new UserEmail();
                }
                List<Difference> lineDiffs = compObjects.Compare(prevUser, currUser).Differences;
                lineDiffs.RemoveAll(x => x.PropertyName == "UserId");
                lineDiffs.RemoveAll(x => x.PropertyName == "Email");
                diffs.AddRange(lineDiffs);
            }
            EmailConfigProcess oldProcess = _old.ProcessType;
            EmailConfigProcess newProcess = _new.ProcessType;
            diffs.AddRange(FindMasterProcessDifference(oldProcess, newProcess));
            Locations oldDept = _old.Department;
            Locations newDept = _new.Department;
            diffs.AddRange(FindMasterProcessDifference(oldDept, newDept));
            return diffs;
        }

        private List<Difference> FindMasterProcessDifference(object oldObject, object newObject)
        {
            List<Difference> mainChanges = new List<Difference>();
            try
            {
                CompareLogic compObjects = new CompareLogic();
                compObjects.Config.MaxDifferences = 200;
                compObjects.Config.IgnoreCollectionOrder = true;
                compObjects.Config.CompareChildren = false;
                compObjects.Config.IgnoreObjectDisposedException = true;
                compObjects.Config.IgnoreUnknownObjectTypes = true;
                var Changes = compObjects.Compare(oldObject, newObject);
                mainChanges = Changes.Differences;
                mainChanges.RemoveAll(x => x.PropertyName == "CustomerTypeId");
                mainChanges.RemoveAll(x => x.PropertyName == "BankMasterId");
                mainChanges.RemoveAll(x => x.PropertyName == "CreatedBy");
                mainChanges.RemoveAll(x => x.PropertyName == "CreatedDate");
                mainChanges.RemoveAll(x => x.PropertyName == "UpdatedBy");
                mainChanges.RemoveAll(x => x.PropertyName == "UpdatedDate");
                mainChanges.RemoveAll(x => x.PropertyName == "ProcessId");
                mainChanges.RemoveAll(x => x.PropertyName == "LocationID");
                mainChanges.RemoveAll(x => x.PropertyName == "IsActive");
            }
            catch (Exception)
            {

            }
            return mainChanges;
        }
    }
}
