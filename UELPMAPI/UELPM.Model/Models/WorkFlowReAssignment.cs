using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class WorkFlowReAssignment
    {
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public int AlternateApproverUserId { get; set; }
        public string AlternateApproverUserName { get; set; }
        public int? WorkFlowReAssignmentLogId { get; set; }
        public int CompanyId { get; set; }
        public IEnumerable<Roles> UserRoles { get; set; }
        public IEnumerable<WorkflowItems> WorkflowItems { get; set; }
        public IEnumerable<Documents> Documents { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool preview { get; set; }
    }
   

    public class WorkflowItems
    {
        public int WorkFlowReAssignmentStrucutreLogId { get; set; }
        public int WorkFlowLevelId { get; set; }
        public int? SNo { get; set; }
        public string ProcessName { get; set; }
        public string DepartmentName { get; set; }
        public int LevelIndex { get; set; }
        public string RoleName { get; set; }
        public string CompanyName { get; set; }
    }

    public class Documents
    {
        public int WorkFlowReAssignmentDocumentLogId { get; set; }
        public int WorkFlowId { get; set; }
        public int DocumentId { get; set; }
        public int? SNo { get; set; }
        public string DocumentCode { get; set; }
        public int LevelIndex { get; set; }
        public string ProcessName { get; set; }
        public string WorkFlowStatus { get; set; }
        public string CompanyName { get; set; }
    }
}



