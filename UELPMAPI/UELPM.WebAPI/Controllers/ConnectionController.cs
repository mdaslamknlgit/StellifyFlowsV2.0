using Newtonsoft.Json;
using System;
using System.IO;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ConnectionController : ApiController
    {
        private readonly IConnectionManager m_connectionManager;
        private readonly UserInfo MyUserInfo = new UserInfo();

        public ConnectionController(IConnectionManager listManager)
        {
            m_connectionManager = listManager;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/getlist")]
        public IHttpActionResult GetList()
        {
            var result = m_connectionManager.GetList(MyUserInfo);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/SearchList")]
        public IHttpActionResult SearchList([FromUri] ListSearch listSearch )
        {
            //var result = m_contractPurchaseOrderManager.GetContractPurchaseOrders(purchaseOrderInput);
            //return Ok(result);
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

                // List<LeadDTOList> MyLeadDtoList = null;
                ListResult listResult  = null;

                MyUserInfo.UserId = listSearch.UserId;
                MyUserInfo.UsersIds = listSearch.UserId.ToString();


                listResult = m_connectionManager.SearchConnections(MyUserInfo, listSearch);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(listResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsList", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/GetListInfo/{Id}/{CompanyId}")]
        public IHttpActionResult GetListInfo(int Id,int CompanyId)
        {
            MyUserInfo.CompanyId = CompanyId;
            var result = m_connectionManager.GetListInfo(Id,MyUserInfo);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/GetListDetails/{Id}/{CompanyId}")]
        public IHttpActionResult GetListDetails(int Id, int CompanyId)
        {
            MyUserInfo.CompanyId = CompanyId;
            var result = m_connectionManager.GetListDetails(Id, MyUserInfo);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/getalllist")]
        public IHttpActionResult GetAllList()
        {
            var result = m_connectionManager.GetAllList();
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/GetConnectionWithDetails")]
        public IHttpActionResult GetConnectionWithDetails()
        {
            var result = m_connectionManager.GetListWithEmailDetails(MyUserInfo);
            return Ok(result);
            
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/connection/GetMarketingListWithDetailsByListId/{ListId}")]
        public IHttpActionResult GetMarketingListWithDetailsByListId(int ListId)
        {
            var result = m_connectionManager.GetMarketingListWithDetailsByListId(ListId, MyUserInfo);
            return Ok(result);

        }

        [Route("api/connection/CreateList")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult CreateList(MarketingListDTO listDTO)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //    BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //    MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //    MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //    MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //    MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //    MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;

                MyUserInfo.UserId = listDTO.UserId;
                MyUserInfo.CompanyId = listDTO.CompanyId;

                ResultReponse resultReponse = new ResultReponse();
                Helpers.Info(typeof(ContactsController).ToString(), "CreateList", "Started " + DateTime.Now.ToString());
                resultReponse = m_connectionManager.CreateList(listDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "CreateList", "Done " + DateTime.Now.ToString());
                MyResultReponse = resultReponse;
                //if (resultReponse.Status == "ERROR")
                //{

                //    MyResultReponse.Status = "EXISTS";
                //    MyResultReponse.StatusCode = "EXISTS";
                //    MyResultReponse.Message = resultReponse.Message;
                //    MyResultReponse.Data = resultReponse.Data.ToString();
                //}
                //else
                //{
                //    MyResultReponse.Status = "SUCCESS";
                //    MyResultReponse.StatusCode = "SUCCESS";
                //    MyResultReponse.Message = "Account Created Successfully ";
                //    MyResultReponse.Data = resultReponse.Data.ToString();
                //}

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ContactsController).ToString(), "CreateList", Ex.ToString());
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator ";
                MyResultReponse.Message = MyResultReponse.Message + "   " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [Route("api/connection/UpdateList")]
        [CacheControl(MaxAge = 0)]
        [HttpPost]
        public IHttpActionResult UpdateList(MarketingListDTO listDTO)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //    BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //    MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //    MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //    MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //    MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //    MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                MyUserInfo.UserId = listDTO.UserId;
                MyUserInfo.CompanyId = listDTO.CompanyId;

                ResultReponse resultReponse = new ResultReponse();
                Helpers.Info(typeof(ContactsController).ToString(), "UpdateList", "Started " + DateTime.Now.ToString());
                resultReponse = m_connectionManager.UpdateList(listDTO, MyUserInfo);
                Helpers.Info(typeof(ContactsController).ToString(), "UpdateList", "Done " + DateTime.Now.ToString());

                MyResultReponse = resultReponse;
                //if (resultReponse.Status == "ERROR")
                //{

                //    MyResultReponse.Status = "EXISTS";
                //    MyResultReponse.StatusCode = "EXISTS";
                //    MyResultReponse.Message = resultReponse.Message;
                //    MyResultReponse.Data = resultReponse.Data.ToString();
                //}
                //else
                //{
                //    MyResultReponse.Status = "SUCCESS";
                //    MyResultReponse.StatusCode = "SUCCESS";
                //    MyResultReponse.Message = "List Updated Successfully ";
                //    MyResultReponse.Data = resultReponse.Data.ToString();
                //}

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(ContactsController).ToString(), "UpdateList", Ex.ToString());
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator ";
                MyResultReponse.Message = MyResultReponse.Message + "   " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }









    }
}
