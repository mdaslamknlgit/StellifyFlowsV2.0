using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;

namespace UELPM.WebAPI.Controllers
{
    public class InventoryRequestController : ApiController
    {

        private readonly IInventoryRequestManager m_inventoryRequestManager;

        public InventoryRequestController(IInventoryRequestManager inventoryRequestManager)
        {
            m_inventoryRequestManager = inventoryRequestManager;
        }

        /// <summary>
        /// This method is used for getting all inventory requests...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/InventoryRequest")]
        public IHttpActionResult GetInventoryRequest([FromUri] InventoryRequestDisplayInput inventoryRequestDisplay)
        {

            try
            {
                var result = m_inventoryRequestManager.GetInventoryRequest(inventoryRequestDisplay);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used for getting the details of the selected inventory request record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/InventoryRequestDetails")]
        public IHttpActionResult GetInventoryRequestDetails([FromUri] InventoryRequestDetailInput inventoryRequestDetailInput)
        {

            try
            {
                var result = m_inventoryRequestManager.GetInventoryRequestDetails(inventoryRequestDetailInput);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to create inventory request
        /// </summary>
        /// <param name="inventoryRequest">inventoryRequest</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateInventoryRequest")]
        public IHttpActionResult CreateInventoryRequest(InventoryRequest inventoryRequest)
        {
            ResponseStatus statusObj = new ResponseStatus();

            try
            {

                var result = m_inventoryRequestManager.CreateInventoryRequest(inventoryRequest);

                statusObj.Status = "success";
                statusObj.Value = result;

                //MyAuditLog.Info(enumModuleCodes.InventoryRequest.ToString(), enumAuditType.Create.ToString(), inventoryRequest.CreatedBy.ToString(), inventoryRequest.InventoryRequestID.ToString(), "CreateInventoryRequest", "Created Inventory Request " + inventoryRequest.InventoryRequestID.ToString() + " successfully.");
                return Ok(statusObj);

            }
            catch (Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();

                //MyAuditLog.ErrorLog(enumModuleCodes.InventoryRequest.ToString(), enumAuditType.Create.ToString(), inventoryRequest.CreatedBy.ToString(), e.ToString(), inventoryRequest.InventoryRequestID.ToString(), "CreateInventoryRequest", "Failed creating Inventory Request");
                return Ok(statusObj);
            }
        }

        /// <summary>
        /// This method is used to udpate inventory request
        /// </summary>
        /// <param name="inventoryRequest">inventoryRequest</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/UpdateInventoryRequest")]
        public IHttpActionResult UpdateInventoryRequest(InventoryRequest inventoryRequest)
        {
            ResponseStatus statusObj = new ResponseStatus();

            try
            {

                var result = m_inventoryRequestManager.UpdateInventoryRequest(inventoryRequest);

                statusObj.Status = "success";
                statusObj.Value = result;

                //MyAuditLog.Info(enumModuleCodes.InventoryRequest.ToString(), enumAuditType.Update.ToString(), inventoryRequest.CreatedBy.ToString(), inventoryRequest.InventoryRequestID.ToString(), "UpdateInventoryRequest", "Updated Inventory Request " + inventoryRequest.InventoryRequestID.ToString() + " successfully.");
                return Ok(statusObj);

            }
            catch (Exception e)
            {

                statusObj.Status = "error";
                statusObj.Value = e.ToString();

                //MyAuditLog.ErrorLog(enumModuleCodes.InventoryRequest.ToString(), enumAuditType.Update.ToString(), inventoryRequest.CreatedBy.ToString(), e.ToString(), inventoryRequest.InventoryRequestID.ToString(), "UpdateInventoryRequest", "Failed to update Inventory Request "+ inventoryRequest.InventoryRequestID.ToString());
                return Ok(statusObj);
            }
        }

        /// <summary>
        /// This method is used to delete inventory request
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/DeleteInventoryRequest/{inventoryRequestId}")]
        public IHttpActionResult DeleteInventoryRequest(int inventoryRequestId)
        {
            try
            {
                var result = m_inventoryRequestManager.DeleteInventoryRequest(new InventoryRequestDelete
                {

                    InventoryRequestID = inventoryRequestId,
                    ModifiedBy = 0

                });

                //MyAuditLog.Info(enumModuleCodes.InventoryRequest.ToString(), enumAuditType.Delete.ToString(), null, inventoryRequestId.ToString(), "DeleteInventoryRequest", "Deleted Inventory Request " + inventoryRequestId.ToString() + " successfully.");
                return Ok(result);

            }
            catch (Exception e)
            {
                //MyAuditLog.ErrorLog(enumModuleCodes.InventoryRequest.ToString(), enumAuditType.Delete.ToString(), null, e.ToString(), inventoryRequestId.ToString(), "DeleteInventoryRequest", "Failed to delete Inventory Request " + inventoryRequestId.ToString());
                throw e;
            }

        }

    }
}
