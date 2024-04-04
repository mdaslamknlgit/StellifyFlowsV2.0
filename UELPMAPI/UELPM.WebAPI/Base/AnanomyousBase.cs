using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Http;
using UELPM.Model;

namespace UELPM.WebAPI.Base
{
    public class AnanomyousBase : ApiController
    {


        private readonly UserInfo _MyUserInfo = new UserInfo();

        public UserInfo SetUserInfo()
        {
            _MyUserInfo.Email = ConfigurationManager.AppSettings["LinkedEmail"].ToString();
            _MyUserInfo.Password = ConfigurationManager.AppSettings["LinkedPassword"].ToString();
            _MyUserInfo.FromUserEmail = ConfigurationManager.AppSettings["FromUserEmail"].ToString();
            _MyUserInfo.FromPassword = ConfigurationManager.AppSettings["FromPassword"].ToString();

            return _MyUserInfo;
        }


    }
}