using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class ProjectPaymentContract
    {
        public int PaymentContractId { get; set; }
        public int POPId { get; set; }        
        public int CompanyId { get; set; }
        public string CertificateNo { get; set; }
        public int PaymentNo { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string StatusText { get; set; }
        public decimal CurrentPaymentTotalAmount { get; set; }
        public string DocumentCode { get; set; }
        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public DateTime? DateOfValuation { get; set; }
        public DateTime? DateOfCertification { get; set; }
        //public Suppliers Supplier { get; set; }
        public HttpFileCollection files { get; set; }
        public ProjectMasterContract ProjectMasterContract { get; set; }
        public List<PaymentInterimLineItems> ProjectMasterContractItems { get; set; }
        public List<PaymentInterimLineItems> DiscountLineItems { get; set; }
        public List<POPDistributionSummary> POPDistributionSummaryItems { get; set; }
        public ProjectPaymentItems Certificate { get; set; }
        public ProjectPaymentItems PreviousCertificate { get; set; }
        public int UpdatedBy { get; set; }
        public string ReasonsToReject { get; set; }
        public string[] ReasonsToCancel { get; set; }
        public string ReasonsToVoid { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public DateTime? DateOfDocument { get; set; }
        public string SupplierInvoiceNumber { get; set; }
        public decimal PreviousRetentionSum { get; set; }
        public List<Attachments> Attachments { get; set; }
        public bool IsVerifier { get; set; }
        public int PreviousPaymentContractId { get; set; }
        public bool CanVoidable { get; set; }
        public string PaymentDescription { get; set; }
        public string SupplierAddress { get; set; }
        public decimal? CMTotalVOSum { get; set; }
        public decimal? CMAdjustedContractSum { get; set; }
        public decimal? CMRetentionMaxLimit { get; set; }
    }
    public class ProjectPaymentContractDisplayResult
    {
        public List<ProjectPaymentContract> ProjectPaymentContractList { get; set; }
        public int TotalRecords { get; set; }
    }
    public class PaymentInterimLineItems
    {
        public int ProjectPaymentContractItemId { get; set; }
        public int POPId { get; set; }
        public int PaymentContractId { get; set; }
        public int ProjectMasterContractItemId { get; set; }
        public decimal PrevAccumulatedAmount { get; set; }
        public decimal CurrentPayment { get; set; }
        public decimal AccumulatedPayment { get; set; }
        public decimal Status { get; set; }
        public decimal? OverallStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal? ContractValue { get; set; }
        public decimal? DiscountValue { get; set; }
    }

    public class PaymentDistributionSummary
    {
        public int PaymentDisturbutionSummaryId { get; set; }
        public int DisturbutionSummaryId { get; set; }
        public decimal DistributionPercentage { get; set; }
        public decimal PayContractAmount { get; set; }
        public decimal ThisCertification { get; set; }
        public decimal RetentionAmount { get; set; }
        //public string RetentionCode { get; set; }        
        //public Locations Locations { get; set; }
        public int DepartmentId { get; set; }
        public string Department { get; set; }
        //public int CreatedBy { get; set; }
    }

    public class ProjectPaymentItems
    {
        public int ProjectPaymentItemId { get; set; }
        public int POPId { get; set; }
        public int PaymentContractId { get; set; }
        public decimal TotalValueOfWorkDone { get; set; }
        public decimal RetentionSumCalculated { get; set; }
        public decimal RetentionSumPreviouslyReleased { get; set; }
        public decimal RetentionSumBalBeforeCurrentRelease { get; set; }
        public decimal RetentionSumReleaseInTheMonth { get; set; }
        public decimal NettRetention { get; set; }
        public decimal ContractSumPreviouslyCertifiedToDate { get; set; }
        public decimal AmountDueUnderThisCerificate { get; set; }
        public decimal GST { get; set; }
        public decimal GSTAdjustment { get; set; }
        public decimal GrandTotal { get; set; }

        public decimal CPTotalValueOfWorkDone { get; set; }
        public decimal CPRetentionSumCalculated { get; set; }
        public decimal CPRetentionSumReleaseInTheMonth { get; set; }
        public decimal CPNettRetention { get; set; }
        public decimal CPAmountDueUnderThisCerificate { get; set; }
        public decimal CPGST { get; set; }
        public decimal CPGSTAdjustment { get; set; }
        public decimal CPGrandTotal { get; set; }
        public List<ProjectPaymentRetentions> Retentions { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class ProjectPaymentRetentions
    {
        public int ProjectPaymentRetentionId { get; set; }
        public int ProjectPaymentItemId { get; set; }
        public decimal RetentionPercentage { get; set; }
        public decimal RetentionAmount { get; set; }
        public decimal RetentionSum { get; set; }
        public bool IsRetention { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class ProjectPayment
    {
        public int POPId { get; set; }
        public int PaymentContractId { get; set; }
        public string POPDocumentCode { get; set; }
        public string PaymentDocumentCode { get; set; }
        public string SupplierInvoiceNumber { get; set; }
        public string CertificateNo { get; set; }
        public int PaymentNo { get; set; }
        public decimal GrandTotal { get; set; }
        public decimal CPGrandTotal { get; set; }
        public string Status { get; set; }
        public string SupplierName { get; set; }
        public decimal OriginalContractSum { get; set; }
        public decimal TotalVOSum { get; set; }

    }
    public class ProjectPaymentListFilter
    {
        public string POPDocumentCode { get; set; }
        public string SupplierName { get; set; }
        public int CreatedBy { get; set; }
        public int CompanyId { get; set; }

    }

}
