using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IFixedAssetPurchaseOrderCreationRepository
    {
        PurchaseOrderDisplayResult GetFixedAssetPurchaseOrders(GridDisplayInput purchaseOrderInput);
        FixedAssetPurchaseOrder GetFixedAssetPurchaseOrderDetails(string purchaseOrderId, int companyId);
        int CreateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder);
        int UpdateFixedAssetPurchaseOrder(FixedAssetPurchaseOrder purchaseOrder);
        bool DeleteFixedAssetPurchaseOrder(FixedAssetPurchaseOrderDelete purchaseOrderDelete);
        byte[] DownloadFile(Attachments attachment);
        byte[] DownloadAPOQuotationFile(APOQuotationAttachments aPOQuotationAttachments);
        void SendForApproval(FixedAssetPurchaseOrder purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null);
       
        //string ConvertFixedAssetPurchaseOrderToPdf(int purchaseOrderId);
    }
}
