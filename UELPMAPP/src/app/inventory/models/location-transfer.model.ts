import { WorkflowAuditTrail } from "../../po/models/workflow-audittrail.model";
import { ItemsListing } from "./items-listing.model";

export class LocationTransfer
{
    LocationTransferId:number;     
    FromLocationId:number;
    FromLocation:string;
    ToLocationId:number;
    ToLocation:string;
    FromCompanyId:number;
    FromCompany:string;
    ToCompanyId:number;
    ToCompany:string;
    ReasonForTransfer:string;
    CreatedBy:number;
    CreatedDate:Date;
    SelectedItemDetails:Array<Items>;
    WorkFlowComments:Array<WorkflowAuditTrail>;
    CurrentApproverUserId:number;
    CurrentApproverUserName:string;
    WorkFlowStatusId:number;
    RequestedByUserName:string;
    LocationTransferCode:string;
}

export class Items
{
    LocationTransferDetailId : number ;
    ItemCategoryName : string ;
    ItemTypeName : string ;
    ExpiryDate : Date ;
    ItemMasterCode :  string;
    Name : string ;
    StatusName : string ;
    Manufacturer : string ;
    Brand : string ;
    OpeningStockValue : number ;
    LocationName : string ;
    UOMName : string ;
    ReOrderLevel : number ;
    LowAlertQuantity : number ;
    StockInhand : number ;
    ItemMasterID : number ;
    Quantity :  number;
    ItemTypeID : number ;
    MeasurementUnitID :number  ;
    GST : number ;
    Price :  number;

}
