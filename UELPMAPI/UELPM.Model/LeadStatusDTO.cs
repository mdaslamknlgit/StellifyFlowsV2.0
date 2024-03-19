using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class LeadStatusDTO
    {
        public int LeadStatId { get; set; }

        public string LeadStatName { get; set; }

        public string LeadStatAlias { get; set; }

        public bool? LeadStatActive { get; set; }

        public bool IsConverting { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

    }


    public class LeadStatusRetults
    {
        public IEnumerable<LeadStatusDTO> LeadStatus { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
        public int TotalRecords { get; set; }
    }


    public class LeadStatusDomainItem
    {
        public int LeadStatId { get; set; }

        public string LeadStatName { get; set; }
    }
}
