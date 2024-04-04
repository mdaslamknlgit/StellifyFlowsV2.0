using System;

namespace UELPM.Model.Models
{
    public class WorkFlowLevel
    {
        public int WorkFlowLevelId { get; set; }
        public int WorkFlowProcessId { get; set; }
        public string FieldName { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
        public int? ApproverUserId { get; set; }
        public int? RoleID { get; set; }
        public bool IsCondition { get; set; }
        public int? LevelIndex { get; set; }
        public bool IsDeleted { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsVerifier { get; set; }
    }
}
