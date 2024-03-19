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
    public class AccountTypesRepository : IAccountTypesRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public AccountTypesDisplayResult GetAccountTypes(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AccountTypesDisplayResult accountTypesDisplayResult = new AccountTypesDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("AccountTypes_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    accountTypesDisplayResult.AccountTypesList = result.Read<AccountTypes>().AsList();
                    accountTypesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return accountTypesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public AccountTypes GetAccountTypesDetails(int m_COAAccountTypeId)
        {
            AccountTypes accountTypesObj = new AccountTypes();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("AccountTypes_CRUD", new
                {
                    Action = "SELECTBYID",
                    COAAccountTypeId = m_COAAccountTypeId
                }, commandType: CommandType.StoredProcedure))
                {
                    accountTypesObj = result.Read<AccountTypes>().FirstOrDefault();
                }
                return accountTypesObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ValidateAccountTypes(AccountTypes m_validateAccountTypes)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("AccountTypes_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            AccountType = m_validateAccountTypes.AccountType.Trim(),
                                            COAAccountTypeId=m_validateAccountTypes.COAAccountTypeId
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate AccountType";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string CreateAccountType(AccountTypes m_accountTypes)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("AccountTypes_CRUD", new
                    {
                        Action = "INSERT",
                        AccountType = m_accountTypes.AccountType.Trim(),
                        Description = m_accountTypes.Description.Trim()
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    if (validateNameStatus == 0)
                    {
                        status = m_accountTypes.COAAccountTypeId.ToString();
                    }
                    else { status = validateNameStatus.ToString(); }
                    transactionObj.Commit();
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public string UpdateAccountTypes(AccountTypes m_accountTypes)
        {
            int validateNameStatus = 0;
            string status = "";
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    validateNameStatus = this.m_dbconnection.Query<int>("AccountTypes_CRUD", new
                    {
                        Action = "UPDATE",
                        AccountType = m_accountTypes.AccountType.Trim(),
                        Description = m_accountTypes.Description.Trim(),
                        COAAccountTypeId = m_accountTypes.COAAccountTypeId
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


        public bool DeleteAccountTypes(int m_COAAccountTypeId)
        {
            try
            {
                int result= this.m_dbconnection.Query<int>("AccountTypes_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    COAAccountTypeId = m_COAAccountTypeId
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
