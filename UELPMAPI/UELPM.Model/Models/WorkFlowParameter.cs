using System;

namespace UELPM.Model.Models
{
    public class WorkFlowParameter
    {
        public int ProcessId { get; set; }
        public int CompanyId { get; set; }
        public int LocationId { get; set; }
        public int UserID { get; set; }
        public int? RoleID { get; set; }
        public string FieldName { get; set; }
        public string Value { get; set; }
        public int DocumentId { get; set; }
        public string UnitPrice { get; set; }
        public string ItemCategory { get; set; }
        public string ItemQuantity { get; set; }
        public string DocumentCode { get; set; }
        public int CreatedBy { get; set; }
        public int WorkFlowStatusId { get; set; }
        public DateTime TerminationDate { get; set; }
        public string ReasonForVoid { get; set; }
        public int ParentDocumentId { get; set; }
        public string CoSupplierCode { get; set; }
        public int CurrentWorkFlowStatusId { get; set; }
        public bool IsCreditLimitChanged { get; set; }
        public int PurchaseOrderStatusId { get; set; }
        public string RemarksQuotation { get; set; }
    }

    public class SupplierVerificationApprover
    {
        public int WorkFlowId { get; set; }
        public int? ApproverUserId { get; set; }
        public int? DocumentId { get; set; }
        public int? CompanyId { get; set; }
        public int ProcessId { get; set; }
        public int RoleID { get; set; }
        public int? WorkFlowOrder { get; set; }
        public int? PreviousValue { get; set; }
        public int? NextValue { get; set; }
        public int Status { get; set; }
        public bool IsSupplierVerrfier { get; set; }
    }
}
