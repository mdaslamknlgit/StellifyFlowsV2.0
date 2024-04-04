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

    public class ContractPurchaseOrderManager : ManagerBase, IContractPurchaseOrderManager
    {
        private readonly IContractPurchaseOrderRepository m_contractPurchaseOrderCreationRepository;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="contractPurchaseOrderRepository"></param>
        public ContractPurchaseOrderManager(IContractPurchaseOrderRepository contractPurchaseOrderRepository)
        {
            m_contractPurchaseOrderCreationRepository = contractPurchaseOrderRepository;
        }
        public ContractPurchaseOrderDisplayResult GetContractPurchaseOrders(PurchaseOrderSearch purchaseOrderInput)
        {
            return m_contractPurchaseOrderCreationRepository.GetContractPurchaseOrders(purchaseOrderInput);
        }
        public ContractPurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput)
        {
            return m_contractPurchaseOrderCreationRepository.GetAllSearchPurchaseOrders(purchaseOrderInput);
        }
        public ContractPurchaseOrder GetContractPurchaseOrderDetails(string purchaseOrderId)
        {
            return m_contractPurchaseOrderCreationRepository.GetContractPurchaseOrderDetails(purchaseOrderId);
        }
        public int CreateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder)
        {
            return m_contractPurchaseOrderCreationRepository.CreateContractPurchaseOrder(purchaseOrder);
        }
        public int UpdateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder)
        {
            return m_contractPurchaseOrderCreationRepository.UpdateContractPurchaseOrder(purchaseOrder);
        }
        public bool DeleteContractPurchaseOrder(ContractPurchaseOrderDelete purchaseOrderDelete)
        {
            return m_contractPurchaseOrderCreationRepository.DeleteContractPurchaseOrder(purchaseOrderDelete);
        }
        public byte[] DownloadFile(Attachments attachment)
        {
            return m_contractPurchaseOrderCreationRepository.DownloadFile(attachment);
        }
        public void SendForApproval(ContractPurchaseOrder purchaseOrder, bool isFromUi)
        {
            m_contractPurchaseOrderCreationRepository.SendForApproval(purchaseOrder, isFromUi);
        }
        public int GeneratePoc(ContractPurchaseOrder purchaseOrder)
        {
            return m_contractPurchaseOrderCreationRepository.GeneratePoc(purchaseOrder);
        }
        public ContractPurchaseOrder[] exportAccrualGL(ContractPurchaseOrder[] contractPurchaseOrderList)
        {
            return m_contractPurchaseOrderCreationRepository.exportAccrualGL(contractPurchaseOrderList);
        }
        //public List<ContractPurchaseOrder> GetPocList(ContractPurchaseOrder purchaseOrder)
        public ContractPurchaseOrderDisplayResult GetPocList(ContractPurchaseOrder purchaseOrder)
        {
            return m_contractPurchaseOrderCreationRepository.GetPocList(purchaseOrder);
        }
        public int ChangePOCStatus(List<ContractPurchaseOrder> contractPurchaseOrders,int workflowStatusId)
        {
            return m_contractPurchaseOrderCreationRepository.ChangePOCStatus(contractPurchaseOrders, workflowStatusId);
        }

        public ContractPurchaseOrderDisplayResult GetCPOAccuralManagement(PurchaseOrderSearch purchaseOrderInput)
        {
            return m_contractPurchaseOrderCreationRepository.GetCPOAccuralManagement(purchaseOrderInput);
        }
        public ContractPurchaseOrderDisplayResult GetCPOAccuralReverse(PurchaseOrderSearch purchaseOrderInput)
        {
            return m_contractPurchaseOrderCreationRepository.GetCPOAccuralReverse(purchaseOrderInput);
        }
        public int UpdateAccraulCode(ContractPurchaseOrder purchaseOrder)
        {
            return m_contractPurchaseOrderCreationRepository.UpdateAccraulCode(purchaseOrder);
        }
        public int GetPocCount(int CPOID)
        {
            return m_contractPurchaseOrderCreationRepository.GetPocCount(CPOID);
        }
        public bool UpdateJVACode(string CPONumber,string CPOJVACode)
        {
            return m_contractPurchaseOrderCreationRepository.UpdateJVACode(CPONumber,CPOJVACode);
        }
    }
}
