using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business
{
    public interface IAssetMasterManager
    {
        int CreateAssetMaster(AssetMaster assets);

        int DeleteAssetMaster(AssetMaster assets);

        AssetMasterDisplayResult GetAssets(GridDisplayInput gridDisplayInput);

        AssetMaster GetAssetDetails(int assetId);

        AssetMasterDisplayResult SearchAssets(AssetMasterSearch gridDisplayInput);

        int UpdateAssetMaster(AssetMaster assets);

        int ValidateAssetName(AssetMaster assets);
    }
}
