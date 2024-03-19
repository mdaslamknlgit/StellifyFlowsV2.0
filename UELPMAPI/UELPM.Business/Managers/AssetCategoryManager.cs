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
    public class AssetCategoryManager : ManagerBase, IAssetCategoryManager
    {

        private IAssetCategoryRepository m_assetCategoryRepository;

        public AssetCategoryManager(IAssetCategoryRepository assetCategoryRepository)
        {
            this.m_assetCategoryRepository = assetCategoryRepository;
        }

        public int CreateAssetCategory(AssetCategories assetCategories)
        {
            return m_assetCategoryRepository.CreateAssetCategory(assetCategories);
        }

        public int DeleteAssetCategory(AssetCategories assetCategories)
        {
            return m_assetCategoryRepository.DeleteAssetCategory(assetCategories);
        }

        public AssetCategoryDisplayResult GetAssetCategories(GridDisplayInput gridDisplayInput)
        {
            return m_assetCategoryRepository.GetAssetCategories(gridDisplayInput);
        }

        public AssetCategories GetAssetCategoryDetails(int assetCategoryId)
        {
            return m_assetCategoryRepository.GetAssetCategoryDetails(assetCategoryId);
        }

        public AssetCategoryDisplayResult SearchAssetCategories(AssetCategorySearch gridDisplayInput)
        {
            return m_assetCategoryRepository.SearchAssetCategories(gridDisplayInput);
        }

        public int UpdateAssetCategory(AssetCategories assetCategories)
        {
            return m_assetCategoryRepository.UpdateAssetCategory(assetCategories);
        }

        public int ValidateAssetCategoryName(AssetCategories assetCategories)
        {
            return m_assetCategoryRepository.ValidateAssetCategoryName(assetCategories);
        }
    }
}
