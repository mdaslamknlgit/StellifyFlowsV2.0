using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISalesQuotationManager
    {
        IEnumerable<SalesQuotationGrid> GetSalesQuotations(SalesQuotationSearch search);
        SalesQuotation GetSalesQuotation(int quotationId);
        int PostSalesQuotation(SalesQuotation salesQuotation);
        int PostSalesQuotationBillingInfo(SalesQuotation salesQuotation);
        IEnumerable<SalesQuotationGrid> GetQuotationsSearch(SalesQuotationSearch search);
        bool UpdateSalesQuotationStatus(InvoiceLink invoiceLink);
    }
}
