import { Locations } from "../../inventory/models/item-master.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { Supplier, SupplierSubCode } from "./supplier";
import { Companies } from "../../shared/models/shared.model";
import { AccountCode } from "./account-code.model";
import { Attachments } from "../../shared/models/shared.model";
import { PTableColumn } from "./project-payment-history.model";

export class ProjectContractVariationOrder {
    ProjectContractVariationOrderId: number;
    ProjectMasterContractId: number;
    POVariationOrderCode: string;
    POPMasterCode: string;
    DraftCode: string;
    WorkFlowStatusId: number;
    CompanyId: number;
    Attachments: Array<Attachments>;
    ApprovalRemarks: string;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    SubTotal: number;
    TotalAmount: number;
    IsDeleted: boolean;
    ProjectMasterContract: ProjectMasterContract;
    ProjectContractVariationOrderItems: Array<ProjectContractVariationOrderItems>;
    ProjectMasterContractItems: Array<ProjectMasterContractItems>;
    Action: string;
    CreatedBy: number;
    LocationId: number;
    TotalBefTax: number;
    POPId: number;
    VOSum: number;
    UpdatedBy: number;
    DocumentCode: string;
    Status: string;
    IsVerifier: boolean;
    WorkFlowComments: Array<WorkflowAuditTrail>;
}

export class ProjectContractVariationOrderItems {
    ProjectContractVariationOrderItemId: number;
    ProjectContractVariationOrderId: number;
    ProjectMasterContractItemId: number;
    ItemDescription: string;
    AccountCodeId: number;
    AccountCodeName: string;
    AccountCode: string;
    POPCostCategoryId: number;
    TypeOfCostName: string;
    POPApportionmentId: number;
    ApportionmentMethod: string;
    ContractValue: number;
    TotalVOSum: number;
    RevisedContractValue: number;
    Discount: number;
    TaxID: number;
    TaxGroupId: number;
    Expense: AccountCode;
}

export class ProjectContractVariationOrderFilterModel {
    ProjectName?: string;
    WorkFlowStatusId?: number;
    public DocumentCode?: string;
    constructor() {
        this.WorkFlowStatusId = 0;
        this.ProjectName = "";
        this.DocumentCode = "";
    }
}

export class ProjectContractVariationOrderDisplayResult {
    ProjectContractVariationOrderList: Array<ProjectContractVariationOrder>;
    TotalRecords: number;
}
export class VariationOrder {
    POPId: number;
    VOId: number;
    POPDocumentCode: string;
    VODocumentCode: string;
    RevisedContractTotal: number;
    SupplierName: string;
    OriginalContractSum: number;
    TotalVOSum: number;
    Status: string;
    CreatedDate: string;
    VOSum:string;
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


export const VOColumns: PTableColumn[] = [
    { field: 'Sno', header: 'S.no.' },
    { field: 'POPDocumentCode', header: 'POP Code' },
    { field: 'PaymentDocumentCode', header: 'VO Code' },
    { field: 'SupplierName', header: 'Supplier Name' },
    { field: 'CreatedDate', header: 'Created Date' },
    { field: 'OriginalContractSum', header: 'Original Contract Value' },
    { field: 'VOSum', header: 'Current VO Sum' },
    { field: 'TotalVOSum', header: 'Total VO Sum' },
    { field: 'RevisedContractTotal', header: 'Revised Contract Value' },
    { field: 'Status', header: 'Status' },
    { field: 'Options', header: 'Options' }
];