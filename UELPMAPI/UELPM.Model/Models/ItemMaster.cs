using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ItemMaster
    {
        public int ItemMasterID { get; set; }
        public string ItemMasterCode { get; set; }
        public int ItemTypeID { get; set; }
        public int MeasurementUnitID { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }

        public decimal PurchasePrice { get; set; }

        public decimal SalesPrice { get; set; }
        public decimal AverageCost { get; set; }
        public bool Status { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Manufacturer { get; set; }
        public string Brand { get; set; }
        public decimal OpeningStockValue { get; set; }
        public string Description { get; set; }
        public int ReOrderLevel { get; set; }
        public int LowAlertQuantity { get; set; }
        public int GST { get; set; }
        public bool IsDeleted { get; set; }

        public bool TrackInventory { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int LocationId { get; set; }
        public string ItemCategoryName { get; set; }
        public string ItemTypeName { get; set; }
        public string LocationName { get; set; }
        public string UOMName { get; set; }
        public int CompanyId{ get; set; }
        public int StockInhand { get; set; }
        public string GLCode { get; set; }
    }

    public class ItemMasterDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
        public int CompanyId { get; set; }
    }

    public class ItemMasterDisplayResult
    {
        public List<ItemMaster> ItemMaster { get; set; }
        public int TotalRecords { get; set; }
    }


}
