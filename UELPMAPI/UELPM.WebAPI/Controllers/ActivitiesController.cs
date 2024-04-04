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
    public class ActivitiesController : ApiController
    {
        private readonly IActivityManager m_IActivityManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        //private readonly IProbabilityBusiness m_IProbabilityBusiness;

        //public ActivitiesController(ILeadsManager  leadsManager  IProbabilityBusiness mIProbabilityBusiness)
        //{
        //    //MyUserInfo = SetUserInfo();
        //    m_ILeadsManager = leadsManager;
        //    //m_IProbabilityBusiness = mIProbabilityBusiness;
        //}
        public ActivitiesController(IActivityManager activityManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IActivityManager = activityManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/activity/SearchActivities")]
        public IHttpActionResult SearchActivities([FromUri] ActivitySearch activitySearch)
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
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                // List<LeadDTOList> MyLeadDtoList = null;
                ActivityResults MyActivityResult = null;

                MyUserInfo.UserId = activitySearch.UserId;
                MyUserInfo.UsersIds = activitySearch.UserId.ToString();


                MyActivityResult = m_IActivityManager.SearchActivities(MyUserInfo, activitySearch);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(MyActivityResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "GetLeadsList", Ex.ToString());
            }
            return null;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/activity/SearchActivities/{ModuleId}/{FormId}/{ViewId}")]
        public IHttpActionResult SearchActivities(int ModuleId, int FormId, int ViewId, [FromUri] ActivitySearch activitySearch)
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
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                // List<LeadDTOList> MyLeadDtoList = null;
                ActivityResults activityResults  = null;

                MyUserInfo.UserId = activitySearch.UserId;
                MyUserInfo.UsersIds = activitySearch.UserId.ToString();


                activityResults = m_IActivityManager.SearchActivities(ModuleId, FormId, ViewId, activitySearch, MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(activityResults);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "GetLeadsList", Ex.ToString());
            }
            return null;
        }

        [Route("api/activity/GetActivityById/{ActivityId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetActivityById(int ActivityId)
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

                ActivityInfo activityInfo  = null;
                activityInfo = m_IActivityManager.GetActivityById(ActivityId, MyUserInfo);
                return Json(activityInfo);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "GetLeadById", Ex.ToString());
            }
            return null;
        }

        [HttpPost, Route("api/activity/CreateActivity")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CreateActivity(ActivityInput activityDTO)
        {
            DateTime StartDate = DateTime.Now;
            DateTime EndDate = DateTime.Now;
            DateTime DueDate = DateTime.Now;

            string StartDateStr = "";
            string EndDateStr = "";
            string DueDateStr = "";

            string StartTime = "";
            string EndTime = "";
            string DueTime = "";

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
                // MyUserInfo.UserId = UserId;


                //Check Dates
                StartDate =Convert.ToDateTime(activityDTO.StartDate);
                EndDate = Convert.ToDateTime(activityDTO.EndDate);
                DueDate = Convert.ToDateTime(activityDTO.DueDate);

                StartDateStr = activityDTO.StartDate.ToString();
                EndDateStr = activityDTO.EndDate.ToString();
                DueDateStr = activityDTO.DueDate.ToString();

                StartTime = activityDTO.StartTime;
                EndTime = activityDTO.EndTime;
                DueTime = activityDTO.DueTime;

                var mStartDate = StartDateStr + ' ' + StartTime;
                var mEndDate = EndDateStr + ' ' + EndTime;
                var mDueDate = DueDateStr + ' ' + DueTime;

                // int returnValue = 0;
                Helpers.Info(typeof(ActivitiesController).ToString(), "CreateActivity", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IActivityManager.CreateActivity(MyUserInfo,activityDTO);
                Helpers.Info(typeof(ActivitiesController).ToString(), "CreateActivity", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "CreateActivity", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured While Creating Activity";
                MyResultReponse.ErrorMessage = Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/activity/UpdateActivity")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateLead(ActivityInput activityDTO)
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

                Helpers.Info(typeof(ActivitiesController).ToString(), "UpdateActivity", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IActivityManager.UpdateActivity( MyUserInfo, activityDTO);
                Helpers.Info(typeof(ActivitiesController).ToString(), "UpdateActivity", "Done " + DateTime.Now.ToString());

            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "UpdateActivity", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured While Updating Activity";
                MyResultReponse.ErrorMessage = Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpGet, Route("api/activity/GetActivityStatusDomainItem")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetActivityStatusDomainItem()
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

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<ActivityStatusDomainItem> RetActivityStatusDomainItem = m_IActivityManager.GetActivityStatusDomainItem(MyUserInfo);
                return Json(RetActivityStatusDomainItem);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "GetActivityStatusDomainItem", Ex.ToString());
            }
            return null;
        }

        

        [HttpGet, Route("api/activity/GetContactDomainItems")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetContactDomainItems()
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

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<ContactDomainItems> contactDomainItems  = m_IActivityManager.GetContactDomainItems(MyUserInfo);
                return Json(contactDomainItems);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ActivitiesController).ToString(), "GetContactDomainItems", Ex.ToString());
            }
            return null;
        }



    }
}
