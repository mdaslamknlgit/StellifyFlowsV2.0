using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class AccountSubCategoryRepository : IAccountSubCategoryRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public AccountCodeCategoryDisplayResult GetAccountCodeCategory(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AccountCodeCategoryDisplayResult accountCodeCategoryDisplayResult = new AccountCodeCategoryDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AccountSubCategory_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    accountCodeCategoryDisplayResult.AccountCodeCategoryList = result.Read<AccountCodeCategory>().AsList();
                    accountCodeCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return accountCodeCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AccountCodeCategory GetAccountCodeCategoryDetails(int accountCodeCategoryId)
        {
            AccountCodeCategory accountCodeCategoryObj = new AccountCodeCategory();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("AccountSubCategory_CRUD", new
                {

                    Action = "SELECTBYID",
                    AccountCodeCategoryId = accountCodeCategoryId
                }, commandType: CommandType.StoredProcedure))
                {
                    accountCodeCategoryObj = result.Read<AccountCodeCategory>().FirstOrDefault();
                }
                return accountCodeCategoryObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ValidateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("AccountSubCategory_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            AccountCodeName = m_accountCodeCategory.AccountCodeName.Trim(),
                                            CompanyId = m_accountCodeCategory.CompanyId,
                                            AccountCodeCategoryId = m_accountCodeCategory.AccountCodeCategoryId
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate AccountCode Name";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string CreateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("AccountSubCategory_CRUD", new
                    {
                        Action = "INSERT",
                        AccountCodeName = m_accountCodeCategory.AccountCodeName.Trim(),
                        Description = m_accountCodeCategory.Description.Trim(),
                        CreatedBy = m_accountCodeCategory.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CompanyId = m_accountCodeCategory.CompanyId
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    if (validateNameStatus == 0)
                    {
                        status = m_accountCodeCategory.AccountCodeCategoryId.ToString();
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public string UpdateAccountCodeCategory(AccountCodeCategory m_accountCodeCategory)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("AccountSubCategory_CRUD", new
                    {
                        Action = "UPDATE",
                        AccountCodeName = m_accountCodeCategory.AccountCodeName.Trim(),
                        Description = m_accountCodeCategory.Description.Trim(),
                        AccountCodeCategoryId = m_accountCodeCategory.AccountCodeCategoryId,
                        CreatedBy = m_accountCodeCategory.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CompanyId = m_accountCodeCategory.CompanyId
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    //if (validateNameStatus == 0)
                    //{
                    //    status = "Duplicate";
                    //}
                    //else {
                    status = validateNameStatus.ToString();
                    //}
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }

        }


        public bool DeleteAccountCodeCategory(int accountCodeCategoryId, int userId,int companyId)
        {
            try
            {
                int result= this.m_dbconnection.Query<int>("AccountSubCategory_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    AccountCodeCategoryId = accountCodeCategoryId,
                                                    CreatedBy = userId,
                                                    CreatedDate=DateTime.Now,
                                                    CompanyId = companyId
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (result == 1)
                {
                    return false;
                }
                else
                    return true;
            }
            catch (Exception ex)
            { throw ex; }
        }




    }
}
