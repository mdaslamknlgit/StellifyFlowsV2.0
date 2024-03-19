using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using System.Web.Script.Serialization;
using UELPM.WebAPI.Filters;
using System.Web;
using Newtonsoft.Json;

namespace UELPM.WebAPI.Controllers
{
    public class CompanyController : ApiController
    {
        private readonly ICompanyManager m_companyManager;

        public CompanyController(ICompanyManager companyManager)
        {
            m_companyManager = companyManager;
        }
        /// <summary>
        /// This method is used to fetch companies
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/company")]
        public IHttpActionResult GetCompanies([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_companyManager.GetCompanies(gridDisplayInput);
            return Ok(result);
        }
        /// <summary>
        /// This method is used to get company by Id
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/company/{id}")]
        public IHttpActionResult GetCompany(int id)
        {
            var result = m_companyManager.GetCompany(id);
            return Ok(result);
        }
        ///<summary>
        ///This method is used to create Company
        /// </summary>
        /// <param name="company">company</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/Create")]
        public HttpResponseMessage CreateCompany()
        {
            var httpRequest = HttpContext.Current.Request;
            Company company = JsonConvert.DeserializeObject<Company>(httpRequest.Form["company"]);
            company.Image = httpRequest.Files;
            var result = m_companyManager.CreateCompany(company);
            if (result == 1)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else if(result==0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate1);
            }           
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }

        ///<summary>
        ///This method is used to update Company
        /// </summary>
        /// <param name="company">company</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/Update")]
        public HttpResponseMessage UpdateCompany()
        {
            var httpRequest = HttpContext.Current.Request;
            Company company = JsonConvert.DeserializeObject<Company>(httpRequest.Form["company"]);
            company.Image = httpRequest.Files;
            var result = m_companyManager.UpdateCompany(company);
            if (result == -1)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else if (result == -2)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate1);
            }            
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }

        ///<summary>
        ///This method is used to delete Company
        /// </summary>
        /// <param name="company">company</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/company/{id}")]
        public IHttpActionResult DeleteCompany(int id)
        {
            var result = m_companyManager.DeleteCompany(id);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to fetch companies based on search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/company/search")]
        public IHttpActionResult GetAllSearchCompanies([FromUri]GridDisplayInput gridDisplayInput)
        {
            var result = m_companyManager.GetAllSearchCompanies(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to fetch all companies based on search filter
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/company/searchall")]
        public IHttpActionResult GetAllSearchCompaniesFilter([FromUri]CompanySearch companySearch)
        {
            var result = m_companyManager.GetAllSearchCompaniesFilter(companySearch);
            return Ok(result);
        }
    }
}
