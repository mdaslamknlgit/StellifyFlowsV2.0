using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class AppViewsDTO
    {
        public int ViewId { get; set; }

        public int? FormId { get; set; }

        public string ViewName { get; set; }

        public string ViewAlias { get; set; }

        public bool IsActive { get; set; }

        public bool IsSystem { get; set; }

        public bool IsPinned { get; set; }

        public string ViewSQL { get; set; }

        public string ViewOrderField { get; set; }

        public string ViewSortOrder { get; set; }

        public char ViewType { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }
    }

    public class AppViewsSearch : AppViewsDTO
    {
        public int UserId { get; set; }
        public int Skip { get; set; }

        public int Take { get; set; }
    }
    public class AppViewsResult
    {
        public IEnumerable<AppViewsDTO> AppViews { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }
}
