using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class AssetTransferController : ApiController
    {

        private readonly IAssetTransferManager m_assetTransferManager;
        public AssetTransferController(IAssetTransferManager assetTransferManager)
        {
            m_assetTransferManager = assetTransferManager;
        }
        [HttpGet]
        [Route("api/assetTransferReq")]
        public IHttpActionResult GetAssetTransferRequest([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetTransferManager.GetAssetTransferRequest(gridDisplayInput);
            return Ok(result);
        }
        [HttpGet]
        [Route("api/assetTransferReq/approvals")]
        public IHttpActionResult GetAssetTransferForApprovals([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetTransferManager.GetAssetTransferForApprovals(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetTransferReq/search")]
        public IHttpActionResult SearchAssets([FromUri] AssetTransferSearch gridDisplayInput)
        {
            var result = m_assetTransferManager.SearchAssets(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetTransferReq/{assetTransferId}/{loggedInUserId}")]
        public IHttpActionResult GetAssetTransferRequestDetails(int assetTransferId,int loggedInUserId)
        {
            var result = m_assetTransferManager.GetAssetTransferRequestDetails(assetTransferId, loggedInUserId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/assetTransferReq")]
        public IHttpActionResult CreateAssetTransferRequest([FromBody] AssetTransfer assetTransfer)
        {
            var result = m_assetTransferManager.CreateAssetTransferRequest(assetTransfer);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/assetTransferReq")]
        public IHttpActionResult UpdateAssetTransferRequest([FromBody] AssetTransfer assetTransfer)
        {
            var result = m_assetTransferManager.UpdateAssetTransferRequest(assetTransfer);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/assetTransferReq/{AssetTransferId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetTransferRequest([FromUri] AssetTransfer assetTransfer)
        {
            var result = m_assetTransferManager.DeleteAssetTransferRequest(assetTransfer);
            return Ok(result);
        }
    }
}
