using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
     public interface IDepreciationRepository
    {
        DepreciationDisplayResult GetDepreciations(GridDisplayInput creditNoteInput);
        DepreciationDisplayResult SearchDepreciations(GridDisplayInput creditNoteInput);
        Depreciation GetDepreciationDetails(int depreciationId);
        int CreateDepreciation(Depreciation depreciation);
        int UpdateDepreciation(Depreciation depreciation);
        int DeleteDepreciation(Depreciation depreciation);
        int ValidateDepreciationName(Depreciation depreciation);
    }
}
