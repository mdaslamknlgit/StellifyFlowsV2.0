using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IWorkFlowConfigurationManager
    {
        IEnumerable<WorkFlowConfiguration> GetWorkFlowConfigurations(int companyId);
        WorkFlowConfigurationDisplayResult GetWorkFlowConfigurationsByCompany(GridDisplayInput workFlowInput);
        IEnumerable<WorkFlowProcess> GetWorkFlowProcesses(string searchKey);
        WorkFlowConfiguration GetWorkFlowConfiguration(int processId, int companyId, int locationId);
        WorkFlowConfigurationDisplayResult GetAllSearchWorkFlowConfigurations(WorkFlowSearch workFlowSearch);
        //IEnumerable<WorkFlow> GetDocumentWorkFlow(List<WorkFlowParameter> workFlowParameters);
        int CreateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration);
        int UpdateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration);
        int CreateWorkFlowResponse(WorkFlowResponse workFlowResponse);
        int UpdateWorkFlowResponse(WorkFlowResponse workFlowResponse);
        bool DeleteWorkFlowConfiguration(int configId);       
    }
}
