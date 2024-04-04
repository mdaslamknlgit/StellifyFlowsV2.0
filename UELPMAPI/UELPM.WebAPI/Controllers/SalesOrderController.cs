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
    public class SalesOrderController : ApiController
    {
        private readonly ISalesOrderManager m_salesOrderManager;
        private readonly IWorkflowAuditTrailManager m_workFlowAuditTrailManager;
        private int userid = 0;
        public SalesOrderController() { }

        public SalesOrderController(ISalesOrderManager salesOrderManager, IWorkflowAuditTrailManager workFlowAuditTrailManager)
        {
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            UserProfile userProfile = userProfileRepository.GetRolebyUser(HttpContext.Current.Request.LogonUserIdentity.Claims.FirstOrDefault().Value.Split('\\')[1]);
            if (userProfile != null)
            {
                userid = userProfile.UserID;
            }

            m_salesOrderManager = salesOrderManager;
            m_workFlowAuditTrailManager = workFlowAuditTrailManager;
        }

        /// <summary>
        /// This method is used for getting all sales orders
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrders")]
        public IHttpActionResult GetSalesOrders([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_salesOrderManager.GetSalesOrders(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting suppliers
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrders/SearchAll")]
        public IHttpActionResult GetAllSearchSalesOrders([FromUri] SalesOrderSearch salesOrderSearch)
        {
            var result = m_salesOrderManager.GetAllSearchSalesOrders(salesOrderSearch);
            if (salesOrderSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.SalesOrders);
            }
        }

        /// <summary>
        /// This method is used for getting the details of the selected sales order record
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrders/{salesOrderId}/{userId}")]
        public IHttpActionResult GetSalesOrderDetails(int salesOrderId, int? userId)

        {
            var result = m_salesOrderManager.GetSalesOrderDetails(salesOrderId);
            if (result != null)
            {
                result.WorkFlowComments = new List<WorkflowAuditTrail>();
                result.WorkFlowComments = m_workFlowAuditTrailManager.GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                {
                    Documentid = result.SalesOrderId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SalesOrder),
                    DocumentUserId = result.CreatedBy,
                    UserId = Convert.ToInt32(userId)
                }).ToList();
            }

            return Ok(result);
        }
        /// <summary>
        /// This method is used to create sales order
        /// </summary>
        /// <param name="salesOrder">salesOrder</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/salesOrders")]
        public IHttpActionResult CreateSalesOrder()
        {

            SalesOrder salesOrder = JsonConvert.DeserializeObject<SalesOrder>(HttpContext.Current.Request.Form["salesOrder"]);
            salesOrder.files = HttpContext.Current.Request.Files;

            var result = m_salesOrderManager.CreateSalesOrder(salesOrder);
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.Delete.ToString(), salesOrder.CreatedBy.ToString(), salesOrder.SalesOrderId.ToString());
            return Ok(result);

        }
        /// <summary>
        /// This method is used to udpate sales order
        /// </summary>
        /// <param name="salesOrder">salesOrder</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/salesOrders")]
        public IHttpActionResult UpdateSalesOrder()
        {

            SalesOrder salesOrder = JsonConvert.DeserializeObject<SalesOrder>(HttpContext.Current.Request.Form["salesOrder"]);
            salesOrder.files = HttpContext.Current.Request.Files;
            var result = m_salesOrderManager.UpdateSalesOrder(salesOrder);
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.Update.ToString(), salesOrder.CreatedBy.ToString(), salesOrder.SalesOrderId.ToString());
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete sales order
        /// </summary>
        /// <param name="salesOrderId">salesOrderId</param>
        /// <param name="userId">userId</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/salesOrders/{salesOrderId}/{userId}")]
        public IHttpActionResult DeleteSalesOrder(int salesOrderId, int userId)
        {
            var result = m_salesOrderManager.DeleteSalesOrder(new SalesOrderDelete
            {
                SalesOrderId = salesOrderId,
                ModifiedBy = userId 
            });
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.Delete.ToString(), userId.ToString(), salesOrderId.ToString());
            return Ok(result);
        }

        /// <summary>
        /// This method is used to sending approval
        /// </summary>
        /// <param name="salesOrder"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("api/salesOrders/SendForApproval")]
        public IHttpActionResult SendForApproval(SalesOrder salesOrder)
        {
            m_salesOrderManager.SendForApproval(salesOrder,true);
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.SentForApproval.ToString(), salesOrder.CreatedBy.ToString(), salesOrder.SalesOrderId.ToString());
            return Ok();
        }

        /// <summary>
        /// This method is used to download file
        /// </summary>
        /// <param name="attachment"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/salesOrderFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_salesOrderManager.DownloadFile(attachment));
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
        [Route("api/salesOrderPrint/{salesOrderId}/{companyId}/{type}")]
        public HttpResponseMessage SalesOrderPrint(int salesOrderId, int companyId, string type)
        {
            var pdfContent = m_salesOrderManager.SalesOrderPrint(salesOrderId, companyId, type);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrders/sendSalesOrderMailtoCustomer/{salesOrderId}/{companyId}")]
        public IHttpActionResult SendSalesOrderMailtoCustomer(int salesOrderId, int companyId)
        {
            var result = m_salesOrderManager.SendSalesOrderMailtoCustomer(salesOrderId, companyId);
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.SentEmail.ToString(), null, salesOrderId.ToString());
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting tickets based on search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrders/ticketSearch")]
        public IHttpActionResult GetAllSearchTickets([FromUri]TicketSearch gridDisplayInput)
        {
            var result = m_salesOrderManager.GetAllSearchTickets(gridDisplayInput);
            if (gridDisplayInput.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.Tickets);
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrderApprovals")]
        public IHttpActionResult GetSalesOrdersForApproval([FromUri] GridDisplayInput displayInput)
        {
            var result = m_salesOrderManager.GetSalesOrdersForApproval(displayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/salesOrderApprovals/search")]
        public IHttpActionResult SearchSalesOrdersForApproval([FromUri] SalesOrderSearch displayInput)
        {
            var result = m_salesOrderManager.SearchSalesOrdersForApproval(displayInput);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/salesOrderStatusUpdate")]
        public IHttpActionResult UpdateSalesOrderStatus(SalesOrderApproval salesOrderApproval)
        {
            var result = m_salesOrderManager.UpdateSalesOrderStatus(salesOrderApproval);
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.ApprovalStatus.ToString(), null, salesOrderApproval.SalesOrderId.ToString());
            return Ok(result);
        }

        [HttpPut]
        [Route("api/salesOrderApprovals")]
        public IHttpActionResult SalesOrderApprovalStatus(SalesOrderApproval requestApproval)
        {
            var result = m_salesOrderManager.SalesOrderApprovalStatus(requestApproval);
            //MyAuditLog.Info((int)enumModuleCodes.SaleseOrder, enumAuditType.ApprovalStatus.ToString(), null, requestApproval.SalesOrderId.ToString());
            return Ok(result);
        }
    }
}
