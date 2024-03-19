import { ItemMaster, Attachments, Suppliers } from "../../shared/models/shared.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { AccountCodeMaster } from "./account-code.model";
import { SupplierSubCode, SupplierContactPerson } from './supplier';
export class PurchaseOrderDetails {
    RequestedBy: number;
    RequestedByUserName: string;
    Designation: string;
    LocationId: number;
    LocationName: string;
    Category: string;
    CostOfService: string;
    POTypeId: number;
    PurchaseOrderType: string;
    ExpectedDeliveryDate: Date | string;
    VendorReferences: string;
    CurrencyId: number;
    CurrencyCode: string;
    CurrencySymbol: string;
    WorkFlowStatusId: number;
    WorkFlowStatusText: string;
    PurchaseOrderId: number;
    CreatedBy: number;
    CreatedDate: Date;
    SupplierAddress: string;
    PurchaseOrderItemsToDelete: Array<number>;
    PurchaseOrderCode: string;
    CostofService: string;
    PurchaseOrderStatusText: string;
    PurchaseOrderStatusId: number;
    PurchaseOrderItems: Array<PurchaseOrderItems>;
    Discount: number;
    TotalTax: number;
    TaxTotal: number;
    ShippingCharges: number;
    OtherCharges: number;
    TotalAmount: number;
    Instructions: string;
    Justifications: string;
    TaxRate: number;
    Attachments: Attachments[];
    AttachmentsDelete: Array<number>;
    IsGstRequired: boolean;
    PaymentTermId: number;
    PaymentTerms: string;
    DeliveryTerm: string;
    DeliveryAddress: string;
    Supplier: Suppliers;
    SubTotal: number;
    ReasonForPurchase: string;
    IsGstBeforeDiscount: boolean;
    CompanyId: number;
    DeliveryTermId: number;
    ProcessId: number;
    WorkFlowComments: Array<WorkflowAuditTrail>;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    ReasonstoVoid: string;
    IsDocumentApproved: boolean;
    DraftCode: string;
    ReasonsToReject: string;
    SPOQuotationItem: Array<SPOQuotationItem>;
    SPOQuotationItemToDelete: Array<number>;
    SPOQuotationAttachment: SPOQuotationAttachments[];
    SPOQuotationAttachmentDelete: Array<SPOQuotationAttachments>;
    SPOQuotationAttachmentUpdateRowId: SPOQuotationAttachments[];
    RemarksQuotation: string;
    SupplierSubCodeId: number;
    SupplierSubCode: SupplierSubCode;
    ContactPersons: Array<SupplierContactPerson>;
    RequestorEmailID: string;
    InvoiceLimit: number;
    ContactPersonName: string;
    ContactNo: string;
    ContactEmail: string;
    PriceSubTotal: number;
    DiscountSubTotal: number;
    TotalbefTaxSubTotal: number;
    InventoryRequestId: string;
}

export class PurchaseOrderItems {
    PurchaseOrderItemId: number;
    TaxID: number;
    TypeId: number;
    TaxGroupId: number;
    TaxAuthority: string;
    ItemType: string;
    ItemTypeId: number;
    TaxName: string;
    TaxAmount: number;
    TaxTotal: number;
    Discount: number;
    ItemQty: number;
    Unitprice: number;
    Totalprice: number;
    TotalbefTax: number;
    IsModified?: boolean;
    Item: ItemMaster;
    Service: AccountCodeMaster;
    //AccountCode:string;
    ItemDescription: string;
    MeasurementUnitID: number;
    MeasurementUnitCode: string;
    PurchaseOrderId?: number;
    PurchaseOrderCode: string;
    GlDescription: string;
    constructor() {
        this.PurchaseOrderItemId = 0;
        this.TaxID = 0;
        this.TaxGroupId = 0;
        this.TaxName = "";
        this.TaxAuthority = "";
        this.TaxTotal = 0;
        this.TaxAmount = 0;
        this.ItemQty = 0;
        this.Unitprice = 0;
        this.Totalprice = 0;
        this.TotalbefTax = 0;
        this.IsModified = false;
        this.ItemDescription = "";
        this.GlDescription = "";
        this.Item = {
            ItemMasterId: 0,
            ItemName: "",
            Description: "",
            MeasurementUnitID: 0,
            MeasurementUnitCode: ""
        };
        this.MeasurementUnitCode = "";
    }
}

