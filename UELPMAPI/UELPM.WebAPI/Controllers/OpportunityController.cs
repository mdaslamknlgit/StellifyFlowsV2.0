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
    public class OpportunityController : ApiController
    {
        private readonly IOpportunityManager m_IOpportunityManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        public OpportunityController(IOpportunityManager opportunityManager)
        {
            //MyUserInfo = SetUserInfo();
            m_IOpportunityManager = opportunityManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/opportunity/SearchOpportunity")]
        public IHttpActionResult SearchOpportunity([FromUri] SearchOpportunity searchOpportunity)
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

                MyUserInfo.UserId = searchOpportunity.UserId;
                MyUserInfo.UsersIds = searchOpportunity.UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                OpportunityResult opportunityResult = null;
                opportunityResult = m_IOpportunityManager.SearchOpportunity(MyUserInfo, searchOpportunity);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(opportunityResult);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/opportunity/GetOpportunityList/{TypeId}/{UserId}")]
        public IHttpActionResult GetOpportunityList(int TypeId,int UserId)
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

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<OpportunityDTO> opportunityDTOs = null;
                opportunityDTOs = m_IOpportunityManager.GetOpportunityList(TypeId, MyUserInfo).ToList();


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(opportunityDTOs);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetOpportunityList", Ex.ToString());
            }
            return null;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/opportunity/GetOpportunityInfo/{Id}/{UserId}")]
        public IHttpActionResult GetOpportunityInfo(int Id,int UserId)
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

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                OpportunityDTO opportunityDTO = null;
                opportunityDTO = m_IOpportunityManager.GetOpportunityInfo(Id,MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(opportunityDTO);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetContactList", Ex.ToString());
            }
            return null;
        }

        [HttpPost, Route("api/opportunity/CreateOpportunity")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CreateOpportunity(OpportunityDTO MyOpportunityInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                // MyUserInfo.UserId = UserId;

                // int returnValue = 0;

                MyUserInfo.UserId = MyOpportunityInfo.CreatedBy;
                MyUserInfo.UsersIds = MyOpportunityInfo.CreatedBy.ToString();


                Helpers.Info(typeof(LeadsController).ToString(), "CreateOpportunity", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IOpportunityManager.CreateOpportunity(MyOpportunityInfo, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "CreateOpportunity", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "CreateOpportunity", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting Opportunity administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpPost, Route("api/opportunity/UpdateOpportunity")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateOpportunity(OpportunityDTO MyOpportunityInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                // MyUserInfo.UserId = UserId;

                // int returnValue = 0;

                MyUserInfo.UserId = MyOpportunityInfo.UpdatedBy;
                MyUserInfo.UsersIds = MyOpportunityInfo.UpdatedBy.ToString();


                Helpers.Info(typeof(LeadsController).ToString(), "UpdateOpportunity", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_IOpportunityManager.UpdateOpportunity(MyOpportunityInfo, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateOpportunity", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "UpdateOpportunity", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while Updating Opportunity";
                MyResultReponse.Data = "0";
                MyResultReponse.ErrorMessage = Ex.ToString();
            }
            return Json(MyResultReponse);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/opportunity/GetOpportunityDetails/{Id}/{UserId}")]
        public IHttpActionResult GetOpportunityDetails(int Id, int UserId)
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

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                OpportunityDTO opportunityDTO = null;
                opportunityDTO = m_IOpportunityManager.GetOpportunityDetails(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(opportunityDTO);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetOpportunityDetails", Ex.ToString());
            }
            return null;
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/opportunity/GetProbabilityDomainItem")]
        public IHttpActionResult GetProbabilityDomainItem()
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

                //MyUserInfo.UserId = UserId;
                //MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;

                IEnumerable<ProbabilityDomainItem> probabilityDomainItems  = null;
                probabilityDomainItems = m_IOpportunityManager.GetProbabilityDomainItem(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(probabilityDomainItems);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetProbabilityDomainItem", Ex.ToString());
            }
            return null;
        }


        [HttpPost, Route("api/opportunity/AddOpportunityProducts")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult AddOpportunityProducts(OpportunityProductsInput opportunityProductsInput)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            OpportunityProductResults opportunityProductResults = new OpportunityProductResults();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                //MyUserInfo.TenantId = TenantId;
                // MyUserInfo.UserId = UserId;

                // int returnValue = 0;

                if(opportunityProductsInput!=null)
                {
                    MyUserInfo.UserId = opportunityProductsInput.CreatedBy;
                    MyUserInfo.UsersIds = opportunityProductsInput.CreatedBy.ToString();
                }

                if(opportunityProductsInput.opportunityProductsDTOs==null)
                {
                    Helpers.ErrorLog(typeof(LeadsController).ToString(), "AddOpportunityProducts","ERROR");
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Error Occured while inserting Opportunity administrator";
                    MyResultReponse.Data = "0";


                    return Json(opportunityProductResults);
                }

                Helpers.Info(typeof(LeadsController).ToString(), "AddOpportunityProducts", "Started " + DateTime.Now.ToString());
                opportunityProductResults = m_IOpportunityManager.AddOpportunityProducts(opportunityProductsInput, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "AddOpportunityProducts", "Done " + DateTime.Now.ToString());

                return Json(opportunityProductResults);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "AddOpportunityProducts", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting Opportunity administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }



        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/opportunity/GetOpportunityProductsDetailsList/{OpportunityId}/{UserId}")]
        public IHttpActionResult GetOpportunityProductsDetailsList(int OpportunityId, int UserId)
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

                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                // List<LeadDTOList> MyLeadDtoList = null;
                OpportunityProductsDetailsList opportunityProductsDetailsList  = null;
                opportunityProductsDetailsList = m_IOpportunityManager.GetOpportunityProductsDetailsList(OpportunityId,MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(opportunityProductsDetailsList);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetOpportunityProductsDetailsList", Ex.ToString());
            }
            return null;
        }



    }
}
