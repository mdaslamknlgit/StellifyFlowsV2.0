using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class UserInfo
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public int ManagerId { get; set; }

        public int CompanyId { get; set; }

        public int DeptId { get; set; }
        public int TenantId { get; set; }
        public int UserId { get; set; }
        public string UsersIds { get; set; }
        public int SubscriptionId { get; set; }
        public string userEmail { set; get; }
        public string UserName { set; get; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ManagerName { get; set; }
        public string TenantName { get; set; }
        public string LinkedInEmail { get; set; }
        public string LinkedInPassword { get; set; }
        public string FromUserEmail { get; set; }
        public string FromPassword { get; set; }
        public int LinkedinTypeId { get; set; }
        public int CreditLimit { get; set; }
        public int CreditUsage { get; set; }
        public int RemainingCredits { get; set; }

        public Boolean IsFirstTime { get; set; }

        public string databasename { get; set; }

        public bool IsBackgroundProcess { get; set; }

        public int NoOfPagesToScrap { get; set; }
        public string UI_PageURL { set; get; }

        public string SubscriptionName { get; set; }
        public string SubscriptionType { get; set; }
        public DateTime SubscriptionEnd { get; set; }
        public int SubscriptionInDays { get; set; }

        public string EmailOpenURL { get; set; }
        public string EmailClickURL { get; set; }


        //Quota
        public decimal AnnualQuota { get; set; }
        public decimal Commision { get; set; }
    }

    public class UserRequestInfo
    {
        public string UserName { get; set; }

        public string  Password { get; set; }

        public string RememberMe { get; set; }

    }
}
