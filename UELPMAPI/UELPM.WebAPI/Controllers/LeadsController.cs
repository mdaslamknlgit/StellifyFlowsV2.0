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
    public class LeadsController : ApiController
    {

        private readonly ILeadsManager  m_ILeadsManager;
        private readonly UserInfo MyUserInfo = new UserInfo();
        //private readonly IProbabilityBusiness m_IProbabilityBusiness;

        //public LeadsController(ILeadsManager  leadsManager  IProbabilityBusiness mIProbabilityBusiness)
        //{
        //    //MyUserInfo = SetUserInfo();
        //    m_ILeadsManager = leadsManager;
        //    //m_IProbabilityBusiness = mIProbabilityBusiness;
        //}
        public LeadsController(ILeadsManager leadsManager )
        {
            //MyUserInfo = SetUserInfo();
            m_ILeadsManager = leadsManager;
            MyUserInfo.UserId = 649;
            MyUserInfo.UsersIds = "649";
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/leads/GetLeadsGroupByStages/{UserId}")]
        public IHttpActionResult GetLeadsGroupByStages(int UserId)
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
                LeadsInfoList MyLeadDtoList = m_ILeadsManager.GetLeadsGroupByStages(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(MyLeadDtoList);
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
        [Route("api/leads/GetLeadsByPagination")]
        public IHttpActionResult GetLeadsByPagination(int skip,int take,int UserId)
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

                // List<LeadDTOList> MyLeadDtoList = null;
                LeadsResult MyLeadsResult = null;
                MyUserInfo.UserId = UserId;
                MyUserInfo.UsersIds = UserId.ToString();
                MyLeadsResult = m_ILeadsManager.GetLeadsByPagination(skip,take,MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(MyLeadsResult);
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
        [Route("api/leads/GetLeadsList")]
        public IHttpActionResult GetLeadsList()
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

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo  = m_ILeadsManager.GetLeads(MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(MyLeadsInfo);
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
        [Route("api/leads/SearchLeads")]
        public IHttpActionResult SearchLeads([FromUri] LeadsSearch leadsSearchInput)
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
                LeadsResult MyLeadsResult = null;

                MyUserInfo.UserId = leadsSearchInput.UserId;
                MyUserInfo.UsersIds = leadsSearchInput.UserId.ToString();

                
                MyLeadsResult = m_ILeadsManager.SearchLeads(MyUserInfo, leadsSearchInput);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(MyLeadsResult);
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
        [Route("api/leads/SearchLeads/{ModuleId}/{FormId}/{ViewId}")]
        public IHttpActionResult SearchLeads(int ModuleId,int FormId,int ViewId,[FromUri] LeadsSearch leadsSearchInput)
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
                LeadsResult MyLeadsResult = null;

                MyUserInfo.UserId = leadsSearchInput.UserId;
                MyUserInfo.UsersIds = leadsSearchInput.UserId.ToString();


                MyLeadsResult = m_ILeadsManager.SearchLeads(ModuleId,FormId, ViewId, leadsSearchInput, MyUserInfo);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(MyLeadsResult);
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
        [Route("api/leads/SearchLeadNames")]
        public IHttpActionResult SearchLeadNames([FromUri] LeadsSearch leadsSearchInput)
        {
            //try
            //{
            //    var result = m_sharedManager.GetAllSuppliers(searchKey, supplierTypeId, companyId);
            //    return Ok(result);
            //}
            //catch (Exception e)
            //{
            //    throw e;
            //}
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
                //List<LeadNames> leadNames = new List<LeadNames>();
                var result = m_ILeadsManager.SearchLeadNames(MyUserInfo, leadsSearchInput);


                //ErrorList = MyErrorLogDbService.SaveLog("GetLeadList End");
                return Ok(result);
                //return Json(MyLeadDtoList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsList", Ex.ToString());
            }
            return null;
        }

        [HttpGet, Route("api/leads/GetLeadSource")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadSource()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<LeadSourceDTO> LeadSourceList = m_ILeadsManager.GetLeadSource(MyUserInfo);
                return Json(LeadSourceList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadSource", Ex.ToString());
            }
            return null;
        }


        [HttpGet, Route("api/leads/GetSalutation")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetSalutation()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<SalutationDTO> SalutationList = m_ILeadsManager.GetSalutation(MyUserInfo);
                return Json(SalutationList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadSource", Ex.ToString());
            }
            return null;
        }


        [HttpGet, Route("api/leads/GetLeadSourceById/{LeadSourceId}")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadSourceById(int LeadSourceId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<LeadSourceDTO> LeadSourceList = m_ILeadsManager.GetLeadSourceById(MyUserInfo, LeadSourceId);
                return Json(LeadSourceList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadSource", Ex.ToString());
            }
            return null;
        }


        [Route("api/leads/GetLeadsById/{id}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetLeadsById(int id)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                LeadsDTO MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsById(id, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsById", Ex.ToString()); }
            return null;
        }


        [Route("api/leads/GetLeadById/{id}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetLeadById(int id)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                LeadInfo MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadById(id, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { 
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadById", Ex.ToString());
            }
            return null;
        }


        [Route("api/leads/GetLeadsByRatingId/{RatingId}")]
        [CacheControl(MaxAge = 0)]
        [HttpGet]
        public IHttpActionResult GetLeadsByRatingId(int RatingId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByRatingId(RatingId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByRatingId", Ex.ToString()); }
            return null;
        }


        [Route("api/leads/GetLeadsByindsId/{indsId}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadsByindsId(int indsId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByindsId(indsId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByindsId", Ex.ToString()); }
            return null;
        }


        [Route("api/leads/GetLeadsByCurId/{CurId}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadsByCurId(int CurId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByCurId(CurId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByCurId", Ex.ToString()); }
            return null;
        }


        [Route("api/leads/GetLeadsByPriceListId/{PriceListId}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
     
        public IHttpActionResult GetLeadsByPriceListId(int PriceListId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByPriceListId(PriceListId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByPriceListId", Ex.ToString()); }
            return null;
        }
        [Route("api/leads/GetLeadsByUserId/{UserId}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadsByUserId(int UserId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByUserId(UserId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByUserId", Ex.ToString()); }
            return null;
        }

        [Route("api/leads/GetLeadsByOwnerId/{OwnerId}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadsByOwnerId(int OwnerId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByOwnerId(OwnerId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByOwnerId", Ex.ToString()); }
            return null;
        }

        [Route("api/leads/GetLeadsBySourceId/{SourceId}")]
        [HttpGet]
        public IHttpActionResult GetLeadsBySourceId(int SourceId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsBySourceId(SourceId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsBySourceId", Ex.ToString()); }
            return null;
        }


        [Route("api/leads/GetLeadsByStatus/{Status}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadsByStatus(int Status)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByStatus(Status, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByStatus", Ex.ToString()); }
            return null;
        }

        [Route("api/leads/GetLeadsByStatId/{StatId}")]
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadsByStatId(int StatId)
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                IEnumerable<LeadsDTO> MyLeadsInfo = null;
                MyLeadsInfo = m_ILeadsManager.GetLeadsByStatId(StatId, MyUserInfo);
                return Json(MyLeadsInfo);
            }
            catch (Exception Ex)
            { Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadsByStatId", Ex.ToString()); }
            return null;
        }

        //GetLeadInfoToConvert
        [HttpPost, Route("api/leads/GetLeadInfoToConvert")]
        public IHttpActionResult GetLeadInfoToConvert(LeadQualifyRequest leadQualifyRequest)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            LeadQualifyRequest LeadQualifyResponse = new LeadQualifyRequest();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                Helpers.Info(typeof(LeadsController).ToString(), "GetLeadInfoToConvert", "Started " + DateTime.Now.ToString());

                MyUserInfo.UserId = leadQualifyRequest.UserId;
                MyUserInfo.UsersIds = leadQualifyRequest.UserId.ToString();

                LeadQualifyResponse = m_ILeadsManager.GetLeadInfoToConvert(leadQualifyRequest, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "GetLeadInfoToConvert", "Done " + DateTime.Now.ToString());

                return Json(LeadQualifyResponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadInfoToConvert", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/leads/ChangeLeadStatus")]
        public IHttpActionResult ChangeLeadStatus(List<LeadsDTO> MyLeadList)
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

                Helpers.Info(typeof(LeadsController).ToString(), "ChangeLeadStatus", "Started " + DateTime.Now.ToString());


                if (MyLeadList.Count > 0)
                {
                    MyUserInfo.UserId = MyLeadList[MyLeadList.Count - 1].UserId;
                }
                MyResultReponse = m_ILeadsManager.ChangeLeadStatus(MyLeadList, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "ChangeLeadStatus", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "ChangeLeadStatus", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpPost, Route("api/leads/QualifyLead")]
        public IHttpActionResult QualifyLead(LeadQualifyInput leadQualifyInput)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            LeadQualifyResponse MyLeadQualifyResponse = new LeadQualifyResponse();
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                Helpers.Info(typeof(LeadsController).ToString(), "QualifyLead", "Started " + DateTime.Now.ToString());


                MyUserInfo.UserId = leadQualifyInput.CreatedBy;

                MyLeadQualifyResponse = m_ILeadsManager.QualifyLead(leadQualifyInput, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "QualifyLead", "Done " + DateTime.Now.ToString());

                return Json(MyLeadQualifyResponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "QualifyLead", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator " + Ex.ToString();
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpPost, Route("api/leads/LeadQualify")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult LeadQualify(List<LeadsDTO> MyLeadList)
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

                Helpers.Info(typeof(LeadsController).ToString(), "LeadQualify", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_ILeadsManager.ChangeLeadStatus(MyLeadList, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "LeadQualify", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "LeadQualify", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/leads/CreateLead")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult CreateLead(LeadsDTO MyLeadInfo)
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
                Helpers.Info(typeof(LeadsController).ToString(), "CreateLead", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_ILeadsManager.CreateLead(MyLeadInfo, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "CreateLead", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "CreateLeads", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/leads/UpdateLead")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateLead(LeadsDTO MyLeadsDTO)
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

                Helpers.Info(typeof(LeadsController).ToString(), "UpdateLead", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_ILeadsManager.UpdateLead(MyLeadsDTO, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateLead", "Done " + DateTime.Now.ToString());

            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "UpdateLead", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured While Updating contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/leads/UpdateContactGroupsOfLead")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateContactGroupsOfLead(ContactGroups contactGroups)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            int Result;
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
                MyUserInfo.UserId = contactGroups.UserId;

                // int returnValue = 0;
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateContactGroupsOfLead", "Started " + DateTime.Now.ToString());
                Result = m_ILeadsManager.UpdateContactGroupsOfLead(contactGroups, MyUserInfo);
                if(Result>0)
                {
                    MyResultReponse.Data = Result.ToString();
                    MyResultReponse.Status = "SUCCESS";
                    MyResultReponse.Message = "Successfully Updated";
                }
                else
                {
                    MyResultReponse.Data = "0";
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.Message = "Error Updating";

                }
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateContactGroupsOfLead", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "CreateLeads", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpPost, Route("api/leads/UpdateContactGroupsOfContact")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateContactGroupsOfContact(ContactGroups contactGroups)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            int Result;
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
                MyUserInfo.UserId = contactGroups.UserId;

                // int returnValue = 0;
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateContactGroupsOfContact", "Started " + DateTime.Now.ToString());
                Result = m_ILeadsManager.UpdateContactGroupsOfContact(contactGroups, MyUserInfo);
                if (Result > 0)
                {
                    MyResultReponse.Data = Result.ToString();
                    MyResultReponse.Status = "SUCCESS";
                    MyResultReponse.Message = "Successfully Updated";
                }
                else
                {
                    MyResultReponse.Data = "0";
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.Message = "Error Updating";

                }
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateContactGroupsOfContact", "Done " + DateTime.Now.ToString());

                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "CreateLeads", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }


        [HttpPost, Route("api/leads/ConvertToLead")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult ConvertToLead(List<EmailDTO> MyEmailList)
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
                Helpers.Info(typeof(LeadsController).ToString(), "ConvertToLead", "Started " + DateTime.Now.ToString());
                ResultReponse returnValue = m_ILeadsManager.ConvertToLead(MyEmailList, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "ConvertToLead", "Done " + DateTime.Now.ToString());
                if (returnValue.Data != "0")
                {
                    MyResultReponse.Status = returnValue.Status;
                    MyResultReponse.StatusCode = returnValue.StatusCode;
                    MyResultReponse.Message = returnValue.Message;
                    MyResultReponse.Data = returnValue.Data;
                }
                else
                {
                    MyResultReponse.Status = returnValue.Status;
                    MyResultReponse.StatusCode = returnValue.StatusCode;
                    MyResultReponse.Message = returnValue.Message;
                    MyResultReponse.Data = returnValue.Data;
                }
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "ConvertToLead", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        [HttpPost, Route("api/leads/AddToQueue")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult AddToQueue(List<EmailDTO> MyEmailList)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            List<EmailDTO> ToSaveEmailList = null;
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
                Helpers.Info(typeof(LeadsController).ToString(), "AddToQueue", "Started " + DateTime.Now.ToString());

                //Check if the first name is null if null then don't save in job queue
                //because its mandatory to have in email
                ToSaveEmailList = MyEmailList.Where(x => x.FirstName != null).ToList();


                ResultReponse returnValue = m_ILeadsManager.AddToQueue(ToSaveEmailList, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "AddToQueue", "Done " + DateTime.Now.ToString());
                if (returnValue.Data != "0")
                {
                    MyResultReponse.Status = returnValue.Status;
                    MyResultReponse.StatusCode = returnValue.StatusCode;
                    MyResultReponse.Message = returnValue.Message;
                    MyResultReponse.Data = returnValue.Data;
                }
                else
                {
                    MyResultReponse.Status = returnValue.Status;
                    MyResultReponse.StatusCode = returnValue.StatusCode;
                    MyResultReponse.Message = returnValue.Message;
                    MyResultReponse.Data = returnValue.Data;
                }
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "AddToQueue", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }
       
        [HttpPost, Route("api/leads/UpdateQueue")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult UpdateQueue(List<JobQueueDTO> MyQueueList)
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
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateQueue", "Started " + DateTime.Now.ToString());
                ResultReponse returnValue = m_ILeadsManager.UpdateQueue(MyQueueList, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "UpdateQueue", "Done " + DateTime.Now.ToString());
                if (returnValue.Data != "0")
                {
                    MyResultReponse.Status = returnValue.Status;
                    MyResultReponse.StatusCode = returnValue.StatusCode;
                    MyResultReponse.Message = returnValue.Message;
                    MyResultReponse.Data = returnValue.Data;
                }
                else
                {
                    MyResultReponse.Status = returnValue.Status;
                    MyResultReponse.StatusCode = returnValue.StatusCode;
                    MyResultReponse.Message = returnValue.Message;
                    MyResultReponse.Data = returnValue.Data;
                }
                return Json(MyResultReponse);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "UpdateQueue", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        //[HttpPost, Route("api/Leads/createLead")]
        //public IHttpActionResult GenerateLead(LeadsDTO MyLeadInfo)
        //{
        //    ResultReponse MyResultReponse = new ResultReponse();
        //    try
        //    {
        //        BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

        //        MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
        //        MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
        //        MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
        //        MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
        //        MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
        //        MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

        //        //MyUserInfo.TenantId = TenantId;
        //        // MyUserInfo.UserId = UserId;

        //        // int returnValue = 0;
        //        Helpers.Info(typeof(LeadsController).ToString(), "GenerateLead", "Started " + DateTime.Now.ToString());
        //        ResultReponse returnValue = m_ILeadsBusiness.GenerateLead(MyLeadInfo, MyUserInfo);
        //        Helpers.Info(typeof(LeadsController).ToString(), "GenerateLead", "Done " + DateTime.Now.ToString());
        //        if (returnValue.Data != "0")
        //        {
        //            MyResultReponse.Status = returnValue.Status;
        //            MyResultReponse.StatusCode = returnValue.StatusCode;
        //            MyResultReponse.Message = returnValue.Message;
        //            MyResultReponse.Data = returnValue.Data;
        //        }
        //        else
        //        {
        //            MyResultReponse.Status = returnValue.Status;
        //            MyResultReponse.StatusCode = returnValue.StatusCode;
        //            MyResultReponse.Message = returnValue.Message;
        //            MyResultReponse.Data = returnValue.Data;
        //        }
        //        return Json(MyResultReponse);
        //    }
        //    catch (Exception Ex)
        //    {
        //        Helpers.ErrorLog(typeof(LeadsController).ToString(), "GenerateLead", Ex.ToString());
        //        MyResultReponse.Status = "ERROR";
        //        MyResultReponse.StatusCode = "ERROR";
        //        MyResultReponse.Message = "Error Occured while inserting contact administrator";
        //        MyResultReponse.Data = "0";
        //    }
        //    return Json(MyResultReponse);
        //}



        [HttpPost, Route("api/leads/DeleteLead/{Id}")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult DeleteLead(int Id)
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

                // MyUserInfo.TenantId = TenantId;
                // MyUserInfo.UserId = UserId;

                Helpers.Info(typeof(LeadsController).ToString(), "DeleteLead", "Started " + DateTime.Now.ToString());
                MyResultReponse = m_ILeadsManager.DeleteLead(Id, MyUserInfo);
                Helpers.Info(typeof(LeadsController).ToString(), "DeleteLead", "Done " + DateTime.Now.ToString());

            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "DeleteLead", Ex.ToString());
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while Deleting contact administrator";
                MyResultReponse.Data = "0";
            }
            return Json(MyResultReponse);
        }

        //GetLeads
        //GetLeadById
        //Add
        //Edit
        //Delete[update status active / inactive 1 = active 0 = inactive
        //GetLeadBySourceId
        //GetLeadByIndustryId

        [HttpGet, Route("api/leads/GetJobQueueList")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetJobQueueList()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;


                IEnumerable<JobQueueDTO> MyQueueList = m_ILeadsManager.GetJobQueueList(MyUserInfo);
                return Json(MyQueueList);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetJobQueueList", Ex.ToString());
            }
            return null;
        }



        [HttpGet, Route("api/leads/GetLeadStatus")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadStatus()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                // List<LeadDTOList> MyLeadDtoList = null;
                LeadStatusRetults leadStatusRetults  = m_ILeadsManager.GetLeadStatus(MyUserInfo);
                return Json(leadStatusRetults);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadStatus", Ex.ToString());
            }
            return null;
        }

        [HttpGet, Route("api/leads/GetLeadStatusDomainItem")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadStatusDomainItem()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<LeadStatusDomainItem> leadStatusDomainItems = m_ILeadsManager.GetLeadStatusDomainItem(MyUserInfo);
                return Json(leadStatusDomainItems);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadStatusDomainItem", Ex.ToString());
            }
            return null;
        }


        [HttpGet, Route("api/leads/GetLeadRatingDomainItems")]
        [CacheControl(MaxAge = 0)]
        public IHttpActionResult GetLeadRatingDomainItems()
        {
            try
            {
                //BasicAuthenticationDTO _basicAuthIdentity = Thread.CurrentPrincipal.Identity as BasicAuthenticationDTO;

                //MyUserInfo.TenantId = _basicAuthIdentity._AuthUserDTO.TenatId;
                //MyUserInfo.UserId = _basicAuthIdentity._AuthUserDTO.UserId;
                //MyUserInfo.LinkedInEmail = _basicAuthIdentity._AuthUserDTO.LinkedInEmail;
                //MyUserInfo.LinkedInPassword = _basicAuthIdentity._AuthUserDTO.LinkedInPassword;
                //MyUserInfo.databasename = _basicAuthIdentity._AuthUserDTO.DatabaseName;
                //MyUserInfo.UsersIds = _basicAuthIdentity._AuthUserDTO.UsersIds;

                // List<LeadDTOList> MyLeadDtoList = null;
                IEnumerable<LeadRatingDomainItem> leadRatingDomainItems  = m_ILeadsManager.GetLeadRatingDomainItems(MyUserInfo);
                return Json(leadRatingDomainItems);
            }
            catch (Exception Ex)
            {
                Helpers.ErrorLog(typeof(LeadsController).ToString(), "GetLeadRatingDomainItems", Ex.ToString());
            }
            return null;
        }
    }
}
