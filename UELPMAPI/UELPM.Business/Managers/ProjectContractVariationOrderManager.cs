using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ProjectContractVariationOrderManager : IProjectContractVariationOrderManager
    {
        private readonly IProjectContractVariationOrderRepository m_projectContractVariationOrderRepository;      

        public ProjectContractVariationOrderManager(IProjectContractVariationOrderRepository projectContractVariationOrderRepository)
        {
            m_projectContractVariationOrderRepository = projectContractVariationOrderRepository;
        }
        
        public ProjectContractVariationOrderDisplayResult GetProjectContractVariationOrders(GridDisplayInput gridDisplayInput)
        {
            return m_projectContractVariationOrderRepository.GetProjectContractVariationOrders(gridDisplayInput);
        }

        public ProjectContractVariationOrderDisplayResult GetProjectContractVariationOrdersForApproval(GridDisplayInput gridDisplayInput)
        {
            return m_projectContractVariationOrderRepository.GetProjectContractVariationOrdersForApproval(gridDisplayInput);
        }
        
        public ProjectContractVariationOrderDisplayResult GetAllSearchProjectContractVariationOrders(ProjectContractVariationOrderSearch projectContractVariationOrderSearch)
        {
            return m_projectContractVariationOrderRepository.GetAllSearchProjectContractVariationOrders(projectContractVariationOrderSearch);
        }

        public ProjectContractVariationOrder GetProjectContractVariationOrderDetails(int ProjectContractVariationOrderId, int companyId)
        {
            return m_projectContractVariationOrderRepository.GetProjectContractVariationOrderDetails(ProjectContractVariationOrderId, companyId);
        }
        
        public int CreateProjectContractVariationOrder(ProjectMasterContract projectContractVariationOrder)
        {
            return m_projectContractVariationOrderRepository.CreateProjectContractVariationOrder(projectContractVariationOrder);
        }     

        //public int UpdateProjectContractVariationOrder(ProjectContractVariationOrder projectContractVariationOrder)
        //{
        //    return m_projectContractVariationOrderRepository.UpdateProjectContractVariationOrder(projectContractVariationOrder);
        //}
        public List<VariationOrder> getVOList(GridDisplayInput gridDisplayInput)
        {
            return m_projectContractVariationOrderRepository.getVOList(gridDisplayInput);
        }
        public ProjectMasterContract getVODetailsbyId(int POPId, int VOId)
        {
            return m_projectContractVariationOrderRepository.getVODetailsbyId(POPId,VOId);
        }
    }
}
