using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class DealStagesDTO
    {
        public int DealStageId { get; set; }

        public string DealStageName { get; set; }

        public string DealStageAlias { get; set; }

        public int? DealStageProbability { get; set; }

        public bool? DealStageActive { get; set; }

        public bool IsClose { get; set; }

        public bool IsLost { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

    }

}
