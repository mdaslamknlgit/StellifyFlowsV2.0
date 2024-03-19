namespace UELPM.Model.Models
{
    public class WorkFlowApprover
    {
        public int WorkFlowApproverId { get; set; }
        public int? WorkFlowLevelId { get; set; }
        public int? ApproverUserId { get; set; }      
        public int? AlternateApproverUserid { get; set; }        
        public WorkFlowResponse WorkFlowResponse { get; set; }
    }
}
