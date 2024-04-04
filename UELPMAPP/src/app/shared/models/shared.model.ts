import { SupplierContactPerson } from "../../po/models/supplier";
import { Roles } from "../../administration/models/role";
import { WorkflowAuditTrail } from "./../../po/models/workflow-audittrail.model";

export class ItemMaster {
    ItemMasterId: number;
    ItemName: string;
    Description: string;
    ExistingQuantity?: number;
    MeasurementUnitID?: number;
    MeasurementUnitName?: string;
    MeasurementUnitCode: string;
}
export class SupplierItemMaster {
    ItemMasterId: number;
    ItemName: string;
    Description: string;
    ExistingQuantity?: number;
    MeasurementUnitID?: number;
    MeasurementUnitName?: string;
    MeasurementUnitCode: string;
    GLCode: string;
    GlDescription: string;
}

export class SupplierCategorys {
    SupplierCategoryID: number;
    CategoryText: string;
}
export class ItemGLCode {
    ItemMasterId: string;
    ItemName: string;
}


export class Assets {
    AssetId: number;
    AssetName: string;
    AssetCode: String;
    AssetDescription: string;
    AccountCode: string;
}
export class Location {
    LocationID: number;
    Name: string;
    HasWorkflow: boolean;
    IsFollowWorkflow: boolean;
}
export class Facilities {
    FacilityId: number;
    UnitNumber: string;
}
export class LeadsName{
    LeadId:number;
    Name:string;
    FirstName:string;
    Lastname:string;
}
export class Suppliers {
    SupplierId: number;
    SupplierTypeID: number;
    SupplierName: string;
    SupplierShortName?: string;
    SupplierCode: string;
    BillingAddress1: string;
    BillingAddress2: string;
    BillingFax: string;
    SupplierEmail?: string;
    BillingTelephone?: string;
    PreviousSupplierName: string;
    GSTStatusId?: number;
    TaxGroupId?: number;
    GSTType?: number;
    SubCodeCount: number;
    WorkFlowStatus: string;
    IsFreezed: boolean;
    TaxID?: number;
    TaxAmount?: number;
    SupplierAddress: string;
    defaulttaxgroup?: number;
    PaymentTermsId?: number;
}

export class PurchaseOrderRequests {
    PurchaseOrderRequestId: number;
    PurchaseOrderRequestCode: string;
}

export class Invoices {
    InvoiceId: number;
    InvoiceCode: string;
}

