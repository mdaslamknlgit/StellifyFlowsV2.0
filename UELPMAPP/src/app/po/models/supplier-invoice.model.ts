import { Attachments, ItemMaster, Suppliers, GridDisplayInput, SupplierItemMaster } from "../../shared/models/shared.model";
import { AccountCodeMaster } from "./account-code.model";
import { GoodsReceivedNotes } from "./goods-received-notes.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { ContractPurchaseOrder, ContractPurchaseOrderItems } from "./contract-purchase-order.model";
import { PurchaseOrderList } from "./po-creation.model";
export class InvoiceDetails {
    map(arg0: (x: any) => { 'Member No': any; 'Member Name': any; 'Valid From': any; 'Valid To': any; 'Earned Points': any; 'Property': any; }): any {
        throw new Error("Method not implemented.");
    }
    RequestedBy: number;
    RequestedByUserName: string;
    Designation: string;
    LocationId: number;
    LocationName: string;
    PurchaseOrderId: string;
    PurchaseOrderCode: string;
    POTypeId: number;
    CurrencyId: number;
    CurrencyCode: string;
    CurrencySymbol: string;
    InvoiceId: number;
    CreatedBy: number;
    CreatedDate: Date;
    InvoiceItemsToDelete: Array<number>;
    InvoiceCode: string;
    SupplierAddress: string;
    InvoiceItems: Array<InvoiceItems>;
    Discount: number;
    TotalTax: number;
    ShippingCharges: number;
    OtherCharges: number;
    TotalAmount: number;
    OutStandingAmount: number;
    TaxId: number;
    TaxRate: number;
    Attachments: Attachments[];
    AttachmentsDelete: Array<number>;
    PaymentTermId: number;
    PaymentTerms: string;
    PaymentTermsCode?: string;
    DeliveryAddress: string;
    Supplier: Suppliers;
    SubTotal: number;
    SupplierTypeID: number;
    CompanyId: number;
    Adjustment: number;
    NetTotal: number;
    InvoiceDescription: string;
    GSTAdjustment: number;
    WorkFlowStatusId: number;
    WorkFlowStatus: string;
    InvoiceDate: Date;
    InvoiceDateString: string;
    DueDate: Date;
    DueDateString: string;
    SupplierRefNo: string;
    ReasonstoVoid: string;
    DraftCode: string;
    IsPOC: boolean;
    NoOfDays: number;
    TaxGroupName: string;
    TaxClass: string;
    CompanyName: string;
    SelectedPOs: Array<PurchaseOrderList>;
    SelectedGRNs: Array<GoodsReceivedNotes>;
    SelectedCPOs: Array<ContractPurchaseOrder>;
    JVs: Array<ContractPurchaseOrder>;
    CPOSelected: Array<ContractPurchaseOrderItems>;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    ReasonsToReject: string;
    AccountSetId: string;
    WorkFlowComments: WorkflowAuditTrail[];
    PurchaseOrderType: string;
    IsGstBeforeDiscount: boolean;
    SubCodeDescription: string;
    Margin: number;
    CPOAmount: number;
    InvoiceTypeId: number;
    InvoiceLimit: number;
    APOAmount: number;
    IPOAmount: number;
    EXPOAmount: number;
    SubTotalAmount: number;
    Subcode: string;
    GlDescription: string;
    SupplierSubCodeId: number;
    SupplierSubCode: SupplierSubCode;
    RemarksInvoice: string;
    OldTotalAmount?: number;
    PriceSubTotal: number;
    TotalbefTaxSubTotal: number;
    SchedulerNumber: number;
    SchedulerId: number;
    CreditNotes: any;
    CanVoid: boolean;
    UpdatedBy: number;
}

export class SupplierSubCode {
    SubCodeId: number;
    SupplierId: number;
    CompanyId: number;
    SubCodeDescription: string;
    SubCode: string;
    AccountSetId: string;
    IsDeleted: boolean;
}


export class InvoiceItems {
    InvoiceItemId: number;
    ItemQty: number;
    TypeId: number;
    Category: number;
    Unitprice: number;
    IsModified?: boolean;
    Item: SupplierItemMaster;
    Service: AccountCodeMaster;
    ItemDescription: string;
    ItemType: string;
    MeasurementUnitID: number;
    TaxID: number;
    Discount: number;
    CurrentTaxTotal: number;
    CurrentTaxAmount: number;
    CPOItemid: number;
    CPONumber: number;
    CPOID: number;
    TaxName: string;
    TaxAmount: number;
    TaxGroupId: number;
    TaxGroupName?: string;
    AccountCode: string;
    InvoiceId: number;
    TaxClass: string;
    AccountType: string;
    AccountCodeName: string;
    POTypeId: number;
    PurchaseOrderId: number;
    InvoiceCode: string;
    WorkFlowStatusId: number;
    PurchaseOrderCode: string;
    GlDescription: string;
    InvoiceTypeId?: number;
    Totalprice: number;
    TotalbefTax: number;
    constructor() {
        this.InvoiceItemId = 0;
        this.ItemQty = 0;
        this.Unitprice = 0;
        this.Totalprice = 0;
        this.TotalbefTax = 0;
        this.IsModified = false;
        this.ItemDescription = "";
        this.ItemType = "";
        this.GlDescription = "";
        this.Item = {
            ItemMasterId: 0,
            ItemName: "",
            Description: "",
            MeasurementUnitID: 0,
            MeasurementUnitCode: "",
            GLCode: "",
            GlDescription: ""


        };
        this.TaxID = 0;
        this.TaxGroupId = 0;
        this.Discount = 0;
        this.CurrentTaxTotal = 0;
        this.CurrentTaxAmount = 0;
    }
}

export class InvoiceDisplayResult {
    Invoice: Array<InvoiceList>;
    TotalRecords: number;
}

export class InvoiceList {
    InvoiceCode: string;
    InvoiceId: number;
    InvoiceTypeId: number;
    SupplierName: string;
    TotalAmount: number;
    OutStandingAmount: number;
    CurrencySymbol: string;
    Location: string;
    WorkFlowStatusId: number;
    POTypeId: number;
}

export class InvoiceTypes {
    InvoiceTypeId: number;
    InvoiceType: string;
}

export class Department {
    DepartmentId: number;
    Department: string;
}

export class CostOfService {
    CostofServiceId: number;
    CostofService: string;
}
export class InvoiceCount {
    Count: number;
}

export class InvoiceVoid {
    UserId: number;
    Reasons: string;
    InvoiceId: number;
    POTypeId: number;
    StatusId: number;
    InvoiceCode: string;
    SelectedGRNs: Array<GoodsReceivedNotes>;
    SelectedCPOs: Array<ContractPurchaseOrder>;
    SelectedPOs: Array<PurchaseOrderList>;
    CompanyId: number;
}

export class InvoiceSubTotal {
    PurchaseOrderId: string;
    CompanyId: number;
    InvoiceId: number;
    POTypeId: number;

}
export class SINVFilterDisplayInput extends GridDisplayInput {
    SINVCodeFilter: string;
    SupplierNameFilter: string;
    PoNumberFilter: string;
    StatusFilter: string;
    // FromDateFilter?: Date;
    // ToDateFilter?: Date;
    FromDateFilter:string;
    ToDateFilter:string;
    PoTypeIdFilter: string;
    CompanyID: Number;
    UserId: number;
}
export class ExportBulkInvoice {
    CntItem: string;
    PONumber: string;
}