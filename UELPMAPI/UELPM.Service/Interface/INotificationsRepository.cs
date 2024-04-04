using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
   public interface INotificationsRepository
    {
        void CreateNotification(Notifications notifications);
        NotificationisplayResult GetAllNotifications(NotificationDisplayInput notificationDisplayInput);
        NotificationisplayResult GetNewNotifications(NotificationDisplayInput notificationDisplayInput);
        int UpdateNotification(List<Notifications> notifications);
    }
}
