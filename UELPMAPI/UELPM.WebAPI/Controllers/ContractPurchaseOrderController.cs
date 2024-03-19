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
    public class ContractPurchaseOrderController : ApiController
    {
        private readonly IContractPurchaseOrderManager m_contractPurchaseOrderManager;
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;

        public ContractPurchaseOrderController() { }

        public ContractPurchaseOrderController(IContractPurchaseOrderManager contractPurchaseOrderManager, IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_contractPurchaseOrderManager = contractPurchaseOrderManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }

        /// <summary>
        /// This method is used for getting all purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contractPurchaseOrders")]
        public IHttpActionResult GetContractPurchaseOrders([FromUri] PurchaseOrderSearch purchaseOrderInput)
        {
            var result = m_contractPurchaseOrderManager.GetContractPurchaseOrders(purchaseOrderInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accuralomanagement")]
        public IHttpActionResult GetCPOAccuralManagement([FromUri] PurchaseOrderSearch purchaseOrderInput)
        {
            var result = m_contractPurchaseOrderManager.GetCPOAccuralManagement(purchaseOrderInput);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accuralreverse")]
        public IHttpActionResult GetCPOAccuralReverse([FromUri] PurchaseOrderSearch purchaseOrderInput)
        {
            var result = m_contractPurchaseOrderManager.GetCPOAccuralReverse(purchaseOrderInput);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contractPurchaseOrders/SearchAll")]
        public IHttpActionResult GetAllSearchPurchaseOrders([FromUri] PurchaseOrderSearch purchaseOrderInput)
        {
            var result = m_contractPurchaseOrderManager.GetAllSearchPurchaseOrders(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contractPurchaseOrders/{purchaseOrderId}")]
        public IHttpActionResult GetContractPurchaseOrderDetails(string purchaseOrderId)
        {
            var result = m_contractPurchaseOrderManager.GetContractPurchaseOrderDetails(purchaseOrderId);
            if (result != null)
            {
                result.WorkFlowComments = new List<WorkflowAuditTrail>();
                result.WorkFlowComments = m_workflowAuditTrailManager.GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                {
                    Documentid = result.CPOID,
                    ProcessId = SharedRepository.getWorkFlowProcessIdForPO(result.POTypeId,false),
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
        [Route("api/contractPurchaseOrders")]
        public IHttpActionResult CreateContractPurchaseOrder()
        {
            ContractPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ContractPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_contractPurchaseOrderManager.CreateContractPurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.ContractPurchaseOrder.ToString(), enumAuditType.Create.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "CreateContractPurchaseOrder", "Purchase Order: "+ purchaseOrder.CPOID.ToString()+ " is created successfully.");
            return Ok(result);

        }
        /// <summary>
        /// This method is used to udpate purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/contractPurchaseOrders")]
        public IHttpActionResult UpdateContractPurchaseOrder()
        {
            ContractPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ContractPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;

      
            var result = m_contractPurchaseOrderManager.UpdateContractPurchaseOrder(purchaseOrder);
            //MyAuditLog.Info(enumModuleCodes.ContractPurchaseOrder.ToString(), enumAuditType.Update.ToString(), purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "UpdateContractPurchaseOrder", "Contract Purchase Order: "+ purchaseOrder.CPOID.ToString()+" is updated successfully.");
            return Ok(result);
        }
        [HttpPut]
        [Route("api/contractPurchaseOrders/AccrualCodeUpdate")]
        public IHttpActionResult UpdateAccraulCode()
        {
            ContractPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ContractPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_contractPurchaseOrderManager.UpdateAccraulCode(purchaseOrder);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/contractPurchaseOrders/{purchaseOrderId}/{userId}")]
        public IHttpActionResult DeleteContractPurchaseOrder(int purchaseOrderId,int userId)
        {

            var result = m_contractPurchaseOrderManager.DeleteContractPurchaseOrder(new ContractPurchaseOrderDelete
            {
                CPOID = purchaseOrderId,
                ModifiedBy = userId//static value need to change
            });
            //MyAuditLog.Info(enumModuleCodes.ContractPurchaseOrder.ToString(), enumAuditType.Delete.ToString(), userId.ToString(), purchaseOrderId.ToString(), "DeleteContractPurchaseOrder", "Deleted Contract purchase order "+purchaseOrderId.ToString()+" successfully");
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contractPurchaseOrderFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_contractPurchaseOrderManager.DownloadFile(attachment));
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
        [Route("api/contractPurchaseOrders/sendForApproval")]
        public IHttpActionResult SendForApproval(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                m_contractPurchaseOrderManager.SendForApproval(purchaseOrder, true);
                return Ok();
            }
            catch (Exception ex)
            {
                MyAuditLog.SendErrorToText1("ContractPurchaseOrderController", "SendForApproval", "", "SendForApproval", ex.Message);
                throw;
            }
        }

        [HttpPost]
        [Route("api/contractPurchaseOrders/generatePoc")]
        public IHttpActionResult GeneratePoc(ContractPurchaseOrder purchaseOrder)
        {
            var result = m_contractPurchaseOrderManager.GeneratePoc(purchaseOrder);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/contractPurchaseOrders/exportAccrualGL")]
        public IHttpActionResult exportAccrualGL(ContractPurchaseOrder[] contractPurchaseOrderList)
        {
           
            var result = m_contractPurchaseOrderManager.exportAccrualGL(contractPurchaseOrderList);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/contractPurchaseOrders/changePOStatus/{workflowStatusId}")]
        public IHttpActionResult ChangePOCStatus(List<ContractPurchaseOrder> contractPurchaseOrders,int workflowStatusId)
        {

            var result = m_contractPurchaseOrderManager.ChangePOCStatus(contractPurchaseOrders, workflowStatusId);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/UpdateJVACode/{CPONumber}/{CPOJVACode}")]
        public IHttpActionResult UpdateJVACode(string CPONumber,string CPOJVACode)
        {
            try
            {
                var result= m_contractPurchaseOrderManager.UpdateJVACode(CPONumber,CPOJVACode.Replace('~','/'));
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contractPurchaseOrders/getPocLists")]
        //public IHttpActionResult GetPocList([FromUri] ContractPurchaseOrder purchaseOrder)
        public IHttpActionResult GetPocList([FromUri] ContractPurchaseOrder purchaseOrder)
        {
            var result = m_contractPurchaseOrderManager.GetPocList(purchaseOrder);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/contractPurchaseOrders/getPocLists/{CPOID}")]
        public IHttpActionResult GetPocCount(int CPOID)
        {
            var result = m_contractPurchaseOrderManager.GetPocCount(CPOID);
            return Ok(result);
        }
    }
}
