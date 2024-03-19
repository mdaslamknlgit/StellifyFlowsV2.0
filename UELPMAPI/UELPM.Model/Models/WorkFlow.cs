namespace UELPM.Model.Models
{
    public class WorkFlow
    {    
        public int WorkFlowId { get; set; }
        public int? DocumentId { get; set; }
        public int ProcessId { get; set; }
        public int? ApproverUserId { get; set; }
        public int? WorkFlowOrder { get; set; }
        public string Status { get; set; }
        public int OverAllWorkFlowStatusId { get; set; }
        public bool IsCreditLimit { get; set; }
        public bool IsVerifier { get; set; }
    }
}
