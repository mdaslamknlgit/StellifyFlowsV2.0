using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class DocumentAddress
    {
        public int DocumentId { get; set; }
        public int CompanyId { get; set; }
        public int ProcessId { get; set; }
        public string Address { get; set; }
    }
}
