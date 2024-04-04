using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ICreditNoteRepository
    {
        List<CreditNoteData> GetCreditNotesList(GridDisplayInput gridDisplayInput);
        List<Invoice> GetInvoiceBySupplier(int supplierId, int companyid);
        List<CreditNoteLineItems> GetCreditNoteINVDetails(int InvoiceId);
        CreditNotesDisplayResult Get_Existing_InvoiceId(int InvoiceId);
        CreditNote GetCreditNotesById(int Id);
        List<CreditNote> GetOriginalQTYPRICE(int Id);
        IEnumerable<Invoices> GetCreditNoteAllINVRequest(GridDisplayInput gridDisplayInput);
        IEnumerable<Tax> GetTaxesByTaxId(int taxId);
        int PostCreditNote(CreditNote creditNoteObj);
        bool DeleteContractCreditNote(CreditNoteDelete creditNoteDelete);
        DocumentExportData ExportCNDocument(int documentId);
        bool ValidateCNNo(string CNNo, int CNId);
    }
}
