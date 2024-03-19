namespace UELPM.Model.Models
{
    public class PurchaseOrderRequestClarificationMail
    {
        public int RequestId { get; set; }
        public string RequestCode { get; set; }
        public string ApproverName { get; set; }
        public string ApproverEmail { get; set; }      
        public string RequesterName { get; set; }
        public string RequesterEmail { get; set; }
        public string ApproverComments { get; set; }
        public string RequesterComments { get; set; }
        public string PurchaseOrderNumber { get; set; }
        public string SalesOrderNumber { get; set; }
        public string Supplier { get; set; }
        public string WorkFlowStatus { get; set; }
        public string TotalAmount { get; set; }
        public int CompanyId { get; set; }
        public int ProcessId { get; set; }
        public string CompanyShortName { get; set; }
        public string SupplierShortName { get; set; }
        public string DocumentCurrencySymbol { get; set; }
    }


    public class SalesOrderClarificationMail
    {
        public int RequestId { get; set; }
        public string RequestCode { get; set; }
        public string ApproverName { get; set; }
        public string ApproverEmail { get; set; }
        public string RequesterName { get; set; }
        public string RequesterEmail { get; set; }
        public string ApproverComments { get; set; }
        public string RequesterComments { get; set; }     
        public string SalesOrderNumber { get; set; }
    }
}
