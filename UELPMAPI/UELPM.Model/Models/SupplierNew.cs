using System;

namespace UELPM.Model.Models
{
    public class SupplierNew
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string SupplierShortName { get; set; }
        public SupplierService SupplierService { get; set; }
        public ServiceCategory SupplierCategory { get; set; }
        public PaymentTerm PaymentTerm { get; set; }
        public string ServiceName { get; set; }
        public string CategoryName { get; set; }
        public string PaymentTermCode { get; set; }
        public string CurrencyCode { get; set; }
        public string SupplierEmail { get; set; }
        public string BillingAddress1 { get; set; }
        public string BillingAddress2 { get; set; }
        public string BillingCity { get; set; }
        public Country BillingCountry { get; set; }
        public string BillingZipcode { get; set; }
        public string BillingTelephone { get; set; }
        public string BillingMobile { get; set; }
        public string BillingFax { get; set; }
        public string ShippingAddress1 { get; set; }
        public string ShippingAddress2 { get; set; }
        public string ShippingCity { get; set; }
        public ShippingCountry ShippingCountry { get; set; }
        public string ShippingZipcode { get; set; }
        public string ShippingTelephone { get; set; }
        public string ShippingMobile { get; set; }
        public string ShippingFax { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsGSTSupplier { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string DraftCode { get; set; }
        public int? GSTStatusId { get; set; }
        public string GSTNumber { get; set; }
        public decimal? ShareCapital { get; set; }
        public int CurrencyId { get; set; }
    }
}
