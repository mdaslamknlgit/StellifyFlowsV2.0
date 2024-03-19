using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class CustomerPayment
    {
        public int CustomerPaymentId { get; set; }
        public string CustomerPaymentCode { get; set; }
        public int CustomerId { get; set; }
        public int CompanyId { get; set; }
        public string CustomerName { get; set; }
        public string ChequeNumber { get; set; }
        public DateTime? ChequeDate { get; set; }
        public string CreditCardNo { get; set; }
        public int? ExpiryMonth { get; set; }
        public int? ExpiryYear { get; set; }
        public string Remarks { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<CustomerInvoiceDetails> CustomerInvoiceDetails { get; set; }
        public List<CustomerInvoiceTotal> CustomerInvoiceTotal { get; set; }
        public decimal TotalOutstanding { get; set; }
        public int PaymentTypeId { get; set; }
        public string Name { get; set; }
        public string AmountInWords { get; set; }      
        public Customer Customer { get; set; }

    }

    public class CustomerInvoiceDetails
    {
        public int CustomerInvoicePaymentId { get; set; }
        public int CustomerPaymentId { get; set; }
        public int SalesInvoiceId { get; set; }
        public string InvoiceNo { get; set; }
        public string TicketNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal InvoiceAmount { get; set; }
        public decimal OutstandingAmount { get; set; }
        public decimal LastPayment { get; set; }
        public decimal PaymentAmount { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }

    public class CustomerPaymentDisplayResult
    {
        public List<CustomerPaymentList> CustomerPayment { get; set; }     
        public int TotalRecords { get; set; }
    }

    public class GridDisplayInputCustomerPayment
    {
        public int CustomerPaymentId { get; set; }
        public int CustomerId { get; set; }
    }

    public class CustomerPaymentList
    {
        public int CustomerPaymentId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerPaymentCode { get; set; }
        public string CustomerName { get; set; }
        public string SalesInvoiceCode { get; set; }
    }

    public class CustomerPaymentDelete
    {
        public int ModifiedBy { get; set; }
        public int CustomerPaymentId { get; set; }
    }

    public class CustomerInvoiceTotal
    {
        public decimal Total { get; set; }
        public int SalesInvoiceId { get; set; }
    }

    public class EditCustomerInvoiceTotal
    {
        public decimal Total { get; set; }
        public int SalesInvoiceId { get; set; }
    }

    public class CustomerPaymentSearch : GridDisplayInput
    {      
        public string CustomerPaymentCode { get; set; }
        public string CustomerName { get; set; }
        public string SalesInvoiceCode { get; set; }       
    }
}
