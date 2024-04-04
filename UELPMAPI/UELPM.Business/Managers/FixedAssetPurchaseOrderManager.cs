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
    public class FixedAssetPurchaseOrderManager : ManagerBase, IFixedAssetPurchaseOrderCreationManager
    {
        private readonly IFixedAssetPurchaseOrderCreationRepository m_fixedAssetPurchaseOrderCreationRepository;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="purchaseOrderCreationRepository"></param>
        public FixedAssetPurchaseOrderManager(IFixedAssetPurchaseOrderCreationRepository fixedAssetPurchaseOrderCreationRepository)
        {
            m_fixedAssetPurchaseOrderCreationRepository = fixedAssetPurchaseOrderCreationRepository;
        }
        public PurchaseOrderDisplayResult GetFixedAssetPurchaseOrders(GridDisplayInput purchaseOrderInput)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.GetFixedAssetPurchaseOrders(purchaseOrderInput);
        }
        public FixedAssetPurchaseOrder GetFixedAssetPurchaseOrderDetails(string purchaseOrderId, int companyId)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId, companyId);
        }
        public int CreateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.CreateFixedAssetPurchaseOrder(purchaseOrder);
        }
        public int UpdateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.UpdateFixedAssetPurchaseOrder(purchaseOrder);
        }
        public bool DeleteFixedAssetPurchaseOrder(FixedAssetPurchaseOrderDelete purchaseOrderDelete)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.DeleteFixedAssetPurchaseOrder(purchaseOrderDelete);
        }
        public byte[] DownloadFile(Attachments attachment)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.DownloadFile(attachment);
        }
        public void SendForApproval(FixedAssetPurchaseOrder purchaseOrder, bool isFromUi)
        {
            m_fixedAssetPurchaseOrderCreationRepository.SendForApproval(purchaseOrder, isFromUi);
        }

        public byte[] DownloadAPOQuotationFile(APOQuotationAttachments aPOQuotationAttachments)
        {
            return m_fixedAssetPurchaseOrderCreationRepository.DownloadAPOQuotationFile(aPOQuotationAttachments);
        }
    }
}
