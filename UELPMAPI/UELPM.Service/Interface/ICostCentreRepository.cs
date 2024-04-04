using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ICostCentreRepository
    {
        CostCentreDisplayResult GetCostCentres(GridDisplayInput creditNoteInput);

        CostCentre GetCostCentresById(int CostCenterId);
        CostCentreDisplayResult SearchCostCentres(GridDisplayInput creditNoteInput);
        CostCentre GetCostCentreDetails(int costCentreId);
        int CreateCostCentre(CostCentre costCentre);
        int UpdateCostCentre(CostCentre costCentre);
        int DeleteCostCentre(CostCentre costCentre);
        int ValidateCostCentreName(CostCentre costCentre);
    }
}
