using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class LeadsDTO : MyDates
    {
        public int Id { set; get; }

        public int AccountId { get; set; }

        public int ContactId { get; set; }
        public string Topic { set; get; }
        public string FirstName { set; get; }
        public string LastName { set; get; }
        public int SalutationId { set; get; }
        public string JobTitle { set; get; }
        public int RatingId { set; get; }

        public int LeadRating { get; set; }

        public int LeadRatingId { get; set; }
        public int CurId { set; get; }
        public int PriceListId { set; get; }
        public string CompName { set; get; }
        public int OwnerId { set; get; }

        public string OwnerName { get; set; }
        public int UserId { set; get; }

        public int CompanyId { get; set; }

        public DateTime LastActivityDate { get; set; }
        public string BusPhone { set; get; }
        public string HomePhone { set; get; }
        public string OthPhone { set; get; }
        public string Mobile { set; get; }
        public string Fax { set; get; }
        public string Pager { set; get; }
        public string EmailId { set; get; }
        public string WebSite { set; get; }
        public int LeadSourceId { set; get; }

        public string SourceName { get; set; }
        public int SourceChildId { set; get; }
        public int StatReasonId { set; get; }
        public int LeadStatId { set; get; }

        public string LeadStatName { get; set; }
        public int IndsId { set; get; }
        public decimal AnnualRevenue { set; get; }
        public decimal EstBudget { set; get; }
        public int NoOfEmployees { set; get; }
        public int SicCode { set; get; }
        
        public int CampaignId { set; get; }
        public string Description { set; get; }
        public bool IsClose { set; get; }
        public bool IsEmail { set; get; }
        public bool IsBulkEmail { set; get; }
        public bool IsCall { set; get; }
        public bool IsSMS { set; get; }
        public bool Status { set; get; }
        public bool Converted { set; get; }

        public int ConvertedBy { get; set; }
        public DateTime ConvertedDate { set; get; }


        public int ConvertedAccountId { get; set; }

        public int ConvertedContactId { get; set; }

        public int ConvertedOpportunityId { get; set; }


        public int OppId { get; set; }

        public int IsQualified { set; get; }
        public int CustomerTypeId { set; get; }
        public int CustomerSubTypeId { set; get; }
        public int ProbabilityId { set; get; }

        public string ProbabilityName { get; set; }

        public string Colour { get; set; }
        public string SourceCampaign { set; get; }
        public string Street1 { set; get; }
        public string Street2 { set; get; }
        public string Street3 { set; get; }

        public string Stat_Province { get; set; }

        public string Zip_PostalCode { get; set; }
        public string Country { set; get; }
        public string City { set; get; }
        public string Locality { set; get; }
        public string LandMark { set; get; }
        public int PinCode { set; get; }

        public int PreviousProbabilityId { get; set; }
        //public int CreatedBy { get; set; }
        //public DateTime CreatedDate { get; set; }
        //public int UpdatedBy { get; set; }
        //public DateTime UpdatedDate { get; set; }
        //public int DeleteBy { get; set; }
        //public DateTime DeletedDate { get; set; }

        
    }

    public class LeadNames
    {
        public int Sno { set; get; }
        public int Count { set; get; }

        public string Stage { get; set; }
        public string topic { get; set; }
        public int ProbabilityId { get; set; }
        public string Colour { get; set; }

        public string firstName { set; get; }
        public string lastName { set; get; }

        public string Name { get; set; }
        public string mobile { set; get; }
        public string emailId { set; get; }
        public string compName { get; set; }
        public string StringCreatedDate { get; set; }

        public int LeadId { get; set; }


    }

    public class GroupLeadDTO
    {
        public int Id { get; set; }

        public int AccountId { get; set; }

        public int ContactId { get; set; }
        public string topic { set; get; }
        public string stage { set; get; }
        public string firstName { set; get; }
        public string lastName { set; get; }
        public string mobile { set; get; }
        public string emailId { set; get; }
        public string compName { get; set; }
        public string Colour { get; set; }
        public string URL { get; set; }
        public string ProfileId { get; set; }
        public string JobTitle { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int ProbabilityId { get; set; }
        public int PreviousProbabilityId { get; set; }
        public decimal EstBudget { get; set; }
        public int LeadId { get; set; }
        public int LeadNo { get; set; }
        public decimal ActualRevenue { get; set; }
        public int OppId { get; set; }
        public string oppTopic { get; set; }
        public string StringCreatedDate { get; set; }
        public bool Converted { get; set; }

    }

    public class ChildLeadDTO
    {
        public GroupLeadDTO data { get; set; }
    }

    public class LeadsByGroup
    {
        public LeadNames data { get; set; }
        public List<ChildLeadDTO> children { get; set; }
    }

    public class LeadsInfoList
    {
        public List<LeadNames> LeadNames { get; set; }
        public List<LeadsByGroup> LeadByGroup { get; set; }
    }

    public class TestLead : MyDates
    {
        public int Id { get; set; }
    }

    public class LeadInfo
    {
        public LeadsDTO Lead { get; set; }

        public IEnumerable<ListIds> ListIds { get; set; }
    }
    public class ListIds
    {
        public int ListId { get; set; }
    }

    public class ContactGroups
    {
        public int RegardingId { get; set; }

        public int RegarId { get; set; }

        public int Leadid { get; set; }

        public int Contactid { get; set; }

        public int UserId { get; set; }


        public List<ListIds> ListIds { get; set; }
    }

    public class LeadQualifyInput
    {
        public int LeadId { get; set; }

        public string LeadTopic { get; set; }

        public int AccountId { get; set; }

        public int ContactId { get; set; }

        public int OportunityId { get; set; }

        public string OpportunityTopic { get; set; }

        public int CreatedBy { get; set; }

        public int ConvertedBy { get; set; }

        public int OpportunityStageId { get; set; }

        public string CreateAccount { get; set; }

        public string CreateContact { get; set; }

        public string CreateOpportunity { get; set; }

        public bool DontCreateOpportunity { get; set; }

        public AccountsDTO Account { get; set; }

        public ContactDTO Contact { get; set; }

        //1= Account Not Exists,Contact Not Exists,Oppportuniry
        //2= Account Exists, Contact Exists, Create Opportunity
        //3= Account Not Exists, Contact Exists, Create Opportunity

        public int QualifyType { get; set; }

        public float TotalAmount { get; set; }

        public float UpfrontOrAdvance { get; set; }

        public string PoNumber { get; set; }

        public float Balance { get; set; }

    }

    public class LeadQualifyResponse 
    {
        public LeadQualifyInput LeadQualifyInput { get; set; }
        public string StatusCode { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public string Data { get; set; }

        public string ErrorMessage { get; set; }
    }





}
