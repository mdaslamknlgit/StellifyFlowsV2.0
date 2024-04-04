using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ITaxRepository
    {
        TaxDisplayResult GetTaxes(TaxisplayInput Tax);

        Tax GetTaxByTaxId(int TaxId);
        TaxDisplayResult GetFilterTaxes(TaxFilterDisplayInput Tax);

        IEnumerable<Tax> GetTaxesByTaxGroup(int taxGroupId);

        int CreateTax(Tax Tax);

        int UpdateTax(Tax Tax);

        bool DeleteTax(TaxDelete TaxDelete);

        int ValidateTaxName(Tax tax);
        UploadResult UploadTaxes(string filePath, int userId);
        int GetTaxClassCount(int taxGroupId, int taxClass);



    }
}
