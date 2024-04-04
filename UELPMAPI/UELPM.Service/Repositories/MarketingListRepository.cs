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
using System.Text.RegularExpressions;

namespace UELPM.Service.Repositories
{
    public class MarketingListRepository : IMarketingListRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public MarketingListRepository(UserInfo MyUserInfo)
        {
            ////m_dbconnection = new MySqlConnection(ConfigurationManager.ConnectionStrings["LinkedInConnection"].ConnectionString);
            //TenantConnectionStr = string.Format(TenantConnectionStr, MyUserInfo.databasename);
            //m_dbconnection = new MySqlConnection(TenantConnectionStr);
        }

        public ListResult GetList(UserInfo MyUserInfo)
        {
            ListResult listResult  = new ListResult();
            int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();

            //string.Format(" And Leads.LeadsourceId In (SELECT Id FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
            QueryStr = @"Select * From MarketingList; Select count(*) From MarketingList;  ";       

            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    listResult.Status = "SUCCESS";
                    listResult.Message = "SUCCESS";
                    listResult.Lists = result.Read<MarketingListDTO>().AsList();
                    listResult.TotalRecords = result.ReadFirstOrDefault<int>();

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

        public int CreateListWithEmails(ListByEmail listDTO, UserInfo MyUserInfo)
        {
            int NewListId = 0;
            int EmailListId = 0;
            string FirstName = "";
            string LastName = "";
            string Title = "";
            string insertUserSql = @"INSERT MarketingList(listName,listDesc,CompanyId,CreatedBy,CreatedDate) 
                                            values (@listName, @listDesc,@CompanyId,@CreatedBy,@CreatedDate);
                                    SELECT SCOPE_IDENTITY();";
            try
            {
                NewListId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                new
                                                {
                                                    listName = listDTO.ListName,
                                                    listDesc = listDTO.ListName,
                                                    CreatedBy = MyUserInfo.UserId,
                                                    CompanyId=MyUserInfo.CompanyId,
                                                    CreatedDate= DateTime.Now
                                                });
            }
            catch (Exception exp)
            {
                var MessageError = exp.ToString();
            }

            foreach (EmailDTO emailinfo in listDTO.EmailList)
            {
                try
                {
                    //int rowsAffected = _db.Execute(@"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
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
                    string EmailInsertQuery = @"INSERT emaillist(firstname,lastname,aliasName,email,phone,mobile,title,company,website,location,Url,CompanyId,listId,createdBy,createdDate,RegardingId) 
                                                                 values (@firstname, @lastname,@aliasName, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@CompanyId,@listId,@createdBy,@CreatedDate,@RegardingId);
                                                                SELECT SCOPE_IDENTITY();";

                    //byte[] textAsBytes = Encoding.UTF8.GetBytes(emailinfo.firstname);
                    //byte[] textAsBytes1 = Convert.FromBase64String(Convert.ToBase64String(textAsBytes));
                    //string decodedText = Encoding.UTF8.GetString(textAsBytes);
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
                                                        CompanyId=MyUserInfo.CompanyId,
                                                        listId = NewListId,
                                                        typeId = emailinfo.TypeId,
                                                        connectionType = emailinfo.Connectiontype,
                                                        createdBy = MyUserInfo.UserId,
                                                        CreatedDate = DateTime.Now,
                                                        RegardingId=emailinfo.RegardingId
                                                    });
                    if (EmailListId > 0)
                    {
                       // const string DeleteSentInvitationQuery = @" delete from sentinvitations where profileId=@profileId";
                        //SendInvitationDTO MyInvitation = this.m_dbconnection.Query<SendInvitationDTO>(DeleteSentInvitationQuery, new Dictionary<string, object> { { "profileId", emailinfo.Profileid } }).FirstOrDefault();

                    }
                    //      int rowsAffected = _db.Execute(@"INSERT tempemaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
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
                    //int rowsAffected = _db.Execute(@"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
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

                    string EmailInsertQuery = @"INSERT emaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,UpdatedBy,UpdatedDate,listId,RegardingId) 
                                                                 values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@userId,@UpdatedDate,@listId,@RegardingId);
                                                                 SELECT SCOPE_IDENTITY();";


                    EmailListId = this.m_dbconnection.QuerySingle<int>(EmailInsertQuery,
                                                    new
                                                    {
                                                        firstname = emailinfo.FirstName,
                                                        lastname = emailinfo.LastName,
                                                        email = emailinfo.Email,
                                                        phone = emailinfo.Phone,
                                                        mobile = emailinfo.Mobile,
                                                        title = emailinfo.Title,
                                                        company = emailinfo.Company,
                                                        website = emailinfo.Website,
                                                        location = emailinfo.Location,
                                                        Url = emailinfo.Url,
                                                        UpdatedBy = MyUserInfo.UserId,
                                                        UpdatedDate = DateTime.Now,
                                                        tenantId = MyUserInfo.TenantId,
                                                        userId = MyUserInfo.UserId,
                                                        listId = NewListId,
                                                        RegardingId= emailinfo.RegardingId
                                                    });

                    //      int rowsAffected = _db.Execute(@"INSERT tempemaillist(firstname,lastname,email,phone,mobile,title,company,website,location,Url,photourl,profileid,lastupdate,tenantId,userId,listId,typeId) values (@firstname, @lastname, @email,@phone,@mobile,@title,@company,@website,@location,@Url,@photourl,@profileid,@lastupdate,@tenantId,@userId,@listId,typeId)",
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
        public int CreateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }


        public int DeleteList(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public MarketingListDTO GetDefaultListId(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public MarketingListDTO GetListDetails(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public MarketingListDTO GetListInfo(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<MarketingListDTO> GetListWithEmailDetails(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        
        public IEnumerable<MarketingListDTO> GetRecipients(UserInfo MyUserInfo, string RecipientsType)
        {
            throw new NotImplementedException();
        }

        public int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public int UpdateList(MarketingListDTO listDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }   

        public int UpdateListWithNewConnections(ListByEmail listDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
    }
}
