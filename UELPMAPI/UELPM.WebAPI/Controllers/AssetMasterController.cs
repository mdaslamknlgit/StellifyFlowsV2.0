using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.CustomActionResults;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class AssetMasterController : ApiController
    {
        private readonly IAssetMasterManager m_assetMasterManager;
        public AssetMasterController(IAssetMasterManager assetMasterManager)
        {
            m_assetMasterManager = assetMasterManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetMaster")]
        public IHttpActionResult GetAssetCategories([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetMasterManager.GetAssets(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetMaster/search")]
        public IHttpActionResult SearchAssets([FromUri] AssetMasterSearch assetMasterSearch)
        {       
            var result = m_assetMasterManager.SearchAssets(assetMasterSearch);
            if (assetMasterSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.Assets);
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetMaster/{assetId}")]
        public IHttpActionResult GetAssetDetails(int assetId)
        {
            var result = m_assetMasterManager.GetAssetDetails(assetId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/assetMaster")]
        public IHttpActionResult CreateAssetCategory([FromBody]AssetMaster assetMaster)
        {
            var count = m_assetMasterManager.ValidateAssetName(assetMaster);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_assetMasterManager.CreateAssetMaster(assetMaster);
                return Ok(result);
            }
        }

        [HttpPut]
        [Route("api/assetMaster")]
        public IHttpActionResult UpdateAssetCategory([FromBody] AssetMaster assetMaster)
        {
            var count = m_assetMasterManager.ValidateAssetName(assetMaster);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_assetMasterManager.UpdateAssetMaster(assetMaster);
                return Ok(result);

            }
        }

        [HttpDelete]
        [Route("api/assetMaster/{AssetId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetMaster([FromUri]AssetMaster assetMaster)
        {
            var result = m_assetMasterManager.DeleteAssetMaster(assetMaster);
            return Ok(result);
        }
    }
}
