using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IAssetDetailsManager
    {
        int CreateAssetDetails(AssetDetails assets);

        int DeleteAssetDetails(AssetDetails assets);

        AssetDetailsDisplayResult GetAssets(GridDisplayInput gridDisplayInput);

        AssetDetails GetAssetDetails(int assetId);

       // AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch);

        int UpdateAssetMaster(AssetDetails assets);
         UploadResult UploadAssetDetails(string filePath, int userid);
        IEnumerable<AssetSubCategory> GetImportAssetDetails(int CompanyId);
    }
}
