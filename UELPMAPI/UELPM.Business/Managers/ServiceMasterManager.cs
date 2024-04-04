using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ServiceMasterManager : ManagerBase, IServiceMasterManager
    {
        private readonly IServiceMasterRepository m_serviceMasterRepository;

        public ServiceMasterManager(IServiceMasterRepository serviceMasterRepository)
        {
            m_serviceMasterRepository = serviceMasterRepository;
        }

        public ServiceMasterDisplayResult GetServices(ServiceMasterDisplayInput serviceMasterDisplayInput)
        {
            return m_serviceMasterRepository.GetServices(serviceMasterDisplayInput);
        }

        public ServiceMasterDisplayResult GetAllSearchServices(ServiceMasterDisplayInput serviceMasterDisplayInput)
        {
            return m_serviceMasterRepository.GetAllSearchServices(serviceMasterDisplayInput);
        }

        public string CreateService(ServiceMaster serviceMaster)
        {
            return m_serviceMasterRepository.CreateService(serviceMaster);
        }

        public string UpdateService(ServiceMaster serviceMasterr)
        {
            return m_serviceMasterRepository.UpdateService(serviceMasterr);
        }

        public bool DeleteService(int serviceMasterId)
        {
            return m_serviceMasterRepository.DeleteService(serviceMasterId);
        }

    }
}
