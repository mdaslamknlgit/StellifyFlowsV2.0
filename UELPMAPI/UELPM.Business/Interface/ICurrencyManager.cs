using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ICurrencyManager
    {
        CurrencyDisplayResult GetCurrency(GridDisplayInput gridDisplayInput);
        Currency GetCurrencyDetails(int Id);
        string CreateCurrency(Currency m_currency);
        string UpdateCurrency(Currency m_currency);
        bool DeleteCurrency(int Id);
        string ValidateCurrency(Currency m_validateCurrency);


        CurrencyDisplayResult GetAllCurrencies(GridDisplayInput gridDisplayInput);
        CurrencyDisplayResult GetDefaultCurrency(GridDisplayInput gridDisplayInput);
        Currency GetCurrencyById(int Id);
    }
}
