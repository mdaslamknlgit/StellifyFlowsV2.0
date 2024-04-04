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
    public class AppViewsController : ApiController
    {
        private readonly IAppViewsManager m_IAppViewsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        //private readonly IProbabilityBusiness m_IProbabilityBusiness;

        public AppViewsController(IAppViewsManager appViewsManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IAppViewsManager = appViewsManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/appviews/SearchAppViews")]
        public IHttpActionResult SearchAppViews([FromUri] AppViewsSearch appViewsSearch)
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
                AppViewsResult appViewsResult = null;

                MyUserInfo.UserId = appViewsSearch.UserId;
                MyUserInfo.UsersIds = appViewsSearch.UserId.ToString();


                appViewsResult = m_IAppViewsManager.SearchAppViews(appViewsSearch, MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(appViewsResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsList", Ex.ToString());
            }
            return null;
        }





    }
}
