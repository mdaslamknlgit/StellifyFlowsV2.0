using System;
using System.Collections.Generic;
using System.Configuration;
using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Repositories;
using UELPM.WebAPI.Extensions;
namespace UELPM.WebAPI.Controllers
{
    public class UserProfileController : ApiController
    {
        private readonly IUserProfileManager m_userprofileManager;
        

        public UserProfileController(IUserProfileManager userprofileManager)
        {
            m_userprofileManager = userprofileManager;
        }

        /// <summary>
        /// This method is used for getting all items
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/GetUser")]
        public IHttpActionResult GetUser()
        {
            var result = m_userprofileManager.GetUser();
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create item
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateUser")]
        public IHttpActionResult CreateUser(UserProfile user)
        {
            var result = m_userprofileManager.CreateUser(user);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to udpate item
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPost]
        [Route("api/UpdateUser")]
        public IHttpActionResult UpdateUser(UserProfile user)
        {
            var result = m_userprofileManager.UpdateUser(user);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Login")]
        public async Task<IHttpActionResult> Login([FromBody]UserProfile user)
        {
            HttpResponseMessage responseMsg = new HttpResponseMessage();
            UserProfile MyUserProfile = new UserProfile();
            int CompanyId = 0;
            try
            {                
                string server = ConfigurationManager.AppSettings["LDAP"];
                //bool result = IsAuthenticatedUser(server, user.UserName, user.Password);
                bool result = false;

                if (result == false)
                {
                    MyAuditLog.StartErrorText("Start");
                    //var profile = m_userprofileManager.ValidateUser(user.UserName, user.Password);
                    MyUserProfile = m_userprofileManager.ValidateUser(user.UserName, user.Password);
                    if (MyUserProfile != null)
                    {
                        CompanyId = (int) (MyUserProfile.CompanyId != null ? MyUserProfile.CompanyId : 0);
                        result = true;
                        m_userprofileManager.SetPasswordAtttempt(user.UserName);
                        MyAuditLog.SendErrorToText1("UserProfileController", "Login", user.UserName, "ValidateUser", "Validate User Successfully");
                    }
                    else
                    {
                        result = false;
                        m_userprofileManager.GetPasswordAtttempt(user.UserName);
                        MyAuditLog.SendErrorToText1("UserProfileController", "Login", user.UserName, "ValidateUser", "Validate User Successfully");
                    }
                    MyAuditLog.StartErrorText("End");
                }
           
                if (result)
                {
                    MyAuditLog.StartErrorText("Start");
                    //MyAuditLog.Info(typeof(UserProfileController).ToString(), "Login", "Started " + DateTime.Now.ToString());
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    UserProfile userProfile = userProfileRepository.GetRolebyUser(user.UserName);
                    CompanyId = (int) (userProfile.CompanyId != null ? userProfile.CompanyId : 0);
                    string responseString = string.Empty;
                    var request = HttpContext.Current.Request;
                    var tokenServiceUrl = request.Url.GetLeftPart(UriPartial.Authority) + request.ApplicationPath + "/token";
                   
                    using (var client = new HttpClient())
                    {
                        var requestParams = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("grant_type", "password"),
                        new KeyValuePair<string, string>("username",user.UserName),
                        new KeyValuePair<string, string>("password", user.Password)
                    };
                        MyAuditLog.SendErrorToText1("UserProfileController", "Login", user.UserName, "Token Creation", "Token Creation");

                        
                         string Token = Helpers.GenerateTokenS(MyUserProfile);

                        responseString = Token;
                        //var requestParamsFormUrlEncoded = new FormUrlEncodedContent(requestParams);
                        //var tokenServiceResponse = await client.PostAsync(tokenServiceUrl, requestParamsFormUrlEncoded);
                        //responseString = await tokenServiceResponse.Content.ReadAsStringAsync();
                        //var responseCode = tokenServiceResponse.StatusCode;
                        //responseMsg = new HttpResponseMessage()
                        //{
                        //    Content = new StringContent(responseString, Encoding.UTF8, "application/json"),

                        //};
                        //commented by sateesh on 27-03-2020 due to token generation failed.
                        MyAuditLog.StartErrorText("End");

                        //MyAuditLog.Info(enumModuleCodes.UserProfile.ToString(), enumAuditType.LoggedIn.ToString(), userProfile.UserID.ToString(), userProfile.UserID, "Login", "User " + user.UserName + " logged in at " + DateTime.Now.ToString());
                    }
                    AuditLog.Info(enumModuleCodes.UserProfile.ToString(), enumAuditType.LoggedIn.ToString(), userProfile.UserID.ToString(), userProfile.UserID.ToString(), "Login", "User " + user.UserName + " logged in at " + DateTime.Now.ToString(), CompanyId);

                    return Ok(new { status = true, userDetails = userProfile, tokenDetails = responseString });
                }

            }
            catch (Exception ex)
            {
                MyAuditLog.SendErrorToText1("UserProfileController", "Login", user.UserName, "Login", ex.Message);
                return Ok(new { status = false });
            }
            return Ok(new { status = false });
        }



        /// <summary>
        /// This method is used to delete item
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/DeleteUser/{id}")]
        public IHttpActionResult DeleteUser(int id)
        {
            var result = m_userprofileManager.DeleteUser(id);
            return Ok(result);
        }

        public bool IsAuthenticatedUser(string srvr, string usr, string password)
        {
            MyAuditLog.StartErrorText("Start");
            bool authenticated = false;
            DirectoryEntry entry = new DirectoryEntry(srvr, usr, password);
            try
            {
                try
                {
                    if (entry.NativeObject != null)
                    {
                        object nativeObject = entry.NativeObject;
                        authenticated = true;
                        MyAuditLog.SendErrorToText1("UserProfileController", "Login", usr, "AuthenticatedUser", "Active Directory User");
                    }
                }
                catch (Exception ex)
                {
                    authenticated = false;
                    MyAuditLog.SendErrorToText1("UserProfileController", "Login", usr, "AuthenticatedUser", "Non Active Directory User");
                    MyAuditLog.SendErrorToText1("UserProfileController", "Login", usr, "IsAuthenticatedUser", ex.Message);
                }  
            }
            catch (Exception ex)
            {
                MyAuditLog.SendErrorToText1("UserProfileController", "Login", usr, "AuthenticatedUser", ex.Message);
               
            }
            //Object obj = entry.NativeObject;
            MyAuditLog.StartErrorText("End");
            return authenticated;
        }

      
        [HttpGet]
        [Route("api/LogoffUser")]
        public IHttpActionResult LogOffUser(int Id)
        {
            if (m_userprofileManager.LogOffUser(Id))
            {
                return Ok("Successfully logged off user");
            }
            else
            {
                return Ok("Failed to logoff user");
            }
        }

        [HttpGet]
        [Route("api/getCompanyUsers")]
        public IHttpActionResult GetUsersByCompany([FromUri] UserSearch userSearch)
        {
            var result = m_userprofileManager.GetUsersByCompany(userSearch);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/getUsersByRole")]
        public IHttpActionResult GetUsersByRole([FromUri] UserSearch userSearch)
        {
            var result = m_userprofileManager.GetUsersByRole(userSearch);
            return Ok(result);
        }
    }
}
