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
    public class FacilityManagementController : ApiController
    {
        private readonly IFacilityManagementManager m_facilityManagementManager;

        public FacilityManagementController() { }

        public FacilityManagementController(IFacilityManagementManager facilityManagementManager)
        {
            m_facilityManagementManager = facilityManagementManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/FacilityManagement")]
        public IHttpActionResult GetFacilityManagement([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_facilityManagementManager.GetFacilityManagement(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/FacilityManagement/{facilityId}")]
        public IHttpActionResult GetFacilityDetails(int facilityId)
        {
            var result = m_facilityManagementManager.GetFacilityDetails(facilityId);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetFacilityManagementById")]
        public IHttpActionResult GetFacilityManagementById([FromUri] GridDisplayInput gridDisplayInput)
        {

            var result = m_facilityManagementManager.GetFacilityManagementById(gridDisplayInput);
            return Ok(result);

        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/FacilityManagements/{customerId}")]
        public IHttpActionResult GetOwnerDetails(int customerId)
        {
            var result = m_facilityManagementManager.GetOwnerDetails(customerId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetOwnerForfacility")]
        public IHttpActionResult GetOwnerForfacility(string searchKey, int CompanyId, int customerCategoryId)
        {
            try
            {
                var result = m_facilityManagementManager.GetOwnerForfacility(searchKey, CompanyId, customerCategoryId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetTenantForfacility")]
        public IHttpActionResult GetTenantForfacility(string searchKey, int CompanyId, int customerCategoryId)
        {
            try
            {
                var result = m_facilityManagementManager.GetTenantForfacility(searchKey, CompanyId, customerCategoryId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/FacilityManagement")]
        public IHttpActionResult CreateFacilityManagement([FromBody]FacilityManagement m_facilityManagement)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_facilityManagementManager.ValidateFacilityManagement(new ValidateFacilityManagement
            {
                FacilityId = m_facilityManagement.FacilityId,
                UnitNumber = m_facilityManagement.UnitNumber,
                OwnerName = m_facilityManagement.OwnerName
            });
            if (validationStatus == "Duplicate UnitNumber")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_facilityManagementManager.CreateFacilityManagement(m_facilityManagement);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
      
        }

        [HttpPut]
        [Route("api/FacilityManagement")]
        public IHttpActionResult UpdateFacilityManagement(FacilityManagement m_facilityManagement)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_facilityManagementManager.ValidateFacilityManagement(new ValidateFacilityManagement
            {
                FacilityId = m_facilityManagement.FacilityId,
                UnitNumber = m_facilityManagement.UnitNumber,
                OwnerName = m_facilityManagement.OwnerName
            });
            if (validationStatus == "Duplicate UnitNumber")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_facilityManagementManager.UpdateFacilityManagement(m_facilityManagement);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);

        }

        [HttpDelete]
        [Route("api/FacilityManagement/{facilityid}")]
        public IHttpActionResult DeleteFacilityManagement(int facilityid)
        {
            var result = m_facilityManagementManager.DeleteFacilityManagement(facilityid);
            return Ok(result);
        }
    }
}
