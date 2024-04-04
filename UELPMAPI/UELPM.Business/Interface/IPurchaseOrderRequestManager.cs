using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IPurchaseOrderRequestManager
    {
        PurchaseOrderRequestDisplayResult GetPurchaseOrdersRequest(GridDisplayInput purchaseOrderRequestInput);
        PurchaseOrderRequestDisplayResult GetAllSearchPurchaseOrdersRequest(PORSearch purchaseOrderRequestInput);
        //PurchaseOrderRequestDisplayResult GetAllFilterPurchaseOrdersRequest(PORSearch porFilterDisplayInput);
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
        int PurchaseOrderRequestStatusUpdate(PurchaseOrderRequestApproval requestApproval);
        bool SendPurchaseOrderMailtoSupplier(int purchaseOrderRequestId, int companyId, int processId);
        void SendForApproval(PurchaseOrderRequest purchaseOrder, bool isFromUi);
       
    }
}
