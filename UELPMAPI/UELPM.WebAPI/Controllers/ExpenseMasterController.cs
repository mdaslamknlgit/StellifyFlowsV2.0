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
    public class ExpenseMasterController : ApiController
    {
        private readonly IExpenseMasterManager m_expenseMasterManager;
        public ExpenseMasterController(IExpenseMasterManager costCentreManager)
        {
            m_expenseMasterManager = costCentreManager;
        }
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expenses")]
        public IHttpActionResult GetExpenseMasters([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_expenseMasterManager.GetExpenseMasters(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expenses/search")]
        public IHttpActionResult SearchExpenseMasters([FromUri] ExpenseMasterSearch expenseMasterSearch)
        {
            var result = m_expenseMasterManager.SearchExpenseMasters(expenseMasterSearch);
            if (expenseMasterSearch.Take > 0)
            {
                return Ok(result);
            }
            else
            {
                return Ok(result.Expenses);
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expenses/{expenseMasterId}")]
        public IHttpActionResult GetExpenseMasterDetails(int expenseMasterId)
        {
            var result = m_expenseMasterManager.GetExpenseMasterDetails(expenseMasterId);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/expenses")]
        public IHttpActionResult CreateExpenseMaster([FromBody] ExpenseMaster expenseMaster)
        {
            var result = m_expenseMasterManager.CreateExpenseMaster(expenseMaster);
            return Ok(result);
        }


        [HttpPut]
        [Route("api/expenses")]
        public IHttpActionResult UpdateExpenseMaster([FromBody] ExpenseMaster expenseMaster)
        {
            var result = m_expenseMasterManager.UpdateExpenseMaster(expenseMaster);
            return Ok(result);
        }

        [HttpDelete]
        [Route("api/expenses/{ExpensesMasterId}/{CreatedBy}")]
        public IHttpActionResult DeleteExpenseMaster([FromUri] ExpenseMaster expenseMaster)
        {
            var result = m_expenseMasterManager.DeleteExpenseMaster(expenseMaster);
            return Ok(result);
        }
    }
}
