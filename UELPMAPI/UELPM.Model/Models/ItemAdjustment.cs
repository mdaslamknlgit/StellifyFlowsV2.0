using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ItemAdjustment
    {
        public int ItemAdjustmentId { get; set; }
        public int ItemMasterId { get; set; }
        public string ItemMasterCode { get; set; }
        public string ItemName { get; set; }
        public decimal ExistingQty { get; set; }
        public decimal AdjustedQty { get; set; }
        public string ReasonForAdjustment { get; set; }
        public string WorkFlowStatus { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public bool IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }

    public class ItemAdjustmentDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
    }

    public class ItemAdjustmentDisplayResult
    {
        public List<ItemAdjustment> ItemAdjustment { get; set; }
        public int TotalRecords { get; set; }
    }

}
