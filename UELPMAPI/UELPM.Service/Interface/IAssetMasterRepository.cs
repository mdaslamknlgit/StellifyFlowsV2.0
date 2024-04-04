using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAssetMasterRepository
    {
        int CreateAssetMaster(AssetMaster assets);

        int DeleteAssetMaster(AssetMaster assets);

        AssetMasterDisplayResult GetAssets(GridDisplayInput gridDisplayInput);

        AssetMaster GetAssetDetails(int assetId);

        AssetMasterDisplayResult SearchAssets(AssetMasterSearch assetMasterSearch);

        int UpdateAssetMaster(AssetMaster assets);

        int ValidateAssetName(AssetMaster assets);
    }
}
