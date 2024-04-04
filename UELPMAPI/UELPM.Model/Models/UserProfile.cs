using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class UserProfile
    {
        //public int UserID { get; set; }
        //public int? RoleID { get; set; }
        //public string UserName { get; set; }
        //public string FirstName { get; set; }
        //public string LastName { get; set; }
        //public string Password { get; set; }
        //public string UserRole { get; set; }
        //public string EmailId { get; set; }
        //public string DepartmentName { get; set; }
        //public string CompanyName { get; set; }

        public int UserID { get; set; }

        public string UserIds { get; set; }
        public string UserName { get; set; }
        public string UserGUID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string FullName { get; set; }

        public int CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int ManagerId { get; set; }

        public string ManagerName { get; set; }

        public DateTime? LastUpdatedDate { get; set; }
        public string userAccountControl { get; set; }
        public string EmailId { get; set; }
        public string distinguishedName { get; set; }
        public int? logonCount { get; set; }
        public int? primaryGroupID { get; set; }
        public bool? IsActive { get; set; }
        public byte[] Thumbnail { get; set; }
        public int? LocationId { get; set; }
        public int? CompanyId { get; set; }
        public byte[] ProfileImage { get; set; }
        public string Title { get; set; }
        public string Password { get; set; }
        public bool? isLocked { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public int? CountryId { get; set; }
        public string ZipCode { get; set; }
        public string EmailSignature { get; set; }
        public int? PasswordAttemptCount { get; set; }
        public int? AlterApprovarUserId { get; set; }
        public DateTime? AlternateStartdate { get; set; }
        public DateTime? AlternateEndDate { get; set; }
        public string Designation { get; set; }
        public string PhoneNumber { get; set; }
        public string UserRole { get; set; }
        public int? RoleID { get; set; }
        public string DepartmentName { get; set; }
        public string CompanyName { get; set; }
        public bool isADUser { get; set; }
        public List<Roles> Roles { get; set; }
        public string RoleIds { get; set; }
    }

    public class UserSearch 
    {
        public string Search { get; set; }
        public int? UserID { get; set; }
        public int CompanyId { get; set; }
    }
}
