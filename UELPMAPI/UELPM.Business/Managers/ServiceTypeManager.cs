using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ServiceTypeManager : ManagerBase, IServiceTypeManager
    {
        private readonly IServiceTypeRepository m_serviceTypeRepository;
        public ServiceTypeManager(IServiceTypeRepository serviceTypeRepository)
        {
            m_serviceTypeRepository = serviceTypeRepository;
        }

        public ServiceTypeDisplayResult GetServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput)
        {
            return m_serviceTypeRepository.GetServiceTypes(serviceTypeDisplayInput);
        }

        public ServiceTypeDisplayResult GetAllServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput)
        {
            return m_serviceTypeRepository.GetAllServiceTypes(serviceTypeDisplayInput);
        }

        public string CreateServiceType(ServiceType serviceType)
        {
            return m_serviceTypeRepository.CreateServiceType(serviceType);
        }

        public string UpdateServiceType(ServiceType serviceType)
        {
            return m_serviceTypeRepository.UpdateServiceType(serviceType);
        }

        public bool DeleteServiceType(int serviceTypeId)
        {
            return m_serviceTypeRepository.DeleteServiceType(serviceTypeId);
        }

      
     
    }
}
