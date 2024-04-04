using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
   public class NotificationManager : INotificationManager
    {
        private readonly INotificationsRepository m_notificationsRepository;

        public NotificationManager(INotificationsRepository notificationsRepository)
        {
            m_notificationsRepository = notificationsRepository;
        }
        public NotificationisplayResult GetAllNotifications(NotificationDisplayInput notificationDisplayInput)
        {
            return m_notificationsRepository.GetAllNotifications(notificationDisplayInput);
        }
        public NotificationisplayResult GetNewNotifications(NotificationDisplayInput notificationDisplayInput)
        {
            return m_notificationsRepository.GetNewNotifications(notificationDisplayInput);
        }
        public int UpdateNotification(List<Notifications> notifications)
        {
           return m_notificationsRepository.UpdateNotification(notifications);
        }
        public  void CreateNotification(Notifications notifications)
        {
            m_notificationsRepository.CreateNotification(notifications);
        }
    }
}
