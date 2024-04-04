using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Service.Interface;
using Dapper;
using System.Configuration;
using System.Data.SqlClient;
using UELPM.Model.Models;



namespace UELPM.Service.Repositories
{
    public class EntityImportRepository : IEntityImportRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string DeleteQueryStr = "";
        string InsertQueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public EntityImportRepository(UserInfo MyUserInfo)
        {
            //TODO
        }
        public ResultReponse EntityImport(EntityImportList entityImportList, int EntityId, string EntityName, int UserId, int CompanyId, Model.UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            int ReturnValue = 0;
            StringBuilder EntityStr = new StringBuilder();

            LeadsRepository leadsRepository = new LeadsRepository();

            DealsRepository dealsRepository = new DealsRepository(MyUserInfo);
            AccountsRepository accountsRepository = new AccountsRepository(MyUserInfo);
            SearchAccounts searchAccounts = new SearchAccounts();

            string InsertQueryStr = "";
            string AccountInsertQueryStr = "";

            ResultReponse AccountsResultResponse = new ResultReponse();
            int AccountId = 0;
            int ContactId = 0;
            int SalutationId = 0;

            QuickAccount quickAccount = new QuickAccount();

            IEnumerable<SalutationDTO> SalutationList = null;

            foreach (EntityImport entityImport in entityImportList.EntityList)
            {
                try
                {
                    if (!string.IsNullOrEmpty(entityImport.Title))
                    {
                        SalutationList = leadsRepository.GetSalutation(MyUserInfo);
                        var SalId = SalutationList.Where(x => x.SalName == entityImport.Title).FirstOrDefault().SalId;
                        if (SalId > 0)
                        {
                            SalutationId = SalId;
                        }
                        else
                        {
                            SalutationId = 0;
                        }
                    }

                    //Check Account Name Already Exists
                    if (!string.IsNullOrEmpty(entityImport.AccountName))
                    {
                        searchAccounts.AccountName = entityImport.AccountName;
                        var AccountInfo = accountsRepository.GetAccountIdByName(entityImport.AccountName, MyUserInfo);
                        if (AccountInfo != null)
                        {
                            AccountId = AccountInfo.Id;
                        }
                        else
                        {
                            //Insert Account In Accounts Table And get AccountId
                            quickAccount.AccountName = entityImport.AccountName;
                            AccountsResultResponse = dealsRepository.CreateQuickAccount(quickAccount, MyUserInfo);
                            if (AccountsResultResponse.Status == "SUCCESS")
                            {
                                var Id = Convert.ToInt32(AccountsResultResponse.Data.Split('-')[0].ToString());
                                AccountId = Id;
                            }
                            else
                            {
                                AccountId = 0;
                            }

                        }
                    }
                    else
                    {
                        AccountId = 0;
                    }

                    InsertQueryStr = @"Insert Contacts 
                                    (
                                        FirstName,LastName,AccountId,SalId,CreatedBy,CreatedDate,EmailId,
                                        OwnerId,LastModifiedBy,LastModifiedDate
                                    )
                                    Values
                                    (
                                        @FirstName,@LastName,@AccountId,@SalId,@CreatedBy,@CreatedDate,@EmailId,
                                        @OwnerId,@LastModifiedBy,@LastModifiedDate
                                    );
                                    SELECT SCOPE_IDENTITY();";

                    ContactId = this.m_dbconnection.QuerySingle<int>(InsertQueryStr,
                                                   new
                                                   {
                                                       FirstName = entityImport.FirstName,
                                                       LastName = entityImport.LastName,
                                                       EmailId=entityImport.Email,
                                                       AccountId = AccountId,      
                                                       Salid= SalutationId,
                                                       OwnerId=UserId,
                                                       createdBy = UserId,
                                                       createdDate = DateTime.Now,
                                                       LastModifiedBy=UserId,
                                                       LastModifiedDate=DateTime.Now
                                                   });

                    if(ContactId>0)
                    {

                    }


                    //EntityStr.AppendLine(string.Format("First Name : {0}, Last Name: {1}", entityImport.FirstName, entityImport.LastName));
                    ReturnValue = 1;

                }
                catch (Exception exp)
                {

                    MyResultReponse.Data = ReturnValue.ToString();
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Imported Error ";
                }
            }
            MyResultReponse.Data = EntityStr.ToString();
            MyResultReponse.Status = "SUCCESS";
            MyResultReponse.StatusCode = "SUCCESS";
            MyResultReponse.Message = "Imported successfully";

            return MyResultReponse;
        }

    }
}
