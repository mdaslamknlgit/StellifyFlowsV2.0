using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class SalesCustomer : ApprovalDocumentInfo
    {
        public int CustomerIPSId { get; set; }
        public int CompanyId { get; set; }
        public string DocumentCode { get { return string.Concat(CustomerName, " ", CustomerId); } }
        public CustomerType CustomerType { get; set; }
        public string CustomerName { get; set; }
        public string ShortName { get; set; }
        public string SystemNo { get; set; }
        public string CustomerId { get; set; }
        public TenantType TenantType { get; set; }
        public Locations Department { get; set; }
        public CreditTerm CreditTerm { get; set; }
        public Currency Currency { get; set; }
        public string Remarks { get; set; }
        public string TypeOfBusiness { get; set; }
        public string URL { get; set; }
        public string ROC { get; set; }
        public string RateType { get; set; }
        public string AccountSetId { get; set; }
        public SalesTaxGroup TaxGroup { get; set; }
        public TaxType TaxType { get; set; }
        public int CreditLimit { get; set; }
        public string BankCode { get; set; }
        public string GLAccount { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int MasterCustomerIPSId { get; set; }
        public List<SalesCustomerAddress> CustomerAddresses { get; set; }
        public List<SalesCustomerContact> CustomerContacts { get; set; }
        public TaxMaster TaxMaster { get; set; }

        public SalesCustomer()
        {
            CustomerAddresses = new List<SalesCustomerAddress>();
            CustomerContacts = new List<SalesCustomerContact>();
        }
    }
    public class SalesCustomerAddress
    {
        public int CustomerAddressId { get; set; }
        public int CustomerIPSId { get; set; }
        public AddressType AddressType { get; set; }
        public string FullAddress
        {
            get
            {
                return string.Concat(AddressLine1, string.IsNullOrEmpty(AddressLine2) ? "" : (" , " + AddressLine2), string.IsNullOrEmpty(AddressLine3) ? "" : (" , " + AddressLine3),
                       string.IsNullOrEmpty(City) ? "" : (" , " + City), Country == null ? "" : (" , " + Country.Name), string.IsNullOrEmpty(PostalCode) ? "" : (" , " + PostalCode));
            }
        }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string AddressLine3 { get; set; }
        public string Telephone { get; set; }
        public string Fax { get; set; }
        public Country Country { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Email { get; set; }
        public string Attention { get; set; }
    }
    public class SalesCustomerContact
    {
        public int CustomerContactId { get; set; }
        public int CustomerIPSId { get; set; }
        public string Name { get; set; }
        public Nationality Nationality { get; set; }
        public string ContactNo { get; set; }
        public string Purpose { get; set; }
        public string Designation { get; set; }
        public string NRICPassportNo { get; set; }
        public string Email { get; set; }
        public bool IsDefault { get; set; }
    }
    public class SalesCustomerGrid
    {
        public int CustomerIPSId { get; set; }
        public string CustomerTypeName { get; set; }
        public string CustomerName { get; set; }
        public string CustomerId { get; set; }
        public string Department { get; set; }
        public int CustomerTypeId { get; set; }
        public string TenantTypeName { get; set; }
        public string Remarks { get; set; }
        public string TypeOfBusiness { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; }
    }
    public class SalesCustomerSearch
    {
        public int CompanyId { get; set; }
        public bool IsApprovalPage { get; set; }
        public int UserId { get; set; }
        public bool FetchFilterData { get; set; }
        public string CustomerName { get; set; }
        public string CustomerId { get; set; }
        public int CustomerTypeId { get; set; }
        public string SearchTerm { get; set; }
        public bool FetchApproved { get; set; }
    }
    public class CustomerExcel
    {
        public string CustomerType { get; set; }
        public string CustomerName { get; set; }
        public string ShortName { get; set; }
        public string SystemNo { get; set; }
        public string CustomerId { get; set; }
        public string TypeOfTenant { get; set; }
        public string Department { get; set; }
        public string CreditTerm { get; set; }
        public string CurrencyCode { get; set; }
        public string Remarks { get; set; }
        public string TypeOfBusiness { get; set; }
        public string URL { get; set; }
        public string ROC { get; set; }
        public string RateType { get; set; }
        public string AccountSetId { get; set; }
        public string TaxGroup { get; set; }
        public string TaxClass { get; set; }
        public string CreditLimit { get; set; }
        public string BankCode { get; set; }
        public string GLAccount { get; set; }
        public List<string> Errors { get; set; }
        public List<CustomerAddressExcel> CustomerAddresses { get; set; }
        public List<CustomerContactExcel> CustomerContacts { get; set; }
        public CustomerExcel()
        {
            CustomerAddresses = new List<CustomerAddressExcel>();
            CustomerContacts = new List<CustomerContactExcel>();
        }
    }
    public class CustomerAddressExcel
    {
        public string AddressType { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string AddressLine3 { get; set; }
        public string Telephone { get; set; }
        public string Fax { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Email { get; set; }
        public string Attention { get; set; }
    }
    public class CustomerContactExcel
    {
        public string Name { get; set; }
        public string Nationality { get; set; }
        public string ContactNo { get; set; }
        public string Purpose { get; set; }
        public string Designation { get; set; }
        public string NRICPassportNo { get; set; }
        public string Email { get; set; }
        public string IsDefault { get; set; }
    }
}