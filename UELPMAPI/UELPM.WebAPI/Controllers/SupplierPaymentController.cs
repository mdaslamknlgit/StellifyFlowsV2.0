using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class SupplierPaymentController : ApiController
    {
        private readonly ISupplierPaymentManager m_supplierPaymentManager;
        public SupplierPaymentController() { }

        public SupplierPaymentController(ISupplierPaymentManager supplierPaymentManager)
        {
            m_supplierPaymentManager = supplierPaymentManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SupplierPayment")]
        public IHttpActionResult GetSupplierPayment([FromUri]GridDisplayInput supplierPaymentInput)
        {
            var result = m_supplierPaymentManager.GetSupplierPayment(supplierPaymentInput);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SupplierPayment/{SupplierPaymentId}/{SupplierId}")]
        public IHttpActionResult GetSupplierPayment(int SupplierPaymentId, int SupplierId)
        {
            var result = m_supplierPaymentManager.GetEditSupplierPaymentDetails(SupplierPaymentId, SupplierId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SupplierPayment/{supplierPaymentId}")]
        public IHttpActionResult GetSupplierPaymentDetails(int supplierPaymentId)
        {
            var result = m_supplierPaymentManager.GetSupplierPaymentDetails(supplierPaymentId);
            return Ok(result);
        }



        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SupplierPayments/{supplierId}")]
        public IHttpActionResult GetInvoicewithSupplierdetails(int supplierId)
        {
            var result = m_supplierPaymentManager.GetInvoicewithSupplierdetails(supplierId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/SupplierPayment")]
        public IHttpActionResult CreateSupplierPayment()
        {
            SupplierPayment supplierPayment = JsonConvert.DeserializeObject<SupplierPayment>(HttpContext.Current.Request.Form["supplierPayment"]); 
            var result = m_supplierPaymentManager.CreateSupplierPayment(supplierPayment);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allsupplierspayment")]
        public IHttpActionResult GetAllSuppliersinSupplierPayment(string searchKey, int supplierTypeId,int companyId)
        {
            try
            {
                var result = m_supplierPaymentManager.GetAllSuppliersinSupplierPayment(searchKey, supplierTypeId, companyId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpPut]
        [Route("api/SupplierPayment")]
        public IHttpActionResult UpdateSupplierPayment()
        {
            SupplierPayment supplierPayment = JsonConvert.DeserializeObject<SupplierPayment>(HttpContext.Current.Request.Form["supplierPayment"]);
            var result = m_supplierPaymentManager.UpdateSupplierPayment(supplierPayment);
            return Ok(result);
        }


        [HttpDelete]
        [Route("api/SupplierPayment/{supplierPaymentId}/{userId}")]
        public IHttpActionResult DeleteSupplierPayment(int supplierPaymentId,int userId)
        {

            var result = m_supplierPaymentManager.DeleteSupplierPayment(new SupplierPaymentDelete
            {
                SupplierPaymentId = supplierPaymentId,
                ModifiedBy = userId//static value need to change
            });
            return Ok(result);
        }
        [HttpPost]
        [Route("api/GetSupplier/{supplierId}")]
        public IHttpActionResult GetSupplier(int supplierId)
        {
            var result = m_supplierPaymentManager.GetSupplier(supplierId);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/paymentVoucherPrint/{supplierPaymentId}/{companyId}")]
        public HttpResponseMessage PaymentVoucherPrint(int supplierPaymentId, int companyId)
        {          
            var pdfContent = m_supplierPaymentManager.PaymentVoucherPrint(supplierPaymentId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }


    }
}
