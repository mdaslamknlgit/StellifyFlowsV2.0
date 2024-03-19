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
    public class AssetDetailsManager : ManagerBase,  IAssetDetailsManager
    {
        private IAssetDetailsRepository m_assetDetailsRepository;

        public AssetDetailsManager(IAssetDetailsRepository assetDetailsRepository)
        {
            this.m_assetDetailsRepository = assetDetailsRepository;
        }

        public int CreateAssetDetails(AssetDetails assets)
        {
            return m_assetDetailsRepository.CreateAssetDetails(assets);
        }

        public int DeleteAssetDetails(AssetDetails assets)
        {
            return m_assetDetailsRepository.DeleteAssetDetails(assets);
        }

        public AssetDetailsDisplayResult GetAssets(GridDisplayInput gridDisplayInput)
        {
            return m_assetDetailsRepository.GetAssets(gridDisplayInput);
        }

        public AssetDetails GetAssetDetails(int assetDetailId)
        {
            return m_assetDetailsRepository.GetAssetDetails(assetDetailId);
        }

        //public AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetDetailsSearch)
        //{
        //    return m_assetDetailsRepository.SearchAssets(assetDetailsSearch);
        //}

        public int UpdateAssetMaster(AssetDetails assets)
        {
            return m_assetDetailsRepository.UpdateAssetMaster(assets);
        }

        public UploadResult UploadAssetDetails(string filePath, int userid)
        {
            return m_assetDetailsRepository.UploadAssetDetails(filePath, userid);
        }
        public IEnumerable<AssetSubCategory> GetImportAssetDetails(int CompanyId)
        {
            return m_assetDetailsRepository.GetImportAssetDetails(CompanyId);
        }
    }
}
