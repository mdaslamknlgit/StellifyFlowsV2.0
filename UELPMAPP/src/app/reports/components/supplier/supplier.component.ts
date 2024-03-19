import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit {
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, true, true, false);
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.SUPPLIER;
    this.reportParam.Title = "Supplier";
  }

  ngOnInit() {
    this.reportColumns = [
      { field: "CompanyName", header: "Company Name", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "SupplierId", header: "Supplier ID", dataType: DATATYPE.string, width: 115, alignment: ALIGNMENT.Left },
      { field: "SupplierName", header: "Supplier Name", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "ShortName", header: "Short Name", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "AddressLine1", header: "AddressLine1", dataType: DATATYPE.string, width: 120, alignment: ALIGNMENT.Left },
      { field: "AddressLine2", header: "AddressLine2", dataType: DATATYPE.string, width: 120, alignment: ALIGNMENT.Left },
      { field: "AddressLine3", header: "AddressLine3", dataType: DATATYPE.string, width: 120, alignment: ALIGNMENT.Left },
      { field: "City", header: "City", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Country", header: "Country", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "PostalCode", header: "Postal Code", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Center },
      { field: "Dept", header: "Department", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "GSTStatus", header: "GSTStatus", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Category", header: "Category", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Type", header: "Type", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "Payment Terms", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "TaxGroup", header: "TaxGroup", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "TaxClass", header: "TaxClass", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "RateType", header: "RateType", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "CreditLimit", header: "Credit Limit", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left }
    ];
  }

}
