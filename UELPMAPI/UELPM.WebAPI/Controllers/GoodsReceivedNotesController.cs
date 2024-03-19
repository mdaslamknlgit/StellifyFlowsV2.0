using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class GoodsReceivedNotesController : ApiController
    {
        private readonly IGoodsReceivedNotesManager m_goodsReceivedNotesManager;
        private readonly IPurchaseOrderCreationManager m_purchaseOrderCreationManager;
        private readonly IFixedAssetPurchaseOrderCreationManager m_fixedAssetPurchaseOrderCreationManager;
        private readonly IExpensesPurchaseOrderManager m_expensePurchaseOrderManager;

        public GoodsReceivedNotesController(){ }

        public GoodsReceivedNotesController(IGoodsReceivedNotesManager goodsReceivedNotesManager,
                                            IPurchaseOrderCreationManager purchaseOrderCreationManager,
                                            IFixedAssetPurchaseOrderCreationManager fixedAssetPurchaseOrderCreationManager,
                                            IExpensesPurchaseOrderManager expensesPurchaseOrderManager)
        {
            m_goodsReceivedNotesManager = goodsReceivedNotesManager;
            m_purchaseOrderCreationManager = purchaseOrderCreationManager;
            m_fixedAssetPurchaseOrderCreationManager = fixedAssetPurchaseOrderCreationManager;
            m_expensePurchaseOrderManager = expensesPurchaseOrderManager;
        }

        [HttpGet]
        [Route("api/goodsReceivedNotes")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetGoodsReceivedNotes([FromUri] GridDisplayInput purchaseOrderInput)
        {
            var result = m_goodsReceivedNotesManager.GetGoodsReceivedNotes(purchaseOrderInput);
            return Ok(result);
        }



        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/getDraft/{purchaseOrderId}/{purchaseOrderTypeId}/{companyId}")]
        public IHttpActionResult GetDraftCount(int purchaseOrderId, int purchaseOrderTypeId,int companyId)
        {
            var result = m_goodsReceivedNotesManager.GetDraftCount(purchaseOrderId, purchaseOrderTypeId, companyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/goodsReceivedNotes/{goodsReceivedNotesId}/{purchaseOrderId}/{purchaseOrderTypeId}/{companyId}")]
        public IHttpActionResult GetGoodsReceivedNotesDetails(int goodsReceivedNotesId, int purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            if(goodsReceivedNotesId==0)
            { 
                if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                {
                   var purchaeOrderDetails = m_purchaseOrderCreationManager.GetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
                   var totalReceivedQty = m_goodsReceivedNotesManager.GetTotalReceivedItemQuantity(purchaseOrderId,purchaseOrderTypeId);
                   return Ok(new { purchaseOrderDetails= purchaeOrderDetails , totalReceivedQty = totalReceivedQty });
                }
                else if (purchaseOrderTypeId ==Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    var  purchaeOrderDetails = m_fixedAssetPurchaseOrderCreationManager.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
                    var totalReceivedQty = m_goodsReceivedNotesManager.GetTotalReceivedItemQuantity(purchaseOrderId, purchaseOrderTypeId);
                    return Ok(new { purchaseOrderDetails = purchaeOrderDetails, totalReceivedQty = totalReceivedQty });
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                {
                    var purchaeOrderDetails = m_expensePurchaseOrderManager.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
                    var totalReceivedQty = m_goodsReceivedNotesManager.GetTotalReceivedItemQuantity(purchaseOrderId, purchaseOrderTypeId);
                    return Ok(new { purchaseOrderDetails = purchaeOrderDetails, totalReceivedQty = totalReceivedQty });
                }
                return Ok();
            }
            else
            {
                var result = m_goodsReceivedNotesManager.GetGoodsReceivedNotesDetails(goodsReceivedNotesId, purchaseOrderId, purchaseOrderTypeId);
                return Ok(result);
            }
        }

        [HttpPost]
        [Route("api/goodsReceivedNotes")]
        public HttpResponseMessage CreateGoodsReceivedNote()
        {
            GoodsReceivedNotes goodsReceivedNotes = JsonConvert.DeserializeObject<GoodsReceivedNotes>(HttpContext.Current.Request.Form["GoodsReceivedNotes"]);
            goodsReceivedNotes.files = HttpContext.Current.Request.Files;
            var result = m_goodsReceivedNotesManager.CreateGoodsReceivedNote(goodsReceivedNotes);
            //if(result==0)
            //{
            //     //MyAuditLog.ErrorLog(enumModuleCodes.GoodsRecievedNotes.ToString(), enumAuditType.Create.ToString(), goodsReceivedNotes.CreatedBy.ToString(), null,null, "CreateGoodsReceivedNote", "Error creating Goods Received Note");
            //    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            //}
            //else
            //{
                //MyAuditLog.Info(enumModuleCodes.GoodsRecievedNotes.ToString(), enumAuditType.Create.ToString(), goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNotes.GoodsReceivedNoteId.ToString(), "CreateGoodsReceivedNote","Created Goods Received Notes "+ goodsReceivedNotes.GoodsReceivedNoteId.ToString() + " successfully.");
                return Request.CreateResponse(HttpStatusCode.OK, result);
            //}
        }

        [HttpPut]
        [Route("api/goodsReceivedNotes")]
        public HttpResponseMessage UpdateGoodsReceivedNote()
        {
            GoodsReceivedNotes goodsReceivedNotes = JsonConvert.DeserializeObject<GoodsReceivedNotes>(HttpContext.Current.Request.Form["GoodsReceivedNotes"]);
            goodsReceivedNotes.files = HttpContext.Current.Request.Files;
            var result = m_goodsReceivedNotesManager.UpdateGoodsReceivedNote(goodsReceivedNotes);
            //if (result == -1)
            //{
            //    //MyAuditLog.ErrorLog(enumModuleCodes.GoodsRecievedNotes.ToString(), enumAuditType.Update.ToString(), goodsReceivedNotes.CreatedBy.ToString(), null, goodsReceivedNotes.GoodsReceivedNoteId.ToString(), "UpdateGoodsReceivedNote","Error updating Goods Received Note "+ goodsReceivedNotes.GoodsReceivedNoteId.ToString() + " successfully.");
            //    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            //}
            //else
            //{
                //MyAuditLog.Info(enumModuleCodes.GoodsRecievedNotes.ToString(), enumAuditType.Update.ToString(), goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNotes.GoodsReceivedNoteId.ToString(), "UpdateGoodsReceivedNote","Updated Goods Received Note "+ goodsReceivedNotes.GoodsReceivedNoteId.ToString() + " successfully.");
                return Request.CreateResponse(HttpStatusCode.OK, result);
            //}
        }

        [HttpDelete]
        [Route("api/goodsReceivedNotes/{goodsReceivedNoteId}/{userId}/{purchaseOrderId}/{poTypeId}")]
        public IHttpActionResult DeleteGoodsReceievedNote(int goodsReceivedNoteId,int userId, int purchaseOrderId, int poTypeId)
        {
            var result = m_goodsReceivedNotesManager.DeleteGoodsReceievedNote(new GoodsReceivedNotesDelete
            {
                GoodsReceivedNoteId = goodsReceivedNoteId,
                ModifiedBy = userId,//static value need to change,
                PurchaseOrderId= purchaseOrderId,
                POTypeId= poTypeId
            });
            //MyAuditLog.Info(enumModuleCodes.GoodsRecievedNotes.ToString(), enumAuditType.Update.ToString(), userId.ToString(), purchaseOrderId.ToString(), "DeleteGoodsReceievedNote","Deleted Goods Received Note "+ purchaseOrderId.ToString() + " successfully.");
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/goodsReceivedNotesPrint/{goodsReceivedNotesId}/{purchaseOrderTypeId}/{companyId}")]
        public HttpResponseMessage GoodsReceivedNotesPrint(int goodsReceivedNotesId, int purchaseOrderTypeId, int companyId)
        {
            var pdfContent = m_goodsReceivedNotesManager.GoodsReceivedNotesPrint(goodsReceivedNotesId, purchaseOrderTypeId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GoodsReceivedNotesFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_goodsReceivedNotesManager.DownloadFile(attachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };
            result.Headers.Add("FileName", attachment.FileName);
            return result;
        }

        //[HttpPost]
        //[Route("api/goodsReceivedNotes/void")]
        //public IHttpActionResult VoidGRN(GRNVoid gRNVoid)
        //{
        //    var result = m_goodsReceivedNotesManager.VoidGRN(gRNVoid);
        //    return Ok(result);
        //}

        [HttpPost]
        [Route("api/goodsReceivedNotes/void")]
        public IHttpActionResult VoidGRN(GRNVoid gRNVoid)
        {
            var result = m_goodsReceivedNotesManager.VoidGRN(gRNVoid);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/goodsReceivedNotes/Filter")]
        public IHttpActionResult GetFilterGRN([FromUri] GRNFilterDisplayInput gRNFilterDisplayInput)
        {
            try
            {
                var result = m_goodsReceivedNotesManager.GetFilterGRN(gRNFilterDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/goodsReceivesNotes/{GoodsReceivedNoteId}/{purchaseOrderId}/{POTypeId}")]
        public IHttpActionResult GetSupplierPayment(int GoodsReceivedNoteId, int purchaseOrderId, int POTypeId)
        {
            var result = m_goodsReceivedNotesManager.GetEditGRNDetails(GoodsReceivedNoteId, purchaseOrderId, POTypeId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/goodsReceivedNotes/checkvoid/{GoodsReceivedNoteId}")]
        public IHttpActionResult CheckGRNInInvoice(int GoodsReceivedNoteId)
        {
            var result = m_goodsReceivedNotesManager.CheckGRNInInvoice(GoodsReceivedNoteId);            
            return Ok(result);
        }


    }
}
