using System.Collections.Generic;
using System.Data;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IWorkFlowConfigurationRepository
    {
        IEnumerable<WorkFlowConfiguration> GetWorkFlowConfigurations(int companyId);
        WorkFlowConfigurationDisplayResult GetWorkFlowConfigurationsByCompany(GridDisplayInput workFlowInput);
        IEnumerable<WorkFlowProcess> GetWorkFlowProcesses(string searchKey);
        WorkFlowConfigurationDisplayResult GetAllSearchWorkFlowConfigurations(WorkFlowSearch workFlowSearch);
        WorkFlowConfiguration GetWorkFlowConfiguration(int processId, int companyId, int locationId);
        IEnumerable<WorkFlow> GetDocumentWorkFlow(List<WorkFlowParameter> workFlowParameters, IDbTransaction dbTransactionObj, IDbConnection dbConnectionObj);
        int CreateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration);
        int UpdateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration);
        int CreateWorkFlowResponse(WorkFlowResponse workFlowResponse);
        int UpdateWorkFlowResponse(WorkFlowResponse workFlowResponse);
        bool DeleteWorkFlowConfiguration(int configId);
    }
}
