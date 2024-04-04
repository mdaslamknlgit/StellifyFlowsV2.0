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
    public class NotificationController : ApiController
    {
        private readonly INotificationManager m_notificationManager;

        public NotificationController() { }

        public NotificationController (INotificationManager notificationManager)
        {
            m_notificationManager = notificationManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allNotifications")]
        public IHttpActionResult GetAllNotifications([FromUri] NotificationDisplayInput notificationDisplayInput)
        {
            var result = m_notificationManager.GetAllNotifications(notificationDisplayInput);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/newNotifications")]
        public IHttpActionResult GetNewNotifications([FromUri] NotificationDisplayInput notificationDisplayInput)
        {
            var result = m_notificationManager.GetNewNotifications(notificationDisplayInput);
            return Ok(result);
        }
        [HttpPut]
        [Route("api/updateNotifications")]
        public IHttpActionResult UpdateNotification(List<Notifications> notifications)
        {
            var result = m_notificationManager.UpdateNotification(notifications);
            return Ok(result);       
        }
    }
}
