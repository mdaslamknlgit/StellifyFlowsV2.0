using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IQuotationRequestManager
    {
        QuotationRequestDisplayResult GetQuotationsRequest(GridDisplayInput quotationRequestInput);
        QuotationRequestDisplayResult GetFilterQuotationRequest(QuotationFilterDisplayInput quotationFilterDisplayInput);
        QuotationRequest GetQuotationRequestDetails(int quotationRequestId);
        bool DeleteQuotationRequest(QuotationRequestDelete quotationRequestDelete);
        //QuotationRequest GetPurchaseQuotationRequestDetails(int purchaseOrderRequestId);
        int CreateQuotationRequest(QuotationRequest quotationRequest);
        int UpdateQuotationRequest(QuotationRequest quotationRequest);
        QuotationRequestDisplayResult GetAllSearchQuotationRequest(GridDisplayInput quotationRequestInput);
        byte[] QuotationRequestPrint(int quotationRequestId, int companyId);
        bool SendQuotationRequestMailtoSupplier(int quotationRequestId, int companyId);
        int SelectQuotation(int QuotationRequestId, int QuotationId);
    }
}
