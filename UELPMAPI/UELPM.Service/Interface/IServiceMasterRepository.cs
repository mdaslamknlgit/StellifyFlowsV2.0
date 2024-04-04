using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IServiceMasterRepository
    {
        ServiceMasterDisplayResult GetServices(ServiceMasterDisplayInput serviceMasterDisplayInput);
        ServiceMasterDisplayResult GetAllSearchServices(ServiceMasterDisplayInput serviceMasterDisplayInput);
        string CreateService(ServiceMaster serviceMaster);
        string UpdateService(ServiceMaster serviceMaster);
        bool DeleteService(int serviceMasterId);
    }
}
