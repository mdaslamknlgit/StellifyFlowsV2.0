using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class GoodsReceivedNotes
    {
        public int GoodsReceivedNoteId { get; set; }
        public string GRNCode { get; set; }
        public int PurchaseOrderId { get; set; }
        public int CompanyId { get; set; }
        public string PurchaseOrderCode { get; set; }
        public int POTypeId { get; set; }
        public string PurchaseOrderType { get; set; }
        public string SupplierDoNumber { get; set; }
        public string GRNRemarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string SupplierAddress { get; set; }
        public string DeliveryAddress { get; set; }
        public string RequestedByUserName { get; set; }
        public string Designation { get; set; }
        public int LocationID { get; set; }
        public string Location { get; set; }
        public Supplier Supplier { get; set; }
        public string CostOfService { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public string StatusText { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public bool HasPendingInvoice { get; set; }
        public List<AssetDetails> Assets { get; set; }
        public List<GoodsReceivedNotesItems> ItemsList { get; set; }
        public List<GRNQtyTotal> gRNQtyTotal { get; set; }
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<Attachments> DOAttachments { get; set; }
        public int StatusId { get; set; }
        public bool IsReturn { get; set; }
        public string DraftCode { get; set; }
        public int IsDocumentApproved { get; set; }
        public int Status { get; set; }
        public string ReasonstoVoid { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int SupplierId { get; set; }
        public string PONO { get; set; }
    }

    public class GoodsReceivedNotesItems
    {
       public int GoodsReceivedNoteId { get; set; }
       public int GRNItemId { get; set; }
       public GetItemMasters Item { get; set; }
       public AccountCode Service { get; set; }      
       public decimal OriginalQty { get; set; }
	   public decimal TotalReceivedQty { get; set; }
	   public decimal OpenQty { get; set; }
	   public decimal GRNQty { get; set; }
       public string ItemDescription { get; set; }
       public string MeasurementUnitCode { get; set; }
       public int RecordId { get; set; }
       public decimal UnitPrice { get; set; }
	   public decimal Discount { get; set; }
	   public int TaxId { get; set; }
	   public decimal TaxAmount { get; set; }
       public decimal PurchaseValue { get; set; }
       public int? ItemMasterId { get; set; }
       public int? TypeId { get; set; }
       public string ItemType { get; set; }
       public int AccountCodeCategoryId { get; set; }
       public int? Category { get; set; }
    }

    public class GoodsReceivedNotesDelete
    {
        public int ModifiedBy { get; set; }
        public int GoodsReceivedNoteId { get; set; }
        public int PurchaseOrderId { get; set; }
        public int POTypeId { get; set; }
    }

    public class GoodsReceivedNotesDisplayResult
    {
        public List<GoodsReceivedNotes> GoodsReceivedNotes { get; set; }
        public int TotalRecords { get; set; }
        public List<DraftGRN> graftGRNlist { get; set; }

    }

    public class DraftGRN
    {
        public int DraftCount { get; set; }
        public int GoodsReceivedNoteId { get; set; }
    }

    public class GRNVoid
    {
        public int UserId { get; set; }
        public string Reasons { get; set; }
        public int GoodsReceivedNoteId { get; set; }
        public int PurchaseOrderId { get; set; }
        public int POTypeId { get; set; }
        public List<GoodsReceivedNotesItems> ItemsList { get; set; }
        public string GRNCode { get; set; }
        public int StatusId { get; set; }


    }

    public class GRNFilterDisplayInput : GridDisplayInput
    {
        public string GRNCodeFilter { get; set; }
        public string DoNumberFilter { get; set; }
        public string PoNumberFilter { get; set; }
        public string StatusFilter { get; set; }
        public DateTime? FromDateFilter { get; set; }
        public DateTime? ToDateFilter { get; set; }
        public string SupplierNameFilter { get; set; }
        public string PoTypeIdFilter { get; set; }
        public string DepartmentFilter { get; set; }
        public string SupplierCodeFilter { get; set; }
    }

    public class GRNQtyTotal
    {
        public decimal TotalReceivedQty { get; set; }
        public decimal OpenQty { get; set; }
        public int RecordId { get; set; }
    }

}
