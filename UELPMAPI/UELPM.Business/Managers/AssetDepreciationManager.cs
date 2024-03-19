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
    public class AssetDepreciationManager : ManagerBase, IAssetDepreciationManager
    {

        private IAssetDepreciationRepository m_assetDepreciationRepository;

        public AssetDepreciationManager(IAssetDepreciationRepository assetDepreciationRepository)
        {
            this.m_assetDepreciationRepository = assetDepreciationRepository;
        }

        public int CreateAssetDepreciationRequest(AssetDepreciation assetDepreciation)
        {
            return m_assetDepreciationRepository.CreateAssetDepreciationRequest(assetDepreciation);
        }

        public int DeleteAssetDepreciationRequest(AssetDepreciation assetDepreciation)
        {
            return m_assetDepreciationRepository.DeleteAssetDepreciationRequest(assetDepreciation);
        }

        public AssetDeprectionReqDisplayResult GetAssetDepreciationRequest(GridDisplayInput gridDisplayInput)
        {
            return m_assetDepreciationRepository.GetAssetDepreciationRequest(gridDisplayInput);
        }

        public AssetDepreciation GetAssetDepreciationRequestDetails(int assetDepreciationReqId, int loggedInUserId = 0)
        {
            return m_assetDepreciationRepository.GetAssetDepreciationRequestDetails(assetDepreciationReqId,loggedInUserId);
        }

        public AssetDeprectionReqDisplayResult SearchAssets(AssetDepreciationSearch assetDepSearch)
        {
            return m_assetDepreciationRepository.SearchAssets(assetDepSearch);
        }
  
        public int UpdateAssetDepreciationRequest(AssetDepreciation assets)
        {
            return m_assetDepreciationRepository.UpdateAssetDepreciationRequest(assets);
        }

        public AssetDeprectionReqDisplayResult GetAssetDepReqForApprovals(GridDisplayInput gridDisplayInput)
        {
            return m_assetDepreciationRepository.GetAssetDepReqForApprovals(gridDisplayInput);
        }
    }
}
