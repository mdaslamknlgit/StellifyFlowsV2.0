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
    public class PurchaseOrderRequestApprovalManager : ManagerBase, IPurchaseOrderRequestApprovalManager
    {
        private readonly IPurchaseOrderRequestApprovalRepository m_purchaseOrderRequestApprovalRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="purchaseOrderCreationRepository"></param>
        public PurchaseOrderRequestApprovalManager(IPurchaseOrderRequestApprovalRepository purchaseOrderRequestApprovalRepository)
        {
            m_purchaseOrderRequestApprovalRepository = purchaseOrderRequestApprovalRepository;
        }
        public PurchaseOrderRequest GetPurchaseOrderRequestApprovalDetails(int purchaseOrderRequestId, int processId, int loggedInUserId)
        {
            return m_purchaseOrderRequestApprovalRepository.GetPurchaseOrderRequestApprovalDetails(purchaseOrderRequestId,processId,loggedInUserId);
        }
        public PurchaseOrderRequestDisplayResult GetPurchaseOrderRequestsApproval(GridDisplayInput purchaseOrderRequestInput)
        {
            return m_purchaseOrderRequestApprovalRepository.GetPurchaseOrderRequestsApproval(purchaseOrderRequestInput);
        }
        public int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval)
        {
            return m_purchaseOrderRequestApprovalRepository.PurchaseOrderRequestStatusUpdate(requestApproval);
        }
        public PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequestApproval(PORSearch purchaseOrderRequestInput)
        {
            return m_purchaseOrderRequestApprovalRepository.GetAllSearchPurchaseOrdersRequestApproval(purchaseOrderRequestInput);
        }

        public byte[] PurchaseOrderRequestApprovalPrint(int purchaseOrderRequestId, int processId, int companyId)
        {
            return m_purchaseOrderRequestApprovalRepository.PurchaseOrderRequestApprovalPrint(purchaseOrderRequestId, processId, companyId);
        }
    }
}
