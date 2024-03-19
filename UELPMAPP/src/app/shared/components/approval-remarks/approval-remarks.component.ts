import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { WorkflowAuditTrail } from './../../../po/models/workflow-audittrail.model';
import { MessageTypes, WorkFlowApproval, WorkFlowProcess, WorkFlowStatus, WorkFlowStatusModel } from '../../models/shared.model';
import { SharedService } from '../../services/shared.service';
import { GenericService } from '../../sevices/generic.service';

@Component({
  selector: 'app-approval-remarks',
  templateUrl: './approval-remarks.component.html',
  styleUrls: ['./approval-remarks.component.css']
})
export class ApprovalRemarksComponent implements OnInit {
  @Input() IsApprovalPage: boolean;
  @Input() IsSendForClarification: boolean;
  @Input() IsReplyForClarification: boolean;
  @Input() DocumentId: number;
  @Input() CompanyId: number;
  @Input() ProcessId: number;
  @Input() UserId: number;
  @Input() RequestUserId: number;
  @Input() CurrentApproverUserId: number;
  @Input() DocumentCode: string;
  @Input() WorkFlowComments: WorkflowAuditTrail[] = [];
  @Input() WorkFlowStatus: WorkFlowStatusModel = new WorkFlowStatusModel();
  @Output('backtoList') backtoListEE: EventEmitter<any> = new EventEmitter();
  Remarks: string;
  constructor(private genricService: GenericService, private sharedService: SharedService, private fb: FormBuilder) { }
  ngOnInit() {

  }
  SendForClarification() {
    let workFlowDetails: WorkFlowApproval = {
      DocumentId: this.DocumentId,
      CompanyId: this.CompanyId,
      ProcessId: this.ProcessId,
      WorkFlowStatusId: WorkFlowStatus.AskedForClarification,
      UserId: this.UserId,
      Remarks: this.Remarks,
      RequestUserId: this.RequestUserId,
      DocumentCode: this.DocumentCode,
      IsReApproval: false
    };
    this.genricService.SendForClarificationDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: `${WorkFlowProcess[this.ProcessId]} Send for clarification successfully`,
        MessageType: MessageTypes.Success
      });
      this.backtoList();
    });
  }
  ReplyForClarification() {
    let workFlowDetails: WorkFlowApproval = {
      DocumentId: this.DocumentId,
      CompanyId: this.CompanyId,
      ProcessId: this.ProcessId,
      WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
      UserId: this.UserId,
      Remarks: this.Remarks,
      ApproverUserId: this.CurrentApproverUserId,
      DocumentCode: this.DocumentCode,
      IsReApproval: false
    };
    this.genricService.ReplyDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: `${WorkFlowProcess[this.ProcessId]} Replied for clarification successfully.`,
        MessageType: MessageTypes.Success
      });
      this.backtoList();
    });
  }
  backtoList() {
    this.backtoListEE.emit();
  }
}
