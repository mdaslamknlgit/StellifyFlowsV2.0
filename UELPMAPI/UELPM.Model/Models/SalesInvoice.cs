using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UELPM.Model.Models
{
    public class SalesInvoice : ApprovalDocumentInfo
    {
        public int InvoiceId { get; set; }
        public int CompanyId { get; set; }
        public string QuotationCode { get; set; }
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
        public Locations Department { get; set; }
        public Location Location { get; set; }
        public string ProjectName { get; set; }
        public CreditTerm CreditTerm { get; set; }
        public Currency Currency { get; set; }
        public SalesTaxGroup TaxGroup { get; set; }
        public TaxType TaxType { get; set; }
        public BankMaster Bank { get; set; }
        public SchedulerNo Scheduler { get; set; }
        public string InvoiceDetail { get; set; }
        public string SchedulerInfo
        {
            get {
                try
                {
                    string[] code = this.LineItems.FirstOrDefault().AccountCode.Split('-');
                    return this.Scheduler == null ? "" : string.Concat(this.Scheduler.SchedulerNumber, " - ", code[0], " - ", this.Customer.CustomerId);
                }
                catch (Exception)
                {

                    return string.Empty;
                }
                
            }
        }
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
        public decimal SubTotal { get; set; }
        public decimal TaxAdjustment { get; set; }
        public decimal NetTotal { get; set; }
        public decimal TotalAdjustment { get; set; }
        public SalesCustomer CustomerData { get; set; }
        public decimal Total { get; set; }
        public List<SalesInvoiceItem> LineItems { get; set; }
        public SalesInvoice()
        {
            LineItems = new List<SalesInvoiceItem>();
        }
        public DateTime CreatedDate { get; set; }
        public int QuotationId { get; set; }
        public TaxMaster TaxMaster { get; set; }
    }
    public class SalesInvoiceItem
    {
        public int LineItemId { get; set; }
        public int DocumentId { get; set; }
        public int AccountTypeId { get; set; }
        public int SubCategoryId { get; set; }
        public int AccountCodeId { get; set; }
        public string Code { get; set; }
        [JsonIgnore]
        public string AccountCode { get; set; }
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
    public class SalesInvoiceGrid
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
    public class SalesInvoiceMailData : ApprovalDocumentInfo
    {
        public int InvoiceId { get; set; }
        public string DocumentCode { get; set; }
        public string CustomerName { get; set; }
        public string Subject { get; set; }
        public string CreditTerm { get; set; }
        public decimal Amount { get; set; }
        public string CustomerShortName { get; set; }
    }
}
