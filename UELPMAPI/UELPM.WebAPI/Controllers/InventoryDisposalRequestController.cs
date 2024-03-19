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
    public class InventoryDisposalRequestController : ApiController
    {
        private readonly IInventoryDisposalRequestManager m_inventoryDisposalRequestManager;

        public InventoryDisposalRequestController(IInventoryDisposalRequestManager inventoryDisposalRequestManager)
        {
            m_inventoryDisposalRequestManager = inventoryDisposalRequestManager;
        }

        /// <summary>
        /// This method is used for getting all inventory disposal requests...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/InventoryDisposalRequest")]
        public IHttpActionResult GetInventoryDisposalRequest([FromUri] InventoryDisposalRequestInput inventoryDisposal)
        {
            try
            {
                var result = m_inventoryDisposalRequestManager.GetInventoryDisposalRequest(inventoryDisposal);

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
        [Route("api/CreateInventoryDisposalRequest")]
        public IHttpActionResult CreateInventoryDisposalRequest(InventoryDisposalRequest inventoryDisposalRequest)
        {
            ResponseStatus statusObj = new ResponseStatus();

            try
            {

                var result = m_inventoryDisposalRequestManager.CreateInventoryDisposalRequest(inventoryDisposalRequest);

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
    }
}
