using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IGenericManager
    {
        bool RecallDocumentApproval(ProjectDocument document);
        byte[] DownloadFile(Attachments attachment);
        bool VoidDocument(WorkFlowApproval workFlowApproval);
        bool checkPendingDocuments(ProjectDocument document);
        bool CancelDraftDocument(WorkFlowApproval workFlowApproval);
        bool SendDocumentForApproval(WorkFlowParameter workFlowApproval);
        bool ApproveDocument(WorkFlowApproval workFlowApprovals);
        bool RejectDocument(WorkFlowApproval workFlowApprovals);
        bool SendForClarificationDocument(WorkFlowApproval workFlowApprovals);
        bool ReplyDocument(WorkFlowApproval workFlowApprovals);
        bool CancelApprovalDocument(WorkFlowApproval workFlowApprovals);
        bool _CancelDraftDocument(WorkFlowApproval workFlowApproval);
        byte[] PrintDocument(ProjectDocument document);
        bool UpdateDocumentStatus(WorkFlowApproval workFlowApproval);
        bool SendDocumentEmail(ProjectDocument projectDocument);
    }
}
