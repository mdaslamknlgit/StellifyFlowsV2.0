using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IServiceTypeRepository
    {
        ServiceTypeDisplayResult GetServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput);
        ServiceTypeDisplayResult GetAllServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput);
        string CreateServiceType(ServiceType serviceType);
        string UpdateServiceType(ServiceType serviceType);
        bool DeleteServiceType(int serviceTypeId);
    }
}
