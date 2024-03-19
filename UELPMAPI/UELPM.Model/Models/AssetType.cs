using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetTypes
    {
        public int AssetTypeId { get; set; }
        public string AssetType { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class AssetTypeDisplayResult
    {
        public List<AssetTypes> AssetTypes { get; set; }
        public int TotalRecords { get; set; }
    }
}