export enum ResponseStatusTypes {
    Success = "success",
    Error = "error",
    Duplicate = "Duplicate",
    Duplicate1 = "DuplicateName",
    NotAllowed = "NotAllowed"
}
export enum GridOperations {
    Display = "display",
    Edit = "edit",
    Add = "add"
}
export enum SortingOrderType {
    Ascending = "ASC",
    Descending = "DESC"
}
export class ResponseMessage {
    Message: string;
    ShowMessage: boolean;
    MessageType: string;
}
export enum Messages {
    SavedSuccessFully = "Saved Successfully",
    SubmitSuccessFully = "Submited Successfully",
    DeletedSuccessFully = "Deleted Successfully",
    ValidationMessage = "Supplier Service associated with Service Category cannot be deleted.",
    SupplierValidationMessage = "Supplier Services associated with Supplier cannot be deleted",
    SupplierCategoryValidationMessage = "Supplier Category associated with supplier cannot be deleted",
    CompanyValidationMessage = "Company associated with PO's,GRN,Invoice cannot be deleted.",
    PaymentValidationMessage = "Payment Terms code associated with supplier,PO's and Invoice cannot be deleted.",
    TaxgroupValidationMessage = "Tax Group associated with Taxes,PO's and Invoice cannot be deleted.",
    TaxValidationMessage = "Taxes associated with PO's and Invoice cannot be deleted.",
    AccountCodeValidationMessage = "Account Code associated with PO's and Invoice cannot be deleted.",
    AccounttypeValidationMessage = "Account Types associated with Account Codes cannot be deleted. ",
    AccountsubValidationMessage = "Account SubCategory associated with Account Codes cannot be deleted.",
    CurrencyValidationMessage = "Currency associated with supplier,PO's and Invoice cannot be deleted.",
    //DepartmentValidationMessage="Department associated with PO's,GRN and Invoice cannot be deleted.",
    RoleValidationMessage = "Role associated with UserManagement and Workflow cannot be deleted.",
    WorkflowValidationMessage = "No Supplier work flow is created for the ",
    PoWorkflowValidationMessage = "No PO work flow is created for the ",
    PoApprovesameValidationMessage = "PO User and Approver cannot be same person",
    UserValidationMessage = "Please Import LDAP Users ",
    UpdatedSuccessFully = "Updated Successfully",
    DuplicateUserMessage = "Email or Username is already existed",
    DuplicateUserEmailMessage = "Email is already existed",
    ProceedDelete = 'Are you sure that you want to proceed?',
    ProceedGeneratePOC = 'Are you sure that you want to generate poc?',
    PopupHeader = "Information",
    DeletePopupHeader = "Confirmation",
    NoChangesDetected = "No Changes Detected",
    AttachmentDeleteConfirmation = "Are you sure you want to delete this attachment",
    NoItemsToDisplay = "No Items To Display",
    Approved = "Approved Successfully",
    Rejected = "Rejected Successfully",
    SentForClarification = "Sent For Clarification Successfully",
    SentForApproval = "Sent for Approval Successfully",
    EmailResponse = "Your mail has been sent successfully",
    NoRecordsToDisplay = "No Records To Display",
    SentMessage = "Message Sent Successfully",
    QuotationSentForApproval = "Please Select atleast one Quotation to proceed for Approval",
    QuotationAttachmentForPO = "Please attach 3 Quotations (or) Enter Remarks to proceed for Approval ",
    CheckQuotationAttachmentForPO = "Choose Alteast One Attachment for every Supplier",
    VoidRecord = "Purchase Order Status Changed to Void",
    DocumentVoidRecord = "Document Status Changed to Void",
    GRNVoidRecord = "GRN Status Changed to Void",
    InvoiceVoidRecord = "Invoice Status Changed to Void",
    VoidNotAllowed = "This Purchase Order is Use",
    ExportRecord = "Exported Successfully",
    ExistingRecord = "Not Deleted.. This Item is associated with other Items",
    PoGenerationNotAllowd = "Po Generation is not allowed",
    ActionNotAllowed = "Action Not Allowed",
    PoGenerationSuccessfully = "PO Generated Successfully",
    PocGenerationSuccessfully = "POC Generated Successfully",
    MasterCPOVoidRecord = "Sent for Void Approval Successfully",
    SupplierVerifierMessage = "Do you want to Send for Approval?",
    SupplierVerifierSaveMessage = "Sure you want to Update?",
    ReverifyConfirmation = "Are you sure you want to update?",
    NewPasswordMessage = "New Password Change Successfully",
    ADNewPasswordMessage = "You are Active Directory User. Contact To your Adminstrator",
    ConfirmationPasswordMessage = "New and Confirm Password not matched",
    DefaultCompanyMessage = "Select Atleast one Default Company",
    CompanyAttachMessage = "Are you sure you want to attach other company supplier?",
    AttachMessage = "Already this supplier is attached",
    LDAPImportMessage = "Imported LDAP Users to Database Successfully",
    AttachWarningMessage = "Supplier Can't be attached as it is in ",
    AssetSubCategoryMessage = " Record(s) Imported Successfully",
    AssetsubCategoryNoMessage = " No Rows Imported",
    AssetSubcategoryFialedrecords = " Record(s) Failed To Import",
    AssetSubcategoryAcceptExcel = "Please select a xlsx file For Upload",
    SupplierDetachMessage = "Are you sure you want to detach this supplier",
    DetachedSuccessFully = "Detached Successfully",
    SupplierDetachErrorMessage = "There are open PO's for this supplier, You are not allowed to detach",
    VerifierMessage = "Verified successfully",
    NoVendorsMessage = "No Approved Vendors Found",
    CancelDraft = "Cancel Draft Successfully",
    ExportVendor = "Already Exported",
    NoRecordsExport = "No Records to Export",
    WorkFlowReAssignmentMessage = "Sure you want to Re-Assign?",
    WorkFlowReAssignmentSuccessMessage = "Successfully assigned. Please take print.",
    WorkFlowReAssignmentCancelMessage = "Reassignment is cancelled",
    WorkFlowReAssignmentVerifyMessage = "Selected user doesn't have access in ",
    WorkFlowReAssignmentNoDocsMessage = "There are no pending documents for this user ",
    WorkFlowRetainMessage = "Workflow is Successfully retained.",
    WorkFlowRetainConfirmationMessage = "Please click Ok to confirm that reassigned workflow structure will not be retain",
    WorkFlowRetainCancelMessage = "Changes are cancelled",
    RetentionSupplierIdValidation = "Select Retention Supplier Id",
    RetentionTypeIdValidation = "Select Retention Type",
    SuppliersubcodeIdValidation = "Please select Supplier sub code",
    ExpenseTypeValidationMessage = "Expense Type associated with Project Contract Master cannot be deleted.",
    PaymentUpdated = "Payments has been updated",
    PaymentExcelIncorrect = "Payment excel file has incorrect data.",
    CustomerExcelIncorrect = "Customer excel file has incorrect data.",
    RetentionLessThan = "Retention Release amount should not exceed Retention Sum",
    RetentionGreaterThan = "Retention Release amount should be greater than or equal to Prev. Released Amount",
    VOHasPendingDocuments = "New Variation order cannot be created as there is Pending Variation Order created for Approval.",
    PaymentsHasPendingDocuments = "New Payment cannot be created as there is Pending Payment / Variation Order created for Approval.",
    DuplicateSupplierInvoiceNumber = "Supplier Invoice Number already Exists",
    DuplicateSupplierCreditNoteNumber = "Supplier Credit Note Number already Exists",
    SchedulerAssociatedValidation = "Scheduler Number associated with Credit Note cannot be deleted",
    DiscardWarning = "The document has been modified, your changes will be discarded. Do you want to proceed?",
    DeleteSchedulerExisted = "Scheduler No assigned to Invoice or Credit Note.",
    InActiveOK = "Scheduler Number deactivated",
    ActiveOK = "Scheduler Number activated",
    MasterProcessInActiveOK = " deactivated",
    MasterProcessActiveOK = " activated",
    DocumentSentCustomer = "Document Sent To Customer"
  }

