using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IProjectContractVariationOrderRepository
    {           
        ProjectContractVariationOrderDisplayResult GetProjectContractVariationOrders(GridDisplayInput gridDisplayInput);
        ProjectContractVariationOrderDisplayResult GetProjectContractVariationOrdersForApproval(GridDisplayInput gridDisplayInput);
        ProjectContractVariationOrderDisplayResult GetAllSearchProjectContractVariationOrders(ProjectContractVariationOrderSearch projectContractVariationOrderSearch);
        ProjectContractVariationOrder GetProjectContractVariationOrderDetails(int ProjectContractVariationOrderId, int companyId);
        int CreateProjectContractVariationOrder(ProjectMasterContract projectContractVariationOrder);
        //int UpdateProjectContractVariationOrder(ProjectContractVariationOrder projectContractVariationOrder);
        List<VariationOrder> getVOList(GridDisplayInput gridDisplayInput);
        ProjectMasterContract getVODetailsbyId(int POPId, int VOId);
    }
}
