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
    public class DepartmentController : ApiController
    {
        private readonly IDepartmentManager m_departmentManager;
        public DepartmentController(IDepartmentManager departmentManager)
        {
            m_departmentManager = departmentManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/department")]
        public IHttpActionResult GetDepartment([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_departmentManager.GetDepartment(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/department/{locationId}")]
        public IHttpActionResult GetDepartmentDetails(int locationId)
        {
            try
            {
                var result = m_departmentManager.GetDepartmentDetails(locationId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/department")]
        public IHttpActionResult CreateDepartment([FromBody]DepartmentManagement m_department)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_departmentManager.ValidateDepartment(new DepartmentManagement
            {
                Name = m_department.Name,
                CompanyId=m_department.CompanyId,
                LocationId = m_department.LocationId
            });
            if (validationStatus == "Duplicate Department Name")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_departmentManager.CreateDepartment(m_department);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }


        [HttpPut]
        [Route("api/department")]
        public IHttpActionResult UpdateDepartment([FromBody]DepartmentManagement m_department)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_departmentManager.ValidateDepartment(new DepartmentManagement
            {
                Name = m_department.Name,
                CompanyId = m_department.CompanyId,
                LocationId = m_department.LocationId
            });
            if (validationStatus == "Duplicate Department Name")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_departmentManager.UpdateDepartment(m_department);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);

        }

        [HttpDelete]
        [Route("api/department/{locationId}/{userId}")]
        public IHttpActionResult DeleteDepartment(int locationId,int userId)
        {
            var result = m_departmentManager.DeleteDepartment(locationId, userId);
            return Ok(result);
        }





    }
}
