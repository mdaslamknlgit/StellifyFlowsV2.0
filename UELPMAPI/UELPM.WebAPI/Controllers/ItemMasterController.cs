using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
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
    public class ItemMasterController : ApiController
    {
        private readonly IItemMasterManager m_itemmasterManager;

        public ItemMasterController(IItemMasterManager itemmasterManager)
        {
            m_itemmasterManager = itemmasterManager;
        }

        /// <summary>
        /// This method is used for getting all items
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemMaster")]
        public IHttpActionResult GetItemMaster([FromUri] ItemMasterDisplayInput itemMasterDisplayInput)
        {
            var result = m_itemmasterManager.GetItemMaster(itemMasterDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting item masters based on search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemMaster/search")]
        public IHttpActionResult GetAllSearchItemMasters([FromUri]ItemMasterDisplayInput itemMasterDisplayInput)
        {
            var result = m_itemmasterManager.GetAllSearchItemMasters(itemMasterDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemMasterById/{ItemMasterId}/{CompanyId}")]
        public IHttpActionResult GetItemMasterById(int ItemMasterId,int CompanyId)
        {
            var result = m_itemmasterManager.GetItemMasterById(ItemMasterId,CompanyId);
            return Ok(result);
        }


        /// <summary>
        /// This method is used to create item
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateItemMaster")]
        public IHttpActionResult CreateItemMaster(ItemMaster itemmaster)
        {
            ResponseStatus statusObj = new ResponseStatus();
            var result = m_itemmasterManager.CreateItemMaster(itemmaster);
            if (result == "Duplicate")
            {
                statusObj.Status = result;
            }
            else
            {
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }

        /// <summary>
        /// This method is used to udpate item
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPost]
        [Route("api/UpdateItemMaster")]
        public IHttpActionResult UpdateItemMaster(ItemMaster itemmaster)
        {
            ResponseStatus statusObj = new ResponseStatus();
            var result = m_itemmasterManager.UpdateItemMaster(itemmaster);
            if (result == "Duplicate")
            {
                statusObj.Status = result;
            }
            else
            {
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }

        /// <summary>
        /// This method is used to delete item
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/DeleteItemMaster/{id}")]
        public IHttpActionResult DeleteItemMaster(int id)
        {
            var result = m_itemmasterManager.DeleteItemMaster(id);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetLocationList/{companyId}")]
        public IHttpActionResult GetLocationList(int companyId)
        {
            var result = m_itemmasterManager.GetLocationList(companyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemTypeList")]
        public IHttpActionResult GetItemTypeList()
        {
            var result = m_itemmasterManager.GetItemTypeList();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemcategorylist/{itemTypeId}")]
        public IHttpActionResult GetItemcategorylist(int itemTypeId)
        {
            var result = m_itemmasterManager.GetItemcategorylist(itemTypeId);
            return Ok(result);
        }
        // upload AssetSubcategoryDetails
        [HttpPost, Route("api/ItemMaster/UploadItems")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UploadAssetDetails()
        {
            int userId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["userId"]);
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;
            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadedItems"), postedFile.FileName);

                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadedItems"));
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

            var result = m_itemmasterManager.UploadItems(filePath, userId);
            return Ok(result);
        }

    }
}
