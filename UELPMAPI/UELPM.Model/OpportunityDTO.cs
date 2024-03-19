using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Model
{
    public class OpportunityDTO
    {
        public int Id { get; set; }

        public int OppNo { get; set; }

        public string OppTopic { get; set; }

        public int AccountId { get; set; }

        public int ContactId { get; set; }

        public int RegardingId { get; set; }

        public int RegarId { get; set; }

        public int RelId { get; set; }

        public int PriceListId { get; set; }

        public int CurId { get; set; }

        public int LeadId { get; set; }

        public decimal CloseRevenue { get; set; }

        public DateTime CloseDate { get; set; }

        public decimal EstRevenue { get; set; }

        public string EstCloseDate { get; set; }

        public string EstCloseDateStr { get; set; }

        public int ProbabilityId { get; set; }

        public decimal ActualRevenue { get; set; }

        public int OppStatReasonId { get; set; }

        public int StatusReasonId { get; set; }

        public bool WonLost { get; set; }

        public int CampaignId { get; set; }

        public string OppCloseDesc { get; set; }

        public string OppDesc { get; set; }

        public bool IsActive { get; set; }

        public bool IsClose { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }

        public int DeletedBy { get; set; }

        public DateTime DeletedDate { get; set; }


        public string UserName { set; get; }
        public string ExpectedCloseDate { set; get; }
        public string Status { get; set; }
        public string ContactName { get; set; }
        public string ProbabilityName { get; set; }
        public string AccountName { get; set; }
        public string OriginatingLead { get; set; }


        public IEnumerable<PriceListDTO> PriceList { set; get; }
        public IEnumerable<CurrencyDTO> CurrencyList { set; get; }
        public IEnumerable<ProbabilityDTO> ProbabilityList { set; get; }
        public IEnumerable<ContactDTO> ContactList { set; get; }
        public IEnumerable<OppStatusReasonDTO> OppStatusReasonList { set; get; }

    }

    public class SearchOpportunity
    {
        public int OppNo { get; set; }

        public string OppTopic { get; set; }

        public int AcctId { get; set; }

        public int ContactId { get; set; }

        public int CreatedBy { get; set; }

        public int UserId { get; set; }
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public bool IsClose { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }
    }

    public class OpportunityResult
    {
        public List<OpportunityDTO> Opportunities { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }


    }

}
