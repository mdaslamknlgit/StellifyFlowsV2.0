using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class WorkFlowReAssignmentManager: IWorkFlowReAssignmentManager
    {
        private readonly IWorkFlowReAssignmentRepository m_workFlowReAssignmentRepository;
        public WorkFlowReAssignmentManager(IWorkFlowReAssignmentRepository workFlowReAssignmentRepository)
        {
            m_workFlowReAssignmentRepository = workFlowReAssignmentRepository;
        }

        public WorkFlowReAssignment GetUserWorkFlowReAssignDetails(int userId, int companyId)
        {
            return m_workFlowReAssignmentRepository.GetUserWorkFlowReAssignDetails(userId, companyId);
        }

        public int CreateWorkFlowReAssignment(WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            return m_workFlowReAssignmentRepository.CreateWorkFlowReAssignment(workFlowReAssignmentDetails);
        }

        public byte[] GetWorkFlowReAssignmentPDFTemplate(WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            return m_workFlowReAssignmentRepository.GetWorkFlowReAssignmentPDFTemplate(workFlowReAssignmentDetails);
        }

        public string VerifyAlternateUser(int currentUserId,int alternateUserId)
        {
            return m_workFlowReAssignmentRepository.VerifyAlternateUser(currentUserId,alternateUserId);
        }
        
    }
}
