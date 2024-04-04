using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class ExpensesPurchaseOrder
    {
        public string ExpensesPurchaseOrderCode { get; set; }
        public int ExpensesPurchaseOrderId { get; set; }
        public int CompanyId { get; set; }
        public int LocationId { get; set; }
        public string Location { get; set; }
        public int RequestedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public string Designation { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public decimal Discount { get; set; }
        public decimal ShippingCharges { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
        public string AmountInWords { get; set; }
        public decimal SubTotal { get; set; }
        public int CostOfServiceId { get; set; }
        public string CostOfService { get; set; }
        public int POTypeId { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public int StatusId { get; set; }
        public string Instructions { get; set; }
        public string Justifications { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsGstRequired { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public int PaymentTermId { get; set; }
        public string PaymentTerms { get; set; }
        public int DeliveryTermId { get; set; }
        public string DeliveryTerm { get; set; }
        public string Reason { get; set; }
        public string DeliveryAddress { get; set; }
        public int[] PurchaseOrderItemsToDelete { get; set; }
        public string PurchaseOrderType { get; set; }
        public string PurchaseOrderStatusText { get; set; }
        public int PurchaseOrderStatusId { get; set; }
        public List<ExpensesPurchaseOrderItems> PurchaseOrderItems { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TotalTax { get; set; } 
        public decimal TaxTotal { get; set; }
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public bool IsApprovalPage { get; set; } 
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public int ProcessId { get; set; }
        public Suppliers Supplier { get; set; }
        public string Reasons { get; set; }
        public string ReasonstoVoid { get; set; }
        public string DraftCode { get; set; }
        public bool IsDocumentApproved { get; set; }
        public string ReasonsToReject { get; set; }
        public string VendorReferences { get; set; }
        public DateTime ExpectedDeliveryDate { get; set; }
        public int NoOfDays { get; set; }
        public List<EXPOQuotationItem> EXPOQuotationItem { get; set; }
        public List<int> EXPOQuotationItemToDelete { get; set; }
        public List<EXPOQuotationAttachments> EXPOQuotationAttachment { get; set; }
        public List<EXPOQuotationAttachments> EXPOQuotationAttachmentDelete { get; set; }
        public List<EXPOQuotationAttachments> EXPOQuotationAttachmentUpdateRowId { get; set; }
        public string RemarksQuotation { get; set; }
        public int? SupplierSubCodeId { get; set; }
        public SupplierSubCode SupplierSubCode { get; set; }
        public List<SupplierContactPerson> ContactPersons { get; set; }
        public string RequestorEmailID { get; set; }
        public Decimal InvoiceLimit { get; set; }
        public string ContactPersonName { get; set; }
        public string ContactNo { get; set; }
        public string ContactEmail { get; set; }
        public int CurrentWorkFlowStatusId { get; set; }
        public string RequestorContactNo { get; set; }
        public decimal PriceSubTotal { get; set; }
        public decimal DiscountSubTotal { get; set; }
        public decimal TotalbefTaxSubTotal { get; set; }
        public string InventoryRequestId { get; set; }
        public string SupplierAddress { get; set; }
    }

    public  class ExpensesPurchaseOrderItems
    {
       public int ExpensesPOItemId { get; set; }
       public int AccountCodeCategoryId { get; set; }
       public decimal ExpensesQty { get; set; }
       public int MeasurementUnitID { get; set; }
       public string MeasurementUnitCode { get; set; }
       public decimal Unitprice { get; set; }
       public string ExpensesDescription { get; set; }
       //public ExpenseMaster Expense { get; set; }
       public AccountCode Expense { get; set; }
       public string AccountCode { get; set; }
       public int TaxID { get; set; }
       public string TaxName { get; set; }
       public int TaxGroupId { get; set; }     
       public string TaxAuthority { get; set; }
       public decimal TaxAmount { get; set; }
       public decimal TaxTotal { get; set; }
       public decimal Discount { get; set; }
       public decimal ItemTotalPrice { get; set; }
       public string ServiceText { get; set; }
       public string AccountCodeName { get; set; }
       public string PurchaseOrderCode { get; set; }
       public decimal Totalprice { get; set; }
       public decimal TotalbefTax { get; set; }
    }

    public class ExpensesPurchaseOrderDisplayResult
    {
       public List<ExpensesPurchaseOrder> PurchaseOrders { get; set; }
       public int TotalRecords { get; set; }
    }

    public class EXPOQuotationItem
    {
        public int QuotationId { get; set; }
        public int RowIndex { get; set; }
        public decimal QuotationAmount { get; set; }
        public string QuotationRemarks { get; set; }
        public string SupplierEmail { get; set; }
        public int POTypeId { get; set; }
        public string Supplier { get; set; }
        //public Suppliers Supplier { get; set; }
    }

    public class EXPOQuotationAttachments
    {
        public int SPOQuotationId { get; set; }
        public int PurchaseOrderId { get; set; }
        public int QuotationId { get; set; }
        public string FileName { get; set; }
        public int RowId { get; set; }
        public int POTypeId { get; set; }
    }



}