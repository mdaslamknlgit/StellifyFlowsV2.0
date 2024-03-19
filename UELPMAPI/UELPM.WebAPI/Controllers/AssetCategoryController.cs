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
    public class AssetCategoryController : ApiController
    {

        private readonly IAssetCategoryManager m_assetCategoryManager;
        public AssetCategoryController(IAssetCategoryManager costCentreManager)
        {
            m_assetCategoryManager = costCentreManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetCategories")]
        public IHttpActionResult GetAssetCategories([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetCategoryManager.GetAssetCategories(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetCategories/search")]
        public IHttpActionResult SearchAssetCategories([FromUri] AssetCategorySearch gridDisplayInput)
        {
            var result = m_assetCategoryManager.SearchAssetCategories(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetCategories/{assetCategoryId}")]
        public IHttpActionResult GetAssetCategoryDetails(int assetCategoryId)
        {
            var result = m_assetCategoryManager.GetAssetCategoryDetails(assetCategoryId);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/assetCategories")]
        public IHttpActionResult CreateAssetCategory([FromBody]AssetCategories assetCategories)
        {
            var count = m_assetCategoryManager.ValidateAssetCategoryName(assetCategories);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_assetCategoryManager.CreateAssetCategory(assetCategories);
                return Ok(result);
            }
        }
        [HttpPut]
        [Route("api/assetCategories")]
        public IHttpActionResult UpdateAssetCategory([FromBody] AssetCategories costCentre)
        {
            var count = m_assetCategoryManager.ValidateAssetCategoryName(costCentre);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_assetCategoryManager.UpdateAssetCategory(costCentre);
                return Ok(result);

            }
        }
        [HttpDelete]
        [Route("api/assetCategories/{AssetCategoryId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetCategory([FromUri]AssetCategories costCentre)
        {
            var result = m_assetCategoryManager.DeleteAssetCategory(costCentre);
            return Ok(result);
        }
    }
}
