using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class AppModulesDTO
    {
        public int ModuleID { get; set; }

        public string ModuleName { get; set; }

        public string ModuleAlias { get; set; }

        public bool? ModuleActive { get; set; }

        public string ModuleKey { get; set; }

        public bool? IsActive { get; set; }

        public bool? IsSystem { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }
    }

    public class AppModulesSearchInput : AppModulesDTO
    {

    }

    public class AppModulesResult
    {
        public IEnumerable<AppModulesDTO> AppModules { get; set; }

        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

    }
}
