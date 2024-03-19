using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Service.Interface
{
    public interface IAccountsRepository
    {
        AccountsResult SearchAccounts(UserInfo MyUserInfo, SearchAccounts searchAccounts);

        AccountsResult SearchAccountsWithViews(int ModuleId, int FormId, int ViewId, UserInfo MyUserInfo, SearchAccounts searchAccounts);
        AccountsResult GetAllAccounts(UserInfo MyUserInfo);
        AccountsDTO GetAccountById(int Id);

        AccountsDTO GetAccountIdByName(string AccountName, UserInfo MyUserInfo);
        IEnumerable<AccountsDTO> GetAccountNameList(UserInfo MyUserInfo);
        IEnumerable<AccountsDomainItem> GetAccountsDomainItem(UserInfo MyUserInfo);

        List<Account> GetContactsByAccount(UserInfo MyUserInfo);

        IEnumerable<ContactsAccountsList> GetContactsByAccounts(string SearchTerm, UserInfo MyUserInfo);
        IEnumerable<AccountsDomainList> GetAccountsDomainList(UserInfo MyUserInfo);
        ResultReponse UpdateAccount(AccountsDTO MyAccount, UserInfo MyUserInfo);
        ResultReponse CreateAccount(AccountsDTO MyAccount, UserInfo MyUserInfo);
        ResultReponse DeleteAccount(AccountsDTO MyAccount, UserInfo MyUserInfo);
        IndustryResult GetIndustryList(UserInfo MyUserInfo);

        IEnumerable<IndustryDomainItem> GetIndustryDomainItem(UserInfo MyUserInfo);



    }
}
