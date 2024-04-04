using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;

using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Script.Serialization;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Authentication
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple =false,Inherited =true)]
    public class BasicAuthentication : AuthorizationFilterAttribute
    {
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            var provider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(typeof(IUserManagementManager)) as IUserManagementManager;

            // private readonly IUserProfileManager m_userprofileManager;
            var UserProfileProvider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(typeof(IUserProfileManager)) as IUserProfileManager;
            //var CurrencyProvider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(typeof(ICurrencyBusiness)) as ICurrencyBusiness;
            //var EmailSetupProvider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(typeof(ICheckItemsBusiness)) as ICheckItemsBusiness;

            int CreditUsage = 0;
            bool EmailSetupFinish = false;

            //UserManagement MyUserInfo = null;

            //UserInfo MyUserInfo = null;

            //UserManagement MyUserInfo = null;
            UserProfile MyUserInfo = null;

            string StellifyFlowsAuthToken = "";
            var tokenEntities = new AuthUserDTO { };
            IEnumerable<AppSettingsDTO> MyAppSettings = null;
            IEnumerable<CurrencyDTO> BaseCurrencyList = null;
            CheckItem MyCheckItem = null;
            CurrencyDTO BaseCurrency = null;
            //Checking token in header if exists will go for token validation else go for username password validation
            HttpRequestHeaders headers = actionContext.Request.Headers;
            if (headers.Contains("StellifyFlowsAuthToken"))
            {
                StellifyFlowsAuthToken = headers.GetValues("StellifyFlowsAuthToken").First();
                //validating token with data base
                MyUserInfo = Helpers.ValidateToken(StellifyFlowsAuthToken, actionContext);

                UserProfileProvider.TokenValidation(MyUserInfo.UserName, MyUserInfo.UserID);

                if (MyUserInfo != null)
                {
                    //MyAppSettings = provider.GetAppSettings(MyUserInfo);
                    tokenEntities = new AuthUserDTO
                    {
                        UserName = MyUserInfo.UserName,
                        FirstName = MyUserInfo.FirstName,
                        LastName = MyUserInfo.LastName,
                        UsersIds = MyUserInfo.UserIds,

                        //UserEmail = MyUserInfo.userEmail,
                        //Email = MyUserInfo.Email,
                        //TenatId = MyUserInfo.TenantId,
                        //UserId = MyUserInfo.UserId,
                        //UsersIds = MyUserInfo.UsersIds,
                        //TenantName = MyUserInfo.TenantName,

                        access_token = StellifyFlowsAuthToken,
                        ExpiredDate = DateTime.Now.AddHours(1).ToString(),
                        GenerateDate = DateTime.Now.ToString(),
                        Modules = "",
                        // MyAppSettings = MyAppSettings
                    };

                    //BasicAuthenticationDTO _basicAuthIdentity = new BasicAuthenticationDTO(tokenEntities);
                    //var genericPrincipal = new GenericPrincipal(_basicAuthIdentity, null);
                    //Thread.CurrentPrincipal = genericPrincipal;
                }
                else { actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "INVALIDTOKEN"); }
            }
            else
            {

                //SyncStatusDbService MySyncStatusDbService = null;
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                var request = actionContext.Request.Content.ReadAsStringAsync().Result;
                //UserInfo UsersInfo = js.Deserialize<UserInfo>(request);
                
                UserRequestInfo UsersInfo = js.Deserialize<UserRequestInfo>(request);

                bool SyncStatus = false;
                if (UsersInfo != null)
                {

                    var MyUserProfile = UserProfileProvider.ValidateUser(UsersInfo.UserName, UsersInfo.Password);

                    MyUserInfo = new UserProfile();
                    MyUserInfo.UserID = MyUserProfile.UserID;
                    MyUserInfo.EmailId = MyUserProfile.EmailId;
                    MyUserInfo.UserName = MyUserProfile.UserName;
                    MyUserInfo.UserIds = MyUserProfile.UserIds;
                    
                    //validating username and password with data base
                    //MyUserInfo = provider.Authenticate(UsersInfo.UserName, UsersInfo.Password);

                 }

                if (MyUserInfo != null)
                {
                    UserDTO mUserDTO = new UserDTO();
                    //mUserDTO.TenantId = MyUserInfo.TenantId;
                    mUserDTO.Email = MyUserInfo.EmailId;
                    mUserDTO.UserEmail = MyUserInfo.EmailId;
                    mUserDTO.Id = MyUserInfo.UserID;
                    mUserDTO.UserName = MyUserInfo.UserName;
                    mUserDTO.FirstName = MyUserInfo.FirstName;
                    mUserDTO.LastName = MyUserInfo.LastName;

                    mUserDTO.UsersIds = MyUserInfo.UserIds;
                    mUserDTO.DatabaseName = "Empty";


                    //Generating token Based on above parameters
                    string Token = Helpers.GenerateToken(mUserDTO);
                    //AppSettingsDTO MyAppSettings
                    tokenEntities = new AuthUserDTO
                    {
                        FirstName = MyUserInfo.FirstName,
                        LastName = MyUserInfo.LastName,
                        UserName = MyUserInfo.UserName,

                        UserEmail = MyUserInfo.EmailId,
                        Email = MyUserInfo.EmailId,

                        access_token = Token,
                        ExpiredDate = DateTime.Now.AddHours(1).ToString(),
                        GenerateDate = DateTime.Now.ToString(),
                        Modules = "",
                        IsBackgroundProcess = SyncStatus,
                        MyAppSettings = MyAppSettings,
                        BaseCurrency = BaseCurrency,
                        IsEmailSetupFinish = EmailSetupFinish,
                        CreditUsage = CreditUsage,
                        UsersIds= MyUserInfo.UserIds,
                        DatabaseName="Empty"
                       
                    };

                    //BasicAuthenticationDTO _basicAuthIdentity = new BasicAuthenticationDTO(tokenEntities);
                    //var genericPrincipal = new GenericPrincipal(_basicAuthIdentity, null);
                    //Thread.CurrentPrincipal = genericPrincipal;

                    //_basicAuthIdentity.UserName = MyUserInfo.UserName;
                    //_basicAuthIdentity.UserEmail = UsersInfo.Email;
                    //_basicAuthIdentity.TenatId = MyUserInfo.TenantId;
                    //_basicAuthIdentity.UserId = MyUserInfo.UserId;
                    //_basicAuthIdentity.SubscriptionInDays = MyUserInfo.SubscriptionId;
                    //_basicAuthIdentity.BoundHoundAuthToken = Token;
                    //_basicAuthIdentity.ExpiredDate = DateTime.Now.AddHours(1).ToString();
                    //_basicAuthIdentity.GenerateDate = DateTime.Now.ToString();
                    //_basicAuthIdentity.Modules = "";
                }
                else
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "INVALIDUSER");
                }

            }


            BasicAuthenticationDTO _basicAuthIdentity = new BasicAuthenticationDTO(tokenEntities);
            var genericPrincipal = new GenericPrincipal(_basicAuthIdentity, null);
            Thread.CurrentPrincipal = genericPrincipal;


            //  base.OnAuthorization(actionContext);
        }

    }
}