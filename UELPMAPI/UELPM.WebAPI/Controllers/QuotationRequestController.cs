using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;
namespace UELPM.WebAPI.Controllers
{
    public class QuotationRequestController : ApiController
    {
        private readonly IQuotationRequestManager m_quotationRequestManager;

        public QuotationRequestController(IQuotationRequestManager quotationRequestManager)
        {
            m_quotationRequestManager = quotationRequestManager;
        }

        [HttpGet]
        [Route("api/QuotationsRequest")]
        public IHttpActionResult GetQuotationsRequest([FromUri] GridDisplayInput quotationRequestInput)
        {
            var result = m_quotationRequestManager.GetQuotationsRequest(quotationRequestInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/QuotationsRequest/Filter")]
        public IHttpActionResult GetFilterQuotationRequest([FromUri] QuotationFilterDisplayInput quotationFilterDisplayInput)
        {
            try
            {
                var result = m_quotationRequestManager.GetFilterQuotationRequest(quotationFilterDisplayInput);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/QuotationsRequest/search")]
        public IHttpActionResult GetAllSearchQuotationRequest([FromUri]GridDisplayInput quotationRequestInput)
        {
            var result = m_quotationRequestManager.GetAllSearchQuotationRequest(quotationRequestInput);
            return Ok(result);
        }



        [HttpGet]
        [Route("api/QuotationsRequest/{quotationRequestId}")]
        public IHttpActionResult GetQuotationRequestDetails(int quotationRequestId)
        {

            var result = m_quotationRequestManager.GetQuotationRequestDetails(quotationRequestId);
            return Ok(result);
        }

        //[HttpGet]
        //[Route("api/QuotationsRequests/{purchaseOrderRequestId}")]
        //public IHttpActionResult GetPurchaseQuotationRequestDetails(int purchaseOrderRequestId)
        //{
        //    var result = m_quotationRequestManager.GetPurchaseQuotationRequestDetails(purchaseOrderRequestId);
        //    return Ok(result);
        //}

        [HttpGet]
        [Route("api/quotationRequestPrint/{quotationRequestId}/{companyId}")]
        public HttpResponseMessage QuotationRequestPrint(int quotationRequestId, int companyId)
        {
            var pdfContent = m_quotationRequestManager.QuotationRequestPrint(quotationRequestId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpDelete]
        [Route("api/QuotationsRequest/{quotationRequestId}/{userId}")]
        public IHttpActionResult DeleteQuotationRequest(int quotationRequestId,int userId)
        {
            var result = m_quotationRequestManager.DeleteQuotationRequest(new QuotationRequestDelete
            {
                QuotationRequestId = quotationRequestId,
                ModifiedBy = userId//static value need to change
            });
            //MyAuditLog.Info(enumModuleCodes.QuotationRequest.ToString(), enumAuditType.Delete.ToString(), userId.ToString(), quotationRequestId.ToString(), "DeleteQuotationRequest","Deleted Quotation request "+ quotationRequestId.ToString());
            return Ok(result);  
        }

        [HttpPost]
        [Route("api/QuotationsRequest")]
        public IHttpActionResult CreateQuotationRequest()
        {
            QuotationRequest quotationRequest = JsonConvert.DeserializeObject<QuotationRequest>(HttpContext.Current.Request.Form["quotationRequests"]);
            quotationRequest.files = HttpContext.Current.Request.Files;
            var result = m_quotationRequestManager.CreateQuotationRequest(quotationRequest);
            //MyAuditLog.Info(enumModuleCodes.QuotationRequest.ToString(), enumAuditType.Create.ToString(), quotationRequest.CreatedBy.ToString(), quotationRequest.QuotationRequestId.ToString(), "CreateQuotationRequest","Created Quotation "+ quotationRequest.QuotationRequestId.ToString() + "request");
            return Ok(result);
        }


        [HttpPut]
        [Route("api/QuotationsRequest")]
        public IHttpActionResult UpdateQuotationRequest()
        {
            QuotationRequest quotationRequest = JsonConvert.DeserializeObject<QuotationRequest>(HttpContext.Current.Request.Form["quotationRequests"]);
            quotationRequest.files = HttpContext.Current.Request.Files;
            var result = m_quotationRequestManager.UpdateQuotationRequest(quotationRequest);
            //MyAuditLog.Info(enumModuleCodes.QuotationRequest.ToString(), enumAuditType.Update.ToString(), quotationRequest.CreatedBy.ToString(), quotationRequest.QuotationRequestId.ToString(), "UpdateQuotationRequest","Updated Quotation Request "+ quotationRequest.QuotationRequestId.ToString());
            return Ok(result);
        }

        [HttpGet]
        [Route("api/sendQuotationRequestMailtoSuppliers/{quotationRequestId}/{companyId}")]
        public IHttpActionResult SendQuotationRequestMailtoSuppliers(int quotationRequestId, int companyId)
        {
            var result = m_quotationRequestManager.SendQuotationRequestMailtoSupplier(quotationRequestId, companyId);
            //MyAuditLog.Info(enumModuleCodes.QuotationRequest.ToString(), enumAuditType.SentEmail.ToString(), null, quotationRequestId.ToString(), "SendQuotationRequestMailtoSuppliers","sent Quotation request "+ quotationRequestId.ToString() + " mail to supplier");
            return Ok(result);
        }
        [HttpGet]
        [Route("api/SelectQuotation/{quotationRequestId}/{QuotationId}")]
        public IHttpActionResult SelectQuotation(int QuotationRequestId,int QuotationId)
        {
            var result = m_quotationRequestManager.SelectQuotation(QuotationRequestId, QuotationId);
            return Ok(result);
        }
    }
}
