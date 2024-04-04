using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class InventoryCycleCount
    {
        public int InventoryCycleCountId { get; set; }
        public int ItemMasterId { get; set; }
        public string ItemMasterName { get; set; }
        public int SystemQty { get; set; }
        public int LocationItemId { get; set; }
        public int PhysicalQty { get; set; }
        public int LostQty { get; set; }
        public int DamagedQty { get; set; }
        public int ExpiredQty { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public string Reasons { get; set; }
        public List<InventoryCycleCount> InventoryCycleCountToAdd { get; set; }
        public List<int> InventoryCycleCountToDelete { get; set; }
        public List<InventoryCycleCount> InventoryCycleCountToUpdate { get; set; }
    }
    

    public class InventoryCycleCountDisplayResult
    {
        public List<InventoryCycleCount> InventoryCycleCount { get; set; }
        public int TotalRecords { get; set; }
    }


}
