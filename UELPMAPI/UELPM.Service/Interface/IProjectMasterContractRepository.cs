using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IProjectMasterContractRepository
    {
        int CreateProjectMasterContract(ProjectMasterContract projectMasterContract);
        int DeleteProjectMasterContract(ProjectMasterContract projectMasterContract);
        ProjectMasterContract GetProjectMasterContractDetails(int projectMasterContractId);
        ProjectMasterContractDisplayResult GetProjectMasterContracts(GridDisplayInput gridDisplayInput);
        ProjectMasterContractDisplayResult GetProjectMasterContractsForApproval(GridDisplayInput gridDisplayInput);
        int UpdateProjectMasterContract(ProjectMasterContract projectMasterContract);
        List<CostType> CostTypes();
        ProjectMasterContractDisplayResult GetProjectMasterContractsSearchResult(ProjectMasterContractSearch projectMasterContractSearch);
        byte[] DownloadFile(Attachments attachment);
        ProjectMasterContractDisplayResult GetProjectMasterApprovedDetails(int companyId, int userId);
        ProjectMasterContractDisplayResult GetPaymentProjectMasterFilterData(ProjectMasterContractFilter projectMasterContractFilter);
    }
}
