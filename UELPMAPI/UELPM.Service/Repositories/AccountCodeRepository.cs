using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class AccountCodeRepository : IAccountCodeRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;
        public IEnumerable<AccountCodeCategory> GetAccountCodeCategories(int companyId)
        {
            return this.m_dbconnection.Query<AccountCodeCategory>("GetAccountCodeCategories", 
                new {
                CompanyId = companyId
            }, commandType: CommandType.StoredProcedure).ToList();
        }
        public IEnumerable<AccountCodeCategory> GetAllAccountCodeCategories()
        {
            return this.m_dbconnection.Query<AccountCodeCategory>("SELECT AccountCodeCategoryId, AccountCodeName FROM [dbo].[AccountCodeCategory] WHERE  IsDeleted=0 order by AccountCodeName", commandType: CommandType.Text).ToList();
        }
        public IEnumerable<AccountType> GetAccountTypes(int companyId)
        {
            return this.m_dbconnection.Query<AccountType>("AccountCodes_CRUD", 
                                          new
                                          {
                                              Action = "SELECT",
                                              CompanyId = companyId
                                          }, commandType: CommandType.StoredProcedure).ToList();
        }
     
        public IEnumerable<AccountCode> GetAccountCodesByAccountType(AccountCodesSearch accountCodesSearch)
        {         
            var accountCodes = this.m_dbconnection.Query<AccountCode>("AccountCodes_CRUD",
                                   new
                                   {
                                       Action = "SELECTBYID",
                                       AccountType = accountCodesSearch.AccountType,
                                       CompanyId = accountCodesSearch.CompanyId,
                                       Search = accountCodesSearch.SearchKey
                                   }, commandType: CommandType.StoredProcedure).ToList();

            return accountCodes;
        }

        public IEnumerable<SubCategory> GetSubCategoryByAccountType(SubCategorySearch accountCodesSearch)
        {
            var accountCodes = this.m_dbconnection.Query<SubCategory>("SubCategoryByAccountType",
                                   new
                                   {
                                       AccountTypeId = accountCodesSearch.AccountTypeId,
                                       CompanyId = accountCodesSearch.CompanyId,
                                       Search = accountCodesSearch.SearchKey
                                   }, commandType: CommandType.StoredProcedure).ToList();

            return accountCodes;
        }


        public int UpdateAccountCodes(AccountCodeList accountCodes)
        {
            try
            {
                this.m_dbconnection.Open(); 
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {                  
                        List<DynamicParameters> accountCodesToUpdate = new List<DynamicParameters>();                     
                        foreach (var accountCode in accountCodes.AccountCodes)
                        {
                            if (accountCode.AccountCodeCategoryId != null)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AccountCodeId", accountCode.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@AccountCodeCategoryId", accountCode.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", accountCodes.CompanyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@AccountType", accountCode.AccountType.Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AccountCode", accountCode.AccountCodeName.Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Description", accountCode.Description.Trim(), DbType.String, ParameterDirection.Input);
                                itemObj.Add("@UpdatedBy", accountCode.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@UpdatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                accountCodesToUpdate.Add(itemObj);
                            }
                        }

                        var result = this.m_dbconnection.Execute("AccountCodes_CRUD", accountCodesToUpdate,
                                                                    transaction: objTransaction,
                                                                    commandType: CommandType.StoredProcedure);

                        objTransaction.Commit();
                       
                        return result;
                    }
                    catch (Exception e)
                    {
                        objTransaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateAccountCode(AccountCode accountCode)
        {
            this.m_dbconnection.Open();//opening the connection...

            using (var objTransaction = this.m_dbconnection.BeginTransaction())
            {

                try
                {
                    var accountCodeId = this.m_dbconnection.QueryFirstOrDefault<int>("AccountCodes_CRUD",
                    new
                    {
                        Action = "NEWRECORD",                      
                        CompanyId = accountCode.CompanyId,
                        AccountCodeCategoryId = accountCode.AccountCodeCategoryId,
                        AccountType = accountCode.AccountType.Trim(),
                        AccountCode = accountCode.AccountCodeName.Trim(),
                        Description = accountCode.Description.Trim(),                     
                        CreatedBy = accountCode.CreatedBy,
                        CreatedDate = DateTime.Now
                    
                    }, commandType: CommandType.StoredProcedure, transaction: objTransaction);

                    objTransaction.Commit();

                    return accountCodeId;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    objTransaction.Rollback();
                    throw e;
                }
            }
        }


        public UploadResult UploadAccountCodes(string filePath, int userId)
        {
            try
            {
                UploadResult uploadResult = null;
                string companies = string.Empty;
                int count = 0;
                int Fcount = 0;
                List<AccountCode> accountCodeList = new List<AccountCode>();
                List<DynamicParameters> accountCodesToUpdate = new List<DynamicParameters>();                            
                this.m_dbconnection.Open();
                DataTable dtAccountCodes = ExcelUpload.ExcelUpload.ReadAsDataTable(filePath);
                var grouped = from table in dtAccountCodes.AsEnumerable()
                              group table by new { placeCol = table["Entity"] } into groupby
                              select new
                              {
                                  Value = groupby.Key,
                                  ColumnValues = groupby
                              };

                uploadResult = new UploadResult();
                companies = "<span >Due to companies are not availble in db: </span> ";
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        foreach (var key in grouped)
                        {
                            //checking company whether exisits or not in database
                            CompanyDetails objCompany = GetCompanyDetails(Convert.ToString(key.Value.placeCol));
                            if (objCompany != null)
                            {
                                foreach (var columnValue in key.ColumnValues)
                                {
                                    DynamicParameters itemObj = new DynamicParameters();
                                    var accountType = Convert.ToString(columnValue["Type"]);
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CompanyId", objCompany.CompanyId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@AccountType", Convert.ToString(columnValue["Type"]).Trim(), DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@SubCategory", Convert.ToString(columnValue["Sub Category"]).Trim(), DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AccountCode", Convert.ToString(columnValue["Account Code"]).Trim(), DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@Description", Convert.ToString(columnValue["Description"]).Trim(), DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", userId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    itemObj.Add("@TotalRows", dbType: DbType.Int32, direction: ParameterDirection.Output);
                                    accountCodesToUpdate.Add(itemObj);
                                }
                            }
                            else
                            {
                                Fcount = Fcount + 1;
                            }
                        }

                        var result = this.m_dbconnection.Execute("AccountCodes_CRUD", accountCodesToUpdate,
                                    transaction: objTransaction,
                                    commandType: CommandType.StoredProcedure);

                        accountCodesToUpdate.ForEach(data => {
                            result = data.Get<int>("@TotalRows");
                            if (result == 1)
                                count++;
                            else
                                Fcount++;

                        });

                        objTransaction.Commit();
                        uploadResult.UploadedRecords = count;
                        uploadResult.FailedRecords = Fcount;
                        return uploadResult;
                    }
                    catch (Exception e)
                    {
                        objTransaction.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }    

        private CompanyDetails GetCompanyDetails(string companyName)
        {
            sharedRepository = new SharedRepository();
            return sharedRepository.GetCompanyDetails(companyName);
        }

        public bool DeleteAccountCodes(AccountCodeDelete accountCatDelete)
        {
          

                    try
                    {
                        #region delete account codes...

                        var accountcodeDeleteResult = this.m_dbconnection.Query<int>("AccountCodes_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    AccountCodeCategoryId = accountCatDelete.AccountCatId,
                                                                    AccountCodeId = accountCatDelete.AccountCodeId,
                                                                    CompanyId = accountCatDelete.CompanyId,
                                                                    CreatedBy = accountCatDelete.ModifiedBy,
                                                                    CreatedDate = DateTime.Now
                                                                },                                                              
                                                                commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion
                        if (accountcodeDeleteResult == 1)
                        {
                            return false;
                        }
                        else
                            return true;
                  
                    }
                    catch (Exception e)
                    {
                        throw e;
                    }
        }
    }
}
