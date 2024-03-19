using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    [RoutePrefix("api/SalesInvoice")]
    public class SalesInvoiceController : ApiController
    {
        private readonly ISalesInvoiceManager m_salesInvoiceManager;
        public SalesInvoiceController(ISalesInvoiceManager salesInvoiceManager)
        {
            m_salesInvoiceManager = salesInvoiceManager;
        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetSalesInvoices")]
        public IHttpActionResult GetSalesInvoices(SalesInvoiceSearch search)
        {
            var result = m_salesInvoiceManager.GetSalesInvoices(search);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetOpenSalesInvoices")]
        public IHttpActionResult GetOpenSalesInvoices(SalesInvoiceSearch search)
        {
            var result = m_salesInvoiceManager.GetOpenSalesInvoices(search);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("GetSalesInvoice/{id}")]
        public IHttpActionResult GetSalesInvoice(int id)
        {
            Thread.Sleep(1000);
            var result = m_salesInvoiceManager.GetSalesInvoice(id);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetInvoicesSearch")]
        public IHttpActionResult GetInvoicesSearch(SalesInvoiceSearch search)
        {
            var result = m_salesInvoiceManager.GetInvoicesSearch(search);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("PostSalesInvoice")]
        public IHttpActionResult PostSalesInvoice()
        {
            var httpRequest = HttpContext.Current.Request;
            SalesInvoice salesInvoice = JsonConvert.DeserializeObject<SalesInvoice>(httpRequest.Form["SalesInvoice"]);
            salesInvoice.files = httpRequest.Files;
            var result = m_salesInvoiceManager.PostSalesInvoice(salesInvoice);
            return Ok(result);
        }

        [HttpGet, Route("ExportSIDocument/{DocumentId}/{userId}")]
        public IHttpActionResult ExportSIDocument(string DocumentId,int userId)
        {
            var result = m_salesInvoiceManager.ExportSIDocument(DocumentId,userId);
            return Ok(result);
        }
    }
}
