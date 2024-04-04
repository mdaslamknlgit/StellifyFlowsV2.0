using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IContractPurchaseOrderManager
    {
        ContractPurchaseOrderDisplayResult GetContractPurchaseOrders(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrderDisplayResult GetCPOAccuralManagement(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrderDisplayResult GetCPOAccuralReverse(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrder GetContractPurchaseOrderDetails(string purchaseOrderId);
        int CreateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder);
        int UpdateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder);
        bool DeleteContractPurchaseOrder(ContractPurchaseOrderDelete purchaseOrderDelete);
        byte[] DownloadFile(Attachments attachment);
        void SendForApproval(ContractPurchaseOrder purchaseOrder, bool isFromUi);
        int GeneratePoc(ContractPurchaseOrder purchaseOrder);
        ContractPurchaseOrder[] exportAccrualGL(ContractPurchaseOrder[] contractPurchaseOrderList);
        //List<ContractPurchaseOrder> GetPocList(ContractPurchaseOrder purchaseOrder);
        ContractPurchaseOrderDisplayResult GetPocList(ContractPurchaseOrder purchaseOrder);
        int ChangePOCStatus(List<ContractPurchaseOrder> contractPurchaseOrders, int workflowStatusId);
        int UpdateAccraulCode(ContractPurchaseOrder purchaseOrder);
        int GetPocCount(int CPOID);
        bool UpdateJVACode(string CPONumber, string CPOJVACode);
    }
}
