using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class SalesOrderManager : ISalesOrderManager
    {
        private readonly ISalesOrderRepository m_salesOrderRepository;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="salesOrderRepository"></param>
        public SalesOrderManager(ISalesOrderRepository salesOrderRepository)
        {
            m_salesOrderRepository = salesOrderRepository;
        }

        public SalesOrderDisplayResult GetSalesOrders(GridDisplayInput salesOrderInput)
        {
            return m_salesOrderRepository.GetSalesOrders(salesOrderInput);
        }

        public SalesOrderDisplayResult GetAllSearchSalesOrders(SalesOrderSearch salesOrderSearch)
        {
            return m_salesOrderRepository.GetAllSearchSalesOrders(salesOrderSearch);
        }

        public SalesOrder GetSalesOrderDetails(int salesOrderId)
        {
            return m_salesOrderRepository.GetSalesOrderDetails(salesOrderId);
        }

        public int CreateSalesOrder(SalesOrder salesOrder)
        {
            return m_salesOrderRepository.CreateSalesOrder(salesOrder);
        }

        public int UpdateSalesOrder(SalesOrder salesOrder)
        {
            return m_salesOrderRepository.UpdateSalesOrder(salesOrder);
        }

        public bool DeleteSalesOrder(SalesOrderDelete salesOrderDelete)
        {
            return m_salesOrderRepository.DeleteSalesOrder(salesOrderDelete);
        }
     
        public byte[] DownloadFile(Attachments attachment)
        {
            return m_salesOrderRepository.DownloadFile(attachment);
        }
    
        public int SalesOrderStatusUpdate(SalesOrderApproval requestApproval)
        {
            return m_salesOrderRepository.SalesOrderStatusUpdate(requestApproval);
        }

        public void SendForApproval(SalesOrder salesOrder,bool isFromUi)
        {
            m_salesOrderRepository.SendForApproval(salesOrder, isFromUi);
        }

        public byte[] SalesOrderPrint(int salesOrderId, int companyId, string type)
        {
            return m_salesOrderRepository.SalesOrderPrint(salesOrderId, companyId, type);
        }

        public bool SendSalesOrderMailtoCustomer(int salesOrderId, int companyId)
        {
            return m_salesOrderRepository.SendSalesOrderMailtoCustomer(salesOrderId, companyId);
        }

        public SalesTicketDisplayResult GetAllSearchTickets(TicketSearch ticketSearchInput)
        {
            return m_salesOrderRepository.GetAllSearchTickets(ticketSearchInput);
        }

        public SalesOrderDisplayResult GetSalesOrdersForApproval(GridDisplayInput salesOrderInput)
        {
            return m_salesOrderRepository.GetSalesOrdersForApproval(salesOrderInput);
        }
        public SalesOrderDisplayResult SearchSalesOrdersForApproval(SalesOrderSearch salesOrderInput)
        {
            return m_salesOrderRepository.SearchSalesOrdersForApproval(salesOrderInput);
        }

        public int UpdateSalesOrderStatus(SalesOrderApproval salesOrderApproval)
        {
            return m_salesOrderRepository.UpdateSalesOrderStatus(salesOrderApproval);
        }

        public int SalesOrderApprovalStatus(SalesOrderApproval salesOrderApproval)
        {
            return m_salesOrderRepository.SalesOrderApprovalStatus(salesOrderApproval);
        }

    }
}
