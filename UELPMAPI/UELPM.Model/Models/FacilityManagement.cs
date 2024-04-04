using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class FacilityManagement
    {
        public int FacilityId { get; set; }
        public int CompanyId { get; set; }
        public string UnitNumber { get; set; }
        public OwnerCustomer OwnerDetails { get; set; }

        public string OwnerName { get; set; }
        public string OwnerCity { get; set; }
        public string OwnerContactNo { get; set; }
        public string OwnerEmail { get; set; }
        public int OwnerBillingCountryId { get; set; }
        public string OwnerBillingCountryName { get; set; }
        public string OwnerBillingAddress { get; set; }

        public TenantCustomer TenantDetails { get; set; }
        public string TenantName { get; set; }
        public string TenantCity { get; set; }
        public string TenantContactNo { get; set; }
        public string TenantEmail { get; set; }
        public string TenantBillingAddress { get; set; }
        public int TenantBillingCountryId { get; set; }
        public string TenantBillingCountryName { get; set; }

        public int OwnerId { get; set; }
        public int TenantId { get; set; }

        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public int checkOwner { get; set; }
        public int checkTenant { get; set; }

    }

    public class OwnerCustomer
    {
        public int CustomerId { get; set; }
        public string CustomerCode { get; set; }
        public string OwnerName { get; set; }
        public string CustomerEmail { get; set; }
        public string BillingCity { get; set; }
        public string BillingAddress { get; set; }
        public string BillingTelephone { get; set; }
        public int BillingCountryId { get; set; }
    }

    public class TenantCustomer
    {
        public int CustomerId { get; set; }
        public string CustomerCode { get; set; }
        public string TenantName { get; set; }
        public string CustomerEmail { get; set; }
        public string BillingCity { get; set; }
        public string BillingAddress { get; set; }
        public string BillingTelephone { get; set; }
        public int BillingCountryId { get; set; }
    }

    //public class FacilityManagement
    //{
    //    public int FacilityId { get; set; }
    //    public int CompanyId { get; set; }
    //    public string UnitNumber { get; set; }
    //    public string OwnerId { get; set; }
    //    public string TenantId { get; set; }
    //    public bool IsActive { get; set; }
    //    public bool IsDeleted { get; set; }
    //    public int CreatedBy { get; set; }
    //    public int ModifiedBy { get; set; }
    //    public Customer OwnerDetails { get; set; }

    //}

    public class FacilityManagementList
    {
        public int FacilityId { get; set; }
        public string UnitNumber { get; set; }
        public string OwnerName { get; set; }
        public string TenantName { get; set; }
    }

    public class FacilityManagementDisplayResult
    {
        public List<FacilityManagementList> FacilityManagementList { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ValidateFacilityManagement
    {
        public string UnitNumber { get; set; }
        public string OwnerName { get; set; }
        public int FacilityId { get; set; }
    }

}
