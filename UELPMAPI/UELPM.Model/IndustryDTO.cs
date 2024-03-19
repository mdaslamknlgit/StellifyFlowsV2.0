using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class IndustryDTO
    {
        public int IndsID { get; set; }
        public string IndustryName { get; set; }
        public string IndustryAlias { get; set; }
        public string IndustryGroup { get; set; }
        public Boolean IsActive { get; set; }
        public string Status { get; set; }
    }

    public class IndustryResult
    {
        public List<IndustryDTO> Industry { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }

    public class IndustryDomainItem
    {
        public int IndsId { get; set; }

        public string IndustryName { get; set; }
    }
}
