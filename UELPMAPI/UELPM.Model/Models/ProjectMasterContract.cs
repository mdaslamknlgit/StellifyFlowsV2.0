using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class ProjectMasterContract
    {
        public int ProjectMasterContractId { get; set; }

        public int VOId { get; set; }
        public int CompanyId { get; set; }
        public string POPMasterCode { get; set; }
        public string VODocumentCode { get; set; }
        public string DraftCode { get; set; }
        public string ExpensesType { get; set; }
        public int? ExpensesTypeId { get; set; }
        public string AccountType { get; set; }
        public bool IsRetentionApplicable { get; set; }
        public decimal? RetentionMaxLimit { get; set; }
        public decimal? RetentionPercentage { get; set; }
        public Suppliers Supplier { get; set; }
        public string SupplierAddress { get; set; }
        public DateTime ContractStartDate { get; set; }
        public DateTime ContractEndDate { get; set; }
        public decimal OriginalContractSum { get; set; }
        public decimal TotalVOSum { get; set; }
        public decimal AdjustedContractSum { get; set; }
        public string RetentionSupplierCode { get; set; }
        public int? ServiceTypeId { get; set; }
        public int? ServiceType { get; set; }
        public int TaxAuthorityId { get; set; }
        public string TaxGroupName { get; set; }
        public int TaxId { get; set; }
        public string TaxName { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public int? DepartmentId { get; set; }
        public HttpFileCollection files { get; set; }
        public List<Attachments> Attachments { get; set; }
        public List<ProjectMasterContractItems> ProjectMasterContractItems { get; set; }
        public List<DiscountLineItems> DiscountLineItems { get; set; }
        public List<int> ProjectMasterContractItemsToDelete { get; set; }
        public List<int> ProjectMasterDiscountItemsToDelete { get; set; }
        public List<POPCostCategory> POPCostCategory { get; set; }
        public List<int> POPCostCategoryToDelete { get; set; }
        public List<POPApportionment> POPApportionment { get; set; }
        public List<int> POPApportionmentToDelete { get; set; }
        public List<POPDistributionSummary> POPDistributionSummaryItems { get; set; }
        public List<int> POPDistributionSummaryToDelete { get; set; }
        public string ProjectName { get; set; }
        public List<Locations> Departments { get; set; }
        public List<int> DepartmentsToDelete { get; set; }
        public string FirstName { get; set; }

        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string Location { get; set; }
        public int LocationId { get; set; }
        public string ContractTerms { get; set; }
        public int CertificateNumber { get; set; }
        public int VariationOrderCount { get; set; }
        public int? SupplierSubCodeId { get; set; }
        public SupplierSubCode SupplierSubCode { get; set; }
        public string SubCodeDescription { get; set; }
        public string ServiceName { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? TotalBefTax { get; set; }
        public decimal? TotalTax { get; set; }
        public decimal? TotalAmount { get; set; }
        public string UserName { get; set; }
        public string RetentionSupplierCodeName { get; set; }
        public string RetentionSubCode { get; set; }
        public string RetentionAccountSetId { get; set; }
        public string RequestedByUserName { get; set; }
        public string SupplierName { get; set; }
        public int SupplierId { get; set; }
        //public UserProfile UserProfile  { get; set; }
        public bool IsVerifier { get; set; }
        public string Action { get; set; }
        public string ReasonsToReject { get; set; }
        public int RetentionTypeId { get; set; }
        public decimal? SubTotalRevisedContractValue { get; set; }
        public int UpdatedBy { get; set; }
        public string VOWorkFlowStatus { get; set; }
        public string ContractDescription { get; set; }
        public string VODescription { get; set; }
        public string[] ReasonsToCancel { get; set; }
        public int? CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public int? PaymentTermsId { get; set; }
        public string PaymentTermCode { get; set; }
        public decimal? CurrentVOSum { get; set; }
        public decimal? CMTotalVOSum { get; set; }
        public decimal? CMAdjustedContractSum { get; set; }
        public decimal? CMRetentionMaxLimit { get; set; }
        public int? NoOfDays { get; set; }

    }

    public class DiscountLineItems
    {
        public int ProjectMasterContractId { get; set; }
        public int ProjectMasterContractItemId { get; set; }
        public int ItemId { get; set; }
        public string DisItemDescription { get; set; }
        //public int AccountCodeId  { get; set; }
        public string AccountCode { get; set; }
        public string AccountCodeName { get; set; }
        //public int POPCostCategoryId { get; set; }
        public int ApportionmentId { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal PrevAccumulatedAmount { get; set; }
        public decimal CurrentPayment { get; set; }
        public decimal AccumulatedPayment { get; set; }
        public decimal OverallStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        // public int ProjectMasterContractItemId { get; set; }
        public AccountCode Expense { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public int ItemTypeId { get; set; }
        public string ItemDescription { get; set; }
        public decimal ContractValue { get; set; }
        public string DisTypeOfCostName { get; set; }
        public string DisApportionmentMethod { get; set; }
        public decimal? VOSum { get; set; }
        public decimal? PreviousVOSum { get; set; }
        public decimal? RevisedContractValue { get; set; }
    }

    public class ProjectMasterContractItems
    {
        public int ProjectMasterContractId { get; set; }
        public int ProjectMasterContractItemId { get; set; }
        public int ItemId { get; set; }
        public string ItemDescription { get; set; }
        //public int AccountCodeId { get; set; }
        public string AccountCode { get; set; }
        public string AccountCodeName { get; set; }
        //public int POPCostCategoryId { get; set; }
        public int ApportionmentId { get; set; }
        public decimal ContractValue { get; set; }
        public decimal? PreviousVOSum { get; set; }
        public decimal VOSum { get; set; }
        public decimal? RevisedContractValue { get; set; }
        public decimal PrevAccumulatedAmount { get; set; }
        public decimal CurrentPayment { get; set; }
        public decimal AccumulatedPayment { get; set; }
        public decimal OverallStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        // public int ProjectMasterContractItemId { get; set; }
        public AccountCode Expense { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public int ItemTypeId { get; set; }
        public string TypeOfCostName { get; set; }
        public string ApportionmentMethod { get; set; }

    }

    public class POPCostCategory
    {
        public int POPCostCategoryId { get; set; }
        public int POPId { get; set; }
        public string TypeOfCost { get; set; }
        public string CostDescription { get; set; }
        public string GL_Cost { get; set; }
        public string GL_Cost_Description { get; set; }
        public string GST_Group { get; set; }
        public string GST_Class { get; set; }
        public decimal TaxAmount { get; set; }
        public string GL_Retention { get; set; }
        public string GL_Retention_Description { get; set; }
        public string GL_GroupRetention { get; set; }
        public string GL_ClassRetention { get; set; }
        public string GL_TaxClassRetentionName { get; set; }
        public string Prefix { get; set; }
        public string GST_GroupName { get; set; }
        public string GST_ClassName { get; set; }
        public string GST_TaxClassName { get; set; }
        public string GL_GroupRetentionName { get; set; }
        public string GL_ClassRetentionName { get; set; }


    }

    public class POPApportionment
    {
        public int POPApportionmentId { get; set; }
        public int POPId { get; set; }
        public string Method { get; set; }
        public List<ApportionmentDetails> ApportionmentDetails { get; set; }
        public List<int> ApportionmentDetailsDeleted { get; set; }
        public decimal Total { get; set; }
        public string Remarks { get; set; }
    }

    public class ApportionmentDetails
    {
        public int POPApportionmentDetailId { get; set; }
        public int POPApportionmentId { get; set; }
        public string TypeOfCost { get; set; }
        public int POPCostCategoryId { get; set; }
        public int RowIndex { get; set; }
        public decimal Amount { get; set; }
    }

    public class ProjectMasterContractDisplayResult
    {
        public List<ProjectMasterContract> ProjectMasterContractList { get; set; }
        public int TotalRecords { get; set; }
    }

    public class CostType
    {
        public int CostTypeId { get; set; }
        public string CostDescription { get; set; }
        public string CostText { get; set; }
    }

    public class ProjectMasterContractSearch : GridDisplayInput
    {
        public Supplier Supplier { get; set; }
        public int? WorkFlowStatusId { get; set; }
        public int ProjectMasterContractId { get; set; }
        public string DocumentCode { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool IsApprovalPage { get; set; }
        public int RequestFrom { get; set; }
        public string SupplierName { get; set; }
    }

    public class POPDistributionSummary
    {
        public int DisturbutionSummaryId { get; set; }

        // public Companies Company { get; set; }
        public decimal DistributionPercentage { get; set; }
        public decimal ContractAmount { get; set; }
        public decimal ThisCerification { get; set; }
        public decimal ThisCertification { get; set; }
        public decimal PayContractAmount { get; set; }
        public decimal RetentionAmount { get; set; }
        public string RetentionCode { get; set; }
        public Locations Locations { get; set; }
        public int DepartmentId { get; set; }
        public string LocationName { get; set; }

    }
    public class ProjectMasterContractFilter
    {
        public string SupplierName { get; set; }
        public string ProjectName { get; set; }
        public int CreatedBy { get; set; }
        public int CompanyId { get; set; }
        public int Take { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

    }

}
