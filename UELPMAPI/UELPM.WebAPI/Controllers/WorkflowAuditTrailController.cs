using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class WorkflowAuditTrailController : ApiController
    {
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;


        public WorkflowAuditTrailController(IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }
        /// <summary>
        /// This method is used for getting all item categories
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/WorkflowAuditTrail")]
        public IHttpActionResult GetItemCategories([FromUri] GridDisplayInput gridDisplayInput)
        {

            try
            {
                var result = m_workflowAuditTrailManager.GetWorkFlowAuditTrails(gridDisplayInput);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpPost]
        [Route("api/CreateWorkFlowAuditTrail")]
        public IHttpActionResult CreateWorkFlowAuditTrail(WorkflowAuditTrail workflowAuditTrail)
        {
            ResponseStatus statusObj = new ResponseStatus();

            try
            {

                var result = m_workflowAuditTrailManager.CreateWorkflowAuditTrail(workflowAuditTrail);

                statusObj.Status = "success";
                statusObj.Value = result;

                return Ok(statusObj);

            }
            catch (Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();

                return Ok(statusObj);
            }
        }
    }
}
