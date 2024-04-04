using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class GenericController : ApiController
    {
        private readonly IGenericManager m_GenricManager;
        private readonly ISharedManager m_SharedManager;

        public GenericController(IGenericManager genericManager, ISharedManager sharedManager)
        {
            m_GenricManager = genericManager;
            m_SharedManager = sharedManager;
        }

        [HttpPost]
        [Route("api/RecallDocumentApproval")]
        public IHttpActionResult RecallDocumentApproval(ProjectDocument document)
        {
            var result = m_GenricManager.RecallDocumentApproval(document);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/DownloadAttachedFiles")]
        public HttpResponseMessage DownloadAttachedFiles([FromUri] Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_GenricManager.DownloadFile(attachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };
            result.Headers.Add("FileName", attachment.FileName);
            return result;
        }

        [HttpPost]
        [Route("api/VoidDocument")]
        public IHttpActionResult VoidDocument(WorkFlowApproval workFlowApproval)
        {
            var result = m_GenricManager.VoidDocument(workFlowApproval);
            return Ok(result);
        }

        [HttpPost, Route("api/checkPendingDocuments")]
        public IHttpActionResult checkPendingDocuments(ProjectDocument document)
        {
            var result = m_GenricManager.checkPendingDocuments(document);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/CancelDraftDocument")]
        public IHttpActionResult CancelDraftDocument(WorkFlowApproval workFlowApproval)
        {
            var result = m_GenricManager.CancelDraftDocument(workFlowApproval);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/SendDocumentForApproval")]
        public IHttpActionResult SendDocumentForApproval([FromBody] WorkFlowParameter workFlowParameter)
        {
            try
            {
                m_SharedManager.UpdateReadNotifications(workFlowParameter.ProcessId, workFlowParameter.DocumentId, workFlowParameter.CompanyId);
                m_GenricManager.SendDocumentForApproval(workFlowParameter);

                return Ok();
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "SendDocumentForApproval", "", "SendDocumentForApproval", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/ApproveDocument")]
        public IHttpActionResult ApproveDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                bool result = m_GenricManager.ApproveDocument(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "ApproveDocument", "", "ApproveDocument", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/RejectDocument")]
        public IHttpActionResult RejectDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                bool result = m_GenricManager.RejectDocument(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "RejectDocument", "", "RejectDocument", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/SendForClarificationDocument")]
        public IHttpActionResult SendForClarificationDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                bool result = m_GenricManager.SendForClarificationDocument(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "SendForClarificationDocument", "", "SendForClarificationDocument", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/ReplyDocument")]
        public IHttpActionResult ReplyDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                bool result = m_GenricManager.ReplyDocument(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "ReplyDocument", "", "ReplyDocument", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/CancelApprovalDocument")]
        public IHttpActionResult CancelApprovalDocument(WorkFlowApproval workFlowApprovals)
        {
            try
            {
                bool result = m_GenricManager.CancelApprovalDocument(workFlowApprovals);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "CancelApprovalDocument", "", "CancelApprovalDocument", e.Message);
                throw e;
            }
        }

        [HttpPost]
        [Route("api/_CancelDraftDocument")]
        public IHttpActionResult _CancelDraftDocument(WorkFlowApproval workFlowApproval)
        {
            try
            {
                var result = m_GenricManager._CancelDraftDocument(workFlowApproval);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "CancelApprovalDocument", "", "CancelApprovalDocument", e.Message);
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PrintDocument/{DocumentId}/{ProcessId}/{CompanyId}")]
        public HttpResponseMessage PrintDocument(int DocumentId, int ProcessId, int CompanyId)
        {
            var pdfContent = m_GenricManager.PrintDocument(new ProjectDocument
            {
                DocumentId = DocumentId,
                DocumentTypeId = ProcessId,
                CompanyId = CompanyId,
                IsPrintAuditLog = false
            });
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SendDocumentEmail/{DocumentId}/{ProcessId}/{CompanyId}/{DepartmentId}")]
        public bool SendDocumentEmail(int DocumentId, int ProcessId, int CompanyId,int DepartmentId)
        {
            return m_GenricManager.SendDocumentEmail(new ProjectDocument
            {
                DocumentId = DocumentId,
                DocumentTypeId = ProcessId,
                CompanyId = CompanyId,
                DepartmentId = DepartmentId,
                IsPrintAuditLog = false
            });
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("api/UpdateDocumentStatus")]
        public IHttpActionResult UpdateDocumentStatus(WorkFlowApproval workFlowApproval)
        {
            try
            {
                var result = m_GenricManager.UpdateDocumentStatus(workFlowApproval);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("GenericController", "UpdateDocumentStatus", "", "UpdateDocumentStatus", e.Message);
                throw e;
            }
        }
    }
}
