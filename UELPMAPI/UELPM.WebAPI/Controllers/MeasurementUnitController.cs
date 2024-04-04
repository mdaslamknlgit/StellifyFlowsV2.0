using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.CustomActionResults;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    //[Authorize(Roles = "Admin")]
    public class MeasurementUnitController : ApiController
    {

        private readonly IMeasurementUnitManager m_measurementUnitManager;

        public MeasurementUnitController() { }

        public MeasurementUnitController(IMeasurementUnitManager measurementUnitManager)
        {
            m_measurementUnitManager = measurementUnitManager;
        }

        /// <summary>
        /// This method is used for getting all measurement units
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/MeasurementUnits")]
        public IHttpActionResult GetMeasurementUnits([FromUri] MeasurementUnitDisplayInput measurementUnitDisplayInput)
        {
            var result = m_measurementUnitManager.GetMeasurementUnits(measurementUnitDisplayInput);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetMeasurementUnitById/{MeasurementUnitId}")]
        public IHttpActionResult GetMeasurementUnitById(int MeasurementUnitId)
        {
            var result = m_measurementUnitManager.GetMeasurementUnitById(MeasurementUnitId);
            return Ok(result);
        }


        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/MeasurementUnits/search")]
        public IHttpActionResult GetAllMeasurementUnits([FromUri] MeasurementUnitDisplayInput measurementUnitDisplayInput)
        {
            var result = m_measurementUnitManager.GetAllMeasurementUnits(measurementUnitDisplayInput);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create a new measurement unit
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateMeasurementUnit")]
        public IHttpActionResult CreateMeasurementUnit(MeasurementUnit measurementUnit)
        {
            string validationStatus = m_measurementUnitManager.ValidateMeasurementUnit(new ValidateMesurementUnit
            {
                MeasurementUnitID = measurementUnit.MeasurementUnitID,
                Name = measurementUnit.Name,
                Code = measurementUnit.Code
            });
            if (validationStatus == "duplicatename" || validationStatus == "duplicatecode")
            {
                return new DuplicateResult(Request,validationStatus);
            }
            else
            {
                var result = m_measurementUnitManager.CreateMeasurementUnit(measurementUnit);
                return Ok(result);
            }        
        }

        /// <summary>
        /// This method is used to udpate measurement unit
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPost]
        [Route("api/UpdateMeasurementUnit")]
        public IHttpActionResult UpdateMeasurementUnit(MeasurementUnit measurementUnit)
        {
            string validationStatus = m_measurementUnitManager.ValidateMeasurementUnit(new ValidateMesurementUnit
            {
                MeasurementUnitID = measurementUnit.MeasurementUnitID,
                Name = measurementUnit.Name,
                Code = measurementUnit.Code
            });
            if (validationStatus == "duplicatename"|| validationStatus=="duplicatecode")
            {
                return new DuplicateResult(Request, validationStatus);
            }
            else
            {
                var result = m_measurementUnitManager.UpdateMeasurementUnit(measurementUnit);
                return Ok(result);
            }
        }

        /// <summary>
        /// This method is used to delete measurement unit
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/DeleteMeasurementUnit/{measurementUnitId}/{userId}")]
        public IHttpActionResult DeleteMeasurementUnit(int measurementUnitId,int userId)
        {
            int validationStatus = m_measurementUnitManager.CheckExistingUOM(measurementUnitId);
            if (validationStatus == 0)
            {
                var result = m_measurementUnitManager.DeleteMeasurementUnit(new MeasurementUnitDelete
                {
                    MeasurementUnitID = measurementUnitId,
                    ModifiedBy = userId
                });
            }
            return Ok(validationStatus);
        }
    }
}
