using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IWorkFlowReAssignmentRepository
    {
        WorkFlowReAssignment GetUserWorkFlowReAssignDetails(int userId, int companyId);
        int CreateWorkFlowReAssignment(WorkFlowReAssignment workFlowReAssignmentDetails);
        string VerifyAlternateUser(int currentUserId,int alternateUserId);
        byte[] GetWorkFlowReAssignmentPDFTemplate(WorkFlowReAssignment workFlowReAssignmentDetails);
    }
}
