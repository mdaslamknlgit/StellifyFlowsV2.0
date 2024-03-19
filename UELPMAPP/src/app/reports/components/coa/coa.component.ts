import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-coa',
  templateUrl: './coa.component.html',
  styleUrls: ['./coa.component.css']
})
export class COAComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, false, false, false);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.COA;
    this.reportParam.Title = "COA";
   }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "AccountType", header: "Account Type", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "SubCategory", header: "SubCategory", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "AccountCode", header: "Account Code", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "Description", header: "Description", dataType: DATATYPE.string, width: 180, alignment: ALIGNMENT.Left }
    ];
  }
}
