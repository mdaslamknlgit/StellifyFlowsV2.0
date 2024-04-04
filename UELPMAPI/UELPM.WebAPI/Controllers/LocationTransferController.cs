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
    public class LocationTransferController : ApiController
    {
        private readonly ILocationTransferManager m_locationTransferManager;
        public LocationTransferController() { }

        public LocationTransferController(ILocationTransferManager locationTransferManager)
        {
            m_locationTransferManager = locationTransferManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/locationTransfer")]
        public IHttpActionResult GetLocationTransfer([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_locationTransferManager.GetLocationTransfer(gridDisplayInput);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/locationTransfer/approvals")]
        public IHttpActionResult GetLocationTransferForApprovals([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_locationTransferManager.GetLocationTransferForApprovals(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/locationTransfer/search")]
        public IHttpActionResult SearchLocationTransfer([FromUri] LocationTransferSearch gridDisplayInput)
        {
            var result = m_locationTransferManager.SearchLocationTransfer(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/locationTransfer/{locationTransferId}/{loggedInUserId}")]
        public IHttpActionResult GetLocationTransferDetails(int locationTransferId, int loggedInUserId)
        {
            var result = m_locationTransferManager.GetLocationTransferDetails(locationTransferId, loggedInUserId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/locationTransfer")]
        public IHttpActionResult CreateLocationTransfer([FromBody] LocationTransfer locationTransfer)
        {
            var result = m_locationTransferManager.CreateLocationTransfer(locationTransfer);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/locationTransfer")]
        public IHttpActionResult UpdateLocationTransfer([FromBody] LocationTransfer locationTransfer)
        {
            var result = m_locationTransferManager.UpdateLocationTransfer(locationTransfer);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/locationTransfer/{LocationTransferId}/{CreatedBy}")]
        public IHttpActionResult DeleteLocationTransfer([FromUri] LocationTransfer locationTransfer)
        {
            var result = m_locationTransferManager.DeleteLocationTransfer(locationTransfer);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItems")]
        public IHttpActionResult GetItems([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_locationTransferManager.GetItems(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/locationTransferPrint/{locationTransferId}/{companyId}")]
        public HttpResponseMessage LocationTransferPrint(int locationTransferId, int companyId)
        {
            var pdfContent = m_locationTransferManager.LocationTransferPrint(locationTransferId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

    }
}
