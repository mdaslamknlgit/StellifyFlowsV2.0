using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using System.Web.Script.Serialization;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.ExcelUpload;
using UELPM.WebAPI.Extensions;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class SupplierController : ApiController
    {
        private readonly ISupplierManager m_supplierManager;

        public SupplierController(ISupplierManager supplierManage)
        {
            m_supplierManager = supplierManage;
        }


        /// <summary>
        /// This method is used for getting suppliers
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/suppliers")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetSuppliers([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_supplierManager.GetSuppliers(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting suppliers based on search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/suppliers/search")]
        public IHttpActionResult GetAllSearchSuppliers([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_supplierManager.GetAllSearchSuppliers(gridDisplayInput);
            return Ok(result);
        }


        /// <summary>
        /// This method is used for getting suppliers
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/suppliers/All")]
        public IHttpActionResult GetAllSuppliers([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_supplierManager.GetAllSuppliers(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to get supplier by Id
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/suppliers/{id}/{companyId}/{loggedInUserId}")]
        public IHttpActionResult GetSupplier(int id, int companyId, int loggedInUserId)
        {
            var result = m_supplierManager.GetSupplier(id, companyId, loggedInUserId);
            return Ok(result);
        }

        ///// <summary>
        ///// This method is used to get supplier by Id
        ///// </summary>
        ///// <returns></returns>
        //[HttpGet]
        //[Route("api/suppliers/{id}/{companyId}/{loggedInUserId}")]
        //public HttpResponseMessage GetSupplier(int id, int companyId, int loggedInUserId)
        //{
        //    var result = m_supplierManager.GetSupplier(id, companyId, loggedInUserId);
        //    var response = Request.CreateResponse(HttpStatusCode.OK, result);
        //    response.Headers.CacheControl = new CacheControlHeaderValue()
        //    {
        //        Public = true,
        //        MaxAge = new TimeSpan(0, 0, 0, 0)
        //    };

        //    return response;
        //    //return Ok(result);
        //}

        /// <summary>
        /// This method is used for getting suppliers based on filters
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/suppliers/searchAll")]
        public IHttpActionResult GetAllSearchSuppliers([FromUri] SupplierSearch supplierSearch)
        {

            var result = m_supplierManager.GetAllSearchSuppliers(supplierSearch);

            if (supplierSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.Suppliers);
            }
        }

        /// <summary>
        /// This method is used to create supplier
        /// </summary>
        /// <param name="supplier">supplier</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/suppliers")]
        public IHttpActionResult CreateSupplier()
        {
            Supplier supplier = JsonConvert.DeserializeObject<Supplier>(HttpContext.Current.Request.Form["supplier"]);
            ResponseStatus statusObj = new ResponseStatus();
            supplier.UploadFiles = HttpContext.Current.Request.Files;
            if (supplier.DraftCode == string.Empty || supplier.DraftCode == null)
            {
                string validationStatus = m_supplierManager.ValidateInternalCode(new Supplier
                {
                    CoSupplierCode = supplier.CoSupplierCode,
                    SupplierId = supplier.SupplierId
                });
                if (validationStatus == "Duplicate")
                {
                    statusObj.Status = validationStatus;
                }
                else
                {
                    var result = m_supplierManager.CreateSupplier(supplier);
                    statusObj.Status = "success";
                    statusObj.Value = result;
                }
            }
            else
            {
                var result = m_supplierManager.CreateSupplier(supplier);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }

        /// <summary>
        /// This method is used to udpate supplier
        /// </summary>
        /// <param name="supplier">supplier</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/suppliers")]
        public IHttpActionResult UpdateSupplier()
        {
            //JavaScriptSerializer js = new JavaScriptSerializer();
            //string jsonData = js.Serialize(supplier);

            Supplier supplier = JsonConvert.DeserializeObject<Supplier>(HttpContext.Current.Request.Form["supplier"]);
            supplier.UploadFiles = HttpContext.Current.Request.Files;

            var result = m_supplierManager.UpdateSupplier(supplier);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to delete supplier
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/suppliers/{id}/{companyId}")]
        public IHttpActionResult DeleteSupplier(int id, int companyId)
        {
            var result = m_supplierManager.DeleteSupplier(id, 0, companyId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting Supplier services
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierServices/{supplierId}")]
        public IHttpActionResult GetSupplierServices(int? supplierId)
        {
            var result = m_supplierManager.GetSupplierServices(supplierId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting Service categories
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceCategroies")]
        public IHttpActionResult GetServiceCategroies()

        {
            var result = m_supplierManager.GetServiceCategroies();
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting Service categories by search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/serviceCategroies/search")]
        public IHttpActionResult GetServiceCategroies(string searchKey)

        {
            var result = m_supplierManager.GetServiceCategroies(searchKey);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting countries
        /// </summary>
        /// <returns></returns>

        // [Authorize(Roles ="Admin")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/countries")]
        public IHttpActionResult GetCountries()

        {
            var result = m_supplierManager.GetCountries();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GSTStatus")]
        public IHttpActionResult GetGSTStatus()

        {
            var result = m_supplierManager.GetGSTStatus();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/supplierApprovals")]
        public IHttpActionResult GetAllSupplierApprovals([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_supplierManager.GetAllSupplierApprovals(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to download file
        /// </summary>
        /// <param name="attachment"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/supplierFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_supplierManager.DownloadFile(attachment));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };

            result.Headers.Add("FileName", attachment.FileName);
            return result;
        }

        [HttpPost, Route("api/uploadSuppliers")]
        public IHttpActionResult UploadSuppliers()
        {
            int companyId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["CompanyId"]);
            int userId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["userId"]);
            var httpRequest = HttpContext.Current.Request;

            string filePath = string.Empty;
             if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadedSuppliers"), postedFile.FileName);
               if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadedSuppliers"));
                }
                if (File.Exists(filePath))
                {
                    System.GC.Collect();
                    System.GC.WaitForPendingFinalizers();
                    File.Delete(filePath);
                }

                postedFile.SaveAs(filePath);
                postedFile = null;
            }

            var result = m_supplierManager.UploadSupplier(filePath, userId);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/suppliers/detach")]
        public IHttpActionResult DetachSupplier(SupplierCompanyDetails supplierToDetach)
        {
            var result = m_supplierManager.DetachSupplier(supplierToDetach);
            return Ok(result);
        }
        [HttpGet]
        [Route("api/Suppliers/ExportAll")]
        public IHttpActionResult ExportAllSuppliers()
        {
            var result = m_supplierManager.ExportAllSuppliers();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/suppliers/vendorsExport")]
        public IHttpActionResult VendorsExport([FromUri] GridDisplayInput vendorInput)
        {
            var result = m_supplierManager.VendorsExport(vendorInput);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/suppliers/vendorsExportById/{companyId}")]
        public IHttpActionResult VendorsExportById(VendorsList[] vendorsLists, int companyId)
        {
            var result = m_supplierManager.VendorsExportById(vendorsLists, companyId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/suppliers/changeWorkflowStatus/{companyId}")]
        public IHttpActionResult ChangeWorkflowStatus(VendorToExport vendorToExport, int companyId)
        {
            var result = m_supplierManager.ChangeWorkflowStatus(vendorToExport.SupplierId, companyId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/suppliers/vendorsExportByNewCreateSup/{ExportSupplierId}/{companyId}")]
        public IHttpActionResult VendorsExportByNewCreateSup(int ExportSupplierId, int companyId)
        {
            var result = m_supplierManager.VendorsExportByNewCreateSup(ExportSupplierId, companyId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/suppliers/recallPoApproval")]
        public IHttpActionResult RecallPoApproval(Supplier supplier)
        {
            try
            {
                var result = m_supplierManager.RecallPoApproval(supplier);
                return Ok(result);
            }
            catch (Exception e)
            {
                MyAuditLog.SendErrorToText1("SupplierController", "RecallPoApproval", "", "RecallPoApproval", e.Message);
                throw;
            }
        }

        [HttpGet]
        [Route("api/suppliers/CheckVerifystatus/{companyid}/{userid}/{deptid}")]
        public IHttpActionResult CheckVerifystatus(int companyid, int userid, int deptid)
        {
            var result = m_supplierManager.CheckVerifystatus(companyid,userid,deptid);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/suppliers/CheckDuplicateSupplier/{SupplierId}/{SupplierName}")]
        public IHttpActionResult CheckDuplicateSupplier(int SupplierId, string SupplierName)
        {
            var result = m_supplierManager.CheckDuplicateSupplier(SupplierId, SupplierName);
            return Ok(result);
        }


    }
}
