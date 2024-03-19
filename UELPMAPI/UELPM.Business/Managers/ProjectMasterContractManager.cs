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
    public class ProjectMasterContractManager: IProjectMasterContractManager
    {
        private readonly IProjectMasterContractRepository m_projectContractRepository;

        public ProjectMasterContractManager(IProjectMasterContractRepository projectMasterContractRepository)
        {
            m_projectContractRepository = projectMasterContractRepository;
        }

        public List<CostType> CostTypes()
        {
            return m_projectContractRepository.CostTypes();
        }

        public int CreateProjectMasterContract(ProjectMasterContract projectMasterContract)
        {
            return m_projectContractRepository.CreateProjectMasterContract(projectMasterContract);
        }

        public int DeleteProjectMasterContract(ProjectMasterContract projectMasterContract)
        {
            return m_projectContractRepository.DeleteProjectMasterContract(projectMasterContract);
        }

        public ProjectMasterContract GetProjectMasterContractDetails(int projectMasterContractId)
        {
            return m_projectContractRepository.GetProjectMasterContractDetails(projectMasterContractId);
        }

        public ProjectMasterContractDisplayResult GetProjectMasterContracts(GridDisplayInput gridDisplayInput)
        {
            return m_projectContractRepository.GetProjectMasterContracts(gridDisplayInput);
        }

        public ProjectMasterContractDisplayResult GetProjectMasterContractsForApproval(GridDisplayInput gridDisplayInput)
        {
            return m_projectContractRepository.GetProjectMasterContractsForApproval(gridDisplayInput);
        }

        public int UpdateProjectMasterContract(ProjectMasterContract projectMasterContract)
        {
            return m_projectContractRepository.UpdateProjectMasterContract(projectMasterContract);
        }

        public ProjectMasterContractDisplayResult GetProjectMasterContractsSearchResult(ProjectMasterContractSearch projectMasterContractSearch)
        {
            return m_projectContractRepository.GetProjectMasterContractsSearchResult(projectMasterContractSearch);
        }
        public byte[] DownloadFile(Attachments attachment)
        {
            return m_projectContractRepository.DownloadFile(attachment);
        }
        public ProjectMasterContractDisplayResult GetProjectMasterApprovedDetails(int companyId, int userId)
        {
            return m_projectContractRepository.GetProjectMasterApprovedDetails(companyId,userId);
        }
        public ProjectMasterContractDisplayResult GetPaymentProjectMasterFilterData(ProjectMasterContractFilter projectMasterContractFilter)
        {
            return m_projectContractRepository.GetPaymentProjectMasterFilterData(projectMasterContractFilter);
        }

    }
}
