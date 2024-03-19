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
    public class ProjectMasterContractController : ApiController
    {
        private readonly IProjectMasterContractManager m_projectMasterContractManager;
        private readonly IWorkflowAuditTrailManager m_workflowAuditTrailManager;

        public ProjectMasterContractController() { }

        public ProjectMasterContractController(IProjectMasterContractManager projectMasterContractManager, IWorkflowAuditTrailManager workflowAuditTrailManager)
        {
            m_projectMasterContractManager = projectMasterContractManager;
            m_workflowAuditTrailManager = workflowAuditTrailManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectMasterContract")]
        public IHttpActionResult GetProjectMasterContracts([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_projectMasterContractManager.GetProjectMasterContracts(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectMasterContract/approval")]
        public IHttpActionResult GetProjectMasterContractsForApproval([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_projectMasterContractManager.GetProjectMasterContractsForApproval(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectMasterContract/search")]
        public IHttpActionResult GetProjectMasterContractsSearchResult([FromUri] ProjectMasterContractSearch projectMasterContractSearch)
        {
            var result = m_projectMasterContractManager.GetProjectMasterContractsSearchResult(projectMasterContractSearch);
            if (projectMasterContractSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.ProjectMasterContractList);
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectMasterContract/{projectMasterContractId}")]
        public IHttpActionResult GetProjectMasterContractDetails(int projectMasterContractId)
        {
            var result = m_projectMasterContractManager.GetProjectMasterContractDetails(projectMasterContractId);
            if (result != null)
            {
                result.WorkFlowComments = new List<WorkflowAuditTrail>();
                result.WorkFlowComments = m_workflowAuditTrailManager.GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                {
                    Documentid = result.ProjectMasterContractId,
                    ProcessId = SharedRepository.getWorkFlowProcessIdForPO(4, false),
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

        [HttpPost]
        [Route("api/projectMasterContract")]
        public IHttpActionResult CreateProjectMasterContract()
        {


            ProjectMasterContract projectMasterContract = JsonConvert.DeserializeObject<ProjectMasterContract>(HttpContext.Current.Request.Form["purchaseOrder"]);
            projectMasterContract.files = HttpContext.Current.Request.Files;

            var result = m_projectMasterContractManager.CreateProjectMasterContract(projectMasterContract);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/projectMasterContract")]
        public IHttpActionResult UpdateProjectMasterContract()
        {
            ProjectMasterContract projectMasterContract = JsonConvert.DeserializeObject<ProjectMasterContract>(HttpContext.Current.Request.Form["purchaseOrder"]);
            projectMasterContract.files = HttpContext.Current.Request.Files;

            var result = m_projectMasterContractManager.UpdateProjectMasterContract(projectMasterContract);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/projectMasterContract/{ProjectMasterContractId}/{CreatedBy}")]
        public IHttpActionResult DeleteProjectMasterContract([FromUri] ProjectMasterContract projectMasterContract)
        {
            var result = m_projectMasterContractManager.DeleteProjectMasterContract(projectMasterContract);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectMasterContract/CostTypes")]
        public IHttpActionResult CostTypes()
        {
            var result = m_projectMasterContractManager.CostTypes();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/ProjectPurchaseOrderFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri] Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_projectMasterContractManager.DownloadFile(attachment));
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
        [Route("api/projectMasContract/{companyId}/{userId}")]
        public IHttpActionResult GetProjectMasterApprovedDetails(int companyId, int userId)
        {
            var result = m_projectMasterContractManager.GetProjectMasterApprovedDetails(companyId, userId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectMasterContract/filter")]
        public IHttpActionResult GetPaymentProjectMasterFilterData([FromUri] ProjectMasterContractFilter projectMasterContractFilter)
        {
            var result = m_projectMasterContractManager.GetPaymentProjectMasterFilterData(projectMasterContractFilter);
            return Ok(result);
        }
    }
}
