export class InventoryCycleCountModel
{
    InventoryCycleCountId:number;
    ItemMasterId:number;
    ItemMasterName:string;
    SystemQty:number;
    PhysicalQty:number;
    LocationItemId:number;
    LostQty:number;
    DamagedQty:number;    
    ExpiredQty:number;
    Reasons:string;
    WorkFlowStatusId:number;
    WorkFlowStatus:string;
    IsModified?:boolean;
}

export class InventoryCycleCountDisplayInput
{
    LocationId:number;
    Skip:number;
    Take:number;
    SortExpression:string;
    SortDirection:string;
}
export class InventoryCycleCountRequest
{    
    public InventoryCycleCountToAdd:Array<InventoryCycleCountModel>;
    public InventoryCycleCountToDelete:Array<number>;
    public InventoryCycleCountToUpdate:Array<InventoryCycleCountModel>;
}