import { Pipe, PipeTransform } from "@angular/core";
import { WorkflowAuditTrail } from "../../po/models/workflow-audittrail.model";
import { SessionStorageService } from "../services/sessionstorage.service";
import { UserDetails } from "../models/shared.model";

@Pipe({
    name: 'ApprovalButton'
})
export class ApprovalButtonPipe implements PipeTransform {
    constructor(private sessionServiceObj: SessionStorageService) {

    }
    transform(workFlowComments: Array<WorkflowAuditTrail>): any {

        let userDetails = <UserDetails>this.sessionServiceObj.getUser();
        if (workFlowComments == undefined || workFlowComments.length == 0 || workFlowComments.filter(j => j.UserId == userDetails.UserID).length == 0) {
            return "Send for Clarification";
        }
        else {
            if (workFlowComments[0].UserId == userDetails.UserID) {
                return "Send for Clarification";
            }
            else {
                return "Reply";
            }
        }
    }
}