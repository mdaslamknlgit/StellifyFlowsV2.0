import { Component, OnInit } from '@angular/core';
import { ALIGNMENT, DATATYPE, ReportColumn, ReportParamConfig, ReportParameter, REPORTTYPE } from '../../models/report-parameter';
@Component({
  selector: 'app-pop-master',
  templateUrl: './pop-master.component.html',
  styleUrls: ['./pop-master.component.css']
})
export class POPMasterComponent implements OnInit {
  reportParamConfig: ReportParamConfig = new ReportParamConfig(true, false, true, false, true);
  reportParam: ReportParameter = new ReportParameter();
  reportColumns: ReportColumn[] = [];
  constructor() {
    this.reportParam.ReportType = REPORTTYPE.POPMASTER;
    this.reportParam.Title = "POP - Master";
  }

  ngOnInit() {
    this.reportColumns = [
      { field: "Entity", header: "Entity", dataType: DATATYPE.string, width: 150, alignment: ALIGNMENT.Left },
      { field: "Department", header: "Department", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Date", header: "Date", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "ContractID", header: "ContractID", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "POType", header: "PO-Type", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "ContractName", header: "ContractName", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "Status", header: "Status", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierID", header: "Supplier ID", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "SupplierName", header: "Supplier Name", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "ContractStartDate", header: "Contract Start Date", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "ContractEndDate", header: "Contract End Date", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "PaymentTerms", header: "Payment Terms", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "OriginalContractSum", header: "Original Contract Sum", dataType: DATATYPE.currency, width: 120, alignment: ALIGNMENT.Right, hasFooter: true },
      { field: "TotalVOSum", header: "Total VO Sum", dataType: DATATYPE.currency, width: 100, alignment: ALIGNMENT.Right },
      { field: "AdjustedContractSum", header: "Adjusted Contract Sum", dataType: DATATYPE.currency, width: 100, alignment: ALIGNMENT.Right, hasFooter: true },
      { field: "RetentionApplicable", header: "Retention Applicable", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "RetentionPercentage", header: "Retention Percentage", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "RetentionMaxLimit", header: "Retention Max Limit", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "RetentionType", header: "Retention Type", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "RetentionSupplierId", header: "Retention Supplier Id", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left },
      { field: "ExpensesType", header: "Expenses Type", dataType: DATATYPE.string, width: 110, alignment: ALIGNMENT.Left },
      { field: "Requster", header: "Requster", dataType: DATATYPE.string, width: 100, alignment: ALIGNMENT.Left }
    ];
  }

}
