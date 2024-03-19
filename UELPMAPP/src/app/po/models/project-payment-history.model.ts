import { Locations } from "../../inventory/models/item-master.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { Supplier, SupplierSubCode } from "./supplier";
import { Companies } from "../../shared/models/shared.model";
import { AccountCode } from "./account-code.model";
import { Attachments } from "../../shared/models/shared.model";
import { POPApportionment, POPCostCategory, POPDistributionSummary } from "./project-contract-master.model";



export class ProjectPaymentHistory {
    PaymentContractId: number;
    POPId: number;
    CertificateNo: number;
    PaymentNo: string;
    DocumentCode: string;
    DateOfValuation: Date;
    DateOfCertification: Date;
    ProjectPaymentHistoryCode: string;
    CompanyId: number;
    LocationId: number;
    CreatedBy: number;
    UpdatedBy: number;
    WorkFlowStatusId: number;
    IsVerifier: boolean;
    StatusText: string;
    SubTotal: number;
    TotalBefTax: number;
    GrandTotal: number;
    SupplierAddress: string;
    DiscountLineItems: Array<DiscountLineItems>;
    Attachments: Array<Attachments>;
    TaxAmount: number;
    TotalTax: number;
    TotalAmount: number;
    TaxRate: number;
    // ProjectMasterContract: Array<ProjectMasterContract>;
    ProjectMasterContract: ProjectMasterContract;
    POPInterimCertificationItems: Array<POPInterimCertificationItems>;
    POPDistributionSummaryItems: Array<POPDistributionSummary>;
    PaymentInterimLineItems: Array<PaymentInterimLineItems>;
    ProjectMasterContractItems: Array<ProjectMasterContractItems>;
    SubTotalCurrentPayment: number;
    SubTotalAccPayment: number;
    PaymentSummary: any;
    Action: string;
    Certificate: ProjectPaymentItems;
    PreviousCertificate: ProjectPaymentItems;
    ReasonsToReject: string;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    SupplierInvoiceNumber: string;
    DateOfDocument: Date;
    WorkFlowComments: Array<WorkflowAuditTrail>;
    ReasonsToCancel: string[];
    PreviousRetentionSum: number;
    PreviousPaymentContractId: number;
    CanVoidable: boolean;
    PaymentDescription: string;
    CMTotalVOSum: number;
    CMAdjustedContractSum: number;
    CMRetentionMaxLimit: number;
}
export class PaymentInterimLineItems {
    ProjectPaymentContractItemId: number;
    POPId: number;
    PaymentContractId: number;
    ProjectMasterContractItemId: number;
    PrevAccumulatedAmount: number;
    CurrentPayment: number;
    AccumulatedPayment: number;
    OverallStatus: number;
    CreatedBy: number;
    CreatedDate: Date;
    IsModified: boolean;


}

export class PaymentDistributionSummary {
    public PaymentDisturbutionSummaryId?: number;
    public DisturbutionSummaryId?: number;
    public PaymentContractId?: number;
    public DistributionPercentage?: number;
    public ContractAmount?: number;
    public ThisCertification?: number;
    public RetentionAmount?: number;
    public RetentionCode?: string;
    public Locations?: Locations;
    public LocationID?: number;
    public LocationName?: string;
    public DepartmentId?: number;
    public IsModified?: boolean;
    public PayContractAmount?: number;

}

export class POPInterimCertificationItems {

    ProjectPaymentContractItemId: number;
    POPId: number;
    PaymentContractId: number;
    ProjectMasterContractItemId: number;
    // ItemDescription: string;
    // AccountCodeId: number;
    // AccountCode: string;
    // AccountCodeName: string;
    // TypeOfCost: number;
    // ApportionmentId: number;
    // ContractValue: number;
    PrevAccumulatedAmount: number;
    CurrentPayment: number;
    AccumulatedPayment: number;
    OverallStatus: number;
    CreatedBy: number;
    CreatedDate: Date;
    // Expense: AccountCode;
    // IsModified: boolean;
    // AccountCodeCategoryId: number;
    // ItemTypeId: number;
    // TypeOfCostName: string;
    // ApportionmentMethod: string;
    Status: number;

}

