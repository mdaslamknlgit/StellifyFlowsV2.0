using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class BasicAuthenticationDTO : GenericIdentity
    {
        //public string UserName { get; set; }
        //public string UserEmail { get; set; }
        //public int TenatId { get; set; }
        //public int UserId { get; set; }
        //public int SubscriptionInDays { get; set; }
        //public string access_token { get; set; }
        //public string ExpiredDate { get; set; }
        //public string GenerateDate { get; set; }
        //public string Modules { get; set; }
        public readonly AuthUserDTO _AuthUserDTO;

        public BasicAuthenticationDTO(AuthUserDTO _AuthUser) : base(_AuthUser.ToString())
        {
            _AuthUserDTO = _AuthUser;
        }
    }
}
