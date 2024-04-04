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
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ProjectPaymentContractController : ApiController
    {

        private readonly IProjectPaymentContractManager m_projectPaymentContractManager;

        public ProjectPaymentContractController() { }

        public ProjectPaymentContractController(IProjectPaymentContractManager projectPaymentContractManager)
        {
            m_projectPaymentContractManager = projectPaymentContractManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectPaymentContract")]
        public IHttpActionResult GetProjectPaymentContracts ([FromUri] GridDisplayInput gridDisplayInput)
        {
           //var result = m_projectPaymentContractManager.GetProjectPaymentContracts(gridDisplayInput);
            return Ok("");
        }

        [HttpPost]
        [Route("api/projectPaymentContract")]
        public IHttpActionResult CreateProjectPaymentContract()
        {
            ProjectPaymentContract projectPaymentContract = JsonConvert.DeserializeObject<ProjectPaymentContract>(HttpContext.Current.Request.Form["purchaseOrder"]);
            projectPaymentContract.files = HttpContext.Current.Request.Files;

            var result = m_projectPaymentContractManager.CreateProjectPaymentContract(projectPaymentContract);
            return Ok(result);
        }

        [HttpGet, Route("api/getCertificatesByPaymentContractId/{POPId}/{PaymentContractId}")]
        public IHttpActionResult getCertificatesByPaymentContractId(int POPId,int PaymentContractId)
        {
            var result = m_projectPaymentContractManager.getCertificatesByPaymentContractId(POPId,PaymentContractId);
            return Ok(result);
        }

        [HttpGet, Route("api/getProjectPaymentContracts")]
        public IHttpActionResult getProjectPaymentContracts([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_projectPaymentContractManager.getProjectPaymentContracts(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet, Route("api/CheckPendingApprovals/{POPId}")]
        public IHttpActionResult CheckPendingApprovals(int POPId)
        {
            var result = m_projectPaymentContractManager.CheckPendingApprovals(POPId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectPaymentList/filter")]
        public IHttpActionResult GetPaymentListFilterData([FromUri] ProjectPaymentListFilter projectPaymentListFilter )
        {
            var result = m_projectPaymentContractManager.getPaymentListFilterData(projectPaymentListFilter);
         
                return Ok(result);
           
        }

        [HttpPost, Route("api/getProjectPaymentReport")]
        public IHttpActionResult getProjectPaymentReport(ReportParams docs)
        {
            var result = m_projectPaymentContractManager.getProjectPaymentReport(docs);
            return Ok(result);
        }
    } 
}
