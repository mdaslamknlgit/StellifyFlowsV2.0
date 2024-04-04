using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IProjectPurchaseOrderRepository
    {
        int CreateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder);
        int DeleteProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder);
        ProjectPurchaseOrderDisplayResult GetProjectPurchaseOrders(GridDisplayInput gridDisplayInput);
        ProjectPurchaseOrder GetProjectPurchaseOrderDetails(int projectPurchaseOrderId);
        int UpdateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder);
    }
}
