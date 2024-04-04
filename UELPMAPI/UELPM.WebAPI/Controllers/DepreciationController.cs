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
    public class DepreciationController : ApiController
    {
        private readonly IDepreciationManager m_depreciationManager;

        public DepreciationController(IDepreciationManager depreciationManager)
        {
            m_depreciationManager = depreciationManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/depreciationTypes")]
        public IHttpActionResult GetDepreciations([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_depreciationManager.GetDepreciations(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/depreciationTypes/search")]
        public IHttpActionResult SearchDepreciations([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_depreciationManager.SearchDepreciations(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/depreciationTypes/{depreciationId}")]
        public IHttpActionResult GetDepreciationDetails(int depreciationId)
        {
            var result = m_depreciationManager.GetDepreciationDetails(depreciationId);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/depreciationTypes")]
        public IHttpActionResult CreateDepreciation([FromBody]Depreciation depreciationTypes)
        {
            var count = m_depreciationManager.ValidateDepreciationName(depreciationTypes);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_depreciationManager.CreateDepreciation(depreciationTypes);
                return Ok(result);
            }
        }
        [HttpPut]
        [Route("api/depreciationTypes")]
        public IHttpActionResult UpdateAssetType([FromBody] Depreciation depreciationTypes)
        {
            var count = m_depreciationManager.ValidateDepreciationName(depreciationTypes);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_depreciationManager.UpdateDepreciation(depreciationTypes);
                return Ok(result);
            }
        }
        [HttpDelete]
        [Route("api/depreciationTypes/{DepreciationId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetType([FromUri]Depreciation depreciationTypes)
        {
            var result = m_depreciationManager.DeleteDepreciation(depreciationTypes);
            return Ok(result);
        }
    }
}
