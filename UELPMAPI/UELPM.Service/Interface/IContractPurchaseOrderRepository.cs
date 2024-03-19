using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IContractPurchaseOrderRepository
    {
        ContractPurchaseOrderDisplayResult GetContractPurchaseOrders(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrder GetContractPurchaseOrderDetails(string purchaseOrderId);
        int CreateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder);
        int UpdateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder);
        bool DeleteContractPurchaseOrder(ContractPurchaseOrderDelete purchaseOrderDelete);
        byte[] DownloadFile(Attachments attachment);
        void SendForApproval(ContractPurchaseOrder purchaseOrder,bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null);
        int GeneratePoc(ContractPurchaseOrder purchaseOrder);
        //List<ContractPurchaseOrder> GetPocList(ContractPurchaseOrder purchaseOrder);
        ContractPurchaseOrderDisplayResult GetPocList(ContractPurchaseOrder purchaseOrder);
        ContractPurchaseOrder[] exportAccrualGL(ContractPurchaseOrder[] contractPurchaseOrderList);
        int ChangePOCStatus(List<ContractPurchaseOrder> contractPurchaseOrders,int workflowStatusId);
        ContractPurchaseOrderDisplayResult GetCPOAccuralManagement(PurchaseOrderSearch purchaseOrderInput);
        ContractPurchaseOrderDisplayResult GetCPOAccuralReverse(PurchaseOrderSearch purchaseOrderInput);
        int UpdateAccraulCode(ContractPurchaseOrder purchaseOrder);
        int GetPocCount(int CPOID);
        bool UpdateJVACode(string CPONumber, string CPOJVACode);
    }
}
