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
    public class AssetTypeManager : ManagerBase, IAssetTypeManager
    {

        private IAssetTypeRepository m_assetTypeRepository;

        public AssetTypeManager(IAssetTypeRepository assetTypeRepository)
        {
            this.m_assetTypeRepository = assetTypeRepository;
        }

        public int CreateAssetType(AssetTypes assetTypes)
        {
            return m_assetTypeRepository.CreateAssetType(assetTypes);
        }

        public int DeleteAssetType(AssetTypes assetTypes)
        {
            return m_assetTypeRepository.DeleteAssetType(assetTypes);
        }

        public AssetTypes GetAssetTypeDetails(int assetTypeId)
        {
            return m_assetTypeRepository.GetAssetTypeDetails(assetTypeId);
        }

        public AssetTypeDisplayResult GetAssetTypes(GridDisplayInput gridDisplayInput)
        {
            return m_assetTypeRepository.GetAssetTypes(gridDisplayInput);
        }

        public AssetTypeDisplayResult SearchAssetTypes(GridDisplayInput gridDisplayInput)
        {
            return m_assetTypeRepository.SearchAssetTypes(gridDisplayInput);
        }

        public int UpdateAssetType(AssetTypes assetTypes)
        {
            return m_assetTypeRepository.UpdateAssetType(assetTypes);
        }

        public int ValidateAssetType(AssetTypes assetTypes)
        {
            return m_assetTypeRepository.ValidateAssetType(assetTypes);
        }
    }
}
