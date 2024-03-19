using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;


namespace UELPM.WebAPI.Controllers
{
    public class AccountsController : ApiController
    {
        private readonly IAccountsManager m_IAccountsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public AccountsController(IAccountsManager accountsManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IAccountsManager = accountsManager;

            //TODO Remove Once Token Implemented
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/SearchAccounts")]
        public IHttpActionResult SearchAccounts([FromUri] SearchAccounts searchAccounts)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                MyUserInfo.UserId = searchAccounts.UserId;
                MyUserInfo.UsersIds = searchAccounts.UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                AccountsResult accountsResult = null;
                accountsResult = m_IAccountsManager.SearchAccounts(MyUserInfo, searchAccounts);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountsResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/SearchAccountsWithViews/{ModuleId}/{FormId}/{ViewId}")]
        public IHttpActionResult SearchAccountsWithViews(int ModuleId, int FormId, int ViewId, [FromUri] SearchAccounts searchAccounts)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                MyUserInfo.UserId = searchAccounts.UserId;
                MyUserInfo.UsersIds = searchAccounts.UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                AccountsResult accountsResult = null;
                accountsResult = m_IAccountsManager.SearchAccountsWithViews(ModuleId,FormId,ViewId, MyUserInfo, searchAccounts);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountsResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetAllAccounts/{UserId}")]
        public IHttpActionResult GetAllAccounts(int UserId)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                AccountsResult accountsResult  = null;
                accountsResult = m_IAccountsManager.GetAllAccounts(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountsResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetAccountById/{Id}/{UserId}")]
        public IHttpActionResult GetAccountById(int Id,int UserId)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                AccountsDTO accountsDTO = null;
                accountsDTO = m_IAccountsManager.GetAccountById(Id,MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountsDTO);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetAccountsDomainItem")]
        public IHttpActionResult GetAccountsDomainItem()
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                IEnumerable<AccountsDomainItem> accountsDomainItems  = null;
                accountsDomainItems = m_IAccountsManager.GetAccountsDomainItem(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountsDomainItems);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetAccountsDomainList")]
        public IHttpActionResult GetAccountsDomainList()
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                IEnumerable<AccountsDomainList> accountsDomainLists  = null;
                accountsDomainLists = m_IAccountsManager.GetAccountsDomainList(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountsDomainLists);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetAccountsDomainList", Ex.ToString());
            }
            return null;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetContactsByAccount")]
        public IHttpActionResult GetContactsByAccount()
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                IEnumerable<Account> accountslist = null;
                accountslist = m_IAccountsManager.GetContactsByAccount(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(accountslist);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactsByAccount", Ex.ToString());
            }
            return null;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetContactsByAccounts")]
        public IHttpActionResult GetContactsByAccounts([FromUri] string SearchTerm)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                IEnumerable<ContactsAccountsList> contactsAccountsLists  = null;
                contactsAccountsLists = m_IAccountsManager.GetContactsByAccounts(SearchTerm,MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(contactsAccountsLists);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetContactsByAccounts", Ex.ToString());
            }
            return null;
        }




        [Route("api/accounts/CreateAccount")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult CreateAccount(AccountsDTO accountsDTO)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //    BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //    MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //    MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //    MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //    MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //    MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;


                MyUserInfo.UserId = accountsDTO.CreatedBy.Value;


                ResultReponse resultReponse = new ResultReponse();
                Helpers.Info(typeof(ContactsController).ToString(), "CreateAccount", "Started " + DateTime.Now.ToString());
                resultReponse = m_IAccountsManager.CreateAccount(accountsDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "CreateAccount", "Done " + DateTime.Now.ToString());
                if (resultReponse.Status == "ERROR")
                {

                    MyResultReponse.Status = "EXISTS";
                    MyResultReponse.StatusCode = "EXISTS";
                    MyResultReponse.Message = resultReponse.Message;
                    MyResultReponse.Data = resultReponse.Data.ToString();
                }
                else
                {
                    MyResultReponse.Status = "SUCCESS";
                    MyResultReponse.StatusCode = "SUCCESS";
                    MyResultReponse.Message = "Account Created Successfully ";
                    MyResultReponse.Data = resultReponse.Data.ToString();
                }
                
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ContactsController).ToString(), "CreateAccount", Ex.ToString());
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator ";
                MyResultReponse.Message = MyResultReponse.Message + "   " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [Route("api/accounts/UpdateAccount")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult UpdateAccount(AccountsDTO accountsDTO)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //    BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //    MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //    MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //    MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //    MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //    MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

                ResultReponse resultReponse = new ResultReponse();
                Helpers.Info(typeof(ContactsController).ToString(), "UpdateAccount", "Started " + DateTime.Now.ToString());
                resultReponse = m_IAccountsManager.UpdateAccount(accountsDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "UpdateAccount", "Done " + DateTime.Now.ToString());
                MyResultReponse = resultReponse;
                //if (resultReponse.Status == "ERROR")
                //{

                //    MyResultReponse.Status = "EXISTS";
                //    MyResultReponse.StatusCode = "EXISTS";
                //    MyResultReponse.Message = resultReponse.Message;
                //    MyResultReponse.Data = resultReponse.Data.ToString();
                //}
                //else
                //{
                //    MyResultReponse.Status = "SUCCESS";
                //    MyResultReponse.StatusCode = "SUCCESS";
                //    MyResultReponse.Message = "Account Updated Successfully ";
                //    MyResultReponse.Data = resultReponse.Data.ToString();
                //}

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ContactsController).ToString(), "UpdateAccount", Ex.ToString());
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator ";
                MyResultReponse.Message = MyResultReponse.Message + "   " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/accounts/GetIndustryDomainItem")]
        public IHttpActionResult GetIndustryDomainItem()
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                IEnumerable<IndustryDomainItem> industryDomainItems = null;
                industryDomainItems = m_IAccountsManager.GetIndustryDomainItem(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(industryDomainItems);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(AccountsController).ToString(), "GetIndustryDomainItem", Ex.ToString());
            }
            return null;
        }


    }
}
