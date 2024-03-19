using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class UserDTO
    {
        public int Id { get; set; }
        public int UserTypeId { get; set; }
        public string UsersIds { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string Email { get; set; }
        public string UserPassword { get; set; }
        public int ManagerId { get; set; }
        public string ManagerName { get; set; }
        public int TenantId { get; set; }
        public int RoleId { get; set; }
        public bool IsFirstTime { get; set; }
        public int CreditLimit { get; set; }
        public int CreditUsage { get; set; }
        public int RemainingCredits { get; set; }

        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string AnnualQuota { get; set; }
        public string Commission { get; set; }
        public bool IsCustom { get; set; }
        public string Company { get; set; }

        public string DatabaseName { get; set; }
        public string TenantName { get; set; }
        public string LinkedInEmail { get; set; }
        public string LinkedInPassword { get; set; }

        public int UserId { get; set; }
        public int NoOfUsers { get; set; }
        public int Count { get; set; }

        public int SubscriptionId { get; set; }
        public string SubscriptionName { get; set; }
        public string SubscriptionType { get; set; }
        public DateTime SubscriptionEnd { get; set; }

    }
}
