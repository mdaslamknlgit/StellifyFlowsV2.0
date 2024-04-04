using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAccountCodeRepository
    {
        IEnumerable<AccountCodeCategory> GetAccountCodeCategories(int companyId);
        IEnumerable<AccountCodeCategory> GetAllAccountCodeCategories();
        IEnumerable<AccountType> GetAccountTypes(int companyId); 
        IEnumerable<AccountCode> GetAccountCodesByAccountType(AccountCodesSearch accountCodesSearch);
        IEnumerable<SubCategory> GetSubCategoryByAccountType(SubCategorySearch accountCodesSearch);
        int CreateAccountCode(AccountCode accountCode);
        int UpdateAccountCodes(AccountCodeList accountCodes);
        UploadResult UploadAccountCodes(string filePath, int userId);
        bool DeleteAccountCodes(AccountCodeDelete accountCatDelete);
    }
}
