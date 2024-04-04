using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class CreditNote
    {
        public int CreditNoteId { get; set; }
        public int CNDetailsId { get; set; }
        public int CompanyId { get; set; }
        public int InvoiceId { get; set; }
        public int SupplierId { get; set; }
        public int SubCodeId { get; set; }
        public int Supplier { get; set; }
        public string SupplierName { get; set; }
        public string SupplierShortName { get; set; }
        public string DocumentCode { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Total { get; set; }
        public string Reasons { get; set; }
        public decimal? Discount { get; set; }
        public CreditNoteLineItems CreditNoteLineItem { get; set; }
        public List<CreditNoteLineItems> CreditNoteLineItems { get; set; }
        public List<GetItemMasters> GetItemMasters { get; set; }
        public List<AccountCode> GetServiceMasters { get; set; }
        public List<int> CreditNoteItemsToDelete { get; set; }
        public List<Attachments> Attachments { get; set; }
        public HttpFileCollection files { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public DateTime? SupplierCreditNoteDate { get; set; }
        public string SupplierCreditNoteNo { get; set; }
        public string SupplierCreditNoteInvoiceNo { get; set; }
        public decimal? InvoiceOSAmount { get; set; }
        public decimal? InvoiceTotalAmount { get; set; }
        public decimal? Adjustment { get; set; }
        public int CurrentApproverUserId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string InvoiceCode { get; set; }
        public string POCode { get; set; }
        public int LocationID { get; set; }
        public string Name { get; set; }
        public decimal? GSTAdjustment { get; set; }
        public decimal? TotalAdjustment { get; set; }
        public decimal? SubItemGSTAdjustment { get; set; }
        public decimal? NetTotal { get; set; }
        public decimal? CreditNoteTotal { get; set; }
        public decimal? CNTotalValue { get; set; }
        public decimal? TotalGSTAmount { get; set; }
        public decimal? SubTotalDiscount { get; set; }
        public string SchedulerNo { get; set; }
        public string Action { get; set; }
        public string ReasonToVoid { get; set; }
        public IEnumerable<AuditLogData> AuditLogData { get; set; }
        public string SupplierAddress { get; set; }
        public string Code { get; set; }
        public string SupplierCode { get; set; }
        public string CreditNoteRequestor { get; set; }
        public int? SupplierType { get; set; }
        public int? CurrencyType { get; set; }
        public DateTime? SupplierCreditNoteInvoiceDate { get; set; }
        public DateTime? CreationDate { get; set; }
        public string CreditNoteCode { get; set; }
        public string RequestedByUserName { get; set; }
        public string CurrencySymbol { get; set; }
        public decimal InvoiceTotal { get; set; }
        public decimal? OutStandingAmount { get; set; }
        public decimal? RoundAdjustment { get; set; }
        public object ProcessId { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string[] ReasonsToCancel { get; set; }
        public string ReasonsToReject { get; set; }
        public string ReasonsToVoid { get; set; }
        public ButtonPreferences ButtonPreferences { get; set; }
        public bool? CanVoid { get; set; }
        public string SchedulerNumber { get; set; }
    }


    public class CreditNoteLineItems
    {
        public int? CNId { get; set; }
        public int? CNDetailsId { get; set; }
        public int? InvoiceItemId { get; set; }
        public string ItemDescription { get; set; }
        public decimal ItemQty { get; set; }
        public decimal? Unitprice { get; set; }
        public int TaxID { get; set; }
        //public int? TaxGroupId { get; set; }
        public decimal? GSTAmount { get; set; }
        public decimal? GSTAdjustment { get; set; }
        public decimal ReturnQty { get; set; }
        public decimal? DecreaseInUnitPrice { get; set; }
        public decimal? ReturnValue { get; set; }
        public decimal? CNTotalValue { get; set; }
        //public decimal? UpdatedQty { get; set; }
        //public decimal? UpdatedPrice { get; set; }
        public decimal Discount { get; set; }
        public decimal? OriginalDiscount { get; set; }
        public string CPONumber { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string InvoiceCode { get; set; }
        public decimal? Tax { get; set; }
        public decimal TaxAmount { get; set; }
        public int TypeId { get; set; }
        public Item Item { get; set; }
        public AccountCode Service { get; set; }
        public string ItemName { get; set; }
        public int? ItemMasterId { get; set; }
        public int? AccountCodeId { get; set; }
        public string AccountCodeName { get; set; }
        public string ItemType { get; set; }
        public string AccountType { get; set; }
        public int? POTypeId { get; set; }
        public string GlDescription { get; set; }
        public bool? IsDeleted { get; set; }
        public string Code { get; set; }
        public decimal? OriginaltemQty { get; set; }
        public decimal? OriginalUnitprice { get; set; }
        public decimal? TotalbefTax { get; set; }
        public string TaxGroupName { get; set; }
        public int? TaxGroupId { get; set; }
    }

    public class CreditNoteData
    {
        public int DocumentId { get; set; }
        public string DocumentCode { get; set; }
        public string InvoiceDocumentCode { get; set; }
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public DateTime CreatedDate { get; set; }
        public string SupplierCreditNoteInvoiceNo { get; set; }
        public string SupplierCreditNoteNo { get; set; }
        public decimal InvoiceTotalAmount { get; set; }
        public decimal InvoiceOSAmount { get; set; }
        public decimal CreditNoteTotal { get; set; }
        public string WorkFlowStatus { get; set; }
    }

    public class CreditNotesDisplayResult
    {
        public List<CreditNote> CreditNotes { get; set; }
        public int TotalRecords { get; set; }
    }

    public class CreditNoteDelete
    {
        public int ModifiedBy { get; set; }
        public int CreditNoteId { get; set; }
    }

    public class CreditNoteFilterDisplayInput : GridDisplayInput
    {
        public string CreditNoteCodeFilter { get; set; }
        public string SupplierNameFilter { get; set; }
        public string InvoiceCodeFilter { get; set; }
    }

    public class CreditNoteSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int CreditNoteId { get; set; }
        //public int FromLocationId { get; set; }
        public int RequestFromUserId { get; set; }
    }
    public class CNValiDate
    {
        public string SupplierCreditNoteNo { get; set; }
        public int CreditNoteId { get; set; }
    }
}
