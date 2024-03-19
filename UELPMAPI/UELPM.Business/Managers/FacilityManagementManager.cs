using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class FacilityManagementManager : IFacilityManagementManager
    {
        private readonly IFacilityManagementRepository m_facilityManagementRepository;

        public FacilityManagementManager(IFacilityManagementRepository facilityManagementRepository)
        {
            m_facilityManagementRepository = facilityManagementRepository;
        }

        public string CreateFacilityManagement(FacilityManagement m_facilityManagement)
        {
            return m_facilityManagementRepository.CreateFacilityManagement(m_facilityManagement);
        }

        public bool DeleteFacilityManagement(int facilityId)
        {
            return m_facilityManagementRepository.DeleteFacilityManagement(facilityId);
        }

        public FacilityManagement GetFacilityDetails(int facilityId)
        {
            return m_facilityManagementRepository.GetFacilityDetails(facilityId);
        }

        public FacilityManagementDisplayResult GetFacilityManagement(GridDisplayInput gridDisplayInput)
        {
            return m_facilityManagementRepository.GetFacilityManagement(gridDisplayInput);
        }

        public FacilityManagement GetFacilityManagementById(GridDisplayInput gridDisplayInput)
        {
            return m_facilityManagementRepository.GetFacilityManagementById(gridDisplayInput);
        }

        public FacilityManagement GetOwnerDetails(int customerid)
        {
            return m_facilityManagementRepository.GetOwnerDetails(customerid);
        }

        public IEnumerable<OwnerCustomer> GetOwnerForfacility(string searchKey, int CompanyId, int customerCategoryId)
        {
            return m_facilityManagementRepository.GetOwnerForfacility(searchKey, CompanyId, customerCategoryId);
        }

        public IEnumerable<TenantCustomer> GetTenantForfacility(string searchKey, int CompanyId, int customerCategoryId)
        {
            return m_facilityManagementRepository.GetTenantForfacility(searchKey, CompanyId, customerCategoryId);
        }

        public string UpdateFacilityManagement(FacilityManagement m_facilityManagement)
        {
            return m_facilityManagementRepository.UpdateFacilityManagement(m_facilityManagement);
        }

        public string ValidateFacilityManagement(ValidateFacilityManagement validateFacilityManagement)
        {
            return m_facilityManagementRepository.ValidateFacilityManagement(validateFacilityManagement);
        }
    }
}
