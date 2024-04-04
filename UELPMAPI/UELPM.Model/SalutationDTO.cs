using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class SalutationDTO
    {
        public int SalId { get; set; }

        public string SalName { get; set; }

        public string SalAlias { get; set; }

        public bool SalActive { get; set; }
    }
}
