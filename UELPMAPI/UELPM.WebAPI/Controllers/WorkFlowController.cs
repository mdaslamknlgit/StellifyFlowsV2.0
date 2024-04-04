using System;
using System.Collections.Generic;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class WorkFlowController : ApiController
    {
        private readonly IWorkFlowConfigurationManager m_workFlowConfigurationManager;

        public WorkFlowController(IWorkFlowConfigurationManager workFlowConfigurationManager)
        {
            m_workFlowConfigurationManager = workFlowConfigurationManager;
        }

        /// <summary>
        /// This method is used for getting work flow configurations
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/workFlowConfigurations/{companyId}")]
        public IHttpActionResult GetWorkFlowConfigurations(int companyId)
        {
            var result = m_workFlowConfigurationManager.GetWorkFlowConfigurations(companyId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting all sales orders
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/workFlowConfigurations/byCompany")]
        public IHttpActionResult GetWorkFlowConfigurationsByCompany([FromUri] GridDisplayInput workFlowInput)
        {
            var result = m_workFlowConfigurationManager.GetWorkFlowConfigurationsByCompany(workFlowInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting work flow processes
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/workFlowProcesses")]
        public IHttpActionResult GetWorkFlowProcesses(string searchKey)

        {
            var result = m_workFlowConfigurationManager.GetWorkFlowProcesses(searchKey);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to get work flow configuration by process id
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/workFlowConfigurations/{processId}/{companyId}/{locationId}")]
        public IHttpActionResult GetWorkFlowConfiguration(int processId, int companyId, int locationId)
        {
            var result = m_workFlowConfigurationManager.GetWorkFlowConfiguration(processId, companyId, locationId);
            return Ok(result);
        }

        /// <summary>
        /// This method is used for getting work flow configurations based on search
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/workFlowConfigurations/searchAll")]
        public IHttpActionResult GetAllSearchWorkFlowConfigurations([FromUri] WorkFlowSearch workFlowSearch)
        {
            var result = m_workFlowConfigurationManager.GetAllSearchWorkFlowConfigurations(workFlowSearch);
            return Ok(result);
        }


        ///// <summary>
        ///// This method is used to get document work flow by process id
        ///// </summary>
        ///// <returns></returns>
        //[HttpPost]
        //[Route("api/documentWorkFlow")]
        //public IHttpActionResult GetDocumentWorkFlow(List<WorkFlowParameter> workFlowParameters)
        //{
        //    var result = m_workFlowConfigurationManager.GetDocumentWorkFlow(workFlowParameters);
        //    return Ok(result);
        //}

        /// <summary>
        /// This method is used to create work flow configuration
        /// </summary>
        /// <param name="workFlowConfiguration">supplier</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/workFlowConfigurations")]
        public IHttpActionResult CreateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            var result = m_workFlowConfigurationManager.CreateWorkFlowConfiguration(workFlowConfiguration);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to udpate work flow configuration
        /// </summary>
        /// <param name="workFlowConfiguration">supplier</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/workFlowConfigurations")]
        public IHttpActionResult UpdateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            var result = m_workFlowConfigurationManager.UpdateWorkFlowConfiguration(workFlowConfiguration);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create work flow response
        /// </summary>
        /// <param name="workFlowResponse">supplier</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/workFlowResponses")]
        public IHttpActionResult CreateWorkFlowResponse(WorkFlowResponse workFlowResponse)
        {
            var result = m_workFlowConfigurationManager.CreateWorkFlowResponse(workFlowResponse);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to udpate work flow response
        /// </summary>
        /// <param name="workFlowResponse">supplier</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/workFlowResponses")]
        public IHttpActionResult UpdateWorkFlowResponse(WorkFlowResponse workFlowResponse)
        {
            var result = m_workFlowConfigurationManager.UpdateWorkFlowResponse(workFlowResponse);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to delete work flow configuration
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpPost]
        [Route("api/workFlowConfigurations/DeleteWorkFlowConfiguration")]
        public IHttpActionResult DeleteWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            var result = m_workFlowConfigurationManager.DeleteWorkFlowConfiguration(workFlowConfiguration.WorkFlowConfigurationId);
            return Ok(result);
        }


    }
}
