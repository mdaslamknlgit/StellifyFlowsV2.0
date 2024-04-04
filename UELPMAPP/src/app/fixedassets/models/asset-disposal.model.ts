import { WorkflowAuditTrail } from "../../po/models/workflow-audittrail.model";
import { Asset } from "./asset.model";
import { Locations } from "../../inventory/models/item-master.model";

export class AssetDisposal
{
    AssetDisposalId:number;
    Remarks:string;
    CurrentApproverUserId:number;
    CurrentApproverUserName:string;
    WorkFlowComments:Array<WorkflowAuditTrail>;
    CreatedBy:number;
    RequestedByUserName:string;
    WorkFlowStatusId:number;
    WorkFlowStatus:string;
    ApprovalRemarks:string;
    CompanyId:number;
    SelectedAssets:Array<number>;
    DeletedAssets:Array<number>;
    SelectedAssetDetails:Array<Asset>;
    Location:Locations
}