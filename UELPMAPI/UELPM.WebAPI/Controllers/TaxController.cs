using Newtonsoft.Json;
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
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class TaxController : ApiController
    {
        private readonly ITaxManager m_itaxManager;

        public TaxController(ITaxManager  taxManager)
        {
            m_itaxManager = taxManager;
        }
       
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetTaxes")]
        public IHttpActionResult GetTaxes([FromUri] TaxisplayInput  taxisplayInput)
        {
            var result = m_itaxManager.GetTaxes(taxisplayInput);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetTaxByTaxId/{TaxId}")]
        public IHttpActionResult GetTaxByTaxId(int TaxId)
        {
            var result = m_itaxManager.GetTaxByTaxId(TaxId);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/TaxesByTaxGroup/{taxGroupId}")]
        public IHttpActionResult GetFilterTaxes(int taxGroupId )
        {
            var result = m_itaxManager.GetTaxesByTaxGroup(taxGroupId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetFilterTaxes")]
        public IHttpActionResult GetFilterTaxes([FromUri] TaxFilterDisplayInput taxFilterDisplayInput)
        {
            var result = m_itaxManager.GetFilterTaxes(taxFilterDisplayInput);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/CreateTax")]
        public HttpResponseMessage CreateTax(Tax  tax)
        {
            if (m_itaxManager.ValidateTaxName(tax) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }

            var result = m_itaxManager.CreateTax(tax);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpPost]
        [Route("api/UpdateTax")]
        public HttpResponseMessage UpdateTax(Tax tax)
        {
            if (m_itaxManager.ValidateTaxName(tax) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            var result = m_itaxManager.UpdateTax(tax);
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpDelete]
        [Route("api/DeleteTax/{taxid}/{userId}")]
        public IHttpActionResult DeleteTax(int taxId,int userId)
        {
            var result = m_itaxManager.DeleteTax(new TaxDelete
            {
                TaxId = taxId,
                ModifiedBy = userId
            });
            return Ok(result);
        }

        [HttpPost, Route("api/uploadTaxes")]
        public IHttpActionResult UploadSuppliers()
        {
            
            int userId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["userId"]);
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;

            //ClaimsIdentity claimsIdentity = User.Identity as ClaimsIdentity;
            //int userid = Convert.ToInt32(claimsIdentity.Claims.FirstOrDefault(x => x.Type == "userId").Value);

            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadedTaxes"), postedFile.FileName);

                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadedTaxes"));
                }

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                postedFile.SaveAs(filePath);
                postedFile = null;
            }

            var result = m_itaxManager.UploadTaxes(filePath, userId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Taxes/{taxGroupId}/{taxClass}")]
        public IHttpActionResult GetTaxClassCount(int taxGroupId, int taxClass)
        {
            var result = m_itaxManager.GetTaxClassCount(taxGroupId, taxClass);
            return Ok(result);
        }


    }
}
