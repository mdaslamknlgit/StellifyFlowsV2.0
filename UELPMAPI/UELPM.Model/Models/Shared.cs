using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web;

namespace UELPM.Model.Models
{
    public class Shared
    {
        public string CategoryName { get; set; }
        public int LocationID { get; set; }
        public int ItemMasterID { get; set; }
        public string ItemName { get; set; }
        public int ItemQuantity { get; set; }
        public int LocationItemId { get; set; }
    }
    public class Locations
    {
        public int LocationID { get; set; }
        public string Name { get; set; }
        public bool HasWorkflow { get; set; }
        public bool IsFollowWorkflow { get; set; }
    }
    public class UOM
    {
        public int MeasurementUnitID { get; set; }
        public string Name { get; set; }
    }
    public class ItemTypes
    {
        public int ItemTypeID { get; set; }
        public string Name { get; set; }
    }

    public class ItemMasters
    {
        public int ItemMasterID { get; set; }
        public string Name { get; set; }
    }

    public class Itemcategorys
    {
        public int ItemCategoryID { get; set; }
        public string Name { get; set; }
    }

    public class ResponseStatus
    {
        public string Status { get; set; }
        public object Value { get; set; }
    }
    public class GetItemMasters
    {
        public int ItemMasterId { get; set; }
        public string ItemName { get; set; }
        public string Description { get; set; }
        public string ItemMasterCode { get; set; }
        public int ExistingQuantity { get; set; }
        public int Price { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string ItemCategoryName { get; set; }
        public int LocationItemIds { get; set; }
        public int MeasurementUnitID { get; set; }
        public string MeasurementUnitCode { get; set; }
        public string GLCode { get; set; }

    }
    public class ItemGLCode
    {
        public string ItemMasterId { get; set; }
        public string ItemName { get; set; }
    }

