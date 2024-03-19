import { NgbDate } from "@ng-bootstrap/ng-bootstrap/datepicker/ngb-date";

export class ItemMaster {
    ItemMasterID: number;
    ItemMasterCode: string;
    ItemTypeID: number;
    ItemTypeName: string;
    ItemCategoryName: string;
    Name: string;
    Price: number;
    AverageCost: number;
    PurchasePrice:number;
    SalesPrice:number;
    Status: boolean;
    ExpiryDate: Date | string;
    Manufacturer: string;
    Brand: string;
    OpeningStockValue: number;
    Description: string;
    ReOrderLevel: number;
    LowAlertQuantity: number;
    GST: number;
    CreatedBy: number;
    ModifiedBy: number;
    CreatedDate: Date;
    LocationId: number;
    LocationName: string;
    MeasurementUnitID: number;
    UOMName?: string;
    CompanyId: number;
    GLCode: string;
}

export class ItemMasterDisplayInput {
    Skip: number;
    Take: number;
    Search: string;
    CompanyId: number;
}


export class ItemType {
    ItemTypeID: number;
    Name: string;
}


export class Locations {
    LocationID: number;
    Name: string;
    HasWorkflow: boolean;
}