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
using UELPM.Service.Exceptions;

namespace UELPM.Service.Repositories
{
    public class UserProfileRepository : IUserProfileRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public IEnumerable<UserProfile> GetUser()
        {

            return this.m_dbconnection.Query<UserProfile>("User_CRUD",
                                new
                                {
                                    Action = "SELECT",
                                }, commandType: CommandType.StoredProcedure).ToList();
        }

        public UserProfile GetUserById(int? userId)
        {
            return this.m_dbconnection.Query<UserProfile>("User_CRUD",
                                 new
                                 {
                                     Action = "SELECTBYID",
                                     UserId = userId
                                 }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public UserProfile GetUserRolesInCompany(int userId, int companyId)
        {
            const string sql = @" SELECT DISTINCT UserProfile.UserID, UserProfile.FirstName, UserProfile.LastName, UserProfile.UserName,    
                                Roles.RoleID, Roles.RoleName    
                                FROM   UserProfile LEFT JOIN UsersInRoles    
                                ON UsersInRoles.UserID = UserProfile.UserID    
                                LEFT JOIN Roles on Roles.RoleID = UsersInRoles.RoleID  
                                LEFT JOIN  Company ON UsersInRoles.CompanyId = Company.CompanyId   
                                WHERE UserProfile.IsActive = 1 and UsersInRoles.CompanyId = @CompanyId and  UserProfile.UserID=@UserID";

            var parameters = new Dictionary<string, object> {
                {"CompanyId", companyId},
                {"UserID", userId}
            };

            var userDictionary = new Dictionary<int, UserProfile>();

            var userDetails = m_dbconnection.Query<UserProfile, Roles, UserProfile>(sql,
                    (userProfile, role) =>
                    {
                        if (!userDictionary.TryGetValue(userProfile.UserID, out UserProfile up))
                        {
                            up = userProfile;
                            up.Roles = up.Roles ?? new List<Roles>();

                            userDictionary.Add(up.UserID, up);
                        }

                        up.Roles.Add(role);

                        return up;
                    }, parameters, splitOn: "UserID,RoleID").FirstOrDefault();


            return userDetails;
        }

        public int CreateUser(UserProfile user)
        {
            return this.m_dbconnection.Query<int>("User_CRUD",
                new
                {
                    Action = "INSERT",
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Emailid = user.EmailId,
                    LocationId = user.LocationId,
                    CompanyId = user.CompanyId,
                    Title = user.Title,
                    Password = CreateRandomPassword(8),
                    Address1 = user.Address1,
                    Address2 = user.Address2,
                    Address3 = user.Address3,
                    CountryId = user.CountryId,
                    ZipCode = user.ZipCode,
                    EmailSignature = user.EmailSignature,
                    AlterApprovarUserId = user.AlterApprovarUserId,
                    AlternateStartdate = user.AlternateStartdate,
                    AlternateEndDate = user.AlternateEndDate,
                    PhoneNumber = user.PhoneNumber


                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }
        //public UserProfile GetRolebyUser(string username)
        //{
        //    return this.m_dbconnection.Query<UserProfile>("select Roles.RoleID, RoleName as UserRole,UP.UserID,up.Emailid,up.Firstname as UserName from Roles inner join UsersInRoles on Roles.RoleID = UsersInRoles.RoleID inner join UserProfile UP on UsersInRoles.UserID = UP.UserID inner join Company C on UsersInRoles.CompanyId = C.CompanyId and UsersInRoles.IsSelected = 1 where UP.UserID in (select UserID from UserProfile where UserName = @username)",
        //    //return this.m_dbconnection.Query<UserProfile>("select Roles.RoleID, RoleName as UserRole,UP.UserID,up.Emailid,up.Firstname as UserName from Roles inner join UsersInRoles on Roles.RoleID = UsersInRoles.RoleID inner join UserProfile UP on UsersInRoles.UserID = UP.UserID inner join Company C on UsersInRoles.CompanyId = C.CompanyId and UsersInRoles.CompanyId = @companyId where UP.UserID in (select UserID from UserProfile where UserName = @username)",
        //        new
        //         {
        //             UserName = username,
        //         }, commandType:CommandType.Text).FirstOrDefault();


        //}

        public UserProfile GetRolebyUser(string username)
        {
            const string sql =
                @"SELECT UP.UserID,up.Emailid,up.Firstname +' '+up.LastName As FullName,up.Firstname as UserName,
                            up.FirstName,up.LastName,up.isADUser,isnull(UP.CompanyId,0) as CompanyId, 
                                    Roles.RoleID, Roles.RoleName, UsersInRoles.IsSelected from Roles inner join UsersInRoles
                         on Roles.RoleID = UsersInRoles.RoleID
                        inner join UserProfile UP on UsersInRoles.UserID = UP.UserID
                        inner join Company C on UsersInRoles.CompanyId = C.CompanyId		
                        and UsersInRoles.CompanyId IN (select CompanyId from UsersInRoles where UsersInRoles.IsSelected = 1 and UsersInRoles.UserID in (select UserID from UserProfile where UserName =  @username))
                        where UP.UserID in (select UserID from UserProfile where UserName =  @username)";

            var parameters = new Dictionary<string, object>
            {
                {"Action", "SELECT"},
                {"username", username}
            };

            var userDictionary = new Dictionary<int, UserProfile>();

            var userDetails = m_dbconnection.Query<UserProfile, Roles, UserProfile>(sql,
                    (userProfile, role) =>
                    {
                        if (!userDictionary.TryGetValue(userProfile.UserID, out UserProfile up))
                        {
                            up = userProfile;
                            up.Roles = up.Roles ?? new List<Roles>();

                            userDictionary.Add(up.UserID, up);
                        }

                        up.Roles.Add(role);

                        return up;
                    }, parameters, splitOn: "UserID,RoleID").FirstOrDefault();


            return userDetails;

        }

        public int UpdateUser(UserProfile user)
        {
            return this.m_dbconnection.Query<int>("User_CRUD",
               new
               {
                   Action = "UPDATE",
                   UserID = user.UserID,
                   UserName = user.UserName,
                   FirstName = user.FirstName,
                   LastName = user.LastName,
                   Emailid = user.EmailId,
                   LocationId = user.LocationId,
                   CompanyId = user.CompanyId,
                   Title = user.Title,
                   Password = CreateRandomPassword(8),
                   Address1 = user.Address1,
                   Address2 = user.Address2,
                   Address3 = user.Address3,
                   CountryId = user.CountryId,
                   ZipCode = user.ZipCode,
                   EmailSignature = user.EmailSignature,
                   AlterApprovarUserId = user.AlterApprovarUserId,
                   AlternateStartdate = user.AlternateStartdate,
                   AlternateEndDate = user.AlternateEndDate,
                   PhoneNumber = user.PhoneNumber
               }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public bool DeleteUser(int userId)
        {
            return this.m_dbconnection.Query<bool>("usp_DeleteUser", new { userId = userId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public bool LogOffUser(int userId)
        {
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            string UserName = userProfileRepository.GetUserById(userId).UserName;
            // int CompanyId = GetCompanyId(userId);
            AuditLog.Info("UserProfile", "Logoff", userId.ToString(), userId.ToString(), "Logoff", UserName + " logged off at " + DateTime.Now.ToString(), 0);
            return true;
        }

        //public int GetCompanyId(int userId)
        //{
        //    int CompanyId = 0;
        //    try
        //    {
        //        CompanyId = this.m_dbconnection.Query<int>("select CompanyId from UserProfile where UserID=" + userId).FirstOrDefault();
        //    }
        //    catch (Exception e)
        //    {

        //    }

        //    return CompanyId;
        //}

        public string CreateRandomPassword(int PasswordLength)
        {
            string _allowedChars = "0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ!@#$%^&*-+=";
            Random randNum = new Random();
            char[] chars = new char[PasswordLength];
            int allowedCharCount = _allowedChars.Length;
            for (int i = 0; i < PasswordLength; i++)
            {
                chars[i] = _allowedChars[(int)((_allowedChars.Length) * randNum.NextDouble())];
            }
            return new string(chars);
        }

        public UserProfile ValidateUser(string userName, string Password)
        {
            return this.m_dbconnection.Query<UserProfile>("User_Login",
                                 new
                                 {
                                     Action = "LOGIN",
                                     UserName = userName,
                                     Password = Password
                                 }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public UserProfile Authenticate(string UserName, string Password)
        {
            //    UserManagement MyUserInfo = new UserManagement();

            //    const string sql =
            //            @"Select usr.Id as UserId,usr.userTypeId,usr.firstName,usr.lastName,usr.UserName,usr.userEmail,usr.userEmail Email,usr.userPassword,usr.TenantId,usr.roleId,
            //            usr.annualQuota,tn.Id,tn.tenantName,tn.linkedinEmail,tn.linkedinPassword,tn.linkedinTypeId,tn.subscriptionId,usr.isFirstTime,
            //            tn.databasename,tn.subscriptionId,sb.subscriptionName,sb.subscriptionType,tn.subscriptionEnd,usr.IsFirstTime IsFirstTime,
            //(select userName from users where Id=usr.managerId) ManagerName,
            //      (case when (select concat(group_concat(u.Id),',',u.managerId)  end from users u where u.managerId=usr.id) is null then usr.id else (select  concat(group_concat(u.Id),',',u.managerId) end from users u where u.managerId=usr.id) end)  UsersIds,
            //            tn.creditLimit
            //            From Users usr
            //            Inner Join tenants tn on tn.Id=usr.tenantId
            //            Inner Join subscription sb on sb.subscriptionId=tn.subscriptionId
            //            where usr.userEmail=@email and usr.userPassword=@password;";

            //    MyUserInfo = this.m_dbconnection.Query<UserManagement>(sql, new Dictionary<string, object> { { "email", UserName }, { "password", Password } }).FirstOrDefault();

            //    return MyUserInfo;

            string userName = UserName;
            return this.m_dbconnection.Query<UserProfile>("User_Login",
                     new
                     {
                         Action = "LOGIN",
                         UserName = userName,
                         Password = Password
                     }, commandType: CommandType.StoredProcedure).FirstOrDefault();

        }

        public UserProfile TokenValidation(string UserName, int UserId)
        {
            //UserManagement MyUserInfo = new UserManagement();

            return this.m_dbconnection.Query<UserProfile>("User_Login",
                     new
                     {
                         Action = "VALIDATE",
                         UserName = UserName,
                         UserId = UserId
                     }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }
        public void GetPasswordAtttempt(string userName)
        {
            this.m_dbconnection.Query<UserProfile>("User_CRUD",
                                 new
                                 {
                                     Action = "GETPASSWORDATTEMPT",
                                     UserName = userName,

                                 }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public void SetPasswordAtttempt(string userName)
        {
            this.m_dbconnection.Query<UserProfile>("User_CRUD",
                                 new
                                 {
                                     Action = "SETPASSWORDATTEMPT",
                                     UserName = userName,

                                 }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public IEnumerable<UserProfile> GetUsersByCompany(string searchKey, int roleId, int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<UserProfile>("User_CRUD",
                 new
                 {
                     Action = "SELECTBYCOMPANY",
                     Search = searchKey,
                     RoleID = roleId,
                     CompanyId = companyId
                 }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<UserProfile> GetUsersByCompany(UserSearch userSearch)
        {
            try
            {
                List<UserProfile> users = null;
                List<UserProfile> filteredUsers = null;
                List<UserProfile> resultUsers = null;
                users = this.m_dbconnection.Query<UserProfile>("User_CRUD",
                 new
                 {
                     Action = "COMPANYUSERS",
                     Search = userSearch.Search,
                     UserID = userSearch.UserID,
                     CompanyId = userSearch.CompanyId
                 }, commandType: CommandType.StoredProcedure).ToList();

                //processing users     
                if (userSearch.UserID != null)
                {
                    WorkFlowReAssignment workFlowReAssignmentDetails = new WorkFlowReAssignment();
                    workFlowReAssignmentDetails.UserRoles = this.m_dbconnection.Query<Roles>("User_CRUD",
                                               new
                                               {
                                                   Action = "GETUSERROLESBYCOMPANY",
                                                   UserId = userSearch.UserID
                                               },
                                               commandType: CommandType.StoredProcedure).ToList();

                    foreach (var role in workFlowReAssignmentDetails.UserRoles)
                    {
                        var result = users.Where(c => c.CompanyId == role.CompanyId && role.RoleIds == c.RoleIds);
                        if (filteredUsers != null)
                        {
                            resultUsers = filteredUsers;
                            foreach (UserProfile filteredUser in resultUsers.ToList())
                            {
                                var user = result.SingleOrDefault(s => s.UserID == filteredUser.UserID);
                                if (user == null)
                                {
                                    filteredUsers.Remove(filteredUser);
                                }
                            }
                        }
                        else
                        {
                            filteredUsers = result.ToList();
                        }

                    }

                    users = filteredUsers;

                }

                return users;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<UserProfile> GetUsersByRole(UserSearch userSearch)
        {
            try
            {
                List<UserProfile> users = null;
                users = this.m_dbconnection.Query<UserProfile>("User_CRUD",
                                      new
                                      {
                                          Action = "GETUSERSBYROLES",
                                          UserId = userSearch.UserID,
                                          Search = userSearch.Search
                                      },
                                      commandType: CommandType.StoredProcedure).ToList();

                return users;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


    }
}
