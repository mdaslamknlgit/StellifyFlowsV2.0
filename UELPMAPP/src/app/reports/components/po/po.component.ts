import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-po',
  templateUrl: './po.component.html',
  styleUrls: ['./po.component.css']
})
export class POComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, false, false, false);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.PO;
    this.reportParam.Title = "PO";
   }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "Date", header: "Date", dataType: DATATYPE.date, width: 100, alignment: ALIGNMENT.Left },
      { field: "PONo", header: "PONo", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "POType", header: "PO Type", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "POAmountBefGST", header: "PO Amount Bef GST", dataType: DATATYPE.currency, width: 110, alignment: ALIGNMENT.Right },
      { field: "POAmountWithGST", header: "PO Amount With GST", dataType: DATATYPE.currency, width: 110, alignment: ALIGNMENT.Right },
      { field: "SupplierCode", header: "Supplier Code", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierQuotationNo", header: "Supplier Quotation No", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "Requstor", header: "Requstor", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Dept", header: "Dept", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "ReasonForPurchase", header: "Reason For Purchase", dataType: DATATYPE.string, width: 400, alignment: ALIGNMENT.Left },
      { field: "costofservice", header: "Cost Of Service", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "Currency", header: "Currency", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "Payment Terms", dataType: DATATYPE.string, width: 75, alignment: ALIGNMENT.Left },
      { field: "Remarks", header: "Remarks", dataType: DATATYPE.string, width: 400, alignment: ALIGNMENT.Left },
      { field: "Justifications", header: "Justifications", dataType: DATATYPE.string, width: 400, alignment: ALIGNMENT.Left }
    ];
  }

}
