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
    public class SupplierServiceController : ApiController
    {
        private readonly ISupplierServicesManager m_supplierServicesManager;

        public SupplierServiceController(ISupplierServicesManager supplierServicesManager)
        {
            m_supplierServicesManager = supplierServicesManager;
        }
        /// <summary>
        /// This method is used for getting all supplier services ...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierService")]
        public IHttpActionResult GetSupplierServices([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_supplierServicesManager.GetSupplierServices(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierService/Search")]
        public IHttpActionResult GetAllSupplierServices([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_supplierServicesManager.GetAllSupplierServices(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierService/{supplierServiceId}")]
        public IHttpActionResult GetSupplierServiceDetails(int supplierServiceId)
        {
            var result = m_supplierServicesManager.GetSupplierServiceDetails(supplierServiceId);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to create new supplier service..
        /// </summary>
        /// <param name="supplierService">supplierService</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/supplierService")]
        public HttpResponseMessage CreateSupplierService(SupplierService supplierService)
        {
            if (m_supplierServicesManager.ValidateServiceName(supplierService) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_supplierServicesManager.CreateSupplierService(supplierService);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        /// <summary>
        /// This method is used to update supplier service
        /// </summary>
        /// <param name="supplierService">supplierService</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/supplierService")]
        public HttpResponseMessage UpdateSupplierService(SupplierService supplierService)
        {
            if (m_supplierServicesManager.ValidateServiceName(supplierService) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_supplierServicesManager.UpdateSupplierService(supplierService);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        /// <summary>
        /// This method is used to delete supplier service
        /// </summary>
        /// <param name="supplierServiceId">supplierServiceId</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/supplierService/{supplierServiceId}/{userId}")]
        public IHttpActionResult DeleteSupplierService(int supplierServiceId,int userId)
        {
            var result = m_supplierServicesManager.DeleteSupplierService(new SupplierService
            {
                SupplierServiceID = supplierServiceId,
                CreatedBy = userId
            });
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierService/serviceCategoriesList")]
        public IHttpActionResult GetServiceCategories()
        {
            var result = m_supplierServicesManager.GetServiceCategories();
            return Ok(result);
        }

    }
}
