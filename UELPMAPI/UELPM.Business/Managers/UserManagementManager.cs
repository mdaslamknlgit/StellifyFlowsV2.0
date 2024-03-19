using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class UserManagementManager : IUserManagementManager
    {
        private IUserManagementRepository m_userManagementRepository;

        public UserManagementManager(IUserManagementRepository userManagementRepository)
        {
            this.m_userManagementRepository = userManagementRepository;
        }
        public IEnumerable<UserProfile> GetReportingUsers(int CompanyId)
        {
            return m_userManagementRepository.GetReportingUsers(CompanyId);
        }
        public int ChangePassword(UserManagement m_userManagement)
        {
            return m_userManagementRepository.ChangePassword(m_userManagement);
        }

        public int CheckUserCount(string searchKey)
        {
            return m_userManagementRepository.CheckUserCount(searchKey);
        }

        public string CreateUserManagement(UserManagement m_userManagement)
        {
            return m_userManagementRepository.CreateUserManagement(m_userManagement);
        }

        public bool DeleteUserManagement(int userId)
        {
            return m_userManagementRepository.DeleteUserManagement(userId);
        }

        public UserManagementDisplayResult GetFilterUserManagement(UserManagementFilterDisplayInput userManagementFilterDisplayInput)
        {
            return m_userManagementRepository.GetFilterUserManagement(userManagementFilterDisplayInput);
        }

        public UserManagement GetUserDetails(int userId)
        {
            return m_userManagementRepository.GetUserDetails(userId);
        }

        public UserManagementDisplayResult GetUserManagement(GridDisplayInput gridDisplayInput)
        {
            return m_userManagementRepository.GetUserManagement(gridDisplayInput);
        }

        public IEnumerable<User> GetUsers(string searchKey)
        {
            return m_userManagementRepository.GetUsers(searchKey);
        }

        public int ResetPassword(string emailId, string userName)
        {
            return m_userManagementRepository.ResetPassword(emailId, userName);
        }

        public string UpdateUserManagement(UserManagement m_userManagement)
        {
            return m_userManagementRepository.UpdateUserManagement(m_userManagement);
        }

        public string ValidateUserManagement(ValidateUserManagement validateUserManagement)
        {
            return m_userManagementRepository.ValidateUserManagement(validateUserManagement);
        }

        public int RetainStructure(int userId)
        {
            return m_userManagementRepository.RetainStructure(userId);
        }
        public IEnumerable<User> GetisShowUserNames(string searchKey)
        {
            return m_userManagementRepository.GetisShowUserNames(searchKey);
        }
        public IEnumerable<User> SaveUserName(int userId)
        {
            return m_userManagementRepository.SaveUserName(userId);
        }
        public IEnumerable<User> GetAllUserNames(string searchKey)
        {
            return m_userManagementRepository.GetAllUserNames(searchKey);
        }

        public UserManagement Authenticate(string UserName, string Password)
        {
            return m_userManagementRepository.Authenticate(UserName, Password);
        }

        public UserManagement TokenValidation(string Email, int UserId)
        {
            return m_userManagementRepository.TokenValidation(Email, UserId);
        }
    }
}
