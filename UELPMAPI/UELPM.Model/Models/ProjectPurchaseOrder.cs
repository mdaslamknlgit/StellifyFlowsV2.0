using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class ProjectPurchaseOrder
    {
        public int ProjectPurchaseOrderId { get; set; }
        public string PoCode { get; set; }
        public string DraftCode { get; set; }
        public DateTime SupplierInvoiceDate { get; set; }
        public string SupplierInvoiceNo { get; set; }
        public DateTime JobCompletionDate { get; set; }
        public DateTime DateOfValuation { get; set; }
        public DateTime DateOfCertification { get; set; }
        public int CertificateNumber { get; set; }
        public int ProjectMasterContractId { get; set; }
        public string ProjectName { get; set; }
        public string POPMasterCode { get; set; }
        public decimal ContractValueTotal { get; set; }
        public decimal PrevAccumulatedPaymentTotal { get; set; }
        public decimal CurrentPaymentTotal { get; set; }
        public decimal AccumulatedTotal { get; set; }
        public decimal ContractValueSubTotal { get; set; }
        public decimal PrevAccumulatedPaymentSubTotal { get; set; }
        public decimal CurrentPaymentSubTotal { get; set; }
        public decimal AccumulatedSubTotal { get; set; }
        public int TaxId  {get;set;}
        public decimal SubjectToRetentionPercentageA1 { get; set; }
        public decimal SubjectToRetentionPercentageA2 { get; set; }
        public decimal SubjectToRetentionAmountA1 { get; set; }
        public decimal SubjectToRetentionAmountA2 { get; set; }
        public decimal NoRetentiontionAmount { get; set; }
        public decimal RetentionSum { get; set; }
        public decimal RetentionSumForThismonth { get; set; }
        public decimal GrandTotal { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<ProjectPurchaseOrderItems> ProjectPurchaseOrderItems { get; set; }
        public List<int> DeletedProjectPurchaseOrderItems { get; set; }
        public int CompanyId { get; set; }
        public Suppliers Supplier { get; set; }
        public HttpFileCollection files { get; set; }
        public DateTime ContractStartDate { get; set; }
        public DateTime ContractEndDate { get; set; }
        public decimal OriginalContractSum { get; set; }
        public decimal CommercialDiscount { get; set; }
    }

    public class ProjectPurchaseOrderItems
    {
      public int ProjectPurchaseOrderItemId { get; set; }
      public int ProjectPurchaseOrderId { get; set; }
      public int ProjectMasterContractItemId { get; set; }
      public int TypeOfCost { get; set; }
      public int ApportionmentId { get; set; }
      public decimal PrevAccumulatedAmount { get; set; }
      public decimal CurrentPayment { get; set; }
      public decimal AccumulatedPayment { get; set; }
      public decimal OverallStatus { get; set; }
      public int CreatedBy { get; set; }
      public DateTime CreatedDate { get; set; }

      public string ItemDescription { get; set; }
      public string AccountCode { get; set; }
      public string AccountCodeName { get; set; }
      public string Method { get; set; }
      public string CostDescription { get; set; }
      public decimal ContractValue { get; set; }
    }

    public class ProjectPurchaseOrderDisplayResult
    {
        public List<ProjectPurchaseOrder> ProjectPurchaseOrders { get; set; }
        public int TotalRecords { get; set; }
    }

    public class POPDetails
    {
        public ProjectPurchaseOrder ProjectPurchaseOrder { get;set; }
        public ProjectMasterContract ProjectMasterContract { get; set; }
    }
}
