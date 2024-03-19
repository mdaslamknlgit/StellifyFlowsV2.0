using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class CloseOpp
    {
        public int CurrentOppId { get; set; }
        public string CurrentActualRevenue { get; set; }
        public string CurrentEstRevenue { get; set; }
        public string CloseRevenue { get; set; }
        public bool Status { get; set; }
        public DateTime OppCloseDate { get; set; }
        public string SelectedId { get; set; }
        public string OppDesc { get; set; }
    }
}
