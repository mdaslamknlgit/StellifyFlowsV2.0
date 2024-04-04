using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISalesInvoiceManager
    {
        IEnumerable<SalesInvoiceGrid> GetSalesInvoices(SalesInvoiceSearch search);
        IEnumerable<SalesInvoiceGrid> GetOpenSalesInvoices(SalesInvoiceSearch search);
        SalesInvoice GetSalesInvoice(int InvoiceId);
        int PostSalesInvoice(SalesInvoice salesInvoice);
        IEnumerable<SalesInvoiceGrid> GetInvoicesSearch(SalesInvoiceSearch search);
        SalesExportData ExportSIDocument(string documentId, int userId);
    }
}
