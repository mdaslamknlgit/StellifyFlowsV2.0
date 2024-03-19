using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IMeasurementUnitManager
    {
        MeasurementUnitDisplayResult GetMeasurementUnits(MeasurementUnitDisplayInput itemCategory);

        MeasurementUnit GetMeasurementUnitById(int MeasurementUnitId);
        int CreateMeasurementUnit(MeasurementUnit item);

        int UpdateMeasurementUnit(MeasurementUnit item);

        bool DeleteMeasurementUnit(MeasurementUnitDelete measurementUnitDelete);

        string ValidateMeasurementUnit(ValidateMesurementUnit validateMesurementUnit);
        MeasurementUnitDisplayResult GetAllMeasurementUnits(MeasurementUnitDisplayInput itemCategory);
        int CheckExistingUOM(int measurementUnitId);
    }
}
