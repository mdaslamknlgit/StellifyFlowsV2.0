using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using System.IO;
using System.Net.Http.Formatting;
using Newtonsoft.Json;
using System.Collections.Specialized;
using System.Net.Http.Headers;
using UELPM.Service.Repositories;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class PurchaseOrderCreationController : ApiController
    {
        private readonly IPurchaseOrderCreationManager m_purchaseOrderCreationManager;
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;
        private int userid = 0;

        //public PurchaseOrderCreationController() { }

        public PurchaseOrderCreationController(IPurchaseOrderCreationManager purchaseOrderCreationManager,IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            UserProfile userProfile = userProfileRepository.GetRolebyUser(HttpContext.Current.Request.LogonUserIdentity.Claims.FirstOrDefault().Value.Split('\\')[1]);
            if (userProfile != null)
            {
                userid = userProfile.UserID;
            }
            m_purchaseOrderCreationManager = purchaseOrderCreationManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }

        /// <summary>
        /// This method is used for getting all purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrders")]
        public IHttpActionResult GetPurchaseOrders([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_purchaseOrderCreationManager.GetPurchaseOrders(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting suppliers
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrders/SearchAll")]
        public IHttpActionResult GetAllSearchPurchaseOrders([FromUri] PurchaseOrderSearch purchaseOrderSearch)
        {
            var result = m_purchaseOrderCreationManager.GetAllSearchPurchaseOrders(purchaseOrderSearch);
            if (purchaseOrderSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.PurchaseOrders);
            }
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrders/{purchaseOrderId}/{companyId}/{userId}")]
        public IHttpActionResult GetPurchaseOrderDetails(string purchaseOrderId, int? companyId, int? userId)
        {
            var result = m_purchaseOrderCreationManager.GetPurchaseOrderDetails(purchaseOrderId, companyId);
            if (result != null)
            {
                result.WorkFlowComments = new List<WorkflowAuditTrail>();
                result.WorkFlowComments = m_workflowAuditTrailManager.GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                {
                    Documentid = result.PurchaseOrderId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.InventoryPo),
                    DocumentUserId = result.CreatedBy,
                    UserId = Convert.ToInt32(userId)
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
        [Route("api/PurchaseOrders")]
        public IHttpActionResult CreatePurchaseOrder()
        {  

            PurchaseOrder purchaseOrder=JsonConvert.DeserializeObject<PurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
      
            var result = m_purchaseOrderCreationManager.CreatePurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.Create.ToString(), purchaseOrder.CreatedBy.ToString(), result.ToString(), "CreatePurchaseOrder","Created Purchase Order successfully ");
            return Ok(result);

        }
        /// <summary>
        /// This method is used to udpate purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/PurchaseOrders")]
        public IHttpActionResult UpdatePurchaseOrder()
        {

            PurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<PurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;    
            var result = m_purchaseOrderCreationManager.UpdatePurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.Update.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "UpdatePurchaseOrder","Updated Purchase Order successfully ");
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/PurchaseOrders/{purchaseOrderId}/{userId}")]
        public IHttpActionResult DeletePurchaseOrder(int purchaseOrderId,int userId)
        {
            var result = m_purchaseOrderCreationManager.DeletePurchaseOrder(new PurchaseOrderDelete
            {
                PurchaseOrderId = purchaseOrderId,
                ModifiedBy = userId//static value need to change
            });
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.Delete.ToString(), userId.ToString(), purchaseOrderId.ToString(), "DeletePurchaseOrder","Deleted Purchase Order successfully ");
            return Ok(result);
        }
        /// <summary>
        /// This method is used for getting all purchase order types...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrderTypes")]
        public IHttpActionResult GetPurchaseOrderTypes()
        {
            var result = m_purchaseOrderCreationManager.GetPurchaseOrderTypes();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all cost of service types
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/CostOfServiceTypes")]
        public IHttpActionResult GetCostOfServiceTypes()
        {
            var result = m_purchaseOrderCreationManager.GetCostOfServiceTypes();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all departments
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Departments")]
        public IHttpActionResult GetDepartments()
        {
            var result = m_purchaseOrderCreationManager.GetDepartments();
            return Ok(result);    
        }
        /// <summary>
        /// This method is used for getting all departments
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        [Route("api/PurchaseOrders/SendForApproval")]
        public IHttpActionResult SendForApproval(PurchaseOrder purchaseOrder)
        {
            try
            {
                m_purchaseOrderCreationManager.SendForApproval(purchaseOrder, true);
                //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.SentForApproval.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "SendForApproval","Purchase Order sent for approval ");
                return Ok();
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("PurchaseOrderCreationController", "SendForApproval", "", "SendForApproval", e.Message);
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrderFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_purchaseOrderCreationManager.DownloadFile(attachment));
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
        [Route("api/purchaseOrderPrint/{purchaseOrderId}/{purchaseOrderTypeId}/{companyId}")]
        public HttpResponseMessage PurchaseOrderPrint(int purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            var pdfContent = m_purchaseOrderCreationManager.PurchaseOrderPrint(purchaseOrderId, purchaseOrderTypeId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/PurchaseOrdersPDFExport")]
        //public IHttpActionResult GetPurchaseOrders([FromUri] GridDisplayInput purchaseOrderInput)
        //[Route("api/purchaseOrdersPDFExport/{purchaseOrderId}/{purchaseOrderTypeId}/{companyId}")]
        public HttpResponseMessage PurchaseOrdersPDFExport([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var pdfContent = m_purchaseOrderCreationManager.PurchaseOrdersPDFExport(purchaseOrderInput);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrders/sendPurchaseOrderMailtoSupplier/{purchaseOrderId}/{companyId}/{purchaseOrderTypeId}")]
        public IHttpActionResult SendPurchaseOrderMailtoSupplier(int purchaseOrderId, int companyId, int purchaseOrderTypeId)
        {
            var result = m_purchaseOrderCreationManager.SendPurchaseOrderMailtoSupplier(purchaseOrderId, companyId, purchaseOrderTypeId);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.SentEmail.ToString(), null, purchaseOrderId.ToString(), "SendPurchaseOrderMailtoSupplier","Sent Purchase Order mail to supplier ");
            return Ok(result);
        }

        [HttpPut]
        [Route("api/PurchaseOrders/SendPurchaseOrderMailtoSupplierContactPerson")]
        public IHttpActionResult SendPurchaseOrderMailtoSupplierContactPerson(EmailSupplier emailSupplier)
        {
            var result = m_purchaseOrderCreationManager.SendPurchaseOrderMailtoSupplierContactPerson(emailSupplier);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.SentEmail.ToString(), null, purchaseOrderId.ToString(), "SendPurchaseOrderMailtoSupplier","Sent Purchase Order mail to supplier ");
            return Ok(result);
        }

        [HttpPut]
        [Route("api/purchaseOrderStatusUpdate")]
        public IHttpActionResult UpdatePurchaseOrderRequestStatus(PurchaseOrderApproval purchaseOrderApproval)
        {
            var result = m_purchaseOrderCreationManager.PurchaseOrderStatusUpdate(purchaseOrderApproval);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.ApprovalStatus.ToString(), null, purchaseOrderApproval.PurchaseOrderId.ToString(), "UpdatePurchaseOrderRequestStatus","Updated Approval status ");
            return Ok(result);
        }

        [HttpPost]
        [Route("api/purchaseOrder/void")]
        public IHttpActionResult VoidPurchaseOrder(PurchaseOrderVoid purchaseOrder)
        {
            var result = m_purchaseOrderCreationManager.VoidPurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.PurchaseOrderCreation.ToString(), enumAuditType.Void.ToString(), purchaseOrder.UserId.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "VoidPurchaseOrder","Purchase Order Voided ");
            return Ok(result);
        }

        [HttpPost]
        [Route("api/purchaseOrder/recallPoApproval")]
        public IHttpActionResult RecallPoApproval(PurchaseOrder purchaseOrder)
        {
            try
            {
                var result = m_purchaseOrderCreationManager.RecallPoApproval(purchaseOrder);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("PurchaseOrderCreationController", "RecallPoApproval", "", "RecallPoApproval", e.Message);
                throw;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SPOQuotationFileDownload")]
        public HttpResponseMessage DownloadSPOQuotationFile([FromUri]SPOQuotationAttachments sPOQuotationAttachments)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_purchaseOrderCreationManager.DownloadSPOQuotationFile(sPOQuotationAttachments));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(sPOQuotationAttachments.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("sPOQuotationAttachments")
            {
                FileName = sPOQuotationAttachments.FileName
            };
            result.Headers.Add("FileName", sPOQuotationAttachments.FileName);
            return result;
        }

    }
}
