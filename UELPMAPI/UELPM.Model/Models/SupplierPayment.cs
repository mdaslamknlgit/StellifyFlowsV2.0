using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class SupplierPayment
    {
        public int SupplierPaymentId { get; set; }
        public string SupplierPaymentCode { get; set; }
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }
        public string SupplierName { get; set; }
        public string ChequeNumber { get; set; }
        public DateTime? ChequeDate { get; set; }
        public string CreditCardNo { get; set; }
        public int? ExpiryMonth { get; set; }
        public int? ExpiryYear { get; set; }
        public string Remarks { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<SupplierInvoiceDetails> SupplierInvoiceDetails { get; set; }
        public List<SupplierInvoiceTotal> SupplierInvoiceTotal { get; set; }
        public decimal TotalOutstanding { get; set; }
        public int PaymentTypeId { get; set; }
        public string Name { get; set; }
        public string AmountInWords { get; set; }
        //public PaymentType PaymentType { get; set; }
        public Suppliers Supplier { get; set; }

    }

    public class SupplierInvoiceDetails
    {
        public int InvoicePaymentId { get; set; }
        public int SupplierPaymentId { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal InvoiceAmount { get; set; }
        public decimal OutstandingAmount { get; set; }
        public decimal LastPayment { get; set; }
        public decimal PaymentAmount { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }

    public class SupplierPaymentDisplayResult
    {
        public List<SupplierPaymentList> SupplierPayment { get; set; }
        //public List<SupplierPayment> SupplierPayment { get; set; }
        public int TotalRecords { get; set; }
    }

    public class SupplierPaymentList
    {
        public int SupplierPaymentId { get; set; }
        public int SupplierId { get; set; }
        public string SupplierPaymentCode { get; set; }
        public string SupplierName { get; set; }
        public string InvoiceCode { get; set; }
    }

    public class SupplierPaymentDelete
    {
        public int ModifiedBy { get; set; }
        public int SupplierPaymentId { get; set; }
    }

    public class SupplierInvoiceTotal
    {
        public decimal Total { get; set; }
        public int InvoiceId { get; set; }
    }

    public class EditSupplierInvoiceTotal
    {
        public decimal Total { get; set; }
        public int InvoiceId { get; set; }
    }

    public class GridDisplayInputSupplierPayment
    {
        public int SupplierPaymentId { get; set; }
        public int SupplierId { get; set; }
    }

}
