using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class SupplierCategoryController : ApiController
    {
        private readonly ISupplierCategoryManager m_supplierCategoryManager;

        public SupplierCategoryController(ISupplierCategoryManager supplierCategoryManager)
        {
            m_supplierCategoryManager = supplierCategoryManager;
        }
        /// <summary>
        /// This method is used for getting all supplier categories...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierCategories")]
        public IHttpActionResult GetSupplierCategories([FromUri] GridDisplayInput measurementUnitDisplayInput)
        {
            var result = m_supplierCategoryManager.GetSupplierCategories(measurementUnitDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierCategories/Search")]
        public IHttpActionResult GetAllSupplierCategories([FromUri] GridDisplayInput measurementUnitDisplayInput)
        {
            var result = m_supplierCategoryManager.GetAllSupplierCategories(measurementUnitDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all supplier categories...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierCategories/{supplierCategoryId}")]
        public IHttpActionResult GetSupplierCategoryDetails(int supplierCategoryId)
        {
            var result = m_supplierCategoryManager.GetSupplierCategoryDetails(supplierCategoryId);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to create new supplier category..
        /// </summary>
        /// <param name="paymentTerm">paymentTerm</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/supplierCategories")]
        public HttpResponseMessage CreateSupplierCategory(SupplierCategory supplierCategory)
        {
            if (m_supplierCategoryManager.ValidateSupplierCategory(supplierCategory)> 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_supplierCategoryManager.CreateSupplierCategory(supplierCategory);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }


        /// <summary>
        /// This method is used to update supplier category
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/supplierCategories")]
        public HttpResponseMessage UpdateSupplierCategory(SupplierCategory supplierCategory)
        {
            if(m_supplierCategoryManager.ValidateSupplierCategory(supplierCategory) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_supplierCategoryManager.UpdateSupplierCategory(supplierCategory);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }


        /// <summary>
        /// This method is used to delete supplier categories
        /// </summary>
        /// <param name="supplierCategoryId">supplierCategoryId</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/supplierCategories/{supplierCategoryId}/{userId}")]
        public IHttpActionResult DeleteSupplierCategory(int supplierCategoryId,int userId)
        {
            var result = m_supplierCategoryManager.DeleteSupplierCategory(new SupplierCategory
            {
                SupplierCategoryID = supplierCategoryId,
                CreatedBy = userId
            });
            return Ok(result);
        }
    }
}
