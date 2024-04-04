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
    public class ExpensesPurchaseOrderController : ApiController
    {
        private readonly IExpensesPurchaseOrderManager m_expensesPurchaseOrderManager;

        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;

        public ExpensesPurchaseOrderController() { }

        public ExpensesPurchaseOrderController(IExpensesPurchaseOrderManager expensesPurchaseOrderManager, IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_expensesPurchaseOrderManager = expensesPurchaseOrderManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }

        /// <summary>
        /// This method is used for getting all purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expensePurchaseOrders")]
        public IHttpActionResult GetExpensesPurchaseOrders([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_expensesPurchaseOrderManager.GetExpensesPurchaseOrders(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expensePurchaseOrders/{purchaseOrderId}/{loggedInUserId}/{companyId}")]
        public IHttpActionResult GetExpensesPurchaseOrderDetails(string purchaseOrderId, int loggedInUserId, int companyId)
        {
            var result = m_expensesPurchaseOrderManager.GetExpensesPurchaseOrderDetails(purchaseOrderId, loggedInUserId, companyId);
            if (result!= null&&result.WorkFlowComments != null && result.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
            {
                result.ReasonsToReject = result.WorkFlowComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
            }
            return Ok(result);
        }
        /// <summary>
        /// This method is used to create purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/expensePurchaseOrders")]
        public IHttpActionResult CreateExpensePurchaseOrder()
        {
            ExpensesPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ExpensesPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_expensesPurchaseOrderManager.CreateExpensePurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.ExpensePurchaseOrder.ToString(), enumAuditType.Create.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.ExpensesPurchaseOrderId.ToString(), "CreateExpensePurchaseOrder", "Expense Purchase Order "+ purchaseOrder.ExpensesPurchaseOrderId.ToString() + " created successfully.");
            return Ok(result);

        }
        /// <summary>
        /// This method is used to udpate purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/expensePurchaseOrders")]
        public IHttpActionResult UpdateExpensePurchaseOrder()
        {
            ExpensesPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ExpensesPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_expensesPurchaseOrderManager.UpdateExpensePurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.ExpensePurchaseOrder.ToString(), enumAuditType.Update.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.ExpensesPurchaseOrderId.ToString(), "UpdateExpensePurchaseOrder","Updated Expense Purchase order "+ purchaseOrder.ExpensesPurchaseOrderId.ToString() + " successfully.");
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/expensePurchaseOrders/{purchaseOrderId}/{userId}")]
        public IHttpActionResult DeleteContractPurchaseOrder(int purchaseOrderId, int userId)
        {

            var result = m_expensesPurchaseOrderManager.DeleteExpensePurchaseOrder(new ExpensesPurchaseOrder
            {
                ExpensesPurchaseOrderId = purchaseOrderId,
                CreatedBy = userId//static value need to change
            });
           //MyAuditLog.Info(enumModuleCodes.ExpensePurchaseOrder.ToString(), enumAuditType.Delete.ToString(), userId.ToString(), purchaseOrderId.ToString(), "DeleteContractPurchaseOrder","Deleted Contract Purchase order "+ purchaseOrderId.ToString() + " successfully.");
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expensePurchaseOrderFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_expensesPurchaseOrderManager.DownloadFile(attachment));
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
        [Route("api/EXPOQuotationFileDownload")]
        public HttpResponseMessage DownloadEXPOQuotationFile([FromUri]EXPOQuotationAttachments eXPOQuotationAttachments)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_expensesPurchaseOrderManager.DownloadEXPOQuotationFile(eXPOQuotationAttachments));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(eXPOQuotationAttachments.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("eXPOQuotationAttachments")
            {
                FileName = eXPOQuotationAttachments.FileName
            };
            result.Headers.Add("FileName", eXPOQuotationAttachments.FileName);
            return result;
        }

    }
}
