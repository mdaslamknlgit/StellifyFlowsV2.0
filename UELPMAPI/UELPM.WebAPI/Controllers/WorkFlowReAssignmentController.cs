using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class WorkFlowReAssignmentController : ApiController
    {
        private readonly IWorkFlowReAssignmentManager m_workFlowReAssignmentManager;

        public WorkFlowReAssignmentController(IWorkFlowReAssignmentManager workFlowReAssignmentManager)
        {
            m_workFlowReAssignmentManager = workFlowReAssignmentManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/workFlowReAssignment/{userId}/{companyId}")]
        public IHttpActionResult GetUserWorkFlowReAssignDetails(int userId, int companyId)
        {
            var result = m_workFlowReAssignmentManager.GetUserWorkFlowReAssignDetails(userId, companyId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/workFlowReAssignment")]
        public IHttpActionResult CreateWorkFlowReAssignment(WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            var result = m_workFlowReAssignmentManager.CreateWorkFlowReAssignment(workFlowReAssignmentDetails);
            return Ok(result);
        }

        [HttpGet]     
        [Route("api/workFlowReAssignment/print")]
        public HttpResponseMessage GetWorkFlowReAssignmentPDFTemplate([FromUri]WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            var pdfContent = m_workFlowReAssignmentManager.GetWorkFlowReAssignmentPDFTemplate(workFlowReAssignmentDetails);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [Route("api/workFlowReAssignment/VerifyAlternateUser/{currentUserId}/{alternateUserId}")]
        public IHttpActionResult VerifyAlternateUser(int currentUserId, int alternateUserId)
        {
            var result = m_workFlowReAssignmentManager.VerifyAlternateUser(currentUserId,alternateUserId);
            return Ok(result);
        }

    }
}
