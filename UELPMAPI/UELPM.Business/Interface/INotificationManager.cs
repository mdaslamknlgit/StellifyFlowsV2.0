using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface INotificationManager
    {
        void CreateNotification(Notifications notifications);
        NotificationisplayResult GetAllNotifications(NotificationDisplayInput notificationDisplayInput);
        NotificationisplayResult GetNewNotifications(NotificationDisplayInput notificationDisplayInput);
        int UpdateNotification(List<Notifications> notifications);
    }
}
