using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IPurchaseOrderRequestApprovalRepository
    {
        PurchaseOrderRequestDisplayResult GetPurchaseOrderRequestsApproval(GridDisplayInput purchaseOrderRequestInput);
        PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequestApproval(PORSearch purchaseOrderRequestInput);
        PurchaseOrderRequest GetPurchaseOrderRequestApprovalDetails(int purchaseOrderRequestId, int processId, int loggedInUserId);
        int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval);
        byte[] PurchaseOrderRequestApprovalPrint(int purchaseOrderRequestId, int processId, int companyId);
    }
}
