import { ItemMaster, Location } from "../../shared/models/shared.model";

export class InventoryRequest
{
    InventoryRequestID:number;
    Code:string;
    Remarks:string;
    ItemsList:Array<InventoryRequestItems>;
    RequestStatusId:number;
    RequestStatus:string;
    Location:Location;
    Item?:ItemMaster;
    ItemsToDelete?:Array<number>;
}

export class InventoryRequestItems
{
    InventoryRequestDetailID:number;
    Item:number;
    QuantityRequired:number;
    IsSaved?:boolean;
    IsChanged?:boolean;
}

export class InventoryRequestDisplayInput
{
    Skip:number;
    Take:number;
    SortExpression:string;
    SortDirection:string;
}

export class InventoryRequestDetailInput extends InventoryRequestDisplayInput
{
    InventoryRequestId:number;
}