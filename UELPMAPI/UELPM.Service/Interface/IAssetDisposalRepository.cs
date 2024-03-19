using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{

    public interface IAssetDisposalRepository
    {
        int CreateAssetDisposalRequest(AssetDisposal assetDisposal);

        int DeleteAssetDisposalRequest(AssetDisposal assetDisposal);

        AssetDisposalReqDisplayResult GetAssetDisposalRequest(GridDisplayInput gridDisplayInput);

        AssetDisposalReqDisplayResult GetAssetDisposalForApprovals(GridDisplayInput gridDisplayInput);

        AssetDisposal GetAssetDisposalRequestDetails(int assetDisposalReqId, int loggedInUserId);

        AssetDisposalReqDisplayResult SearchAssets(AssetDisposalSearch assetDisposalSearch);

        int UpdateAssetDisposalRequest(AssetDisposal assets);
    }
}
