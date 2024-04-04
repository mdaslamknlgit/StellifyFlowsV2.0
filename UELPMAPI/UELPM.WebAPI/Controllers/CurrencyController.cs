using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class CurrencyController : ApiController
    {
        private readonly ICurrencyManager m_currencyManager ;
        public CurrencyController(ICurrencyManager currencyManager)
        {
            m_currencyManager = currencyManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/currency")]
        public IHttpActionResult GetCurrency([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_currencyManager.GetCurrency(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/currency/{Id}")]
        public IHttpActionResult GetCurrencyDetails(int Id)
        {
            try
            {
                var result = m_currencyManager.GetCurrencyDetails(Id);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpPost]
        [Route("api/currency")]
        public IHttpActionResult CreateCurrency([FromBody]Currency m_currency)
        {
            ResponseStatus statusObj = new ResponseStatus();
            string validationStatus = m_currencyManager.ValidateCurrency(new Currency
            {
                Name = m_currency.Name
            });
            if (validationStatus == "Duplicate Currency")
            {
                statusObj.Status = validationStatus;
            }
            else
            {
                var result = m_currencyManager.CreateCurrency(m_currency);
                statusObj.Status = "success";
                statusObj.Value = result;
            }
            return Ok(statusObj);
        }


        [HttpPut]
        [Route("api/currency")]
        public IHttpActionResult UpdateCurrency([FromBody]Currency m_currency)
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
            var result = m_currencyManager.UpdateCurrency(m_currency);
            statusObj.Status = "success";
            statusObj.Value = result;
            //}
            return Ok(statusObj);

        }

        [HttpDelete]
        [Route("api/currency/{Id}")]
        public IHttpActionResult DeleteCurrency(int Id)
        {
            var result = m_currencyManager.DeleteCurrency(Id);
            return Ok(result);
        }



        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/currency/GetAllCurrencies")]
        public IHttpActionResult GetAllCurrencies([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_currencyManager.GetAllCurrencies(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/currency/GetDefaultCurrency")]
        public IHttpActionResult GetDefaultCurrency([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_currencyManager.GetDefaultCurrency(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/currency/GetCurrencyById/{Id}")]
        public IHttpActionResult GetCurrencyById(int Id)
        {
            try
            {
                var result = m_currencyManager.GetCurrencyById(Id);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }


    }
}
