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
    public class ProjectPurchaseOrderManager : ManagerBase, IProjectPurchaseOrderManager
    {
        private readonly IProjectPurchaseOrderRepository m_projectPurchaseOrderRepository;

        public ProjectPurchaseOrderManager(IProjectPurchaseOrderRepository projectPurchaseOrderRepository)
        {
            m_projectPurchaseOrderRepository = projectPurchaseOrderRepository;
        }

        public int CreateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder)
        {
            return m_projectPurchaseOrderRepository.CreateProjectPurchaseOrder(projectPurchaseOrder);
        }

        public int DeleteProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder)
        {
            return m_projectPurchaseOrderRepository.DeleteProjectPurchaseOrder(projectPurchaseOrder);
        }

        public ProjectPurchaseOrderDisplayResult GetProjectPurchaseOrders(GridDisplayInput gridDisplayInput)
        {
            return m_projectPurchaseOrderRepository.GetProjectPurchaseOrders(gridDisplayInput);
        }

        public ProjectPurchaseOrder GetProjectPurchaseOrderDetails(int projectPurchaseOrderId)
        {
            return m_projectPurchaseOrderRepository.GetProjectPurchaseOrderDetails(projectPurchaseOrderId);
        }

        public int UpdateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder)
        {
            return m_projectPurchaseOrderRepository.UpdateProjectPurchaseOrder(projectPurchaseOrder);
        }
    }
}
