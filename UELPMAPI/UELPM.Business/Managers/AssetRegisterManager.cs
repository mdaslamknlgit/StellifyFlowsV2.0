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
    public class AssetRegisterManager : ManagerBase, IAssetRegisterManager
    {
        private IAssetRegisterRepository m_assetRegisterRepository;

        public AssetRegisterManager(IAssetRegisterRepository assetRegisterRepository)
        {
            this.m_assetRegisterRepository = assetRegisterRepository;
        }

        public AssetDetailsDisplayResult GetAllAssetsDetails(GridDisplayInput gridDisplayInput)
        {
            return m_assetRegisterRepository.GetAllAssetsDetails(gridDisplayInput);
        }

        public AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch)
        {
            return m_assetRegisterRepository.SearchAssets(assetMasterSearch);
        }

        public byte[] GetAssetRegisterPDFTemplate(AssetDetailsSearch displayInput)
        {
            return m_assetRegisterRepository.GetAssetRegisterPDFTemplate(displayInput);
        }

        public List<AssetDetails> PostedAssetDetails(int assetDetailId) {

            return m_assetRegisterRepository.PostedAssetDetails(assetDetailId);
        }
    }
}
