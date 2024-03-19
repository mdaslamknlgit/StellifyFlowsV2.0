using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetMaster
    {
       public int AssetId { get; set; }
	   public string AssetName { get; set; }
	   public string AssetCode { get; set; }
	   public string Warranty { get; set; }
	   public int AssetCategoryId { get; set; }
	   public string AssetCategory { get; set; }
	   public string BarCode { get; set; }
       public int CreatedBy { get; set; }
       public string AssetType { get; set; }
       public List<PreferredSupplier> PreferredSuppliers { get; set; }
    }
    public class AssetMasterDisplayResult
    {
        public List<AssetMaster> Assets { get; set; }
        public int TotalRecords { get; set; }
    }

    public class AssetMasterSearch : GridDisplayInput
    {
        public string AssetName { get; set; }
        public int AssetCategoryId { get; set; }
    }
    public class PreferredSupplier
    {
       public int AssetPreferredSupplierId { get; set; }
	   public int AssetId { get; set; }
       public Supplier Supplier { get; set; }
       public bool IsDeleted { get; set; }
    }

    public class AssetDetailsSearch : GridDisplayInput
    {
        public string AssetName { get; set; }
        public string SerialNumber { get; set; }
        public string BarCode { get; set; }
        public DateTime? PurchasedDate { get; set; }
        public bool IsRegister { get; set; } 
    }
}
