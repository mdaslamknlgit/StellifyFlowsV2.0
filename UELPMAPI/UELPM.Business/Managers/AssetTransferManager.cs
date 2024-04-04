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
    public class AssetTransferManager : ManagerBase, IAssetTransferManager
    {
        private IAssetTransferRepository m_assetTransferRepository;

        public AssetTransferManager(IAssetTransferRepository assetTransferRepository)
        {
            this.m_assetTransferRepository = assetTransferRepository;
        }

        public int CreateAssetTransferRequest(AssetTransfer assetTransfer)
        {
            return m_assetTransferRepository.CreateAssetTransferRequest(assetTransfer);
        }

        public int DeleteAssetTransferRequest(AssetTransfer assetTransfer)
        {
            return m_assetTransferRepository.DeleteAssetTransferRequest(assetTransfer);
        }

        public AssetTransferReqDisplayResult GetAssetTransferForApprovals(GridDisplayInput gridDisplayInput)
        {
            return m_assetTransferRepository.GetAssetTransferForApprovals(gridDisplayInput);
        }

        public AssetTransferReqDisplayResult GetAssetTransferRequest(GridDisplayInput gridDisplayInput)
        {
             return m_assetTransferRepository.GetAssetTransferRequest(gridDisplayInput);
        }

        public AssetTransfer GetAssetTransferRequestDetails(int assetTransferReqId, int loggedInUserId)
        {
            return m_assetTransferRepository.GetAssetTransferRequestDetails(assetTransferReqId, loggedInUserId);
        }

        public AssetTransferReqDisplayResult SearchAssets(AssetTransferSearch assetTransferSearch)
        {
            return m_assetTransferRepository.SearchAssets(assetTransferSearch);
        }

        //public void SendForApproval(AssetTransfer assetTransfer)
        //{
        //    m_assetTransferRepository.SendForApproval(assetTransfer);
        //}

        public int UpdateAssetTransferRequest(AssetTransfer assetTransfer)
        {
            return m_assetTransferRepository.UpdateAssetTransferRequest(assetTransfer);
        }
    }
}
