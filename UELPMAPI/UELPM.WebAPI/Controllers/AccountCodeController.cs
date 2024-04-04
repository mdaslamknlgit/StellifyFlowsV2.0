using Newtonsoft.Json;
using System.IO;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class AccountCodeController : ApiController
    {
        private readonly IAccountCodeManager m_accountCodeManager;

        

        public AccountCodeController(IAccountCodeManager accountCodeManager)
        {
            m_accountCodeManager = accountCodeManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accountCodeCategories/{companyId}")]
        public IHttpActionResult GetAccountCodeCategories(int companyId)
        {
            var result = m_accountCodeManager.GetAccountCodeCategories(companyId);
            return Ok(result);
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/allAccountCodeCategories")]
        public IHttpActionResult GetAllAccountCodeCategories()
        {
            var result = m_accountCodeManager.GetAllAccountCodeCategories();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accountCodes/accountTypes/{companyId}")]
        public IHttpActionResult GetAccountTypes(int companyId)
        {
            var result = m_accountCodeManager.GetAccountTypes(companyId);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accountCodes/searchAll")]
        public IHttpActionResult GetAccountCodesByAccountType([FromUri] AccountCodesSearch accountCodesSearch)
        {
            var result = m_accountCodeManager.GetAccountCodesByAccountType(accountCodesSearch);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accountCodes/subcategory/searchAll")]
        public IHttpActionResult GetSubCategoryByAccountType([FromUri] SubCategorySearch accountCodesSearch)
        {
            var result = m_accountCodeManager.GetSubCategoryByAccountType(accountCodesSearch);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/accountCodes/insert")]
        public IHttpActionResult CreateAccountCode(AccountCode accountCode)
        {
            var result = m_accountCodeManager.CreateAccountCode(accountCode);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/accountCodes")]
        public IHttpActionResult UpdateAccountCodes(AccountCodeList accountCodes)
        {
            var result = m_accountCodeManager.UpdateAccountCodes(accountCodes);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/accountCodes/DeleteAccountCategory/{accountCatId}/{accountcodeId}/{companyId}/{userId}")]
        public IHttpActionResult DeletePurchaseOrder(int accountCatId,int accountcodeId, int companyId,int userId)
        {
            var result = m_accountCodeManager.DeleteAccountCodes(new AccountCodeDelete
            {
                AccountCatId = accountCatId,
                AccountCodeId=accountcodeId,
                CompanyId = companyId,
                ModifiedBy=userId

            });
            return Ok(result);
        }

        [HttpPost, Route("api/accountCodes")]
        public IHttpActionResult UploadAccountCodes()
        {
            int companyId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["CompanyId"]);
            int userId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["userId"]);
            var httpRequest = HttpContext.Current.Request;
            string filePath = string.Empty;

            //ClaimsIdentity claimsIdentity = User.Identity as ClaimsIdentity;
            //int userid = Convert.ToInt32(claimsIdentity.Claims.FirstOrDefault(x => x.Type == "userId").Value);

            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];                
                filePath = string.Format("{0}/{1}", HttpContext.Current.Server.MapPath("~/UploadedAccountCodes"), postedFile.FileName);

                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/UploadedAccountCodes"));
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
            
            var result = m_accountCodeManager.UploadAccountCodes(filePath, userId);
            return Ok(result);
        }

    }
}
