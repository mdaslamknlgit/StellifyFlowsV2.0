using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class GenericManager : IGenericManager
    {
        private readonly IGenericRepository m_GenericRepository;
        public GenericManager(IGenericRepository genericRepository)
        {
            m_GenericRepository = genericRepository;
        }

        public bool RecallDocumentApproval(ProjectDocument document)
        {
            return m_GenericRepository.RecallDocumentApproval(document);
        }
        public byte[] DownloadFile(Attachments attachment)
        {
            return m_GenericRepository.DownloadFile(attachment);
        }

        public bool VoidDocument(WorkFlowApproval workFlowApproval)
        {
            return m_GenericRepository.VoidDocument(workFlowApproval);
        }

        public bool checkPendingDocuments(ProjectDocument document)
        {
            return m_GenericRepository.checkPendingDocuments(document);
        }

        public bool CancelDraftDocument(WorkFlowApproval workFlowApproval)
        {
            return m_GenericRepository.CancelDraftDocument(workFlowApproval);
        }

        public bool SendDocumentForApproval(WorkFlowParameter workFlowApproval)
        {
            return m_GenericRepository.SendDocumentForApproval(workFlowApproval);
        }

        public bool ApproveDocument(WorkFlowApproval workFlowApprovals)
        {
            return m_GenericRepository.ApproveDocument(workFlowApprovals);
        }

        public bool RejectDocument(WorkFlowApproval workFlowApprovals)
        {
            return m_GenericRepository.RejectDocument(workFlowApprovals);
        }

        public bool SendForClarificationDocument(WorkFlowApproval workFlowApprovals)
        {
            return m_GenericRepository.SendForClarificationDocument(workFlowApprovals);
        }

        public bool ReplyDocument(WorkFlowApproval workFlowApprovals)
        {
            return m_GenericRepository.ReplyDocument(workFlowApprovals);
        }

        public bool CancelApprovalDocument(WorkFlowApproval workFlowApprovals)
        {
            return m_GenericRepository.CancelApprovalDocument(workFlowApprovals);
        }

        public bool _CancelDraftDocument(WorkFlowApproval workFlowApproval)
        {
            return m_GenericRepository._CancelDraftDocument(workFlowApproval);
        }

        public byte[] PrintDocument(ProjectDocument document)
        {
            switch (document.DocumentTypeId)
            {
                case (int)WorkFlowProcessTypes.SalesQuotation:
                case (int)WorkFlowProcessTypes.SalesInvoice:
                    return m_GenericRepository.PrintSalesDocument(document);

                case (int)WorkFlowProcessTypes.CreditNote:
                    return m_GenericRepository.PrintDocument(document);

                default:
                    return m_GenericRepository.PrintDocument(document);
            }
        }

        public bool SendDocumentEmail(ProjectDocument document)
        {
            return m_GenericRepository.SendDocumentEmail(document);
        }

        public bool UpdateDocumentStatus(WorkFlowApproval workFlowApproval)
        {
            return m_GenericRepository.UpdateDocumentStatus(workFlowApproval);
        }
    }
}
