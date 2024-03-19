using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAccountSubCategoryRepository
    {
        AccountCodeCategoryDisplayResult GetAccountCodeCategory(GridDisplayInput gridDisplayInput);
        AccountCodeCategory GetAccountCodeCategoryDetails(int accountCodeCategoryId);
        string ValidateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory);
        string CreateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory);
        string UpdateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory);
        bool DeleteAccountCodeCategory(int accountCodeCategoryId, int userId, int companyId);

    }
}
