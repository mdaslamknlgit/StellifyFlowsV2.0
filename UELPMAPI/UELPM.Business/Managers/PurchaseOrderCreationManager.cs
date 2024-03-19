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
    public  class PurchaseOrderCreationManager : ManagerBase,IPurchaseOrderCreationManager 
    {
        private readonly IPurchaseOrderCreationRepository m_purchaseOrderCreationRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="purchaseOrderCreationRepository"></param>
        public PurchaseOrderCreationManager(IPurchaseOrderCreationRepository purchaseOrderCreationRepository)
        {
            m_purchaseOrderCreationRepository = purchaseOrderCreationRepository;
        }

        public PurchaseOrderDisplayResult GetPurchaseOrders(GridDisplayInput purchaseOrderInput)
        {
            return m_purchaseOrderCreationRepository.GetPurchaseOrders(purchaseOrderInput);
        }

        public PurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput)
        {
            return m_purchaseOrderCreationRepository.GetAllSearchPurchaseOrders(purchaseOrderInput);
        }

        public PurchaseOrder GetPurchaseOrderDetails(string purchaseOrderId, int? companyId)
        {
            return m_purchaseOrderCreationRepository.GetPurchaseOrderDetails(purchaseOrderId, companyId);
        }

        public int CreatePurchaseOrder(PurchaseOrder purchaseOrder)
        {
            return m_purchaseOrderCreationRepository.CreatePurchaseOrder(purchaseOrder);
        }

        public int UpdatePurchaseOrder(PurchaseOrder purchaseOrder)
        {
            return m_purchaseOrderCreationRepository.UpdatePurchaseOrder(purchaseOrder);
        }

        public bool DeletePurchaseOrder(PurchaseOrderDelete purchaseOrderDelete)
        {
            return m_purchaseOrderCreationRepository.DeletePurchaseOrder(purchaseOrderDelete);
        }

        public IEnumerable<PurchaseOrderTypes> GetPurchaseOrderTypes()
        {
            return m_purchaseOrderCreationRepository.GetPurchaseOrderTypes();
        }

        public IEnumerable<CostOfServiceTypes> GetCostOfServiceTypes()
        {
            return m_purchaseOrderCreationRepository.GetCostOfServiceTypes();
        }

        public IEnumerable<Locations> GetDepartments()
        {
            return m_purchaseOrderCreationRepository.GetDepartments();
        }
        public byte[] DownloadFile(Attachments attachment)
        {
            return m_purchaseOrderCreationRepository.DownloadFile(attachment);
        }

        public string ConvertPurchaseOrderToPdf(int purchaseOrderId)
        {
            return m_purchaseOrderCreationRepository.ConvertPurchaseOrderToPdf(purchaseOrderId);
        }

        public int PurchaseOrderStatusUpdate(PurchaseOrderApproval requestApproval)
        {
            return m_purchaseOrderCreationRepository.PurchaseOrderStatusUpdate(requestApproval);
        }

        public void SendForApproval(PurchaseOrder purchaseOrder, bool isFromUi)
        {
             m_purchaseOrderCreationRepository.SendForApproval(purchaseOrder, isFromUi);
        }

        public byte[] PurchaseOrderPrint(int purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            return m_purchaseOrderCreationRepository.PurchaseOrderPrint(purchaseOrderId, purchaseOrderTypeId, companyId);
        }
        
        public byte[] PurchaseOrdersPDFExport(GridDisplayInput purchaseOrderInput)
        {
            return m_purchaseOrderCreationRepository.PurchaseOrdersPDFExport(purchaseOrderInput);
        }
        public bool SendPurchaseOrderMailtoSupplier(int purchaseOrderId, int companyId, int purchaseOrderTypeId)
        {
            return m_purchaseOrderCreationRepository.SendPurchaseOrderMailtoSupplier(purchaseOrderId, companyId, purchaseOrderTypeId);
        }

        public int VoidPurchaseOrder(PurchaseOrderVoid purchaseOrder)
        {
            return m_purchaseOrderCreationRepository.VoidPurchaseOrder(purchaseOrder);
        }

        public int RecallPoApproval(PurchaseOrder purchaseOrder)
        {
            return m_purchaseOrderCreationRepository.RecallPoApproval(purchaseOrder);
        }

        public byte[] DownloadSPOQuotationFile(SPOQuotationAttachments sPOQuotationAttachments)
        {
            return m_purchaseOrderCreationRepository.DownloadSPOQuotationFile(sPOQuotationAttachments);
        }

        public bool SendPurchaseOrderMailtoSupplierContactPerson(EmailSupplier emailSupplier)
        {
            return m_purchaseOrderCreationRepository.SendPurchaseOrderMailtoSupplierContactPerson(emailSupplier);
        }
    }
}
