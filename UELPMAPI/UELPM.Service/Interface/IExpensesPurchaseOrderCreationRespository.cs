using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IExpensesPurchaseOrderCreationRepository
    {
        ExpensesPurchaseOrderDisplayResult GetExpensesPurchaseOrders(GridDisplayInput purchaseOrderInput);
        ExpensesPurchaseOrder GetExpensesPurchaseOrderDetails(string purchaseOrderId, int loggedInUserId, int companyId);
        int CreateExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrder);
        int UpdateExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrder);
        bool DeleteExpensePurchaseOrder(ExpensesPurchaseOrder purchaseOrderDelete);
        byte[] DownloadFile(Attachments attachment);
        byte[] DownloadEXPOQuotationFile(EXPOQuotationAttachments eXPOQuotationAttachments);
    }
}
