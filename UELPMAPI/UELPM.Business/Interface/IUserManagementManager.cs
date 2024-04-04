using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IUserManagementManager
    {
        IEnumerable<UserProfile> GetReportingUsers(int CompanyId);
        UserManagement Authenticate(string UserName, string Password);

        UserManagement TokenValidation(string Email, int UserId);

        UserManagementDisplayResult GetUserManagement(GridDisplayInput gridDisplayInput);
        UserManagement GetUserDetails(int userId);
        IEnumerable<User> GetUsers(string searchKey);
        string ValidateUserManagement(ValidateUserManagement validateUserManagement);
        string CreateUserManagement(UserManagement m_userManagement);
        string UpdateUserManagement(UserManagement m_userManagement);
        bool DeleteUserManagement(int userId);
        UserManagementDisplayResult GetFilterUserManagement(UserManagementFilterDisplayInput userManagementFilterDisplayInput);
        int CheckUserCount(string searchKey);
        int ResetPassword(string emailId, string userName);
        int ChangePassword(UserManagement m_userManagement);
        int RetainStructure(int userId);
        IEnumerable<User> GetisShowUserNames(string searchKey);
        IEnumerable<User> SaveUserName(int userId);
        IEnumerable<User> GetAllUserNames(string searchKey);
    }
}
