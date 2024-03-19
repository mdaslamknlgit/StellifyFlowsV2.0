using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Business.Managers;
using UELPM.Service;
using UELPM.Model.Models;
using UELPM.Service.Repositories;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{

    public class MeasurementUnitManager : ManagerBase, IMeasurementUnitManager
    {
        private readonly IMeasurementUnitRepository m_measurementUnitRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="measurementUnitRepository"></param>
        public MeasurementUnitManager(IMeasurementUnitRepository measurementUnitRepository)
        {
            m_measurementUnitRepository = measurementUnitRepository;
        }

        public MeasurementUnitDisplayResult GetMeasurementUnits(MeasurementUnitDisplayInput measurementUnitDisplay)
        {
            return m_measurementUnitRepository.GetMeasurementUnits(measurementUnitDisplay);
        }

        public MeasurementUnit GetMeasurementUnitById(int MeasurementUnitId)
        {
            return m_measurementUnitRepository.GetMeasurementUnitById(MeasurementUnitId);
        }

        public int CreateMeasurementUnit(MeasurementUnit item)
        {
            return m_measurementUnitRepository.CreateMeasurementUnit(item);
        }

        public int UpdateMeasurementUnit(MeasurementUnit item)
        {
            return m_measurementUnitRepository.UpdateMeasurementUnit(item);
        }

        public bool DeleteMeasurementUnit(MeasurementUnitDelete measurementUnitDelete)
        {
            return m_measurementUnitRepository.DeleteMeasurementUnit(measurementUnitDelete);
        }

        public string ValidateMeasurementUnit(ValidateMesurementUnit validateMesurementUnit)
        {
            return m_measurementUnitRepository.ValidateMeasurementUnit(validateMesurementUnit);
        }

        public MeasurementUnitDisplayResult GetAllMeasurementUnits(MeasurementUnitDisplayInput itemCategory)
        {
            return m_measurementUnitRepository.GetAllMeasurementUnits(itemCategory);
        }

        public int CheckExistingUOM(int measurementUnitId)
        {
            return m_measurementUnitRepository.CheckExistingUOM(measurementUnitId);
        }
    }
}
