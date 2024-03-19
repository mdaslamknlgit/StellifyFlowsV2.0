using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IWorkFlowReAssignmentManager
    {
        WorkFlowReAssignment GetUserWorkFlowReAssignDetails(int userId, int companyId);
        int CreateWorkFlowReAssignment(WorkFlowReAssignment workFlowReAssignmentDetails);
        string VerifyAlternateUser(int currentUserId,int alternateUserId);
        byte[] GetWorkFlowReAssignmentPDFTemplate(WorkFlowReAssignment workFlowReAssignmentDetails);
        
    }
}
