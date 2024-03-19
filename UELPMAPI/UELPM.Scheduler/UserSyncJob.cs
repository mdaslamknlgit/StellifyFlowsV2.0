using Quartz;
using System;
using System.Threading.Tasks;
using UELPM.Service.Interface;
using UELPM.Service.Repositories;

namespace UELPM.Scheduler
{
    public class UserSyncJob : IJob
    {      
        public async Task Execute(IJobExecutionContext context)
        {
            LDAPUserProfileRepository ldapUserProfileRepository = null;
            try
            {
                ldapUserProfileRepository = new LDAPUserProfileRepository();
                await ldapUserProfileRepository.LDAPUserProfile();
            }
            catch (Exception exp)
            {             
                var MessageError = exp.ToString();
                throw;
            }
        }
       
    }
}
