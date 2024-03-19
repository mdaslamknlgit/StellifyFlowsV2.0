using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class QuotationRequest
    {
        public int QuotationRequestId { get; set; }
        public string QuotationRequestCode { get; set; }
        public int PurchaseOrderRequestId { get; set; }
        public int CompanyId { get; set; }      
        public List<QuotationRequestSupplier> QuotationRequestSupplier { get; set; }
        public List<QuotationVendorItems> QuotationVendorItems { get; set; }
        public List<PurchaseOrderRequestItems> PurchaseOrderRequestItems { get; set; }
        public List<int> deletedQuotationSupplierItems { get; set; }
        public List<int> QuotationVendorItemsToDelete { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<QuotationAttachments> QuotationAttachment { get; set; }
        public List<QuotationAttachments> QuotationAttachmentDelete { get; set; }
        public List<QuotationAttachments> QuotationAttachmentUpdateRowId { get; set; }        
        public HttpFileCollection files { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Suppliers Supplier { get; set; }
        public PurchaseOrderRequest PurchaseOrderRequest { get; set; }
        public string Remarks { get; set; }
        public int WorkFlowStatusId { get; set; }
        public bool IsDocumentApproved { get; set; }
        public string DraftCode { get; set; }
    }

    public class QuotationRequestSupplier
    {
        public int QuotationRequestSupplierId { get; set; }
        public string BillingTelephone { get; set; }
        public string SupplierEmail { get; set; }
        public Suppliers QuotationSupplier { get; set; }
        public bool IsMailSent { get; set; }
    }

    public class QuotationRequestList
    {
        public int QuotationRequestId { get; set; }
        public string QuotationRequestCode { get; set; }
        public int PurchaseOrderRequestId { get; set; }
        public string SupplierName { get; set; }
        public string PurchaseOrderRequestCode { get; set; }
        public bool IsDocumentApproved { get; set; }
        public string DraftCode { get; set; }
    }

    public class QuotationVendorItems
    {
        public int QuotationId { get; set; }
        public Suppliers QuotationSupplier { get; set; }
        public decimal? QuotatedAmount { get; set; }
        public string BillingTelephone { get; set; }
        public string SupplierEmail { get; set; }
        public bool IsMailSent { get; set; }
        public bool IsSelected { get; set; }
    }

    public class QuotationRequestDisplayResult
    {
        public List<QuotationRequestList> QuotationRequest { get; set; }
        public int TotalRecords { get; set; }
    }
    public class QuotationRequestDelete
    {
        public int ModifiedBy { get; set; }
        public int QuotationRequestId { get; set; }
    }

    public class QuotationFilterDisplayInput:GridDisplayInput
    {
        public string QuotationRequestFilter { get; set; }
        public string SupplierNameFilter { get; set; }
        public string PurchaseOrderRequestCodeFilter { get; set; }
    }

}
