using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using UELPM.Model.Models;
using System.Net.Http;

namespace UELPM.Model.Models
{

    public class PurchaseOrder
    {
        public int CompanyId { get; set; }
        public int LocationId { get; set; }
        public string Location { get; set; }
        public int RequestedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public string RequestorEmailID { get; set; }
        public string Designation { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public bool IsDocumentApproved { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public decimal Discount { get; set; }
        public decimal ShippingCharges { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
        public string AmountinWords { get; set; }
        public decimal SubTotal { get; set; }
        public int CostOfServiceId { get; set; }
        public string CostOfService { get; set; }
        public int POTypeId { get; set; }
        public DateTime ExpectedDeliveryDate { get; set; }
        public DateTime ContractStartDate { get; set; }
        public string VendorReferences { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public string PurchaseOrderCode { get; set; }
        public string DraftCode { get; set; }
        public int PurchaseOrderId { get; set; }
        public string Instructions { get; set; }
        public string Justifications { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedByUserName { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsGstRequired { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public int PaymentTermId { get; set; }
        public string PaymentTerms { get; set; }
        public int DeliveryTermId { get; set; }
        public string DeliveryTerm { get; set; }
        public string Reasons { get; set; }
        public string DeliveryAddress { get; set; }
        public List<int> PurchaseOrderItemsToDelete { get; set; }
        public string PurchaseOrderType { get; set; }
        public string PurchaseOrderStatusText { get; set; }
        public int PurchaseOrderStatusId { get; set; }
        public List<PurchaseOrderItems> PurchaseOrderItems { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TotalTax { get; set; }
        public decimal TaxTotal { get; set; }
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public Suppliers Supplier { get; set; }
        public bool? IsApprovalPage { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string ReasonstoVoid { get; set; }
        public string ReasonsToReject { get; set; }
        public List<SPOQuotationItem> SPOQuotationItem { get; set; }
        public List<int> SPOQuotationItemToDelete { get; set; }
        public List<SPOQuotationAttachments> SPOQuotationAttachment { get; set; }
        public List<SPOQuotationAttachments> SPOQuotationAttachmentDelete { get; set; }
        public List<SPOQuotationAttachments> SPOQuotationAttachmentUpdateRowId { get; set; }
        public string RemarksQuotation { get; set; }
        public int? SupplierSubCodeId { get; set; }
        public SupplierSubCode SupplierSubCode { get; set; }
        public string SupplierAddress { get; set; }
        public List<SupplierContactPerson> ContactPersons { get; set; }
        public Decimal InvoiceLimit { get; set; }
        public string ContactPersonName { get; set; }
        public string ContactNo { get; set; }
        public string ContactEmail { get; set; }
        public int CurrentWorkFlowStatusId { get; set; }
        public int TerminateStatusId { get; set; }
        public string RequestorContactNo { get; set; }
        public decimal PriceSubTotal { get; set; }
        public decimal DiscountSubTotal { get; set; }
        public decimal TotalbefTaxSubTotal { get; set; }
        public string InventoryRequestId { get; set; }
    }

    public class SPOQuotationItem
    {
        public int QuotationId { get; set; }
        public int RowIndex { get; set; }
        public decimal QuotationAmount { get; set; }
        public string QuotationRemarks { get; set; }
        public string SupplierEmail { get; set; }
        public string Supplier { get; set; }
        public int POTypeId { get; set; }
        //public Suppliers Supplier { get; set; }
    }

    public class SPOQuotationAttachments
    {
        public int SPOQuotationId { get; set; }
        public int PurchaseOrderId { get; set; }
        public int QuotationId { get; set; }
        public string FileName { get; set; }
        public int RowId { get; set; }
        public int POTypeId { get; set; }
    }

    public class PurchaseOrderList
    {
        public string PurchaseOrderCode { get; set; }
        public string DraftCode { get; set; }
        public int PurchaseOrderId { get; set; }
        public int POTypeId { get; set; }
        public string SupplierName { get; set; }
        public int SupplierId { get; set; }
        public string FirstName { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int PurchaseOrderStatusId { get; set; }
        public string PurchaseOrderStatusText { get; set; }
        public bool IsDocumentApproved { get; set; }

    }

    public class PurchaseOrderDisplayResult
    {
        public List<PurchaseOrderList> PurchaseOrders { get; set; }
        public int TotalRecords { get; set; }

        public string QueryStr { get; set; }
    }


    public class PurchaseOrderItems
    {
        public int PurchaseOrderItemId { get; set; }
        public decimal ItemQty { get; set; }
        public int MeasurementUnitID { get; set; }
        public int TypeId { get; set; }
        public string ItemType { get; set; }
        public string MeasurementUnitCode { get; set; }
        public decimal Unitprice { get; set; }
        public string ItemDescription { get; set; }
        public GetItemMasters Item { get; set; }
        public AccountCode Service { get; set; }
        public string AccountCode { get; set; }
        public int TaxID { get; set; }
        public int TaxGroupId { get; set; }
        public string TaxName { get; set; }
        public string TaxAuthority { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal Discount { get; set; }        
        // public bool IsGstBeforeDiscount { get; set; }
        public decimal ItemTotalPrice { get; set; }
        public string ServiceText { get; set; }
        public string PurchaseOrderCode { get; set; }
        public decimal Totalprice { get; set; }
        public decimal TotalbefTax { get; set; }


    }

    public class PurchaseOrderDelete
    {
        public int ModifiedBy { get; set; }
        public int PurchaseOrderId { get; set; }
    }

    public class PurchaseOrderTypes
    {
        public int PurchaseOrderTypeId { get; set; }
        public string PurchaseOrderType { get; set; }
    }

    public class CostOfServiceTypes
    {
        public int CostOfServiceId { get; set; }
        public string CostOfService { get; set; }
    }

    public class PurchaseOrderSearch : GridDisplayInput
    {
        public int SupplierId { get; set; }
        public int? WorkFlowStatusId { get; set; }
        public int POTypeId { get; set; }
        public int WorkFlowProcessId { get; set; }
        public int PurchaseOrderId { get; set; }
        public string PoCode { get; set; }
        public string SupplierName { get; set; }
        public string From { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool IsMasterPo { get; set; }
        public bool IsPOC { get; set; }
        public bool IsSelectAll { get; set; }
        public int CPOID { get; set; }
    }

    public class PurchaseOrderApproval
    {
        public int PurchaseOrderId { get; set; }
        public string PurchaseOrderCode { get; set; }
        public int PurchaseOrderRequestUserId { get; set; }
        public int UserId { get; set; }
        public int ApproverUserId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int ProcessId { get; set; }
        public string Remarks { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? BillingFrequencyId { get; set; }
        public DateTime? PODate { get; set; }
        public int CompanyId { get; set; }
        public bool IsVoid { get; set; }
        public bool? IsAccept { get; set; }
        public int? WorkFlowStatusPTA { get; set; }
        public string RemarksQuotation { get; set; }

    }

    public class PurchaseOrderVoid
    {
        public int PurchaseOrderId { get; set; }
        public int ProcessId { get; set; }
        public int UserId { get; set; }
        public int PoTypeId { get; set; }
        public string PurchaseOrderCode { get; set; }
        public string Reasons { get; set; }
        public DateTime TerminationDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal TotalContractSum { get; set; }
        public int CreatedBy { get; set; }
        public string CPONumber { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int CompanyId { get; set; }
        public int LocationID { get; set; }
        public Boolean IsMasterCPO { get; set; }
    }
}
