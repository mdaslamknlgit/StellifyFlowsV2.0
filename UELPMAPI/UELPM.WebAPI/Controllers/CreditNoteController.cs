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
using UELPM.Service.Helpers;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class CreditNoteController : ApiController
    {
        private readonly ICreditNoteManager m_creditNoteManager;

        public CreditNoteController() { }

        public CreditNoteController(ICreditNoteManager creditNoteManager)
        {
            m_creditNoteManager = creditNoteManager;
        }

        [HttpGet, Route("api/GetCreditNotesList")]
        public IHttpActionResult GetCreditNotesList([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_creditNoteManager.GetCreditNotesList(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/Get_Existing_InvoiceId/{InvoiceId}")]
        public IHttpActionResult Get_Existing_InvoiceId(int InvoiceId)
        {
            var result = m_creditNoteManager.Get_Existing_InvoiceId(InvoiceId);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/invoicesBySupplier/{supplierId}/{companyid}")]
        public IHttpActionResult GetInvoiceBySupplier(int supplierId, int companyid)
        {
            var result = m_creditNoteManager.GetInvoiceBySupplier(supplierId, companyid);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetCreditNoteById/{Id}")]
        public IHttpActionResult GetCreditNoteById(int Id)
        {
            var result = m_creditNoteManager.GetCreditNotesById(Id);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetOriginalQTYPRICE/{Id}")]
        public IHttpActionResult GetOriginalQTYPRICE(int Id)
        {
            var result = m_creditNoteManager.GetOriginalQTYPRICE(Id);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allCreditNoteINVRequest")]
        public IHttpActionResult GetAllINVRequest([FromUri] GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = m_creditNoteManager.GetCreditNoteAllINVRequest(gridDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetCreditNoteINVDetails/{InvoiceId}")]
        public IHttpActionResult GetCreditNoteINVDetails(int InvoiceId)
        {
            try
            {
                var result = m_creditNoteManager.GetCreditNoteINVDetails(InvoiceId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/TaxesByTaxId/{taxId}")]
        public IHttpActionResult GetFilterTaxes(int taxId)
        {
            var result = m_creditNoteManager.GetTaxesByTaxId(taxId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/taxes/{taxId}")]
        public IHttpActionResult GetTaxesByTaxId(int taxId)
        {
            var result = m_creditNoteManager.GetTaxesByTaxId(taxId);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/creditNotes")]
        public IHttpActionResult PostCreditNote()
        {
            try
            {
                CreditNote creditNote = JsonConvert.DeserializeObject<CreditNote>(HttpContext.Current.Request.Form["creditNotes"]);
                creditNote.files = HttpContext.Current.Request.Files;
                var result = m_creditNoteManager.PostCreditNote(creditNote);
                return Ok(result);
            }
            catch (Exception ex)
            {
                ErrorLog.Log("CreditNoteController", "PostCreditNote", "PostCreditNote", ex.ToString());
                return Ok(false);
            }
            

        }


        [HttpDelete]
        [Route("api/creditNotes/{creditNoteId}")]
        public IHttpActionResult DeleteContractPurchaseOrder(int creditNoteId)
        {

            var result = m_creditNoteManager.DeleteContractCreditNote(new CreditNoteDelete
            {
                CreditNoteId = creditNoteId,

            });
            return Ok(result);
        }

        [HttpGet, Route("api/ExportCNDocument/{DocumentId}")]
        public IHttpActionResult ExportCNDocument(int DocumentId)
        {
            var result = m_creditNoteManager.ExportCNDocument(DocumentId);
            return Ok(result);
        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("api/ValidateCNNo")]
        public IHttpActionResult ValidateCNNo(CNValiDate creditNote)
        {
            //CNValiDate creditNote = JsonConvert.DeserializeObject<CNValiDate>(HttpContext.Current.Request.Form["creditNotes"]);
            var result = m_creditNoteManager.ValidateCNNo(creditNote.SupplierCreditNoteNo, creditNote.CreditNoteId);
            return Ok(result);
        }
    }
}
