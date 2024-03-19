using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IServiceMasterManager
    {
        ServiceMasterDisplayResult GetServices(ServiceMasterDisplayInput serviceMasterDisplayInput);
        ServiceMasterDisplayResult GetAllSearchServices(ServiceMasterDisplayInput serviceMasterDisplayInput);
        string CreateService(ServiceMaster serviceMaster);
        string UpdateService(ServiceMaster serviceMaster);
        bool DeleteService(int serviceMasterId);     
    }
}