export class PurchaseOrderDisplayResult {
    PurchaseOrders: Array<PurchaseOrderList>;
    TotalRecords: number;
}

export class PurchaseOrderList {
    PurchaseOrderCode: string;
    DraftCode: string;
    PurchaseOrderId: number;
    POTypeId: number;
    SupplierName: string;
    SupplierId: number;
    CreatedBy: number;
    FirstName: string;
    CreatedDate: Date;
    TotalAmount: number;
    IsDocumentApproved: boolean;
    WorkFlowStatusId: number;
    WorkFlowStatusText: string;

}


export class PurchaseOrderTypes {
    PurchaseOrderTypeId: number;
    PurchaseOrderType: string;
}

export class Department {
    DepartmentId: number;
    Department: string;
}

export class CostOfService {
    CostofServiceId: number;
    CostofService: string;
}
export class AuditLogFilter {
    public FromDate: string;
    public ToDate: string;
    public CompanyId: number;
    public DocumentId: number;
    public PageName: string;
}

export class POFilterModel {
    public POCode?: string;
    public SupplierName?: string;
    public PoTypeId?: number;
    public WorkFlowStatusId?: number;
    public FromDate?: Date;
    public ToDate?: Date;
    public FDate?:string;
    public TDate?:string;
    constructor() {

        this.PoTypeId = 0;
        this.WorkFlowStatusId = 0;
        this.POCode = "";
        this.SupplierName = "";
        this.FromDate = null;
        this.ToDate = null;
    }
}

export class PurchaseOrderFilterModel {
    public POCode?: string;
    public SupplierName?: string;
    public PoTypeId?: number;
    public WorkFlowStatusId?: number;
    public FromDate?: Date;
    public ToDate?: Date;
    constructor() {

        this.PoTypeId = 0;
        this.WorkFlowStatusId = 0;
        this.POCode = "";
        this.SupplierName = "";
        this.FromDate = null;
        this.ToDate = null;
    }
}

export class DateObj {
    year:string;
    month:string;
    day:string;
}

export enum PurchaseOrderStatus {
    Draft = 1,
    Approval = 2,
    Rejected = 3,
    SendToSupplier = 4,
    PartiallyReceived = 5,
    Received = 6,
    PartiallyInvoiced = 7,
    Invoiced = 8,
    //Void = 9
}

export class SPOQuotationItem {
    QuotationId: number;
    SupplierEmail: string;
    QuotationRemarks: string;
    // Supplier:Suppliers;
    Supplier: string;
    POTypeId: number;
    QuotationAmount: number;
    IsModified?: boolean;
    RowIndex: number;
    constructor() {
        this.QuotationAmount = 0;
        this.SupplierEmail = "";
        this.POTypeId = 0;
        this.QuotationRemarks = "";
        this.Supplier = "";
        this.RowIndex = 0;
        // this.Supplier = {
        //     SupplierId:0,
        //     SupplierTypeID:0,
        //     SupplierCode:"",
        //     SupplierName:"",
        //     PreviousSupplierName:"",
        //     BillingAddress1:"",
        //     BillingAddress2:"",
        //     BillingFax:"",
        //     BillingTelephone:"",
        //     SubCodeCount:0,
        //     WorkFlowStatus:""
        // };

    }
}

export class SPOQuotationAttachments {
    SPOQuotationId: number;
    PurchaseOrderId: number;
    QuotationId: number;
    FileName: string;
    POTypeId: number;
    RowId: number;
    IsDelete?: boolean;
}
