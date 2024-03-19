using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class ContractPurchaseOrder
    {
        public int CPOID { get; set; }
        public string CPONumber { get; set; }
        public int CompanyId { get; set; }
        public string Location { get; set; }
        public int? LocationID { get; set; }
        public int Supplierid { get; set; }
        public int RequestedBy { get; set; }
        public int? TaxId { get; set; }
        public string TaxName { get; set; }
        public decimal OtherCharges { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal SubTotal { get; set; }
        public int POTypeId { get; set; }
        public string ContractName { get; set; }
        public int BillingFrequencyId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalContractSum { get; set; }
        public decimal TenureAmount { get; set; }
        public Boolean IsFixed { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
		public string CurrencySymbol { get; set; }
        public string Remarks { get; set; }
        public string CPORemarks { get; set; }
        public string Instructions { get; set;}
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal Tolerance { get; set; }
        public decimal Discount { get; set; }
        public bool IsMasterPO { get; set; }
        public DateTime PODate { get; set; }
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public Suppliers Supplier { get; set; }
        public List<ContractPurchaseOrderItems> ContractPurchaseOrderItems { get; set; }
        public List<int> PurchaseOrderItemsToDelete { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? TotalTax { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatusText { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public string RequestedByUserName { get; set; }
        public string Designation { get; set; }
        public string PurchaseOrderType { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public int PurchaseOrderStatusId { get; set; }
        public string PurchaseOrderStatusText { get; set; }
        public string ReasonstoVoid { get; set; }
        public string DraftCode { get; set; }
        public bool IsDocumentApproved { get; set; }
        public string ReasonsToReject { get; set; }
        public bool AccruetheExpense { get; set; }
        public bool SplitByMonthly { get; set; }
        public string ContractTerms { get; set; }
        public DateTime TerminationDate { get; set; }
        public int MasterCPOID { get; set; }
        public Decimal Margin { get; set; }
        public int ServiceType { get; set; }
        public string ServiceName { get; set; }
        public string CompanyName { get; set; }      
        public string AccrualCode { get; set; }
        public int? SupplierSubCodeId { get; set; }
        public string ContractID { get; set; }
        public SupplierSubCode SupplierSubCode { get; set; }
        public int? TotalContractPeriod { get; set; }
        public string TenureToDisplay { get; set; }
        public string AccountCodeName { get; set; }
        public int TotalCount { get; set; }
        public string CPONo { get; set; }
        public DateTime? POCGenerateDate { get; set; }
        public int CurrentWorkFlowStatusId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CPOJVACode { get; set; }
        public string TaxGroupName { get; set; }
        public string Description { get; set; }
        public int? TaxGroupId { get; set; }
        public bool IsCPOAccrued { get; set; }
        public string SupplierAddress { get; set; }
    }
    public class ContractPurchaseOrderItems
    {
        public int CPOItemid { get; set; }
        public int CPOID { get; set; }
        public string Description { get; set; }
        public int ExpenseCategoryId { get; set; }
        public string ExpenseCategory { get; set; }
        public decimal Amount { get; set; }
        public decimal PaymentValuation {get;set;}
        public string CPONumber { get; set; }
        public string AccountCode { get; set; }
        public int AccountCodeId { get; set; }
        public string AccountType { get; set; }
        public string AccountCodeName { get; set; }
        public decimal TotalTax { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TaxID { get; set; }
        public string RateType { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public AccountCode Expense { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string AccrualCode { get; set; }
        public int PurchaseOrderId { get; set; }
        public string Category { get; set; }
    }
    public class ContractPurchaseOrderDelete
    {
        public int ModifiedBy { get; set; }
        public int CPOID { get; set; }
    }
    public class ContractPurchaseOrderAccure
    {
        public int CPOID { get; set; }
        public int WorkFlowStatusId { get; set; }
    }

    public class ContractPurchaseOrderDisplayResult
    {
        public List<ContractPurchaseOrder> PurchaseOrders { get; set; }
        public int TotalRecords { get; set; }
    }
    
}
