using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
  public class LDAPUserProfile
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string UserGUID { get; set; }
        public string Firstname { get; set; }
        public string LastName { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? LastUpdatedDate { get; set; }
        public string userAccountControl { get; set; }
        public string Emailid { get; set; }
        public string distinguishedName { get; set; }
        public int? logonCount { get; set; }
        public int? primaryGroupID { get; set; }
        public bool? IsActive { get; set; }
        public byte[] Thumbnail { get; set; }
        public string Title { get; set; }
        public string DisplayName { get; set; }
        public bool IsADUser { get; set; }
        public string PhoneNumber { get; set; }
    }
}
