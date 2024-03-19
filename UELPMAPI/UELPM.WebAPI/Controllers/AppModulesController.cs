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
    public class AppModulesController : ApiController
    {

        private readonly ILeadsManager m_ILeadsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public AppModulesController(ILeadsManager leadsManager)
        {
            //MyUserInfo = SetUserInfo();
            m_ILeadsManager = leadsManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }





    }
}
