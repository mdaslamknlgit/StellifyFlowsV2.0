using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;
using UELPM.Util.Email;

namespace UELPM.Service.Repositories
{
    public class UserManagementRepository : IUserManagementRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        UserProfileRepository objUserRepository = new UserProfileRepository();
        public UserManagementDisplayResult GetUserManagement(GridDisplayInput gridDisplayInput)
        {
            try
            {
                UserManagementDisplayResult usermanagementDisplayResult = new UserManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("UserManagement_CRUD", new
                {
                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    CompanyId = gridDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    usermanagementDisplayResult.UserManagementList = result.Read<UserManagementList>().AsList();
                    usermanagementDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return usermanagementDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public UserManagementDisplayResult GetFilterUserManagement(UserManagementFilterDisplayInput userManagementFilterDisplayInput)
        {
            try
            {
                UserManagementDisplayResult userManagementDisplayResult = new UserManagementDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("UserManagement_CRUD", new
                {
                    Action = "FILTER",
                    UserNameFilter = userManagementFilterDisplayInput.UserNameFilter,
                    RolesNameFilter = userManagementFilterDisplayInput.RolesNameFilter,
                    Skip = userManagementFilterDisplayInput.Skip,
                    Take = userManagementFilterDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    userManagementDisplayResult.UserManagementList = result.Read<UserManagementList>().AsList();
                    userManagementDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return userManagementDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }


        //public IEnumerable<UserProfile> GetUsers(string searchKey)
        //{
        //    try
        //    {
        //        return this.m_dbconnection.Query<UserProfile>("usp_GetUsersforUserSetting", new
        //        {
        //            SearchKey = searchKey
        //        }, commandType: CommandType.StoredProcedure);
        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }
        //}

        public int CheckUserCount(string searchKey)
        {
            try
            {
                int status = 0;
                using (var result = this.m_dbconnection.QueryMultiple("UserManagement_CRUD",
                                        new
                                        {
                                            Action = "COUNTUSER",
                                            Search = searchKey
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    status = result.ReadFirstOrDefault<int>();
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<User> GetUsers(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<User>("usp_GetUsersforUserSetting", new
                {
                    SearchKey = searchKey
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<UserProfile> GetReportingUsers(int CompanyId)
        {
            IEnumerable<UserProfile> userProfiles = null;
            const string sql = @"Select * From UserProfile Where CompanyId=@CompanyId;";
            userProfiles = this.m_dbconnection.Query<UserProfile>(sql, new Dictionary<string, object> { { "CompanyId", CompanyId } }).ToList();

            return userProfiles;
        }
        public UserManagement GetUserDetails(int userId)
        {
            UserManagement userManagementObj = new UserManagement();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("UserManagement_CRUD", new
                {

                    Action = "SELECTBYUSERID",
                    UserId = userId
                }, commandType: CommandType.StoredProcedure))
                {
                    userManagementObj = result.Read<UserManagement>().FirstOrDefault();
                    if (userManagementObj != null)
                    {
                        var companies = result.Read<UserCompany>().Distinct().ToList();
                        var roles = result.Read<UserRole>().ToList();
                        var departments = result.Read<UserDepartment>().ToList();
                        userManagementObj.RolesDetails = new List<RolesDetails>();
                        foreach (var company in companies)
                        {
                            var _roledetails = new RolesDetails();
                            _roledetails.Company = new Companies { CompanyId = company.CompanyId, CompanyName = company.CompanyName };
                            var _roles = new List<UserRoles>();
                            foreach (var role in roles.Where(x => x.CompanyId == company.CompanyId))
                            {
                                _roles.Add(new UserRoles { RoleID = role.RoleID, RoleName = role.RoleName });
                            }
                            _roledetails.Role = _roles;
                            var _departments = new List<Locations>();
                            foreach (var dept in departments.Where(x => x.CompanyId == company.CompanyId))
                            {
                                _departments.Add(new Locations { LocationID = dept.LocationID, Name = dept.Name });
                            }
                            _roledetails.DepartmentList = _departments;
                            _roledetails.IsSelected = company.IsSelected;
                            _roledetails.UserID = company.UserId;
                            userManagementObj.RolesDetails.Add(_roledetails);
                        }
                        //userManagementObj.UserProfile = result.Read<UserProfile>().FirstOrDefault();
                        //userManagementObj.RolesDetails = result.Read<RolesDetails, Companies, UserRoles, RolesDetails>((Pc, CC, RD) =>
                        //{
                        //    Pc.Company = CC;
                        //    Pc.Role = RD;
                        //    return Pc;
                        //}, splitOn: "CompanyId,RoleID").ToList();

                        userManagementObj.User = result.Read<User>().FirstOrDefault();

                        userManagementObj.Country = this.m_dbconnection.Query<Country>("usp_GetCountries",
                                      new
                                      {
                                          CountryId = userManagementObj.CountryId
                                      }, commandType: CommandType.StoredProcedure).FirstOrDefault();


                    }

                }
                return userManagementObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ValidateUserManagement(ValidateUserManagement validateUserManagement)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("UserManagement_CRUD",
                                        new
                                        {
                                            Action = "VALIDATE",
                                            UserId = validateUserManagement.UserId
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate UserId";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

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

        public string CreateUserManagement(UserManagement m_userManagement)
        {
            int UserId = 0;
            string status = string.Empty;
            this.m_dbconnection.Open();
            var companyid = 0;
            var data = m_userManagement.RolesDetails.Where(x => x.IsSelected == true).FirstOrDefault();
            if (data != null)
            {
                companyid = data.Company.CompanyId;
            }
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    string Pwd = CreateRandomPassword(8);

                    UserId = this.m_dbconnection.Query<int>("UserManagement_CRUD", new
                    {
                        Action = "INSERT",
                        UserName = m_userManagement.UserName,
                        FirstName = m_userManagement.FirstName,
                        LastName = m_userManagement.LastName,
                        Emailid = m_userManagement.Emailid,
                        LocationId = m_userManagement.LocationId,
                        CompanyId = companyid,
                        Title = m_userManagement.Designation,
                        Password = Pwd,
                        Address1 = m_userManagement.Address1,
                        Address2 = m_userManagement.Address2,
                        Address3 = m_userManagement.Address3,
                        CountryId = m_userManagement.CountryId,
                        ZipCode = m_userManagement.ZipCode,
                        EmailSignature = m_userManagement.EmailSignature,
                        AlterApprovarUserId = m_userManagement.AlterApprovarUserId,
                        //AlterApprovarUserId = m_userManagement.User.UserID,
                        ApprovalStartDate = m_userManagement.ApprovalStartDate,
                        ApprovalEndDate = m_userManagement.ApprovalEndDate,
                        Designation = m_userManagement.Designation,
                        PhoneNumber = m_userManagement.PhoneNumber,
                        IsActive = m_userManagement.IsActive,
                        ManagerId=m_userManagement.ManagerId
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    if (UserId > 0)
                    {
                        #region  we are saving roles details items...
                        if (m_userManagement.RolesDetails != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in m_userManagement.RolesDetails)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@UserID", UserId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", record.Company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@IsSelected", record.IsSelected, DbType.Boolean, ParameterDirection.Input);
                                foreach (var role in record.Role)
                                {
                                    itemObj.Add("@RoleID", role.RoleID, DbType.Int32, ParameterDirection.Input);
                                    var rolesItemSaveResult = this.m_dbconnection.Execute("UserManagement_CRUD", itemObj, transaction: transactionObj,
                                                                           commandType: CommandType.StoredProcedure);
                                }
                            }

                            foreach (var record in m_userManagement.RolesDetails)
                            {
                                var itemDept = new DynamicParameters();
                                itemDept.Add("@Action", "INSERT_USER_COMPANY_DEPARTMENT", DbType.String, ParameterDirection.Input);
                                itemDept.Add("@UserID", UserId, DbType.Int32, ParameterDirection.Input);
                                itemDept.Add("@CompanyId", record.Company.CompanyId, DbType.Int32, ParameterDirection.Input);
                                foreach (var dept in record.DepartmentList)
                                {
                                    itemDept.Add("@DepartmentId", dept.LocationID, DbType.Int32, ParameterDirection.Input);
                                    var resultDept = this.m_dbconnection.Execute("UserManagement_CRUD", itemDept, transaction: transactionObj,
                                                                           commandType: CommandType.StoredProcedure);
                                }
                            }
                        }

                        #endregion roles details

                        #region sending email

                        UserProfile sender = objUserRepository.GetUserById(m_userManagement.CreatedBy);
                        var result = UserManagementEmailProvider.SendLoginCredentials(m_userManagement.FirstName + " " + m_userManagement.LastName, m_userManagement.Emailid, m_userManagement.UserName, Pwd, sender);

                        #endregion






                        transactionObj.Commit();
                    }

                    if (UserId > 0)
                    {
                        status = "success";
                    }
                    else if (UserId == -1)
                    {
                        status = "Existed";
                    }
                    else
                    {
                        status = "error";
                    }
                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        public int ResetPassword(string emailId, string userName)
        {
            int status = 0;
            try
            {
                #region sending email                
                int getinfo = getuserId(emailId, userName);
                string Pwd = CreateRandomPassword(8);
                var m_userManagement = GetUserDetails(getinfo);
                UserProfile sender = new UserProfile();
                sender.UserName = "UEL";
                //objUserRepository.GetUserById(userId);
                if (getinfo <= 0)
                {
                    status = -1;
                }
                else
                {
                    if (m_userManagement.isADUser == false)
                    {
                        var data = this.m_dbconnection.Query<int>("UserManagement_CRUD",
                               new
                               {
                                   Action = "UPDATEPASSWORD",
                                   Password = Pwd,
                                   UserName = userName,
                                   Emailid = emailId,
                                   UserID = m_userManagement.UserID
                               }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                        if (data >= 0)
                        {
                            var result = UserManagementEmailProvider.SendLoginCredentials(m_userManagement.FirstName + " " + m_userManagement.LastName, m_userManagement.Emailid, m_userManagement.UserName, Pwd, sender);


                            if (result)
                            {
                                status = 1;
                            }

                        }
                        else
                        {
                            status = -1;
                        }
                    }

                }
                #endregion
                return status;
            }
            catch (Exception ex)
            { throw ex; }

        }

        public int getuserId(string emailId, string userName)
        {
            try
            {
                int UserId = 0;
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        UserId = this.m_dbconnection.QueryFirstOrDefault<int>("UserManagement_CRUD", new
                        {
                            Action = "GETUSERID",
                            Emailid = emailId,
                            UserName = userName
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        transactionObj.Commit();
                        return UserId;
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ChangePassword(UserManagement m_userManagement)
        {
            int status = 0;
            this.m_dbconnection.Open();
            var userManagement = GetUserDetails(m_userManagement.UserID);

            //Check for current password to know the user want to change his password
            if (m_userManagement.CurrentPassword != userManagement.Password)
            {
                status = 9999;
            }

            else
            {
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        if (userManagement.isADUser == false)
                        {
                            int updateResult = this.m_dbconnection.Execute("UserManagement_CRUD", new
                            {
                                Action = "CHANGEPASSWORD",
                                UserID = m_userManagement.UserID,
                                Password = m_userManagement.NewPassword.Trim()
                            }, transaction: transactionObj,
                              commandType: CommandType.StoredProcedure);

                            status = 1;
                        }

                        transactionObj.Commit();
                        return status;
                    }
                    catch (Exception ex)
                    { throw ex; }
                }
            }
            return status;
        }


        public string UpdateUserManagement(UserManagement m_userManagement)
        {
            this.m_dbconnection.Open();
            string status = string.Empty;
            var companyid = 0;
            var data = m_userManagement.RolesDetails.Where(x => x.IsSelected == true).FirstOrDefault();
            if (data != null)
            {
                companyid = data.Company.CompanyId;
            }
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    int updateResult = this.m_dbconnection.Query<int>("UserManagement_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        UserID = m_userManagement.UserID,
                        UserName = m_userManagement.UserName.Trim(),
                        FirstName = m_userManagement.FirstName.Trim(),
                        LastName = m_userManagement.LastName.Trim(),
                        Emailid = m_userManagement.Emailid.Trim(),
                        LocationId = m_userManagement.LocationId,
                        CompanyId = companyid,
                        Title = m_userManagement.Title,
                        //Password = CreateRandomPassword(8),
                        Address1 = m_userManagement.Address1,
                        Address2 = m_userManagement.Address2,
                        Address3 = m_userManagement.Address3,
                        CountryId = m_userManagement.CountryId,
                        ZipCode = m_userManagement.ZipCode,
                        EmailSignature = m_userManagement.EmailSignature,
                        AlterApprovarUserId = m_userManagement.AlterApprovarUserId,
                        //AlterApprovarUserId = m_userManagement.User.UserID,
                        ApprovalStartDate = m_userManagement.ApprovalStartDate,
                        ApprovalEndDate = m_userManagement.ApprovalEndDate,
                        Designation = m_userManagement.Designation,
                        PhoneNumber = m_userManagement.PhoneNumber,
                        IsActive = m_userManagement.IsActive,
                        isLocked = m_userManagement.isLocked,
                        ManagerId = m_userManagement.ManagerId
                    }, transaction: transactionObj,
                          commandType: CommandType.StoredProcedure).FirstOrDefault();
                    if (updateResult > 0)
                    {
                        #region Deleting user roles

                        var deleteRoles = new DynamicParameters();
                        deleteRoles.Add("@Action", "DELETE_USER_ROLES", DbType.String, ParameterDirection.Input);
                        deleteRoles.Add("@UserID", m_userManagement.UserID, DbType.Int32, ParameterDirection.Input);
                        var resultDeleteUserRole = this.m_dbconnection.Execute("UserManagement_CRUD", deleteRoles, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                        #endregion
                        #region we are saving Roles Details items...
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        foreach (var record in m_userManagement.RolesDetails.Where(i => i.UserRoleId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@UserID", m_userManagement.UserID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.Company.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@IsSelected", record.IsSelected, DbType.Boolean, ParameterDirection.Input);
                            foreach (var role in record.Role)
                            {
                                itemObj.Add("@RoleID", role.RoleID, DbType.Int32, ParameterDirection.Input);
                                var rolesItemSaveResult = this.m_dbconnection.Execute("UserManagement_CRUD", itemObj, transaction: transactionObj,
                                                                       commandType: CommandType.StoredProcedure);
                            }
                        }


                        #endregion

                        #region updating Roles Details items...
                        //List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();
                        //foreach (var record in m_userManagement.RolesDetails.Where(i => i.UserRoleId > 0).Select(i => i))
                        //{
                        //    var itemObj = new DynamicParameters();
                        //    itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                        //    itemObj.Add("@UserRoleId", record.UserRoleId, DbType.Int32, ParameterDirection.Input);
                        //    itemObj.Add("@UserID", m_userManagement.UserID, DbType.Int32, ParameterDirection.Input);
                        //    itemObj.Add("@CompanyId", record.Company.CompanyId, DbType.Int32, ParameterDirection.Input);
                        //    //itemObj.Add("@RoleID", record.Role.RoleID, DbType.Int32, ParameterDirection.Input);
                        //    itemObj.Add("@IsSelected", record.IsSelected, DbType.Boolean, ParameterDirection.Input);
                        //    itemsToUpdate.Add(itemObj);
                        //}
                        //var rolesItemUpdateResult = this.m_dbconnection.Execute("UserManagement_CRUD", itemsToUpdate, transaction: transactionObj,
                        //                                               commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting roles details items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();
                        if (m_userManagement.RolesDetailsToDelete != null)
                        {
                            foreach (var UserRoleId in m_userManagement.RolesDetailsToDelete)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@UserRoleId", UserRoleId, DbType.Int32, ParameterDirection.Input);
                                //itemObj.Add("@CreatedBy", .CreatedBy, DbType.Int32, ParameterDirection.Input);
                                //itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemsToDelete.Add(itemObj);
                            }
                            var RolesDetailsDeleteResult = this.m_dbconnection.Execute("UserManagement_CRUD", itemsToDelete,
                                                                        transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);


                        }

                        #endregion

                        #region Deleting usercompany departments

                        var deleteDept = new DynamicParameters();
                        deleteDept.Add("@UserID", m_userManagement.UserID, DbType.Int32, ParameterDirection.Input);
                        deleteDept.Add("@Action", "DELETE_USER_COMPANY_DEPARTMENTS", DbType.String, ParameterDirection.Input);
                        var resultDeleteDept = this.m_dbconnection.Execute("UserManagement_CRUD", deleteDept, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                        #endregion

                        #region InsertingUserCompanyDepartments

                        foreach (var record in m_userManagement.RolesDetails)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERT_USER_COMPANY_DEPARTMENT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@UserID", m_userManagement.UserID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.Company.CompanyId, DbType.Int32, ParameterDirection.Input);
                            foreach (var dept in record.DepartmentList)
                            {
                                itemObj.Add("@DepartmentId", dept.LocationID, DbType.Int32, ParameterDirection.Input);
                                var result = this.m_dbconnection.Execute("UserManagement_CRUD", itemObj, transaction: transactionObj,
                                                                       commandType: CommandType.StoredProcedure);
                            }
                        }


                        #endregion

                        #region locked
                        if (m_userManagement.isLocked == false)
                        {
                            int updateislocked = this.m_dbconnection.Execute("UserManagement_CRUD", new
                            {
                                Action = "SETPASSWORDATTEMPT",
                                UserName = m_userManagement.UserName.Trim()
                            }, transaction: transactionObj,
                              commandType: CommandType.StoredProcedure);
                        }

                        #endregion

                        if ((m_userManagement.IsWorkFlowAssigned) && (m_userManagement.IsActive == false))
                        {
                            int result = this.m_dbconnection.Query<int>("WorkFlowLevel_CRUD",
                             new
                             {
                                 Action = "CANCEL",
                                 ApproverUserId = m_userManagement.UserID
                             },
                             transaction: transactionObj,
                             commandType: CommandType.StoredProcedure).FirstOrDefault();

                        }

                        transactionObj.Commit();
                    }

                    if (updateResult > 0)
                    {
                        status = "success";
                    }
                    else if (updateResult == -1)
                    {
                        status = "Existed";
                    }
                    else
                    {
                        status = "error";
                    }

                    return status;
                }
                catch (Exception ex)
                { throw ex; }
            }

        }

        public bool DeleteUserManagement(int userId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("UserManagement_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    UserId = userId
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public int RetainStructure(int userId)
        {
            int result = 0;
            try
            {
                this.m_dbconnection.Open();

                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        result = this.m_dbconnection.Query<int>("WorkFlowLevel_CRUD",
                           new
                           {
                               Action = "WORKFLOW",
                               ApproverUserId = userId
                           },
                           transaction: transaction,
                           commandType: CommandType.StoredProcedure).FirstOrDefault();

                        transaction.Commit();

                        return result;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InternalServerException(ex.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InternalServerException(ex.ToString());
            }
        }

        public IEnumerable<User> GetisShowUserNames(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<User>("usp_GetisShowUserNames", new
                {
                    Action = "SELECT",
                    SearchKey = searchKey
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<User> SaveUserName(int userId)
        {
            try
            {
                return this.m_dbconnection.Query<User>("usp_SaveUserNames", new
                {
                    UserID = userId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<User> GetAllUserNames(string searchKey)
        {
            try
            {
                return this.m_dbconnection.Query<User>("usp_GetisShowUserNames", new
                {
                    Action = "SELECTALLUSERS",
                    SearchKey = searchKey
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public UserManagement Authenticate(string UserName, string Password)
        {
            UserManagement MyUserInfo = new UserManagement();

            const string sql =
                    @"Select usr.Id as UserId,usr.userTypeId,usr.firstName,usr.lastName,usr.UserName,usr.userEmail,usr.userEmail Email,usr.userPassword,usr.TenantId,usr.roleId,
                    usr.annualQuota,tn.Id,tn.tenantName,tn.linkedinEmail,tn.linkedinPassword,tn.linkedinTypeId,tn.subscriptionId,usr.isFirstTime,
                    tn.databasename,tn.subscriptionId,sb.subscriptionName,sb.subscriptionType,tn.subscriptionEnd,usr.IsFirstTime IsFirstTime,
   					(select userName from users where Id=usr.managerId) ManagerName,
		            (case when (select concat(group_concat(u.Id),',',u.managerId)  end from users u where u.managerId=usr.id) is null then usr.id else (select  concat(group_concat(u.Id),',',u.managerId) end from users u where u.managerId=usr.id) end)  UsersIds,
                    tn.creditLimit
                    From Users usr
                    Inner Join tenants tn on tn.Id=usr.tenantId
                    Inner Join subscription sb on sb.subscriptionId=tn.subscriptionId
                    where usr.userEmail=@email and usr.userPassword=@password;";

            MyUserInfo = this.m_dbconnection.Query<UserManagement>(sql, new Dictionary<string, object> { { "email", UserName }, { "password", Password } }).FirstOrDefault();

            return MyUserInfo;
        }

        public UserManagement TokenValidation(string Email, int UserId)
        {
            UserManagement MyUserInfo = new UserManagement();

            const string sql =
                 @"Select usr.Id as UserId,usr.userTypeId,usr.firstName,usr.LastName,usr.UserName,usr.userEmail,usr.userPassword,usr.TenantId,usr.roleId,
                    tn.Id,tn.tenantName,tn.linkedinEmail,tn.linkedinPassword,tn.subscriptionId,tn.databasename,usr.IsFirstTime IsFirstTime,
                    sb.subscriptionName,sb.subscriptionType,sb.subscriptionDays SubscriptionInDays,
                    (select userName from users where Id=usr.managerId) ManagerName,
                    (case when (select concat(group_concat(u.Id),',',u.managerId)  end from users u where u.managerId=usr.id) is null then usr.id else (select  concat(group_concat(u.Id),',',u.managerId) end from users u where u.managerId=usr.id) end)  UsersIds
                    From Users usr
                    Inner Join tenants tn on tn.Id=usr.tenantId
                    inner join subscription sb on sb.subscriptionId=tn.subscriptionId
                    where usr.userEmail=@email and usr.TenantId=@TenantId and usr.Id=@userId;";

            MyUserInfo = this.m_dbconnection.Query<UserManagement>(sql, new Dictionary<string, object> { { "email", Email },  { "userId", UserId } }).FirstOrDefault();

            return MyUserInfo;
        }
    }
}
