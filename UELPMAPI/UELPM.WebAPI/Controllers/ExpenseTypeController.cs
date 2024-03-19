using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ExpenseTypeController : ApiController

    { 
        private readonly IExpenseTypeManager m_expenseTypeManager;
        public ExpenseTypeController(IExpenseTypeManager expenseTypeManager)
        {
            m_expenseTypeManager = expenseTypeManager;
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expenseType")]
        public IHttpActionResult GetExpeseType([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_expenseTypeManager.GetExpenseType(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expenseType/Search")]
        public IHttpActionResult GetAllExpenseType([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_expenseTypeManager.GetAllExpenseType(gridDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all supplier categories...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/expenseType/{expenseTypeId}")]
        public IHttpActionResult GetExpenseType(int expenseTypeId)
        {
            var result = m_expenseTypeManager.GetExpenseType(expenseTypeId);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/expenseType")]
        public HttpResponseMessage CreateExpenseType(ExpenseType expenseType)
        {
            var result = 0;
            //if (m_expenseTypeManager.ValidateExpenseType(expenseType) > 0)
            //{
            //    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            //}
            //else
            //{
                result = m_expenseTypeManager.CreateExpenseType(expenseType);
                return Request.CreateResponse(HttpStatusCode.OK, result);
            //}
        }

        [HttpPut]
        [Route("api/expenseType")]
        public HttpResponseMessage UpdateExpenseType(ExpenseType expenseType)
        {
            var result = 0;
            if (m_expenseTypeManager.ValidateExpenseType(expenseType) > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ErrorMessages.Duplicate);
            }
            else
            {
                result = m_expenseTypeManager.UpdateExpenseType(expenseType);
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }


        [HttpDelete]
        [Route("api/expenseType/{expenseTypeId}/{userId}")]
        public IHttpActionResult DeleteExpenseType(int expenseTypeId, int userId)
        {
            var result = m_expenseTypeManager.DeleteExpenseType(new ExpenseType
            {
                ExpenseTypeId = expenseTypeId,
                CreatedBy = userId
            });
            return Ok(result);
        }


    }
}
