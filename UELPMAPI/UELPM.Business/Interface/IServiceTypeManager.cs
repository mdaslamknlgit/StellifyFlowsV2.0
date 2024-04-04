using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IServiceTypeManager
    {
        ServiceTypeDisplayResult GetServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput);
        ServiceTypeDisplayResult GetAllServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput);
        string CreateServiceType(ServiceType serviceType);
        string UpdateServiceType(ServiceType serviceType);
        bool DeleteServiceType(int serviceTypeId);       
       
    }
}
