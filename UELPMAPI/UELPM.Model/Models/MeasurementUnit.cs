using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{

    public class MeasurementUnit
    {
        public string Name { get; set; }
        public string Code { get; set;  }
        public string Description { get; set; }
        public string Abbreviation { get; set; }
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }
        public int ModifiedBy { get; set; }
        public int MeasurementUnitID { get; set; }
    }

    public class MeasurementUnitDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class MeasurementUnitDisplayResult
    {
        public List<MeasurementUnit> MeasurementUnits { get; set; }
        public int TotalRecords { get; set; }
    }

    public class MeasurementUnitDelete
    {
        public int MeasurementUnitID { get; set; }
        public int ModifiedBy { get; set; }

    }

    public class ValidateMesurementUnit
    {
        public string Name { get; set; }
        public string Code { get; set;  }
        public int MeasurementUnitID { get; set; }
    }
}
