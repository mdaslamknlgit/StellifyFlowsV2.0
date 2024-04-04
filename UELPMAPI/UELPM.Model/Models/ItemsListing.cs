using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class ItemsListing
    {
        public string ItemCategoryName{ get; set; }
        public string ItemTypeName { get; set; }       
        public DateTime ExpiryDate { get; set; }
        public string ItemMasterCode { get; set; }
        public string Name { get; set; }
        public string StatusName { get; set; }
        public string Manufacturer { get; set; }
        public string Brand { get; set; }
        public decimal OpeningStockValue { get; set; }
        public string LocationName { get; set; }
        public string UOMName { get; set; }
        public int ReOrderLevel { get; set; }
        public int LowAlertQuantity { get; set; }
        public int StockInhand { get; set; }
        public int ItemMasterID { get; set; }
    }

    public class ItemsListingDisplayResult
    {
        public List<ItemsListing> ItemsListing { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ItemsListingFilterDisplayInput : GridDisplayInput
    {
        public string ItemNameFilter { get; set; }
        public string ItemCategoryFilter { get; set; }
        public string ItemTypeFilter { get; set; }
        public string DepartmentFilter { get; set; }
    }


}
