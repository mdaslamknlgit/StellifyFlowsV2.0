using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public  class LDAPUserProfileRepository: ILDAPUserProfile
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        public LDAPUserProfileRepository()
        {
        }

        private void SaveProfile(LDAPUserProfile userProfile)
        {
            this.m_dbconnection.Execute("UseProfile_CRUD", new
            {
                UserID = 0,
                UserName = userProfile.UserName,
                UserGUID = userProfile.UserGUID,
                Firstname = userProfile.Firstname,
                LastName = userProfile.LastName,
                CreatedDate = userProfile.CreatedDate,
                LastUpdatedDate = userProfile.LastUpdatedDate,
                userAccountControl = userProfile.userAccountControl,
                Emailid = userProfile.Emailid,
                distinguishedName = userProfile.distinguishedName,
                logonCount = userProfile.logonCount,
                primaryGroupID = userProfile.primaryGroupID,
                IsActive = 1,
                Thumbnail = userProfile.Thumbnail,
                Title = userProfile.Title,
                PhoneNumber=userProfile.PhoneNumber,
                IsADUser = userProfile.IsADUser

            }, commandType: System.Data.CommandType.StoredProcedure);
         }

        private List<LDAPUserProfile> GetUsersfromActiveDirectory()
        {
            List<LDAPUserProfile> profiles = new List<LDAPUserProfile>();
            try
            {
                AuditLog.Info("LDAPUserProfileRepository", "save", string.Empty, string.Empty, "GetUsersfromActiveDirectory", "LDAP connection initialization, User Domain name " + Environment.UserDomainName);
                using (var context = new PrincipalContext(ContextType.Domain, ConfigurationManager.AppSettings["LDAPServer"].ToString()))
                {
                    AuditLog.Info("LDAPUserProfileRepository", "save", string.Empty, string.Empty, "GetUsersfromActiveDirectory", Environment.UserDomainName);

                    using (var searcher = new PrincipalSearcher(new UserPrincipal(context)))
                    {
                        AuditLog.Info("LDAPUserProfileRepository", "save", string.Empty, string.Empty, "GetUsersfromActiveDirectory", "Server Name: " + context.ConnectedServer.ToString() + ", Name: " + context.Name);
                        foreach (var result in searcher.FindAll())
                        {
                            LDAPUserProfile userProfile = new LDAPUserProfile();
                            DirectoryEntry de = result.GetUnderlyingObject() as DirectoryEntry;
                            
                            userProfile.DisplayName = de.Properties["displayName"].Value != null ? de.Properties["displayName"].Value.ToString() : string.Empty;
                            userProfile.Firstname = de.Properties["givenName"].Value != null ? de.Properties["givenName"].Value.ToString() : string.Empty;
                            userProfile.LastName = de.Properties["sn"].Value != null ? de.Properties["sn"].Value.ToString() : string.Empty;                            
                            userProfile.UserGUID = de.Properties["objectGUID"].Value != null ? (new Guid(((byte[])de.Properties["objectGUID"].Value))).ToString() : string.Empty;
                            userProfile.CreatedDate = de.Properties["whenCreated"].Value != null ? (DateTime)(de.Properties["whenCreated"].Value) : DateTime.MinValue;
                            userProfile.LastUpdatedDate = de.Properties["whenChanged"].Value != null ? Convert.ToDateTime(de.Properties["whenChanged"].Value) : DateTime.MinValue; ;
                            userProfile.userAccountControl = de.Properties["userAccountControl"].Value != null ? de.Properties["userAccountControl"].Value.ToString() : string.Empty;
                            userProfile.Emailid = de.Properties["userPrincipalName"].Value != null ? de.Properties["userPrincipalName"].Value.ToString() : string.Empty;
                            userProfile.UserName = de.Properties["sAMAccountName"].Value != null ? de.Properties["sAMAccountName"].Value.ToString() : string.Empty;
                            userProfile.distinguishedName = de.Properties["distinguishedName"].Value != null ? de.Properties["distinguishedName"].Value.ToString() : string.Empty;
                            userProfile.logonCount = de.Properties["logonCount"].Value != null ? Convert.ToInt32(de.Properties["logonCount"].Value) : 0;
                            userProfile.primaryGroupID = de.Properties["primaryGroupID"].Value != null ? Convert.ToInt32(de.Properties["primaryGroupID"].Value) : 0;
                            userProfile.Title = de.Properties["title"].Value != null ? de.Properties["title"].Value.ToString() : string.Empty;
                            userProfile.PhoneNumber = de.Properties["telephoneNumber"].Value != null ? de.Properties["telephoneNumber"].Value.ToString() : string.Empty;
                            userProfile.IsADUser = true;
                            profiles.Add(userProfile);



                        }
                    }
                }
                AuditLog.Info("LDAPUserProfile", "Get", "", "", "GetUsersfromActiveDirectory", " Getting The Users From Active Directory , ADS User profile count:  " + profiles.Count, 0);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                AuditLog.Info("LDAPUserProfile","Error","","", "GetUsersfromActiveDirectory", e.Message, 0);
            }
            return profiles;
        }


        public async Task<bool> LDAPUserProfile()
        {
            List<LDAPUserProfile> userProfiles = GetUsersfromActiveDirectory();
            foreach (LDAPUserProfile profile in userProfiles)
            {

                try
                {
                    SaveProfile(profile);
                    AuditLog.Info("LDAPUserProfile", "Save", "", "", "Save", " Save Users From Active Directory",0);

                }
                catch (Exception e)
                {
                    var MessageError = e.ToString();
                    AuditLog.Info("LDAPUserProfile","Error","","", "Save",MessageError,0);
                }              
            }

            return true;
        }
    }
}
