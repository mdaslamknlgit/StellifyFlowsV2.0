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
    public class AccountSubCategoryController : ApiController
    {
        private readonly IAccountSubCategoryManager m_accountSubCategoryManager;
        public AccountSubCategoryController(IAccountSubCategoryManager accountSubCategoryManager)
        {
            m_accountSubCategoryManager = accountSubCategoryManager;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accountsubcategory")]
        public IHttpActionResult GetAccountCodeCategory([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_accountSubCategoryManager.GetAccountCodeCategory(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accountsubcategory/{accountCodeCategoryId}")]
        public IHttpActionResult GetAccountCodeCategoryDetails(int accountCodeCategoryId)
        {
            try
            {
                var result = m_accountSubCategoryManager.GetAccountCodeCategoryDetails(accountCodeCategoryId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/accountsubcategory")]
        public IHttpActionResult CreateAccountCodeCategory([FromBody]AccountCodeCategory accountCodeCategory)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_accountSubCategoryManager.ValidateAccountCodeCategory(new AccountCodeCategory
            {
                AccountCodeName = accountCodeCategory.AccountCodeName,
                CompanyId = accountCodeCategory.CompanyId,
                AccountCodeCategoryId = accountCodeCategory.AccountCodeCategoryId
            });
            if (validationStatus == "Duplicate AccountCode Name")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_accountSubCategoryManager.CreateAccountCodeCategory(accountCodeCategory);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }


        [HttpPut]
        [Route("api/accountsubcategory")]
        public IHttpActionResult UpdateAccountCodeCategory([FromBody]AccountCodeCategory accountCodeCategory)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_accountSubCategoryManager.ValidateAccountCodeCategory(new AccountCodeCategory
            {
                AccountCodeName = accountCodeCategory.AccountCodeName,
                CompanyId = accountCodeCategory.CompanyId,
                AccountCodeCategoryId = accountCodeCategory.AccountCodeCategoryId
            });
            if (validationStatus == "Duplicate AccountCode Name")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_accountSubCategoryManager.UpdateAccountCodeCategory(accountCodeCategory);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);

        }

        [HttpDelete]
        [Route("api/accountsubcategory/{accountCodeCategoryId}/{userId}/{companyId}")]
        public IHttpActionResult DeleteAccountCodeCategory(int accountCodeCategoryId, int userId, int companyId)
        {
            var result = m_accountSubCategoryManager.DeleteAccountCodeCategory(accountCodeCategoryId, userId, companyId);
            return Ok(result);
        }




    }
}
