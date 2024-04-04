import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-pop-invoice',
  templateUrl: './pop-invoice.component.html',
  styleUrls: ['./pop-invoice.component.css']
})
export class POPInvoiceComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, true, false, true);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.POPINVOICE;
    this.reportParam.Title = "POP - Invoice";
  }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "Department", header: "Department", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Date", header: "Date", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "DocumentCode", header: "Document Code", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "SupplierID", header: "Supplier ID", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierName", header: "Supplier Name", dataType: DATATYPE.string, width: 130, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "CertificateNo", header: "Certificate No", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierInvoiceNumber", header: "Supplier Invoice Number", dataType: DATATYPE.string, width: 120, alignment: ALIGNMENT.Left },
      { field: "InvoiceAmountBefTax", header: "Invoice Amount w/o Tax", dataType: DATATYPE.currency, width: 120, alignment: ALIGNMENT.Right, hasFooter: true },
      { field: "InvoiceAmountWithTax", header: "Invoice Amount With Tax", dataType: DATATYPE.currency, width: 120, alignment: ALIGNMENT.Right, hasFooter: true },
      { field: "Currency", header: "Currency", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "Payment Terms", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentDescription", header: "Payment Description", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Requster", header: "Requster", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left }
    ];
  }

}
