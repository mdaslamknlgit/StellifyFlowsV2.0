using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class ListByEmail
    {
        public int ListId { get; set; }
        public string ListName { get; set; }
        public List<EmailDTO> EmailList { get; set; }
    }
}
