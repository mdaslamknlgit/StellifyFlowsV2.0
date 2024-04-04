using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAssetDetailsRepository
    {
        int CreateAssetDetails(AssetDetails assets);

        int DeleteAssetDetails(AssetDetails assets);

        AssetDetailsDisplayResult GetAssets(GridDisplayInput gridDisplayInput);

        AssetDetails GetAssetDetails(int assetDetailId);

        //AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch);

        int UpdateAssetMaster(AssetDetails assets);
         UploadResult UploadAssetDetails(string filePath, int userId);
        IEnumerable<AssetSubCategory> GetImportAssetDetails(int CompanyId);
    }
}
