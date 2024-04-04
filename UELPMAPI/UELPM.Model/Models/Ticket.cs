using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class Ticket
    {
        public int TicketId { get; set; }
        public string TicketNo { get; set; }
        public int FacilityID { get; set; }
        public int CompanyId { get; set; }
        public string TicketPriority { get; set; }
        public DateTime PreferredServiceDatetime { get; set; }
        public TimeSpan PrefferedToTime { get; set; }
        public TimeSpan PrefferedFromTime { get; set; }
        public bool isBillable { get; set; }
        public int IsbilltoTenant { get; set; }
        public string JobStatus { get; set; }
        public decimal BillAmount { get; set; }
        public string JobDesciption { get; set; }
        public int Statusid { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int Updatedby { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string UnitNumber { get; set; }
        public List<int> EmployeeAssignToDelete { get; set; }
        public List<EngineerAssignList> EngineerAssignList { get; set; }
        public List<InventoryItems> InventoryItems { get; set; }
        public List<int> InventoryItemsToDelete { get; set; }
        public List<SubContractorItem> SubContractorItem { get; set; }
        public List<int> SubContractorItemToDelete { get; set; }
        public int PriorityId { get; set; }
        public string PriorityName { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public List<TicketQuotationAttachments> TicketQuotationAttachment { get; set; }
        public List<TicketQuotationAttachments> TicketQuotationAttachmentDelete { get; set; }
        public List<TicketQuotationAttachments> TicketQuotationAttachmentUpdateRowId { get; set; }
        //for attachament
        public HttpFileCollection Files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<Attachments> AttachmentsDelete { get; set; }
        public int AttachmentTypeId { get; set; }
        public Customer OwnerDetails { get; set; }
        public List<TicketSendMessages> TicketSendMessages { get; set; }
    }

    public class TicketQuotationAttachments
    {
        public int SubContractorQuotationId { get; set; }
        public int TicketId { get; set; }
        public int SubContractorId { get; set; }
        public string FileName { get; set; }
        public int RowId { get; set; }
    }

    public class InventoryItems
    {
        public int InventoryItemId { get; set; }
        public string ItemMasterCode { get; set; }
        public decimal ItemQty { get; set; }
        public decimal Price { get; set; }
        public int ExistingQuantity { get; set; }
        public string status{ get; set; }
        public int? MeasurementUnitID { get; set; }
        public string MeasurementUnitCode { get; set; }
        public string ItemDescription { get; set; }
        public decimal ItemTotalPrice { get; set; }
        public GetItemMasters Item { get; set; }
    }

    public class SubContractorItem
    {
        public int SubContractorId { get; set; }
        public int SupplierCategoryID { get; set; }
        public decimal QuotationAmount { get; set; }
        public string BillingTelephone { get; set; }
        public string SupplierEmail { get; set; }
        public string CategoryText { get; set; }
        public Suppliers Supplier { get; set; }
    }


    public class TicketDisplayResult
    {
        public List<TicketList> Tickets { get; set; }
        public int TotalRecords { get; set; }
    }

    public class TicketList
    {
        public int TicketId { get; set; }
        public string TicketNo { get; set; }
        public string UnitNumber { get; set; }
        public string JobStatus { get; set; }
        public DateTime PreferredServiceDatetime { get; set; }
        public string PriorityName { get; set; }
    }

    public class TicketManagement
    {
        public int TicketId { get; set; }
        public int TicketEngineerId { get; set; }
        public int EngineerStatusId { get; set; }
    }

    public class EmployeeAssignDisplayInput : GridDisplayInput
    {
        public int UserId { get; set; }
        public DateTime? AssignDate { get; set; }
        public TimeSpan FromTime { get; set; }
        public TimeSpan ToTime { get; set; }
    }

    public class EngineerStatus
    {

    }

    public class EngineerAssignDisplayResult
    {
        public List<Engineer> Engineer { get; set; }
        public int TotalRecords { get; set; }
    }

    public class EngineerAssignList
    {
        public int TicketEngineerId { get; set; }
        public string Name { get; set; }
        public int UserId { get; set; }
        public bool IsAssigned { get; set; }
        public string Contact { get; set; }
        public string Email { get; set; }
        public int EngineerStatusId { get; set; }
        public string StatusName { get; set; }
        public DateTime AssignmentFromDateTime { get; set; }
        public DateTime AssignmentToDateTime { get; set; }
        public int CreatedBy { get; set; }
        public int CompanyId { get; set; }
        public string IsAvailable { get; set; }
    }

    public class TicketFilterDisplayInput : GridDisplayInput
    {
        public string TicketNoFilter { get; set; }
        public string FacilityFilter { get; set; }
        public string PriorityFilter { get; set; }
    }

    public class TicketDelete
    {
        public int UserID { get; set; }
        public int TicketId { get; set; }
        public int AttachmentTypeId { get; set; }
    }


    public class TicketSendMessages
    {
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public int Engineer_TenantId { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UserName { get; set; }
        public int ProcessId { get; set; }
        public string Engineer_TenantName { get; set; }
        public string TicketNo { get; set; }
        public int CompanyId { get; set; }
    }

}
