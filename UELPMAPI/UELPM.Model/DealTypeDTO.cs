using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class DealTypeDTO
    {
        public int DealTypeId { get; set; }

        public string DealTypeName { get; set; }

        public string DealTypeAlias { get; set; }

        public bool? DealTypeActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

    }

    public class DealTypeDomainItem
    {
        public int DealTypeId { get; set; }

        public string DealTypeName { get; set; }
    }


}
