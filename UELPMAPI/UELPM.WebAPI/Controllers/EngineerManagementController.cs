using System;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class EngineerManagementController : ApiController
    {
        private readonly IEngineerManagementManager m_engineerManagementManager;
        public EngineerManagementController(IEngineerManagementManager engineerManagementManager)
        {
            m_engineerManagementManager = engineerManagementManager;
        }

        [HttpGet]
        [Route("api/EngineerManagement")]
        public IHttpActionResult GetEngineerManagement([FromUri]GridDisplayInput engineerManagementInput)
        {
            var result = m_engineerManagementManager.GetEngineerManagement(engineerManagementInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/EngineerManagement/Filter")]
        public IHttpActionResult GetFilterEngineerManagement([FromUri] EngineerManagementFilterDisplayInput engineerManagementFilterDisplayInput)
        {
            try
            {
                var result = m_engineerManagementManager.GetFilterEngineerManagement(engineerManagementFilterDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/EngineerManagement/{engineerId}")]
        public IHttpActionResult GetUserDetails(int engineerId)
        {
            var result = m_engineerManagementManager.GetEngineerManagementDetails(engineerId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/EngineerManagement")]
        public IHttpActionResult CreateEngineerManagement(EngineerManagement engineerManagement)
        {           
            var result = m_engineerManagementManager.CreateEngineerManagement(engineerManagement);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/EngineerManagement")]
        public IHttpActionResult UpdateEngineerManagement(EngineerManagement engineerManagement)
        {           
            var result = m_engineerManagementManager.UpdateEngineerManagement(engineerManagement);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/EngineerManagement/{engineerId}/{userId}")]
        public IHttpActionResult DeleteEngineerManagement(int engineerId, int userId)
        {

            var result = m_engineerManagementManager.DeleteEngineerManagement(new EngineerManagementDelete
            {
                EngineerId = engineerId,
                ModifiedBy = userId
            });

            return Ok(result);
        }
    }
}
