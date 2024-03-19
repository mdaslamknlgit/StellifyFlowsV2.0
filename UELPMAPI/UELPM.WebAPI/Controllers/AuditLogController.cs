using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class AuditLogController : ApiController
    {
        private readonly IAuditLogManager m_auditLogManager;

        public AuditLogController(IAuditLogManager auditLogManager)
        {
            m_auditLogManager = auditLogManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/auditLogs/GetAuditLogs")]
        public IHttpActionResult GetAuditLogs ([FromUri] AuditLogSearch gridDisplayInput)
       {
            var result = m_auditLogManager.GetAuditLogs(gridDisplayInput);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/auditLogs/search")]
        public IHttpActionResult SearchAuditlogs([FromUri] AuditLogSearch gridDisplayInput)
        {
            var result = m_auditLogManager.SearchAuditLogs(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/auditLogs/GetAuditLogsByDocumentId")]
        public IHttpActionResult GetAuditLogsByDocumentId([FromUri] AuditLogSearch gridDisplayInput)
        {
            var result = m_auditLogManager.GetAuditLogsByDocumentId(gridDisplayInput);
            return Ok(result);
        }
    }
}
