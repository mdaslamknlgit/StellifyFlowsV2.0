using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
     public interface IAssetCategoryRepository
    {
        AssetCategoryDisplayResult GetAssetCategories(GridDisplayInput gridDisplayInput);
        AssetCategoryDisplayResult SearchAssetCategories(AssetCategorySearch gridDisplayInput);
        AssetCategories GetAssetCategoryDetails(int assetCategoryId);
        int CreateAssetCategory(AssetCategories assetCategories);
        int UpdateAssetCategory(AssetCategories assetCategories);
        int DeleteAssetCategory(AssetCategories assetCategories);
        int ValidateAssetCategoryName(AssetCategories assetCategories);
    }
}
