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
    public class SalesQuotationManager : ISalesQuotationManager
    {
        private readonly ISalesQuotationRepository m_salesQuotationRepository;

        public SalesQuotationManager(ISalesQuotationRepository salesQuotationRepository)
        {
            m_salesQuotationRepository = salesQuotationRepository;
        }

        public IEnumerable<SalesQuotationGrid> GetSalesQuotations(SalesQuotationSearch search)
        {
            return m_salesQuotationRepository.GetSalesQuotations(search);
        }

        public SalesQuotation GetSalesQuotation(int quotationId)
        {
            return m_salesQuotationRepository.GetSalesQuotation(quotationId);
        }

        public int PostSalesQuotation(SalesQuotation salesQuotation)
        {
            return m_salesQuotationRepository.PostSalesQuotation(salesQuotation);
        }

        public int PostSalesQuotationBillingInfo(SalesQuotation salesQuotation)
        {
            return m_salesQuotationRepository.PostSalesQuotationBillingInfo(salesQuotation);
        }

        public IEnumerable<SalesQuotationGrid> GetQuotationsSearch(SalesQuotationSearch search)
        {
            return m_salesQuotationRepository.GetQuotationsSearch(search);
        }

        public bool UpdateSalesQuotationStatus(InvoiceLink invoiceLink)
        {
            return m_salesQuotationRepository.UpdateSalesQuotationStatus(invoiceLink);
        }
    }
}
