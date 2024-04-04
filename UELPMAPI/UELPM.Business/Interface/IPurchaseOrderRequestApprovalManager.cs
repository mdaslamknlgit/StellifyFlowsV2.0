using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IPurchaseOrderRequestApprovalManager
    {
        PurchaseOrderRequestDisplayResult GetPurchaseOrderRequestsApproval(GridDisplayInput purchaseOrderRequestInput);
        PurchaseOrderRequest GetPurchaseOrderRequestApprovalDetails(int purchaseOrderRequestId, int processId, int loggedInUserId);
        int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval);
        PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequestApproval(PORSearch purchaseOrderRequestInput);
        byte[] PurchaseOrderRequestApprovalPrint(int purchaseOrderRequestId, int processId, int companyId);
    }
}
