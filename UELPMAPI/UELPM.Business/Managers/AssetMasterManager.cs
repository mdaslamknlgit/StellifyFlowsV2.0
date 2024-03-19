using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class AssetMasterManager : ManagerBase, IAssetMasterManager
    {

        private IAssetMasterRepository m_assetMasterRepository;

        public AssetMasterManager(IAssetMasterRepository assetMasterRepository)
        {
            this.m_assetMasterRepository = assetMasterRepository;
        }

        public int CreateAssetMaster(AssetMaster assets)
        {
            return m_assetMasterRepository.CreateAssetMaster(assets);
        }

        public int DeleteAssetMaster(AssetMaster assets)
        {
            return m_assetMasterRepository.DeleteAssetMaster(assets);
        }

        public AssetMaster GetAssetDetails(int assetId)
        {
            return m_assetMasterRepository.GetAssetDetails(assetId);
        }

        public AssetMasterDisplayResult GetAssets(GridDisplayInput gridDisplayInput)
        {
            return m_assetMasterRepository.GetAssets(gridDisplayInput);
        }

        public AssetMasterDisplayResult SearchAssets(AssetMasterSearch assetMasterSearch)
        {
            return m_assetMasterRepository.SearchAssets(assetMasterSearch);
        }

        public int UpdateAssetMaster(AssetMaster assets)
        {
            return m_assetMasterRepository.UpdateAssetMaster(assets);
        }

        public int ValidateAssetName(AssetMaster assets)
        {
            return m_assetMasterRepository.ValidateAssetName(assets);
        }
    }
}
