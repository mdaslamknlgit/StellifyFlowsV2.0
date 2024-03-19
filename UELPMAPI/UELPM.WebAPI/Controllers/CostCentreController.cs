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
    public class CostCentreController : ApiController
    {
        private readonly ICostCentreManager m_costCentreManager;
        public CostCentreController(ICostCentreManager costCentreManager)
        {
            m_costCentreManager = costCentreManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/costCentres")]
        public IHttpActionResult GetCostCentres([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_costCentreManager.GetCostCentres(purchaseOrderInput);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/costCentres/GetCostCentresById/{CostCenterId}")]
        public IHttpActionResult GetCostCentresById(int CostCenterId)
        {
            var result = m_costCentreManager.GetCostCentresById(CostCenterId);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/costCentres/search")]
        public IHttpActionResult SearchCostCentres([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_costCentreManager.SearchCostCentres(purchaseOrderInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/costCentres/{costCentreId}")]
        public IHttpActionResult GetCreditNoteDetails(int costCentreId)
        {
            var result = m_costCentreManager.GetCostCentreDetails(costCentreId);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/costCentres")]
        public IHttpActionResult CreateCostCentre([FromBody]CostCentre costCentre)
        {
            var count = m_costCentreManager.ValidateCostCentreName(costCentre);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_costCentreManager.CreateCostCentre(costCentre);
                return Ok(result);
            }
        }
        [HttpPut]
        [Route("api/costCentres")]
        public IHttpActionResult UpdateCostCentre([FromBody] CostCentre costCentre)
        {
            var count = m_costCentreManager.ValidateCostCentreName(costCentre);
            if (count > 0)
            {
                return new DuplicateResult(Request);
            }
            else
            {
                var result = m_costCentreManager.UpdateCostCentre(costCentre);
                return Ok(result);

            }
        }
        [HttpDelete]
        [Route("api/costCentres/{CostCenterId}/{CreatedBy}")]
        public IHttpActionResult DeleteCostCentre([FromUri]CostCentre costCentre)
        {
            var result = m_costCentreManager.DeleteCostCentre(costCentre);
            return Ok(result);
        }
    }
}
