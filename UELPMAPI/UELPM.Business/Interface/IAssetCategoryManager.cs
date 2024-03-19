using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public  interface IAssetCategoryManager
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
