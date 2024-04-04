using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class TaxGroupManager : ITaxGroupManager
    {
        private readonly ITaxGroupRepository m_taxGroupRepository;

        public TaxGroupManager(ITaxGroupRepository taxGroupRepository)
        {
            m_taxGroupRepository = taxGroupRepository;
        }

        public string CreateTaxGroup(TaxGroupManagement m_taxGroupManagement)
        {
            return m_taxGroupRepository.CreateTaxGroup(m_taxGroupManagement);
        }

        public bool DeleteTaxGroup(int taxGroupId, int userId)
        {
            return m_taxGroupRepository.DeleteTaxGroup(taxGroupId, userId);
        }

        public TaxGroupManagementDisplayResult GetTaxGroup(GridDisplayInput gridDisplayInput)
        {
            return m_taxGroupRepository.GetTaxGroup(gridDisplayInput);
        }

        public TaxGroupManagement GetTaxGroupDetails(int taxGroupId)
        {
            return m_taxGroupRepository.GetTaxGroupDetails(taxGroupId);
        }

        public string UpdateTaxGroup(TaxGroupManagement m_taxGroupManagement)
        {
            return m_taxGroupRepository.UpdateTaxGroup(m_taxGroupManagement);
        }

        public string ValidateTaxGroup(TaxGroupManagement taxGroupManagement)
        {
            return m_taxGroupRepository.ValidateTaxGroup(taxGroupManagement);
        }
    }
}
