using System;
using System.Collections.Generic;
using System.Web;

namespace UELPM.Model.Models
{
    public class Supplier
    {
        public int SupplierId { get; set; }
        public string SupplierCode { get; set; }
        public string SupplierName { get; set; }
        public int LocationId { get; set; }
        public string SupplierShortName { get; set; }
        public int SupplierServiceID { get; set; }
        public int SupplierCategoryID { get; set; }
        public int PaymentTermsId { get; set; }
        public string ServiceName { get; set; }
        public string CategoryName { get; set; }
        public string PaymentTermCode { get; set; }
        public Country Country { get; set; }
        public string BillingCountry { get; set; }
        public string ShippingCountry { get; set; }
        public string SupplierEmail { get; set; }
        public string BillingAddress1 { get; set; }
        public string SupplierAddress { get; set; }
        public string BillingAddress2 { get; set; }
        public string BillingCity { get; set; }
        public int BillingCountryId { get; set; }
        public string BillingZipcode { get; set; }
        public string BillingTelephone { get; set; }
        public string BillingAddress3 { get; set; }
        public string BillingFax { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsAttached { get; set; }
        public bool IsGSTSupplier { get; set; }
        public int CreatedBy { get; set; }
        public int AttachedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public List<SupplierContactPerson> ContactPersons { get; set; }
        public List<int> ContactPersonsToDelete { get; set; }
        public List<int> SupplierServicesToDelete { get; set; }      
        public string TaxName { get; set; }
        //public int TaxClass { get; set; }     
        public string Remarks { get; set; }
        public string CoSupplierCode { get; set; }     
        public string GSTStatus { get; set; }
        public int SupplierTypeID { get; set; }
        public int CompanyId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public string ReasonstoVoid { get; set; }
        public bool? IsApprovalPage { get; set; }
        public SupplierCompanyDetails SupplierCompanyDetails { get; set; }
        public List<SupplierAttachedCompanies> SupplierAttachedCompanies { get; set; }
        public List<SupplierSelectedService> SupplierSelectedServices { get; set; }
        public List<SupplierService> SupplierServices { get; set; }
        public SupplierApproval SupplierApproval { get; set; }
        public HttpFileCollection UploadFiles { get; set; }
        public List<Attachments> Attachments { get; set; }
        public string RequestedByUserName { get; set; }
        public string DraftCode { get; set; }
        public bool IsDocumentApproved { get; set; }
        public int? GSTStatusId { get; set; }
        public string GSTNumber { get; set; }
        public decimal? ShareCapital { get; set; }
        public bool IsSubCodeRequired { get; set; }
        public List<SupplierSubCode> SubCodes { get; set; }
        public int? ParentSupplierId { get; set; }
        public bool IsActive { get; set; }
        public string PreviousSupplierName { get; set; }
        public List<Company> SupplierEntities { get; set; }
        public bool IsSupplierVerifier { get; set; }
        public WorkFlowParameter WorkFlowDetails { get; set; }
        public Supplier OldSupplier { get; set; }
        public bool IsWorkFlowAssigned { get; set; }
        public string Location { get; set; }
        public bool IsWFVerifier { get; set; }
    }

    public class SupplierCompanyDetails
    {
        public int SupplierCompanyId { get; set; }
        public int? SupplierId { get; set; }
        public int? CompanyId { get; set; }     
        public int? TaxId { get; set; }       
        public string RateType { get; set; }
        public string Justification { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencySymbol { get; set; }
        public decimal? CreditLimit { get; set; }     
        public string BankCode { get; set; }
        public string GLAccount { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public int PaymentTermsId { get; set; }
        public string TaxClass { get; set; }
        public string TaxGroupName { get; set; }
        public bool? IsDetached { get; set; }
        public DateTime? DetachedDate { get; set; }

    }

    public class SupplierSelectedService
    {
        public int SupplierSelectedServiceId { get; set; }
        public int SupplierId { get; set; }
        public int? SupplierServiceID { get; set; }
        public int? CompanyId { get; set; }
    }

    public class SupplierApproval
    {
        public int SupplierApprovalId { get; set; }
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }
        public int? WorkFlowStatusId { get; set; }      
        public string WorkFlowStatus { get; set; }
    }

    public enum SupplierStatus : int
    {
        Draft = 1,
        Approval = 2,
        Rejected = 3      
    }

    public class SupplierAttachedCompanies
    {      
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }      
    }

    public class SupplierSearch : GridDisplayInput
    {
        public string SupplierName { get; set; }
        public string SupplierCity { get; set; }
        public int? WorkFlowStatusId { get; set; }
        public int? SupplierCategoryID { get; set; }
    }

    public class VendorDisplayResult
    {
        public List<VendorsList> Vendor { get; set; }
        public int TotalRecords { get; set; }
    }

    public class VendorsList
    {
        public int SupplierId { get; set; }
        public string ShortName { get; set; }
        public string BRN { get; set; }
        public string AMTCRLIMT { get; set; }
        public string VendorId { get; set; }
        public string IDGRP { get; set; }
        public string IDAcctSet { get; set; }
        public string VendName { get; set; }
        public string Textstre1 { get; set; }
        public string Textstre2 { get; set; }
        public string Textstre3 { get; set; }
        public string Textstre4 { get; set; }
        public string NameCity { get; set; }
        public string CodeStte { get; set; }
        public string CodeCtry { get; set; }
        public string NameCtac { get; set; }
        public string TextPhon1 { get; set; }
        public string TextPhon2 { get; set; }
        public string CurnCode { get; set; }
        public string CodeTaxGRP { get; set; }
        public string TaxClass1 { get; set; }
        public string Email1 { get; set; }
        public string Email2 { get; set; }
        public string CtacFax { get; set; }
        public string CtacPhone { get; set; }
        public string CodePstl { get; set; }
    }

    public class VendorToExport
    {
        public int WorkFlowStatusId { get; set; }
        public int SupplierId { get; set; }
    }
}
