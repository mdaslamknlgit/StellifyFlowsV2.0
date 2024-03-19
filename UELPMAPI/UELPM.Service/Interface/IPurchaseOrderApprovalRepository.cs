using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IPurchaseOrderApprovalRepository
    {
        PurchaseOrderDisplayResult GetPurchaseOrdersForApproval(GridDisplayInput purchaseOrderInput);
        PurchaseOrderDisplayResult SearchPurchaseOrdersForApproval(PurchaseOrderSearch purchaseOrderInput);
        int PurchaseOrderRequestStatusUpdate(PurchaseOrderApproval requestApproval);
    }
}
