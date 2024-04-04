using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class AccountCodeManager : IAccountCodeManager
    {
        private readonly IAccountCodeRepository m_accountCodeRepository;

        public AccountCodeManager(IAccountCodeRepository accountCodeRepository)
        {
            m_accountCodeRepository = accountCodeRepository;
        }

        public IEnumerable<AccountCodeCategory> GetAccountCodeCategories(int companyId)
        {
           return m_accountCodeRepository.GetAccountCodeCategories(companyId);
        }
        public IEnumerable<AccountCodeCategory> GetAllAccountCodeCategories()
        {
            return m_accountCodeRepository.GetAllAccountCodeCategories();
        }

        public IEnumerable<AccountType> GetAccountTypes(int companyId)
        {
            return m_accountCodeRepository.GetAccountTypes(companyId);
        }

        public IEnumerable<AccountCode> GetAccountCodesByAccountType(AccountCodesSearch accountCodesSearch)
        {
            return m_accountCodeRepository.GetAccountCodesByAccountType(accountCodesSearch);
        }

        public IEnumerable<SubCategory> GetSubCategoryByAccountType(SubCategorySearch accountCodesSearch)
        {
            return m_accountCodeRepository.GetSubCategoryByAccountType(accountCodesSearch);
        }

        public int CreateAccountCode(AccountCode accountCode)
        {
            return m_accountCodeRepository.CreateAccountCode(accountCode);
        }

        public int UpdateAccountCodes(AccountCodeList accountCodes)
        {
            return m_accountCodeRepository.UpdateAccountCodes(accountCodes);
        }

        public UploadResult UploadAccountCodes(string filePath, int userid)
        {
            return m_accountCodeRepository.UploadAccountCodes(filePath, userid);
        }
        public bool DeleteAccountCodes(AccountCodeDelete accountCatDelete)
        {
            return m_accountCodeRepository.DeleteAccountCodes(accountCatDelete);
        }
    }
}
