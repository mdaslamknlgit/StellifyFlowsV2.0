import { Locations } from "../../inventory/models/item-master.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { Supplier, SupplierSubCode } from "./supplier";
import { Companies } from "../../shared/models/shared.model";
import { AccountCode } from "./account-code.model";
import { Attachments } from "../../shared/models/shared.model";


export class ProjectMasterContract {
    ProjectMasterContractId: number;
    POPMasterCode: string;
    VODocumentCode: string;
    VOId: number;
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
    SupplierAddress: string;
    ContractStartDate: Date;
    ContractEndDate: Date;
    OriginalContractSum: number;
    TotalVOSum: number;
    CMTotalVOSum: number;
    CMAdjustedContractSum: number;
    CMRetentionMaxLimit: number;
    SubTotalRevisedContractValue: number;
    AdjustedContractSum: number;
    RetentionSupplierCode: string;
    ServiceTypeId: number;
    ServiceType: string;
    ServiceName: string;
    TaxAuthorityId: number;
    TaxGroupName: string;
    TaxId: number;
    TaxName: string;
    Remarks: string;
    CreatedBy: number;
    UpdatedBy: number;
    CreatedDate: Date;
    WorkFlowStatusId: number;
    WorkFlowStatus: string;
    VOWorkFlowStatus: string;
    DepartmentId: number;
    ProjectMasterContractItems: Array<ProjectMasterContractItems>;
    ProjectMasterContractItemsToDelete: Array<number>;
    ProjectMasterDiscountItemsToDelete: Array<number>;
    POPCostCategory: Array<POPCostCategory>;
    POPCostCategoryToDelete: Array<number>;
    POPApportionment: Array<POPApportionment>;
    POPApportionmentToDelete: Array<number>;
    POPDistributionSummaryItems: Array<POPDistributionSummary>;
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
    ReasonsToVoid: string;
    IsVerify: boolean;
    RetentionSupplierCodeName: string;
    SupplierName: string;
    IsVerifier?: boolean;
    Action: string;
    RetentionTypeId: number;
    PurchaseOrderType: string;
    ContractDescription: string;
    VODescription: string;
    ReasonsToCancel: string[];
    CurrencyId: number;
    CurrencyCode: string;
    PaymentTermsId: number;
    PaymentTermCode: string;
    NoOfDays: number;
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
    VOSum: number;
    RevisedContractValue: number;
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
    PreviousVOSum: number;
    VOSum: number;
    RevisedContractValue: number;
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

export class POPCostCategory {
    POPCostCategoryId: number;
    POPId: number;
    TypeOfCostId: number;
    TypeOfCost: number;
    CostDescription: string;
    GL_Cost: string;
    GL_Cost_Description: string;
    GST_Group: number;
    GST_Class: number;
    GL_Retention: string;
    GL_Retention_Description: string;
    GL_GroupRetention: number;
    GL_ClassRetention: number;
    Prefix: string;
    GST_GroupName: string;
    GST_ClassName: string;
    GL_GroupRetentionName: string;
    GL_ClassRetentionName: string;
    IsModified: boolean;

    // RowIndex:[0]

}

export class POPApportionment {
    POPApportionmentId: number;
    POPId: number;
    Method: string;
    ApportionmentDetails: Array<ApportionmentDetails>;
    ApportionmentDetailsDeleted: Array<number>;
    Total: number;
    Remarks: string;
    IsModified: boolean;
}

export class ApportionmentDetails {
    TypeOfCost: string;
    RowIndex: number;
    Amount: number;
    POPCostCategoryId: number;
}

export class ProjectMasterContractDisplayResult {
    ProjectMasterContractList: Array<ProjectMasterContract>;
    TotalRecords: number;
}

export class CostTypes {
    CostTypeId: number;
    CostText: string;
    CostDescription: string;
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

export class POPDistributionSummary {
    public DisturbutionSummaryId: number;
    //public Company: Companies;
    public DistributionPercentage: number;
    public ContractAmount: number;
    public ThisCertification: number;
    public RetentionAmount: number;
    public RetentionCode: string;
    public Locations: Locations;
    public LocationID: number;
    public LocationName: string;
    public DepartmentId: number;
    public IsModified: boolean;
    PayContractAmount: any;
}


export class ProjectPaymentMasterFilterModel {
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