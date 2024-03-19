using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IMeasurementUnitRepository
    {
        MeasurementUnitDisplayResult GetMeasurementUnits(MeasurementUnitDisplayInput measurementDisplayInputObj);

        MeasurementUnit GetMeasurementUnitById(int MeasurementUnitId);

        int CreateMeasurementUnit(MeasurementUnit measurementUnit);

        int UpdateMeasurementUnit(MeasurementUnit measurementUnit);

        bool DeleteMeasurementUnit(MeasurementUnitDelete measurementUnitDelete);

        string ValidateMeasurementUnit(ValidateMesurementUnit validateMesurementUnit);

        MeasurementUnitDisplayResult GetAllMeasurementUnits(MeasurementUnitDisplayInput itemCategory);

        int CheckExistingUOM(int measurementUnitId);
    }
}
