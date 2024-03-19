using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IAccountCodeManager
    {
        IEnumerable<AccountCodeCategory> GetAccountCodeCategories(int companyId);
        IEnumerable<AccountCodeCategory> GetAllAccountCodeCategories();
        IEnumerable<AccountType> GetAccountTypes(int companyId); 
        IEnumerable<AccountCode> GetAccountCodesByAccountType(AccountCodesSearch accountCodesSearch);
        IEnumerable<SubCategory> GetSubCategoryByAccountType(SubCategorySearch accountCodesSearch);
        int CreateAccountCode(AccountCode accountCode);
        int UpdateAccountCodes(AccountCodeList accountCodes); 
         UploadResult UploadAccountCodes(string filePath, int userid);
        bool DeleteAccountCodes(AccountCodeDelete accountCatDelete);
    }
}
