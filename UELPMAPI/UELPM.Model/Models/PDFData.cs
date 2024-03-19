using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class PDFData
    {
        public CompanyDetails Company { get; set; }
        public int ProcessId { get; set; }
        public string DocumentCode { get; set; }
        public string DocumentStatus { get; set; }
        public string Department { get; set; }
        public string CreditNoteType { get; set; }
        public string SupplierCreditNoteNo { get; set; }
        public string SupplierCreditNoteDate { get; set; }
        public string InvoiceCode { get; set; }
        public string SupplierInvoiceNo { get; set; }
        public string SupplierInvoiceDate { get; set; }
        public string Reason { get; set; }
        public List<LineItem> ItemDetails { get; set; }
        public string TotalBeforeDiscount { get; set; }
        public string Discount { get; set; }
        public string TotalBeforeTax { get; set; }
        public string TaxValue { get; set; }
        public string TaxPercentage { get; set; }
        public string TaxAdjustment { get; set; }
        public string NetTotal { get; set; }
        public string TotalAdjustment { get; set; }
        public string Total { get; set; }
        public string PDFTitle { get; set; }
        public List<AuditLogData> AuditLogData { get; set; }
        public string AmountInWords { get; set; }
        public string TemplateFileName { get; set; }
        public string Currency { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedDate { get; set; }
        public string SupplierCode { get; set; }
        public string SupplierName { get; set; }
        public string SupplierAddress { get; set; }
        public string Requestor { get; set; }
        public string RequestedByUserName { get; set; }
        public string RequestorContactNo { get; set; }
        public string RequestorEmailID { get; set; }
        public string POCode { get; set; }
        public string Header1 { get; set; }
        public string Header2 { get; set; }
        public string LinkCssClass { get; set; }
        public string LogoURL { get; set; }
        public string DynamicProp1 { get; set; }
        public string DynamicProp2 { get; set; }
        public string DynamicProp3 { get; set; }
        public string CreditTerm { get; set; }
        public string DynamicProp4 { get; set; }
        public string DynamicProp5 { get; set; }
        public string DynamicProp6 { get; set; }
        public string DynamicProp7 { get; set; }
        public string DynamicProp8 { get; set; }
        public string DynamicProp9 { get; set; }
        public string DynamicProp10 { get; set; }
        public string DynamicProp11 { get; set; }
        public string DynamicProp12 { get; set; }
        public string DynamicProp13 { get; set; }
        public string DynamicProp14 { get; set; }
        public string DynamicProp15 { get; set; }
        public string DynamicProp16 { get; set; }
        public string DynamicHideContent1 { get; set; }
        public string DynamicHideContent2 { get; set; }
        public string DynamicHideContent3 { get; set; }
        public string DynamicHideContent4 { get; set; }
        public string DynamicHideContent5 { get; set; }
        public string DynamicHideContent6 { get; set; }
        public string DynamicHideContent7 { get; set; }
        public string DynamicHideContent8 { get; set; }
        public PDFData()
        {
            ItemDetails = new List<LineItem>();
            AuditLogData = new List<AuditLogData>();
        }
    }

    public class LineItem
    {
        public int SNo { get; set; }
        public string Item { get; set; }
        public string Description { get; set; }
        public string UOM { get; set; }
        public string Quantity { get; set; }
        public string UnitPrice { get; set; }
        public string Total { get; set; }
    }
}
