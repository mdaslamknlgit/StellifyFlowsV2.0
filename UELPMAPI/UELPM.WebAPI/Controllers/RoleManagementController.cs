using Newtonsoft.Json;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class RoleManagementController : ApiController
    {
        private readonly IRoleManagementManager m_roleManagementManager;

        public RoleManagementController(IRoleManagementManager roleManagementManager)
        {
            m_roleManagementManager = roleManagementManager;
        }

        /// <summary>
        /// This method is used for getting roles
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/rolesManager")]
        public IHttpActionResult GetRoles([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_roleManagementManager.GetRoles(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting roles based on search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/rolesManager/search")]
        public IHttpActionResult GetAllSearchRoles([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_roleManagementManager.GetAllSearchRoles(gridDisplayInput);
            return Ok(result);
        }
      

        /// <summary>
        /// This method is used to get role by Id
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/rolesManager/{id}")]
        public IHttpActionResult GetRoleDetails(int id)
        {
            var result = m_roleManagementManager.GetRoleDetails(id);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create role
        /// </summary>
        /// <param name="role">role</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/rolesManager")]
        public IHttpActionResult CreateRole()
        {
            Roles role = JsonConvert.DeserializeObject<Roles>(HttpContext.Current.Request.Form["role"]);
            var result = m_roleManagementManager.CreateRole(role);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to udpate role
        /// </summary>
        /// <param name="role">role</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/rolesManager")]
        public IHttpActionResult UpdateRole()
        {
            Roles role = JsonConvert.DeserializeObject<Roles>(HttpContext.Current.Request.Form["role"]);
            var result = m_roleManagementManager.UpdateRole(role);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to delete role
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/rolesManager/{id}")]
        public IHttpActionResult DeleteRole(int id)
        {
            var result = m_roleManagementManager.DeleteRole(id);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting page modules/sub modules
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/pageModules")]
        public IHttpActionResult GetPageModules()
        {
            var result = m_roleManagementManager.GetPageModules();
            return Ok(result);
        }
    }
}
