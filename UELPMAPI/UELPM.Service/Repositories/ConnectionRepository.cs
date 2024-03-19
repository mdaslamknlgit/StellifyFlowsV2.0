using UELPM.Model;
using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using UELPM.Service.Interface;
using System.Data.SqlClient;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using UELPM.Model.Models;

namespace UELPM.Service.Repositories
{
    public class ConnectionRepository : IConnectionRepository
    {
        //private readonly IDbConnection m_dbconnection;
        //string TenantConnectionStr = ConfigurationManager.ConnectionStrings["LinkedInConnection"].ConnectionString;
        //string TenantConnectionStr = ConfigurationManager.ConnectionStrings["TenantConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public ConnectionRepository(UserInfo MyUserInfo)
        {
            ////m_dbconnection = new MySqlConnection(ConfigurationManager.ConnectionStrings["LinkedInConnection"].ConnectionString);
            //TenantConnectionStr = string.Format(TenantConnectionStr, MyUserInfo.databasename);
            //m_dbconnection = new MySqlConnection(TenantConnectionStr);
        }

        public ConnectionRepository()
        {
            ////m_dbconnection = new MySqlConnection(ConfigurationManager.ConnectionStrings["LinkedInConnection"].ConnectionString);
            //TenantConnectionStr = string.Format(TenantConnectionStr, MyUserInfo.databasename);
            //m_dbconnection = new MySqlConnection(TenantConnectionStr);
        }
        public IEnumerable<MarketingListDTO> GetList(UserInfo MyUserInfo)
        {
            IEnumerable<MarketingListDTO> ListDTOList = null;
            List<MarketingListDTO> MyListDTOList = null;

            //const string sqlQuery =
            //            @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.CreatedBy UserId,lst.UpdatedBy,lst.isActive,
            //                (select count(email) FROM emaillist where listId=lst.Id) EmailCount from list lst 
            //                    where lst.listName<>'My Connections' order by lst.UpdatedBy desc";

            QueryStr = @"Select lst.Id,lst.listName,lst.listDesc,lst.CreatedBy UserId,lst.UpdatedBy,lst.isActive,
                                    lst.CreatedDate,lst.UpdatedDate,
                                    (select count(email) FROM emaillist where listId=lst.Id) EmailCount from MarketingList lst order by lst.UpdatedDate,lst.CreatedDate desc;";

            ListDTOList = this.m_dbconnection.Query<MarketingListDTO>(QueryStr, new Dictionary<string, object> { { "tenantId", MyUserInfo.TenantId } });
            //for(int i=0;i<ListDTOList.ToList().Count();i++)
            //{
            //    MyListDTOList.Add(ListDTOList.ToList()[i]);
            //}
            return ListDTOList.ToList();
            //return MyListDTOList.AsEnumerable();

        }

        public ListResult SearchConnections(UserInfo MyUserInfo, ListSearch listSearch)
        {
            ListResult listResult  = new ListResult();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";


            QueryStr = @"Select lst.Id,lst.listName,lst.listDesc,lst.CreatedBy UserId,lst.UpdatedBy,lst.isActive,
                                    lst.CreatedDate,lst.UpdatedDate,
                                    (select count(email) FROM emaillist where listId=lst.Id) EmailCount from list lst
                                     Where 1=1 ";


            CountQueryStr = @"Select count(*) From List Where 1=1 ";


            if (!string.IsNullOrEmpty(listSearch.ListName))
            {
                QueryStr = QueryStr + " \nAnd ( ListName like '%" + listSearch.ListName + "%')";
                CountQueryStr = CountQueryStr + " \nAnd ( ListName like '%" + listSearch.ListName + "%')";

            }
            if (!string.IsNullOrEmpty(listSearch.ListDesc))
            {
                QueryStr = QueryStr + " \nAnd ( ListDesc like '%" + listSearch.ListDesc + "%')";
                CountQueryStr = CountQueryStr + " \nAnd ( ListDesc like '%" + listSearch.ListDesc + "%')";

            }

            QueryStr = QueryStr + " order by lst.UpdatedBy desc;";
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    listResult.Status = "SUCCESS";
                    listResult.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    listResult.Lists = result.Read<MarketingListDTO>().AsList();
                    //total number of purchase orders
                    listResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return listResult;
            }
            catch (Exception exp)
            {
                listResult.Status = "ERROR";
                listResult.Message = exp.ToString();
            }
            return listResult;
        }

