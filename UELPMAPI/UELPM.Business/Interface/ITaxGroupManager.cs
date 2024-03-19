using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ITaxGroupManager
    {
        TaxGroupManagementDisplayResult GetTaxGroup(GridDisplayInput gridDisplayInput);
        TaxGroupManagement GetTaxGroupDetails(int taxGroupId);
        string ValidateTaxGroup(TaxGroupManagement taxGroupManagement);
        string CreateTaxGroup(TaxGroupManagement m_taxGroupManagement);
        string UpdateTaxGroup(TaxGroupManagement m_taxGroupManagement);
        bool DeleteTaxGroup(int taxGroupId, int userId);
    }
}
