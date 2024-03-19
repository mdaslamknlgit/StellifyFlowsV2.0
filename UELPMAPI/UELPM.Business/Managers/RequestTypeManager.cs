using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class RequestTypeManager : IRequestTypeManager
    {
        private readonly IRequestTypeRepository m_requestTypeRepository;

        public RequestTypeManager(IRequestTypeRepository requestTypeRepository)
        {
            m_requestTypeRepository = requestTypeRepository;
        }

        public RequestTypeGrid GetRequestTypes(GridDisplayInput gridDisplayInput)
        {
            return m_requestTypeRepository.GetRequestTypes(gridDisplayInput);
        }

        public RequestTypeGrid GetAllSearchRequestTypes(GridDisplayInput gridDisplayInput)
        {
            return m_requestTypeRepository.GetAllSearchRequestTypes(gridDisplayInput);
        }

        public RequestType GetRequestType(int requestTypeId)
        {
            return m_requestTypeRepository.GetRequestType(requestTypeId);
        }

        public int CreateRequestType(RequestType requestType)
        {
            return m_requestTypeRepository.CreateRequestType(requestType);
        }

        public int UpdateRequestType(RequestType requestType)
        {
            return m_requestTypeRepository.UpdateRequestType(requestType);
        }

        public bool DeleteRequestType(int requestTypeId)
        {
            return m_requestTypeRepository.DeleteRequestType(requestTypeId);
        }
    }
}
