using Newtonsoft.Json;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Business.Managers;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class EmptyController : ApiController
    {
        private readonly IRoleManagementManager m_roleManagementManager;
        public EmptyController(IRoleManagementManager roleManagementManager)
        {
            m_roleManagementManager = roleManagementManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Empty/All")]
        public IHttpActionResult GetAll(int id)
        {
            var result = m_roleManagementManager.GetRoleDetails(id);
            return Ok(result);
        }
    

    
    }


}
