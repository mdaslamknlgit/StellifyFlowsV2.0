using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAssetDepreciationRepository
    {
        int CreateAssetDepreciationRequest(AssetDepreciation assetDepreciation);

        int DeleteAssetDepreciationRequest(AssetDepreciation assetDepreciation);

        AssetDeprectionReqDisplayResult GetAssetDepreciationRequest(GridDisplayInput gridDisplayInput);

        AssetDepreciation GetAssetDepreciationRequestDetails(int assetDepreciationReqId, int loggedInUserId = 0);

        AssetDeprectionReqDisplayResult SearchAssets(AssetDepreciationSearch assetDepSearch);

        int UpdateAssetDepreciationRequest(AssetDepreciation assetDepreciation);

        AssetDeprectionReqDisplayResult GetAssetDepReqForApprovals(GridDisplayInput gridDisplayInput);
    }
}
