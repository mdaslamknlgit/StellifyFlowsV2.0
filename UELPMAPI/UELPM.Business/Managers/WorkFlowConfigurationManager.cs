using System;
using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class WorkFlowConfigurationManager : ManagerBase, IWorkFlowConfigurationManager
    {
        private readonly IWorkFlowConfigurationRepository m_workFlowConfigurationRepository;

        public WorkFlowConfigurationManager(IWorkFlowConfigurationRepository workFlowConfigurationRepository)
        {
            m_workFlowConfigurationRepository = workFlowConfigurationRepository;
        }

        public IEnumerable<WorkFlowConfiguration> GetWorkFlowConfigurations(int companyId)
        {
            return m_workFlowConfigurationRepository.GetWorkFlowConfigurations(companyId);
        }

        public WorkFlowConfigurationDisplayResult GetWorkFlowConfigurationsByCompany(GridDisplayInput workFlowInput)
        {
            return m_workFlowConfigurationRepository.GetWorkFlowConfigurationsByCompany(workFlowInput);
        }

        public WorkFlowConfigurationDisplayResult GetAllSearchWorkFlowConfigurations(WorkFlowSearch workFlowSearch)
        {
            return m_workFlowConfigurationRepository.GetAllSearchWorkFlowConfigurations(workFlowSearch);
        }      

        public IEnumerable<WorkFlowProcess> GetWorkFlowProcesses(string searchKey)
        {
            return m_workFlowConfigurationRepository.GetWorkFlowProcesses(searchKey);
        }

        public WorkFlowConfiguration GetWorkFlowConfiguration(int processId, int companyId, int locationId)
        {
            return m_workFlowConfigurationRepository.GetWorkFlowConfiguration(processId, companyId, locationId);
        }

        //public IEnumerable<WorkFlow> GetDocumentWorkFlow(List<WorkFlowParameter> workFlowParameters)
        //{
        //    return m_workFlowConfigurationRepository.GetDocumentWorkFlow(workFlowParameters);
        //}   

        public int CreateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            return m_workFlowConfigurationRepository.CreateWorkFlowConfiguration(workFlowConfiguration);
        }

        public int UpdateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            return m_workFlowConfigurationRepository.UpdateWorkFlowConfiguration(workFlowConfiguration);
        }

        public int CreateWorkFlowResponse(WorkFlowResponse workFlowResponse)
        {
            return m_workFlowConfigurationRepository.CreateWorkFlowResponse(workFlowResponse);
        }

        public int UpdateWorkFlowResponse(WorkFlowResponse workFlowResponse)
        {
            return m_workFlowConfigurationRepository.UpdateWorkFlowResponse(workFlowResponse);
        }

        public bool DeleteWorkFlowConfiguration(int configId)
        {
            return m_workFlowConfigurationRepository.DeleteWorkFlowConfiguration(configId);
        }
    }
}
