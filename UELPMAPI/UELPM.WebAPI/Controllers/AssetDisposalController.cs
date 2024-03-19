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
    public class AssetDisposalController : ApiController
    {
        private readonly IAssetDisposalManager m_assetDisposalManager;
        public AssetDisposalController(IAssetDisposalManager assetTransferManager)
        {
            m_assetDisposalManager = assetTransferManager;
        }
        [HttpGet]
        [Route("api/assetDisposalReq")]
        public IHttpActionResult GetAssetDisposalRequest([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetDisposalManager.GetAssetDisposalRequest(gridDisplayInput);
            return Ok(result);
        }
        [HttpGet]
        [Route("api/assetDisposalReq/approvals")]
        public IHttpActionResult GetAssetDisposalForApprovals([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetDisposalManager.GetAssetDisposalForApprovals(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetDisposalReq/search")]
        public IHttpActionResult SearchAssets([FromUri] AssetDisposalSearch assetDisposalSearch)
        {
            var result = m_assetDisposalManager.SearchAssets(assetDisposalSearch);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetDisposalReq/{assetDisposalId}/{loggedInUserId}")]
        public IHttpActionResult GetAssetDisposalRequestDetails(int assetDisposalId, int loggedInUserId)
        {
            var result = m_assetDisposalManager.GetAssetDisposalRequestDetails(assetDisposalId, loggedInUserId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/assetDisposalReq")]
        public IHttpActionResult CreateAssetDisposalRequest([FromBody]AssetDisposal assetDisposal)
        {
            var result = m_assetDisposalManager.CreateAssetDisposalRequest(assetDisposal);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/assetDisposalReq")]
        public IHttpActionResult UpdateAssetDisposalRequest([FromBody] AssetDisposal assetDisposal)
        {
            var result = m_assetDisposalManager.UpdateAssetDisposalRequest(assetDisposal);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/assetDisposalReq/{AssetDisposalId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetDisposalRequest([FromUri] AssetDisposal assetDisposal)
        {
            var result = m_assetDisposalManager.DeleteAssetDisposalRequest(assetDisposal);
            return Ok(result);
        }
    }
}
