using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class CustomerPaymentController : ApiController
    {
        private readonly ICustomerPaymentManager m_customerPaymentManager;

        public CustomerPaymentController() { }

        public CustomerPaymentController(ICustomerPaymentManager customerPaymentManager)
        {
            m_customerPaymentManager = customerPaymentManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/customerPayment")]
        public IHttpActionResult GetCustomerPayments([FromUri]GridDisplayInput customerPaymentInput)
        {
            var result = m_customerPaymentManager.GetCustomerPayments(customerPaymentInput);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/customerPayment/{customerPaymentId}/{customerId}")]
        public IHttpActionResult GetCustomerPaymentDeatilsForEdit(int customerPaymentId, int customerId)
        {
            var result = m_customerPaymentManager.GetCustomerPaymentDeatilsForEdit(customerPaymentId, customerId);
            return Ok(result);
        }
     
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/customerPayment/{customerPaymentId}")]
        public IHttpActionResult GetCustomerPaymentDetails(int customerPaymentId)
        {
            var result = m_customerPaymentManager.GetCustomerPaymentDetails(customerPaymentId);
            return Ok(result);
        }
    
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/customerPayment/searchAll")]
        public IHttpActionResult GetAllSearchCustomerPayments([FromUri] CustomerPaymentSearch customerPaymentSearch)
        {
            var result = m_customerPaymentManager.GetAllSearchCustomerPayments(customerPaymentSearch);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/customerPayment/invoices/{customerId}")]
        public IHttpActionResult GetInvoiceDetailsByCustomer(int customerId)
        {
            var result = m_customerPaymentManager.GetInvoiceDetailsByCustomer(customerId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/customerPayment")]
        public IHttpActionResult CreateCustomerPayment(CustomerPayment customerPayment)
        {          
            var result = m_customerPaymentManager.CreateCustomerPayment(customerPayment);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/customerPayment")]
        public IHttpActionResult UpdateCustomerPayment(CustomerPayment customerPayment)
        {
            var result = m_customerPaymentManager.UpdateCustomerPayment(customerPayment);
            return Ok(result);
        }


        [HttpDelete]
        [Route("api/customerPayment/{customerPaymentId}")]
        public IHttpActionResult DeleteCustomerPayment(int customerPaymentId)
        {
            ClaimsIdentity claimsIdentity = User.Identity as ClaimsIdentity;
            int userid = Convert.ToInt32(claimsIdentity.Claims.FirstOrDefault(x => x.Type == "userId").Value);

            var result = m_customerPaymentManager.DeleteCustomerPayment(new CustomerPaymentDelete
            {
                CustomerPaymentId = customerPaymentId,
                ModifiedBy = userid
            });

            return Ok(result);
        }       
    
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/customerPayment/paymentVoucherPrint/{customerPaymentId}/{companyId}")]
        public HttpResponseMessage PaymentVoucherPrint(int customerPaymentId, int companyId)
        {
            var pdfContent = m_customerPaymentManager.PaymentVoucherPrint(customerPaymentId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }
    }
}
