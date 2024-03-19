import { Pipe, PipeTransform } from "@angular/core";
import { FormArray } from "@angular/forms";
import { WorkFlowStatus } from "../models/shared.model";

@Pipe({
    name: 'DisableButton'
})
export class ButtonDisplayPipe implements PipeTransform {
    transform(selectedPODetails: any, isVoid: string = "false", isMaterCPO: boolean = false): any {     
        if (isVoid == "true" && isMaterCPO == false) {
            let allowedStatus: Array<number> = [WorkFlowStatus.WaitingForApproval, WorkFlowStatus.AskedForClarification, WorkFlowStatus.Approved];
            if (allowedStatus.findIndex(i => i == selectedPODetails.WorkFlowStatusId) > -1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (isVoid == "true" && isMaterCPO == true) {
            let allowedStatus: Array<number> = [WorkFlowStatus.Approved];
            if (allowedStatus.findIndex(i => i == selectedPODetails.WorkFlowStatusId) > -1) {
                return true;
            }
            else {
                return false;
            }
        }
        else {          
            if (selectedPODetails.IsSupplier) {

            }
            else {
                if (selectedPODetails.WorkFlowStatusId != undefined && selectedPODetails.WorkFlowStatusId != null && selectedPODetails.WorkFlowStatusId != 0
                    && selectedPODetails.WorkFlowStatusId != WorkFlowStatus.Initiated && selectedPODetails.WorkFlowStatusId != WorkFlowStatus.Draft
                    && selectedPODetails.WorkFlowStatusId != WorkFlowStatus.CancelledApproval) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
}