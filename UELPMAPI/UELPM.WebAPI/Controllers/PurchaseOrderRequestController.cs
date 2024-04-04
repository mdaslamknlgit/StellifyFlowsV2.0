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
using UELPM.Service.Repositories;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class PurchaseOrderRequestController : ApiController
    {
        private readonly IPurchaseOrderRequestManager m_purchaseOrderRequestManager;
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;
        private int userid = 0;
        public PurchaseOrderRequestController() { }

        public PurchaseOrderRequestController(IPurchaseOrderRequestManager purchaseOrderRequestManager, IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            UserProfile userProfile = userProfileRepository.GetRolebyUser(HttpContext.Current.Request.LogonUserIdentity.Claims.FirstOrDefault().Value.Split('\\')[1]);
            if (userProfile != null)
            {
                userid = userProfile.UserID;
            }
            m_purchaseOrderRequestManager = purchaseOrderRequestManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;

        }

        /// <summary>
        /// This method is used for getting all purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrdersRequest")]
        public IHttpActionResult GetPurchaseOrdersRequest([FromUri] GridDisplayInput purchaseOrderRequestInput)
        {
            var result = m_purchaseOrderRequestManager.GetPurchaseOrdersRequest(purchaseOrderRequestInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting suppliers
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrdersRequest/Search")]
        public IHttpActionResult GetAllSearchPurchaseOrdersRequest([FromUri]PORSearch gridDisplayInput)
        {
            var result = m_purchaseOrderRequestManager.GetAllSearchPurchaseOrdersRequest(gridDisplayInput);
            if (gridDisplayInput.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.PurchaseOrdersRequest);
            }
        }


        //[HttpGet]
        //[Route("api/PurchaseOrdersRequest/Filter")]
        //public IHttpActionResult GetAllFilterPurchaseOrdersRequest([FromUri]PORSearch porFilterDisplayInput)
        //{
        //    var result = m_purchaseOrderRequestManager.GetAllFilterPurchaseOrdersRequest(porFilterDisplayInput);
        //    return Ok(result);
        //}

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrdersRequest/{purchaseOrderRequestId}/{processId}")]
        public IHttpActionResult GetPurchaseOrderRequestDetails(int purchaseOrderRequestId,int processId)
        {
            var result = m_purchaseOrderRequestManager.GetPurchaseOrderRequestDetails(purchaseOrderRequestId,processId);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to create purchase order Request
        /// </summary>
        /// <param name="purchaseOrderRequest">purchaseOrderRequest</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/PurchaseOrdersRequest")]
        public IHttpActionResult CreatePurchaseOrderRequest()
        {
            PurchaseOrderRequest purchaseOrderRequest = JsonConvert.DeserializeObject<PurchaseOrderRequest>(HttpContext.Current.Request.Form["purchaseOrderRequest"]);
            purchaseOrderRequest.files = HttpContext.Current.Request.Files;
            var result = m_purchaseOrderRequestManager.CreatePurchaseOrderRequest(purchaseOrderRequest);
            //MyAuditLog.Info((int)enumModuleCodes.PurchaseOrderRequest, enumAuditType.Create.ToString(), purchaseOrderRequest.CreatedBy.ToString(), purchaseOrderRequest.PurchaseOrderRequestId.ToString());
            return Ok(result);
        }
        /// <summary>
        /// This method is used to udpate purchase order Request
        /// </summary>
        /// <param name="purchaseOrderRequest">purchaseOrderRequest</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/PurchaseOrdersRequest")]
        public IHttpActionResult UpdatePurchaseOrderRequest()
        {
            PurchaseOrderRequest purchaseOrderRequest = JsonConvert.DeserializeObject<PurchaseOrderRequest>(HttpContext.Current.Request.Form["purchaseOrderRequest"]);
            purchaseOrderRequest.files = HttpContext.Current.Request.Files;
            var result = m_purchaseOrderRequestManager.UpdatePurchaseOrderRequest(purchaseOrderRequest);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderRequest.ToString(), enumAuditType.Update.ToString(), purchaseOrderRequest.CreatedBy.ToString(), purchaseOrderRequest.PurchaseOrderRequestId.ToString(), "UpdatePurchaseOrderRequest","Updated Purchase Order request "+ purchaseOrderRequest.PurchaseOrderRequestId.ToString());
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/PurchaseOrdersRequest/{purchaseOrderRequestId}/{userId}")]
        public IHttpActionResult DeletePurchaseOrderRequest(int purchaseOrderRequestId,int userId)
        {
            var result = m_purchaseOrderRequestManager.DeletePurchaseOrderRequest(new PurchaseOrderRequestDelete
            {
                PurchaseOrderRequestId = purchaseOrderRequestId,
                ModifiedBy = userId//static value need to change
            });
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderRequest.ToString(), enumAuditType.Delete.ToString(), userId.ToString(), purchaseOrderRequestId.ToString(), "DeletePurchaseOrderRequest","Deleted Purchase Order request "+ purchaseOrderRequestId.ToString());
            return Ok(result);
        }
        /// <summary>
        /// This method is used for getting all purchase order types...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrderRequestTypes")]
        public IHttpActionResult GetPurchaseOrderRequestTypes()
        {
            var result =m_purchaseOrderRequestManager.GetPurchaseOrderRequestTypes();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all cost of service types
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PORequestCostOfServiceTypes")]
        public IHttpActionResult PORequestGetCostOfServiceTypes()
        {
            var result = m_purchaseOrderRequestManager.PORequestGetCostOfServiceTypes();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all departments
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PORequestDepartments")]
        public IHttpActionResult PORequestGetDepartments()
        {
            var result = m_purchaseOrderRequestManager.PORequestGetDepartments();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrderRequestFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_purchaseOrderRequestManager.DownloadFile(attachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };
            result.Headers.Add("FileName", attachment.FileName);
            return result;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrderRequestQuotationFileDownload")]
        public HttpResponseMessage DownloadQuotationFile([FromUri]QuotationAttachments quotationAttachment)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_purchaseOrderRequestManager.DownloadQuotationFile(quotationAttachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(quotationAttachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("quotationAttachment")
            {
                FileName = quotationAttachment.FileName
            };
            result.Headers.Add("FileName", quotationAttachment.FileName);
            return result;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderRequestPrint/{purchaseOrderRequestId}/{companyId}/{processId}")]
        public HttpResponseMessage PurchaseOrderRequestPrint(int purchaseOrderRequestId, int companyId,int processId)
        {    
            var pdfContent = m_purchaseOrderRequestManager.PurchaseOrderRequestPrint(purchaseOrderRequestId, companyId,processId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);              
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        [Route("api/purchaseOrderRequestStatusUpdate")]
        public IHttpActionResult UpdatePurchaseOrderRequestStatus(PurchaseOrderRequestApproval purchaseOrderRequestApproval)
        {
            var result = m_purchaseOrderRequestManager.PurchaseOrderRequestStatusUpdate(purchaseOrderRequestApproval);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderRequest.ToString(), enumAuditType.ApprovalStatus.ToString(), null, purchaseOrderRequestApproval.PurchaseOrderRequestId.ToString(), "UpdatePurchaseOrderRequestStatus","Updated Purchase Order request "+ purchaseOrderRequestApproval.PurchaseOrderRequestId.ToString());
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/sendPurchaseOrderMailtoSupplier/{purchaseOrderRequestId}/{companyId}/{processId}")]
        public IHttpActionResult SendPurchaseOrderMailtoSupplier(int purchaseOrderRequestId, int companyId,int processId)
        {
            var result = m_purchaseOrderRequestManager.SendPurchaseOrderMailtoSupplier(purchaseOrderRequestId, companyId,processId);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderRequest.ToString(), enumAuditType.SentEmail.ToString(), null, purchaseOrderRequestId.ToString(), "SendPurchaseOrderMailtoSupplier","Sent Purchase Order "+ purchaseOrderRequestId.ToString() + " mail to supplier.");
            return Ok(result);
        }

        [HttpPut]
        [Route("api/purchaseOrdersRequest/sendForApproval")]
        public IHttpActionResult SendForApproval(PurchaseOrderRequest purchaseOrder)
        {
            try
            {
                m_purchaseOrderRequestManager.SendForApproval(purchaseOrder, true);
                //MyAuditLog.Info(enumModuleCodes.PurchaseOrderRequest.ToString(), enumAuditType.SentForApproval.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderRequestId.ToString(), "SendForApproval","Purchase Order "+ purchaseOrder.PurchaseOrderRequestId.ToString() + " sent for approval.");
                return Ok();
            }
            catch (Exception ex)
            {
                MyAuditLog.SendErrorToText1("PurchaseOrderRequestController", "SendForApproval", "", "SendForApproval", ex.Message);
                throw ex;
            }
        }
    }
}
