using System;
using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class CreditNoteManager : ManagerBase, ICreditNoteManager
    {
        private readonly ICreditNoteRepository m_creditNoteRepository;

        public CreditNoteManager(ICreditNoteRepository creditNoteRepository)
        {
            m_creditNoteRepository = creditNoteRepository;
        }
        public List<CreditNoteData> GetCreditNotesList(GridDisplayInput gridDisplayInput)
        {
            return m_creditNoteRepository.GetCreditNotesList(gridDisplayInput);
        }
        public List<Invoice> GetInvoiceBySupplier(int supplierId, int companyid)
        {
            return m_creditNoteRepository.GetInvoiceBySupplier(supplierId, companyid);
        }
        public List<CreditNoteLineItems> GetCreditNoteINVDetails(int InvoiceId)
        {
            return m_creditNoteRepository.GetCreditNoteINVDetails(InvoiceId);
        }
        public CreditNote GetCreditNotesById(int Id)
        {
            return m_creditNoteRepository.GetCreditNotesById(Id);
        }
        public List<CreditNote> GetOriginalQTYPRICE(int Id)
        {
            return m_creditNoteRepository.GetOriginalQTYPRICE(Id);
        }
        public int PostCreditNote(CreditNote creditNoteObj)
        {
            return m_creditNoteRepository.PostCreditNote(creditNoteObj);
        }

        public bool DeleteContractCreditNote(CreditNoteDelete creditNoteDelete)
        {
            return m_creditNoteRepository.DeleteContractCreditNote(creditNoteDelete);
        }

        public IEnumerable<Invoices> GetCreditNoteAllINVRequest(GridDisplayInput gridDisplayInput)
        {
            return m_creditNoteRepository.GetCreditNoteAllINVRequest(gridDisplayInput);
        }

        public IEnumerable<Tax> GetTaxesByTaxId(int taxId)
        {
            return m_creditNoteRepository.GetTaxesByTaxId(taxId);
        }

        public CreditNotesDisplayResult Get_Existing_InvoiceId(int InvoiceId)
        {
            return m_creditNoteRepository.Get_Existing_InvoiceId(InvoiceId);
        }

        public DocumentExportData ExportCNDocument(int documentId)
        {
            return m_creditNoteRepository.ExportCNDocument(documentId);
        }
        public bool ValidateCNNo(string CNNo, int CNId)
        {
            return m_creditNoteRepository.ValidateCNNo(CNNo, CNId);
        }
    }
}
