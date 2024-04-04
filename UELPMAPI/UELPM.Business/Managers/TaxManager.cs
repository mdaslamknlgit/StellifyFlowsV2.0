using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class TaxManager : ManagerBase, ITaxManager
    {
        private readonly ITaxRepository m_itaxRepository;

        public TaxManager(ITaxRepository taxRepository)
        {
            m_itaxRepository = taxRepository;
        }

        public int CreateTax(Tax Tax)
        {
            return m_itaxRepository.CreateTax(Tax);
        }

        public Tax GetTaxByTaxId(int TaxId)
        {
            return m_itaxRepository.GetTaxByTaxId(TaxId);
        }
        public bool DeleteTax(TaxDelete TaxDelete)
        {
            return m_itaxRepository.DeleteTax(TaxDelete);
        }

        public TaxDisplayResult GetFilterTaxes(TaxFilterDisplayInput Tax)
        {
            return m_itaxRepository.GetFilterTaxes(Tax);
        }

        public TaxDisplayResult GetTaxes(TaxisplayInput Tax)
        {
            return m_itaxRepository.GetTaxes(Tax);
        }

        public IEnumerable<Tax> GetTaxesByTaxGroup(int taxGroupId)
        {
            return m_itaxRepository.GetTaxesByTaxGroup(taxGroupId);
        }

        public int UpdateTax(Tax Tax)
        {
            return m_itaxRepository.UpdateTax(Tax);
        }

        public int ValidateTaxName(Tax Tax)
        {
            return m_itaxRepository.ValidateTaxName(Tax);
        }
        public UploadResult UploadTaxes(string filePath, int userId)
        {
            return m_itaxRepository.UploadTaxes(filePath, userId);
        }

        public int GetTaxClassCount(int taxGroupId, int taxClass)
        {
            return m_itaxRepository.GetTaxClassCount(taxGroupId, taxClass);
        }
    }
}
