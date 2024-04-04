using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class DealDTO 
    {
        public int DealId { get; set; }

        public string DealName { get; set; }

        public int AccountId { get; set; }

        public int ContactId { get; set; }

        public int DealTypeId { get; set; }

        public string DealTypeName { get; set; }

        public string NextStep { get; set; }

        public int LeadSourceId { get; set; }

        public int RatingId { get; set; }
        public decimal Amount { get; set; }

        public string ClosingDate { get; set; }

        public int PipelineId { get; set; }

        public int DealStageId { get; set; }

        public string DealStageName { get; set; }

        public int Probability { get; set; }

        public decimal ExpectedRevenue { get; set; }

        public string CampaignSource { get; set; }

        public string DealDescription { get; set; }

        public bool DealClose { get; set; }

        public bool DealLost { get; set; }
        public string OwnerName { get; set; }

        public string ContactName { get; set; }

        public string CompanyName { get; set; }

        public string AccountName { get; set; }

        public int OwnerId { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal UpfrontOrAdvance { get; set; }

        public string PoNumber { get; set; }

        public decimal Balance { get; set; }

        public string Remarks { get; set; }

    }

    public class DealBase
    {
        public int CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

    }
    public class DealsResult
    {
        public List<DealDTO> Deals { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }

    public class DealsSearch : DealBase
    {
        public int DealId { get; set; }

        public string DealName { get; set; }

        public int AccountId { get; set; }

        public string AccountName { get; set; }

        public int ContactId { get; set; }

        public string ContactName { get; set; }

        public string DealTypeId { get; set; }

        public string DealStageId { get; set; }

        public string NextStep { get; set; }

        public int? LeadSourceId { get; set; }

        public int RatingId { get; set; }
        public decimal? Amount { get; set; }

        public DateTime? ClosingDate { get; set; }

        public int? PipelineId { get; set; }


        public int? Probability { get; set; }

        public decimal? ExpectedRevenue { get; set; }

        public string CampaignSource { get; set; }

        public string DealDescription { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }

        public int UserId { get; set; }

        public string FromDate { get; set; }

        public string ToDate { get; set; }
    }

    public class DealInfo : DealDTO
    {

    }

    public class DealForm
    {
        public int DealId { get; set; }

        public string DealName { get; set; }

        public int AccountId { get; set; }

        public string AccountName { get; set; }

        public int ContactId { get; set; }

        public string ContactName { get; set; }

        public int DealTypeId { get; set; }

        public string DealTypeName { get; set; }

        public string NextStep { get; set; }

        public int LeadSourceId { get; set; }

        public int RatingId { get; set; }

        public decimal Amount { get; set; }

        public string ClosingDate { get; set; }

        public int PipelineId { get; set; }

        public int DealStageId { get; set; }

        public string DealStageName { get; set; }

        public int Probability { get; set; }

        public decimal ExpectedRevenue { get; set; }

        public string CampaignSource { get; set; }

        public string DealDescription { get; set; }

        public int OwnerId { get; set; }

        public bool DealClose { get; set; }

        public bool DealLost { get; set; }

        public string OwnerName { get; set; }
        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        public int DeletedBy { get; set; }


        public decimal TotalAmount { get; set; }

        public decimal UpfrontOrAdvance { get; set; }

        public string PoNumber { get; set; }

        public decimal Balance { get; set; }

        public string Remarks { get; set; }




    }


    public class DealCloseForm
    {
        public int DealId { get; set; }

        public int DealStageId { get; set; }

        public string DealStagename { get; set; }

        public decimal Amount { get; set; }

        public string ClosingDate { get; set; }

        public int ClosedBy { get; set; }

        public string ClosedDate { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal UpfrontOrAdvance { get; set; }

        public string PoNumber { get; set; }

        public decimal Balance { get; set; }

        public string Remarks { get; set; }

        public int CreatedBy { get; set; }

        public int UserId { get; set; }

        public int DealReasonId { get; set; }
    }
}
