using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.WebAPI.Authentication;
using UELPM.WebAPI.Base;

namespace UELPM.WebAPI.Controllers
{
    public class AuthenticationController : ApiControllerBase
    {
        private readonly IUserManagementManager m_IUserBusiness;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public AuthenticationController(IUserManagementManager muserBusiness)
        {
            MyUserInfo = SetUserInfo();
            m_IUserBusiness = muserBusiness;
        }

        [BasicAuthentication]
        [HttpPost, Route("api/authenticate")]
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
                Helpers.ErrorLog(typeof(AuthenticationController).ToString(), "Authenticate", Ex.ToString()); 
            }
            return null;
        }
    }
}
