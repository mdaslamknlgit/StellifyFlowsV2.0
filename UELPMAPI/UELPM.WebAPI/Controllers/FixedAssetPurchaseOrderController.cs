using Newtonsoft.Json;
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
    public class FixedAssetPurchaseOrderController : ApiController
    {
        private readonly IFixedAssetPurchaseOrderCreationManager m_fixedAssetPurchaseOrderCreationManager;
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;

        public FixedAssetPurchaseOrderController() { }

        public FixedAssetPurchaseOrderController(IFixedAssetPurchaseOrderCreationManager fixedAssetPurchaseOrderCreationManager, IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_fixedAssetPurchaseOrderCreationManager = fixedAssetPurchaseOrderCreationManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }

        /// <summary>
        /// This method is used for getting all purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/fixedAssetPurchaseOrders")]
        public IHttpActionResult GetFixedAssetPurchaseOrders([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_fixedAssetPurchaseOrderCreationManager.GetFixedAssetPurchaseOrders(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/fixedAssetPurchaseOrders/{purchaseOrderId}/{companyId}")]
        public IHttpActionResult GetFixedAssetPurchaseOrderDetails(string purchaseOrderId, int companyId)
        {
            var result = m_fixedAssetPurchaseOrderCreationManager.GetFixedAssetPurchaseOrderDetails(purchaseOrderId, companyId);
            if (result != null)
            {
                result.WorkFlowComments = new List<WorkflowAuditTrail>();
                result.WorkFlowComments = m_workflowAuditTrailManager.GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                {
                    Documentid = result.FixedAssetPurchaseOrderId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO),
                    DocumentUserId = result.CreatedBy,
                    UserId = Convert.ToInt32(result.CreatedBy)
                }).ToList();
                if (result.WorkFlowComments != null && result.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                {
                    result.ReasonsToReject = result.WorkFlowComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
                }
            }
            return Ok(result);
        }
        /// <summary>
        /// This method is used to create purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/fixedAssetPurchaseOrders")]
        public IHttpActionResult CreateFixedAssetPurchaseOrder()
        {
            FixedAssetPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<FixedAssetPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;      
            var result = m_fixedAssetPurchaseOrderCreationManager.CreateFixedAssetPurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.FixedAssetPurchaseOrder.ToString(), enumAuditType.Create.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "CreateFixedAssetPurchaseOrder","Created Fixed Asset Purchase Order "+ purchaseOrder.FixedAssetPurchaseOrderId.ToString() + " successfully.");
            return Ok(result);
       
        }
        /// <summary>
        /// This method is used to udpate purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/fixedAssetPurchaseOrders")]
        public IHttpActionResult UpdateFixedAssetPurchaseOrder()
        {
            FixedAssetPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<FixedAssetPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_fixedAssetPurchaseOrderCreationManager.UpdateFixedAssetPurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.FixedAssetPurchaseOrder.ToString(), enumAuditType.Update.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.FixedAssetPurchaseOrderId.ToString(), "UpdateFixedAssetPurchaseOrder","Updated Fixed Asset Purchase Order "+ purchaseOrder.FixedAssetPurchaseOrderId.ToString() + " successfully");
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/fixedAssetPurchaseOrders/{purchaseOrderId}/{userId}")]
        public IHttpActionResult DeleteFixedAssetPurchaseOrder(int purchaseOrderId,int userId)
        {
            var result = m_fixedAssetPurchaseOrderCreationManager.DeleteFixedAssetPurchaseOrder(new FixedAssetPurchaseOrderDelete
            {
                FixedAssetPurchaseOrderId = purchaseOrderId,
                ModifiedBy = userId
            });
            //MyAuditLog.Info(enumModuleCodes.FixedAssetPurchaseOrder.ToString(), enumAuditType.Delete.ToString(), userId.ToString(), purchaseOrderId.ToString(), "DeleteFixedAssetPurchaseOrder","Deleted Fixed Asset Purchase "+ purchaseOrderId.ToString() + " successfully.");
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/fixedAssetPurchaseOrderFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_fixedAssetPurchaseOrderCreationManager.DownloadFile(attachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };
            result.Headers.Add("FileName", attachment.FileName);
            return result;
        }

        [HttpPut]
        [Route("api/fixedAssetPurchaseOrders/sendForApproval")]
        public IHttpActionResult SendForApproval(FixedAssetPurchaseOrder purchaseOrder)
        {
            try
            {
                m_fixedAssetPurchaseOrderCreationManager.SendForApproval(purchaseOrder, true);
                return Ok();
            }
            catch (Exception ex)
            {
                MyAuditLog.SendErrorToText1("FixedAssetPurchaseOrderController", "SendForApproval", "", "SendForApproval", ex.Message);
                throw;
            }
           
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/APOQuotationFileDownload")]
        public HttpResponseMessage DownloadAPOQuotationFile([FromUri]APOQuotationAttachments aPOQuotationAttachments)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_fixedAssetPurchaseOrderCreationManager.DownloadAPOQuotationFile(aPOQuotationAttachments));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(aPOQuotationAttachments.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("aPOQuotationAttachments")
            {
                FileName = aPOQuotationAttachments.FileName
            };
            result.Headers.Add("FileName", aPOQuotationAttachments.FileName);
            return result;
        }
    }
}
