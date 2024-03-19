using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class PurchaseOrderRequestApprovalController : ApiController
    {
        private readonly IPurchaseOrderRequestApprovalManager m_purchaseOrderRequestApprovalManager;
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;

        public PurchaseOrderRequestApprovalController() { }

        public PurchaseOrderRequestApprovalController(
            IPurchaseOrderRequestApprovalManager purchaseOrderRequestApprovalManager,
            IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_purchaseOrderRequestApprovalManager = purchaseOrderRequestApprovalManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }

        /// <summary>
        /// This method is used for getting all purchase order requests...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderRequestsApproval")]
        public IHttpActionResult GetPurchaseOrderRequestsApproval([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_purchaseOrderRequestApprovalManager.GetPurchaseOrderRequestsApproval(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all purchase order requests...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderRequestsApproval/search")]
        public IHttpActionResult GetAllSearchPurchaseOrdersRequestApproval([FromUri] PORSearch purchaseOrderInput)
        {
            var result = m_purchaseOrderRequestApprovalManager.GetAllSearchPurchaseOrdersRequestApproval(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderRequestsApproval/{purchaseOrderRequestId}/{processId}/{userId}")]
        public IHttpActionResult GetPurchaseOrderRequestApprovalDetails(int purchaseOrderRequestId,int processId,int userId)
        {
            var result = m_purchaseOrderRequestApprovalManager.GetPurchaseOrderRequestApprovalDetails(purchaseOrderRequestId, processId, userId);

            return Ok(new { purchaseOrderDetails = result, auditTrailResult = result.WorkFlowComments });
        }
        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        [Route("api/purchaseOrderRequestsApproval")]
        public IHttpActionResult UpdatePurchaseOrderRequestStatus(PurchaseOrderRequestApproval purchaseOrderRequestApproval)
        { 
            var result = m_purchaseOrderRequestApprovalManager.PurchaseOrderRequestStatusUpdate(purchaseOrderRequestApproval);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderRequestApprovalPrint/{purchaseOrderRequestId}/{processId}/{companyId}")]
        public HttpResponseMessage PurchaseOrderRequestApprovalPrint(int purchaseOrderRequestId,int processId, int companyId)
        {
            var pdfContent = m_purchaseOrderRequestApprovalManager.PurchaseOrderRequestApprovalPrint(purchaseOrderRequestId, processId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }
    }
}
