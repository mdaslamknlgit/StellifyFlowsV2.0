using Newtonsoft.Json;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ProjectContractVariationOrderController : ApiController
    {
        private readonly IProjectContractVariationOrderManager m_projectContractVariationOrderManager;

        public ProjectContractVariationOrderController() { }

        public ProjectContractVariationOrderController(IProjectContractVariationOrderManager projectContractVariationOrderManager)
        {
            m_projectContractVariationOrderManager = projectContractVariationOrderManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectContractVariationOrder")]
        public IHttpActionResult GetProjectContractVariationOrders([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_projectContractVariationOrderManager.GetProjectContractVariationOrders(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectContractVariationOrder/approval")]
        public IHttpActionResult GetProjectContractVariationOrdersForApproval([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_projectContractVariationOrderManager.GetProjectContractVariationOrdersForApproval(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectContractVariationOrder/search")]
        public IHttpActionResult GetAllSearchProjectContractVariationOrders([FromUri] ProjectContractVariationOrderSearch projectContractVariationOrderSearch)
        {
            var result = m_projectContractVariationOrderManager.GetAllSearchProjectContractVariationOrders(projectContractVariationOrderSearch);
            if (projectContractVariationOrderSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.ProjectContractVariationOrderList);
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/projectContractVariationOrder/{ProjectContractVariationOrderId}/{companyId}")]
        public IHttpActionResult GetProjectContractVariationOrderDetails(int ProjectContractVariationOrderId, int companyId)
        {
            var result = m_projectContractVariationOrderManager.GetProjectContractVariationOrderDetails(ProjectContractVariationOrderId, companyId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/projectContractVariationOrder")]
        public IHttpActionResult CreateProjectContractVariationOrder()
        {
            ProjectMasterContract projectContractVariationOrder = JsonConvert.DeserializeObject<ProjectMasterContract>(HttpContext.Current.Request.Form["purchaseOrder"]);
            projectContractVariationOrder.files = HttpContext.Current.Request.Files;
            var result = m_projectContractVariationOrderManager.CreateProjectContractVariationOrder(projectContractVariationOrder);
            return Ok(result);
        }

        //[HttpPut]
        //[Route("api/projectContractVariationOrder")]
        //public IHttpActionResult UpdateProjectContractVariationOrder(ProjectContractVariationOrder projectContractVariationOrder)
        //{           
        //    var result = m_projectContractVariationOrderManager.UpdateProjectContractVariationOrder(projectContractVariationOrder);
        //    return Ok(result);
        //}
        [HttpGet, Route("api/projectContractVariationOrder/getVOList")]
        public IHttpActionResult getVOList([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_projectContractVariationOrderManager.getVOList(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet, Route("api/projectContractVariationOrder/getVODetailsbyId/{POPId}/{VOId}")]
        public IHttpActionResult getVODetailsbyId(int POPId, int VOId)
        {
            var result = m_projectContractVariationOrderManager.getVODetailsbyId(POPId, VOId);
            return Ok(result);
        }

        
    }
}
