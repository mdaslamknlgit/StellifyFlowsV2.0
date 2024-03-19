using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
   public interface IWorkflowAuditTrailRepository
    {
        WorkflowAuditTrailDisplayResult GetWorkFlowAuditTrails(GridDisplayInput displayInput);
        int CreateWorkflowAuditTrail(WorkflowAuditTrail workflowAuditTrail);
        IEnumerable<WorkflowAuditTrail> GetWorkFlowAuditTrialDetails(WorkflowAuditTrail auditTrail);
    }
}
