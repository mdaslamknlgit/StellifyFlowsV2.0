import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-poc',
  templateUrl: './poc.component.html',
  styleUrls: ['./poc.component.css']
})
export class POCComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, true, false, true);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.POC;
    this.reportParam.Title = "POC";
   }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "Date", header: "Date", dataType: DATATYPE.date, width: 100, alignment: ALIGNMENT.Left },
      { field: "POCNumber", header: "POC Number", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "POCType", header: "POC-Type", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "contractname", header: "Contract Name", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "suppliername", header: "Supplier Name", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "suppliercode", header: "supplier Code", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "POCAmountBefGST", header: "POC Amount w/o GST", dataType: DATATYPE.currency, width: 100, alignment: ALIGNMENT.Right },
      { field: "POCAmountWithGST", header: "POC Amount With GST", dataType: DATATYPE.currency, width: 100, alignment: ALIGNMENT.Right },
      { field: "BillingFrequency", header: "Billing Frequency", dataType: DATATYPE.string, width: 90, alignment: ALIGNMENT.Left },
      { field: "Requstor", header: "Requstor", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "dept", header: "dept", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "TypeOfService", header: "Type Of Service", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "Currency", header: "Currency", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "Payment Terms", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "Remarks", header: "Remarks", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left }
    ];
  }

}
