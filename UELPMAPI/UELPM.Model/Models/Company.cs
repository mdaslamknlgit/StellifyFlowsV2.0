using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class Company
    {
        public int CompanyId { get; set; }
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public string CompanyShortName { get; set; }
        public string CompanyDescription { get; set; }
        public string CompanyRegistrationNumber { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string City { get; set; }
        public Country Countries { get; set; }
        public string Country { get; set; }
        public string CountryName { get; set; }
        public string ZipCode { get; set; }
        public string SupplierVerifier { get; set; }
        public string SupplierVerifierName { get; set; }
        public decimal? InvoiceLimit { get; set; }
        public string GST { get; set; }
        public string GSTRegistrationNumber { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string MCSTOffice { get; set; }
        public string Telephone { get; set; }
        public string Mobilenumber { get; set; }
        public string Fax { get; set; }
        public bool Isdeleted { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string LocationPrefix { get; set; }
        public string UserNames { get; set; }
        public string DepartmentNames { get; set; }
        public int SupplierCompanyId { get; set; }
        public List<UserProfile> GLCodeUsersList { get; set; }
        public List<Locations> DepartmentList { get; set; }
        public List<int> ContactPersonsToDelete { get; set; }
        public List<CompanyContactPerson> ContactPersons { get; set; }
        public Currency Currency { get; set; }
        public HttpFileCollection Image { get; set; }
        public string ImageSource { get; set; }
    }
    public class CompanyGrid
    {
        public List<Company> Companies { get; set; }
        public int TotalRecords { get; set; }
    }
    public class CompanyContactPerson
    {
        public int ContactPersonId { get; set; }
        public int CompanyId { get; set; }
        public string Name { get; set; }
        public string ContactNumber { get; set; }
        public string EmailId { get; set; }
        public string Saluation { get; set; }
        public string Surname { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class CompanySearch 
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
        public int CompanyId { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public string Country { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
