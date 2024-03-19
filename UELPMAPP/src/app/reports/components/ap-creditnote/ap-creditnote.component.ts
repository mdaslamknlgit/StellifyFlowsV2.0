import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-ap-creditnote',
  templateUrl: './ap-creditnote.component.html',
  styleUrls: ['./ap-creditnote.component.css']
})
export class APCreditnoteComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, true, false, true);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.APCREDITNOTE;
    this.reportParam.Title = "AP - Credit Note";
   }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string,  width: 150, alignment: ALIGNMENT.Left },
      { field: "Department", header: "Department", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "Date", header: "Date", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "CNType", header: "CN Type", dataType: DATATYPE.string,  width: 110, alignment: ALIGNMENT.Left },
      { field: "DocumentCode", header: "Document Code", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "InvoiceCode", header: "Invoice Code", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierID", header: "Supplier ID", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierName", header: "Supplier Name", dataType: DATATYPE.string,  width: 130, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "CRNAmountBefTax", header: "CRN Amount Bef Tax", dataType: DATATYPE.currency,  width: 100, alignment: ALIGNMENT.Right },
      { field: "CRNAmountWithTax", header: "CRN Amount With Tax", dataType: DATATYPE.currency,  width: 100, alignment: ALIGNMENT.Right },
      { field: "Currency", header: "Currency", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "Reasons", header: "Reasons", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierCreditNoteNo", header: "Supplier CreditNote No", dataType: DATATYPE.string,  width: 120, alignment: ALIGNMENT.Left },
      { field: "SupplierCreditNoteDate", header: "Supplier CreditNote Date", dataType: DATATYPE.string,  width: 120, alignment: ALIGNMENT.Left },
      { field: "Requster", header: "Requster", dataType: DATATYPE.string,  width: 100, alignment: ALIGNMENT.Left }
    ];
  }

}
