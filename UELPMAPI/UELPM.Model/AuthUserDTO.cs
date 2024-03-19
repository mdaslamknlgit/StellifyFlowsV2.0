using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class AuthUserDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string Email { get; set; }
        public int TenatId { get; set; }
        public int UserId { get; set; }
        public string UsersIds { get; set; }
        public int SubscriptionInDays { get; set; }
        public string access_token { get; set; }
        public string ExpiredDate { get; set; }
        public string GenerateDate { get; set; }
        public string Modules { get; set; }
        public string TenantName { get; set; }
        public string LinkedInEmail { get; set; }
        public string LinkedInPassword { get; set; }
        public int LinkedinTypeId { get; set; }
        public int CreditLimit { get; set; }
        public int CreditUsage { get; set; }
        public int RemainingCredits { get; set; }
        public Boolean IsFirstTime { get; set; }

        public string DatabaseName { get; set; }

        public bool IsBackgroundProcess { get; set; }
        public IEnumerable<AppSettingsDTO> MyAppSettings { set; get; }
        public CurrencyDTO BaseCurrency { get; set; }
        public Boolean IsEmailSetupFinish { get; set; }

        public int SubscriptionId { get; set; }
        public string SubscriptionName { get; set; }
        public string SubscriptionType { get; set; }
        public DateTime SubscriptionEnd { get; set; }
    }
}
