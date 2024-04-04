import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-po-items',
  templateUrl: './po-items.component.html',
  styleUrls: ['./po-items.component.css']
})
export class POItemsComponent implements OnInit {

  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.POITEMS;
    this.reportParam.Title = "PO - Items";
   }

  ngOnInit() {
    this.reportColumns = [
      { field: "SupplierId", header: "Supplier Id", dataType: DATATYPE.string, width: 5, alignment: ALIGNMENT.Left },
      { field: "SupplierName", header: "Supplier Name", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "ShortName", header: "Short Name", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "AddressLine1", header: "AddressLine1", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "AddressLine2", header: "AddressLine2", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "AddressLine3", header: "AddressLine3", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "City", header: "City", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "Country", header: "Country", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "PostalCode", header: "PostalCode", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "Department", header: "Department", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "GSTStatus", header: "GSTStatus", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "Category", header: "Category", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "Type", header: "Type", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "PaymentTerms", dataType: DATATYPE.string, width: 50, alignment: ALIGNMENT.Left }
    ];
  }

}
