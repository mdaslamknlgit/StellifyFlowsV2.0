using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class ActivityTypeDTO
    {
        public int ActivityTypeId { get; set; }

        public string ActivityTypeName { get; set; }

        public string ActivityTypeAlias { get; set; }

        public bool? ActivityTypeActive { get; set; }

        public bool? ActivityTypeShow { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

    }


    public class ActivityTypeDomainItem
    {
        public int ActivityTypeId { get; set; }
        public string ActivityTypeName { get; set; }


    }

    public class ActivityTypeList
    {
        public int ActivityTypeId { get; set; }
        public string ActivityTypeName { get; set; }

        public List<ActivityDTO> ActivitiesList { get; set; }

    }


}
