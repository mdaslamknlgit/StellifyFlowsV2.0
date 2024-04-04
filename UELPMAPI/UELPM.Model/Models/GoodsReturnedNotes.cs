using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class GoodsReturnedNotes
    {
        public int GoodsReturnNoteId { get; set; }
        public int GoodsReceivedNoteId { get; set; }
        public string GRTCode { get; set; }        
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public string WorkFlowStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int CompanyId { get; set; }
        public GRNS GRN { get; set; }
        public int PurchaseOrderid { get; set; }
        public string PurchaseOrderCode { get; set; }
        public int POTypeId { get; set; }
        public string PurchaseOrderType { get; set; }
        public string SupplierDoNumber { get; set; }
        public string GRNRemarks { get; set; }
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
        public List<AssetDetails> Assets { get; set; }
        public List<GoodsReturnedNotesItems> ItemsList { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string DraftCode { get; set; }
        public int IsDocumentApproved { get; set; }
        public int Status { get; set; }


    }

    public class GoodsReturnedNotesItems
    {
        public int GoodsReturnNoteId { get; set; }
        public int GoodsReturnNoteItemId { get; set; }
        public GetItemMasters Item { get; set; }
        public AccountCode Service { get; set; }
        public decimal OriginalQty { get; set; }
        public decimal TotalReceivedQty { get; set; }
        public decimal OpenQty { get; set; }
        public decimal RTNQty { get; set; }
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


    public class GoodsReturnedNotesDisplayResult
    {
        public List<GoodReturnNotesList> GoodsReturnNotesList { get; set; }
        public int TotalRecords { get; set; }
    }

    public class GoodReturnNotesList
    {
        public int GoodsReturnNoteId { get; set; }
        public string DraftCode { get; set; }
        public int IsDocumentApproved { get; set; }
        public string GRTCode { get; set; }
        public string GRNRemarks { get; set; }
        public string SupplierDoNumber { get; set; }
        public string WorkFlowStatus { get; set; }
    }

    public class GoodReturnedNotesDelete
    {
        public int ModifiedBy { get; set; }
        public int GoodsReturnNoteId { get; set; }
    }

    public class GoodsReturnedNoteSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int GoodsReturnNoteId { get; set; }
        public int RequestFromUserId { get; set; }
    }

    public class GoodsReturnNoteFilterDisplayInput : GridDisplayInput
    {
        public string GRTCodeFilter { get; set; }
        public string SupplierNameFilter { get; set; }
        public string InvoiceCodeFilter { get; set; }
    }

}
