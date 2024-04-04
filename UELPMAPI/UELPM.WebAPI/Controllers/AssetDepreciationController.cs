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
    public class AssetDepreciationController : ApiController
    {
        private readonly IAssetDepreciationManager m_assetDepreciationManager;

        public AssetDepreciationController(IAssetDepreciationManager assetDepreciationManager)
        {
            m_assetDepreciationManager = assetDepreciationManager;
        }

        [HttpGet]
        [Route("api/assetDepReq")]
        public IHttpActionResult GetAssetDepreciationRequest([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetDepreciationManager.GetAssetDepreciationRequest(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetDepReq/search")]
        public IHttpActionResult SearchAssets([FromUri] AssetDepreciationSearch assetDepreciationSearch)
        {
            var result = m_assetDepreciationManager.SearchAssets(assetDepreciationSearch);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetDepReq/{assetDepreciationId}")]
        public IHttpActionResult GetAssetDepreciationRequestDetails(int assetDepreciationId)
        {
            var result = m_assetDepreciationManager.GetAssetDepreciationRequestDetails(assetDepreciationId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/assetDepReq")]
        public IHttpActionResult CreateAssetDepreciationRequest([FromBody] AssetDepreciation assetDepreciation)
        {
            var result = m_assetDepreciationManager.CreateAssetDepreciationRequest(assetDepreciation);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/assetDepReq")]
        public IHttpActionResult UpdateAssetDepreciationRequest([FromBody] AssetDepreciation assetDepreciation)
        {
            var result = m_assetDepreciationManager.UpdateAssetDepreciationRequest(assetDepreciation);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/assetDepReq/{AssetDepreciationId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetDepreciationRequest([FromUri] AssetDepreciation assetDepreciation)
        {
            var result = m_assetDepreciationManager.DeleteAssetDepreciationRequest(assetDepreciation);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetDepReq/approvals")]
        public IHttpActionResult GetAssetDepReqForApprovals([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetDepreciationManager.GetAssetDepReqForApprovals(gridDisplayInput);
            return Ok(result);
        }
    }
}
