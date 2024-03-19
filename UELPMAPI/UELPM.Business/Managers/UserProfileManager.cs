using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class UserProfileManager : ManagerBase, IUserProfileManager
    {
        private readonly IUserProfileRepository m_userRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userRepository"></param>
        public UserProfileManager(IUserProfileRepository userRepository)
        {
            m_userRepository = userRepository;
        }      

        public IEnumerable<UserProfile> GetUser()
        {
            return m_userRepository.GetUser();
        }

        public int CreateUser(UserProfile user)
        {
            return m_userRepository.CreateUser(user);
        }       

        public int UpdateUser(UserProfile user)
        {
            return m_userRepository.UpdateUser(user);
        }

        public bool DeleteUser(int userId)
        {
            return m_userRepository.DeleteUser(userId);
        }

        public UserProfile GetRolebyUser(string username)
        {
            return m_userRepository.GetRolebyUser(username);
        }

        public bool LogOffUser(int userId)
        {
            return m_userRepository.LogOffUser(userId);
        }
        public UserProfile ValidateUser(string userName, string Password)
        {
            return m_userRepository.ValidateUser(userName,Password);
        }

        UserProfile IUserProfileManager.Authenticate(string UserName, string Password)
        {
            return m_userRepository.Authenticate(UserName, Password);
        }

        UserProfile IUserProfileManager.TokenValidation(string Email, int UserId)
        {
            return m_userRepository.TokenValidation(Email, UserId);
        }
        public void GetPasswordAtttempt(string userName)
        {
             m_userRepository.GetPasswordAtttempt(userName);
        }

        public void SetPasswordAtttempt(string userName)
        {
            m_userRepository.SetPasswordAtttempt(userName);
        }

        public IEnumerable<UserProfile> GetUsersByCompany(UserSearch userSearch)
        {
            return m_userRepository.GetUsersByCompany(userSearch);
        }

        public IEnumerable<UserProfile> GetUsersByRole(UserSearch userSearch)
        {
            return m_userRepository.GetUsersByRole(userSearch);
        }


    }
}
