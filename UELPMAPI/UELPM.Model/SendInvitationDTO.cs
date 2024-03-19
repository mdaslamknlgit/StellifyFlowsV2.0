using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class SendInvitationDTO
    {
        public int Id { get; set; }
        public int connectionid { get; set; }
        public string profileid { get; set; }
        public string Message { get; set; }
        public DateTime lastUpdate { get; set; }
        public int userId { get; set; }
        public int isActive { get; set; }
    }
}
