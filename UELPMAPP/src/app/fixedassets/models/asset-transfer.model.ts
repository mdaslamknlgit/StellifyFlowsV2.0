import { Asset } from "./asset.model";
import { WorkflowAuditTrail } from "../../po/models/workflow-audittrail.model";

export class AssetTransfer
{
    public  AssetTranferId:number;
    public FromLocationId:number;
    public FromLocation:string;
    public ToLocationId:number;
    public ToLocation:string;
    public FromCompanyId:number;
    public FromCompany:string;
    public ToCompanyId:number;
    public ToCompany:string;
    public ReasonForTransfer:string;
    public CreatedBy:number;
    public SelectedAssetDetails:Array<Asset>;
    public WorkFlowComments:Array<WorkflowAuditTrail>;
    public CurrentApproverUserId:number;
    public CurrentApproverUserName:string;
    public WorkFlowStatusId:number;
    public RequestedByUserName:string;
}