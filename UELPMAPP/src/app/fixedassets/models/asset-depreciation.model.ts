import { WorkflowAuditTrail } from "../../po/models/workflow-audittrail.model";
import { Asset } from "./asset.model";

export class AssetDepreciation
{
    AssetDepreciationId:number;
    CreatedBy:number;
    WorkFlowStatusId:number;
    WorkFlowStatus:string;
    SelectedAssets:Array<number>;
    DeletedAssets:Array<number>;
    CompanyId:number;
    CurrentApproverUserId:number;
    CurrentApproverUserName:string;
    CreatedDate:Date;
    UpdatedDate:Date;
    DateOfPosting:Date;
    WorkFlowComments:Array<WorkflowAuditTrail>;
    AssetDetails:Array<Asset>;
    LocationId:number;
    Location:string;
}