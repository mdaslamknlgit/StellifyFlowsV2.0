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
    public class AssetDetailsController : ApiController
    {
        private readonly IAssetDetailsManager m_assetDetailManager;

        public AssetDetailsController(IAssetDetailsManager assetDetailsManager)
        {
            m_assetDetailManager = assetDetailsManager;
        }

        [HttpGet]
        [Route("api/assets")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetAssets([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_assetDetailManager.GetAssets(gridDisplayInput);
            return Ok(result);
        }

        //[HttpGet]
        //[Route("api/assets/search")]
        //public IHttpActionResult SearchAssets([FromUri] AssetDetailsSearch assetDetailsSearch)
        //{
        //    var result = m_assetDetailManager.SearchAssets(assetDetailsSearch);
        //    return Ok(result);
        //}

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assets/{assetDetailId}")]
        public IHttpActionResult GetAssetDetails(int assetDetailId)
        {
            var result = m_assetDetailManager.GetAssetDetails(assetDetailId);
            return Ok(result);
        }



        [HttpPost]
        [Route("api/assets")]
        public IHttpActionResult CreateAssetDetails([FromBody]AssetDetails assetDetails)
        {
            var result = m_assetDetailManager.CreateAssetDetails(assetDetails);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/assets")]
        public IHttpActionResult UpdateAssetMaster([FromBody] AssetDetails assetDetails)
        {
            var result = m_assetDetailManager.UpdateAssetMaster(assetDetails);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/assets/{AssetDetailsId}/{CreatedBy}")]
        public IHttpActionResult DeleteAssetDetails([FromUri] AssetDetails assetDetails)
        {
            var result = m_assetDetailManager.DeleteAssetDetails(assetDetails);
            return Ok(result);
        }
        // upload AssetSubcategoryDetails
        [HttpPost, Route("api/assets/UploadAssetDetails")]
        public IHttpActionResult UploadAssetDetails()
        {
            int userId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["userId"]);
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;
           if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadedAssetDetails"), postedFile.FileName);

                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadedAssetDetails"));
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

            var result = m_assetDetailManager.UploadAssetDetails(filePath, userId);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/assets/getImportAssetsDetails/{CompanyId}")]
        public IHttpActionResult GetImportAssetDetails(int CompanyId)
        {
            var result = m_assetDetailManager.GetImportAssetDetails(CompanyId);
            return Ok(result);
        }
    }
}
