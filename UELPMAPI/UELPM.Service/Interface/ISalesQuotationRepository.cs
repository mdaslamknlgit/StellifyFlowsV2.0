using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ISalesQuotationRepository
    {
        IEnumerable<SalesQuotationGrid> GetSalesQuotations(SalesQuotationSearch search);
        SalesQuotation GetSalesQuotation(int quotationId);
        int PostSalesQuotation(SalesQuotation salesQuotation);
        int PostSalesQuotationBillingInfo(SalesQuotation salesQuotation);
        IEnumerable<SalesQuotationGrid> GetQuotationsSearch(SalesQuotationSearch search);
        bool UpdateSalesQuotationStatus(InvoiceLink invoiceLink);
    }
}
