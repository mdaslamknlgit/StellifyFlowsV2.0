using UELPM.Model.Models;

namespace UELPM.Service.Repositories
{
    public interface IRequestTypeRepository
    {
        RequestTypeGrid GetRequestTypes(GridDisplayInput gridDisplayInput);
        RequestTypeGrid GetAllSearchRequestTypes(GridDisplayInput gridDisplayInput);
        RequestType GetRequestType(int requestTypeId);
        int CreateRequestType(RequestType requestType);
        int UpdateRequestType(RequestType requestType);
        bool DeleteRequestType(int requestTypeId);
    }
}
