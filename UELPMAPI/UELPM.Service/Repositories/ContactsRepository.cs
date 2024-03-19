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
    public class ContactsRepository : IContactsRepository
    {

        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public ContactsRepository(UserInfo MyUserInfo)
        {
            ////m_dbconnection = new MySqlConnection(ConfigurationManager.ConnectionStrings["LinkedInConnection"].ConnectionString);
            //TenantConnectionStr = string.Format(TenantConnectionStr, MyUserInfo.databasename);
            //m_dbconnection = new MySqlConnection(TenantConnectionStr);
        }

        public ResultReponse CreateContact(ContactDTO contactDTO, UserInfo MyUserInfo)
        {
            string ContactExistQuery =null;
            string AnniversaryDate = null;
            string EmailCheckQuery = "";
            string emailId = "";
            string DateOfBirth = "";

            ResultReponse MyResultReponse = new ResultReponse();
            try
            {

                int NewListId = 0;

                if (!string.IsNullOrEmpty(contactDTO.EmailId))
                {
                    EmailCheckQuery = @"Select emailId from Accounts  Where emailId=@emailId;";
                    emailId = this.m_dbconnection.Query<string>(EmailCheckQuery, new Dictionary<string, object> { { "emailId", contactDTO.EmailId } }).FirstOrDefault();
                }

                if(!string.IsNullOrEmpty(emailId))
                {
                    MyResultReponse.Status = "ERROR";
                    MyResultReponse.StatusCode = "ERROR";
                    MyResultReponse.Message = "Account Name Already Exists...!!!";
                    MyResultReponse.Data = contactDTO.EmailId.ToString();
                }

                ContactExistQuery = @"SELECT c.Id,c.FirstName,c.LastName  FROM contacts c 
                            Where (c.FirstName=@FirstName and c.LastName=@LastName);";
                string ContactName = this.m_dbconnection.Query<string>(ContactExistQuery, new Dictionary<string, object> {
                    { "FirstName", contactDTO.FirstName },
                    { "LastName", contactDTO.LastName }}).FirstOrDefault();

                if (ContactName == null)
                {

                    
                    if (contactDTO.AnniversaryDate!="")
                    {
                        AnniversaryDate = contactDTO.AnniversaryDate.ToString();
                    }
                    if (contactDTO.DateOfBirth!="")
                    {
                        DateOfBirth = contactDTO.DateOfBirth.ToString();
                    }

                    string insertUserSql = @"INSERT contacts
                                            (
                                                regardingId, regarId, salId, FirstName, Midname, 
                                                LastName, JobTitle, leadId, leadNo, AccountId, contactId, curId, 
                                                BusinessPhone, HomePhone, Mobile,  emailId, deptId, 
                                                roleId, manager, managerPhone,    
                                                creditLimit, payTermId, creditHold, priceListId,
                                                createdBy, createdDate,lastmodifiedby,lastmodifieddate,ownerid
                                            ) 
                                            values 
                                            (
                                                @regardingId, @regarId, @salId, @FirstName, @Midname, 
                                                @LastName, @JobTitle, @leadId, @leadNo, @AccountId, @contactId, @curId, 
                                                @BusinessPhone, @HomePhone, @Mobile,  @emailId, @deptId, 
                                                @roleId, @manager, @managerPhone,     
                                                @creditLimit, @payTermId, @creditHold, @priceListId,
                                                @createdBy, @createdDate,@lastmodifiedby,@lastmodifieddate,@ownerid
                                            );
                                    SELECT SCOPE_IDENTITY();";
                    NewListId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                                    new
                                                    {
                                                        Id = 0,
                                                        regardingId = contactDTO.RegardingId,
                                                        regarId = contactDTO.RegarId,
                                                        salId = contactDTO.SalId,
                                                        FirstName = contactDTO.FirstName,
                                                        Midname = contactDTO.Midname,
                                                        LastName = contactDTO.LastName,
                                                        JobTitle = contactDTO.JobTitle,
                                                        leadId = contactDTO.LeadId,
                                                        leadNo = contactDTO.LeadNo,
                                                        AccountId = contactDTO.AccountId,
                                                        contactId = contactDTO.ContactId,
                                                        curId = contactDTO.CurId,
                                                        BusinessPhone = contactDTO.BusinessPhone,
                                                        HomePhone = contactDTO.HomePhone,
                                                        Mobile = contactDTO.Mobile,
                                                        emailId = contactDTO.EmailId,
                                                        deptId = contactDTO.DeptId,
                                                        roleId = contactDTO.RoleId,
                                                        manager = contactDTO.Manager,
                                                        managerPhone = contactDTO.ManagerPhone,
                                                        assistant = contactDTO.Assistant,
                                                        assistantPhone = contactDTO.AssistantPhone,
                                                        genderId = contactDTO.GenderId,
                                                        dateOfBirth = DateOfBirth,
                                                        anniversaryDate = AnniversaryDate,
                                                        contactOwnUserId = contactDTO.ContactOwnUserId,
                                                        maritalStatusId = contactDTO.MaritalStatusId,
                                                        spopusePartnerName = contactDTO.SpopusePartnerName,
                                                        creditLimit = contactDTO.CreditLimit,
                                                        payTermId = contactDTO.PayTermId,
                                                        creditHold = contactDTO.CreditHold,
                                                        priceListId = contactDTO.PriceListId,
                                                        ContactType = contactDTO.ContactType,
                                                        createdBy = contactDTO.CreatedBy,
                                                        createdDate = DateTime.Now,
                                                        lastupdate = DateTime.Now,
                                                        lastmodifiedby = contactDTO.CreatedBy,
                                                        lastmodifieddate= DateTime.Now,
                                                        ownerid=contactDTO.CreatedBy
                                                    });
                    if(NewListId>0)
                    {
                        MyResultReponse.Status = "SUCCESS";
                        MyResultReponse.StatusCode = "SUCCESS";
                        MyResultReponse.Message = "Account Created Successfully ";
                        MyResultReponse.Data = NewListId.ToString();
                    }

                }
                else
                {
                    NewListId = 9999;
                }

                return MyResultReponse;
            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "FAIL";
                MyResultReponse.StatusCode = "FAIL";
                MyResultReponse.Message = "Error Occured while inserting contact administrator";
                MyResultReponse.Data = ex.ToString();
            }
            return MyResultReponse;
        }

        public int UpdateContact(ContactDTO contactDTO, UserInfo MyUserInfo)
        {

            string AnniversaryDate = "";
            string DateOfBirth = "";

            string listName = "";
            string listDesc = "";
            string ContactExistQuery = "";

            string updateQuery = "";
            int Id = 0;
            bool isActive = false;
            int result = 0;

            MarketingListDTO updatedlistDTO = new MarketingListDTO();
            if (contactDTO != null)
            {

                //ContactExistQuery = @"SELECT c.Id,c.FirstName,c.LastName  FROM contacts c 
                //            Where (c.FirstName=@FirstName or c.LastName=@LastName)
                //            And c.Id !=@Id;";

                ContactExistQuery = @"SELECT c.Id,c.FirstName,c.LastName  FROM contacts c 
                        Where (c.FirstName=@FirstName and c.LastName=@LastName)
                        And c.Id !=@Id;";

                string ContactName = this.m_dbconnection.Query<string>(ContactExistQuery, new Dictionary<string, object> {
                    { "FirstName", contactDTO.FirstName },
                    { "LastName", contactDTO.LastName },
                    { "Id", contactDTO.Id }}).FirstOrDefault();

                try
                {
                    if (ContactName == null)
                    {
                       
                        if (contactDTO.AnniversaryDate!="")
                        {
                            AnniversaryDate = contactDTO.AnniversaryDate.ToString();
                        }
                        if (contactDTO.DateOfBirth != "")
                        {
                            DateOfBirth = contactDTO.DateOfBirth.ToString();
                        }
                        updateQuery = @"UPDATE Contacts SET
                                        regardingId         =  @regardingId,
                                        regarId             =  @regarId,
                                        salId               =  @salId,
                                        FirstName    =  @FirstName,
                                        Midname      =  @Midname,
                                        LastName     =  @LastName,
                                        JobTitle     =  @JobTitle,
                                        leadId              =  @leadId,
                                        leadNo              =  @leadNo,
                                        AccountId           =  @AccountId,
                                        contactId           =  @contactId,
                                        curId               =  @curId,
                                        BusinessPhone       =  @BusinessPhone,
                                        HomePhone           =  @HomePhone,
                                        Mobile              =  @Mobile,
                                        emailId             =  @emailId,
                                        deptId              =  @deptId,
                                        roleId              =  @roleId,
                                        manager             =  @manager,
                                        managerPhone        =  @managerPhone,
                                        maritalStatusId     =  @maritalStatusId,
                                        creditLimit         =  @creditLimit,
                                        payTermId           =  @payTermId,
                                        creditHold          =  @creditHold,
                                        priceListId         =  @priceListId,
                                        GenderId            =  @GenderId,
                                        DateOfBirth         =  @DateOfBirth,
                                        AnniversaryDate     =  @AnniversaryDate,
                                        ContactType         =  @ContactType,
                                        updatedBy           =  @updatedBy,
                                        updatedDate         =  @updatedDate,
                                        lastmodifiedby      =  @updatedBy,
                                        lastmodifieddate    =  @updatedDate

                                    WHERE Id =@Id";

                        var BreakHereA = "Break Here A";
                        result = this.m_dbconnection.Execute(updateQuery, new
                        {

                            regardingId = contactDTO.RegardingId,
                            regarId = contactDTO.RegarId,
                            salId = contactDTO.SalId,
                            FirstName = contactDTO.FirstName,
                            Midname = contactDTO.Midname,
                            LastName = contactDTO.LastName,
                            JobTitle = contactDTO.JobTitle,
                            leadId = contactDTO.LeadId,
                            leadNo = contactDTO.LeadNo,
                            AccountId = contactDTO.AccountId,
                            contactId = contactDTO.ContactId,
                            curId = contactDTO.CurId,
                            BusinessPhone = contactDTO.BusinessPhone,
                            HomePhone = contactDTO.HomePhone,
                            Mobile = contactDTO.Mobile,
                            emailId = contactDTO.EmailId,
                            deptId = contactDTO.DeptId,
                            roleId = contactDTO.RoleId,
                            manager = contactDTO.Manager,
                            managerPhone = contactDTO.ManagerPhone,
                            maritalStatusId = contactDTO.MaritalStatusId,
                            creditLimit = contactDTO.CreditLimit,
                            payTermId = contactDTO.PayTermId,
                            creditHold = contactDTO.CreditHold,
                            priceListId = contactDTO.PriceListId,
                            GenderId = contactDTO.GenderId,
                            DateOfBirth = DateOfBirth,
                            AnniversaryDate = AnniversaryDate,
                            ContactType= contactDTO.ContactType,
                            updatedBy = contactDTO.UpdatedBy,
                            updatedDate = DateTime.Now,
                            Id = contactDTO.Id,

                        });

                        //Check Account Contacts if More Than 1 Then 


                        // updatedlistDTO = GetListInfo(listDTO.ListId, MyUserInfo);
                        if (contactDTO.AccountId > 0)
                        {
                            if (contactDTO.PrimaryContactId > 0)
                            {
                                if (contactDTO.Isprimary)
                                {
                                    string updateQuerya = @"UPDATE Contacts SET ISPRIMARY=0 WHERE AccountId =@AccountId";
                                    result = this.m_dbconnection.Execute(updateQuerya, new
                                    {
                                        contactDTO.AccountId,

                                    });

                                    string updateQuery1 = @"UPDATE Contacts SET ISPRIMARY=1 WHERE Id =@Id";
                                    result = this.m_dbconnection.Execute(updateQuery1, new
                                    {
                                        contactDTO.Id,

                                    });
                                    
                                }
                                else
                                {
                                    string updateQuery1 = @"UPDATE Contacts SET ISPRIMARY=0 WHERE Id =@Id";
                                    result = this.m_dbconnection.Execute(updateQuery1, new
                                    {
                                        contactDTO.Id,

                                    });
                                }
                            }
                            else
                            {
                                string updateQuery1 = @"UPDATE Contacts SET ISPRIMARY=0 WHERE Id =@Id";
                                result = this.m_dbconnection.Execute(updateQuery1, new
                                {
                                    contactDTO.Id,

                                });
                            }
                        }
                    }
                    else
                    {
                        result = 9999;
                    }


                    return result;
                }

                catch (Exception exp)
                {
                    var error = exp.ToString();
                }
            }
                return result;

        }
        public ResultReponse DeleteContact(ContactDTO contactDTO, UserInfo MyUserInfo)
        {
            ResultReponse MyResultReponse = new ResultReponse();
            int result = 0;
            try
            {

                string updateQuery = @"UPDATE Contacts 
SET IsActive = @IsActive,

deletedBy=@deletedBy,
deletedDate=@deletedDate WHERE Id =@Id";

                result = this.m_dbconnection.Execute(updateQuery, new
                {
                    IsActive = contactDTO.IsActive,
                    deletedBy = MyUserInfo.UserId,
                    deletedDate = DateTime.Now,
                    Id = contactDTO.Id


                });
                MyResultReponse.Status = "SUCCESS";
                MyResultReponse.StatusCode = "SUCCESS";
                MyResultReponse.Message = "Contact Updated Successfully ";
                MyResultReponse.Data = result.ToString();
            }
            catch (Exception ex)
            {
                MyResultReponse.Status = "ERROR";
                MyResultReponse.StatusCode = "ERROR";
                MyResultReponse.Message = "Updating Failed...!!!";
                MyResultReponse.Data = contactDTO.ToString();
            }
            return MyResultReponse;
        }

        public ContactDTO GetContactAccountById(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ContactDTO GetContactDetailById(int Id, UserInfo MyUserInfo)
        {

            QueryStr = @"SELECT 
                        c.Id,AC.AccountName,concat(c.FirstName,' ', c.LastName) ContactName,
                        c.regardingId,c.regarId,c.salID,c.FirstName,c.Midname,c.LastName,c.JobTitle,c.leadId,c.leadNo,c.AccountId,c.curId,
                        c.BusinessPhone,c.HomePhone,c.Mobile,c.emailId,c.deptId,c.roleId,c.manager,c.managerPhone,c.assistant,c.genderId,
                        convert(varchar,c.dateOfBirth,23) dateOfBirth ,convert(varchar,c.anniversaryDate,23) anniversaryDate,c.contactOwnUserId,c.maritalStatusId,c.SpousePartnerName,c.creditLimit,c.payTermId,c.creditHold,c.priceListId,
                        c.ContactDesc,c.ContactType,c.createdBy,c.createdDate,c.updatedBy,c.updateddate,c.deletedBy,c.deletedDate,c.IsActive,
                        c.IsPrimary,c.EmailOpt,c.SkypeId,
				        case when c.isActive=1 then 'Active'  else 'In Active' end as Status,UserProfile.UserName
                        FROM contacts c 
				        left join accounts AC  on AC.Id=c.AccountId   
                        inner join UserProfile on UserProfile.UserId=c.Createdby  
                        where c.Id=@id;";
            ContactDTO contactDTO = this.m_dbconnection.Query<ContactDTO>(QueryStr, new Dictionary<string, object> { { "id", Id } }).FirstOrDefault();



            return contactDTO;
        }

        public ContactInfo GetContactByContactId(int Id, UserInfo MyUserInfo)
        {
            IEnumerable<ListIds> listIds = null;
            ContactInfo contactInfo = new ContactInfo();
            QueryStr = @"SELECT 
                        c.Id,AC.AccountName,concat(c.FirstName,' ', c.LastName) ContactName,
                        c.regardingId,c.regarId,c.salID,c.FirstName,c.Midname,c.LastName,c.JobTitle,c.leadId,c.leadNo,c.AccountId,c.curId,
                        c.BusinessPhone,c.HomePhone,c.Mobile,c.emailId,c.deptId,c.roleId,c.manager,c.managerPhone,c.assistant,c.genderId,
                        convert(varchar,c.dateOfBirth,23) dateOfBirth ,convert(varchar,c.anniversaryDate,23) anniversaryDate,c.contactOwnUserId,c.maritalStatusId,c.SpousePartnerName,c.creditLimit,c.payTermId,c.creditHold,c.priceListId,
                        c.ContactDesc,c.ContactType,c.createdBy,c.createdDate,c.updatedBy,c.updateddate,c.deletedBy,c.deletedDate,c.IsActive,
                        c.IsPrimary,c.EmailOpt,c.SkypeId,
				        case when c.isActive=1 then 'Active'  else 'In Active' end as Status,UserProfile.UserName
                        FROM contacts c 
				        left join accounts AC  on AC.Id=c.AccountId   
                        inner join UserProfile on UserProfile.UserId=c.Createdby  
                        where c.Id=@id;";
            ContactDTO contactDTO = this.m_dbconnection.Query<ContactDTO>(QueryStr, new Dictionary<string, object> { { "id", Id } }).FirstOrDefault();
            if(contactDTO !=null)
            {
                //Get Connections Groups
                QueryStr = @" Select ListId From EmailList Where ContactId=@id";

                listIds = this.m_dbconnection.Query<ListIds>(QueryStr, new Dictionary<string, object> { { "id", Id } }).ToList();

                if (listIds != null)
                {
                    contactInfo.ListIds = listIds;
                }
                contactInfo.Contact = contactDTO;

            }


            return contactInfo;
        }
        public ContactsResults GetContactList(UserInfo MyUserInfo)
        {
            ContactsResults contactsResults  = new ContactsResults();
            int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();

            //string.Format(" And Leads.LeadsourceId In (SELECT Id FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
            QueryStr = @"SELECT 
                c.Id,AC.AccountName,concat(c.FirstName,' ', c.LastName) ContactName,
                c.regardingId,c.regarId,c.salID,c.FirstName,c.Midname,c.LastName,c.JobTitle,c.leadId,c.leadNo,c.AccountId,c.curId,
                c.BusinessPhone,c.HomePhone,c.Mobile,c.emailId,c.deptId,c.roleId,c.manager,c.managerPhone,c.assistant,c.genderId,
                c.dateOfBirth,c.anniversaryDate,c.contactOwnUserId,c.maritalStatusId,c.SpousePartnerName,c.creditLimit,c.payTermId,c.creditHold,c.priceListId,
                c.ContactDesc,c.ContactType,c.createdBy,c.createdDate,c.updatedBy,c.updateddate,c.deletedBy,c.deletedDate,c.IsActive,
                c.EmailOpt,c.SkypeId,
				case when c.isActive=1 then 'Active'  else 'In Active' end as Status,UserProfile.UserName
                FROM contacts c 
				left join accounts AC  on AC.Id=c.AccountId  ";

            QueryStr = QueryStr + "inner join UserProfile on UserProfile.UserId=c.Createdby ";
            QueryStr = QueryStr + " where c.createdBy in ";
            QueryStr = QueryStr + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);
            QueryStr = QueryStr + "order by ac.AccountName,c.createdDate desc;\n\n";


            CountQueryStr = @"SELECT Count(*)
                                FROM contacts c 
				                left join accounts AC  on AC.Id=c.AccountId  ";
            CountQueryStr = CountQueryStr + "inner join UserProfile on UserProfile.UserId=c.Createdby ";
            CountQueryStr = CountQueryStr + " where c.createdBy in ";
            CountQueryStr = CountQueryStr + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);

            QueryStr = QueryStr + CountQueryStr;

            try
            {

                //using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                //{
                //    UserId = MyUserInfo.UserId

                //}, commandType: CommandType.Text))

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    contactsResults.Status = "SUCCESS";
                    contactsResults.Message = "SUCCESS";
                    contactsResults.Contacts = result.Read<ContactDTO>().AsList();
                    contactsResults.TotalRecords = result.ReadFirstOrDefault<int>();

                }
                return contactsResults;
            }
            catch (Exception exp)
            {
                contactsResults.Status = "ERROR";
                contactsResults.Message = exp.ToString();
            }
            return contactsResults;

        }

        public IEnumerable<ContactDTO> GetPrimaryContactListById(int Id, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ContactsResults SearchContact(UserInfo MyUserInfo, ContactSearch contactSearch)
        {
            string ViewSQL = "";
            int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();
            ContactsResults contactsResults = new ContactsResults();
            AppViewsDTO appViewsDTO = new AppViewsDTO();

            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);

            appViewsDTO = appViewsRepository.GetAppViewsByModuleId(contactSearch.ModuleId, contactSearch.FormId, contactSearch.ViewId, MyUserInfo);

            ViewSQL = appViewsDTO.ViewSQL;
            
            

            if (!string.IsNullOrEmpty(ViewSQL))
            {
                QueryStr = ViewSQL;
                //select data from dbo.Split(dbo.GetUserIds(685),',')
                //QueryStr = QueryStr + " \nand c.createdBy in " + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);

                //QueryStr = QueryStr + string.Format(" \nAnd Leads.OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));
                QueryStr = QueryStr + string.Format(" \nAnd c.ownerid In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

                //QueryStr = QueryStr + " \nand c.ownerid in " + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);

            }
            else
            {
                QueryStr = @"SELECT 
                        c.Id,AC.AccountName,concat(c.FirstName,' ', c.LastName) ContactName,
                        c.regardingId,c.regarId,c.salID,c.FirstName,c.Midname,c.LastName,c.JobTitle,c.leadId,c.leadNo,c.AccountId,AC.AccountName,c.curId,
                        c.BusinessPhone,c.HomePhone,c.Mobile,c.emailId,c.deptId,c.roleId,c.manager,c.managerPhone,c.assistant,c.genderId,
                        c.dateOfBirth,c.anniversaryDate,c.contactOwnUserId,c.maritalStatusId,c.SpousePartnerName,c.creditLimit,c.payTermId,c.creditHold,c.priceListId,
                        c.ContactDesc,c.ContactType,c.createdBy,c.createdDate,c.updatedBy,c.updateddate,c.deletedBy,c.deletedDate,c.IsActive,
                        c.EmailOpt,c.SkypeId,
				        case when c.isActive=1 then 'Active'  else 'In Active' end as Status,UserProfile.UserName
                        FROM contacts c 
				        left join accounts AC  on AC.Id=c.AccountId  
                        inner join UserProfile on UserProfile.UserId=c.Createdby 
                        Where 1=1 ";
                //QueryStr = QueryStr + " \nand c.createdBy in " + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);
                //QueryStr = QueryStr + " \nand c.ownerid in " + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);
                QueryStr = QueryStr + string.Format(" \nAnd c.ownerid In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));
            }


            //string.Format(" And Leads.LeadsourceId In (SELECT Id FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);

            if (!string.IsNullOrEmpty(contactSearch.FirstName))
            {
                QueryStr = QueryStr + " \nAnd ( c.FirstName like '%" + contactSearch.FirstName + "%')";
            }

            if (!string.IsNullOrEmpty(contactSearch.LastName))
            {
                QueryStr = QueryStr + " \nAnd ( c.LastName like '%" + contactSearch.LastName + "%')";
            }
            if (!string.IsNullOrEmpty(contactSearch.Mobile))
            {
                QueryStr = QueryStr + " \nAnd ( c.Mobile like '%" + contactSearch.Mobile + "%')";
            }

            if (!string.IsNullOrEmpty(contactSearch.Email))
            {
                QueryStr = QueryStr + " \nAnd ( c.EmailId like '%" + contactSearch.Email + "%')";
            }
            //QueryStr = QueryStr + "order by ac.AccountName,c.createdDate desc;\n\n";

            if (contactSearch.Skip == 0 && contactSearch.Take == 0)
            {
                //Nothing To do
                //QueryStr = QueryStr + " \nOrder By c.CreatedDate Desc;";
                QueryStr = QueryStr + " \nOrder By c.LastModifiedDate Desc;";
            }
            if (contactSearch.Skip >= 0 && contactSearch.Take > 0)
            {
                //QueryStr = QueryStr + " \nOrder By c.CreatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", contactSearch.Skip, contactSearch.Take);
                QueryStr = QueryStr + " \nOrder By c.LastModifiedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", contactSearch.Skip, contactSearch.Take);
            }

            CountQueryStr = @"SELECT Count(*)
                                FROM contacts c 
				                left join accounts AC  on AC.Id=c.AccountId  ";
            CountQueryStr = CountQueryStr + " \ninner join UserProfile on UserProfile.UserId=c.Createdby ";
            CountQueryStr = CountQueryStr + " \nwhere 1=1 ";

            if (!string.IsNullOrEmpty(contactSearch.FirstName))
            {
                CountQueryStr = CountQueryStr + " \nAnd ( c.FirstName like '%" + contactSearch.FirstName + "%')";
            }

            if (!string.IsNullOrEmpty(contactSearch.LastName))
            {
                CountQueryStr = CountQueryStr + " \nAnd ( c.LastName like '%" + contactSearch.LastName + "%')";
            }
            if (!string.IsNullOrEmpty(contactSearch.Mobile))
            {
                CountQueryStr = CountQueryStr + " \nAnd ( c.Mobile like '%" + contactSearch.Mobile + "%')";
            }

            if (!string.IsNullOrEmpty(contactSearch.Email))
            {
                CountQueryStr = CountQueryStr + " \nAnd ( c.EmailId like '%" + contactSearch.Email + "%')";
            }
            //CountQueryStr = CountQueryStr + " \nand  c.createdBy in " + string.Format(" (SELECT Data FROM [dbo].[Split] ('{0}',','))", MyUserInfo.UsersIds);
            CountQueryStr = CountQueryStr + string.Format(" And c.OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));
            QueryStr = QueryStr + CountQueryStr;

            try
            {

                //using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                //{
                //    UserId = MyUserInfo.UserId

                //}, commandType: CommandType.Text))

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    contactsResults.Status = "SUCCESS";
                    contactsResults.Message = "SUCCESS";
                    contactsResults.Contacts = result.Read<ContactDTO>().AsList();
                    contactsResults.TotalRecords = result.ReadFirstOrDefault<int>();
                    contactsResults.QueryStr = QueryStr;

                }
                return contactsResults;
            }
            catch (Exception exp)
            {
                contactsResults.Status = "ERROR";
                contactsResults.Message = exp.ToString();
            }
            return contactsResults;
        }

        public IEnumerable<MaritalStatus> GetMaritalStatus(UserInfo MyUserInfo)
        {
            QueryStr = @"Select * From MaritalStatus Where MaritalStatusActive=1;";
            IEnumerable<MaritalStatus> maritalStatus = this.m_dbconnection.Query<MaritalStatus>(QueryStr).ToList();

            return maritalStatus;
        }

        public MaritalStatus GetMaritalStatusById(int Id, UserInfo MyUserInfo)
        {
            QueryStr = @"Select * From MaritalStatus Where MaritalStatusActive=1 And MaritalStatusID=@id;";
            MaritalStatus maritalStatus = this.m_dbconnection.Query<MaritalStatus>(QueryStr, new Dictionary<string, object> { { "id", Id } }).FirstOrDefault();

            return maritalStatus;
        }

        public ContactsResults GetContactsByAccountId(int AccountId, UserInfo MyUserInfo)
        {
            ContactsResults contactsResults = new ContactsResults();
            int[] Ids = MyUserInfo.UsersIds.Split(',').Select(n => Convert.ToInt32(n)).ToArray();

            //string.Format(" And Leads.LeadsourceId In (SELECT Id FROM [dbo].[Split] ('{0}',','))", leadsSearchInput.LeadSourceId);
            QueryStr = string.Format("Select * From Contacts Where AccountId={0}; \n", AccountId);
            QueryStr = QueryStr + string.Format("Select Count(*) From Contacts Where AccountId={0};", AccountId);


            try
            {
                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    contactsResults.Status = "SUCCESS";
                    contactsResults.Message = "SUCCESS";
                    contactsResults.Contacts = result.Read<ContactDTO>().AsList();
                    contactsResults.TotalRecords = result.ReadFirstOrDefault<int>();

                }
                return contactsResults;
            }
            catch (Exception exp)
            {
                contactsResults.Status = "ERROR";
                contactsResults.Message = exp.ToString();
            }
            return contactsResults;
        }
    
    

    
    }
}
