using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IPurchaseOrderCreationRepository
    {
        PurchaseOrderDisplayResult GetPurchaseOrders(GridDisplayInput purchaseOrderInput);

        PurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput);

        PurchaseOrder GetPurchaseOrderDetails(string purchaseOrderId, int? companyId);

        int CreatePurchaseOrder(PurchaseOrder purchaseOrder);

        int UpdatePurchaseOrder(PurchaseOrder purchaseOrder);

        bool DeletePurchaseOrder(PurchaseOrderDelete purchaseOrderDelete);

        IEnumerable<PurchaseOrderTypes> GetPurchaseOrderTypes();

        IEnumerable<CostOfServiceTypes> GetCostOfServiceTypes();

        IEnumerable<Locations> GetDepartments();

        byte[] DownloadFile(Attachments attachment);

        string ConvertPurchaseOrderToPdf(int purchaseOrderId);

        int PurchaseOrderStatusUpdate(PurchaseOrderApproval requestApproval);

        void SendForApproval(PurchaseOrder purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null);

        byte[] PurchaseOrderPrint(int purchaseOrderId, int purchaseOrderTypeId, int companyId);

        byte[] PurchaseOrdersPDFExport(GridDisplayInput purchaseOrderInput);

        
        bool SendPurchaseOrderMailtoSupplier(int purchaseOrderId, int companyId, int purchaseOrderTypeId);

        bool SendPurchaseOrderMailtoSupplierContactPerson(EmailSupplier emailSupplier);

        int VoidPurchaseOrder(PurchaseOrderVoid purchaseOrder);

        int RecallPoApproval(PurchaseOrder purchaseOrder);

        byte[] DownloadSPOQuotationFile(SPOQuotationAttachments sPOQuotationAttachments);
        string GetPurchaseOrderCode(int purchaseOrderId, int PoTypeId);
    }

}
