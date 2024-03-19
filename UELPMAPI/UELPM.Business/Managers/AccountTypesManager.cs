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
    public class AccountTypesManager : IAccountTypesManager
    {
        private readonly IAccountTypesRepository m_accountTypesRepository;

        public AccountTypesManager(IAccountTypesRepository accountTypesRepository)
        {
            m_accountTypesRepository = accountTypesRepository;
        }

        public string CreateAccountType(AccountTypes m_accountTypes)
        {
            return m_accountTypesRepository.CreateAccountType(m_accountTypes);
        }

        public bool DeleteAccountTypes(int m_COAAccountTypeId)
        {
            return m_accountTypesRepository.DeleteAccountTypes(m_COAAccountTypeId);
        }

        public AccountTypesDisplayResult GetAccountTypes(GridDisplayInput gridDisplayInput)
        {
            return m_accountTypesRepository.GetAccountTypes(gridDisplayInput);
        }

        public AccountTypes GetAccountTypesDetails(int m_COAAccountTypeId)
        {
            return m_accountTypesRepository.GetAccountTypesDetails(m_COAAccountTypeId);
        }

        public string UpdateAccountTypes(AccountTypes m_accountTypes)
        {
            return m_accountTypesRepository.UpdateAccountTypes(m_accountTypes);
        }

        public string ValidateAccountTypes(AccountTypes m_validateAccountTypes)
        {
            return m_accountTypesRepository.ValidateAccountTypes(m_validateAccountTypes);
        }
    }
}
