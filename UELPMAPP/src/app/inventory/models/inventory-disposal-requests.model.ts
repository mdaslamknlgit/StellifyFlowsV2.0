export class InventoryDisposalRequestModel
{
    InventoryDisposalId:number;
    ItemMasterId:number;
    ItemMasterName:string;
    ExistingQuantity:number;
    InventoryDisposalQty:number;
    ReasonForDisposal:string;
    WorkFlowStatusId:number;
    WorkFlowStatus:string;
    IsModified?:boolean;
}

export class InventoryDisposalRequestInput
{
    LocationId:number;
    Skip:number;
    Take:number;
    SortExpression:string;
    SortDirection:string;
}

export class InventoryDisposalRequest
{
    public LocationId:number;
    public InventoryReqToAdd:Array<InventoryDisposalRequestModel>;
    public InventoryReqToDelete:Array<number>;
    public InventoryReqToUpdate:Array<InventoryDisposalRequestModel>;
}

