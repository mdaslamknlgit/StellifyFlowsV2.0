using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Repositories;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class DeliveryTermsController : ApiController
    {

        private readonly IDeliveryTermsManager m_deliveryTermsManager;
        private int userid = 0;
        public DeliveryTermsController(IDeliveryTermsManager paymentTermsManager)
        {
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            UserProfile userProfile = userProfileRepository.GetRolebyUser(HttpContext.Current.Request.LogonUserIdentity.Claims.FirstOrDefault().Value.Split('\\')[1]);
            if (userProfile != null)
            {
                userid = userProfile.UserID;
            }
            m_deliveryTermsManager = paymentTermsManager;
        }
        /// <summary>
        /// This method is used for getting all  delivery terms
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/deliveryTerms")]
        public IHttpActionResult GetDeliveryTerms([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_deliveryTermsManager.GetDeliveryTerms(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/deliveryTerms/Search")]
        public IHttpActionResult GetAllDeliveryTerms([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_deliveryTermsManager.GetAllDeliveryTerms(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/deliveryTerms/{deliveryTermId}")]
        public IHttpActionResult GetPaymentTermDetails(int deliveryTermId)
        {
            var result = m_deliveryTermsManager.GetDeliveryTermsDetails(deliveryTermId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create a new delivery terms
        /// </summary>
        /// <param name="paymentTerm">paymentTerm</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/deliveryTerms")]
        public HttpResponseMessage CreateDeliveryTerm(DeliveryTerms deliveryTerms)
        {
            if (m_deliveryTermsManager.ValidateDeliveryTerms(deliveryTerms) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError,ErrorMessages.Duplicate);
            }     
            var result = m_deliveryTermsManager.CreateDeliveryTerm(deliveryTerms);
            return Request.CreateResponse(HttpStatusCode.OK,result);
        }
        /// <summary>
        /// This method is used to update delivery term
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/deliveryTerms")]
        public HttpResponseMessage UpdateDeliveryTerm(DeliveryTerms deliveryTerms)
        {
            if (m_deliveryTermsManager.ValidateDeliveryTerms(deliveryTerms) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_deliveryTermsManager.UpdateDeliveryTerm(deliveryTerms);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }
        /// <summary>
        /// This method is used to delete delivery terms
        /// </summary>
        /// <param name="deliveryTermId">deliveryTermId</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/deliveryTerms/{deliveryTermId}/{userId}")]
        public IHttpActionResult DeleteDeliveryTerms(int deliveryTermId,int userId)
        {
            var result = m_deliveryTermsManager.DeleteDeliveryTerms(new DeliveryTerms
            {
                DeliveryTermsId = deliveryTermId,
                CreatedBy = userId
            });
            return Ok(result);
        }
    }
}
