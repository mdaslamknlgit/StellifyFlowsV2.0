using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class MarketingList
    {
        public int ListId { get; set; }
        public string ListName { get; set; }
        public string ListDesc { get; set; }
        public int TenantId { get; set; }
        public int UserId { get; set; }
        public DateTime LastUpdate { get; set; }
        public bool IsActive { get; set; }
        public int EmailCount { get; set; }
        public IList<EmailDTO> Emails { get; set; }
    }
}
