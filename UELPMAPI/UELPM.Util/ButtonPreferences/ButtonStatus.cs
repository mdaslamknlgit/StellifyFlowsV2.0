using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Util.ButtonPreference
{
    public static class ButtonStatus
    {
        public static ButtonPreferences SetStatus(int workflowStatusId)
        {
            return new ButtonPreferences
            {
                CancelDraft = (workflowStatusId == (int)WorkFlowStatus.Draft) ? true : false,
                Submit = (workflowStatusId == (int)WorkFlowStatus.Draft || workflowStatusId == (int)WorkFlowStatus.CancelledApproval) ? true : false,
                SendForApproval = (workflowStatusId == (int)WorkFlowStatus.Draft || workflowStatusId == (int)WorkFlowStatus.CancelledApproval) ? true : false,
                CancelApproval = (workflowStatusId == (int)WorkFlowStatus.ApprovalInProgress || workflowStatusId == (int)WorkFlowStatus.AskedForClarification) ? true : false,
                Approve = (workflowStatusId == (int)WorkFlowStatus.ApprovalInProgress || workflowStatusId == (int)WorkFlowStatus.AskedForClarification) ? true : false,
                Reject = (workflowStatusId == (int)WorkFlowStatus.ApprovalInProgress || workflowStatusId == (int)WorkFlowStatus.AskedForClarification) ? true : false,
                Verify = (workflowStatusId == (int)WorkFlowStatus.ApprovalInProgress || workflowStatusId == (int)WorkFlowStatus.AskedForClarification) ? true : false,
                Void = (workflowStatusId == (int)WorkFlowStatus.Completed) ? true : false,
                SendForClarification = (workflowStatusId == (int)WorkFlowStatus.ApprovalInProgress || workflowStatusId == (int)WorkFlowStatus.AskedForClarification) ? true : false,
                ReplyForClarification = (workflowStatusId == (int)WorkFlowStatus.ApprovalInProgress || workflowStatusId == (int)WorkFlowStatus.AskedForClarification) ? true : false,
                Edit = (workflowStatusId == (int)WorkFlowStatus.Draft || workflowStatusId == (int)WorkFlowStatus.CancelledApproval) ? true : false,
                ReVerify = ((workflowStatusId == (int)WorkFlowStatus.Completed || workflowStatusId == (int)WorkFlowStatus.Approved || workflowStatusId == (int)WorkFlowStatus.Open) && workflowStatusId != (int)WorkFlowStatus.Exported) ? true : false,
                Export = (workflowStatusId == (int)WorkFlowStatus.Completed || workflowStatusId == (int)WorkFlowStatus.Open) ? true : false,
                Print = (workflowStatusId == (int)WorkFlowStatus.Rejected) ? false : true
            };
        }
    }
}
