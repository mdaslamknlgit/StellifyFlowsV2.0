using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    [RoutePrefix("api/Reports")]
    public class ReportsController : ApiController
    {
        private readonly IReportsManager m_reportsManager;
        public ReportsController(IReportsManager reportsManager)
        {
            m_reportsManager = reportsManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("GetParamData/{userId}")]
        public IHttpActionResult GetParamData(int userId)
        {
            var result = m_reportsManager.GetParamData(userId);
            return Ok(result);
        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetReportData")]
        public IHttpActionResult GetReportData(ReportParameter reportParameter)
        {
            var result = m_reportsManager.GetReportData(reportParameter);
            return Ok(result);
        }
    }
}
