using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class ActivityDTO
    {
        public int ActivityId { get; set; }

        public int? ActivityId_FK { get; set; }

        public int? ActivityTypeId { get; set; }

        public string ActivityTypeName { get; set; }

        public string ActivitySubject { get; set; }

        public string ActivityDesc { get; set; }

        public int? RegardingId { get; set; }

        public int? RegarId { get; set; }

        public string RegardingName { get; set; }

        public int? PriorityId { get; set; }

        public int? ActivityActionID { get; set; }

        public int? LeadID { get; set; }

        public int? OppID { get; set; }

        public int? QuoteID { get; set; }

        public int? InspID { get; set; }

        public int? AccountId { get; set; }

        public int? ContactID { get; set; }

        public DateTime? StartDate { get; set; }

        public string StartTime { get; set; }

        public DateTime? EndDate { get; set; }

        public string EndTime { get; set; }

        public int Duration { get; set; }

        public DateTime? DueDate { get; set; }

        public string DueTime { get; set; }

        public int? StatReasonId { get; set; }

        public int? OwnerId { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        public int ActivityStatusId { get; set; }

        public string ActivityStatusName { get; set; }

    }

    public class ActivitySearch
    {
        public int ActivityId { get; set; }

        public int? ActivityId_FK { get; set; }

        public int? ActivityTypeId { get; set; }

        public string ActivitySubject { get; set; }

        public string ActivityDesc { get; set; }

        public int? RegardingId { get; set; }

        public int? RegarId { get; set; }

        public int? PriorityId { get; set; }

        public int Skip { get; set; }

        public int Take { get; set; }

        public int UserId { get; set; }

        public string UserIds { get; set; }

        public DateTime StartDate { get; set; }

        public string StartTime { get; set; }

        public DateTime EndDate { get; set; }

        public string EndTime { get; set; }

        public int Duration { get; set; }

        public DateTime DueDate { get; set; }

        public string DueTime { get; set; }
    }

    public class ActivityResults
    {
        public List<ActivityDTO> ActivityList { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

        public string QueryStr { get; set; }
    }

    public class ActivityInfo
    {
        public int ActivityId { get; set; }

        public int? ActivityId_FK { get; set; }

        public int? ActivityTypeId { get; set; }

        public string ActivityTypeName { get; set; }

        public string ActivitySubject { get; set; }

        public string ActivityDesc { get; set; }

        public int? RegardingId { get; set; }

        public int? RegarId { get; set; }

        public string RegardingName { get; set; }

        public int? PriorityId { get; set; }

        public int? ActivityActionID { get; set; }

        public int? LeadID { get; set; }

        public int? OppID { get; set; }

        public int? QuoteID { get; set; }

        public int? InspID { get; set; }

        public int? AccountId { get; set; }

        public int? ContactID { get; set; }

        public DateTime? StartDate { get; set; }

        public string StartTime { get; set; }

        public DateTime? EndDate { get; set; }

        public string EndTime { get; set; }

        public int Duration { get; set; }

        public DateTime? DueDate { get; set; }

        public string DueTime { get; set; }

        public int? StatReasonId { get; set; }

        public int? OwnerId { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        public int ActivityStatusId { get; set; }

        public string ActivityStatusName { get; set; }

    }

    public class ActivityInput
    {
        public int ActivityId { get; set; }

        public int? ActivityId_FK { get; set; }

        public int? ActivityTypeId { get; set; }

        public string ActivityTypeName { get; set; }

        public string ActivitySubject { get; set; }

        public string ActivityDesc { get; set; }

        public int? RegardingId { get; set; }

        public int? RegarId { get; set; }

        public string RegardingName { get; set; }

        public int? PriorityId { get; set; }

        public int? ActivityActionID { get; set; }

        public int? LeadID { get; set; }

        public int? OppID { get; set; }

        public int? QuoteID { get; set; }

        public int? InspID { get; set; }

        public int? AccountId { get; set; }

        public int? ContactID { get; set; }

        public string StartDate { get; set; }

        public string StartTime { get; set; }

        public string EndDate { get; set; }

        public string EndTime { get; set; }

        public int Duration { get; set; }

        public string DueDate { get; set; }

        public string DueTime { get; set; }

        public int? StatReasonId { get; set; }

        public int? OwnerId { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

        public int? LastModifiedBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        public int ActivityStatusId { get; set; }

        public string ActivityStatusName { get; set; }

    }

    public class ActivityStatusDomainItem
    {
        public int ActivityStatusId { get; set; }

        public string ActivityStatusName { get; set; }
    }

}
