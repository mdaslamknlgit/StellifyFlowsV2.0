using Newtonsoft.Json;
using System.IO;
using System.Web;
using System.Web.Http;
using System.Web.Script.Serialization;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    [RoutePrefix("api/Customer")]
    public class CustomerController : ApiController
    {
        private readonly ICustomerManager m_customerManager;

        public CustomerController(ICustomerManager customerManager)
        {
            m_customerManager = customerManager;
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetCustomers")]
        public IHttpActionResult GetCustomers(SalesCustomerSearch search)
        {
            var result = m_customerManager.GetCustomers(search);
            return Ok(result);
        }
        
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("GetCustomer/{id}")]
        public IHttpActionResult GetCustomer(int id)
        {
            var result = m_customerManager.GetCustomer(id);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("PostCustomer")]
        public IHttpActionResult PostCustomer()
        {
            var httpRequest = HttpContext.Current.Request;
            SalesCustomer salesCustomer = JsonConvert.DeserializeObject<SalesCustomer>(httpRequest.Form["Customer"]);
            salesCustomer.files = httpRequest.Files;
            var result = m_customerManager.PostCustomer(salesCustomer);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("UploadCustomers/{companyId}")]
        public IHttpActionResult UploadCustomers(int companyId)
        {
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;
            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadCustomers"), postedFile.FileName);
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadCustomers"));
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
            var result = m_customerManager.UploadCustomers(filePath, companyId);
            return Ok(result);
        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("PostCustomers/{UserId}/{CompanyId}")]
        public IHttpActionResult PostCustomers(int UserId,int CompanyId)
        {
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;
            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadCustomers"), postedFile.FileName);
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadCustomers"));
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
            var result = m_customerManager.PostCustomers(filePath,UserId,CompanyId);
            return Ok(result);
        }
    }
}
