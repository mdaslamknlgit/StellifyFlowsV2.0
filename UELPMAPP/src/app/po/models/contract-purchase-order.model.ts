import { Supplier } from "./supplier";
import { Attachments, Suppliers } from "../../shared/models/shared.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { SupplierSubCode } from './supplier';
import { AccountCode } from "./account-code.model";
export class ContractPurchaseOrder {
    CPOID: number;
    CPONumber: string;
    CompanyId: number;
    LocationID: number;
    Location: string;
    Supplierid: number;
    RequestedBy: number;
    TaxId: number;
    OtherCharges: number;
    TotalAmount: number;
    POTypeId: number;
    ContractName: string;
    BillingFrequencyId: number;
    BillingFrequency: string;
    StartDate: Date;
    EndDate: Date;
    TotalContractSum: number;
    TenureAmount: number;
    IsFixed: boolean;
    CurrencyId: number;
    CurrencySymbol: string;
    Remarks: string;
    CPORemarks: string;
    Instructions: string;
    CreatedBy: number;
    CreatedDate: Date;
    UpdatedBy: number;
    Tolerance: number;
    Discount: number;
    IsMasterPO: boolean;
    WorkFlowStatusId: number;
    WorkFlowStatusText: string;
    Attachments: Array<Attachments>;
    Provider: Suppliers;
    Supplier: Suppliers;
    SupplierAddress: string;
    ContractPurchaseOrderItems: Array<ContractPurchaseOrderItems>;
    PurchaseOrderItemsToDelete: Array<number>;
    ContractSignedDate: Date;
    SubTotal: number;
    TotalTax: number;
    PODate: Date;
    WorkFlowComments: Array<WorkflowAuditTrail>;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    RequestedByUserName: string;
    Designation: string;
    PurchaseOrderStatusText: string;
    ReasonstoVoid: string;
    PurchaseOrderStatusId: number;
    IsDocumentApproved: boolean;
    DraftCode: string;
    ReasonsToReject: string;
    AccruetheExpense: boolean;
    SplitByMonthly: boolean;
    MasterCPOID: number;
    Margin: number;
    ServiceType: number;
    CompanyName: string;
    ServiceName: string;
    AccrualCode: string;
    SupplierSubCodeId: number;
    SupplierSubCode: SupplierSubCode;
    ContractID: string;
    ContractTerms: string;
    TotalContractPeriod?: number;
    TenureToDisplay: string;
    AccountCodeName: string;
    TotalCount: number;
    CPONo: string;
    TaxAmount: number;
    CPOJVACode: string;
    TaxGroupName: string;
    Description: string;
    TaxGroupId: number;
    CurrencyCode: string;
}

export class ContractPurchaseOrderItems {
    CPOID: number;
    CPOItemid: number;
    Description: string;
    CPONumber: string;
    AccountCodeCategoryId: number;
    // ExpenseCategoryId:number;
    Expense: AccountCode;
    ExpenseCategory: string;
    Amount: number;
    SupplierAddress: string;
    PaymentValuation: number;
    IsModified: boolean;
    AccountCode: string;
    TotalTax: number;
    TaxAmount: number;
    TaxID: number;
    RateType: string;
    AccountType: string;
    AccountCodeName: string;
    WorkFlowStatusId: number;
    AccrualCode: string;
}
export class ContractPurchaseOrderGL {
    count: number;
    lCount: number;
    Amount: number;
    AccountCode: string;
    CPONumber: string;
    Description: string;
    RateType: string;
    CurrencyCode: string;
    Supplier: Suppliers;
    ServiceName: string;
}
export class ContractPurchaseOrderAccure {
    CPOID: number;
    WorkFlowStatusId: number;
}

export class ContractPoDisplayResult {
    PurchaseOrders: Array<ContractPurchaseOrder>;
    TotalRecords: number;
}

