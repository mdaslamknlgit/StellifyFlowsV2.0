using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;


namespace UELPM.WebAPI.Controllers
{
    public class DealsController : ApiController
    {
        private readonly IDealsManager m_IDealsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        //private readonly IProbabilityBusiness m_IProbabilityBusiness;


        public DealsController(IDealsManager dealsManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IDealsManager = dealsManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/deals/SearchDeals/{ModuleId}/{FormId}/{ViewId}")]
        public IHttpActionResult SearchDeals(int ModuleId, int FormId, int ViewId, [FromUri] DealsSearch dealsSearch)
        {
            //var result = m_contractPurchaseOrderManager.GetContractPurchaseOrders(purchaseOrderInput);
            //return Ok(result);
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

                DealsResult MyDealsResult = null;

                MyUserInfo.UserId = dealsSearch.UserId;
                MyUserInfo.UsersIds = dealsSearch.UserId.ToString();

                Helpers.Info(typeof(DealsController).ToString(), "SearchDeals", "Started " + DateTime.Now.ToString());
                MyDealsResult = m_IDealsManager.SearchDeals(ModuleId, FormId, ViewId, dealsSearch, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "SearchDeals", "End " + DateTime.Now.ToString());

                return Ok(MyDealsResult);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "SearchDeals", Ex.ToString());
            }
            return null;
        }



        [Route("api/deals/GetDealById/{DealId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetDealById(int DealId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                DealDTO DealDTOInfo = null;
                DealDTOInfo = m_IDealsManager.GetDealById(DealId, MyUserInfo);
                return Json(DealDTOInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(DealsController).ToString(), "GetDealById", Ex.ToString()); }
            return null;
        }



        [HttpGet, Route("api/deals/GetDealType")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetDealType()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;


                IEnumerable<DealTypeDomainItem> DealTypeDomainItemList = m_IDealsManager.GetDealTypeDomainItem(MyUserInfo);
                return Json(DealTypeDomainItemList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "GetDealType", Ex.ToString());
            }
            return null;
        }


        [HttpGet, Route("api/deals/GetDealStage")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetDealStage()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<DealStagesDTO> DealStagesDTOList = m_IDealsManager.GetDealStage(MyUserInfo);
                return Json(DealStagesDTOList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "GetDealStage", Ex.ToString());
            }
            return null;
        }


        [HttpPost, Route("api/deal/CreateDeal")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CreateDeal(DealForm dealForm  )
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                MyUserInfo.UserId = dealForm.CreatedBy;

                // int returnValue = 0;
                Helpers.Info(typeof(DealsController).ToString(), "CreateDeal", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IDealsManager.CreateDeal(dealForm, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "CreateDeal", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "CreateDeal", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/deal/UpdateDeal")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateDeal(DealForm dealForm )
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                MyUserInfo.UserId = dealForm.CreatedBy;

                Helpers.Info(typeof(DealsController).ToString(), "UpdateDeal", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IDealsManager.UpdateDeal(dealForm, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "UpdateDeal", "Done " + DateTime.Now.ToString());

            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "UpdateDeal", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured While Updating contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [Route("api/deals/GetContactsByAccountId/{AccountId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetContactsByAccountId(int AccountId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<ContactsAccountDetailsDTO> contactsAccountDetailsDTOs  = null;
                contactsAccountDetailsDTOs = m_IDealsManager.GetContactsByAccountId(AccountId, MyUserInfo);
                return Json(contactsAccountDetailsDTOs);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(DealsController).ToString(), "GetContactsByAccountId", Ex.ToString()); }
            return null;
        }

        [HttpPost, Route("api/deal/CreateQuickAccount")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CreateQuickAccount(QuickAccount quickAccount)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                MyUserInfo.UserId = quickAccount.CreatedBy;

                // int returnValue = 0;
                Helpers.Info(typeof(DealsController).ToString(), "CreateQuickAccount", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IDealsManager.CreateQuickAccount(quickAccount, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "CreateQuickAccount", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "Create Quick Account", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpPost, Route("api/deal/CreateQuickContact")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CreateQuickContact(QuickContact quickContact )
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                MyUserInfo.UserId = quickContact.CreatedBy;

                // int returnValue = 0;
                Helpers.Info(typeof(DealsController).ToString(), "CreateQuickContact", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IDealsManager.CreateQuickContact(quickContact, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "CreateQuickContact", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "Create Quick Contact", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/deal/CloseDeal")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CloseDeal(DealCloseForm dealCloseForm )
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                MyUserInfo.UserId = dealCloseForm.UserId;

                // int returnValue = 0;
                Helpers.Info(typeof(DealsController).ToString(), "CloseDeal", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IDealsManager.CloseDeal(dealCloseForm, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "CloseDeal", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "Close Deal", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [Route("api/deals/GetDealResonForLossDomainItems")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetDealResonForLossDomainItems()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<DealReasonForLossDTO> dealReasonForLossDTOs = null;

                Helpers.Info(typeof(DealsController).ToString(), "GetDealResonForLossDomainItems", "Started " + DateTime.Now.ToString());
                dealReasonForLossDTOs = m_IDealsManager.GetDealResonForLossDomainItems(MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "GetDealResonForLossDomainItems", "End " + DateTime.Now.ToString());

                return Json(dealReasonForLossDTOs);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "GetDealResonForLossDomainItems", Ex.ToString());
            }
            return null;
        }

        [Route("api/deals/GetDealResonForLossList")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetDealResonForLossList()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<DealReasonForLossDTO> dealReasonForLossDTOs   = null;

                Helpers.Info(typeof(DealsController).ToString(), "GetDealResonForLossList", "Started " + DateTime.Now.ToString());
                dealReasonForLossDTOs = m_IDealsManager.GetDealResonForLossList(MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "GetDealResonForLossList", "End " + DateTime.Now.ToString());
                
                return Json(dealReasonForLossDTOs);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(DealsController).ToString(), "GetDealResonForLossList", Ex.ToString());
            }
            return null;
        }


        [Route("api/deals/GetDealResonForLosById/{DealReasonId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetDealResonForLosById(int DealReasonId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                DealReasonForLossDTO dealReasonForLossDTO  = null;
                Helpers.Info(typeof(DealsController).ToString(), "GetDealResonForLosById", "Started " + DateTime.Now.ToString());
                dealReasonForLossDTO = m_IDealsManager.GetDealResonForLosById(DealReasonId, MyUserInfo);
                Helpers.Info(typeof(DealsController).ToString(), "GetDealResonForLosById", "End " + DateTime.Now.ToString());
                return Json(dealReasonForLossDTO);
            }
            catch (Exception Ex)
            { 
                Helpers.ErrorLog(typeof(DealsController).ToString(), "GetDealResonForLosById", Ex.ToString()); 
            }
            return null;
        }





    }
}
