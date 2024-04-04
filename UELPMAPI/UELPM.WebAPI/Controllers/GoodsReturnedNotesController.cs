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
    public class GoodsReturnedNotesController : ApiController
    {
        private readonly IGoodsReturnedNotesManager m_goodsReturnedNotesManager;
        private readonly IPurchaseOrderCreationManager m_purchaseOrderCreationManager;
        private readonly IFixedAssetPurchaseOrderCreationManager m_fixedAssetPurchaseOrderCreationManager;
        private readonly IExpensesPurchaseOrderManager m_expensePurchaseOrderManager;

        public GoodsReturnedNotesController(IGoodsReturnedNotesManager goodsReturnedNotesManager,
                                            IPurchaseOrderCreationManager purchaseOrderCreationManager,
                                            IFixedAssetPurchaseOrderCreationManager fixedAssetPurchaseOrderCreationManager,
                                            IExpensesPurchaseOrderManager expensesPurchaseOrderManager)
        {
            m_goodsReturnedNotesManager = goodsReturnedNotesManager;
            m_purchaseOrderCreationManager = purchaseOrderCreationManager;
            m_fixedAssetPurchaseOrderCreationManager = fixedAssetPurchaseOrderCreationManager;
            m_expensePurchaseOrderManager = expensesPurchaseOrderManager;
        }

        [HttpGet]
        [Route("api/goodsReturnedNotes")]
        public IHttpActionResult GetGoodsReturnedNotes([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_goodsReturnedNotesManager.GetGoodsReturnedNotes(gridDisplayInput);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/goodsReturnedNotes")]
        public HttpResponseMessage CreateGoodsReturnedNote([FromBody]GoodsReturnedNotes goodsReturnedNotes)
        {
            var result = m_goodsReturnedNotesManager.CreateGoodsReturnedNote(goodsReturnedNotes);
            if (result == 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }

        [HttpDelete]
        [Route("api/goodsReturnedNotes/{goodsReturnNoteId}/{userId}")]
        public IHttpActionResult DeleteGoodsReturnedNote(int goodsReturnNoteId, int userId)
        {
            var result = m_goodsReturnedNotesManager.DeleteGoodsReturnedNote(new GoodReturnedNotesDelete
            {
                GoodsReturnNoteId = goodsReturnNoteId,
                ModifiedBy = userId
            });
            return Ok(result);
        }

        [HttpGet]
        [Route("api/goodsReturnedNotesPrint/{goodsReceivedNotesId}/{poTypeId}/{companyId}")]
        public HttpResponseMessage GoodsReturnedNotesPrint(int goodsReceivedNotesId, int poTypeId, int companyId)
        {
            var pdfContent = m_goodsReturnedNotesManager.GoodsReturnedNotesPrint(goodsReceivedNotesId, poTypeId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [Route("api/goodsReturnedNotes/approvals")]
        public IHttpActionResult GetGRTForApprovals([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_goodsReturnedNotesManager.GetGRTForApprovals(gridDisplayInput);
            return Ok(result);
        }


        [HttpGet]
        [Route("api/goodsReturnNotes/{goodsReceivedNoteId}/{POTypeId}")]
        public IHttpActionResult GetGRNDetails(int goodsReceivedNoteId, int POTypeId)
        {
            var result = m_goodsReturnedNotesManager.GetGRNDetails(goodsReceivedNoteId, POTypeId);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/goodsReturnsNotes/{goodsReturnedNoteId}/{loggedInUserId}")]
        public IHttpActionResult GetGoodsReturnedNotesDetails(int goodsReturnedNoteId, int loggedInUserId = 0)
        {
            var result = m_goodsReturnedNotesManager.GetGoodsReturnedNotesDetails(goodsReturnedNoteId, loggedInUserId);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/goodsReturnedNotes")]
        public HttpResponseMessage UpdateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes)
        {
            var result = m_goodsReturnedNotesManager.UpdateGoodsReturnedNote(goodsReturnedNotes);
            if (result == 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }

        [HttpGet]
        [Route("api/goodsReturnedNotes/search")]
        public IHttpActionResult SearchGoodsReturnedNote([FromUri] GoodsReturnedNoteSearch goodsReturnedNoteSearch)
        {
            var result = m_goodsReturnedNotesManager.SearchGoodsReturnedNote(goodsReturnedNoteSearch);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/goodsReturnedNotes/Filter")]
        public IHttpActionResult GetFilterGoodsReturnNotes([FromUri] GoodsReturnNoteFilterDisplayInput goodsReturnNoteFilterDisplayInput)
        {
            var result = m_goodsReturnedNotesManager.GetFilterGoodsReturnNotes(goodsReturnNoteFilterDisplayInput);
            return Ok(result);
        }

    }
}
