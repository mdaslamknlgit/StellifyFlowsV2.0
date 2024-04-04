using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class SchedulerNoController : ApiController
    {
        private readonly ISchedulerNoManager m_schedulerNoManager;

        public SchedulerNoController() { }
        public SchedulerNoController(ISchedulerNoManager schedulerNoManager)
        {
            m_schedulerNoManager = schedulerNoManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/schedulerno")]
        public IHttpActionResult GetSchedulerNo()
        {
            var result = m_schedulerNoManager.GetSchedulerNo();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetSchedulerByType/{Type}")]
        public IHttpActionResult GetSchedulerByType(string Type)
        {
            var result = m_schedulerNoManager.GetSchedulerByType(Type);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("api/CheckSchedulerNo")]
        public IHttpActionResult CheckSchedulerNo(SchedulerNo schedulerNo)
        {
            var result = m_schedulerNoManager.CheckSchedulerNo(schedulerNo);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetGetSchedulerNoById/{Id}")]
        public IHttpActionResult GetSchedulerNoById(int Id)
        {
            var result = m_schedulerNoManager.GetSchedulerNoById(Id);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/DeleteSchedulerNo/{SchedulerNoId}/{UpdatedBy?}")]
        public IHttpActionResult DeleteSchedulerNo(int SchedulerNoId, int? UpdatedBy)
        {
            var result = m_schedulerNoManager.DeleteSchedulerNo(SchedulerNoId, UpdatedBy);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/PostSchedulerNo")]
        public IHttpActionResult PostSchedulerNo()
        {

            SchedulerNo scheduler = JsonConvert.DeserializeObject<SchedulerNo>(HttpContext.Current.Request.Form["PostSchedulerNo"]);
            var result = m_schedulerNoManager.PostSchedulerNo(scheduler);
            return Ok(result);

        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("api/ChangeStatus")]
        public IHttpActionResult ChangeStatus()
        {
            SchedulerNo scheduler = JsonConvert.DeserializeObject<SchedulerNo>(HttpContext.Current.Request.Form["PostSchedulerNo"]);
            var result = m_schedulerNoManager.ChangeStatus(scheduler);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetScheduleCategories")]
        public IHttpActionResult GetScheduleCategories()
        {
            try
            {
                var result = m_schedulerNoManager.GetScheduleCategories();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetScheduleTypes")]
        public IHttpActionResult GetScheduleTypes()
        {
            try
            {
                var result = m_schedulerNoManager.GetScheduleTypes();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
