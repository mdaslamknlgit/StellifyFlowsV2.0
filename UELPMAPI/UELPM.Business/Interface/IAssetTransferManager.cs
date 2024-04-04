using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IAssetTransferManager
    {
        int CreateAssetTransferRequest(AssetTransfer assets);

        int DeleteAssetTransferRequest(AssetTransfer assets);

        AssetTransferReqDisplayResult GetAssetTransferRequest(GridDisplayInput gridDisplayInput);

        AssetTransferReqDisplayResult GetAssetTransferForApprovals(GridDisplayInput gridDisplayInput);

        AssetTransfer GetAssetTransferRequestDetails(int assetTransferReqId, int loggedInUserId);

        AssetTransferReqDisplayResult SearchAssets(AssetTransferSearch assetTransferSearch);

        int UpdateAssetTransferRequest(AssetTransfer assets);
    }
}
