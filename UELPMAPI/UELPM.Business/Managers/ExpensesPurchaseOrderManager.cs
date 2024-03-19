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
    public class ExpensesPurchaseOrderManager : IExpensesPurchaseOrderManager
    {
        private readonly IExpensesPurchaseOrderCreationRepository m_expensesPurchaseOrderRepository;

        public ExpensesPurchaseOrderManager(IExpensesPurchaseOrderCreationRepository expensesPurchaseOrderRepository)
        {
            m_expensesPurchaseOrderRepository = expensesPurchaseOrderRepository;
        }

        public int CreateExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrder)
        {
            return m_expensesPurchaseOrderRepository.CreateExpensePurchaseOrder(purchaseOrder);
        }

        public bool DeleteExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrderDelete)
        {
            return m_expensesPurchaseOrderRepository.DeleteExpensePurchaseOrder(purchaseOrderDelete);
        }

        public byte[] DownloadEXPOQuotationFile(EXPOQuotationAttachments eXPOQuotationAttachments)
        {
            return m_expensesPurchaseOrderRepository.DownloadEXPOQuotationFile(eXPOQuotationAttachments);
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            return m_expensesPurchaseOrderRepository.DownloadFile(attachment);
        }

        public ExpensesPurchaseOrder GetExpensesPurchaseOrderDetails(string purchaseOrderId,int loggedInUserId, int companyId)
        {
            return m_expensesPurchaseOrderRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId, loggedInUserId, companyId);
        }

        public ExpensesPurchaseOrderDisplayResult GetExpensesPurchaseOrders(GridDisplayInput purchaseOrderInput)
        {
            return m_expensesPurchaseOrderRepository.GetExpensesPurchaseOrders(purchaseOrderInput);
        }

        public int UpdateExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrder)
        {
            return m_expensesPurchaseOrderRepository.UpdateExpensePurchaseOrder(purchaseOrder);
        }
    }
}
