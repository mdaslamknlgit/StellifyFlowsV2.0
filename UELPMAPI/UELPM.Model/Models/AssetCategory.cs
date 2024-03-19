using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetCategories
    {
        public int AssetCategoryId { get; set; }
        public int AssetTypeId { get; set; }
        public string AssetType { get; set; }
        public string AssetCategory { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
    public class AssetCategoryDisplayResult
    {
        public List<AssetCategories> AssetCategories { get; set; }
        public int TotalRecords { get; set; }
    }
    public class AssetCategorySearch : GridDisplayInput
    {
        public int AssetTypeId { get; set; }
        public string AssetCategory { get; set; }
    }
}
