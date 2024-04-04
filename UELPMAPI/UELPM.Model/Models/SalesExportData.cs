using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class SalesExportData
    {
        public List<object> Invoices { get; set; }
        public List<object> InvoiceDetails { get; set; }
        public List<object> InvoicePaymentScheduleSections { get; set; }
        public List<object> InvoiceOptinalFieldsSections { get; set; }
        public List<object> InvoiceDetailsOptinalFieldsSections { get; set; }
        public SalesExportData()
        {
            Invoices = new List<object>();
            InvoiceDetails = new List<object>();
            InvoicePaymentScheduleSections = new List<object>();
            InvoiceOptinalFieldsSections = new List<object>();
            InvoiceDetailsOptinalFieldsSections = new List<object>();
        }
    }
}