export class ProjectMasterContract {
    ProjectMasterContractId: number;
    POPMasterCode: string;
    CompanyId: number;
    DraftCode: string;
    GL_Cost: string;
    ExpensesTypeId: number;
    ExpensesType: string;
    AccountType: string;
    IsRetentionApplicable: boolean;
    RetentionMaxLimit: number;
    RetentionPercentage: number;
    Supplier: Supplier;
    ContractStartDate: Date;
    ContractEndDate: Date;
    OriginalContractSum: number;
    TotalVOSum: number;
    AdjustedContractSum: number;
    RetentionSupplierCode: string;
    ServiceTypeId: number;
    ServiceType: string;
    TaxAuthorityId: number;
    TaxGroupName: string;
    TaxId: number;
    TaxName: string;
    Remarks: string;
    CreatedBy: number;
    CreatedDate: Date;
    WorkFlowStatusId: number;
    WorkFlowStatus: string;
    DepartmentId: number;
    ProjectMasterContractItems: Array<ProjectMasterContractItems>;
    ProjectMasterContractItemsToDelete: Array<number>;
    ProjectMasterDiscountItemsToDelete: Array<number>;
    POPCostCategoryToDelete: Array<number>;
    POPApportionmentToDelete: Array<number>;
    POPDistributionSummaryToDelete: Array<number>;
    ProjectName: string;
    Departments: Array<Locations>;
    DepartmentsToDelete: Array<number>;
    RequestedByUserName: string;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    ApprovalRemarks: string;
    WorkFlowComments: Array<WorkflowAuditTrail>;
    LocationId: number;
    Location: string;
    ContractTerms: string;
    CertificateNumber: number;
    SupplierSubCodeId: number;
    SupplierSubCode: SupplierSubCode;
    SubCodeDescription: string;
    PreviousCommercialDiscount: number;
    RetionSumCaluculated: number;
    PreviousRetentionAccumulatedSum: number;
    NetRetention: number;
    PreviousCertifiedContractSum: number;
    PreviousCertifiedGST: number;
    PreviousCertifiedGSTAdjustment: number;
    RetentionSumForThismonth: number;
    PaymentTotal: number;
    CurrentCertificationAmount: number;
    PreviousMonthReleaseRetentionSum: number;
    CurrentNettRetention: number;
    VariationOrderCount: number;
    RequestedBy: number;
    TaxGroupId: number;
    SubTotal: number;
    TotalBefTax: number;
    GrandTotal: number;
    DiscountLineItems: Array<DiscountLineItems>;
    TaxAmount: number;
    TotalTax: number;
    TotalAmount: number;
    TaxRate: number;
    Attachments: Array<Attachments>;
    ReasonsToReject: string;
    IsVerify: boolean;
    RetentionSupplierCodeName: string;
    CurrencySymbol: string;
}

export class DiscountLineItems {
    ProjectMasterContractId: number;
    ProjectMasterContractItemId: number;
    ItemId: number;
    DisItemDescription: string;
    DisAccountCodeId: number;
    AccountCode: string;
    AccountCodeName: string;
    TypeOfCost: number;
    ApportionmentId: number;
    DiscountValue: number;
    PrevAccumulatedAmount: number;
    CurrentPayment: number;
    AccumulatedPayment: number;
    OverallStatus: number;
    CreatedBy: number;
    CreatedDate: Date;
    Expense: AccountCode;
    IsModified: boolean;
    AccountCodeCategoryId: number;
    DisTypeOfCostName: string;
    DisApportionmentMethod: string;
    AccountCodeId: number;
}


export class ProjectMasterContractItems {
    ProjectMasterContractId: number;
    ProjectMasterContractItemId: number;
    ItemId: number;
    ItemDescription: string;
    AccountCodeId: number;
    AccountCode: string;
    AccountCodeName: string;
    TypeOfCost: number;
    ApportionmentId: number;
    ContractValue: number;
    PrevAccumulatedAmount: number;
    CurrentPayment: number;
    AccumulatedPayment: number;
    OverallStatus: number;
    CreatedBy: number;
    CreatedDate: Date;
    Expense: AccountCode;
    IsModified: boolean;
    AccountCodeCategoryId: number;
    ItemTypeId: number;
    TypeOfCostName: string;
    ApportionmentMethod: string;
}
export class ProjectContractMasterFilterModel {
    public DocumentCode?: string;
    public WorkFlowStatusId?: number;
    public FromDate?: Date;
    public ToDate?: Date;
    public Supplier?: Supplier;
    public SupplierName?: string;
    constructor() {
        this.WorkFlowStatusId = 0;
        this.DocumentCode = "";
        this.FromDate = null;
        this.ToDate = null;
    }
}

