using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IProjectPurchaseOrderManager
    {
        int CreateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder);
        int DeleteProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder);
        ProjectPurchaseOrderDisplayResult GetProjectPurchaseOrders(GridDisplayInput gridDisplayInput);
        ProjectPurchaseOrder GetProjectPurchaseOrderDetails(int projectPurchaseOrderId);
        int UpdateProjectPurchaseOrder(ProjectPurchaseOrder projectPurchaseOrder);
    }
}
