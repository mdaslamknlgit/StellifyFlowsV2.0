using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ProjectPaymentExport
    {
        public List<TypeOfCostLineItem> TypeOfCostLineItems { get; set; }
        public List<POPCostCategory> CostCategories { get; set; }
        public List<POPApportionment> Apportionments { get; set; }
        public string MasterDocumentCode { get; set; }
    }
    public class TypeOfCostLineItem
    {
        public string RetentionSupplierId { get { return SupplierId.Substring(0, SupplierId.Length - 2) + RetSupplierSubCode; } }
        public string PaymentSupplierId { get { return SupplierId.Substring(0, SupplierId.Length - 2) + SupplierSubCode; } }
        public string SupplierId { get; set; }
        public string SupplierShortName { get; set; }
        public string ExpInvoiceDescription
        {
            get { return string.IsNullOrEmpty(SupplierShortName) ? DocumentDescription : string.Format("{0}/{1}", SupplierShortName, DocumentDescription); }
        }
        public string DocumentCurrency { get; set; }
        public string PaymentTerm { get; set; }
        public string PaymentDocumentCode { get; set; }
        public string SupplierInvoiceDate { get; set; }
        public int ExpiryYear { get; set; }
        public int ExportMonth { get; set; }
        public List<PaymentLineItem> LineItems { get; set; }
        public List<PaymentLineItem> DiscountItems { get; set; }
        public decimal STContractValue { get; set; }
        public decimal STPrevAccPayment { get; set; }
        public decimal STCurrentPayment { get; set; }
        public decimal STAccPayment { get; set; }
        public decimal STStatus { get; set; }
        public decimal TBTContractValue { get; set; }
        public decimal TBTPrevAccPayment { get; set; }
        public decimal TBTCurrentPayment { get; set; }
        public decimal TBTAccPayment { get; set; }
        public decimal TBTStatus { get; set; }
        public decimal AppPerForRetContractValue { get; set; }
        public decimal AppPerForRetPrevAccPayment { get; set; }
        public decimal AppPerForRetCurrentPayment { get; set; }
        public decimal AppPerForRetAccPayment { get; set; }
        public decimal NRPrevAccPayment { get; set; }
        public decimal NRCurrentPayment { get; set; }
        public decimal NRAccPayment { get; set; }
        public decimal ADUCPrevAccPayment { get; set; }
        public decimal ADUCCurrentPayment { get; set; }
        public decimal ADUCAccPayment { get; set; }
        public decimal GSTAMountPrevAccPayment { get; set; }
        public decimal GSTAMountCurrentPayment { get; set; }
        public decimal GSTAMountAccPayment { get; set; }
        public decimal GSTAdjustmentPrevAccPayment { get; set; }
        public decimal GSTAdjustmentCurrentPayment { get; set; }
        public decimal GSTAdjustmentAccPayment { get; set; }
        public decimal TotalPrevAccPayment { get; set; }
        public decimal TotalCurrentPayment { get; set; }
        public decimal TotalAccPayment { get; set; }
        public string AccountSetId { get; set; }
        public string TaxGroup { get; set; }
        public decimal TaxAmount { get; set; }
        public string RetTaxGroup { get; set; }
        public decimal InvoiceAmountBeforeGST { get; set; }
        public decimal GSTTaxAmount { get; set; }
        public decimal GrossAmount { get; set; }
        public decimal ContractValue { get; set; }
        public decimal PrevAccPayment { get; set; }
        public decimal CurrentPayment { get; set; }
        public decimal Status { get; set; }
        public decimal AccPayment { get; set; }
        public string SupplierInvoiceNo { get; set; }
        public string Suffix { get; set; }
        public string LineItemDescription { get; set; }
        public string ApportionmentMethod { get; set; }
        public string InvoiceDescription
        {
            get { return string.IsNullOrEmpty(Suffix) ? "" : string.Format("{0}{1}", SupplierInvoiceNo, Suffix); }
        }
        public string TypeOfCost { get; set; }
        public string TypeOfCostTitle { get { return string.Format("{0} - {1}", "Type Of Cost", TypeOfCost); } }
        public string DocumentDescription { get; set; }
        public string ItemDescription
        {
            get
            {
                string tempDesc = string.Format("{0}-cost-{1}", DocumentDescription, TypeOfCost);
                return string.IsNullOrEmpty(SupplierShortName) ? tempDesc : string.Format("{0}/{1}", SupplierShortName, tempDesc);
            }
        }
        public decimal RateTax { get; set; }
        public string TaxType { get; set; }
        public string GLAccount { get; set; }
        public string InvoiceDueDate { get; set; }
        public string TaxClass { get; set; }
        public string RetTaxClass { get; set; }
        public string GLCost { get; set; }
        public string GLRet { get; set; }
        public bool IsRetentionApplicable { get; set; }
        public string RetSupplierSubCode { get; set; }
        public string SupplierSubCode { get; set; }
        public string RetentionAccountSetId { get; set; }
    }
    public class PaymentLineItem
    {
        public string LineItemDescription { get; set; }
        public string ApportionmentMethod { get; set; }
        public decimal ContractValue { get; set; }
        public decimal PrevAccPayment { get; set; }
        public decimal CurrentPayment { get; set; }
        public decimal AccPayment { get; set; }
        public decimal Status { get; set; }
    }
    public class ReportParams
    {
        public int UserId { get; set; }
        public string Type { get; set; }
        public List<DocumentData> DocumentsData { get; set; }

    }

    public class DocumentData
    {
        public int POPId { get; set; }
        public int PaymentContractId { get; set; }
        public int DocumentId { get; set; }
        public int ProcessId { get; set; }
    }
}
