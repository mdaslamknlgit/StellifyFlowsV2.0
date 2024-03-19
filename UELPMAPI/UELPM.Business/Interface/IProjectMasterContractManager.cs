using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IProjectMasterContractManager
    {
        int CreateProjectMasterContract(ProjectMasterContract projectMasterContract);
        int DeleteProjectMasterContract(ProjectMasterContract projectMasterContract);
        ProjectMasterContract GetProjectMasterContractDetails(int projectMasterContractId);
        ProjectMasterContractDisplayResult GetProjectMasterContracts(GridDisplayInput gridDisplayInput);
        int UpdateProjectMasterContract(ProjectMasterContract projectMasterContract);
        List<CostType> CostTypes();
        ProjectMasterContractDisplayResult GetProjectMasterContractsForApproval(GridDisplayInput gridDisplayInput);
        ProjectMasterContractDisplayResult GetProjectMasterContractsSearchResult(ProjectMasterContractSearch projectMasterContractSearch);
        byte[] DownloadFile(Attachments attachment);
        ProjectMasterContractDisplayResult GetProjectMasterApprovedDetails(int companyId, int userId);
        ProjectMasterContractDisplayResult GetPaymentProjectMasterFilterData(ProjectMasterContractFilter projectMasterContractFilter);
    }
}
