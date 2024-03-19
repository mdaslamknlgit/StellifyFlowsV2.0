using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ProjectPurchaseOrderController : ApiController
    {
        private readonly IProjectPurchaseOrderManager m_projectPurchaseOrderManager;

        public ProjectPurchaseOrderController() { }

        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;
        private readonly IProjectMasterContractManager m_projectMasterContractManager;

        public ProjectPurchaseOrderController(IProjectPurchaseOrderManager projectPurchaseOrderManager,IProjectMasterContractManager projectMasterContractManager ,IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_projectPurchaseOrderManager = projectPurchaseOrderManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
            m_projectMasterContractManager = projectMasterContractManager;
        }
        /// <summary>
        /// This method is used for getting all project purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectPurchaseOrders")]
        public IHttpActionResult GetProjectPurchaseOrders([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_projectPurchaseOrderManager.GetProjectPurchaseOrders(purchaseOrderInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting the details of the selected project purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectPurchaseOrders/{purchaseOrderId}/{loggedInUserId}")]
        public IHttpActionResult GetProjectPurchaseOrderDetails(int purchaseOrderId, int loggedInUserId)
        {
            var projectPurchaseOrderDetails = m_projectPurchaseOrderManager.GetProjectPurchaseOrderDetails(purchaseOrderId);
            var projectMasterContractDetails = m_projectMasterContractManager.GetProjectMasterContractDetails(projectPurchaseOrderDetails.ProjectMasterContractId);

            //if (result != null && result.WorkFlowComments != null && result.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
            //{
            //    result.ReasonsToReject = result.WorkFlowComments.OrderByDescending(i => i.CreatedDate).FirstOrDefault().Remarks;
            //}
            return Ok(new { ProjectPurchaseOrderDetails = projectPurchaseOrderDetails,ProjectMasterContractDetails  = projectMasterContractDetails });
        }

        /// <summary>
        /// This method is used to create project purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/projectPurchaseOrders")]
        public IHttpActionResult CreateProjectPurchaseOrder()
        {
            ProjectPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ProjectPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_projectPurchaseOrderManager.CreateProjectPurchaseOrder(purchaseOrder);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to udpate project purchase order
        /// </summary>
        /// <param name="purchaseOrder">purchaseOrder</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/projectPurchaseOrders")]
        public IHttpActionResult UpdateProjectPurchaseOrder()
        {
            ProjectPurchaseOrder purchaseOrder = JsonConvert.DeserializeObject<ProjectPurchaseOrder>(HttpContext.Current.Request.Form["purchaseOrder"]);
            purchaseOrder.files = HttpContext.Current.Request.Files;
            var result = m_projectPurchaseOrderManager.UpdateProjectPurchaseOrder(purchaseOrder);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/projectPurchaseOrders/{purchaseOrderId}/{userId}")]
        public IHttpActionResult DeleteProjectPurchaseOrder(int purchaseOrderId, int userId)
        {
            var result = m_projectPurchaseOrderManager.DeleteProjectPurchaseOrder(new ProjectPurchaseOrder
            {
                ProjectPurchaseOrderId = purchaseOrderId,
                CreatedBy = userId//static value need to change
            });
            return Ok(result);
        }
    }
}
