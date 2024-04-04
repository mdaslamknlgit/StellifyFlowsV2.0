using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class Depreciation
    {
       public int DepreciationId { get; set; }
	   public string Name { get; set; }
	   public string Description { get; set; }
       public int CreatedBy { get; set; }
    }
    public class DepreciationDisplayResult
    {
        public List<Depreciation> Depreciations { get; set; }
        public int TotalRecords { get; set; }
    }
}
