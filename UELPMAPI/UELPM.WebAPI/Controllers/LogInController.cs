using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.WebAPI.Authentication;
using UELPM.WebAPI.Base;
using UELPM.WebAPI.Filters;


namespace UELPM.WebAPI.Controllers
{
    public class LogInController : ApiControllerBase
    {
        private readonly IAccountsManager m_IAccountsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public LogInController(IAccountsManager accountsManager)
        {
            MyUserInfo = SetUserInfo();
            m_IAccountsManager = accountsManager;

            //TODO Remove Once Token Implemented
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [BasicAuthentication]
        [HttpPost, Route("api/login/authenticate")]
        public IHttpActionResult Authenticate()
        {

            try
            {
                BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;
                //  return Json(tokenEntities);
                return Content(HttpStatusCode.OK, _basicAuthIdentity._AuthUserDTO);
            }
            catch (Exception Ex)
            { 
                Helpers.ErrorLog(typeof(LogInController).ToString(), "Authenticate", Ex.ToString()); 
            }
            return null;
        }

    }
}