export class ProjectPaymentItems {
    ProjectPaymentItemId: number;
    POPId: number;
    PaymentContractId: number;
    TotalValueOfWorkDone: number;
    RetentionSumCalculated: number;
    RetentionSumPreviouslyReleased: number;
    RetentionSumBalBeforeCurrentRelease: number;
    RetentionSumReleaseInTheMonth: number;
    NettRetention: number;
    ContractSumPreviouslyCertifiedToDate: number;
    AmountDueUnderThisCerificate: number;
    GST: number;
    GSTAdjustment: number;
    GrandTotal: number;
    CPTotalValueOfWorkDone: number;
    CPRetentionSumCalculated: number;
    CPRetentionSumReleaseInTheMonth: number;
    CPNettRetention: number;
    CPAmountDueUnderThisCerificate: number;
    CPGST: number;
    CPGSTAdjustment: number;
    CPGrandTotal: number;
    Retentions: ProjectPaymentRetentions[];
    CreatedBy: number;
    CreatedDate: string;
    UpdatedBy: number;
    UpdatedDate: string;
}
export class ProjectPaymentRetentions {
    ProjectPaymentRetentionId: number;
    ProjectPaymentItemId: number;
    PaymentContractId: number;
    RetentionPercentage: number;
    RetentionAmount: number;
    RetentionSum: number;
    IsRetention: boolean;
}

export class PTableColumn {
    field: string;
    header: string;
    width?: string;
}
export class ProjectPayment {
    POPId: number;
    PaymentContractId: number;
    POPDocumentCode: string;
    PaymentDocumentCode: string;
    SupplierInvoiceNumber: string;
    SupplierName: string;
    CertificateNo: number;
    OriginalContractSum: number;
    TotalVOSum: number;
    GrandTotal: number;
    CPGrandTotal: number;
    Status: number;
}

export class ReportParams {
    UserId?: number;
    Type: string;
    DocumentsData: DocumentData[];
}
export class DocumentData {
    POPId: number;
    PaymentContractId: number;
}

export class ProjectPaymentExport {
    TypeOfCostLineItems: TypeOfCostLineItem[];
    CostCategories: POPCostCategory[];
    Apportionments: POPApportionment[];
    MasterDocumentCode: string;
}
export class TypeOfCostLineItem {
    SupplierId: string;
    RetentionSupplierId: string;
    PaymentSupplierId: string;
    SupplierShortName: string;
    SupplierInvoiceDate: string;
    DocumentDescription: string;
    DocumentCurrency: string;
    IsRetentionApplicable: boolean;
    PaymentTerm: string;
    InvoiceDescription: string;
    ExpiryYear: number;
    ExportMonth: number;
    LineItems: PaymentLineItem[];
    DiscountItems: PaymentLineItem[];
    STContractValue: number;
    STPrevAccPayment: number;
    STCurrentPayment: number;
    STAccPayment: number;
    STStatus: number;
    TBTContractValue: number;
    TBTPrevAccPayment: number;
    TBTCurrentPayment: number;
    TBTAccPayment: number;
    TBTStatus: number;
    AppPerForRetContractValue: number;
    AppPerForRetPrevAccPayment: number;
    AppPerForRetCurrentPayment: number;
    AppPerForRetAccPayment: number;
    NRPrevAccPayment: number;
    NRCurrentPayment: number;
    NRAccPayment: number;
    ADUCPrevAccPayment: number;
    ADUCCurrentPayment: number;
    ADUCAccPayment: number;
    GSTAMountPrevAccPayment: number;
    GSTAMountCurrentPayment: number;
    GSTAMountAccPayment: number;
    GSTAdjustmentPrevAccPayment: number;
    GSTAdjustmentCurrentPayment: number;
    GSTAdjustmentAccPayment: number;
    TotalPrevAccPayment: number;
    TotalCurrentPayment: number;
    TotalAccPayment: number;
    AccountSetId: string;
    RetentionAccountSetId: string;
    TaxGroup: string;
    RetTaxGroup: string;
    TaxClass: string;
    RetTaxClass: string;
    InvoiceAmountBeforeGST: number;
    GSTTaxAmount: number;
    GrossAmount: number;
    ApportionmentMethod: string;
    SupplierInvoiceNo: string;
    Suffix: string;
    TypeOfCost: string;
    ItemDescription: string;
    RateTax: number;
    TaxAmount: number;
    TaxType: string;
    GLCost: string;
    GLRet: string;
    GLAccount: string;
    PaymentDocumentCode: string;
    ExpInvoiceDescription: string;
    InvoiceDueDate: string;
}

export class PaymentLineItem {
    LineItemDescription: string;
    ApportionmentMethod: string;
    ContractValue: number;
    PrevAccPayment: number;
    CurrentPayment: number;
    AccPayment: number;
    Status: number;
}