        public IEnumerable<MarketingListDTO> GetListDetails(UserInfo MyUserInfo)
        {
            IEnumerable<MarketingListDTO> ListDTOList = null;
            List<MarketingListDTO> MyListDTOList = null;

            const string sqlQuery =
            @"SELECT dbo.List.Id, dbo.List.ListName, dbo.List.IsActive AS lst, dbo.EmailList.*
                    FROM     dbo.List LEFT OUTER JOIN dbo.EmailList ON dbo.List.Id = dbo.EmailList.ListId
                    ";

            ListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sqlQuery, new Dictionary<string, object> { { "tenantId", MyUserInfo.TenantId } });
            //for(int i=0;i<ListDTOList.ToList().Count();i++)
            //{
            //    MyListDTOList.Add(ListDTOList.ToList()[i]);
            //}
            return ListDTOList.ToList();
            //return MyListDTOList.AsEnumerable();

        }

        public ConnectionsDisplayResult GetConnectionWithDetails(UserInfo MyUserInfo)
        {
            // PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
            ConnectionsDisplayResult connectionsDisplayResult = new ConnectionsDisplayResult();
            //public class Shop {
            //  public int? Id {get;set;}
            //  public string Name {get;set;}
            //  public string Url {get;set;}
            //  public IList<Account> Accounts {get;set;}
            //}

            //public class Account {
            //  public int? Id {get;set;}
            //  public string Name {get;set;}
            //  public string Address {get;set;}
            //  public string Country {get;set;}
            //  public int ShopId {get;set;}
            //}

            //var lookup = new Dictionary<int, Shop>()
            //conn.Query<Shop, Account, Shop>(@"
            //                SELECT s.*, a.*
            //                FROM Shop s
            //                INNER JOIN Account a ON s.ShopId = a.ShopId                    
            //                ", (s, a) => {
            //                        Shop shop;
            //                        if (!lookup.TryGetValue(s.Id, out shop)) {
            //                            lookup.Add(s.Id, shop = s);
            //                        }
            //                        if (shop.Accounts == null) 
            //                            shop.Accounts = new List<Account>();
            //                        shop.Accounts.Add(a);
            //                        return shop;
            //                    }
            //                    ).AsQueryable();
            //var resultList = lookup.Values;

            QueryStr = @"
                        select cdi.RegardingId,cdi.Name,cdi.ListId,cdi.ListName,cdi.FirstName,cdi.LastName,cdi.Company,cdi.Title,cdi.Email
                        from ContactDetailsImport cdi  where cdi.ListId=3023 And cdi.RegardingId=16
                        Union
                        Select cgd.RegardingId,cgd.Name,cgd.ListId,cgd.ListName,cgd.FirstName,cgd.LastName,cgd.Company,cgd.JobTitle,cgd.EmailId
                        From ContactGroupsDetails cgd Where cgd.ListId=3023 And cgd.RegardingId=5;";

            QueryStr = @"SELECT List.Id, List.ListName, List.ListDesc, List.CompanyId, List.IsActive, EmailList.EmailListId, 
                                        EmailList.ListId, EmailList.FirstName, EmailList.LastName, EmailList.AliasName, EmailList.Email, 
                                        EmailList.Phone, EmailList.Mobile, EmailList.Title, EmailList.CompanyId AS Expr1, EmailList.Company, 
                                        EmailList.Industry, EmailList.Country, EmailList.City, EmailList.Website, EmailList.Location, 
                                        EmailList.Url, EmailList.NoOfTries
                                        FROM MarketingList List INNER JOIN
                                        EmailList ON List.Id = EmailList.ListId;";

            var lookup = new Dictionary<int, MarketingListDTO>();
            m_dbconnection.Query<MarketingListDTO, EmailDTO, MarketingListDTO>(QueryStr, (s, a) =>
            {
                MarketingListDTO listdto;
                if (!lookup.TryGetValue(s.Id, out listdto))
                {
                    lookup.Add(s.Id, listdto = s);
                }
                if (listdto.EmailLists == null)
                    listdto.EmailLists = new List<EmailDTO>();
                listdto.EmailLists.Add(a);
                return listdto;
            }, splitOn: "ListId").AsQueryable();
            var resultList = lookup.Values;

            
            if (resultList != null)
            {
                connectionsDisplayResult.ConnectionsList = resultList.ToList();
                connectionsDisplayResult.TotalRecords = resultList.ToList().Count();
            }
            //using (var connection = new SqlConnection(UELConnectionString))
            //{
            //    var products = connection.Query<List, EmailDTO, List>(sqlQuery1, (lst, emails) =>
            //    {
            //        //lst.Emails.Add(emails);
            //        if(lst.Emails ==null)
            //        {
            //            lst.Emails = new List<EmailDTO>();
            //            lst.Emails.Add(emails);
            //        }
            //        //lst.Emails = emails;
            //        return lst;
            //    },
            //        splitOn: "ListId");

            //    //products.ToList().ForEach(product => Console.WriteLine($"Product: {product.ProductName}, Category: {product.Category.CategoryName}"));
            //}

            return connectionsDisplayResult;

            //const string sqlQuery =
            //        @"SELECT dbo.List.Id, dbo.List.ListName, dbo.List.IsActive AS lst, dbo.EmailList.*
            //        FROM     dbo.List LEFT OUTER JOIN dbo.EmailList ON dbo.List.Id = dbo.EmailList.ListId;";

            //ListDTOList = this.m_dbconnection.Query<ListDTO>(sqlQuery, new Dictionary<string, object> { { "tenantId", MyUserInfo.TenantId } });
            //for(int i=0;i<ListDTOList.ToList().Count();i++)
            //{
            //    MyListDTOList.Add(ListDTOList.ToList()[i]);
            //}
            //return ListDTOList.ToList();
            //return MyListDTOList.AsEnumerable();

        }

        public ConnectionsDisplayResult GetMarketingListWithDetailsByListId(int ListId,UserInfo MyUserInfo)
        {
            // PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
            ConnectionsDisplayResult connectionsDisplayResult = new ConnectionsDisplayResult();
           
            QueryStr = @"
                        select cdi.ListId,cdi.ListId,cdi.ListName,cdi.ListDesc,cdi.CompanyId,cdi.IsActive,cdi.EmailListId,cdi.ListId,
						cdi.FirstName,cdi.LastName,cdi.AliasName,cdi.Email,cdi.Phone,cdi.Mobile, cdi.Title,cdi.Company,cdi.NoOfTries,
                        cdi.RegardingId,cdi.Name,cdi.Regarding
                        from ContactDetailsImport cdi
                        where cdi.ListId={0} And cdi.RegardingId=16
                        Union
                        Select cgd.ListId,cgd.ListId,cgd.ListName,cgd.ListDesc,cgd.CompanyId,cgd.IsActive,cgd.EmailListId,cgd.ListId,
						cgd.FirstName,cgd.LastName,cgd.AliasName,cgd.EmailId,cgd.Phone,cgd.Mobile, cgd.JobTitle,cgd.Company,cgd.NoOfTries,
                        cgd.RegardingId,cgd.Name,cgd.Regarding
                        From ContactGroupsDetails cgd
                        Where cgd.ListId={1} And cgd.RegardingId=5
                        Union
                        Select mkl.ListId,mkl.ListId,mkl.ListName,mkl.ListDesc,mkl.CompanyId,mkl.IsActive,mkl.EmailListId,mkl.ListId,
						mkl.FirstName,mkl.LastName,mkl.AliasName,mkl.EmailId,mkl.Phone,mkl.Mobile,mkl.JobTitle, mkl.CompName As Company,mkl.NoOfTries,
						mkl.RegardingId,mkl.Name,mkl.Regarding
                        From MarketingListLeads mkl Where mkl.ListId={2} And mkl.RegardingId=8;";

            QueryStr = string.Format(QueryStr, ListId, ListId, ListId);

            //QueryStr = @"SELECT List.Id, List.ListName, List.ListDesc, List.CompanyId, List.IsActive, EmailList.EmailListId, 
            //                            EmailList.ListId, EmailList.FirstName, EmailList.LastName, EmailList.AliasName, EmailList.Email, 
            //                            EmailList.Phone, EmailList.Mobile, EmailList.Title, EmailList.CompanyId AS Expr1, EmailList.Company, 
            //                            EmailList.Industry, EmailList.Country, EmailList.City, EmailList.Website, EmailList.Location, 
            //                            EmailList.Url, EmailList.NoOfTries
            //                            FROM MarketingList List INNER JOIN
            //                            EmailList ON List.Id = EmailList.ListId;";

            var lookup = new Dictionary<int, MarketingListDTO>();
            m_dbconnection.Query<MarketingListDTO, EmailDTO, MarketingListDTO>(QueryStr, (s, a) =>
            {
                MarketingListDTO listdto;
                if (!lookup.TryGetValue(s.Id, out listdto))
                {
                    lookup.Add(s.Id, listdto = s);
                }
                if (listdto.EmailLists == null)
                    listdto.EmailLists = new List<EmailDTO>();
                listdto.EmailLists.Add(a);
                return listdto;
            }, splitOn: "ListId").AsQueryable();
            var resultList = lookup.Values;


            if (resultList != null)
            {
                connectionsDisplayResult.ConnectionsList = resultList.ToList();
                connectionsDisplayResult.TotalRecords = resultList.ToList().Count();
            }
            //using (var connection = new SqlConnection(UELConnectionString))
            //{
            //    var products = connection.Query<List, EmailDTO, List>(sqlQuery1, (lst, emails) =>
            //    {
            //        //lst.Emails.Add(emails);
            //        if(lst.Emails ==null)
            //        {
            //            lst.Emails = new List<EmailDTO>();
            //            lst.Emails.Add(emails);
            //        }
            //        //lst.Emails = emails;
            //        return lst;
            //    },
            //        splitOn: "ListId");

            //    //products.ToList().ForEach(product => Console.WriteLine($"Product: {product.ProductName}, Category: {product.Category.CategoryName}"));
            //}

            return connectionsDisplayResult;

            //const string sqlQuery =
            //        @"SELECT dbo.List.Id, dbo.List.ListName, dbo.List.IsActive AS lst, dbo.EmailList.*
            //        FROM     dbo.List LEFT OUTER JOIN dbo.EmailList ON dbo.List.Id = dbo.EmailList.ListId;";

            //ListDTOList = this.m_dbconnection.Query<ListDTO>(sqlQuery, new Dictionary<string, object> { { "tenantId", MyUserInfo.TenantId } });
            //for(int i=0;i<ListDTOList.ToList().Count();i++)
            //{
            //    MyListDTOList.Add(ListDTOList.ToList()[i]);
            //}
            //return ListDTOList.ToList();
            //return MyListDTOList.AsEnumerable();

        }
        public ConnectionsDisplayResult GetListWithDetails(ListSearch listSearch,UserInfo MyUserInfo)
        {
            // PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
            ConnectionsDisplayResult connectionsDisplayResult = new ConnectionsDisplayResult();
         
            QueryStr = @"SELECT List.Id, List.ListName, List.ListDesc, List.CompanyId, List.IsActive, EmailList.EmailListId, 
                                        EmailList.ListId, EmailList.FirstName, EmailList.LastName, EmailList.AliasName, EmailList.Email, 
                                        EmailList.Phone, EmailList.Mobile, EmailList.Title, EmailList.CompanyId AS Expr1, EmailList.Company, 
                                        EmailList.Industry, EmailList.Country, EmailList.City, EmailList.Website, EmailList.Location, 
                                        EmailList.Url, EmailList.NoOfTries
                                        FROM List INNER JOIN
                                        EmailList ON List.Id = EmailList.ListId;";

            var lookup = new Dictionary<int, MarketingListDTO>();
            m_dbconnection.Query<MarketingListDTO, EmailDTO, MarketingListDTO>(QueryStr, (s, a) =>
            {
                MarketingListDTO listdto;
                if (!lookup.TryGetValue(s.Id, out listdto))
                {
                    lookup.Add(s.Id, listdto = s);
                }
                if (listdto.EmailLists == null)
                    listdto.EmailLists = new List<EmailDTO>();
                listdto.EmailLists.Add(a);
                return listdto;
            }, splitOn: "ListId").AsQueryable();
            var resultList = lookup.Values;


            if (resultList != null)
            {
                connectionsDisplayResult.ConnectionsList = resultList.ToList();
                connectionsDisplayResult.TotalRecords = resultList.ToList().Count();
            }
          

            return connectionsDisplayResult;

        }
        public IEnumerable<MarketingListDTO> GetAllList()
        {
            IEnumerable<MarketingListDTO> ListDTOList = null;
            
            //const string sqlQuery =
            //            @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.CreatedBy UserId,lst.UpdatedBy,lst.isActive,
            //                (select count(email) FROM emaillist where listId=lst.Id) EmailCount from list lst where lst.listName<>'My Connections' order by lst.UpdatedBy desc";

            const string sqlQuery =
            @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.CreatedBy UserId,lst.UpdatedBy,lst.isActive,
                            (select count(email) FROM emaillist where listId=lst.Id) EmailCount from Marketing lst order by lst.UpdatedBy desc";


            ListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sqlQuery);
            return ListDTOList.ToList();
            //for (int i = 0; i < ListDTOList.ToList().Count(); i++)
            //{
            //    MyListDTOList.Add(ListDTOList.ToList()[i]);
            //}
            //return MyListDTOList.AsEnumerable();

        }
        public IEnumerable<MarketingListDTO> GetListWithEmailDetails(UserInfo MyUserInfo)
        {

            const string sql =
                        @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                            (select count(email) FROM emaillist where listId=lst.Id and email<>'') EmailCount from MarketingList lst;";

            return this.m_dbconnection.Query<MarketingListDTO>(sql, new Dictionary<string, object> { { "tenantId", MyUserInfo.TenantId } });
        }

        public MarketingListDTO GetListInfo(int Id, UserInfo MyUserInfo)
        {
            QueryStr =
                 @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.CompanyId,lst.createdby,cm.CompanyName from list lst
                inner join Company cm on cm.CompanyId=lst.CompanyId
                Where cm.CompanyId=@CompanyId and lst.Id=@Id;";

            return this.m_dbconnection.Query<MarketingListDTO>(QueryStr, new Dictionary<string, object> { { "CompanyId", MyUserInfo.CompanyId }, { "Id", Id} }).FirstOrDefault();
        }

        public MarketingListDTO GetListInfoByName(string listName, UserInfo MyUserInfo)
        {
            QueryStr = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId,lst.userId from Marketinglist lst
                Where lst.listName=@listName;";

            return this.m_dbconnection.Query<MarketingListDTO>(QueryStr, new Dictionary<string, object> { { "listName", listName } }).FirstOrDefault();
        }

        public MarketingListDTO GetListDetails(int Id, UserInfo MyUserInfo)
        {
            QueryStr = string.Format(@"Select lst.Id ListId,lst.listName,lst.listDesc,lst.companyid,lst.CreatedBy,lst.isActive 
                                        from Marketinglist lst Where lst.Id={0};", Id);

            return this.m_dbconnection.Query<MarketingListDTO>(QueryStr).FirstOrDefault();
        }

        public ResultReponse CreateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            try
            {

                int NewListId = 0;
                const string sql = @"Select lst.listName from MarketingList lst  Where lst.listName=@listName;";
                string ListName = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "listName", listDTO.ListName } }).FirstOrDefault();

                if (ListName == null)
                {
                    string insertUserSql = @"INSERT Marketinglist(listName,listDesc,CompanyId,CreatedBy,CreatedDate) values (@listName, @listDesc, @CompanyId,@CreatedBy,@CreatedDate);
                                    SELECT SCOPE_IDENTITY();";
                    NewListId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                    new
                                                    {
                                                        ListId = 0,
                                                        listName = listDTO.ListName,
                                                        listDesc = listDTO.ListDesc,
                                                        CompanyId = MyUserInfo.CompanyId,
                                                        CreatedBy = MyUserInfo.UserId,
                                                        CreatedDate = DateTime.Now
                                                    });
                    if (NewListId > 0)
                    {
                        MyResultReponse.Status = "SUCCESS";
                        MyResultReponse.StatusCode = "SUCCESS";
                        MyResultReponse.Message = "List Created Successfully ";
                        MyResultReponse.Data = NewListId.ToString();
                    }

                }
                else
                {
                    MyResultReponse.Status = "EXISTS";
                    MyResultReponse.StatusCode = "EXISTS";
                    MyResultReponse.Message = "List Name Already Exists...!!!";
                    MyResultReponse.Data = NewListId.ToString();
                }

                return MyResultReponse;
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = ex.ToString();
                
            }
            return MyResultReponse;

        }

        public ResultReponse UpdateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            string listName = "";
            string listDesc = "";
            int CompanyId =0;
            int Id = 0;
            bool isActive = false;
            int result = 0;

            MarketingListDTO updatedlistDTO = new MarketingListDTO();

            try
            {
                const string sql = @"Select lst.listName from Marketinglist lst  Where lst.listName=@listName And Id<>@Id;";

                string ListName = this.m_dbconnection.Query<string>(sql, new Dictionary<string, object> { { "listName", listDTO.ListName }, { "Id", listDTO.Id } }).FirstOrDefault();

                if (ListName == null)
                {
                    listName = listDTO.ListName;
                    listDesc = listDTO.ListDesc;
                    CompanyId = listDTO.CompanyId;
                    Id = listDTO.Id;
                    isActive = listDTO.IsActive;
                    string updateQuery = @"UPDATE Marketinglist SET listname = @listname ,listdesc = @listdesc,CompanyId=@CompanyId,UpdatedBy=@UpdatedBy,UpdatedDate=@UpdatedDate,isActive=@isActive WHERE Id =@Id";

                    result = this.m_dbconnection.Execute(updateQuery, new
                    {
                        listName,
                        listDesc,
                        CompanyId,
                        UpdatedBy=MyUserInfo.UserId,
                        UpdatedDate=DateTime.Now,
                        isActive,
                        Id

                    });
                    if (result > 0)
                    {
                        MyResultReponse.Status = "SUCCESS";
                        MyResultReponse.StatusCode = "SUCCESS";
                        MyResultReponse.Message = "List Created Successfully ";
                        MyResultReponse.Data = Id.ToString();
                    }
                    // updatedlistDTO = GetListInfo(listDTO.ListId, MyUserInfo);

                }
                else
                {
                    MyResultReponse.Status = "EXISTS";
                    MyResultReponse.StatusCode = "EXISTS";
                    MyResultReponse.Message = "List Name Already Exists...!!!";
                    MyResultReponse.Data = listName.ToString();
                }


                return MyResultReponse;
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = ex.ToString();

            }
            return MyResultReponse;

        }

        public int DeleteList(int Id, UserInfo MyUserInfo)
        {
            string updateQuery = @"UPDATE [Marketinglist] SET [isActive] = 0 WHERE Id =@Id";

            int result = this.m_dbconnection.Execute(updateQuery, new
            {
                Id
            });
            return result;
        }

        public int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo)
        {
            int Id = 0;
            int i;
            int ReturnValue = 0;
            string[] AllEmailIDS;
            try
            {
                AllEmailIDS = EmailIds.Split(',');
                for (i = 0; i <= AllEmailIDS.Length - 1; i++)
                {
                    Id = Convert.ToInt32(AllEmailIDS[i].ToString());

                    string moveQuery = @"UPDATE emaillist SET listId = @listId WHERE Id =@Id";

                    //string moveQuery1 = @"UPDATE emaillist SET [listId] = @listId WHERE Id  In (@Id);";

                    int result = this.m_dbconnection.Execute(moveQuery, new
                    {
                        listId,
                        Id
                    });

                }

                ReturnValue = 1;
            }
            catch (Exception exp)
            {
                ReturnValue = 0;
            }
            return ReturnValue;
        }


        public int CreateListWithEmails(ListByEmail listbyemail, UserInfo MyUserInfo)
        {

            int NewListId = 0;
            int EmailListId = 0;
            string FirstName = "";
            string LastName = "";
            string Title = "";
            string insertUserSql = @"INSERT Marketinglist(listName,listDesc,tenantId,lastupdate) values (@listName, @listDesc, @tenantId,@lastupdate);
                                    SELECT LAST_INSERT_ID();";
            try
            {
                NewListId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                new
                                                {
                                                    ListId = 0,
                                                    listName = listbyemail.ListName,
                                                    listDesc = listbyemail.ListName,
                                                    tenantId = MyUserInfo.TenantId,
                                                    lastupdate = DateTime.Now
                                                });
            }
            catch(Exception exp)
            {
                var MessageError = exp.ToString();
            }
           
                foreach (EmailDTO emailinfo in listbyemail.EmailList)
                {
                try
                {
                    //int rowsAffected = m_dbconnection.Execute(@"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
                    //    new { firstname = emailinfo.firstname, lastname = emailinfo.lastname, email = emailinfo.email, phone = emailinfo.phone, mobile = emailinfo.mobile, title = emailinfo.title, company = emailinfo.company, website = emailinfo.website, location = emailinfo.location, Url = emailinfo.Url, photourl = emailinfo.photourl, profileid = emailinfo.profileid, lastupdate = DateTime.Now, tenantId = 1, userId = 1, listId = NewListId, typeId = 1 });

                    //if (emailinfo.firstname != null)
                    //{
                    //    FirstName = Regex.Replace(emailinfo.firstname, @"[^0-9a-zA-Z:,? """"]+", "");
                    //    emailinfo.firstname = FirstName.Replace("\"", "");
                    //}

                    //if (emailinfo.lastname != null)
                    //{
                    //    LastName = Regex.Replace(emailinfo.lastname, @"[^0-9a-zA-Z:,? """"]+", "");
                    //    emailinfo.lastname = LastName.Replace("\"", "");
                    //}

                    //if (emailinfo.title != null)
                    //{
                    //    Title = Regex.Replace(emailinfo.title, @"[^0-9a-zA-Z:,? """"]+", "");
                    //    emailinfo.title = Title.Replace("\"", "");
                    //}
                    string EmailInsertQuery = @"INSERT emaillist(firstname,lastname,aliasName,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId,connectionType,createdBy,createdDate) 
                                                                 values (@firstname, @lastname,@aliasName, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,@typeId,@connectionType,@createdBy,@CreatedDate);
                                                                SELECT LAST_INSERT_ID();";

                    //byte[] textAsBytes = Encoding.UTF8.GetBytes(emailinfo.firstname);
                    //byte[] textAsBytes1 = Convert.FromBase64String(Convert.ToBase64String(textAsBytes));
                    //string decodedText = Encoding.UTF8.GetString(textAsBytes);
                    EmailListId = this.m_dbconnection.QuerySingle<int>(EmailInsertQuery,
                                                    new
                                                    {
                                                        //firstname = Convert.ToBase64String(textAsBytes),
                                                        firstname = emailinfo.FirstName,
                                                        lastname = emailinfo.LastName,
                                                        aliasName=emailinfo.AliasName,
                                                        email = emailinfo.Email,
                                                        phone = emailinfo.Phone,
                                                        mobile = emailinfo.Mobile,
                                                        title = emailinfo.Title,
                                                        company = emailinfo.Company,
                                                        website=emailinfo.Website,
                                                        location = emailinfo.Location,
                                                        Url = emailinfo.Url,
                                                        photourl = emailinfo.PhotoUrl,
                                                        profileid = emailinfo.Profileid,
                                                        lastupdate = DateTime.Now,
                                                        tenantId = MyUserInfo.TenantId,
                                                        userId = MyUserInfo.UserId,
                                                        listId = NewListId,
                                                        typeId = emailinfo.TypeId,
                                                        connectionType=emailinfo.Connectiontype,
                                                        createdBy = MyUserInfo.UserId,
                                                        CreatedDate = DateTime.Now
                                                    });
                    if (EmailListId > 0)
                    {
                        const string DeleteSentInvitationQuery = @" delete from sentinvitations where profileId=@profileId";
                        SendInvitationDTO MyInvitation = this.m_dbconnection.Query<SendInvitationDTO>(DeleteSentInvitationQuery, new Dictionary<string, object> { { "profileId", emailinfo.Profileid } }).FirstOrDefault();

                    }
                    //      int rowsAffected = m_dbconnection.Execute(@"INSERT tempemaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
                    //new { firstname = em.firstname, lastname = em.lastname, email = em.email, phone = em.phone, mobile = em.mobile, title = em.title, company = em.company, website = em.website, location = em.location, Url = em.Url, photourl = em.photourl, profileid = em.profileid, lastupdate = DateTime.Now, tenantId = 1, userId = 1, listId = 1, typeId = 1 });
                }
                catch (Exception exp)
                {
                    var MessageError = exp.ToString();
                    continue;

                }
            }
           

            return NewListId;



        }

        public int UpdateListWithEmails(ListByEmail listbyemail, UserInfo MyUserInfo)
        {

            int NewListId = 0;
            int EmailListId = 0;
            string FirstName = "";
            string LastName = "";
            string Title = "";
            NewListId = listbyemail.ListId;
            foreach (EmailDTO emailinfo in listbyemail.EmailList)
            {
                try
                {
                    //int rowsAffected = m_dbconnection.Execute(@"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
                    //    new { firstname = emailinfo.firstname, lastname = emailinfo.lastname, email = emailinfo.email, phone = emailinfo.phone, mobile = emailinfo.mobile, title = emailinfo.title, company = emailinfo.company, website = emailinfo.website, location = emailinfo.location, Url = emailinfo.Url, photourl = emailinfo.photourl, profileid = emailinfo.profileid, lastupdate = DateTime.Now, tenantId = 1, userId = 1, listId = NewListId, typeId = 1 });
                    if (emailinfo.FirstName != null)
                    {
                        FirstName = Regex.Replace(emailinfo.FirstName, @"[^0-9a-zA-Z:,? """"]+", "");
                        emailinfo.FirstName = FirstName.Replace("\"", "");
                    }

                    if (emailinfo.LastName != null)
                    {
                        LastName = Regex.Replace(emailinfo.LastName, @"[^0-9a-zA-Z:,? """"]+", "");
                        emailinfo.LastName = LastName.Replace("\"", "");
                    }

                    if (emailinfo.Title != null)
                    {
                        Title = Regex.Replace(emailinfo.Title, @"[^0-9a-zA-Z:,? """"]+", "");
                        emailinfo.Title = Title.Replace("\"", "");
                    }

                    string EmailInsertQuery = @"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId,connectionType) 
                                                                 values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,@typeId,@connectionType);
                                                                SELECT LAST_INSERT_ID();";


                    EmailListId = this.m_dbconnection.QuerySingle<int>(EmailInsertQuery,
                                                    new
                                                    {
                                                        firstname = emailinfo.FirstName,
                                                        lastname = emailinfo.LastName,
                                                        aliasName = emailinfo.AliasName,
                                                        email = emailinfo.Email,
                                                        phone = emailinfo.Phone,
                                                        mobile = emailinfo.Mobile,
                                                        title = emailinfo.Title,
                                                        company = emailinfo.Company,
                                                        website = emailinfo.Website,
                                                        location = emailinfo.Location,
                                                        Url = emailinfo.Url,
                                                        photourl = emailinfo.PhotoUrl,
                                                        profileid = emailinfo.Profileid,
                                                        lastupdate = DateTime.Now,
                                                        tenantId = MyUserInfo.TenantId,
                                                        userId = MyUserInfo.UserId,
                                                        listId = NewListId,
                                                        typeId = emailinfo.TypeId,
                                                        connectionType = emailinfo.Connectiontype,
                                                        createdBy = MyUserInfo.UserId,
                                                        CreatedDate = DateTime.Now
                                                    });

                    //      int rowsAffected = m_dbconnection.Execute(@"INSERT tempemaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
                    //new { firstname = em.firstname, lastname = em.lastname, email = em.email, phone = em.phone, mobile = em.mobile, title = em.title, company = em.company, website = em.website, location = em.location, Url = em.Url, photourl = em.photourl, profileid = em.profileid, lastupdate = DateTime.Now, tenantId = 1, userId = 1, listId = 1, typeId = 1 });
                }
                catch (Exception exp)
                {
                    var MessageError = exp.ToString();
                    continue;

                }
            }


            return NewListId;



        }

        public int UpdateListWithNewConnections(ListByEmail listbyemail, UserInfo MyUserInfo)
        {

            int NewListId = 0;
            int EmailListId = 0;
            string FirstName = "";
            string LastName = "";
            string Title = "";
            NewListId = listbyemail.ListId;

            string ConnectionExistsQuery = "";
            int ConnectionExists = 0;
            foreach (EmailDTO emailinfo in listbyemail.EmailList)
            {
                try
                {
                    //int rowsAffected = m_dbconnection.Execute(@"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
                    //    new { firstname = emailinfo.firstname, lastname = emailinfo.lastname, email = emailinfo.email, phone = emailinfo.phone, mobile = emailinfo.mobile, title = emailinfo.title, company = emailinfo.company, website = emailinfo.website, location = emailinfo.location, Url = emailinfo.Url, photourl = emailinfo.photourl, profileid = emailinfo.profileid, lastupdate = DateTime.Now, tenantId = 1, userId = 1, listId = NewListId, typeId = 1 });

                    //Check connection exists by profile id, if exists don't do anything, if not add

                    //ConnectionExistsQuery = @"Select count(*) from emaillist where profileId=@profileId";
                    ConnectionExistsQuery = @"Select count(*) from emaillist where profileId=@profileId And listId=@listId";

                    ConnectionExists = this.m_dbconnection.Query<int>(ConnectionExistsQuery, new Dictionary<string, object> { { "profileId", emailinfo.Profileid }, { "listId", NewListId } }).FirstOrDefault();

                    if (ConnectionExists == 0)
                    {
                        //FirstName = Regex.Replace(emailinfo.firstname, @"[^0-9a-zA-Z:,?]+", "");
                        //emailinfo.firstname = FirstName.Replace("\"", "");

                        //LastName = Regex.Replace(emailinfo.lastname, @"[^0-9a-zA-Z:,?]+", "");
                        //emailinfo.lastname = LastName.Replace("\"", "");


                        //Title = Regex.Replace(emailinfo.title, @"[^0-9a-zA-Z:,?]+", "");
                        //emailinfo.title = Title.Replace("\"", "");

                        string EmailInsertQuery = @"INSERT emaillist(firstname,lastname,aliasname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId,connectionType,createdBy,createdDate) 
                                                                 values (@firstname, @lastname,@aliasName, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,@typeId,@connectionType,@createdBy,@CreatedDate);
                                                                SELECT LAST_INSERT_ID();";

                        
                        //byte[] textAsBytes = Encoding.UTF8.GetBytes(emailinfo.firstname);
                        //byte[] textAsBytes1 = Convert.FromBase64String(Convert.ToBase64String(textAsBytes));
                        //string  decodedText = Encoding.UTF8.GetString(textAsBytes1);

                        EmailListId = this.m_dbconnection.QuerySingle<int>(EmailInsertQuery,
                                                        new
                                                        {
                                                            //firstname = Convert.ToBase64String(textAsBytes),
                                                            firstname = emailinfo.FirstName,
                                                            lastname = emailinfo.LastName,
                                                            aliasName = emailinfo.AliasName,
                                                            email = emailinfo.Email,
                                                            phone = emailinfo.Phone,
                                                            mobile = emailinfo.Mobile,
                                                            title = emailinfo.Title,
                                                            company = emailinfo.Company,
                                                            website = emailinfo.Website,
                                                            location = emailinfo.Location,
                                                            Url = emailinfo.Url,
                                                            photourl = emailinfo.PhotoUrl,
                                                            profileid = emailinfo.Profileid,
                                                            lastupdate = DateTime.Now,
                                                            tenantId = MyUserInfo.TenantId,
                                                            userId = MyUserInfo.UserId,
                                                            listId = NewListId,
                                                            typeId = emailinfo.TypeId,
                                                            connectionType = emailinfo.Connectiontype,
                                                            createdBy = MyUserInfo.UserId,
                                                            CreatedDate = DateTime.Now
                                                        });
                        if(EmailListId>0)
                        {
                            const string DeleteSentInvitationQuery = @" delete from sentinvitations where profileId=@profileId";
                            SendInvitationDTO MyInvitation = this.m_dbconnection.Query<SendInvitationDTO>(DeleteSentInvitationQuery, new Dictionary<string, object> { { "profileId", emailinfo.Profileid } }).FirstOrDefault();

                        }
                    }
                    else
                    {
                        string UpdateQuery = @"UPDATE emaillist SET connectionType=@connectionType,updateBy=@updatedBy,UpdatedDate=@UpdatedDate WHERE profileId=@profileId";
                        int result = this.m_dbconnection.Execute(UpdateQuery, new
                        {
                            connectionType= "1st",
                            updatedBy=MyUserInfo.UserId,
                            UpdatedDate=DateTime.Now,
                            profileId = emailinfo.Profileid
                        });
                        if(result>0)
                        {
                            const string DeleteSentInvitationQuery = @"delete from sentinvitations where profileId=@profileId";
                            SendInvitationDTO MyInvitation = this.m_dbconnection.Query<SendInvitationDTO>(DeleteSentInvitationQuery, new Dictionary<string, object> { { "profileId", emailinfo.Profileid } }).FirstOrDefault();

                        }
                    }
                }
                catch (Exception exp)
                {
                    var MessageError = exp.ToString();
                    continue;

                }
            }


            return NewListId;



        }


        public MarketingListDTO GetDefaultListId(UserInfo MyUserInfo)
        {
            int ListId = 0;
            const string sql =
                @"Select Id ListId,listName,listDesc,tenantId,userId,lastUpdate,isActive,isDefault From list 
                        Where isDefault=@isDefault And tenantId=@TenantId;";

            return this.m_dbconnection.Query<MarketingListDTO>(sql, new Dictionary<string, object> { { "isDefault", 1 }, { "tenantId", MyUserInfo.TenantId } }).FirstOrDefault();
        }

        public IEnumerable<MarketingListDTO> GetRecipients(UserInfo MyUserInfo, string RecipientType)
        {
            IEnumerable<MarketingListDTO> _MyList = null;
            string sql = "";
            string sql1 = "";
            IEnumerable<MarketingListDTO> ListDTOList = null;
            List<MarketingListDTO> MyListDTOList = null;
            try
            {
                switch (RecipientType)
                {
                    case "SENDEMAIL":
                        sql = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                            (select count(email) FROM emaillist where listId=lst.Id and email<>'') EmailCount from Marketinglist lst where lst.listName='My Connections' having EmailCount >0;";
                        MyListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sql).ToList();
                        sql1 = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                            (select count(email) FROM emaillist where listId=lst.Id and email<>'') EmailCount from Marketinglist lst where lst.listName<>'My Connections' having EmailCount >0 order by lst.lastUpdate desc;";
                        ListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sql1);
                        for (int i = 0; i < ListDTOList.ToList().Count(); i++)
                        {
                            MyListDTOList.Add(ListDTOList.ToList()[i]);
                        }
                        break;
                    case "SENDINVITATIONS":
                        sql = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                             (select count(url) FROM emaillist eml where listId=lst.Id and not isnull(eml.connectionType) and eml.connectionType<>'1st' and url<>'') EmailCount 
                             from list lst where lst.listName='My Connections'  having EmailCount >0;";

                        MyListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sql).ToList();
                        sql1 = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                             (select count(url) FROM emaillist eml where listId=lst.Id and not isnull(eml.connectionType) and eml.connectionType<>'1st' and url<>'') EmailCount 
                             from list lst where lst.listName<>'My Connections'  having EmailCount >0 order by lst.lastUpdate desc;";
                        ListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sql1);
                        for (int i = 0; i < ListDTOList.ToList().Count(); i++)
                        {
                            MyListDTOList.Add(ListDTOList.ToList()[i]);
                        }
                        break;
                    case "SENDMESSAGES":
                        sql = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                            (select count(url) FROM emaillist where listId=lst.Id and url<>'' and not isnull(connectionType) and connectionType='1st') EmailCount from Marketinglist lst where lst.listName='My Connections' having EmailCount >0;";
                        MyListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sql).ToList();
                        sql1 = @"Select lst.Id ListId,lst.listName,lst.listDesc,lst.tenantId TenantId,lst.userId UserId,lst.lastUpdate,lst.isActive,
                            (select count(url) FROM emaillist where listId=lst.Id and url<>'' and not isnull(connectionType) and connectionType='1st') EmailCount from Marketinglist lst where lst.listName<>'My Connections' having EmailCount >0 order by lst.lastUpdate desc;";
                        ListDTOList = this.m_dbconnection.Query<MarketingListDTO>(sql1);
                        for (int i = 0; i < ListDTOList.ToList().Count(); i++)
                        {
                            MyListDTOList.Add(ListDTOList.ToList()[i]);
                        }
                        break;
                    default:
                        break;
                }

               
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
            }

            return (MyListDTOList.AsEnumerable());
        }

        ConnectionsDisplayResult IConnectionRepository.GetListWithEmailDetails(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
    }

    public class Product
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public Category Category { get; set; }
    }
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public ICollection<Product> Products { get; set; }
    }
}
