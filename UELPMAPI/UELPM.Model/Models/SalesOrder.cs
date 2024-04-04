using System;
using System.Collections.Generic;
using System.Web;

namespace UELPM.Model.Models
{
    public class SalesOrder
    {      
        public int SalesOrderId { get; set; }
        public int CompanyId { get; set; }       
        public string SalesOrderType { get; set; }
        public int StatusId { get; set; }
        public int? TicketId { get; set; }
        public int LocationId { get; set; }
        public string Location { get; set; }
        public int PaymentTermId { get; set; }
        public string PaymentTerms { get; set; }
        public int DeliveryTermId { get; set; }
        public string DeliveryTerm { get; set; }
        public int RequestedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public int CostOfServiceId { get; set; }
        public string CostOfService { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public int SalesOrderStatusId { get; set; }
        public string SalesOrderStatusText { get; set; }

        public decimal Discount { get; set; }
        public decimal ShippingCharges { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TotalTax { get; set; }

        public DateTime ExpectedDeliveryDate { get; set; }      
        public string CurrencySymbol { get; set; }
        public string SalesOrderCode { get; set; }

        public bool IsGstRequired { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public string Instructions { get; set; }
        public string Justifications { get; set; }      
        public string Reasons { get; set; }
        public string DeliveryAddress { get; set; }
        public bool? IsApprovalPage { get; set; }
       
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public List<int> SalesOrderItemsToDelete { get; set; }    
        public List<SalesOrderItems> SalesOrderItems { get; set; }    
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public Customer Customer { get; set; }
        public Ticket Ticket { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string DraftCode { get; set; }
        public bool IsDocumentApproved { get; set; }
    }

    public class SalesOrderItems
    {
        public int SalesOrderItemId { get; set; }
        public decimal ItemQty { get; set; }
        public int MeasurementUnitID { get; set; }
        public string MeasurementUnitCode { get; set; }
        public decimal Unitprice { get; set; }
        public string ItemDescription { get; set; }
        public GetItemMasters Item { get; set; }
        public string AccountCode { get; set; }
        public int TaxID { get; set; }
        public string TaxName { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal Discount { get; set; }
        public bool IsGstBeforeDiscount { get; set; }
        public decimal ItemTotalPrice { get; set; }
    }

    public class SalesOrderDisplayResult
    {
        public List<SalesOrderList> SalesOrders { get; set; }
        public int TotalRecords { get; set; }
    }

    public class SalesOrderSearch : GridDisplayInput
    {
        public int CustomerId { get; set; }
        public int? WorkFlowStatusId { get; set; }    
        public int WorkFlowProcessId { get; set; }
        public int SalesOrderId { get; set; }
        public string SoCode { get; set; }
        public string CustomerName { get; set; }
        public string TicketNo { get; set; }
        public string UnitNumber { get; set; }
    }

    public class SalesInvoiceSearch : GridDisplayInput
    {
        public string SalesInvoiceCode { get; set; }
        public string CustomerName { get; set; }
        public string CustomerId { get; set; }
        public int CustomerIPSId { get; set; }
        public string SearchTerm { get; set; }
    }

    public class TicketSearch : GridDisplayInput
    {     
        public int TicketId { get; set; }
    }

    public class SalesOrderDelete
    {        
        public int SalesOrderId { get; set; }
        public int ModifiedBy { get; set; }
    }

    public class SalesOrderList
    {
        public string SalesOrderCode { get; set; }
        public int SalesOrderId { get; set; }      
        public string CustomerName { get; set; }
        public string FirstName { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public string DraftCode { get; set; }
        public bool IsDocumentApproved { get; set; }
    }

    public class SalesTicketList
    {
        public int TicketId { get; set; }
        public string TicketNo { get; set; }
        public string UnitNumber { get; set; }
        public int FacilityId { get; set; }
        public decimal BillAmount { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class SalesTicketDisplayResult
    {
        public List<SalesTicketList> Tickets { get; set; }
        public int TotalRecords { get; set; }
    }

    public class SalesOrderApproval
    {
        public int SalesOrderId { get; set; }
        public string SalesOrderCode { get; set; }  
        public int SalesOrderRequestUserId { get; set; }
        public int UserId { get; set; }
        public int ApproverUserId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int ProcessId { get; set; }
        public int CompanyId { get; set; }
        public string Remarks { get; set; }      
    }   
}
