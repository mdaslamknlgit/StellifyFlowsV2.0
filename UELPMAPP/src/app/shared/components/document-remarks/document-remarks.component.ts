import { Component, Input, OnInit } from '@angular/core';
import { WorkFlowStatus, WorkFlowStatusModel } from '../../models/shared.model';

@Component({
  selector: 'app-document-remarks',
  templateUrl: './document-remarks.component.html',
  styleUrls: ['./document-remarks.component.css']
})
export class DocumentRemarksComponent implements OnInit {
  @Input() WorkFlowStatus: WorkFlowStatusModel = new WorkFlowStatusModel();
  @Input() Reason = '';
  _workFlowStatus: any;
  constructor() { }

  ngOnInit() {
    this._workFlowStatus = WorkFlowStatus;
  }
}
