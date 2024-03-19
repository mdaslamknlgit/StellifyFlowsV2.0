
import { ItemMaster, Suppliers, Attachments, Assets, GridDisplayInput } from "../../shared/models/shared.model";
import { Asset } from "../../fixedassets/models/asset.model";
import { AccountCodeMaster } from "./account-code.model";
export class GoodsReceivedNotesDisplayResult {
    GoodsReceivedNotes: Array<GoodsReceivedNotesList>;
    TotalRecords: number;
    graftGRNlist: Array<DraftGRN>;
}

export class GoodsReceivedNotesList {
    GoodsReceivedNoteId: number;
    PurchaseOrderId: number;
    POTypeId: number;
    SupplierDoNumber: number;
    GRNRemarks: string;
    CreatedBy: number;
    CreatedDate: Date;
    IsReturn: boolean;
    GRNCode: string;
    DraftCode: string;

}

export class DraftGRN {
    DraftCount: number;
    GoodsReceivedNoteId: number;
}


export class GoodsReceivedNotes {
    GoodsReceivedNoteId: number;
    GRNCode: string;
    PurchaseOrderId: number;
    PurchaseOrderCode: string;
    PurchaseOrderType: string;
    SupplierDoNumber: number;
    GRNRemarks: string;
    DeliveryAddress: string;
    CostOfService: string;
    CurrencyCode: string;
    CurrencySymbol: string;
    StatusText: string;
    Supplier: Suppliers;
    SupplierAddress?: string;
    ItemsList: Array<GoodsReceivedNotesItems>;
    CreatedDate: Date;
    POTypeId?: number;
    DeliveryTerm: string;
    RequestedByUserName: string;
    Designation: string;
    Location: string;
    CreatedBy: number;
    CompanyId: number;
    Attachments: Attachments[];
    DOAttachments: Attachments[];
    DOAttachmentsDelete: Array<number>;
    gRNQtyTotal: Array<GRNQtyTotal>;
    IsGstBeforeDiscount: boolean;
    LocationID: number;
    StatusId: number;
    IsReturn: boolean;
    Assets: Asset[];
    ReasonstoVoid: string;
    WorkFlowStatusId: number;
    WorkFlowStatus: string;
    WorkFlowStatusText: string;
    SupplierId: number;
    PONO: string;
}

export class GoodsReceivedNotesItems {
    GRNItemId: number;
    TypeId: number;
    Category: number;
    ItemType: string;
    Item: ItemMaster;
    // Asset:Assets;
    Service: AccountCodeMaster;
    MeasurementUnitCode: string;
    ItemDescription: string;
    OriginalQty: number;
    TotalReceivedQty: number;
    OpenQty: number;
    GRNQty: number;
    IsModified: boolean;
    RecordId: number;
    PurchaseValue: number;
    ItemMasterId?: number;
    Discount: number;
}

export class GRNFilterDisplayInput extends GridDisplayInput {
    GRNCodeFilter: string;
    DoNumberFilter: string;
    PoNumberFilter: string;
    StatusFilter: string;
    CompanyId: number;
    SupplierNameFilter: string;
    // FromDateFilter?: Date;
    // ToDateFilter?: Date;
    FromDateFilter?: string;
    ToDateFilter?: string;
    PoTypeIdFilter?: string;
    DepartmentFilter: string;
    SupplierCodeFilter: string;
    UserId: number;

}

export class GRNVoid {
    UserId: number;
    Reasons: string;
    GoodsReceivedNoteId: number;
    PurchaseOrderId: number;
    POTypeId: number;
    ItemsList: Array<GoodsReceivedNotesItems>;
    GRNCode: string;
    StatusId: number;
}

export class GRNQtyTotal {
    TotalReceivedQty: number;
    OpenQty: number;
    RecordId: number;
}