using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using log4net;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class PaymentTermsController : ApiController
    {
        //private static readonly ILog Logger = LogManager.GetLogger(System.Environment.MachineName);
        private static readonly ILog Logger;
        private readonly IPaymentTermsManager  m_paymentTermsManager;

        public PaymentTermsController(IPaymentTermsManager paymentTermsManager)
        {
            m_paymentTermsManager = paymentTermsManager;
        }
        /// <summary>
        /// This method is used for getting all payment terms
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/paymentTerms")]
        public IHttpActionResult GetPaymentTerms([FromUri] GridDisplayInput displayInput)
        {
            //Logger.Info("Entered");
            var result = m_paymentTermsManager.GetPaymentTerm(displayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/paymentTerms/Search")]
        public IHttpActionResult GetAllPaymentTerms([FromUri] GridDisplayInput displayInput)
        {
            var result = m_paymentTermsManager.GetAllPaymentTerm(displayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/paymentTerms/{paymentTermId}")]
        public IHttpActionResult GetPaymentTermDetails(int paymentTermId)
        {
            var result = m_paymentTermsManager.GetPaymentTermDetails(paymentTermId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create a new payment terms
        /// </summary>
        /// <param name="paymentTerm">paymentTerm</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/paymentTerms")]
        public HttpResponseMessage CreatePaymentTerm(PaymentTerm paymentTerm)
        {
            if (m_paymentTermsManager.ValidatePaymentTerm(paymentTerm) >0)
            {
                //MyAuditLog.ErrorLog((int)enumModuleCodes.Payment, enumAuditType.Create.ToString(), paymentTerm.CreatedBy.ToString(), ErrorMessages.Duplicate, paymentTerm?.PaymentTermsId.ToString());
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_paymentTermsManager.CreatePaymentTerm(paymentTerm);
            //MyAuditLog.Info(enumModuleCodes.Payment.ToString(), enumAuditType.Create.ToString(), paymentTerm.CreatedBy.ToString(), paymentTerm.PaymentTermsId.ToString(), "CreatePaymentTerm","Created Payment term "+ paymentTerm.PaymentTermsId.ToString()+ " successfully.");
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }
        /// <summary>
        /// This method is used to update payment term
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/paymentTerms")]
        public HttpResponseMessage UpdatePaymentTerm(PaymentTerm paymentTerm)
        {
            if (m_paymentTermsManager.ValidatePaymentTerm(paymentTerm) > 0)
            {
                //MyAuditLog.ErrorLog(enumModuleCodes.Payment.ToString(), enumAuditType.Update.ToString(), paymentTerm.CreatedBy.ToString(), ErrorMessages.Duplicate, paymentTerm.PaymentTermsId.ToString(), "UpdatePaymentTerm","Failed to update Payment term "+ paymentTerm.PaymentTermsId.ToString());
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_paymentTermsManager.UpdatePaymentTerm(paymentTerm);
            //MyAuditLog.Info(enumModuleCodes.Payment.ToString(), enumAuditType.Update.ToString(), paymentTerm.CreatedBy.ToString(), paymentTerm.PaymentTermsId.ToString(), "UpdatePaymentTerm","Updated Payment term "+ paymentTerm.PaymentTermsId.ToString()+" successfully.");
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }
        /// <summary>
        /// This method is used to delete payment terms
        /// </summary>
        /// <param name="paymentTermId">paymentTermId</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/paymentTerms/{paymentTermId}")]
        public IHttpActionResult DeletePaymentTerms(int paymentTermId)
        {
            var result = m_paymentTermsManager.DeletePaymentTerms(new PaymentTerm
            {
                PaymentTermsId = paymentTermId,
                CreatedBy = 0
            });
            //MyAuditLog.Info(enumModuleCodes.Payment.ToString(), enumAuditType.Delete.ToString(), "0", paymentTermId.ToString(), "DeletePaymentTerms","Deleted Payment term "+ paymentTermId.ToString() + " successfully.");
            return Ok(result);
        }

        [HttpGet]
        [Route("api/paymentTermsPdf")]
        public IHttpActionResult ConvertToPdf()
        {
            var result = m_paymentTermsManager.ConvertToPdf();
            return Ok(result);
        }
    }
}
