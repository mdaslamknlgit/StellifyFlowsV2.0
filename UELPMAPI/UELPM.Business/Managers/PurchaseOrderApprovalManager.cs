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
    public class PurchaseOrderApprovalManager : ManagerBase, IPurchaseOrderApprovalManager
    {
        private readonly IPurchaseOrderApprovalRepository m_purchaseOrderApprovalRepository;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="IPurchaseOrderApprovalRepository"></param>
        public PurchaseOrderApprovalManager(IPurchaseOrderApprovalRepository purchaseOrderApprovalRepository)
        {
            m_purchaseOrderApprovalRepository = purchaseOrderApprovalRepository;
        }
        public PurchaseOrderDisplayResult GetPurchaseOrdersForApproval(GridDisplayInput purchaseOrderInput)
        {
            return m_purchaseOrderApprovalRepository.GetPurchaseOrdersForApproval(purchaseOrderInput);
        }
        public PurchaseOrderDisplayResult SearchPurchaseOrdersForApproval(PurchaseOrderSearch purchaseOrderInput)
        {
            return m_purchaseOrderApprovalRepository.SearchPurchaseOrdersForApproval(purchaseOrderInput);
        }
        public int PurchaseOrderRequestStatusUpdate(PurchaseOrderApproval requestApproval)
        {
          return m_purchaseOrderApprovalRepository.PurchaseOrderRequestStatusUpdate(requestApproval);
        }

    }
}
