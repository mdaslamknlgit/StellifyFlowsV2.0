using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IFixedAssetPurchaseOrderCreationManager
    {
        PurchaseOrderDisplayResult GetFixedAssetPurchaseOrders(GridDisplayInput purchaseOrderInput);
        FixedAssetPurchaseOrder GetFixedAssetPurchaseOrderDetails(string purchaseOrderId, int companyId);
        int CreateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder);
        int UpdateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder);
        bool DeleteFixedAssetPurchaseOrder(FixedAssetPurchaseOrderDelete purchaseOrderDelete);
        void SendForApproval(FixedAssetPurchaseOrder purchaseOrder, bool isFromUi);
        byte[] DownloadFile(Attachments attachment);
        byte[] DownloadAPOQuotationFile(APOQuotationAttachments aPOQuotationAttachments);
    }
}
