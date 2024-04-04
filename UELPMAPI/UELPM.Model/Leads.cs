using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Model
{
    public class Leads
    {
    }

    public class LeadsSearch 
    {
        public string Name { get; set; }

        public string Topic { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Company { get; set; }

        public string Mobile { get; set; }

        public string Email { get; set; }

        public string RatingId { get; set; }

        public string LeadSourceId { get; set; }

        public int Industry { get; set; }


        public string FromDate { get; set; }
        public string ToDate { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }

        public int CreatedBy { get; set; }

        public int UserId { get; set; }

    }

    public class LeadsResult
    {
        public List<LeadsDTO> Leads { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }

    public class ContactsResults
    {
        public List<ContactDTO> Contacts { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

        public string QueryStr { get; set; }
    }
    public class LeadNamesResult
    {
        public List<LeadNames> LeadsNames { get; set; }
        public int TotalRecords { get; set; }
    }
    //public class LeadNames
    //{
    //    public int LeadId { get; set; }

    //    public string FirstName { get; set; }

    //    public string LastName { get; set; }
    //}





    public class ContactSearch
    {
        public string Name { get; set; }
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Company { get; set; }

        public string Mobile { get; set; }

        public string Email { get; set; }

        public string FromDate { get; set; }
        public string ToDate { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }

        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        public int UserId { get; set; }

        public string SearchType { get; set; }


        public int ModuleId { get; set; }

        public int FormId { get; set; }

        public int ViewId { get; set; }
    }

    public class LeadQualifyDetail
    {
        public int ContactId { get; set; }

        public string ContactName { get; set; }

        public int AccountId { get; set; }

        public string AccountName { get; set; }

        public bool CanCreateContact { get; set; }

        public bool CanCreateAccount { get; set; }

        public bool CanCreateOpportunity { get; set; }

        public string OpportunityTopic { get; set; }
    }

    public class LeadQualifyRequest
    {
        public int LeadId { get; set; }

        public int UserId { get; set; }

        public int SalutationId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Mobile { get; set; }

        public string EmailId { get; set; }

        public string CompanyName { get; set; }

        public LeadQualifyDetail LeadQualifyDetail { get; set; }

        public List<AccountsDomainItem> Accounts { get; set; }

    }

  
}
