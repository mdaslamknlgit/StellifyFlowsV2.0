using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Security;
using UELPM.Model;
using UELPM.WebAPI.Authentication;

namespace UELPM.WebAPI.Base
{
 
    [BasicAuthentication]
    public class ApiControllerBase : ApiController
    {
      

        private readonly UserInfo _MyUserInfo = new UserInfo();

        public UserInfo SetUserInfo()
        {
            //_MyUserInfo.Email = ConfigurationManager.AppSettings["LinkedEmail"].ToString();
            //_MyUserInfo.Password = ConfigurationManager.AppSettings["LinkedPassword"].ToString();
            //_MyUserInfo.FromUserEmail = ConfigurationManager.AppSettings["FromUserEmail"].ToString();
            //_MyUserInfo.FromPassword = ConfigurationManager.AppSettings["FromPassword"].ToString();


            //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

            //_MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
            //_MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
            //_MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
            //_MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
            //_MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
            //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

            return _MyUserInfo;
        }


    }
}