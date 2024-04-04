using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IUserProfileRepository
    {
        UserProfile Authenticate(string UserName, string Password);
        UserProfile TokenValidation(string Email, int UserId);
        IEnumerable<UserProfile> GetUser();     
        UserProfile GetRolebyUser(string username);
        IEnumerable<UserProfile> GetUsersByCompany(UserSearch userSearch);
        IEnumerable<UserProfile> GetUsersByRole(UserSearch userSearch); 
        bool LogOffUser(int userId);
        UserProfile ValidateUser(string userName, string Password);
        int CreateUser(UserProfile user);
        int UpdateUser(UserProfile user);
        bool DeleteUser(int userId);
        void GetPasswordAtttempt(string userName);
        void SetPasswordAtttempt(string userName);
    }
}