export enum JobStatus {
    New = 1,
    EngineerAssigned = 2,
    InProgress = 3,
    Completed = 4,
    Billed = 5,
    Closed = 6,
    Hold = 7,
    PendingAcceptance = 8,
    Accepted = 9,
    NotAccepted = 10
}

export enum MessageTypes {
    Error = "Error", Success = "Success", NoChange = "NoChange"
}

export enum WorkFlowStatus {
    Initiated = 1,
    AskedForClarification = 2,
    WaitingForApproval = 3,
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
    Terminated = 23,
    CancelDraft = 24,
    PartiallyPaid = 25,
    FullyPaid = 26,
    SendForApproval = 27
}
export class WorkFlowStatusModel {
    WorkFlowStatusid: number;
    Statustext: string;
}
export class Shared {
    LocationId?: number;
    ItemMasterId?: number;
    LocationItemId?: number;
    ItemQuantity?: number;
}
export class PagerConfig {
    RecordsToFetch: number;
    RecordsToSkip: number;
    TotalRecords: number;
    SortingOrder: string;
    SortingExpr: string;
}
export class Currency {
    Id: number;
    Name: string;
    Code: string;
    Symbol: string;
}
export class Attachments {
    AttachmentId: number;
    AttachmentTypeId: number;
    FileName: string;
    RecordId: number;
    IsDelete?: boolean;
}
export class QuotationAttachment {
    QuotationAttachmentId: number;
    PurchaseOrderRequestId: number;
    QuotationId: number;
    FileName: string;
    RowId: number;
    IsDelete?: boolean;
}


