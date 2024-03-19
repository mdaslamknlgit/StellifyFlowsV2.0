using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class LeadSourceDTO
    {
        public int Id { set; get; }

        public int LeadSourceId { get; set; }
        public string SourceName { set; get; }
        public string SourceDesc { set; get; }
        public Boolean IsActive { set; get; }
    }
}
