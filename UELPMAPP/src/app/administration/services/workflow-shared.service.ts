import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChildComponent } from '../components/child/child.component';
import { ApprovalComponent } from '../components/approval/approval.component';
import { WorkFlowLevel } from '../models/workflowlevel';
import { WorkFlowChildComponent, WorkFlowApproverComponent, WorkFlowRemoveComponent } from '../models/workflowcomponent';
@Injectable({
    providedIn: 'root',
})
export class WorkFlowSharedService {
    private approversubject = new Subject<WorkFlowLevel>();
    private conditionsubject = new Subject<WorkFlowLevel>();
    conditionData = new EventEmitter();
    approverData = new EventEmitter();
    removeData = new EventEmitter();

    constructor() { }

    sendConditionComponent(data: WorkFlowChildComponent) {
        this.conditionData.emit(data);
    }

    sendApproverComponent(data: WorkFlowApproverComponent) {
        this.approverData.emit(data);
    }

    sendRemoveComponent(data: WorkFlowRemoveComponent) {
        this.removeData.emit(data);
    }

    sendSelectedCondition(condition: WorkFlowLevel) {
        this.conditionsubject.next(condition);
    }

    sendSelectedApprover(approver: WorkFlowLevel) {
        this.approversubject.next(approver);
    }

    getSelectedCondition(): Observable<any> {
        return this.conditionsubject.asObservable();
    }

    getSelectedApprover(): Observable<any> {
        return this.approversubject.asObservable();
    }   
}