    public class GetAssets
    {
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public string AssetCode { get; set; }
        public string AssetDescription { get; set; }
        public string Warranty { get; set; }
    }
    public class GridDisplayInput
    {
        public int LocationId { get; set; }
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }
        public int FacilityId { get; set; }
        public string SortExpression { get; set; }
        public string SortDirection { get; set; }
        public int UserId { get; set; }
        public int? RoleID { get; set; }
        public int CompanyId { get; set; }
        public int SupplierId { get; set; }
        public DateTime FromTime { get; set; }
        public DateTime ToTime { get; set; }
        public int TicketId { get; set; }
        public bool IsReturn { get; set; }
        public int InvoiceId { get; set; }
        public int ProjectMasterContractId { get; set; }
        public string Action { get; set; }
        public bool IsApprovalPage { get; set; }
        public string SupplierName { get; set; }
        public string POPDocumentCode { get; set; }
        public bool FetchFilterData { get; set; }
        public string InvoiceCode { get; set; }
        public string DocumentCode { get; set; }
        public int DocumentId { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class Priority
    {
        public int PriorityId { get; set; }
        public string PriorityName { get; set; }
    }

    public class EngineerList
    {
        public int EngineerId { get; set; }
        public string EngineerName { get; set; }
    }

    public class Suppliers
    {
        public int SupplierId { get; set; }
        public int CompanyId { get; set; }
        public int SupplierTypeID { get; set; }
        public string SupplierName { get; set; }
        public string SupplierShortName { get; set; }
        public string BillingAddress1 { get; set; }
        public string BillingAddress2 { get; set; }
        public string BillingFax { get; set; }
        public string BillingTelephone { get; set; }
        public string SupplierEmail { get; set; }
        public string SupplierCode { get; set; }
        public string ServiceName { get; set; }
        public string CategoryName { get; set; }
        public int? GSTStatusId { get; set; }
        public int? TaxGroupId { get; set; }
        public int SubCodeCount { get; set; }
        public string GSTNumber { get; set; }
        public string PreviousSupplierName { get; set; }
        public string WorkFlowStatus { get; set; }
        public string AssociatedEntities { get; set; }
        public bool IsFreezed { get; set; }
        public int? TaxID { get; set; }
        public decimal TaxAmount { get; set; }
        public string SupplierAddress { get; set; }
        public string Description { get; set; }
        public int defaulttaxgroup { get; set; }
        public int PaymentTermsId { get; set; }
        public int CurrencyId { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class PurchaseOrderRequests
    {
        public int PurchaseOrderRequestId { get; set; }
        public string PurchaseOrderRequestCode { get; set; }
        public string FirstName { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class Customers
    {
        public int CustomerId { get; set; }
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string BillingCity { get; set; }
        public string BillingAddress { get; set; }
        public string BillingTelephone { get; set; }
    }

    public class Invoices
    {
        public int InvoiceId { get; set; }
        public string InvoiceCode { get; set; }
        public string SupplierRefNo { get; set; }
        public string FirstName { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal TotalAmount { get; set; }
        public int CurrencyId { get; set; }
        public int LocationId { get; set; }
        public int POTypeId { get; set; }
        public int SchedulerId { get; set; }
        public string SupplierCode { get; set; }
        public int SupplierSubCodeId { get; set; }
        public string SupplierAddress { get; set; }
    }

    public class FileSave
    {
        public HttpFileCollection Files { get; set; }
        public string CompanyName { get; set; }
        public string ModuleName { get; set; }
        public string UniqueId { get; set; }
        public string[] FilesNames { get; set; }
        public User UploadUser { get; set; }
    }

    public class Attachments
    {
        public int AttachmentId { get; set; }
        public int AttachmentTypeId { get; set; }
        public string FileName { get; set; }
        public string RecordId { get; set; }
        public bool IsDelete { get; set; }
    }

    public class QuotationAttachments
    {
        public int QuotationAttachmentId { get; set; }
        public int QuotationRequestId { get; set; }
        public int PurchaseOrderRequestId { get; set; }
        public int QuotationId { get; set; }
        public string FileName { get; set; }
        public int RowId { get; set; }
    }

    public class Facilities
    {
        public int FacilityId { get; set; }
        public string UnitNumber { get; set; }
    }

    public class Companies
    {
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public string CompanyAddress { get; set; }
        public int SupplierVerifier { get; set; }
        public int IsSelected { get; set; }
        public int RoleID { get; set; }
    }

    public class Taxes
    {
        public int TaxId { get; set; }
        public string TaxName { get; set; }
        public string TaxClass { get; set; }
        public decimal TaxAmount { get; set; }
    }
    public class Engineer
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Contact { get; set; }
        public bool IsAssigned { get; set; }
        public string IsAvailable { get; set; }
    }

    public enum WorkFlowStatus : int
    {
        Initiated = 1,
        AskedForClarification = 2,
        ApprovalInProgress = 3,
        Approved = 4,
        Rejected = 5,
        Draft = 6,
        SendToSupplier = 7,
        PartiallyReceived = 8,
        Received = 9,
        PartiallyInvoiced = 10,
        Invoiced = 11,
        Void = 12,
        Completed = 13,
        Exported = 14,
        Paid = 15,
        Accrued = 16,
        AccruedReversed = 17,
        PendingForTerminationApproval = 18,
        PreTerminate = 19,
        ReturnForVoidClarifications = 20,
        CancelledApproval = 21,
        Expired = 22,
        Terminate = 23,
        CancelDraft = 24,
        PartiallyPaid = 25,
        FullyPaid = 26,
        SendForApproval = 27,
        Open = 28
    }

    public enum GoodsReceivedNotesStatus : int
    {

        Draft = 1,
        Confirmed = 2
    }

    public enum WorkFlowProcessTypes : int
    {
        InventoryPo = 1,
        FixedAssetPO = 2,
        ProjectPO = 4,
        ContractPOFixed = 5,
        ContractPOVariable = 6,
        InventoryPurchaseRequest = 7,
        AssetPurchaseRequest = 8,
        SalesOrder = 9,
        Ticket = 10,
        AssetTransfer = 11,
        AssetDisposal = 12,
        Supplier = 13,
        ExpensesPurchaseRequest = 14,
        ExpensesPo = 15,
        LocationTransfer = 16,
        AssetDepreciation = 17,
        CreditNote = 18,
        GoodReturnNotes = 19,
        GoodRecievedNotes = 20,
        SupplierInvoice = 21,
        ProjectMasterContract = 22,
        ProjectContractVariationOrder = 23,
        ProjectPaymentContract = 24,
        CustomerMaster = 25,
        SalesQuotation = 26,
        SalesInvoice = 27
    }

    public enum ReportName : int
    {
        Supplier = 1
    }

    public enum PurchaseOrderType : int
    {
        InventoryPo = 1,
        FixedAssetPo = 2,
        ExpensePo = 3,
        ProjectPo = 4,
        ContractPoFixed = 5,
        ContractPoVariable = 6
    }

    public enum PurchaseItemType : int
    {
        Services = 1,
        Expenses = 2,
        Insurance = 3,
        Item = 4,
        Asset = 5
    }

    public enum BillingFrequencyType
    {
        Monthly = 1,
        Quarterly = 2,
        HalfYearly = 3,
        Yearly = 4,
        BiMonthly = 5
    }

    public enum SalesOrderCustomerCategories
    {
        Owners = 1,
        Tenants = 2,
        Others = 3
    }

    public static class AttachmentFolderNames
    {
        public static string CreditNote = "CreditNote";
        public static string Invoice = "Invoice";
        public static string InventoryPurchaseOrder = "InventoryPurchaseOrder";
        public static string AssetPurchaseOrder = "AssetPurchaseOrder";
        public static string ContractPurchaseOrder = "ContractPurchaseOrder";
        public static string ExpensePurchaseOrder = "ExpensePurchaseOrder";
        public static string SalesOrder = "SaleseOrder";
        public static string PurchaseOrderRequest = "PurchaseOrderRequest";
        public static string SalesInvoice = "SalesInvoice";
        public static string GoodsReceivedNotes = "GoodsReceivedNotes";
        public static string Supplier = "Supplier";
        public static string ProjectMasterContract = "ProjectMasterContract";
        public static string ProjectPaymentContract = "ProjectPaymentContract";
        public static string ProjectVariationOrder = "ProjectVariationOrder";
        public static string BankQRCode = "BankQRCode";
        public static string CustomerMaster = "CustomerMaster";
        public static string SalesQuotation = "SalesQuotation";
        public static string SalesQuotationBilling = "SalesQuotationBilling";
    }

    public enum AttachmentType
    {
        InventoryPurchaseOrder = 1,
        Ticket = 2,
        PurchaseOrderRequest = 3,
        Invoice = 4,
        PORQuotation = 5,
        SalesOrder = 6,
        FixedAssetPurchaseOrder = 7,
        ExpensePurchaseOrder = 8,
        ProjectPurchaseOrder = 9,
        ContractPurchaseOrder = 10,
        CreditNote = 11,
        SalesInvoice = 12,
        GoodsReceivedNotes = 13,
        Supplier = 14,
        ProjectMasterContract = 15,
        ProjectPaymentContract = 16,
        ProjectVariationOrder = 17,
        CustomerMaster = 18,
        SalesQuotation = 19
    }

    public enum WorkFlowFieldNames
    {
        TotalAmount = 1,
        ItemCategory = 2,
        Unitprice = 3,
        ItemQty = 4,
        AssetQty = 5,
        CreditLimit = 6,
        ContractSum = 7
    }

    public static class ModuleCodes
    {
        public static string InventoryPurchaseOrder = "01";
        public static string InventoryPurchaseOrderRequest = "INVPOR";
        public static string AssetPurchaseOrder = "01";
        public static string AssetPurchaseOrderRequest = "APOR";
        public static string ContractPurchaseOrder = "02";
        public static string ContractPurchaseOrderRequest = "CPOR";
        public static string CreditNote = "07";
        public static string GoodsRecievedNotes = "04";
        public static string Customer = "CID";
        public static string SaleseOrder = "SO";
        public static string AssetMaster = "ASSET";
        public static string ExpensePurchaseOrderReq = "EXPOR";
        public static string ExpensePurchaseOrder = "01";
        public static string LocationTransfer = "ILT";
        public static string GoodsReturnedNotes = "05";
        public static string SupplierInvoice = "06";
        public static string Company = "CMP";
        public static string Supplier = "";
        public static string ProjectMasterContract = "03";
        public static string ProjectPurchaseOrder = "03";
        public static string ProjectContractVariationOrder = "03";
        public static string ProjectPaymentContract = "08";
        public static string SalesQuotation = "08";
        public static string SalesInvoice = "09";
        static ModuleCodes()
        {
            InventoryPurchaseOrder = DateTime.Now.Year.ToString().Substring(2, 2) + InventoryPurchaseOrder;
            AssetPurchaseOrder = DateTime.Now.Year.ToString().Substring(2, 2) + AssetPurchaseOrder;
            ContractPurchaseOrder = DateTime.Now.Year.ToString().Substring(2, 2) + ContractPurchaseOrder;
            ExpensePurchaseOrder = DateTime.Now.Year.ToString().Substring(2, 2) + ExpensePurchaseOrder;
            SupplierInvoice = DateTime.Now.Year.ToString().Substring(2, 2) + SupplierInvoice;
            GoodsRecievedNotes = DateTime.Now.Year.ToString().Substring(2, 2) + GoodsRecievedNotes;
            CreditNote = DateTime.Now.Year.ToString().Substring(2, 2) + CreditNote;
            GoodsReturnedNotes = DateTime.Now.Year.ToString().Substring(2, 2) + GoodsReturnedNotes;
            ProjectMasterContract = DateTime.Now.Year.ToString().Substring(2, 2) + ProjectMasterContract;
            ProjectPaymentContract = DateTime.Now.Year.ToString().Substring(2, 2) + ProjectPaymentContract;
            ProjectPurchaseOrder = DateTime.Now.Year.ToString().Substring(2, 2) + ProjectPurchaseOrder;
            ProjectContractVariationOrder = DateTime.Now.Year.ToString().Substring(2, 2) + ProjectContractVariationOrder;
            SalesQuotation = DateTime.Now.Year.ToString().Substring(2, 2) + SalesQuotation;
            SalesInvoice = DateTime.Now.Year.ToString().Substring(2, 2) + SalesInvoice;
        }
    }

    public enum enumModuleCodes
    {
        InventoryPurchaseOrder = 1,
        InventoryPurchaseOrderRequest = 2,
        AssetPurchaseOrder = 3,
        AssetPurchaseOrderRequest = 4,
        ContractPurchaseOrder = 5,
        ContractPurchaseOrderRequest = 6,
        CreditNote = 7,
        GoodsRecievedNotes = 8,
        Customer = 9,
        SaleseOrder = 10,
        AssetMaster = 11,
        ExpensePurchaseOrderReq = 12,
        ExpensePurchaseOrder = 13,
        LocationTransfer = 14,
        GoodsReturnedNotes = 15,
        Payment = 16,
        FixedAssetPurchaseOrder = 17,
        Invoice = 18,
        PurchaseOrderCreation = 19,
        PurchaseOrderRequest = 20,
        QuotationRequest = 21,
        SalesInvoice = 22,
        InventoryRequest = 23,
        UserProfile = 24,
        Exception = 25
    }

    public enum enumAuditType
    {
        Create = 1,
        Update = 2,
        Delete = 3,
        SentForApproval = 4,
        SentEmail = 5,
        ApprovalStatus = 6,
        Void = 7,
        LoggedIn = 8,
        LoggedOut = 9,
        Error = 10
    }

    public static class ErrorMessages
    {
        public static string Duplicate = "Duplicate";
        public static string Duplicate1 = "DuplicateName";
    }

    public class PaymentType
    {
        public int PaymentTypeId { get; set; }
        public string Name { get; set; }
    }

    public class PurchaseOrderAuto
    {
        public string PurchaseOrderCode { get; set; }
        public int PurchaseOrderId { get; set; }
        public int POTypeId { get; set; }
        public string SupplierName { get; set; }
        public string FirstName { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class CompanyDetails
    {
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public string CompanyShortName { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyDescription { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string ZipCode { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string ImageSource { get; set; }
        public string Mobilenumber { get; set; }
        public string Fax { get; set; }
        public string SupplierVerifier { get; set; }
        public string Website { get; set; }
        public string GSTRegistrationNumber { get; set; }
        public string CountryName { get; set; }
        public string CompanyRegistrationNumber { get; set; }

    }

    public class SupplierCategorys
    {
        public int SupplierCategoryID { get; set; }
        public string CategoryText { get; set; }

    }

    public class WorkFlowApproval
    {
        public int DocumentId { get; set; }
        public int ProcessId { get; set; }
        public int WorkFlowStatusId { get; set; }
        public int UserId { get; set; }
        public string Remarks { get; set; }
        public int RequestUserId { get; set; }
        public string DocumentCode { get; set; }
        public int CompanyId { get; set; }
        public int ApproverUserId { get; set; }
        public bool IsReApproval { get; set; }
        public int? InvoiceTypeId { get; set; }
        public int? ParentSupplierId { get; set; }
        public int WorkflowId { get; set; }
        public int WorkFlowOrder { get; set; }
        public int NextApproverUserId { get; set; }
        public int? ReferenceDocumentId { get; set; }
        public int? ReferenceProcessId { get; set; }
    }

    public class DocumentRequestClarificationMail
    {
        public int DocumentId { get; set; }
        public int ProcessId { get; set; }
        public string DocumentCode { get; set; }
        public string ApproverName { get; set; }
        public string ApproverEmail { get; set; }
        public string RequesterName { get; set; }
        public string RequesterEmail { get; set; }
        public string ApproverComments { get; set; }
        public string RequesterComments { get; set; }
        public int CompanyId { get; set; }
        public string CompanyShortName { get; set; }
        public string SupplierShortName { get; set; }
        public string WorkflowStatus { get; set; }
    }

    public class UserRoles
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
    }

    public class WorkFlowStatuses
    {
        public int WorkFlowStatusid { get; set; }
        public string Statustext { get; set; }
    }

    public enum PurchaseOrderStatus : int
    {
        Draft = 1,
        Approval = 2,
        Rejected = 3,
        SendToSupplier = 4,
        PartiallyReceived = 5,
        Received = 6,
        PartiallyInvoiced = 7,
        Invoiced = 8,
        //Void =9
    }

    public class GetItemDetails
    {
        public int DocumentId { get; set; }
        public int ItemMasterId { get; set; }
        public int Quantity { get; set; }
    }

    public enum PurchaseItemTypes
    {
        Item = 1,
        Service = 2,
        Expense = 3
    }

    public enum FixedAssetTypes
    {
        Asset = 1,
        Service = 2
    }

    public enum MasterProcessTypes
    {
        CustomerType = 1,
        BankMaster = 2,
        TenantType = 3,
        CreditTerm = 4,
        Location = 5,
        TaxGroup = 6,
        TaxMaster = 7,
        TaxType = 8,
        EmailConfiguration = 9,
        CustomerMaster = 10
    }

    public class MasterProcess
    {
        public int ProcessId { get; set; }
        public int DocumentId { get; set; }
        public int UserId { get; set; }
        public string Remarks { get; set; }
        public bool Status { get; set; }
        public bool IsDefault { get; set; }
    }

    public class GRNS
    {
        public int GoodsReceivedNoteId { get; set; }
        public string SupplierDoNumber { get; set; }
        public int PurchaseOrderId { get; set; }
        public int POTypeId { get; set; }
        public string GRNCode { get; set; }
    }

    public class BillingFrequency
    {
        public int FrequencyId { get; set; }
        public string FrequencyText { get; set; }
    }


    public class COAAccountType
    {
        public int AccountTypeId { get; set; }
        public string AccountType { get; set; }
    }
    public class JVACode
    {
        public int JVAId { get; set; }
        public int JVANumber { get; set; }
    }


    public static class ProcessType
    {
        public static string InventoryPurchaseOrder = "Inventory PO";
        public static string AssetPurchaseOrder = "Fixed Asset PO";
        public static string ExpensePurchaseOrder = "Expense PO";
        public static string Supplier = "Supplier";
    }

    public class EmailSupplier
    {
        public int PurchaseOrderId { get; set; }
        public int PurchaseOrderTypeId { get; set; }
        public int CompanyId { get; set; }
        public List<SupplierContactPerson> SupplierContactPersonList { get; set; }
        public int UserID { get; set; }
    }

    public class User
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
    }
    public class InvoiceGlCode
    {
        public string ItemMasterId { get; set; }
        public string ItemName { get; set; }
        public int PoTypeId { get; set; }
        public int TypeId { get; set; }
        public int? InvoiceTypeId { get; set; }
        public int InvoiceId { get; set; }
        public int InvoiceItemId { get; set; }
        public int AccountType { get; set; }
        public int AccountCodeCategoryId { get; set; }
        public int CurrentUserId { get; set; }


    }

    public class TransactionType
    {
        public int TransactionTypeId { get; set; }
        public string TransactionTypeName { get; set; }
    }
    public class AddressType
    {
        public int AddressTypeId { get; set; }
        public string AddressTypeName { get; set; }
    }
    public class ApprovalDocumentInfo
    {
        public WorkFlowStatuses WorkflowStatus { get; set; }
        public List<Attachments> Attachments { get; set; }
        [JsonIgnore]
        public HttpFileCollection files { get; set; }
        public ButtonPreferences ButtonPreferences { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public User CreatedBy { get; set; }
        public User UpdatedBy { get; set; }
        public User CurrentApprover { get; set; }
        public string Reason { get; set; }
    }


    public class ReportingUsers
    {
        public int UserID { get; set; }
        public string UserName { get; set; }

        public int ManagerId { get; set; }

        public string ManagerName { get; set; }
    }
}
