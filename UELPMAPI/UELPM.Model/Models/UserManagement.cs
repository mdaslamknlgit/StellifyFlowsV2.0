using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class UserManagement
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string UserGUID { get; set; }
        public string FirstName { get; set; }
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
        public int? LocationId { get; set; }
        public int? CompanyId { get; set; }
        public byte[] ProfileImage { get; set; }
        public string Title { get; set; }

        public string CurrentPassword { get; set; }
        public string Password { get; set; }
        public bool? isLocked { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public int CountryId { get; set; }
        public string ZipCode { get; set; }
        public string EmailSignature { get; set; }
        public int? PasswordAttemptCount { get; set; }
        public int? AlterApprovarUserId { get; set; }
        public DateTime? ApprovalStartDate { get; set; }
        public DateTime? ApprovalEndDate { get; set; }
        public string Designation { get; set; }
        public string PhoneNumber { get; set; }       
        public List<RolesDetails> RolesDetails { get; set; }
        public List<int> RolesDetailsToDelete { get; set; }
        public Country Country { get; set; }
        public string CountryName { get; set; }
        public User User { get; set; }
        public int CreatedBy { get; set; }
        public bool isADUser { get; set; }
        public string NewPassword { get; set; }
        public bool IsWorkFlowAssigned { get; set; }

        public int ManagerId { get; set; }

        public string ManagerName { get; set; }
    }


    public class RolesDetails
    {
        public int UserRoleId { get; set; }
        public int UserID { get; set; }
        public Companies Company { get; set; }
        public List<Locations> DepartmentList { get; set; }
        public List<UserRoles> Role { get; set; }
        public bool IsSelected { get; set; }
    }

    public class UserDepartment : Locations
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
    }

    public class UserCompany
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public bool IsSelected { get; set; }
        public string CompanyName { get; set; }
    }

    public class UserRole : UserRoles
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
    }

    public class UserManagementDisplayResult
    {
        public List<UserManagementList> UserManagementList { get; set; }
        public int TotalRecords { get; set; }
    }

    public class UserManagementList
    {
        public int UserID { get; set; }

        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string EmailId { get; set; }
        public string PhoneNumber { get; set; }
        public string Designation { get; set; }

        
    }

    public class ValidateUserManagement
    {
        public int UserId { get; set; }
    }

    public class UserManagementFilterDisplayInput :GridDisplayInput
    {
        public string UserNameFilter { get; set; }
        public string RolesNameFilter { get; set; }
    }

}
