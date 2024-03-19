using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.CustomActionResults;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class AssetTypeController : ApiController
    {
        private readonly IAssetTypeManager m_assetTypeManager;
        public AssetTypeController(IAssetTypeManager costCentreManager)
        {
            m_assetTypeManager = costCentreManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetTypes")]
        public IHttpActionResult GetAssetTypes([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetTypeManager.GetAssetTypes(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetTypes/search")]
        public IHttpActionResult SearchAssetTypes([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetTypeManager.SearchAssetTypes(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetTypes/{assetTypeId}")]
        public IHttpActionResult GetAssetTypeDetails(int assetTypeId)
        {
            var result = m_assetTypeManager.GetAssetTypeDetails(assetTypeId);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/assetTypes")]
        public IHttpActionResult CreateAssetType([FromBody]AssetTypes assetTypes)
        {
            var count = m_assetTypeManager.ValidateAssetType(assetTypes);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_assetTypeManager.CreateAssetType(assetTypes);
                return Ok(result);
            }
        }
        [HttpPut]
        [Route("api/assetTypes")]
        public IHttpActionResult UpdateAssetType([FromBody] AssetTypes assetTypes)
        {
            var count = m_assetTypeManager.ValidateAssetType(assetTypes);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_assetTypeManager.UpdateAssetType(assetTypes);
                return Ok(result);

            }
        }
        [HttpDelete]
        [Route("api/assetTypes/{AssetTypeId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetType([FromUri]AssetTypes assetTypes)
        {
            var result = m_assetTypeManager.DeleteAssetType(assetTypes);
            return Ok(result);
        }
    }
}
