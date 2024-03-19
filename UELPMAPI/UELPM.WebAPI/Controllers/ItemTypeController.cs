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
    public class ItemTypeController : ApiController
    {
        private readonly IItemTypeManager m_itemtypeManager;

        public ItemTypeController() { }

        public ItemTypeController(IItemTypeManager itemtypeManager)
        {
            m_itemtypeManager = itemtypeManager;
        }

        /// <summary>
        /// This method is used for getting all items
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemType")]
        public IHttpActionResult GetItemType([FromUri] ItemTypeDisplayInput itemTypeDisplayInput)
        {
            var result = m_itemtypeManager.GetItemType(itemTypeDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemType/Search")]
        public IHttpActionResult GetAllItemType([FromUri] ItemTypeDisplayInput itemTypeDisplayInput)
        {
            var result = m_itemtypeManager.GetAllItemType(itemTypeDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create item
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateItemType")]
        public IHttpActionResult CreateItemType(ItemType itemtype)
        {
            ResponseStatus statusObj = new ResponseStatus();
            var result = m_itemtypeManager.CreateItemType(itemtype);
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
        [Route("api/UpdateItemType")]
        public IHttpActionResult UpdateItemType(ItemType itemtype)
        {
            ResponseStatus statusObj = new ResponseStatus();
            var result = m_itemtypeManager.UpdateItemType(itemtype);
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
        [Route("api/DeleteItemType/{id}")]
        public IHttpActionResult DeleteItemType(int id)
        {
            int validationStatus = m_itemtypeManager.CheckExistingItemtype(id);
            if (validationStatus == 0)
            {
                var result = m_itemtypeManager.DeleteItemType(id);
            }
            return Ok(validationStatus);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetCategoryList")]
        public IHttpActionResult GetCategoryList()
        {
            var result = m_itemtypeManager.GetCategoryList();
            return Ok(result);
        }

    }
}
