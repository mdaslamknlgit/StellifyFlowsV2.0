using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class PurchaseOrderApprovalController : ApiController
    {
        private readonly IPurchaseOrderApprovalManager m_purchaseOrderApprovalManager;
        public PurchaseOrderApprovalController() { }

        public PurchaseOrderApprovalController(IPurchaseOrderApprovalManager purchaseOrderApprovalManager)
        {
            m_purchaseOrderApprovalManager = purchaseOrderApprovalManager;
        }
        /// <summary>
        /// This method is used for getting all purchase order approvals
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderApprovals")]
        public IHttpActionResult GetPurchaseOrdersForApproval([FromUri] GridDisplayInput displayInput)
        {
            var result = m_purchaseOrderApprovalManager.GetPurchaseOrdersForApproval(displayInput);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/purchaseOrderApprovals/Search")]
        public IHttpActionResult SearchPurchaseOrdersForApproval([FromUri] PurchaseOrderSearch displayInput)
        {
            var result = m_purchaseOrderApprovalManager.SearchPurchaseOrdersForApproval(displayInput);
            return Ok(result);
        }
        [HttpPut]
        [Route("api/purchaseOrderApprovals")]
        public IHttpActionResult PurchaseOrderRequestStatusUpdate(PurchaseOrderApproval requestApproval)
        {
            try
            {
                var result = m_purchaseOrderApprovalManager.PurchaseOrderRequestStatusUpdate(requestApproval);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("PurchaseOrderApprovalController", "PurchaseOrderRequestStatusUpdate", "", "PurchaseOrderRequestStatusUpdate", e.Message);
                throw;
            }
            
        }
    }
}
