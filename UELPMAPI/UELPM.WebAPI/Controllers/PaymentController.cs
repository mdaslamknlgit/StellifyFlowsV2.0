using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class PaymentController : ApiController
    {
        private readonly IPaymentManager m_paymentManager;

        public PaymentController(IPaymentManager paymentManager)
        {
            m_paymentManager = paymentManager;
        }

        [HttpPost, Route("api/UploadPayments")]
        public IHttpActionResult UploadPayments()
        {
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;
            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadedPayments"), postedFile.FileName);
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadedPayments"));
                }
                if (File.Exists(filePath))
                {
                    System.GC.Collect();
                    System.GC.WaitForPendingFinalizers();
                    File.Delete(filePath);
                }
                postedFile.SaveAs(filePath);
                postedFile = null;
            }
            var result = m_paymentManager.UploadPayments(filePath);
            return Ok(result);
        }

        [HttpPost, Route("api/SavePayments/{userId}")]
        public IHttpActionResult SavePayments(int userId, List<Payment> payments)
        {
            var result = m_paymentManager.SavePayments(userId, payments);
            return Ok(result);
        
        }

        [HttpGet, Route("api/GetPaymentDetails/{InvoiceId}/{companyId}/{ProcessId}")]
        public IHttpActionResult GetPaymentDetails(int InvoiceId, int companyId,int ProcessId)
        {
            var result = m_paymentManager.GetPaymentDetails(InvoiceId, companyId, ProcessId);
            return Ok(result);
        }
    }
}
