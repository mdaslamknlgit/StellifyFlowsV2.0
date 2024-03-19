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
    public class AssetsRegisterController : ApiController
    {

        private readonly IAssetRegisterManager m_assetRegisterManager;

        public AssetsRegisterController(IAssetRegisterManager assetRegisterManager)
        {
            m_assetRegisterManager = assetRegisterManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetRegister")]
        public IHttpActionResult GetAllAssetsDetails([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetRegisterManager.GetAllAssetsDetails(gridDisplayInput);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetRegister/search")]
        public IHttpActionResult SearchAssets([FromUri] AssetDetailsSearch gridDisplayInput)
        {
            var result = m_assetRegisterManager.SearchAssets(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/assetRegister/print")]
        public HttpResponseMessage GetAssetRegisterPDFTemplate([FromUri] AssetDetailsSearch gridDisplayInput)
        {
            var pdfContent = m_assetRegisterManager.GetAssetRegisterPDFTemplate(gridDisplayInput);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assetRegister/postedAssetDetails/{assetDetailId}")]
        public IHttpActionResult PostedAssetDetails(int assetDetailId)
        {
            var result = m_assetRegisterManager.PostedAssetDetails(assetDetailId);
            return Ok(result);
        }
    }
}
