using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class Notifications
    {
        public int NotificationId { get; set; }
        public string NotificationType { get; set; }
        public string NotificationMessage { get; set; }
        public int ProcessId { get; set; }
        public string ProcessName { get; set; }
        public int DocumentId { get; set; }
        public string DocumentCode { get; set; }
        public int UserId { get; set; }
        public bool IsRead { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsNew { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public bool IsforAll { get; set; }
        public int MessageType { get; set; }
        //public byte[] ProfileImage { get; set; }
    }

    public class NotificationDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public int UserId { get; set; }
        public bool IsNew { get; set; }
        public int CompanyId { get; set; }
    }

    public class NotificationisplayResult
    {
        public List<Notifications>  Notifications { get; set; }
        public int TotalRecords { get; set; }
        public int UnReadNotificationsCount { get; set; }
    }


    public enum NotificationMessageTypes:int
    {     
        Requested = 1,
        Approved = 2,
        Rejected = 3,
        AskedForClarification =4,
        SentMessage=5,
        Void=6
    }
}
