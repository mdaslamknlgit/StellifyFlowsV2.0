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
    public class QuotationRequestManager : IQuotationRequestManager
    {
        private readonly IQuotationRequestRepository m_quotationRequestRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="purchaseOrderCreationRepository"></param>
        public QuotationRequestManager(IQuotationRequestRepository quotationRequestRepository)
        {
            m_quotationRequestRepository = quotationRequestRepository;
        }

        public int CreateQuotationRequest(QuotationRequest quotationRequest)
        {
            return m_quotationRequestRepository.CreateQuotationRequest(quotationRequest);
        }

        public bool DeleteQuotationRequest(QuotationRequestDelete quotationRequestDelete)
        {
            return m_quotationRequestRepository.DeleteQuotationRequest(quotationRequestDelete);
        }

        public QuotationRequestDisplayResult GetAllSearchQuotationRequest(GridDisplayInput quotationRequestInput)
        {
            return m_quotationRequestRepository.GetAllSearchQuotationRequest(quotationRequestInput);
        }

        public QuotationRequestDisplayResult GetFilterQuotationRequest(QuotationFilterDisplayInput quotationFilterDisplayInput)
        {
            return m_quotationRequestRepository.GetFilterQuotationRequest(quotationFilterDisplayInput);
        }

        //public QuotationRequest GetPurchaseQuotationRequestDetails(int purchaseOrderRequestId)
        //{
        //    return m_quotationRequestRepository.GetPurchaseQuotationRequestDetails(purchaseOrderRequestId);
        //}

        public QuotationRequest GetQuotationRequestDetails(int quotationRequestId)
        {
            return m_quotationRequestRepository.GetQuotationRequestDetails(quotationRequestId);
        }

        public QuotationRequestDisplayResult GetQuotationsRequest(GridDisplayInput quotationRequestInput)
        {
            return m_quotationRequestRepository.GetQuotationsRequest(quotationRequestInput);
        }

        public int UpdateQuotationRequest(QuotationRequest quotationRequest)
        {
            return m_quotationRequestRepository.UpdateQuotationRequest(quotationRequest);
        }

        public byte[] QuotationRequestPrint(int quotationRequestId, int companyId)
        {
            return m_quotationRequestRepository.QuotationRequestPrint(quotationRequestId, companyId);
        }

        public bool SendQuotationRequestMailtoSupplier(int quotationRequestId, int companyId)
        {
            return m_quotationRequestRepository.SendQuotationRequestMailtoSupplier(quotationRequestId, companyId);
        }
        public int SelectQuotation(int QuotationRequestId, int QuotationId)
        {
            return m_quotationRequestRepository.SelectQuotation(QuotationRequestId, QuotationId);
        }
    }
}
