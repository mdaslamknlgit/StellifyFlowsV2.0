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
    public class InventoryCycleCountController : ApiController
    {
        private readonly IInventoryCycleCountManager m_inventoryCycleCountManager;

        public InventoryCycleCountController(IInventoryCycleCountManager inventoryCycleCountManager)
        {
            m_inventoryCycleCountManager = inventoryCycleCountManager;
        }


        /// <summary>
        /// This method is used for getting all inventory disposal requests...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/GetInventoryCycleCount")]
        public IHttpActionResult GetInventoryCycleCount([FromUri] GridDisplayInput inventoryCycleCount)
        {
            try
            {
                var result = m_inventoryCycleCountManager.GetInventoryCycleCount(inventoryCycleCount);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to create inventory disposal request
        /// </summary>
        /// <param name="CreateInventoryDisposalRequest">CreateInventoryDisposalRequest</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateInventoryCycleCountRequest")]
        public IHttpActionResult CreateInventoryCycleCountRequest(InventoryCycleCount inventoryCycleCount)
        {
            ResponseStatus statusObj = new ResponseStatus();
            try
            {
                var result = m_inventoryCycleCountManager.CreateInventoryCycleCountRequest(inventoryCycleCount);
                statusObj.Status = "success";
                statusObj.Value = result;
                return Ok(statusObj);
            }
            catch (Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();
                return Ok(statusObj);
            }
        }

        [HttpGet]
        [Route("api/GetExistingInventoryCycleCount")]
        public IHttpActionResult GetExistingInventoryCycleCount([FromUri] Shared shared)
        {
            var result = m_inventoryCycleCountManager.GetExistingInventoryCycleCount(shared);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/GetItemsbasedLocationID")]
        public IHttpActionResult GetItemsbasedLocationID(int? LocationID, string searchKey)
        {
            try
            {
                var result = m_inventoryCycleCountManager.GetItemsbasedLocationID(LocationID, searchKey);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}
