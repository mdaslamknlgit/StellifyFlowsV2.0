using System.Data;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ISalesOrderRepository
    {
        SalesOrderDisplayResult GetSalesOrders(GridDisplayInput salesOrderInput);

        SalesOrderDisplayResult GetAllSearchSalesOrders(SalesOrderSearch salesOrderInput);

        SalesOrder GetSalesOrderDetails(int salesOrderId);

        int CreateSalesOrder(SalesOrder salesOrder);

        int UpdateSalesOrder(SalesOrder salesOrder);

        bool DeleteSalesOrder(SalesOrderDelete salesOrderDelete);

        byte[] DownloadFile(Attachments attachment);      

        int SalesOrderStatusUpdate(SalesOrderApproval requestApproval);

        void SendForApproval(SalesOrder salesOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null);

        byte[] SalesOrderPrint(int salesOrderId, int companyId, string type);

        bool SendSalesOrderMailtoCustomer(int salesOrderId,  int companyId);

        SalesTicketDisplayResult GetAllSearchTickets(TicketSearch ticketSearchInput);

        SalesOrderDisplayResult GetSalesOrdersForApproval(GridDisplayInput salesOrderInput);

        SalesOrderDisplayResult SearchSalesOrdersForApproval(SalesOrderSearch salesOrderInput);

        int UpdateSalesOrderStatus(SalesOrderApproval salesOrderApproval);

        int SalesOrderApprovalStatus(SalesOrderApproval salesOrderApproval);
    }
}
