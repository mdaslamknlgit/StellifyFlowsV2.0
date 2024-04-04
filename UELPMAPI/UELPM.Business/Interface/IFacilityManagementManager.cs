using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IFacilityManagementManager
    {
        string CreateFacilityManagement(FacilityManagement m_facilityManagement);
        string UpdateFacilityManagement(FacilityManagement m_facilityManagement);
        bool DeleteFacilityManagement(int facilityId);
        FacilityManagementDisplayResult GetFacilityManagement(GridDisplayInput gridDisplayInput);
        string ValidateFacilityManagement(ValidateFacilityManagement validateFacilityManagement);
        FacilityManagement GetFacilityManagementById(GridDisplayInput gridDisplayInput);
        FacilityManagement GetFacilityDetails(int facilityId);
        FacilityManagement GetOwnerDetails(int customerid);
        IEnumerable<OwnerCustomer> GetOwnerForfacility(string searchKey, int CompanyId, int customerCategoryId);
        IEnumerable<TenantCustomer> GetTenantForfacility(string searchKey, int CompanyId, int customerCategoryId);
    }
}
