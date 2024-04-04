using Newtonsoft.Json;
using System;
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
    public class InvoiceController : ApiController
    {
        private readonly IInvoiceManager m_invoiceManager;
        private readonly IPurchaseOrderCreationManager m_purchaseOrderCreationManager;
        private readonly IFixedAssetPurchaseOrderCreationManager m_fixedAssetPurchaseOrderCreationManager;
        private readonly IContractPurchaseOrderManager m_contractPurchaseOrderManager;
        private readonly IExpensesPurchaseOrderManager m_expensePurchaseOrderManager;

        public InvoiceController(IInvoiceManager invoiceManager,
                                 IPurchaseOrderCreationManager purchaseOrderCreationManager,
                                 IFixedAssetPurchaseOrderCreationManager fixedAssetPurchaseOrderCreationManager,
                                 IContractPurchaseOrderManager contractPurchaseOrderManager,
                                 IExpensesPurchaseOrderManager expensesPurchaseOrderManager)
        {
            m_invoiceManager = invoiceManager;
            m_purchaseOrderCreationManager = purchaseOrderCreationManager;
            m_fixedAssetPurchaseOrderCreationManager = fixedAssetPurchaseOrderCreationManager;
            m_contractPurchaseOrderManager = contractPurchaseOrderManager;
            m_expensePurchaseOrderManager = expensesPurchaseOrderManager;
        }

        /// <summary>
        /// This method is used for getting all purchase order...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoice")]
        public IHttpActionResult GetInvoice([FromUri] GridDisplayInput invoiceInput)
        {
            var result = m_invoiceManager.GetInvoice(invoiceInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/ExportInvoice")]
        public IHttpActionResult GetExportInvoice([FromUri] GridDisplayInput invoiceInput)
        {
            var result = m_invoiceManager.GetExportInvoice(invoiceInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoice/approval")]
        public IHttpActionResult GetInvoiceForApprovals([FromUri] GridDisplayInput invoiceInput)
        {
            var result = m_invoiceManager.GetInvoiceForApprovals(invoiceInput);
            return Ok(result);
        }
        /// <summary>
        /// This method is used for getting suppliers
        /// </summary>
        /// <returns></returns>
        //[HttpGet]
        //[Route("api/Invoice/Search")]
        //public IHttpActionResult GetAllSearchInvoice([FromUri]GridDisplayInput gridDisplayInput)
        //{
        //    var result = m_invoiceManager.GetAllSearchInvoice(gridDisplayInput);
        //    return Ok(result);
        //}

        /// <summary>
        /// This method is used for getting the details of the selected purchase order record...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoice/{invoiceId}/{invoiceTypeId}/{poTypeId}/{companyId}")]
        public IHttpActionResult GetInvoiceDetails(int invoiceId, int invoiceTypeId, int? poTypeId, int? companyId)
        {

            var result = m_invoiceManager.GetInvoiceDetails(invoiceId, invoiceTypeId, poTypeId, companyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoices/{invoiceId}")]
        public IHttpActionResult GetInvoiceCount(int invoiceId)
        {

            var result = m_invoiceManager.GetInvoiceCount(invoiceId);
            return Ok(result);
        }             

        /// <summary>
        /// This method is used to create purchase order Request
        /// </summary>
        /// <param name="invoice">invoice</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/Invoice")]
        public HttpResponseMessage CreateInvoice()
        {
            Invoice invoice = JsonConvert.DeserializeObject<Invoice>(HttpContext.Current.Request.Form["invoice"]);
            invoice.files = HttpContext.Current.Request.Files;
            var result = m_invoiceManager.CreateInvoice(invoice);
            if (result == 0)
            {
                //MyAuditLog.ErrorLog(enumModuleCodes.Invoice.ToString(), enumAuditType.Create.ToString(), invoice.CreatedBy.ToString(), null, null, "CreateInvoice","Failed to create Invoice");
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else
            {
                //MyAuditLog.Info(enumModuleCodes.Invoice.ToString(), enumAuditType.Create.ToString(), invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "CreateInvoice","Created Invoice "+ invoice.InvoiceId.ToString() + " successfully.");
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }
        /// <summary>
        /// This method is used to udpate purchase order Request
        /// </summary>
        /// <param name="invoice">invoice</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/Invoice")]
        public IHttpActionResult UpdateInvoice()
        {
            Invoice invoice = JsonConvert.DeserializeObject<Invoice>(HttpContext.Current.Request.Form["invoice"]);
            invoice.files = HttpContext.Current.Request.Files;
            var result = m_invoiceManager.UpdateInvoice(invoice);
            //MyAuditLog.Info(enumModuleCodes.Invoice.ToString(), enumAuditType.Update.ToString(), invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "UpdateInvoice","Updated Invoice "+ invoice.InvoiceId.ToString() + " successfully.");
            return Ok(result);
        }
        /// <summary>
        /// This method is used to delete purchase order
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/Invoice/{invoiceId}/{createdBy}")]
        public IHttpActionResult DeleteInvoice(int invoiceId, int createdBy)
        {
            var result = m_invoiceManager.DeleteInvoice(new InvoiceDelete
            {
                InvoiceId = invoiceId,
                ModifiedBy = createdBy,

            });
            //MyAuditLog.Info(enumModuleCodes.Invoice.ToString(), enumAuditType.Delete.ToString(), createdBy.ToString(), invoiceId.ToString(), "DeleteInvoice","Deleted Invoice "+ invoiceId.ToString() + "");
            return Ok(result);
        }
        /// <summary>
        /// This method is used for getting all purchase order types...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/InvoiceTypes")]
        public IHttpActionResult GetInvoiceTypes()
        {
            var result = m_invoiceManager.GetInvoiceTypes();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all cost of service types
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/InvoiceGetCostOfServiceTypes")]
        public IHttpActionResult InvoiceGetCostOfServiceTypes()
        {
            var result = m_invoiceManager.InvoiceGetCostOfServiceTypes();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all departments
        /// </summary>
        /// <returns></returns>

        [HttpGet]
        [Route("api/InvoiceFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_invoiceManager.DownloadFile(attachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };
            result.Headers.Add("FileName", attachment.FileName);
            return result;
        }

        [HttpGet]
        [Route("api/InvoicePrint/{invoiceId}/{invoiceTypeId}/{POTypeId}/{companyId}")]
        public IHttpActionResult ConvertInvoiceToPdf(int invoiceId, int invoiceTypeId, int? POTypeId, int? companyId)
        {
            string htmlContent = m_invoiceManager.ConvertInvoiceToPdf(invoiceId, invoiceTypeId, POTypeId, companyId);
            return Ok(htmlContent);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GRNByPurchaseOrder/{purchaseOrderId}/{purchaseOrderTypeId}/{companyId}")]
        public IHttpActionResult GetGRNByPurchaseOrder(string purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            var goodsReceivedNotes = m_invoiceManager.GetGRNByPurchaseOrder(purchaseOrderId, purchaseOrderTypeId);    
            if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
            {
                var purchaseOrderDetails = m_purchaseOrderCreationManager.GetPurchaseOrderDetails(purchaseOrderId, companyId);
                return Ok(new { purchaseOrderDetails = purchaseOrderDetails, goodsReceivedNotes = goodsReceivedNotes });
            }
            else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
            {
                var purchaseOrderDetails = m_fixedAssetPurchaseOrderCreationManager.GetFixedAssetPurchaseOrderDetails(purchaseOrderId, companyId);
                return Ok(new { purchaseOrderDetails = purchaseOrderDetails, goodsReceivedNotes = goodsReceivedNotes });
            }
            else if ((purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)))
            {
                var contractPOCList = m_invoiceManager.GetContractPOCs(purchaseOrderId, purchaseOrderTypeId);
                var purchaseOrderDetails = m_contractPurchaseOrderManager.GetContractPurchaseOrderDetails(purchaseOrderId);
                if (contractPOCList != null)
                {
                    contractPOCList = contractPOCList.Select(w => { w.SupplierAddress = purchaseOrderDetails.SupplierAddress; return w; }).ToList();
                }
                return Ok(new { purchaseOrderDetails = purchaseOrderDetails, goodsReceivedNotes = goodsReceivedNotes, contractPOCList = contractPOCList });
            }
            else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
            {
                var purchaseOrderDetails = m_expensePurchaseOrderManager.GetExpensesPurchaseOrderDetails(purchaseOrderId, 0, companyId);
                return Ok(new { purchaseOrderDetails = purchaseOrderDetails, goodsReceivedNotes = goodsReceivedNotes });
            }
            return Ok(goodsReceivedNotes);
        }

        [HttpPost]
        [Route("api/Invoice/ChangeStatus")]
        public IHttpActionResult ChangeInvoiceStatus(InvoiceToExport invoiceToExport)
        {
            var result = m_invoiceManager.ChangeInvoiceStatus(invoiceToExport.InvoiceId, invoiceToExport.WorkFlowStatusId, invoiceToExport.UserId,invoiceToExport.CurrentUserId);
            return Ok(result);
        }
        [HttpPost]
        [Route("api/Invoice/void")]
        public IHttpActionResult VoidInvoice(InvoiceVoid invoice)
        {
            var result = m_invoiceManager.VoidInvoice(invoice);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Invoice/reject")]
        public IHttpActionResult RejectInvoice(InvoiceVoid invoice)
        {
            var result = m_invoiceManager.RejectInvoice(invoice);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/Invoice/Export")]
        public HttpResponseMessage ExportInvoice(Invoice invoice)
        {
            //var result = m_invoiceManager.exportInvoice(invoice);
            //return Ok(result);
            var excelContent = m_invoiceManager.exportInvoice(invoice);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(excelContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
            return response;
        }

        [HttpPost]
        [Route("api/Invoice/BulkExport/{userId}/{companyId}")]
        public IHttpActionResult BulkExport(InvoiceList[] invoiceList, int userId, int companyId)
        {

            var result = m_invoiceManager.exportBulkInovice(invoiceList, userId, companyId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Invoice/BulkExportUpdateLog/{userId}/{companyId}")]
        public IHttpActionResult BulkExportUpdateLog(InvoiceList[] invoiceList, int userId, int companyId)
        {

            var result = m_invoiceManager.BulkExportUpdateLog(invoiceList, userId, companyId);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/Invoice/search")]
        public IHttpActionResult SearchGoodsReturnedNote([FromUri] InvoiceSearch invoiceSearch)
        {
            var result = m_invoiceManager.SearchInvoice(invoiceSearch);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Invoice/recallInvoiceApproval")]
        public IHttpActionResult RecallInvoiceApproval(Invoice invoice)
        {
            var result = m_invoiceManager.RecallInvoiceApproval(invoice);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoicesubtotal")]
        public IHttpActionResult CalculateInvoiceSubTotal([FromUri] InvoiceSubTotal invoiceSubTotal)
        {
            var result = m_invoiceManager.CalculateInvoiceSubTotal(invoiceSubTotal);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoice/Filter")]
        public IHttpActionResult GetFilterSIC([FromUri] SINVFilterDisplayInput sicFilterDisplayInput)
        {
            try
            {
                var result = m_invoiceManager.GetFilterSIC(sicFilterDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/InvoiceSupplier/{supplierId}/{purchaseOrderId}")]
        public IHttpActionResult Getsupplierdetails(int supplierId, int purchaseOrderId)
        {
            bool status = false;
            int result = m_invoiceManager.Getsupplierdetails(supplierId, purchaseOrderId);
            if(supplierId == result || supplierId==0)
            {
                status = true;
            }
            return Ok(status);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetGRNCountByPurchaseOrder/{purchaseOrderId}/{purchaseOrderTypeId}/{companyId}")]
        public IHttpActionResult GetGRNCountByPurchaseOrder(int purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            var goodsReceivedNotes = m_invoiceManager.GetGRNCountByPurchaseOrder(purchaseOrderId, purchaseOrderTypeId);
            if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
            {
                return Ok(new { goodsReceivedNotes = goodsReceivedNotes });
            }
            else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
            {
                return Ok(new { goodsReceivedNotes = goodsReceivedNotes });
            }
            else if ((purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)))
            {
                var contractPOCList = m_invoiceManager.GetContractPOCs(purchaseOrderId.ToString(), purchaseOrderTypeId);
                return Ok(new { goodsReceivedNotes = goodsReceivedNotes, contractPOCList = contractPOCList });
            }
            else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
            {
                return Ok(new { goodsReceivedNotes = goodsReceivedNotes });
            }
            return Ok(goodsReceivedNotes);
        }

        [HttpPost]
        [Route("api/Invoice/cancelDraft")]
        public IHttpActionResult CancelDraftInvoice(InvoiceVoid invoice)
        {
            var result = m_invoiceManager.CancelDraftInvoice(invoice);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Invoice/SaveInvoiceGlCode")]
        public IHttpActionResult SaveInvoiceGlCode([FromUri] InvoiceGlCode invoiceglcode)
        {
            var result = m_invoiceManager.SaveInvoiceGlcode(invoiceglcode);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SupplierInvoicePrint/{InvoiceId}/{InvoiceTypeId}/{POTypeId}/{companyId}")]
        public HttpResponseMessage SupplierInvoicePrint(int InvoiceId, int InvoiceTypeId, int POTypeId, int companyId)
        {
            var pdfContent = m_invoiceManager.SupplierInvoicePrint(InvoiceId, InvoiceTypeId, POTypeId, companyId);
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(pdfContent);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            return response;
        }

        [HttpPost]
        [Route("api/Invoice/VerifyInvoice")]
        public IHttpActionResult VerifyInvoice(Invoice invoice)
        {
            var result = m_invoiceManager.VerifyInvoice(invoice);
            return Ok(result);
        }

    }
}
