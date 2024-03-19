using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class TaxGroupController : ApiController
    {
        private readonly ITaxGroupManager m_taxGroupManager;
        public TaxGroupController(ITaxGroupManager taxGroupManager)
        {
            m_taxGroupManager = taxGroupManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/taxgroup")]
        public IHttpActionResult GetTaxGroup([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_taxGroupManager .GetTaxGroup(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/taxgroup/{taxgroupId}")]
        public IHttpActionResult GetTaxGroupDetails(int taxgroupId)
        {
            try
            {
                var result = m_taxGroupManager.GetTaxGroupDetails(taxgroupId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/taxgroup")]
        public IHttpActionResult CreateTaxGroup([FromBody]TaxGroupManagement m_taxGroupManagement)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_taxGroupManager.ValidateTaxGroup(new TaxGroupManagement
            {
                TaxGroupName = m_taxGroupManagement.TaxGroupName,
                TaxGroupId = m_taxGroupManagement.TaxGroupId
            });
            if (validationStatus == "Duplicate TaxGroup Name")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_taxGroupManager.CreateTaxGroup(m_taxGroupManagement);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }


        [HttpPut]
        [Route("api/taxgroup")]
        public IHttpActionResult UpdateTaxGroup([FromBody]TaxGroupManagement m_taxGroupManagement)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_taxGroupManager.ValidateTaxGroup(new TaxGroupManagement
            {
                TaxGroupName = m_taxGroupManagement.TaxGroupName,
                TaxGroupId = m_taxGroupManagement.TaxGroupId
            });
            if (validationStatus == "Duplicate TaxGroup Name")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_taxGroupManager.UpdateTaxGroup(m_taxGroupManagement);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);

        }

        [HttpDelete]
        [Route("api/taxgroup/{taxgroupId}/{userId}")]
        public IHttpActionResult DeleteTaxGroup(int taxgroupId,int userId)
        {
            var result = m_taxGroupManager.DeleteTaxGroup(taxgroupId, userId);
            return Ok(result);
        }




    }
}
