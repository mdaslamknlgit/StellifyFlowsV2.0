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
    public class ServiceCategoryController : ApiController
    {
        private readonly IServiceCategoryManager m_serviceCategoryManager;

        public ServiceCategoryController(IServiceCategoryManager serviceCategoryManager)
        {
            m_serviceCategoryManager = serviceCategoryManager;
        }
        /// <summary>
        /// This method is used for getting all supplier categories...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceCategory")]
        public IHttpActionResult GetServiceCategory([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_serviceCategoryManager.GetServiceCategory(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceCategory/Search")]
        public IHttpActionResult GetAllServiceCategory([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_serviceCategoryManager.GetAllServiceCategory(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all supplier categories...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceCategory/{serviceCategoryid}")]
        public IHttpActionResult GetServiceCategory(int serviceCategoryid)
        {
            var result = m_serviceCategoryManager.GetServiceCategory(serviceCategoryid);
            return Ok(result);
        }
        /// <summary>
       
        [HttpPost]
        [Route("api/serviceCategory")]
        public HttpResponseMessage CreateServiceCategory(ServiceCategory serviceCategory)
        {
            var result = 0;
            if (m_serviceCategoryManager.ValidateServiceName(serviceCategory) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else
            {
                result = m_serviceCategoryManager.CreateServiceCategory(serviceCategory);
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }


        /// <summary>
        /// This method is used to update supplier category
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/serviceCategory")]
        public HttpResponseMessage UpdateSupplierCategory(ServiceCategory serviceCategory)
        {
            var result = 0;
            if (m_serviceCategoryManager.ValidateServiceName(serviceCategory) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else
            {
                result = m_serviceCategoryManager.UpdateServiceCategory(serviceCategory);
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }           
        }


        [HttpDelete]
        [Route("api/serviceCategory/{supplierCategoryId}/{userId}")]
        public IHttpActionResult DeleteSupplierCategory(int supplierCategoryId,int userId)
        {
            var result = m_serviceCategoryManager.DeleteServiceCategory(new ServiceCategory
            {
                ServiceCategoryId = supplierCategoryId,
                CreatedBy = userId
            });
            return Ok(result);
        }
    }
}
