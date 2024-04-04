using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class Contact
    {
        public int Id { get; set; }
        public string ContactName { get; set; }
        public int ContactTypeId { get; set; }
        public int RegardingId { get; set; }
        public int RegarId { get; set; }
        public int SalId { get; set; }
        public string FirstName { get; set; }
        public string Midname { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public string ContactJobTitle { get; set; }
        public int LeadId { get; set; }
        public int LeadNo { get; set; }
        public int AcctId { get; set; }
        public int ContactId { get; set; }
        public int CurId { get; set; }
        public string BusinessPhone { get; set; }
        public string HomePhone { get; set; }
        public string Mobile { get; set; }
        public string EmailId { get; set; }

        public bool EmailOpt { get; set; }

        public string SkypeId { get; set; }
        public int DeptId { get; set; }
        public int RoleId { get; set; }
        public string Manager { get; set; }
        public string ManagerPhone { get; set; }
        public string Assistant { get; set; }
        public string AssistantPhone { get; set; }
        public int GenderId { get; set; }
        public string DateOfBirth { get; set; }
        public string AnniversaryDate { get; set; }
        public int ContactOwnUserId { get; set; }
        public int MaritalStatusId { get; set; }
        public string SpopusePartnerName { get; set; }
        public int OwnerId { get; set; }
        public decimal CreditLimit { get; set; }
        public int PayTermId { get; set; }
        public Boolean CreditHold { get; set; }
        public int PriceListId { get; set; }
        public string ContactsDesc { get; set; }
        public int CustomerTypeId { get; set; }
        public int CustomerSubTypeId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime Updateddate { get; set; }
        public int DeletedBy { get; set; }
        public DateTime DeletedDate { get; set; }
        public Boolean IsActive { get; set; }
        public string Status { get; set; }

        public string CreatedUser { get; set; }
        public string UpdatedUser { get; set; }
        public string DeletedUser { get; set; }

        public string AccountName { get; set; }
        public string UserName { get; set; }
        public Boolean Isprimary { get; set; }
        public int PrimaryContactId { get; set; }

        public string SContactId { get; set; }
        public int SourceId { get; set; }

    }


    public class ContactsAccountsList
    {
        public int ContactId { get; set; }

        public string ContactName { get; set; }

        public int AccountId { get; set; }

        public string AccountName { get; set; }

        public int AcctId { get; set; }

        public string Contact_Account { get; set; }



    }
}
