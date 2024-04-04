using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class LeadRating
    {
        public int LeadRatingId { get; set; }

        public string LeadRatingName { get; set; }

        public string LeadRatingAlias { get; set; }

        public bool? LeadRatingIsActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

    }


    public class LeadRatingDomainItem
    {
        public int LeadRatingId { get; set; }

        public string LeadRatingName { get; set; }
    }
}
