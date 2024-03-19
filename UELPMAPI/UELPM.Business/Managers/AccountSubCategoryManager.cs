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
    public class AccountSubCategoryManager : IAccountSubCategoryManager
    {
        private readonly IAccountSubCategoryRepository m_accountSubCategoryRepository;

        public AccountSubCategoryManager(IAccountSubCategoryRepository accountSubCategoryRepository)
        {
            m_accountSubCategoryRepository = accountSubCategoryRepository;
        }

        public string CreateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory)
        {
            return m_accountSubCategoryRepository.CreateAccountCodeCategory(m_accountCodeCategory);
        }

        public bool DeleteAccountCodeCategory(int accountCodeCategoryId, int userId, int companyId)
        {
            return m_accountSubCategoryRepository.DeleteAccountCodeCategory(accountCodeCategoryId, userId, companyId);
        }

        public AccountCodeCategoryDisplayResult GetAccountCodeCategory(GridDisplayInput gridDisplayInput)
        {
            return m_accountSubCategoryRepository.GetAccountCodeCategory(gridDisplayInput);
        }

        public AccountCodeCategory GetAccountCodeCategoryDetails(int accountCodeCategoryId)
        {
            return m_accountSubCategoryRepository.GetAccountCodeCategoryDetails(accountCodeCategoryId);
        }

        public string UpdateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory)
        {
            return m_accountSubCategoryRepository.UpdateAccountCodeCategory(m_accountCodeCategory);
        }

        public string ValidateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory)
        {
            return m_accountSubCategoryRepository.ValidateAccountCodeCategory(m_accountCodeCategory);
        }
    }
}
