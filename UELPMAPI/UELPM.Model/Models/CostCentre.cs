using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class CostCentre
    {
        public int CostCenterId { get; set; }
        public string CostCenterName { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set;  }

        public DateTime CreatedDate { get; set; }
    }

    public class CostCentreDisplayResult
    {
        public List<CostCentre> CostCentres { get; set; }
        public int TotalRecords { get; set; }
    }
}
