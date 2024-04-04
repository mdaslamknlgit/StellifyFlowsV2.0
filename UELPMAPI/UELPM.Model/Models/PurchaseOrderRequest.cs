using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class PurchaseOrderRequest
    {
        public int CompanyId { get; set; }
        public int LocationId { get; set; }
        public string Location { get; set; }
        public int RequestedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public string RequestedEmail { get; set; }
        public string Designation { get; set; }
        public decimal Discount { get; set; }
        public decimal ShippingCharges { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal SubTotal { get; set; }
        public int CostOfServiceId { get; set; }
        public string CostOfService { get; set; }
        public int POTypeId { get; set; }
        public DateTime ExpectedDeliveryDate { get; set; }
        public string VendorReferences { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public string PurchaseOrderRequestCode { get; set; }
        public int PurchaseOrderRequestId { get; set; }
        public int StatusId { get; set; }
        public string Instructions { get; set; }
        public string Justifications { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsGstRequired { get; set; }
        public int PaymentTermId { get; set; }
        public string PaymentTerms { get; set; }
        public int DeliveryTermId { get; set; }
        public string DeliveryTerm { get; set; }
        public string DeliveryAddress { get; set; }
        public string Reasons { get; set; }
        public List<int> PurchaseOrderRequestItemsToDelete { get; set; }
        public List<int> PurchaseOrderRequestVendorItemsToDelete { get; set; }
        public string PurchaseOrderType { get; set; }
        public string PurchaseOrderStatusText { get; set; }
        public int PurchaseOrderStatusId { get; set; }
        public List<PurchaseOrderRequestItems> PurchaseOrderRequestItems { get; set; }
        public List<PurchaseOrderRequestVendorItems> PurchaseOrderRequestVendorItems { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TotalTax { get; set; }
        public HttpFileCollection files { get; set; }
        public HttpFileCollectionBase Quotationfiles { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<Attachments> AttachmentsDelete { get; set; }
        public List<QuotationAttachments> QuotationAttachment { get; set; }
        public List<QuotationAttachments> QuotationAttachmentDelete { get; set; }
        public Suppliers Supplier { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string QuotationRequestRemarks;
        public bool IsDocumentApproved;
        public string DraftCode;
    }

    public class PurchaseOrderRequestList
    {
        public string PurchaseOrderRequestCode { get; set; }
        public int PurchaseOrderRequestId { get; set; }
        public string SupplierName { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedDate { get;set; }
        public string UserName { get; set; }
        public int POTypeId { get; set; }
        public string DraftCode;
        public bool IsDocumentApproved;
    }
    public class PurchaseOrderRequestDisplayResult
    {
        public List<PurchaseOrderRequestList> PurchaseOrdersRequest { get; set; }
        public int TotalRecords { get; set; }
       
    }

    public class PORSearch : GridDisplayInput
    {
        public string PORCodeFilter { get; set; }
        public string SupplierNameFilter { get; set; }
        public int? WorkFlowStatusId { get; set; }
        public int? POTypeId { get; set; } 
        public int PurchaseOrderReqId { get; set; }
    }

    public class PurchaseOrderRequestVendorItems
    {        
        public int QuotationId { get; set; }
        public Suppliers QuotationSupplier { get; set; }
        public decimal QuotatedAmount { get; set; }
        public bool IsSelected { get; set; }
        
    }

    public class PurchaseOrderRequestItems
    {
        public int PurchaseOrderRequestItemId { get; set; }
        public string ItemMasterCode { get; set; }
        public decimal ItemQty { get; set; }
        public int? MeasurementUnitID { get; set; }
        public string MeasurementUnitCode { get; set; }
        public decimal Unitprice { get; set; }
        public string ItemDescription { get; set; }
        public GetItemMasters Item { get; set; }
        public GetAssets Asset { get; set; }
        //public ExpenseMaster Expense { get; set; }
        public AccountCode Expense { get; set; }
        public AccountCode Service { get; set; }
        public string AccountCode { get; set; }
        public int TaxID { get; set; }
        public string TaxName { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal Discount { get; set; }
        public bool? IsDetailed { get; set; }
        public decimal ItemTotalPrice { get; set; }
        public int TypeId { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public string AccountCodeName { get; set; }
    }

    public class PurchaseOrderRequestDelete
    {
        public int ModifiedBy { get; set; }
        public int PurchaseOrderRequestId { get; set; }
    }

    public class PurchaseOrderRequestTypes
    {
        public int PurchaseOrderRequestTypeId { get; set; }
        public string PurchaseOrderRequestType { get; set; }
    }

    public class PurchaseOrderRequestApproval
    {
        public int PurchaseOrderRequestId { get; set; }
        public string PurchaseOrderRequestCode { get; set; }
        public int PurchaseOrderRequestUserId { get; set; }
        public int UserId { get; set; }
        public int ApproverUserId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string Remarks { get; set; }
        public int ProcessId { get; set; }
        public int CompanyId { get; set; } 
    }

    public class PurchaseOrderQuotationDetails
    {
        public int QuotationId { get; set; }
        public string SupplierName { get; set; }
        public string QuotatedAmount { get; set; }
    }

    //Custom classes for PDF
    public class PurchaseOrderItemDetails
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

    public class SalesOrderItemDetails
    {
        public string ItemId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string ItemDescription { get; set; }
        public string MeasurementUnitCode { get; set; }
        public int ItemQty { get; set; }
        public string Unitprice { get; set; }
        public string Discount { get; set; }
        public string GstType { get; set; }
        public string GstAmount { get; set; }
        public string Total { get; set; }
        public bool IsUOM { get; set; }
    }


    public class FixedAssetPurchaseOrderDetails
    {
        public string ItemId { get; set; }
        public string Type { get; set; }
        public string AssetCode { get; set; }
        public decimal AssetQty { get; set; }
        public string AssetDescription { get; set; }
        public string AssetName { get; set; } 
        public string Warranty { get; set; }
        public string Unitprice { get; set; }            
        public string TaxTotal { get; set; }
        public string Discount { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public string Total { get; set; }
        public bool IsDetailed { get; set; }
    }

    public class FixedContractPurchaseOrderDetails
    {
        public string ItemId { get; set; }
        public string Description { get; set; }
        public string ExpenseCategory { get; set; }
        public string Amount { get; set; }
        public string PaymentValuation { get; set; }    
        public string Category { get; set; }
    }

    public class GoodsReceivedNotesDetails
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemDescription { get; set; }
        public string MeasurementUnitCode { get; set; }      
        public decimal OpenQty { get; set; }
        public decimal TotalReceivedQty { get; set; }
        public decimal GRNQty { get; set; }
        public decimal OriginalQty { get; set; }
    }

    public class CreditNoteItemDetails
    {
        public int InvoiceItemId { get; set; }
        public string ItemDescription { get; set; }
        public string ItemQty { get; set; }
        public string Unitprice { get; set; }
        public string UpdatedPrice { get; set; }
        public string TaxName { get; set; }
        public string TaxAmount { get; set; }
        public string TaxTotal { get; set; }
        public string ItemTotalPrice { get; set; }
    }

    public class InvoiceDetails
    {
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public string PayableAmount { get; set; }   
        public string OverPayment { get; set; }        
    }

    //Custom classes for PDF
    public class FixedAssetDetails
    {
        public string ItemId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string ItemDescription { get; set; }
        public string MeasurementUnitCode { get; set; }
        public int ItemQty { get; set; }
        public string Unitprice { get; set; }
        public string Discount { get; set; }
        public string GstType { get; set; }
        public string GstAmount { get; set; }
        public string Total { get; set; }
    }

    public class PurchaseOrderRequestResult
    {
        public List<PurchaseOrderItemDetails> ItemDetails { get; set; }
        public List<PurchaseOrderQuotationDetails> QuotationDetails { get; set; }
        public List<GoodsReceivedNotesDetails> GRNNotesDetails { get; set; }
        public List<CreditNoteItemDetails> CreditNoteItems { get; set; }
        public List<InvoiceDetails> InvoiceDetails { get; set; }
        public List<FixedAssetPurchaseOrderDetails> FixedAssetDetails { get; set; }
        public List<FixedContractPurchaseOrderDetails> FixedContractDetails{ get; set; }
        public List<SalesOrderItemDetails> SalesOrderItemDetails { get; set; }
    }

    public class WorkFlowReAssignmentResult
    {
        public IEnumerable<Roles> UserRoles { get; set; }
        public IEnumerable<WorkflowItems> WorkflowItems { get; set; }
        public IEnumerable<Documents> Documents { get; set; }      
    }
}
