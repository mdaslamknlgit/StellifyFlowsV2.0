using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class DepartmentManagement
    {
        public int LocationId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int? IsDepartment { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int CompanyId { get; set; }
        public int? IsDeleted { get; set; }
    }

    public class DepartmentManagementDisplayResult
    {
        public List<DepartmentManagement> DepartmentList { get; set; }
        public int TotalRecords { get; set; }
    }


}
