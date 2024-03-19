using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class AssetDisposalManager : ManagerBase, IAssetDisposalManager
    {
        private IAssetDisposalRepository m_assetDisposalRepository;

        public AssetDisposalManager(IAssetDisposalRepository assetDisposalRepository)
        {
            this.m_assetDisposalRepository = assetDisposalRepository;
        }

        public int CreateAssetDisposalRequest(AssetDisposal assetDisposal)
        {
            return m_assetDisposalRepository.CreateAssetDisposalRequest(assetDisposal);
        }

        public  int DeleteAssetDisposalRequest(AssetDisposal assetDisposal)
        {
            return m_assetDisposalRepository.DeleteAssetDisposalRequest(assetDisposal);
        }

        public AssetDisposalReqDisplayResult GetAssetDisposalForApprovals(GridDisplayInput gridDisplayInput)
        {
            return m_assetDisposalRepository.GetAssetDisposalForApprovals(gridDisplayInput);
        }

        public AssetDisposalReqDisplayResult GetAssetDisposalRequest(GridDisplayInput gridDisplayInput)
        {
            return m_assetDisposalRepository.GetAssetDisposalRequest(gridDisplayInput);
        }

        public AssetDisposal GetAssetDisposalRequestDetails(int assetDisposalReqId, int loggedInUserId)
        {
            return m_assetDisposalRepository.GetAssetDisposalRequestDetails(assetDisposalReqId,loggedInUserId);
        }

        public AssetDisposalReqDisplayResult SearchAssets(AssetDisposalSearch assetDisposalSearch)
        {
            return m_assetDisposalRepository.SearchAssets(assetDisposalSearch);
        }

        public int UpdateAssetDisposalRequest(AssetDisposal assets)
        {
            return m_assetDisposalRepository.UpdateAssetDisposalRequest(assets);
        }
    }
}
