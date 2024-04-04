using System;

namespace UELPM.Model.Models
{
    public class PurchaseOrderRequestMail
    {
        public int RequestId { get; set; }
        public string RequestCode { get; set; }
        public string ApproverName { get; set; }
        public string ApproverEmail { get; set; }
        public string PurchaseOrderType { get; set; }
        public string Department { get; set; }
        public string Supplier { get; set; }
        public string SupplierName { get; set; }
        public string SupplierEmail { get; set; }
        public string SupplierContactNumber { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string TotalAmount { get; set; }
        public string SenderName { get; set; }
        public string SenderEmail { get; set; }
        public int ProcessId { get; set; }
        public int CompanyId { get; set; }
        public string CompanyShortName { get; set; }
        public string DocumentStatus { get; set; }
        public DateTime ContractStartDate { get; set; }
        public DateTime ContractEndDate { get; set; }
        public string DocumentCurrencySymbol { get; set; }
    }

    public class SalesOrderRequestMail
    {
        public int RequestId { get; set; }
        public string RequestCode { get; set; }
        public string ApproverName { get; set; }
        public string ApproverEmail { get; set; }
        public string CustomerType { get; set; }
        public string Department { get; set; }
        public string Customer { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerContactNumber { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string TotalAmount { get; set; }
        public string SenderName { get; set; }
        public string SenderEmail { get; set; }
    }

    public class DocumentRequestMail : PurchaseOrderRequestMail
    {

    }
}
