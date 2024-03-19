using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class AccountsManager : IAccountsManager
    {
        public AccountsResult SearchAccounts(UserInfo MyUserInfo, SearchAccounts searchAccounts)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.SearchAccounts(MyUserInfo, searchAccounts);
        }

        public AccountsResult SearchAccountsWithViews(int ModuleId, int FormId, int ViewId, UserInfo MyUserInfo, SearchAccounts searchAccounts)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.SearchAccountsWithViews(ModuleId,FormId,ViewId,MyUserInfo, searchAccounts);
        }
        public AccountsResult GetAllAccounts(UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetAllAccounts(MyUserInfo);
        }

        public AccountsDTO GetAccountById(int Id, UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetAccountById(Id);
        }

        public AccountsDTO GetAccountIdByName(string AccountName, UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetAccountIdByName(AccountName, MyUserInfo);
        }
        public IEnumerable<AccountsDTO> GetAccountNameList(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<AccountsDomainItem> GetAccountsDomainItem(UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetAccountsDomainItem(MyUserInfo);
        }

        public IEnumerable<AccountsDomainList> GetAccountsDomainList(UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetAccountsDomainList(MyUserInfo);
        }

        public IEnumerable<ContactsAccountsList> GetContactsByAccounts(string SearchTerm, UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetContactsByAccounts(SearchTerm,MyUserInfo);
        }
        public List<Account> GetContactsByAccount(UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetContactsByAccount(MyUserInfo);
        }
        public ResultReponse CreateAccount(AccountsDTO MyAccount, UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.CreateAccount(MyAccount,MyUserInfo);
        }

        public ResultReponse UpdateAccount(AccountsDTO MyAccount, UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.UpdateAccount(MyAccount, MyUserInfo);
        }
        public ResultReponse DeleteAccount(AccountsDTO MyAccount, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IndustryResult GetIndustryList(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }


        public IEnumerable<IndustryDomainItem> GetIndustryDomainItem(UserInfo MyUserInfo)
        {
            AccountsRepository m_AccountsRepository = new AccountsRepository(MyUserInfo);
            return m_AccountsRepository.GetIndustryDomainItem(MyUserInfo);
        }


    }
}
