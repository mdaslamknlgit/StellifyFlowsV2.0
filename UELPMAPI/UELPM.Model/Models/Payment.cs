using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class Payment
    {
        public int PaymentID { get; set; }
        public int ProcessId { get; set; }
        public int CompanyId { get; set; }
        public string SupplierInvoiceRefNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string ChequeNo { get; set; }
        public DateTime ChequeDate { get; set; }
        public string VendorId { get; set; } //reffered as SupplierCode
        public string SupplierName { get; set; }
        public decimal PaymentAmount { get; set; }
        public string DocumentNo { get; set; }
        public bool Status { get; set; }
        public string BatchNo { get; set; }
        public int ImportedBy { get; set; }
        public string ImportedByUserName { get; set; }
        public int DocumentId { get; set; }
        public string StatusText { get; set; }
        public decimal BalanceAmount { get; set; }
        public string ChequeDatePDF { get; set; }
        public string PaymentAmountPDF { get; set; }
        public int SupplierId { get; set; }
        public string Remarks { get; set; }
        public bool IsOverPayment { get; set; }
    }

    public class InvoicePayments
    {
        public InvoicePayments()
        {
            Payments = new List<Payment>();
        }
        public string Currency { get; set; }
        public decimal InvoiceTotal { get; set; }
        public decimal PaidTotal { get; set; }
        public decimal OutStandingTotal { get; set; }
        public List<Payment> Payments { get; set; }
    }

}
