using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class ProjectContractVariationOrder
    {
        public int ProjectContractVariationOrderId { get; set; }
        public int ProjectMasterContractId { get; set; }
        public string PCVariationOrderCode { get; set; }
        public string DocumentCode { get; set; }        
        public int CompanyId { get; set; }
        public int POPId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public string DraftCode { get; set; }
        public string POPMasterCode { get; set; }
        public string ProjectName { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Discount { get; set; }
        public decimal GST { get; set; }
        public decimal TotalAmount { get; set; }
        public bool Isdeleted { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string Status { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public Suppliers Supplier { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public ProjectMasterContract ProjectMasterContract { get; set; }
        public List<ProjectContractVariationOrderItems> ProjectContractVariationOrderItems { get; set; }
        public List<ProjectContractVariationOrderDiscountItems> ProjectContractVariationOrderDiscountItems { get; set; }
        public List<POPCostCategory> CostCategories { get; set; }
        public List<POPApportionment> ApportionmentMethods { get; set; }
        public decimal SubTotalRevisedContractValue { get; set; }
        public decimal SubTotalVOSum { get; set; }

        public decimal TotalVOSum { get; set; }
        public bool IsVerifier { get; set; }
        public decimal VOSum { get; set; }
        public int LocationId { get; set; }
        public string ReasonsToReject { get; set; }
        public string VODescription { get; set; }
        public string[] ReasonsToCancel { get; set; }

        public decimal? CMTotalVOSum { get; set; }
        public decimal? CMAdjustedContractSum { get; set; }
        public decimal? CMRetentionMaxLimit { get; set; }
    }

    public class ProjectContractVariationOrderItems
    {
        public int ProjectContractVariationOrderItemId { get; set; }
        public int ProjectContractVariationOrderId { get; set; }
        public int ProjectMasterContractItemId { get; set; }
        public int? POPCostCategoryId { get; set; }
        public int? POPApportionmentId { get; set; }
        public string AccountCode { get; set; }
        public int AccountCodeId { get; set; }
        public string AccountCodeName { get; set; }
        public string ItemDescription { get; set; }
        public int ItemTypeID { get; set; }
        public decimal? TotalVOSum { get; set; }
        public string Code { get; set; }
        public decimal? VOSum { get; set; }
        public decimal? ContractValue { get; set; }
        public decimal? RevisedContractValue { get; set; }        
        public string ApportionmentMethod { get; set; }
        public string TypeOfCostName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public AccountCode Expense { get; set; }
        public string AccountType { get; set; }
        public string Description { get; set; }
    }
    public class ProjectContractVariationOrderDiscountItems
    {
        public int ProjectContractVariationOrderItemId { get; set; }
        public int ProjectContractVariationOrderId { get; set; }
        public int ProjectMasterContractItemId { get; set; }
        public int? POPCostCategoryId { get; set; }
        public int? POPApportionmentId { get; set; }
        public string AccountCode { get; set; }
        public int AccountCodeId { get; set; }
        public string AccountCodeName { get; set; }
        public string DisItemDescription { get; set; }
        public decimal? TotalVOSum { get; set; }
        public decimal? DiscountValue { get; set; }
        public decimal? RevisedContractValue { get; set; }
        public string DisApportionmentMethod { get; set; }
        public string DisTypeOfCostName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public AccountCode Expense { get; set; }
    }

    public class ProjectContractVariationOrderDisplayResult
    {
        public List<ProjectContractVariationOrder> ProjectContractVariationOrderList { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ProjectContractVariationOrderSearch : GridDisplayInput
    {      
        public int? WorkFlowStatusId { get; set; }
        public int ProjectContractVariationOrderId { get; set; }
        public string DocumentCode { get; set; }      
        public bool IsApprovalPage { get; set; }
        public string ProjectName { get; set; }
    }
    public class VariationOrder
    {
        public int POPId { get; set; }
        public int VOId { get; set; }
        public string POPDocumentCode { get; set; }
        public string VODocumentCode { get; set; }
        public decimal RevisedContractTotal { get; set; }
        public string SupplierName { get; set; }
        public decimal OriginalContractSum { get; set; }
        public decimal VOSum { get; set; }
        public decimal TotalVOSum { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
