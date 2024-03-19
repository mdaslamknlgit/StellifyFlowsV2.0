using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetDetails
    {
      public int AssetDetailsId { get; set; }
      public AssetMaster Asset { get; set; }
      public string AccountCode { get; set; }
      public string SerialNumber { get; set; }
      public string BarCode { get; set; }
      public decimal PurchasedValue { get; set; }
      public DateTime PurchasedDate { get; set; }
      public int DepreciationId { get; set; }
      public string DepreciationMethod { get; set; }
      public decimal SalvageValue { get; set; }
      public Locations Location { get; set; }
      public decimal CurrentValue { get; set; }
      public UserProfile UsedBy { get; set; }
      public int CreatedBy { get; set; }
      public DateTime CreatedDate { get; set; }
      public List<PreferredSupplier> PreferredSuppliers { get; set; }
      public int GoodsReceivedNoteId { get; set; }
      public string ManufacturedBy { get; set; }
      public DateTime? ManufacturedDate { get; set; }
      public string Warranty { get; set; }
      public int Skip { get; set; }
      public int Take { get; set; }
      public int CompanyId { get; set; }
      public Supplier Supplier { get; set; }
      public Invoices Invoice { get; set; }
      public DateTime? ExpiryDate { get; set; }
      public int? DepreciationYears { get; set; }
      public string PurchasedDateString { get; set; }
      public string ManufacturedDateString { get; set; }
      public string CurrencySymbol { get; set; }
      public decimal DepreciationAmount { get; set; }
      public decimal AccDepreciationAmount { get; set; }
      public decimal EndingValue { get; set; }
      public decimal BeginningValue { get; set; }
      public DateTime? DateOfPosting { get; set; }
      public bool IsPosted { get; set; }
      public string GLCode { get; set; }
    }

    public class AssetDetailsDisplayResult
    {
        public List<AssetDetails> Assets { get; set; }
        public int TotalRecords { get; set; }
    }
    public class AssetSubCategory
    {
        public int AssetSubcategoryId { get; set; }
        public string CompanyName { get; set; }
        public string AssetSubcategory { get; set; }
        public string AccountCode { get; set; }
        public string Description { get; set; }
        public int CompanyId { get; set; }
        public string Type { get; set; }
    }

}
