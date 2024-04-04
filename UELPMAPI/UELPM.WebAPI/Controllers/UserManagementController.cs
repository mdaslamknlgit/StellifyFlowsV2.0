using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;
using UELPM.Service.Repositories;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class UserManagementController : ApiController
    {
        private readonly IUserManagementManager m_userManagementManager;
        public UserManagementController(IUserManagementManager userManagementManager)
        {
            m_userManagementManager = userManagementManager;

        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/users")]
        public IHttpActionResult GetUserManagement([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_userManagementManager.GetUserManagement(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/users/GetReportingUsers/{CompanyId}")]
        public IHttpActionResult GetReportingUsers(int CompanyId)
        {

            List<FlatObject> flatObjects = new List<FlatObject>();
            List<RecursiveObject> RecursiveObjectLst = new List<RecursiveObject>();

            IEnumerable<UserProfile> ReportingUserList = null;

            ReportingUserList = m_userManagementManager.GetReportingUsers(CompanyId);


            foreach (UserProfile usr in ReportingUserList.ToList())
            {
                FlatObject FlatObjectInfo = new FlatObject(usr.UserName, usr.UserID, usr.ManagerId);

                //FlatObjectInfo.Data = usr.UserName;
                FlatObjectInfo.Data = usr.FirstName + ' '+ usr.LastName;
                FlatObjectInfo.Id = usr.UserID;
                FlatObjectInfo.ParentId = usr.ManagerId;

                if(usr.ManagerId>0)
                {
                    var BreakHere = "Break Here";
                }

                flatObjects.Add(FlatObjectInfo);
            }
            RecursiveObjectLst = Helpers.FillRecursive(flatObjects, 0);


            var mm = Json(RecursiveObjectLst);
            Helpers.Info(typeof(LeadsController).ToString(), "GetReportingUsers", "Done " + DateTime.Now.ToString());

            //return Json(RecursiveObjectLst);


            return Ok(RecursiveObjectLst);
        }




        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/users/{userId}")]
        public IHttpActionResult GetUserDetails(int userId)
        {
            var result = m_userManagementManager.GetUserDetails(userId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetUserName")]
        public IHttpActionResult GetUsers(string searchKey)
        {
            var result = m_userManagementManager.GetUsers(searchKey);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/users")]
        public IHttpActionResult CreateUserManagement([FromBody]UserManagement m_userManagement)
        {
            ResponseStatus statusObj = new ResponseStatus();
            //string validationStatus = m_userManagementManager.ValidateUserManagement(new ValidateUserManagement
            //{
            //    UserId = m_userManagement.UserID
            //});
            //if (validationStatus == "Duplicate UserId")
            //{
            //    statusObj.Status = validationStatus;
            //}
            //else
            //{
            var result = m_userManagementManager.CreateUserManagement(m_userManagement);
            statusObj.Status = result;
            statusObj.Value = result;
            // }
            return Ok(statusObj);
        }

        [HttpPut]
        [Route("api/users")]
        public IHttpActionResult UpdateUserManagement(UserManagement m_userManagement)
        {
            ResponseStatus statusObj = new ResponseStatus();
            //string validationStatus = m_userManagementManager.ValidateUserManagement(new ValidateUserManagement
            //{
            //    UserId = m_userManagement.UserId
            //});
            //if (validationStatus == "Duplicate UserId")
            //{
            //    statusObj.Status = validationStatus;
            //}
            //else
            //{
            var result = m_userManagementManager.UpdateUserManagement(m_userManagement);
            statusObj.Status = result;
            statusObj.Value = result;
            //}
            return Ok(statusObj);

        }

        [HttpPut]
        [Route("api/changepassword")]
        public IHttpActionResult ChangePassword(UserManagement m_userManagement)
        {
            var result = m_userManagementManager.ChangePassword(m_userManagement);
            
            return Ok(result);

        }

        [HttpDelete]
        [Route("api/users/{userId}")]
        public IHttpActionResult DeleteUserManagement(int userId)
        {
            var result = m_userManagementManager.DeleteUserManagement(userId);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/users/Filter")]
        public IHttpActionResult GetFilterQuotationRequest([FromUri] UserManagementFilterDisplayInput userManagementFilterDisplayInput)
        {
            try
            {
                var result = m_userManagementManager.GetFilterUserManagement(userManagementFilterDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        [HttpGet]
        [Route("api/CheckUserName")]
        public IHttpActionResult CheckUserCount(string searchKey)
        {
            var result = m_userManagementManager.CheckUserCount(searchKey);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/reset")]
        public IHttpActionResult ResetPassword(string emailId,string userName)
        {
            var result = m_userManagementManager.ResetPassword(emailId, userName);
            return Ok(result);
        }
        [HttpGet]
        [Route("api/LDAPUserProfile")]
        public bool LDAPUserProfile()
        {
            AuditLog.Info("LDAPUserProfile", "Get", "", "", "ImportLDAPUserProfile", "Method Is Hitting",0);
            ILDAPUserProfile oldap = new LDAPUserProfileRepository();
            LDAPWrapper obj = new LDAPWrapper(oldap);
            return true;
        }
        
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetisShowUserNames")]
        public IHttpActionResult GetisShowUserNames(string searchKey)
        {
            var result = m_userManagementManager.GetisShowUserNames(searchKey);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetAllUserNames")]
        public IHttpActionResult GetAllUserNames(string searchKey)
        {
            var result = m_userManagementManager.GetAllUserNames(searchKey);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SaveUserName")]
        public IHttpActionResult SaveUserName(int userId)
        {
            var result = m_userManagementManager.SaveUserName(userId);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/retainStructure")]
        public IHttpActionResult RetainStructure()
        {
            int userId = JsonConvert.DeserializeObject<int>(HttpContext.Current.Request.Form["userId"]);
            var result = m_userManagementManager.RetainStructure(userId);
            return Ok(result);

        }

    }
      
}
