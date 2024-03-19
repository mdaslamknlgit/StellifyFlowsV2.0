using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISalesOrderManager
    {
        SalesOrderDisplayResult GetSalesOrders(GridDisplayInput salesOrderInput);

        SalesOrderDisplayResult GetAllSearchSalesOrders(SalesOrderSearch salesOrderInput);      

        SalesOrder GetSalesOrderDetails(int salesOrderId);

        int CreateSalesOrder(SalesOrder salesOrder);

        int UpdateSalesOrder(SalesOrder salesOrder);

        bool DeleteSalesOrder(SalesOrderDelete salesOrderDelete);      

        byte[] DownloadFile(Attachments attachment);      

        int SalesOrderStatusUpdate(SalesOrderApproval requestApproval);

        void SendForApproval(SalesOrder salesOrder, bool isFromUi);

        byte[] SalesOrderPrint(int salesOrderId, int companyId, string type);

        bool SendSalesOrderMailtoCustomer(int salesOrderId, int companyId);

        SalesTicketDisplayResult GetAllSearchTickets(TicketSearch ticketSearchInput);

        SalesOrderDisplayResult GetSalesOrdersForApproval(GridDisplayInput salesOrderInput);

        SalesOrderDisplayResult SearchSalesOrdersForApproval(SalesOrderSearch salesOrderInput);

        int UpdateSalesOrderStatus(SalesOrderApproval salesOrderApproval);

        int SalesOrderApprovalStatus(SalesOrderApproval salesOrderApproval);
    }
}
