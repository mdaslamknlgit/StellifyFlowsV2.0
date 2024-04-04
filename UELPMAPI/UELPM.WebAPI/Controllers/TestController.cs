using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.VisualBasic.FileIO;
using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.Service.ExcelUpload;
using UELPM.WebAPI.Base;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{

    public class TestController : ApiControllerBase
    {
        private readonly IContactsManager m_IContactsManager;
        private readonly IEntityImportManager m_IEntityImportManager;

        private readonly UserInfo MyUserInfo = new UserInfo();
        public TestController(IContactsManager contactsManager, IEntityImportManager entityImportManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IContactsManager = contactsManager;
            m_IEntityImportManager = entityImportManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/test/GetContactList/{UserId}")]
        public IHttpActionResult GetContactList(int UserId)
        {
            int ErrorList = 0;
            try
            {
                //ErrorLogDbService MyErrorLogDbService = null;

                BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyErrorLogDbService = new ErrorLogDbService(MyUserInfo);
                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList Start");

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                ContactsResults contactsResults = null;
                contactsResults = m_IContactsManager.GetContactList(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(contactsResults);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }
    }
}
