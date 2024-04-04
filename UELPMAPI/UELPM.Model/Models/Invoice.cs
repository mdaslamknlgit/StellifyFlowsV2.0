using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class Invoice
    {
        public int InvoiceId { get; set; }
        public string InvoiceCode { get; set; }
        public decimal OutStandingAmount { get; set; }
        public string PurchaseOrderId { get; set; }
        public string PurchaseOrderCode { get; set; }
        public string RequestorEmailID { get; set; }
        public string RequestorContactNo { get; set; }
        public int POTypeId { get; set; }
        public string PurchaseOrderType { get; set; }
        public int CompanyId { get; set; }
        public int LocationId { get; set; }
        public string Location { get; set; }
        public int RequestedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public string SupplierAddress { get; set; }
        public string Designation { get; set; }
        public decimal Discount { get; set; }
        public decimal ShippingCharges { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal SubTotal { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedByUserName { get; set; }
        public bool IsGstRequired { get; set; }
        public int PaymentTermId { get; set; }
        public string PaymentTerms { get; set; }
        public string PaymentTermsCode { get; set; }
        public string DeliveryAddress { get; set; }
        public List<int> InvoiceItemsToDelete { get; set; }
        public string InvoiceType { get; set; }
        public string InvoiceText { get; set; }
        public List<InvoiceItems> InvoiceItems { get; set; }
        public int TaxId { get; set; }
        public string TaxName { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TotalTax { get; set; }
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public Suppliers Supplier { get; set; }
        public string InvoiceStatus { get; set; }
        public decimal Adjustment { get; set; }
        public decimal NetTotal { get; set; }
        public string InvoiceDescription { get; set; }
        public decimal GSTAdjustment { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public string SupplierRefNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string InvoiceDateString { get; set; }
        public DateTime DueDate { get; set; }
        public string DueDateString { get; set; }
        public int NoOfDays { get; set; }
        public string ReasonstoVoid { get; set; }
        public string DraftCode { get; set; }
        public GoodsReceivedNotes[] SelectedGRNs { get; set; }
        public PurchaseOrderList[] SelectedPOs { get; set; }
        public ContractPurchaseOrder[] SelectedCPOs { get; set; }
        public List<ContractPurchaseOrder> JVs { get; set; }
        //public ContractPurchaseOrder[] CPOSelected { get; set; }  -- Anuj code
        public ContractPurchaseOrderItems[] CPOSelected { get; set; }
        public string TaxClass { get; set; }
        public string TaxGroupName { get; set; }
        public string CompanyName { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public string ReasonsToReject { get; set; }
        public string InvoiceStatusText { get; set; }
        public string SupplierName { get; set; }
        public string ApproverEmail { get; set; }
        public string AccountSetId { get; set; }
        public string SubCodeDescription { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public decimal Margin { get; set; }
        public decimal InvoiceLimit { get; set; }
        public decimal CPOAmount { get; set; }
        public int InvoiceTypeId { get; set; }
        public decimal APOAmount { get; set; }
        public decimal IPOAmount { get; set; }
        public decimal EXPOAmount { get; set; }
        public decimal SubTotalAmount { get; set; }
        public string Subcode { get; set; }
        // public List<AssetSubCategory> AssetSubCategory { get; set; }
        public string GlDescription { get; set; }
        public int? SupplierSubCodeId { get; set; }
        public SupplierSubCode SupplierSubCode { get; set; }
        public string RemarksInvoice { get; set; }
        public decimal OldTotalAmount { get; set; }
        public string GRNCode { get; set; }
        public decimal PriceSubTotal { get; set; }
        public decimal TotalbefTaxSubTotal { get; set; }
        public IEnumerable<AuditLogData> AuditLogData { get; set; }
        public InvoicePayments InvoicePayments { get; set; }
        public string SchedulerId { get; set; }
        public string SchedulerNumber { get; set; }
        public IEnumerable<CreditNoteData> CreditNotes { get; set; }
        public bool CanVoid { get; set; }
        public int? UpdatedBy { get; set; }
    }

    public class InvoiceList
    {
        public string InvoiceCode { get; set; }
        public string DraftCode { get; set; }
        public int InvoiceId { get; set; }
        public string SupplierName { get; set; }
        public int InvoiceTypeId { get; set; }
        public decimal TotalAmount { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int POTypeId { get; set; }
    }

    public class InvoiceDisplayResult
    {
        public List<InvoiceList> Invoice { get; set; }
        public int TotalRecords { get; set; }
    }

    public class InvoiceSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int InvoiceId { get; set; }
        public int RequestFromUserId { get; set; }
    }


    public class InvoiceItems
    {
        public int InvoiceItemId { get; set; }
        public decimal ItemQty { get; set; }
        public int MeasurementUnitID { get; set; }
        public string MeasurementUnitCode { get; set; }
        public decimal Unitprice { get; set; }
        public string ItemDescription { get; set; }
        public GetItemMasters Item { get; set; }
        public AccountCode Service { get; set; }
        public string AccountCode { get; set; }
        public int TaxID { get; set; }
        public int TaxGroupId { get; set; }
        public string TaxGroupName { get; set; }
        public string TaxName { get; set; }
        public decimal TaxAmount { get; set; }
        public string TaxAuthority { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal Discount { get; set; }
        public decimal ItemTotalPrice { get; set; }
        public decimal CurrentTaxTotal { get; set; }
        public decimal CurrentTaxAmount { get; set; }
        public string ItemType { get; set; }
        public string CPONumber { get; set; }
        public int CPOID { get; set; }
        public int TypeId { get; set; }
        public int InvoiceId { get; set; }
        public string ServiceText { get; set; }
        public string TaxClass { get; set; }
        public string Code { get; set; }
        public string AccountType { get; set; }
        public string AccountCodeName { get; set; }
        public int? POTypeId { get; set; }
        public int? PurchaseOrderId { get; set; }
        public string InvoiceCode { get; set; }
        public int? WorkFlowStatusId { get; set; }
        public string PurchaseOrderCode { get; set; }
        public string GlDescription { get; set; }
        public int? InvoiceTypeId { get; set; }
        public decimal? Totalprice { get; set; }
        public decimal? TotalbefTax { get; set; }

    }

    //Custom classes for PDF
    public class SupplierInvoiceItemDetails
    {
        public string ItemId { get; set; }
        public string Type { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string ItemDescription { get; set; }
        public string MeasurementUnitCode { get; set; }
        public decimal ItemQty { get; set; }
        public string Unitprice { get; set; }
        public string Discount { get; set; }
        public string GstType { get; set; }
        public string GstAmount { get; set; }
        public string Total { get; set; }
        public bool IsUOM { get; set; }
        public string AccountCodeName { get; set; }
    }

    public class InvoiceDelete
    {
        public int ModifiedBy { get; set; }
        public int InvoiceId { get; set; }
    }

    public class InvoiceTypes
    {
        public int InvoiceTypeId { get; set; }
        public string InvoiceType { get; set; }
    }

    public class InvoiceCount
    {
        public int Count { get; set; }
    }

    public class InvoiceVoid
    {
        public int UserId { get; set; }
        public string Reasons { get; set; }
        public string InvoiceCode { get; set; }
        public int InvoiceId { get; set; }
        public int POTypeId { get; set; }
        public int StatusId { get; set; }
        public int CompanyId { get; set; }
        public GoodsReceivedNotes[] SelectedGRNs { get; set; }
        public ContractPurchaseOrder[] SelectedCPOs { get; set; }
        public PurchaseOrderList[] SelectedPOs { get; set; }

    }
    public class InvoiceToExport
    {
        public int UserId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int InvoiceId { get; set; }
        public int CurrentUserId { get; set; }
        public int ProcessId { get; set; }
    }

    public class InvoiceSubTotal
    {
        public string PurchaseOrderId { get; set; }
        public int CompanyId { get; set; }
        public int InvoiceId { get; set; }
        public int POTypeId { get; set; }
    }
    public class SINVFilterDisplayInput : GridDisplayInput
    {
        public string SINVCodeFilter { get; set; }
        public string SupplierNameFilter { get; set; }
        public string PoNumberFilter { get; set; }
        public string StatusFilter { get; set; }
        public DateTime? FromDateFilter { get; set; }
        public DateTime? ToDateFilter { get; set; }
        public string PoTypeIdFilter { get; set; }
    }

    public class SupplierInvoiceRequestResult
    {
        public List<SupplierInvoiceItemDetails> ItemDetails { get; set; }
        public string PaymentDetailsHTML { get; set; }
        public List<AuditLogData> AuditLogData { get; set; }
        //public List<PurchaseOrderQuotationDetails> QuotationDetails { get; set; }
        //public List<GoodsReceivedNotesDetails> GRNNotesDetails { get; set; }
        //public List<CreditNoteItemDetails> CreditNoteItems { get; set; }
        //public List<InvoiceDetails> InvoiceDetails { get; set; }
        //public List<FixedAssetPurchaseOrderDetails> FixedAssetDetails { get; set; }
        //public List<FixedContractPurchaseOrderDetails> FixedContractDetails { get; set; }
        //public List<SalesOrderItemDetails> SalesOrderItemDetails { get; set; }
    }
    public class PaymentDetails
    {
        public int PaymentID { get; set; }
        public string SupplierInvoice { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string ChequeNo { get; set; }
        public string ChequeDate { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string PaymentAmount { get; set; }
        public string DocumentNo { get; set; }
        public bool Status { get; set; }
        public string BatchNo { get; set; }
        public int ImportedBy { get; set; }
        public string ImportedByUserName { get; set; }

    }
    public class InvoiceData
    {
        public int DocumentId { get; set; }
        public int ProcessId { get; set; }
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }
        public string SupplierName { get; set; }
        public string DocumentCode { get; set; }
        public string SupplierInvoiceRefNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public int WorkflowStatusId { get; set; }
        public decimal BalanceAmount { get; set; }
    }
}
