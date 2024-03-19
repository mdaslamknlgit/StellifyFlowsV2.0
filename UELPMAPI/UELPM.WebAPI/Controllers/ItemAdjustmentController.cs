using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class ItemAdjustmentController : ApiController
    {
        private readonly IItemAdjustmentManager m_itemAdjustmentManager;

        public ItemAdjustmentController(IItemAdjustmentManager itemAdjustmentManager)
        {
            m_itemAdjustmentManager = itemAdjustmentManager;
        }

        /// <summary>
        /// This method is used for getting all items
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/GetItemAdjustment")]
        public IHttpActionResult GetItemAdjustment([FromUri] ItemAdjustmentDisplayInput itemAdjustmentDisplayInput)
        {
            var result = m_itemAdjustmentManager.GetItemAdjustment(itemAdjustmentDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create item
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateItemAdjustment")]
        public IHttpActionResult CreateItemAdjustment(ItemAdjustment itemAdjustment)
        {
            var result = m_itemAdjustmentManager.CreateItemAdjustment(itemAdjustment);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to udpate item
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/UpdateItemAdjustment")]
        public IHttpActionResult UpdateItemAdjustment(ItemAdjustment itemAdjustment)
        {
            var result = m_itemAdjustmentManager.UpdateItemAdjustment(itemAdjustment);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to delete item
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/DeleteItemAdjustment/{id}")]
        public IHttpActionResult DeleteItemAdjustment(int id)
        {
            var result = m_itemAdjustmentManager.DeleteItemAdjustment(id);
            return Ok(result);
        }


    }
}
