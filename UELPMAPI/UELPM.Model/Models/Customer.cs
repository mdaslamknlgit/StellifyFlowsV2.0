using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class Customer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerShortName { get; set; }
        public int CustomerCategoryId { get; set; }
        public string CustomerCategoryName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerCode { get; set; }
        public int? CompanyId { get; set; }
        public int PaymentTermsId { get; set; }
        public string BillingAddress { get; set; }
        public string BillingCity { get; set; }
        public int BillingCountryId { get; set; }
        public string BillingZipcode { get; set; }
        public string BillingTelephone { get; set; }
        public string BillingFax { get; set; }
        public string ShippingAddress { get; set; }
        public string ShippingCity { get; set; }
        public int ShippingCountryId { get; set; }
        public string ShippingZipcode { get; set; }
        public string ShippingTelephone { get; set; }
        public string ShippingFax { get; set; }
        public string BillingCountry { get; set; }
        public string ShippingCountry { get; set; }
        public string CategoryName { get; set; }
        public string PaymentTermCode { get; set; }
        public int? TaxId { get; set; }
        public string TaxName { get; set; }      
        public int? Status { get; set; }
        public string Remarks { get; set; }
        public bool? IsDeleted { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class CustomerGrid
    {
        public List<Customer> Customers { get; set; }
        public int TotalRecords { get; set; }
    }
}
