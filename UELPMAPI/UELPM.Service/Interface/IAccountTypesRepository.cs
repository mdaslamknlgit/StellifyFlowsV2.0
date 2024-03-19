using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAccountTypesRepository
    {
        AccountTypesDisplayResult GetAccountTypes(GridDisplayInput gridDisplayInput);
        AccountTypes GetAccountTypesDetails(int m_COAAccountTypeId);
        string ValidateAccountTypes(AccountTypes m_validateAccountTypes);
        string CreateAccountType(AccountTypes m_accountTypes);
        string UpdateAccountTypes(AccountTypes m_accountTypes);
        bool DeleteAccountTypes(int m_COAAccountTypeId);
    }
}
