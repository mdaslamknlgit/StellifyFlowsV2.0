namespace UELPM.Model.Models
{
    public class WorkFlowResponse
    {
        public int WorkFlowResponseID { get; set; }       
        public int? WorkFlowApproversID { get; set; }
        public int? ApproverResponse { get; set; }
        public string ApproverRemarks { get; set; }
    }
}
