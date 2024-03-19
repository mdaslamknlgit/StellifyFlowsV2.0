using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class SalesQuotation : ApprovalDocumentInfo
    {
        public int QuotationId { get; set; }
        public int CompanyId { get; set; }
        public string DocumentCode { get; set; }
        [JsonIgnore]
        public string DraftCode { get; set; }
        public CustomerType CustomerType { get; set; }
        public SalesCustomerGrid Customer { get; set; }
        public string UnitNo { get; set; }
        public string Reference { get; set; }
        public string Attention { get; set; }
        public AddressType AddressType { get; set; }
        public string Address { get; set; }
        public string CustomerEmail { get; set; }
        public string Subject { get; set; }
        public DateTime ValidityDate { get; set; }
        public Locations Department { get; set; }
        public Location Location { get; set; }
        public string ProjectName { get; set; }
        public CreditTerm CreditTerm { get; set; }
        public Currency Currency { get; set; }
        public SalesTaxGroup TaxGroup { get; set; }
        public TaxType TaxType { get; set; }
        public BankMaster Bank { get; set; }
        public string CustomerRefNo { get; set; }
        public DateTime? CustomerAcceptanceDate { get; set; }
        public bool PurchaseIncurred { get; set; }
        public Supplier Supplier { get; set; }
        [JsonIgnore]
        public PurchaseOrder PoRef { get; set; }
        public string POCode { get; set; }
        public string Remarks { get; set; }
        public string JobSheetNo { get; set; }
        public string JobSheetStatus { get; set; }
        public string JobSheetDescription { get; set; }
        public DateTime? JobCompletedDate { get; set; }
        public decimal TotalLineAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalBeforeTax { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal Total { get; set; }
        public bool MarkForBilling { get; set; }
        public string BillingInstruction { get; set; }
        public string FileDetails { get; set; }
        public List<SalesQuotationItem> LineItems { get; set; }
        public List<BillingInfo> BillingInfos { get; set; }
        public SalesQuotation()
        {
            LineItems = new List<SalesQuotationItem>();
            BillingInfos = new List<BillingInfo>();
        }
        public DateTime CreatedDate { get; set; }
        public bool ShowMarkForBilling { get; set; }
        public bool CanMarkForBilling { get; set; }
        public SalesCustomer CustomerData { get; set; }
        public TaxMaster TaxMaster { get; set; }
    }
    public class SalesQuotationItem
    {
        public int LineItemId { get; set; }
        public int DocumentId { get; set; }
        public int AccountTypeId { get; set; }
        public int SubCategoryId { get; set; }
        public int AccountCodeId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public decimal Qty { get; set; }
        public int UOMId { get; set; }
        public string UOM { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalBeforeDiscount { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalBeforeTax { get; set; }
        public int TaxTypeId { get; set; }
        public string TaxType { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAfterTax { get; set; }
    }
    public class BillingInfo
    {
        public int BillingInfoId { get; set; }
        public int DocumentId { get; set; }
        public string ShortNarration { get; set; }
        public double PercentageToBill { get; set; }
        public double AmountToBill { get; set; }
        public DateTime ExpectedBillingDate { get; set; }
        public CreditTerm CreditTerm { get; set; }
        public SalesInvoice InvoiceDocument { get; set; }
        [JsonIgnore]
        public HttpFileCollection Files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public BillingInfo()
        {
            Attachments = new List<Attachments>();
        }
    }
    public class SalesQuotationGrid
    {
        public int DocumentId { get; set; }
        public string DocumentCode { get; set; }
        public string CustomerName { get; set; }
        public string CustomerId { get; set; }
        public string Department { get; set; }
        public string Location { get; set; }
        public string Requestor { get; set; }
        public Decimal Total { get; set; }
        public string WorkFlowStatus { get; set; }
    }
    public class SalesQuotationSearch
    {
        public int CompanyId { get; set; }
        public bool IsApprovalPage { get; set; }
        public int UserId { get; set; }
        public bool FetchFilterData { get; set; }
        public string CustomerName { get; set; }
        public string CustomerId { get; set; }
        public int CustomerIPSId { get; set; }
        public string DocumentCode { get; set; }
        public string SearchTerm { get; set; }
    }
    public class SalesQuotationMailData : ApprovalDocumentInfo
    {
        public int QuotationId { get; set; }
        public string DocumentCode { get; set; }
        public string CustomerName { get; set; }
        public string Subject { get; set; }
        public string CreditTerm { get; set; }
        public decimal Amount { get; set; }
        public string CustomerShortName { get; set; }
    }
    public class InvoiceLink
    {
        public int InvoiceId { get; set; }
        public int QuotationId { get; set; }
        public int CompanyId { get; set; }
        public int UserId { get; set; }
        public bool IsMarkforBill { get; set; }
        public string Reason { get; set; }
    }
}
