using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ServiceTypeController : ApiController
    {
        private readonly IServiceTypeManager m_serviceTypeManager;
        public ServiceTypeController() { }

        public ServiceTypeController(IServiceTypeManager serviceTypeManager)
        {
            m_serviceTypeManager = serviceTypeManager;
        }
        
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceTypes")]
        public IHttpActionResult GetServiceTypes([FromUri] ServiceTypeDisplayInput serviceTypeDisplayInput)
        {
            var result = m_serviceTypeManager.GetServiceTypes(serviceTypeDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceTypes/Search")]
        public IHttpActionResult GetAllServiceTypes([FromUri] ServiceTypeDisplayInput serviceTypeDisplayInput)
        {
            var result = m_serviceTypeManager.GetAllServiceTypes(serviceTypeDisplayInput);
            return Ok(result);
        }
       
        [HttpPost]
        [Route("api/serviceTypes")]
        public IHttpActionResult CreateServiceType(ServiceType serviceType)
        {
            ResponseStatus statusObj = new ResponseStatus();
            var result = m_serviceTypeManager.CreateServiceType(serviceType);
            if (result == "Duplicate")
            {
                statusObj.Status = result;
            }
            else
            {
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }
     
        [HttpPut]
        [Route("api/serviceTypes")]
        public IHttpActionResult UpdateServiceType(ServiceType serviceType)
        {
            ResponseStatus statusObj = new ResponseStatus();
            var result = m_serviceTypeManager.UpdateServiceType(serviceType);
            if (result == "Duplicate")
            {
                statusObj.Status = result;
            }
            else
            {
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }

        [HttpDelete]
        [Route("api/serviceTypes/{serviceTypeId}")]
        public IHttpActionResult DeleteServiceType(int serviceTypeId)
        {
            var result = m_serviceTypeManager.DeleteServiceType(serviceTypeId);
            return Ok(result);
        }      
    }
}
