
import { Location } from '../../shared/models/shared.model';

export class ItemAdjustment
{
    ItemAdjustmentId:number;
    ItemMasterId:number;    
    ItemName:string;
    ItemMasterCode:string;
    ExistingQty:number;
    AdjustedQty:number;
    ReasonForAdjustment :number;
    WorkFlowStatus:string;
    WorkFlowStatusId:number;
    LocationId:number;
    LocationName:string;
    Location?:Location;
}

export class ItemAdjustmentDisplayInput
{
    Skip:number;
    Take:number;
}
