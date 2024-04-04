using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class WorkflowAuditTrailManager : IWorkflowAuditTrailManager
    {
        private readonly IWorkflowAuditTrailRepository m_workflowAuditTrailRepository;

        public WorkflowAuditTrailManager(IWorkflowAuditTrailRepository workflowAuditTrailRepository)
        {
            m_workflowAuditTrailRepository = workflowAuditTrailRepository;
        }

        public  WorkflowAuditTrailDisplayResult GetWorkFlowAuditTrails(GridDisplayInput displayInput)
        {
            return m_workflowAuditTrailRepository.GetWorkFlowAuditTrails(displayInput);
        }

        public int CreateWorkflowAuditTrail(WorkflowAuditTrail workflowAuditTrail)
        {
            return m_workflowAuditTrailRepository.CreateWorkflowAuditTrail(workflowAuditTrail);
        }

        public IEnumerable<WorkflowAuditTrail> GetWorkFlowAuditTrialDetails(WorkflowAuditTrail workflowAuditTrail)
        {
            return m_workflowAuditTrailRepository.GetWorkFlowAuditTrialDetails(workflowAuditTrail);
        }
    }
}
