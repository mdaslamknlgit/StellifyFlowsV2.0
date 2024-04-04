import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';

@Component({
  selector: 'app-ap-invoice',
  templateUrl: './ap-invoice.component.html',
  styleUrls: ['./ap-invoice.component.css']
})
export class ApInvoiceComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, true, true, true);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.APINVOICE;
    this.reportParam.Title = "AP - Invoice";
  }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "Department", header: "Department", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "CreationDate", header: "Date", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "InvoiceNo", header: "Invoice No", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PONOs/CPONos", header: "PONOs/CPONos", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "GRNNos/POCNos", header: "GRNNos/POCNos", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "SupplierCode", header: "Supplier Code", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierName", header: "Supplier Name", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "InvoiceAmountBefGST", header: "Invoice Amount w/o GST", dataType: DATATYPE.currency, width: 110, alignment: ALIGNMENT.Right, hasFooter: true },
      { field: "InvoiceAmountWithGST", header: "Invoice Amount With GST", dataType: DATATYPE.currency, width: 110, alignment: ALIGNMENT.Right, hasFooter: true },
      { field: "SupplierInoviceNo", header: "Supplier Inovice No", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "InvoiceType", header: "Invoice Type", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Requestor", header: "Requestor", dataType: DATATYPE.string, width: 120, alignment: ALIGNMENT.Left },
      { field: "Currency", header: "Currency", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "Payment Terms", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "InvoiceDescription", header: "Invoice Description", dataType: DATATYPE.string, width: 200, alignment: ALIGNMENT.Left },
      { field: "SchedulerNumber", header: "Scheduler Number", dataType: DATATYPE.string, width: 120, alignment: ALIGNMENT.Left }
    ];
  }
}
