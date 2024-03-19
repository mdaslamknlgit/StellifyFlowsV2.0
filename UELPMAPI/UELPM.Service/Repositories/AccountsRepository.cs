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
    public class AccountsRepository : IAccountsRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public AccountsRepository(UserInfo MyUserInfo)
        {
            //TODO
        }
        public AccountsResult GetAllAccounts(UserInfo MyUserInfo)
        {
            AccountsResult accountsResult = new AccountsResult();
            QueryStr = string.Format(" Select * From Accounts As Accts Where 1=1 And Accts.CreatedBy = {0} ", MyUserInfo.UserId);

            CountQueryStr = string.Format(" Select Count(*) From Accounts As Accts Where 1=1 And Accts.CreatedBy = {0}  ", MyUserInfo.UserId); ;

            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    accountsResult.Status = "SUCCESS";
                    accountsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    accountsResult.Accounts = result.Read<AccountsDTO>().AsList();
                    //total number of purchase orders
                    accountsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return accountsResult;
            }
            catch (Exception exp)
            {
                accountsResult.Status = "ERROR";
                accountsResult.Message = exp.ToString();
            }
            return accountsResult;


            return accountsResult;
        }

        public AccountsResult SearchAccounts(UserInfo MyUserInfo, SearchAccounts searchAccounts)
        {
            AccountsResult accountsResult  = new AccountsResult();
            QueryStr =string.Format(" Select * From Accounts As Accts Where 1=1 And Accts.CreatedBy = {0} ", searchAccounts.UserId);

            CountQueryStr = string.Format(" Select Count(*) From Accounts As Accts Where 1=1 And Accts.CreatedBy = {0}  ", searchAccounts.UserId); ;

            if (!string.IsNullOrEmpty(searchAccounts.AccountName))
            {
                QueryStr = QueryStr + " \nAnd ( Accts.AccountName like '%" + searchAccounts.AccountName + "%' )";

                CountQueryStr = CountQueryStr + " \nAnd ( Accts.AccountName like '%" + searchAccounts.AccountName + "%' )";

            }

            if (!string.IsNullOrEmpty(searchAccounts.MainPhone))
            {
                QueryStr = QueryStr + " And ( Accts.MainPhone like '%" + searchAccounts.MainPhone + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.MainPhone like '%" + searchAccounts.MainPhone + "%')";
            }

            if (!string.IsNullOrEmpty(searchAccounts.OtherPhone))
            {
                QueryStr = QueryStr + " And ( Accts.OtherPhone like '%" + searchAccounts.OtherPhone + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.OtherPhone like '%" + searchAccounts.OtherPhone + "%')";
            }
            if (!string.IsNullOrEmpty(searchAccounts.Mobile))
            {
                QueryStr = QueryStr + " And ( Accts.Mobile like '%" + searchAccounts.Mobile + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.Mobile like '%" + searchAccounts.Mobile + "%')";
            }

            if (!string.IsNullOrEmpty(searchAccounts.EmailId))
            {
                QueryStr = QueryStr + " And ( Accts.EmailId like '%" + searchAccounts.EmailId + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.EmailId like '%" + searchAccounts.EmailId + "%')";
            }


          QueryStr = QueryStr +  string.Format(" And Accts.OwnerId = {0} ", searchAccounts.UserId);
          CountQueryStr = CountQueryStr + string.Format(" And Accts.OwnerId = {0} ", searchAccounts.UserId);

            //if (!string.IsNullOrEmpty(searchAccounts.FromDate))
            //{
            //    QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", searchAccounts.FromDate, searchAccounts.ToDate);
            //    CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", searchAccounts.FromDate, searchAccounts.ToDate);
            //}

            //QueryStr = QueryStr + string.Format(" And Leads.CreatedBy = {0} ", MyUserInfo.UserId);


            if (searchAccounts.Skip == 0 && searchAccounts.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By Accts.CreatedDate Desc;";
            }
            if (searchAccounts.Skip >= 0 && searchAccounts.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By Accts.CreatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", searchAccounts.Skip, searchAccounts.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    accountsResult.Status = "SUCCESS";
                    accountsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    accountsResult.Accounts = result.Read<AccountsDTO>().AsList();
                    //total number of purchase orders
                    accountsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return accountsResult;
            }
            catch (Exception exp)
            {
                accountsResult.Status = "ERROR";
                accountsResult.Message = exp.ToString();
            }
            return accountsResult;
        }

        public AccountsResult SearchAccountsWithViews(int ModuleId, int FormId, int ViewId, UserInfo MyUserInfo, SearchAccounts searchAccounts)
        {
            AccountsResult accountsResult = new AccountsResult();

            string ViewSQL = "";
            AppViewsDTO appViewsDTO = new AppViewsDTO();
            DealsResult dealsResult = new DealsResult();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);

            appViewsDTO = appViewsRepository.GetAppViewsByModuleId(ModuleId, FormId, ViewId, MyUserInfo);

            ViewSQL = appViewsDTO.ViewSQL;

            QueryStr = ViewSQL;

            CountQueryStr = "Select Count(*) From Accounts As Accts Where 1=1";

            if (string.IsNullOrEmpty(QueryStr))
            {
                QueryStr = @"Select * From Accounts As Accts Where 1=1";
                CountQueryStr = "Select Count(*) From Accounts As Accts Where 1=1";
            }


            if (!string.IsNullOrEmpty(searchAccounts.AccountName))
            {
                QueryStr = QueryStr + " \nAnd ( Accts.AccountName like '%" + searchAccounts.AccountName + "%' )";

                CountQueryStr = CountQueryStr + " \nAnd ( Accts.AccountName like '%" + searchAccounts.AccountName + "%' )";

            }

            if (!string.IsNullOrEmpty(searchAccounts.MainPhone))
            {
                QueryStr = QueryStr + " And ( Accts.MainPhone like '%" + searchAccounts.MainPhone + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.MainPhone like '%" + searchAccounts.MainPhone + "%')";
            }

            if (!string.IsNullOrEmpty(searchAccounts.OtherPhone))
            {
                QueryStr = QueryStr + " And ( Accts.OtherPhone like '%" + searchAccounts.OtherPhone + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.OtherPhone like '%" + searchAccounts.OtherPhone + "%')";
            }
            if (!string.IsNullOrEmpty(searchAccounts.Mobile))
            {
                QueryStr = QueryStr + " And ( Accts.Mobile like '%" + searchAccounts.Mobile + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.Mobile like '%" + searchAccounts.Mobile + "%')";
            }

            if (!string.IsNullOrEmpty(searchAccounts.EmailId))
            {
                QueryStr = QueryStr + " And ( Accts.EmailId like '%" + searchAccounts.EmailId + "%')";
                CountQueryStr = CountQueryStr + " And ( Accts.EmailId like '%" + searchAccounts.EmailId + "%')";
            }

            QueryStr = QueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));
            CountQueryStr = CountQueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));
            //if (!string.IsNullOrEmpty(searchAccounts.FromDate))
            //{
            //    QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", searchAccounts.FromDate, searchAccounts.ToDate);
            //    CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, Leads.CreatedDate, 23) between '{0}' And '{1}'", searchAccounts.FromDate, searchAccounts.ToDate);
            //}

            //QueryStr = QueryStr + string.Format(" And Leads.CreatedBy = {0} ", MyUserInfo.UserId);


            if (searchAccounts.Skip == 0 && searchAccounts.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By Accts.LastModifiedDate Desc;";
            }
            if (searchAccounts.Skip >= 0 && searchAccounts.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By Accts.LastModifiedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", searchAccounts.Skip, searchAccounts.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    accountsResult.Status = "SUCCESS";
                    accountsResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    accountsResult.Accounts = result.Read<AccountsDTO>().AsList();
                    //total number of purchase orders
                    accountsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return accountsResult;
            }
            catch (Exception exp)
            {
                accountsResult.Status = "ERROR";
                accountsResult.Message = exp.ToString();
            }
            return accountsResult;
        }
        public AccountsDTO GetAccountIdByName(string AccountName,UserInfo MyUserInfo)
        {
            QueryStr = string.Format(" Select * From Accounts As Accts Where AccountName='{0}'", AccountName);

            AccountsDTO AccountsInfo = this.m_dbconnection.Query<AccountsDTO>(QueryStr).FirstOrDefault();

            return AccountsInfo;
        }
        public AccountsDTO GetAccountById(int Id)
        {
            QueryStr = string.Format(" Select * From Accounts As Accts Where Id= {0} ", Id);

            AccountsDTO AccountsInfo = this.m_dbconnection.Query<AccountsDTO>(QueryStr).FirstOrDefault();

            return AccountsInfo;
        }

        public IEnumerable<AccountsDTO> GetAccountNameList(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<AccountsDomainItem> GetAccountsDomainItem(UserInfo MyUserInfo)
        {

            IEnumerable<AccountsDomainItem> accountsDomainsList  = null;

            QueryStr = string.Format(" Select Id As AccountId,AccountName As AccountName From Accounts As Accts Where IsActive=1;");

            accountsDomainsList = this.m_dbconnection.Query<AccountsDomainItem>(QueryStr).ToList();


            return accountsDomainsList;
        }

        public List<Account> GetContactsByAccount(UserInfo MyUserInfo)
        {

            QueryStr = @"
                                 SELECT acc.*, i.*  FROM Accounts acc
                                  inner join Contacts i ON i.AccountId = acc.Id;";

            var lookup = new Dictionary<int, Account>();

                    _ = this.m_dbconnection.Query<Account, Contact, Account>(QueryStr,
              (acc, ins) =>
              {
                  if (!lookup.TryGetValue(acc.Id, out var accEntry))
                  {
                      accEntry = acc;
                      accEntry.Contacts = new List<Contact>();
                      lookup.Add(acc.Id, accEntry);
                  }

                  accEntry.Contacts.Add(ins);
                  return accEntry;

              }, splitOn: "Id");

            return lookup.Values.AsList();
        }

        public IEnumerable<AccountsDomainList> GetAccountsDomainList(UserInfo MyUserInfo)
        {

            IEnumerable<AccountsDomainList> accountsDomainsList = null;

            QueryStr = @"SELECT Accounts.Id AS AccountId, Accounts.AccountName, 
                                Contacts.Id AS ContactId,CONCAT(Contacts.FirstName, Contacts.LastName) ContactName
                                FROM     Accounts LEFT OUTER JOIN
                                Contacts ON Accounts.Id = Contacts.AccountId";

            //IEnumerable<AccountsDomainItem> accountsDomainItems = this.m_dbconnection.Query<AccountsDomainItem>(QueryStr).ToList();

            string MultipleQuery = @"
                                    SELECT Id AS AccountId, AccountName As AccountName From Accounts;
                                    Select Id AS ContactId,AccountId As 'AccountId', Concat(FirstName, LastName) As ContactName From Contacts;";

            var res = this.m_dbconnection.QueryMultiple(MultipleQuery);

            var acc = res.Read<AccountsDomainList>();
            var contacts = res.Read<ContactsDomainItem>();

            foreach (var account in acc)
            {
                account.Contatcs = contacts.Where(i => i.AccountId == account.AccountId).ToList();
            }
            return acc.ToList();

            //*****************************************************************************************************************************
            //Sample
            //*****************************************************************************************************************************
            //public List<Account> GetAllAccounts()
            //{
            //    var res = sqlConnection.QueryMultiple(SqlConstants.MultipleQuery);

            //    var accounts = res.Read<Account>(buffered: true).AsList();
            //    var installments = res.Read<Installment>();

            //    var lookup = new Dictionary<Guid, int>();

            //    for (int i = 0; i < accounts.Count; i++)
            //    {
            //        lookup.Add(accounts[i].Id, i);
            //    }

            //    foreach (var installment in installments)
            //    {
            //        if (lookup.TryGetValue(installment.AccountId, out int i))
            //        {
            //            accounts[i].Installments.Add(installment);
            //        }
            //    }

            //    return accounts;
            //}
            //*****************************************************************************************************************************

            //try
            //{
            //    var lookup = new Dictionary<int, AccountsDomainList>();
            //    this.m_dbconnection.Query<AccountsDomainList,ContactsDomainItem, AccountsDomainList>(QueryStr, (c, tg) =>
            //    {
            //        AccountsDomainList accountDomainList;
            //        if (!lookup.TryGetValue(c.AccountId, out var clist))
            //        {
            //            c = clist;
            //            c.Contatcs = new List<ContactsDomainItem>();
            //            lookup.Add(c.AccountId,  c);
            //        }
            //        c.Contatcs.Add(tg);


            //        return c;
            //    }, new
            //    {
            //        SearchKey = "SELECT_ALL"
            //    }, commandType: CommandType.Text, splitOn: "ContactId").AsQueryable();
            //    var resultList = lookup.Values;
            //    accountsDomainsList = resultList;
            //    return accountsDomainsList;
            //}
            //catch (Exception e)
            //{
            //    throw e;
            //}

            //try
            //{
            //    var lookup = new Dictionary<int, TaxType>();
            //    this.m_dbconnection.Query<TaxType, SalesTaxGroup, TaxType>(SP_Name_TaxType, (c, tg) =>
            //    {
            //        TaxType taxType;
            //        if (!lookup.TryGetValue(c.TaxTypeId, out taxType))
            //        {
            //            lookup.Add(c.TaxTypeId, taxType = c);
            //        }
            //        taxType.TaxGroup = tg;
            //        return taxType;
            //    }, new
            //    {
            //        Action = "SELECT_ALL",
            //        CompanyId = companyId
            //    }, commandType: CommandType.StoredProcedure, splitOn: "TaxTypeId,TaxGroupId").AsQueryable();
            //    var resultList = lookup.Values;
            //    return resultList;
            //}
            //catch (Exception e)
            //{
            //    throw e;
            //}
        }

        public IEnumerable<ContactsAccountsList> GetContactsByAccounts(string SearchTerm,UserInfo MyUserInfo)
        {
            IEnumerable<ContactsAccountsList> contactsAccountsList = null;
            QueryStr = @"
                        Select c.Id As ContactId, CONCAT_WS (' ',c.FirstName,c.LastName) As ContactName,
                        a.Id As AccountId,a.AccountName As AccountName,c.AccountId,
                        CONCAT_WS(' ',c.FirstName,c.LastName,a.AccountName) As 'Contact_Account'
                        From Contacts c
                        Inner Join Accounts a on a.Id=c.AccountId
                        Where 1=1";


            if (!string.IsNullOrEmpty(SearchTerm))
            {
                QueryStr = QueryStr + string.Format(" \nAnd CONCAT_WS(' ',c.FirstName,c.LastName,a.AccountName) Like '%{0}%'", SearchTerm);
            }

            QueryStr = QueryStr + " \nOrder By a.AccountName ASC;";
            try
            {

                contactsAccountsList = this.m_dbconnection.Query<ContactsAccountsList>(QueryStr).ToList();

                return contactsAccountsList;
            }
            catch (Exception exp)
            {
                throw;
            }
            return contactsAccountsList;
        }
        public ResultReponse CreateAccount(AccountsDTO MyAccount, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            string emailId = "";
            string EmailCheckQuery = "";
            try
            {

                int NewTemplateId = 0;
                const string sql = @"Select count(*)+1 from Accounts;";
                int Acctno = this.m_dbconnection.Query<int>(sql).FirstOrDefault();

                const string sql1 = @"Select AccountName from Accounts  Where AccountName=@AccountName;";
                string AccountName = this.m_dbconnection.Query<string>(sql1, new Dictionary<string, object> { { "AccountName", MyAccount.AccountName } }).FirstOrDefault();

                if (!string.IsNullOrEmpty(MyAccount.EmailId))
                {
                    EmailCheckQuery = @"Select emailId from Accounts  Where emailId=@emailId;";
                    emailId = this.m_dbconnection.Query<string>(EmailCheckQuery, new Dictionary<string, object> { { "emailId", MyAccount.EmailId } }).FirstOrDefault();
                }
                //if (Acctno != null)
                //{
                //    MyResultReponse.Status = "ERROR";
                //    MyResultReponse.StatusCode = "ERROR";
                //    MyResultReponse.Message = "Account Number Already Exists...!!!";
                //    MyResultReponse.Data = MyAccount.ToString();
                //}

                //else
                if (AccountName != null)
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Account Name Already Exists...!!!";
                    MyResultReponse.Data = AccountName.ToString();
                }
                else if (!string.IsNullOrEmpty(emailId))
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "EmailId Already Exists...!!!";
                    MyResultReponse.Data = emailId.ToString();
                }



                else
                {
                    string insertUserSql = @"INSERT Accounts(acctNo,
                                            AccountName,
                                            leadId,
                                            leadNo,
                                            contactId,
                                            relId,
                                            curId,
                                            mainPhone,
                                            otherPhone,
                                            emailId,
                                            Mobile,
                                            terId,
                                            acctCatId,
                                            indsId,
                                            ANNUALREVENUE,
                                            noOfEmployees,
                                            sicCode,
                                            tickerSymbol,
                                            ownUserId,
                                            creditLimit,
                                            payTermId,
                                            priceListId,
                                            creditHold,
                                            acctDesc,
                                            campaignId,
                                            regardingId,
                                            regarId,
                                            website,
                                            isActive,
                                            OwnerId,
                                            createdBy,
                                            createdDate,
                                            LastModifiedBy,
                                            LastModifiedDate)
                                            values(@acctNo,@AccountName,@leadId,@leadNo,@contactId,@relId,@curId,@mainPhone,
                                                    @otherPhone,@emailId,@Mobile,@terId,@acctCatId,@indsId,
                                                    @ANNUALREVENUE,@noOfEmployees,@sicCode,@tickerSymbol,@ownUserId,
                                                    @creditLimit,@payTermId,@priceListId,@creditHold,@acctDesc,@campaignId,@regardingId,
                                                    @regarId,@website,@isActive,@OwnerId,@createdBy,@createdDate,@LastModifiedBy,@LastModifiedDate);
                                    SELECT SCOPE_IDENTITY();";
                    NewTemplateId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                    new
                                                    {
                                                        AcctNo = Acctno,
                                                        AccountName = MyAccount.AccountName,
                                                        leadId = MyAccount.LeadId,
                                                        LeadNo = MyAccount.LeadNo,
                                                        ContactId = MyAccount.ContactId,
                                                        relId = MyAccount.RelId,
                                                        CurId = MyAccount.CurId,
                                                        MainPhone = MyAccount.MainPhone,
                                                        OtherPhone = MyAccount.OtherPhone,
                                                        emailId = MyAccount.EmailId,
                                                        Mobile = MyAccount.Mobile,
                                                        TerId = MyAccount.TerId,
                                                        AcctCatId = MyAccount.AcctCatId,
                                                        indsId = MyAccount.IndsId,
                                                        ANNUALREVENUE = MyAccount.AnnualRevenue,
                                                        noOfEmployees = MyAccount.NoOfEmployees,
                                                        sicCode = MyAccount.SicCode,
                                                        TickerSymbol = MyAccount.TickerSymbol,
                                                        ownUserId = MyAccount.OwnUserId,
                                                        creditLimit = MyAccount.CreditLimit,
                                                        PayTermId = MyAccount.PayTermId,
                                                        priceListId = MyAccount.PriceListId,
                                                        creditHold = MyAccount.CreditHold,
                                                        acctDesc = MyAccount.AcctDesc,
                                                        campaignId = MyAccount.CampaignId,
                                                        regardingId = MyAccount.RegardingId,
                                                        regarId = MyAccount.RegarId,
                                                        website = MyAccount.Website,
                                                        isActive = true,
                                                        OwnerId = MyUserInfo.UserId,
                                                        createdBy = MyUserInfo.UserId,
                                                        createdDate = DateTime.Now,
                                                        LastModifiedBy = MyUserInfo.UserId,
                                                        LastModifiedDate = DateTime.Now
                                                    });

                    MyResultReponse.Status = "SUCCESS";
                    MyResultReponse.StatusCode = "SUCCESS";
                    MyResultReponse.Message = "Account Created Successfully ";
                    MyResultReponse.Data = NewTemplateId.ToString();

                }

            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = ex.ToString();

                var Message = ex.ToString();
            }
            return MyResultReponse;
        }

        public ResultReponse UpdateAccount(AccountsDTO MyAccount, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            int result = 0;
            string Acctno = "";
            try
            {
                if (MyAccount.AcctNo !="")
                {
                    const string sql = @"Select Acctno from Accounts  Where Acctno=@Acctno and Id<>@Id;";
                    Acctno = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "Acctno", MyAccount.AcctNo }, { "Id", MyAccount.Id } }).FirstOrDefault();
                }
                const string sql1 = @"Select AccountName from Accounts  Where AccountName=@AccountName and Id<>@Id;";
                string AccountName = this.m_dbconnection.Query<string>(sql1, new Dictionary<string, object> { { "AccountName", MyAccount.AccountName }, { "Id", MyAccount.Id } }).FirstOrDefault();

                const string sql2 = @"Select emailId from Accounts  Where emailId=@emailId and Id<>@Id;";
                string emailId = this.m_dbconnection.Query<string>(sql2, new Dictionary<string, object> { { "emailId", MyAccount.EmailId }, { "Id", MyAccount.Id } }).FirstOrDefault();
                if (Acctno !="")
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message =string.Format("Account Number Already Exists {0}  ...!!!", MyAccount.AcctNo);
                    MyResultReponse.Data = MyAccount.ToString();
                }

                else if (AccountName != null)
                {
                    MyResultReponse.Status = "EXISTS";
                    MyResultReponse.StatusCode = "EXISTS";
                    MyResultReponse.Message =string.Format("Account Name Already Exists {0}  ...!!!",MyAccount.AccountName);
                    MyResultReponse.Data = MyAccount.ToString();
                }
                else if (emailId != null)
                {
                    MyResultReponse.Status = "EXISTS";
                    MyResultReponse.StatusCode = "EXISTS";
                    MyResultReponse.Message =string.Format("EmailId Already Exists {0} ... !!!",MyAccount.EmailId);
                    MyResultReponse.Data = MyAccount.ToString();
                }


                else
                {
                    string updateQuery = @"UPDATE Accounts 
                        SET acctNo = @acctNo ,
                        AccountName=@AccountName,
                        leadId=@leadsId,
                        leadNo=@leadsNo,
                        contactId=@contactId,
                        relId=@relId,
                        curId=@curId,
                        mainPhone=@mainPhone,
                        otherPhone=@otherPhone,
                        emailId=@emailId,
                        Mobile=@Mobile,
                        terId=@terId,
                        acctCatId=@acctCatId,
                        indsId=@indsId,
                        ANNUALREVENUE=@ANNUALREVENUE,
                        noOfEmployees=@noOfEmployees,
                        sicCode=@sicCode,
                        tickerSymbol=@tickerSymbol,
                        ownUserId=@ownUserId,
                        creditLimit=@creditLimit,
                        payTermId=@payTermId,
                        priceListId=@priceListId,
                        creditHold=@creditHold,
                        acctDesc=@acctDesc,
                        campaignId=@campaignId,
                        regardingId=@regardingId,
                        regarId=@regarId ,
                        website=@website,
                        OwnerId=@OwnerId,
                        updatedBy=@updatedBy,
                        updatedDate=@updatedDate ,
                        LastModifiedBy = @LastModifiedBy,
                        LastModifiedDate = @LastModifiedDate
                        WHERE Id =@Id";

                    result = this.m_dbconnection.Execute(updateQuery, new
                    {
                        AcctNo = MyAccount.AcctNo,
                        AccountName = MyAccount.AccountName,
                        leadsId = MyAccount.LeadId,
                        LeadsNo = MyAccount.LeadNo,
                        ContactId = MyAccount.ContactId,
                        relId = MyAccount.RelId,
                        CurId = MyAccount.CurId,
                        MainPhone = MyAccount.MainPhone,
                        OtherPhone = MyAccount.OtherPhone,
                        emailId = MyAccount.EmailId,
                        Mobile = MyAccount.Mobile,
                        TerId = MyAccount.TerId,
                        AcctCatId = MyAccount.AcctCatId,
                        indsId = MyAccount.IndsId,
                        ANNUALREVENUE = MyAccount.AnnualRevenue,
                        noOfEmployees = MyAccount.NoOfEmployees,
                        sicCode = MyAccount.SicCode,
                        TickerSymbol = MyAccount.TickerSymbol,
                        ownUserId = MyAccount.OwnUserId,
                        creditLimit = MyAccount.CreditLimit,
                        PayTermId = MyAccount.PayTermId,
                        priceListId = MyAccount.PriceListId,
                        creditHold = MyAccount.CreditHold,
                        acctDesc = MyAccount.AcctDesc,
                        campaignId = MyAccount.CampaignId,
                        regardingId = MyAccount.RegardingId,
                        regarId = MyAccount.RegarId,
                        website = MyAccount.Website,
                        OwnerId= MyUserInfo.UserId,
                        updatedBy = MyUserInfo.UserId,
                        updatedDate = DateTime.Now,
                        LastModifiedBy= MyUserInfo.UserId,
                        LastModifiedDate= DateTime.Now,
                        Id = MyAccount.Id


                    });
                    MyResultReponse.Status = "SUCCESS";
                    MyResultReponse.StatusCode = "SUCCESS";
                    MyResultReponse.Message = "Account Updated Successfully ";
                    MyResultReponse.Data = result.ToString();
                }


            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = ex.ToString();

                var Message = ex.ToString();
                throw;
            }

            return MyResultReponse;
        }
        public ResultReponse DeleteAccount(AccountsDTO MyAccount, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IndustryResult GetIndustryList(UserInfo MyUserInfo)
        {
            IEnumerable<IndustryDTO> industryDTOs = null;
            IndustryResult industryResult = new IndustryResult();
            QueryStr = string.Format("Select * From Industry Where IsActive=1 Order By IndustryName;");

            industryDTOs = this.m_dbconnection.Query<IndustryDTO>(QueryStr).ToList();

            industryResult.Industry = industryDTOs.ToList();
            industryResult.TotalRecords = industryDTOs.Count();

            return industryResult;
        }
        public IEnumerable<IndustryDomainItem> GetIndustryDomainItem(UserInfo MyUserInfo)
        {
            QueryStr = string.Format(" Select IndsId,IndustryName From Industry Where IsActive=1;");

            IEnumerable<IndustryDomainItem> industryDomainItems = this.m_dbconnection.Query<IndustryDomainItem>(QueryStr).ToList();

            return industryDomainItems;
        }

    }
}
