using Newtonsoft.Json;
using StellifyFlows.Business.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ProducsController : ApiController
    {
        private readonly IProductsManager m_IProductsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public ProducsController(IProductsManager productsManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IProductsManager = productsManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/products/SearchProducts")]
        public IHttpActionResult SearchProducts([FromUri] SearchProducts searchProducts)
        {
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

                MyUserInfo.UserId = searchProducts.UserId;
                MyUserInfo.UsersIds = searchProducts.UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                ProductsListResult productsListResult  = null;
                productsListResult = m_IProductsManager.SearchProducts(MyUserInfo, searchProducts);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(productsListResult);
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
