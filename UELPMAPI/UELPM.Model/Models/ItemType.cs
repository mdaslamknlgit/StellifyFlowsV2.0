using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ItemType
    {
        public int ItemTypeID { get; set; }
        public int ItemCategoryID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string ItemCategoryName { get; set; }
    }

    public class ItemTypeDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
    }

    public class ItemTypeDisplayResult
    {
        public List<ItemType> ItemType { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ItemTypeCategorylist
    {
        public int ItemCategoryID { get; set; }
        public string Name { get; set; }
    }
}