export const ProjectPOInterimColumns: PTableColumn[] = [
    { field: 'Sno', header: 'S.no.' },
    { field: 'ItemDescription', header: 'Description' },
    // { field: 'AccountCodeName', header: 'Expense Category' },
    // { field: 'AccountCode', header: 'Acccount Code' },
    // { field: 'POPCostCategoryId', header: 'Type of Cost' },
    { field: 'POPApportionmentId', header: 'Apportionment Method' },
    { field: 'ContractValue', header: 'Contract Value' },
    { field: 'PrevAccumulatedAmount', header: 'Previous Accumulated Payment' },
    { field: 'CurrentPayment', header: 'Current Payment' },
    { field: 'AccumulatedPayment', header: 'Accumulated Payment' },
    { field: 'Status', header: 'Status' }
];

export const POPDistributionSummaryColumns: PTableColumn[] = [
    { field: 'Sno', header: 'S.no.', width: "5%", },
    { field: 'DepartmentId', header: 'Department', width: "20%" },
    { field: 'DistributionPercentage', header: 'Distribution%', width: "20%" },
    { field: 'PayContractAmount', header: 'Contract Amount', width: "20%" },
    { field: 'ThisCertification', header: 'This Certification', width: "15%" },
    { field: 'RetentionAmount', header: 'Retention Amount', width: "20%" },
];

export const PMCGridColumns: PTableColumn[] = [
    { field: 'SNo', header: 'S.No' },
    { field: 'POPMasterCode', header: 'POP Master Code' },
    { field: 'ContractName', header: 'Contract Name' },
    { field: 'SupplierName', header: 'Supplier Name' },
    { field: 'ContractStartDate', header: 'Start Date' },
    { field: 'ContractEndDate', header: 'End Date' },
    { field: 'OriginalContractSum', header: 'Original Contract Sum' },
    { field: 'TotalVOSum', header: 'Total VO Sum' },
    { field: 'AdjustedContractSum', header: 'Adjusted Contract Sum' }
];

export const PaymentColumns: PTableColumn[] = [
    { field: 'Sno', header: 'S.no.' },
    { field: 'POPDocumentCode', header: 'POP Document Code' },
    { field: 'PaymentDocumentCode', header: 'Invoice Document Code' },
    { field: 'SupplierName', header: 'SupplierName' },
    { field: 'SupplierInvoiceNumber', header: 'Invoice No.' },
    { field: 'CertificateNo', header: 'Certificate No.' },
    { field: 'GrandTotal', header: 'Grand Total' },
    { field: 'Status', header: 'Status' },
    { field: 'Options', header: 'Options' }
];

export const CMPaymentColumns: PTableColumn[] = [
    { field: 'PaymentDocumentCode', header: 'Invoice Document Code' },
    { field: 'SupplierInvoiceNumber', header: 'Invoice No.' },
    { field: 'CertificateNo', header: 'Certificate No.' },
    { field: 'CPGrandTotal', header: 'Payment Amount' },
    { field: 'Status', header: 'Status' }
];

export const CMVOColumns: PTableColumn[] = [
    { field: 'PaymentDocumentCode', header: 'VO Code' },
    { field: 'OriginalContractSum', header: 'Original Contract Value' },
    { field: 'TotalVOSum', header: 'Total VO Sum.' },
    { field: 'RevisedContractTotal', header: 'Revised Contract Value' },
    { field: 'Status', header: 'Status' }
];
export const PaymentDetailsColumns: PTableColumn[] = [
    { field: 'Sno', header: 'S.no.' },
    { field: 'BatchNo', header: 'Batch No.' },
    { field: 'ImportedByUserName', header: 'Imported User' },
    { field: 'ChequeNo', header: 'Cheque No.' },
    { field: 'ChequeDate', header: 'Cheque Date' },
    { field: 'PaymentAmount', header: 'Payment Amount' },
    { field: 'Remarks', header: 'Remarks' }
];

export const PaymentImportColumns : PTableColumn[] = [
    { field: 'Sno', header: 'S.no.' },
    { field: 'SupplierInvoice', header: 'Supplier Invoice' },
    { field: 'InvoiceDate', header: 'Invoice Date' },
    { field: 'ChequeNo', header: 'Cheque No.' },
    { field: 'ChequeDate', header: 'Cheque Date' },
    { field: 'SupplierId', header: 'Vendor Id' },
    { field: 'SupplierName', header: 'Supplier Name' },
    { field: 'PaymentAmount', header: 'Payment Amount' },
    { field: 'DocumentNo', header: 'Document No.' },
    { field: 'Status', header: 'Status' },
    { field: 'Remarks', header: 'Remarks' }
  ];


