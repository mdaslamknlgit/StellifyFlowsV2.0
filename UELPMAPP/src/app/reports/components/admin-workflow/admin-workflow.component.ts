import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';

@Component({
  selector: 'app-admin-workflow',
  templateUrl: './admin-workflow.component.html',
  styleUrls: ['./admin-workflow.component.css']
})
export class AdminWorkflowComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, false, false, false);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.ADMINWORKFLOW;
    this.reportParam.Title = "Admin Workflow";
   }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "Department", header: "Department", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "DocumentName", header: "Document Name", dataType: DATATYPE.string,  width: 140, alignment: ALIGNMENT.Left },
      { field: "WorkFlowName", header: "WorkFlow Name", dataType: DATATYPE.string,  width: 150, alignment: ALIGNMENT.Left },
      { field: "Condition", header: "Condition", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "Operator", header: "Operator", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Center },
      { field: "Value", header: "Value", dataType: DATATYPE.currency,  width: 100, alignment: ALIGNMENT.Center },
      { field: "UserName", header: "User Name", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "CreatedBy", header: "Created By", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "CreatedDate", header: "Created Date", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "UpdatedBy", header: "Updated By", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "UpdatedDate", header: "Updated Date", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left }
    ];
  }

}
