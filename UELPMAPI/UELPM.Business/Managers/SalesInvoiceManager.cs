using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class SalesInvoiceManager : ISalesInvoiceManager
    {
        private readonly ISalesInvoiceRepository m_salesInvoiceRepository;

        public SalesInvoiceManager(ISalesInvoiceRepository salesInvoiceRepository)
        {
            m_salesInvoiceRepository = salesInvoiceRepository;
        }

        public IEnumerable<SalesInvoiceGrid> GetSalesInvoices(SalesInvoiceSearch search)
        {
            return m_salesInvoiceRepository.GetSalesInvoices(search);
        }

        public IEnumerable<SalesInvoiceGrid> GetOpenSalesInvoices(SalesInvoiceSearch search)
        {
            return m_salesInvoiceRepository.GetOpenSalesInvoices(search);
        }

        public SalesInvoice GetSalesInvoice(int InvoiceId)
        {
            return m_salesInvoiceRepository.GetSalesInvoice(InvoiceId);
        }

        public int PostSalesInvoice(SalesInvoice salesInvoice)
        {
            return m_salesInvoiceRepository.PostSalesInvoice(salesInvoice);
        }

        public IEnumerable<SalesInvoiceGrid> GetInvoicesSearch(SalesInvoiceSearch search)
        {
            return m_salesInvoiceRepository.GetInvoicesSearch(search);
        }

        public SalesExportData ExportSIDocument(string documentId,int userId)
        {
            return m_salesInvoiceRepository.ExportSIDocument(documentId,userId);
        }
    }
}