export class GridDisplayInput {
    Skip: number;
    Take: number;

}
export class PaymentTerms {
    PaymentTermsId: number;
    Code: string;
    Description: string;
    NoOfDays: number;
    Isdeleted: boolean;
    CompanyId: number;
}
export class Companies {
    CompanyId: number;
    CompanyName: string;
    SupplierVerifier: number;
    IsSelected: number;
    RoleID: number;
}

export class Engineers {
    UserId: number;
    Name: string;
}

export class DashboardData {
    CompanyID: number;
    Reservations: number;
    Services: number;
    Billing: number;
    Cleaning: number;
    Maintanance: number;
    Properties: number;
}
export class DashboardCount {
    PurchaseOrder: number;
    ExpensesPurchaseOrder: number;
    FixedAssetPurchaseOrder: number;
    ContractPurchaseOrder: number;
    GoodsReceivedNote: number;
    Invoice: number;
}

export class SupplierCategory {
    SupplierCategoryID: number;
    CategoryText: string;
    Description: string;
    CreatedBy: number;
}
export class ServiceCategory {
    ServiceCategoryId: number;
    CategoryName: string;
    CategoryDescription: string;
}
export class Taxes {
    TaxId: number;
    TaxName: string;
    TaxClass: string
    TaxAmount: number;
}

export class TaxGroup {
    TaxGroupId: number;
    TaxGroupName: string;
}

export class UserDetails {
    UserID: number;
    RoleID: number;
    UserName: string;
    Password: string;
    UserRole: string;
    RoleName: string;
    BranchId: number;
    Roles: UserRoles[];
    isADUser: boolean;
    FullName:string;
}

export class SuppliersData {
    SupplierId: number;
    SupplierTypeID: number;
    SupplierName: string;
    BillingAddress1: string;
    BillingAddress2: string;
    BillingFax: string;
    SupplierEmail?: string;
}

export class Notifications {
    NotificationId: number;
    NotificationType: string;
    NotificationMessage: string;
    ProcessId: number;
    ProcessName: string;
    CompanyName: string;
    UserId: number;
    IsRead: boolean;
    CreatedDate: Date;
    UpdatedDate: Date;
    IsNew: boolean;
    CompanyId: number;
    IsforAll: boolean;
    MessageType: number;
    DocumentId: number;
    DocumentCode: string;
    ProfileImage: any;
}

export class PaymentType {
    PaymentTypeId: number;
    Name: string;
}


