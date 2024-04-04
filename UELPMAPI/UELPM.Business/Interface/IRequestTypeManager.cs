using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IRequestTypeManager
    {
        RequestTypeGrid GetRequestTypes(GridDisplayInput gridDisplayInput);
        RequestTypeGrid GetAllSearchRequestTypes(GridDisplayInput gridDisplayInput);     
        RequestType GetRequestType(int requestTypeId);
        int CreateRequestType(RequestType requestType);
        int UpdateRequestType(RequestType requestType);
        bool DeleteRequestType(int supplierId);      
    }
}
