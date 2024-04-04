using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class TaxGroupManagement
    {
        public int TaxGroupId { get; set; }
        public string TaxGroupName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int IsDeleted { get; set; }
    }


    public class TaxGroupManagementDisplayResult
    {
        public List<TaxGroupManagement> TaxGroupList { get; set; }
        public int TotalRecords { get; set; }
    }
}
