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
    public class CurrencyManager : ICurrencyManager
    {
        private readonly ICurrencyRepository m_currencyRepository;

        public CurrencyManager(ICurrencyRepository currencyRepository)
        {
            m_currencyRepository = currencyRepository;
        }

        public string CreateCurrency(Currency m_currency)
        {
            return m_currencyRepository.CreateCurrency(m_currency);
        }

        public bool DeleteCurrency(int Id)
        {
            return m_currencyRepository.DeleteCurrency(Id);
        }

        public CurrencyDisplayResult GetCurrency(GridDisplayInput gridDisplayInput)
        {
            return m_currencyRepository.GetCurrency(gridDisplayInput);
        }

        public Currency GetCurrencyDetails(int Id)
        {
            return m_currencyRepository.GetCurrencyDetails(Id);
        }

        public string UpdateCurrency(Currency m_currency)
        {
            return m_currencyRepository.UpdateCurrency(m_currency);
        }

        public string ValidateCurrency(Currency m_validateCurrency)
        {
            return m_currencyRepository.ValidateCurrency(m_validateCurrency);
        }


        public CurrencyDisplayResult GetAllCurrencies(GridDisplayInput gridDisplayInput)
        {
            return m_currencyRepository.GetAllCurrencies(gridDisplayInput);
        }
        public CurrencyDisplayResult GetDefaultCurrency(GridDisplayInput gridDisplayInput)
        {
            return m_currencyRepository.GetDefaultCurrency(gridDisplayInput);
        }
        public Currency GetCurrencyById(int Id)
        {
            return m_currencyRepository.GetCurrencyById(Id);
        }

    }
}
