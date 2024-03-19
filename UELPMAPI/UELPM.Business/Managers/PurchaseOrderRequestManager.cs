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
    public class PurchaseOrderRequestManager : IPurchaseOrderRequestManager
    {
        private readonly IPurchaseOrderRequestRepository m_purchaseOrderRequestRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="purchaseOrderCreationRepository"></param>
        public PurchaseOrderRequestManager(IPurchaseOrderRequestRepository purchaseOrderRequestRepository)
        {
            m_purchaseOrderRequestRepository = purchaseOrderRequestRepository;
        }



        public byte[] PurchaseOrderRequestPrint(int purchaseOrderRequestId, int companyId,int processId)
        {
            return m_purchaseOrderRequestRepository.PurchaseOrderRequestPrint(purchaseOrderRequestId, companyId,processId);
        }

        public int CreatePurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest)
        {
            return m_purchaseOrderRequestRepository.CreatePurchaseOrderRequest(purchaseOrderRequest);
        }

        public bool DeletePurchaseOrderRequest(PurchaseOrderRequestDelete purchaseOrderRequestDelete)
        {
            return m_purchaseOrderRequestRepository.DeletePurchaseOrderRequest(purchaseOrderRequestDelete);
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            return m_purchaseOrderRequestRepository.DownloadFile(attachment);
        }

        public PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequest(PORSearch purchaseOrderRequestInput)
        {
            return m_purchaseOrderRequestRepository.GetAllSearchPurchaseOrdersRequest(purchaseOrderRequestInput);
        }

        public IEnumerable<CostOfServiceTypes> PORequestGetCostOfServiceTypes()
        {
            return m_purchaseOrderRequestRepository.PORequestGetCostOfServiceTypes();
        }

        public IEnumerable<Locations> PORequestGetDepartments()
        {
            return m_purchaseOrderRequestRepository.PORequestGetDepartments();
        }

        public PurchaseOrderRequest GetPurchaseOrderRequestDetails(int purchaseOrderRequestId,int processId)
        {
            return m_purchaseOrderRequestRepository.GetPurchaseOrderRequestDetails(purchaseOrderRequestId,processId);
        }

        public IEnumerable<PurchaseOrderRequestTypes> GetPurchaseOrderRequestTypes()
        {
            return m_purchaseOrderRequestRepository.GetPurchaseOrderRequestTypes();
        }

        public PurchaseOrderRequestDisplayResult GetPurchaseOrdersRequest(GridDisplayInput purchaseOrderRequestInput)
        {
            return m_purchaseOrderRequestRepository.GetPurchaseOrdersRequest(purchaseOrderRequestInput);
        }

        public int UpdatePurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest)
        {
            return m_purchaseOrderRequestRepository.UpdatePurchaseOrderRequest(purchaseOrderRequest);
        }

        public byte[] DownloadQuotationFile(QuotationAttachments quotationAttachment)
        {
            return m_purchaseOrderRequestRepository.DownloadQuotationFile(quotationAttachment);
        }

        public int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval)
        {
            return m_purchaseOrderRequestRepository.PurchaseOrderRequestStatusUpdate(requestApproval);
        }

        public bool SendPurchaseOrderMailtoSupplier(int purchaseOrderRequestId, int companyId,int processId)
        {
            return m_purchaseOrderRequestRepository.SendPurchaseOrderMailtoSupplier(purchaseOrderRequestId, companyId,processId);
        }

        //public PurchaseOrderRequestDisplayResult GetAllFilterPurchaseOrdersRequest(PORSearch porFilterDisplayInput)
        //{
        //    return m_purchaseOrderRequestRepository.GetAllFilterPurchaseOrdersRequest(porFilterDisplayInput);
        //}
        public void SendForApproval(PurchaseOrderRequest purchaseOrder,bool isFromUi)
        {
            m_purchaseOrderRequestRepository.SendForApproval(purchaseOrder, isFromUi);
        }
    }
}
