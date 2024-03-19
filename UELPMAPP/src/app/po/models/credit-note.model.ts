import { Supplier } from "./supplier";
import { Attachments, ButtonPreferences, GridDisplayInput } from "../../shared/models/shared.model";
import { InvoiceItems } from "./supplier-invoice.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { AccountCodeMaster } from "./account-code.model";

export class CreditNote {
    CreditNoteId: number;
    CompanyId: number;
    InvoiceId: number;
    SupplierId: number;
    SubCodeId: number;
    DocumentCode: string;
    SubTotal: number;
    Total: number;
    Reasons: string;
    CreditNoteLineItems: Array<CreditNoteLineItems>
    GetItemMasters: Array<GetItemMasters>
    GetServiceMasters: Array<AccountCodeMaster>
    InvoiceCode: string
    CreditNoteItemsToDelete: Array<number>;
    Attachments: Array<Attachments>;
    WorkFlowStatusId: number;
    WorkFlowComments: WorkflowAuditTrail[];
    WorkFlowStatus: string
    SupplierCreditNoteDate: Date = null;
    SupplierCreditNoteNo: string;
    SupplierCreditNoteInvoiceNo: string
    InvoiceOSAmount: number;
    InvoiceTotalAmount: number;
    CurrentApproverUserId: number;
    Discount: number;
    Adjustment: number;
    CreatedBy: number;
    CreatedDate: Date
    UpdatedBy: number;
    UpdatedDate: Date;
    LocationID: number;
    Name: string
    CRNType: string
    GSTAdjustment: number
    Supplier: Supplier;
    TotalAdjustment: number
    SubItemGSTAdjustment: number
    NetTotal: number
    CreditNoteTotal: number
    ReasonsToVoid: string
    /*For Temporary Purpose*/
    CreditNoteCode: String
    RequestedByUserName: string
    CurrencySymbol: string
    InvoiceTotal: number;
    OutStandingAmount: number;
    RoundAdjustment: number;
    Code: string
    SupplierCode: string;
    TotalGSTAmount: number
    SubTotalDiscount: number
    SchedulerNo: string
    CanVoid: boolean;
    SupplierType: number
    SupplierAddress: string
    SupplierCreditNoteInvoiceDate: Date
    CurrencyType: number
    CreationDate: Date
    CreditNoteRequestor: string
    TaxGroupName: string
    TotalbefTax: number
    TaxGroupId: number
    ButtonPreferences: ButtonPreferences = new ButtonPreferences();
    Action: string;
}
export class CreditNoteLineItems {
    Id: number;
    CNId: number;
    ItemQty: number;
    Unitprice: number;
    TaxID: number;
    TaxGroupId: number;
    GSTAmount: number;
    GSTAdjustment: number;
    ReturnQty: number;
    DecreaseInUnitPrice: number;
    ReturnValue: number;
    CNTotalValue: number;
    UpdatedQty: number;
    UpdatedPrice: number;
    UpdatedBy: number;
    UpdatedDate: Date;
    ItemDescription: string;
    TaxAmount: number;
    Tax: number;
    CNDetailsId: number;
    Discount: number;
    TypeId: number;
    Item: string;
    ItemName: string;
    ItemMasterId: number;
    AccountCodeCategoryId: number;
    AccountCodeName: string;
    CPONumber: string;
    Code: string;
    POTypeId: number;
    ItemType: string;
    GlDescription: string;
    IsDeleted: boolean;
    OriginalUnitprice: number;
    OriginaltemQty: number;
    OriginalDiscount: number;
}
export class CreditNotesDisplayResult {
    CreditNotes: Array<CreditNote>;
    TotalRecords: number;
}

export class CreditNoteFilterDisplayInput extends GridDisplayInput {
    CreditNoteCodeFilter: string;
    SupplierNameFilter: string;
    InvoiceCodeFilter: string;
    CompanyId: number;
}

export class GetItemMasters {
    ItemMasterId: number;
    ItemName: string;
    Description: string;
}
export class PTableCreditNoteColumn {
    field: string;
    header: string;
    width?: string;
}
export const CreditNotePaymentColumns: PTableCreditNoteColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'DocumentCode', header: 'Document Code', width: '105px' },
    { field: 'InvoiceDocumentCode', header: 'Invoice No', width: '100px' },
    { field: 'SupplierName', header: 'Supplier Name', width: '190px' },
    { field: 'SupplierCreditNoteInvoiceNo', header: "Supplier's Invoice No", width: '140px' },
    { field: 'SupplierCreditNoteNo', header: 'Supplier Credit Note No', width: '140px' },
    { field: 'InvoiceTotalAmount', header: 'Invoice Total', width: '130px' },
    // { field: 'Invoice OS Amount', header: 'Invoice OS Amount', width: '120px' },
    { field: 'CreditNoteTotal', header: 'Credit Note Total', width: '130px' },
    { field: 'CreatedDate', header: 'Created On', width: '120px' },
    { field: 'WorkFlowStatus', header: 'Status', width: '120px' },
    { field: '', header: 'Action', width: '40px' }
];