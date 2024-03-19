using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IPurchaseOrderRequestRepository
    {
        PurchaseOrderRequestDisplayResult GetPurchaseOrdersRequest(GridDisplayInput purchaseOrderRequestInput);
        //PurchaseOrderRequestDisplayResult GetAllFilterPurchaseOrdersRequest(PORSearch porFilterDisplayInput);
        PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequest(PORSearch purchaseOrderRequestInput);
        PurchaseOrderRequest GetPurchaseOrderRequestDetails(int purchaseOrderRequestId, int processId);
        int CreatePurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest);
        int UpdatePurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest);
        bool DeletePurchaseOrderRequest(PurchaseOrderRequestDelete purchaseOrderRequestDelete);
        IEnumerable<PurchaseOrderRequestTypes> GetPurchaseOrderRequestTypes();
        IEnumerable<CostOfServiceTypes> PORequestGetCostOfServiceTypes();
        IEnumerable<Locations> PORequestGetDepartments();
        byte[] DownloadFile(Attachments attachment);
        byte[] DownloadQuotationFile(QuotationAttachments quotationAttachment);
        byte[] PurchaseOrderRequestPrint(int purchaseOrderRequestId, int companyId, int processId);
        bool SendPurchaseOrderRequestMail(int? approverUserId, int purchaseOrderRequestId, int processId);
        void SendPurchaseOrderRequestClarificationMail(int? approverUserId, int requesterId, string approverComments, int purchaseOrderRequestId, string purchaseOrderNumber);
        int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval);
        bool SendPurchaseOrderMailtoSupplier(int purchaseOrderRequestId, int companyId, int processId);
        void SendForApproval(PurchaseOrderRequest purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null);
    }
}
