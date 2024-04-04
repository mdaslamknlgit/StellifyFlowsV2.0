using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ItemCategory
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }

        public int ModifiedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ItemCategoryID { get; set; }
    }

    public class ItemCategoryDisplayInput
    {
        public string Search { get; set; }
        public int Skip { get;set; }
        public int Take { get; set; }
    }

    public class ItemCategoryDisplayResult
    {
        public List<ItemCategory> ItemCategories { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ItemCategoryDelete
    {
        public int ItemCategoryID { get; set; }
        public int ModifiedBy { get; set; }
  
    }

    public class ValidateItemCategory
    {
        public string Name { get; set; }
        public int ItemCategoryID { get; set; }
    }
}