export enum WorkFlowProcess {
    InventoryPO = 1,
    FixedAssetPO = 2,
    ProjectPo = 4,
    ContractPOFixed = 5,
    ContractPOVariable = 6,
    InventoryPurchaseRequest = 7,
    AssetPurchaseRequest = 8,
    SalesOrder = 9,
    Ticket = 10,
    AssetTransfer = 11,
    AssetDisposal = 12,
    Supplier = 13,
    ExpensePurchaseRequest = 14,
    ExpensePO = 15,
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


export enum NotificationMessageTypes {
    Requested = 1,
    Approved = 2,
    Rejected = 3,
    AskedForClarification = 4,
    SentMessage = 5,
    Void = 6
}

export enum PurchaseOrderType {
    InventoryPo = 1,
    FixedAssetPo = 2,
    ExpensePo = 3,
    ProjectPo = 4,
    ContractPoFixed = 5,
    ContractPoVariable = 6
}

export enum ItemType {
    Services = 1,
    Expenses = 2,
    Insurance = 3,
    Item = 4,
    Asset = 5
}

export class Priority {
    PriorityId: number;
    PriorityName: string;
}

export class UserProfile {
    UserID: number;
    FirstName: string;
    UserName: string;
}


export class EngineerList {
    EngineerId: number;
    EngineerName: string;
}

export class WorkFlowApproval {
    DocumentId: number;
    ProcessId: number;
    WorkFlowStatusId: number;
    UserId: number;
    Remarks: string;
    RequestUserId?: number;
    DocumentCode: string;
    CompanyId: number;
    ApproverUserId?: number;
    IsReApproval?: boolean;
    InvoiceTypeId?: number;
    ParentSupplierId?: number;
    ReferenceDocumentId?: number;
    ReferenceProcessId?: number;
}

export class GRNS {
    GoodsReceivedNoteId: number;
    SupplierDoNumber: string;
    PurchaseOrderId: number;
    POTypeId: number;
    GRNCode: string;
}

export class ItemMasters {
    ItemMasterID: number;
    Name: string;
}

export enum SupplierCategoryType {
    Internal = 1,
    External = 2
}

export enum SubCodeOptions {
    YES = 1,
    NO = 0
}


export const ITEM_TYPE = [
    { 'Id': 1, 'Value': 'Item' },
    { 'Id': 2, 'Value': 'Service' }
];
export const ITEM_TYPEWPO = [
    { 'Id': 1, 'Value': 'Item' },
    { 'Id': 2, 'Value': 'Service' },
    { 'Id': 3, 'Value': 'Expense' }
];

export const ASSET_TYPE = [
    { 'Id': 1, 'Value': 'Asset' },
    { 'Id': 2, 'Value': 'Service' },
];

export const REQUEST_TYPES = [
    { 'Id': 1, 'Value': 'Item' },
    { 'Id': 2, 'Value': 'Service' },
    { 'Id': 3, 'Value': 'Asset' },
    { 'Id': 4, 'Value': 'Expenses' },
];


export class BillingFrequency {
    FrequencyId: number;
    FrequencyText: string;
}
export const Months = [
    { Id: 1, Value: 'January' },
    { Id: 2, Value: 'February' },
    { Id: 3, Value: 'March' },
    { Id: 4, Value: 'April' },
    { Id: 5, Value: 'May' },
    { Id: 6, Value: 'June' },
    { Id: 7, Value: 'July' },
    { Id: 8, Value: 'August' },
    { Id: 9, Value: 'September' },
    { Id: 10, Value: 'October' },
    { Id: 11, Value: 'November' },
    { Id: 12, Value: 'December' }
];

export class COAAccountType {
    AccountTypeId: number;
    AccountType: string;
}

export class JVACode {
    JVAId: number;
    JVANumber: number;
}

export class EmailSupplier {
    PurchaseOrderId: number;
    PurchaseOrderTypeId: number;
    CompanyId: number;
    SupplierContactPersonList: Array<SupplierContactPerson>;
    UserID: number;

}

export class UserRoles {
    RoleID: number;
    RoleName: string;
    IsSelected: boolean;
}

export class User {
    UserID: number;
    UserName: string;
}

export class BillingType {
    BillingTypeId: number;
    BillingType: number;
}
export class AssetSubCategory {
    AssetSubcategoryId: number;
    AssetSubcategory: string;
    AccountCode: string;
    AssetType: string;
    Description: string;
}
export class AssetSubCategoryDetails {
    AssetSubcategory: string;
    AccountCode: string;
    Type: string;
    Description: string;
}

export class VendorsConfig {
    RecordsToFetch: number;
    RecordsToSkip: number;
    TotalRecords: number;
    SortingOrder: string;
    SortingExpr: string;
}

export class Countries {
    Id: number;
    Name: string;
    Code: string;
}

export class Nationality {
    NationalityId: number;
    NationalityName: string;
}

export class AddressType {
    AddressTypeId: number;
    AddressTypeName: string;
}

export class UploadResult {
    UploadedRecords: number;
    FailedRecords: number;
    Message: string;
    FailLog: string[];
    TotalRecords: number;
    SuccesRecords: number;
}

export class ButtonPreferences {
    CancelDraft: boolean;
    SendForApproval: boolean;
    CancelApproval: boolean;
    Submit: boolean;
    Approve: boolean;
    Reject: boolean;
    SendForClarification: boolean;
    ReplyForClarification: boolean;
    Edit: boolean;
    Verify: boolean;
    ReVerify: boolean;
    Export: boolean;
    Print: boolean;
    constructor() {
        this.CancelDraft = false;
        this.SendForApproval = true;
        this.CancelApproval = false;
        this.Submit = false;
        this.Approve = false;
        this.Reject = false;
        this.SendForClarification = false;
        this.ReplyForClarification = false;
        this.Edit = false;
        this.Verify = false;
        this.ReVerify = false;
        this.Export = false;
        this.Print = false;
    };
}


export class DocumentExportData {
    Invoices: InvoiceSection[];
    InvoiceDetails: InvoiceDetailsSection[];
    InvoicePaymentScheduleSections: InvoicePaymentScheduleSection[];
    InvoiceOptinalFieldsSections: InvoiceOptinalFieldsSection[];
    InvoiceDetailsOptinalFieldsSections: InvoiceDetailsOptinalFieldsSection[];
}

export class InvoiceSection {
    CNTBTCH: string;
    CNTITEM: string;
    IDVEND: string;
    IDINVC: string;
    TEXTTRX: string;
    ORDRNBR: string;
    PONBR: string;
    INVCDESC: string;
    INVCAPPLTO: string;
    IDACCTSET: string;
    DATEINVC: string;
    FISCYR: string;
    FISCPER: string;
    CODECURN: string;
    EXCHRATE: string;
    TERMCODE: string;
    DATEDUE: string;
    CODETAXGRP: string;
    TAXCLASS1: string;
    BASETAX1: string;
    AMTTAX1: string;
    AMTTAXDIST: string;
    AMTINVCTOT: string;
    AMTTOTDIST: string;
    AMTGROSDST: string;
    AMTDUE: string;
    AMTTAXTOT: string;
    AMTGROSTOT: string;
}
export class InvoiceDetailsSection {
    CNTBTCH: string;
    CNTITEM: string;
    CNTLINE: string;
    IDDIST: string;
    TEXTDESC: string;
    AMTTOTTAX: string;
    BASETAX1: string;
    TAXCLASS1: string;
    RATETAX1: string;
    AMTTAX1: string;
    IDGLACCT: string;
    AMTDIST: string;
    COMMENT: string;
    SWIBT: string;
}
export class InvoicePaymentScheduleSection {
    CNTBTCH: string;
    CNTITEM: string;
    CNTPAYM: string;
    DATEDUE: string;
    AMTDUE: string;
}
export class InvoiceOptinalFieldsSection {
    CNTBTCH: string;
    CNTITEM: string;
    OPTFIELD: string;
    VALUE: string;
    TYPE: string;
    LENGTH: string;
    DECIMALS: string;
    ALLOWNULL: string;
    VALIDATE: string;
    VALINDEX: string;
    VALIFTEXT: string;
    VALIFMONEY: string;
    VALIFNUM: string;
    VALIFLONG: string;
    VALIFBOOL: string;
    VALIFDATE: string;
    VALIFTIME: string;
    FDESC: string;
    VDESC: string;
}
export class InvoiceDetailsOptinalFieldsSection {
    CNTBTCH: string;
    CNTITEM: string;
    CNTLINE: string;
    OPTFIELD: string;
    VALUE: string;
    TYPE: string;
    LENGTH: string;
    DECIMALS: string;
    ALLOWNULL: string;
    VALIDATE: string;
    VALINDEX: string;
    VALIFTEXT: string;
    VALIFMONEY: string;
    VALIFNUM: string;
    VALIFLONG: string;
    VALIFBOOL: string;
    VALIFDATE: string;
    VALIFTIME: string;
    FDESC: string;
    VDESC: string;
}

export class PTableColumn {
    field: string;
    header: string;
    width?: string;
    hide?: boolean;
}

export class TransactionType {
    TransactionTypeId: number;
    TransactionTypeName: string;
}

export class ApprovalDocumentInfo {
    WorkflowStatus: WorkFlowStatusModel;
    Attachments: Attachments[];
    ButtonPreferences: ButtonPreferences;
    WorkFlowComments: WorkflowAuditTrail;
    CreatedBy: User;
    UpdatedBy: User;
    CurrentApprover: User;
    Reason: string;
}