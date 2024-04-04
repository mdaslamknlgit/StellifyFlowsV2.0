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
    public class ServiceCategoryManager : IServiceCategoryManager
    {
        private readonly IServiceCategoryRepository m_serviceCategoryRepository;


        public ServiceCategoryManager(IServiceCategoryRepository serviceCategoryRepository)
        {
            m_serviceCategoryRepository = serviceCategoryRepository;
        }
        public int CreateServiceCategory(ServiceCategory serviceCategory)
        {
            return m_serviceCategoryRepository.CreateServiceCategory(serviceCategory);
        }

        public bool DeleteServiceCategory(ServiceCategory serviceCategory)
        {
            return m_serviceCategoryRepository.DeleteServiceCategory(serviceCategory);
        }

        public ServiceCategoryDisplayResult GetAllServiceCategory(GridDisplayInput displayInput)
        {
            return m_serviceCategoryRepository.GetAllServiceCategory(displayInput);
        }

        public ServiceCategoryDisplayResult GetServiceCategory(GridDisplayInput displayInput)
        {
            return m_serviceCategoryRepository.GetServiceCategory(displayInput);
        }

        public ServiceCategory GetServiceCategory(int serviceCategoryId)
        {
            return m_serviceCategoryRepository.GetServiceCategory(serviceCategoryId);
        }

        public int UpdateServiceCategory(ServiceCategory serviceCategory)
        {
            return m_serviceCategoryRepository.UpdateServiceCategory(serviceCategory);
        }

        public int ValidateServiceName(ServiceCategory serviceCategory)
        {
            return m_serviceCategoryRepository.ValidateServiceName(serviceCategory);
        }
    }
}
