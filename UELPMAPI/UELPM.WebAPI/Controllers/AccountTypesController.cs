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
    public class AccountTypesController : ApiController
    {
        private readonly IAccountTypesManager m_accountTypesManager;

        public AccountTypesController(IAccountTypesManager accountTypesManager)
        {
            m_accountTypesManager = accountTypesManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/coaaccounttypes")]
        public IHttpActionResult GetAccountTypes([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_accountTypesManager.GetAccountTypes(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/coaaccounttypes/{COAAccountTypeId}")]
        public IHttpActionResult GetAccountTypesDetails(int COAAccountTypeId)
        {
            try
            {
                var result = m_accountTypesManager.GetAccountTypesDetails(COAAccountTypeId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/coaaccounttypes")]
        public IHttpActionResult CreateAccountType([FromBody]AccountTypes m_accountTypes)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_accountTypesManager.ValidateAccountTypes(new AccountTypes
            {
                AccountType = m_accountTypes.AccountType,
                COAAccountTypeId = m_accountTypes.COAAccountTypeId
            });
            if (validationStatus == "Duplicate AccountType")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_accountTypesManager.CreateAccountType(m_accountTypes);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }


        [HttpPut]
        [Route("api/coaaccounttypes")]
        public IHttpActionResult UpdateAccountTypes([FromBody]AccountTypes m_accountTypes)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_accountTypesManager.ValidateAccountTypes(new AccountTypes
            {
                AccountType = m_accountTypes.AccountType,
                COAAccountTypeId = m_accountTypes.COAAccountTypeId
            });
            if (validationStatus == "Duplicate AccountType")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_accountTypesManager.UpdateAccountTypes(m_accountTypes);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);

        }

        [HttpDelete]
        [Route("api/coaaccounttypes/{COAAccountTypeId}")]
        public IHttpActionResult DeleteAccountTypes(int COAAccountTypeId)
        {
            var result = m_accountTypesManager.DeleteAccountTypes(COAAccountTypeId);
            return Ok(result);
        }






    }
}
