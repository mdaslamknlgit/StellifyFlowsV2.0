import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { DATATYPE, REPORTTYPE, ReportColumn, ReportParameter, ReportParamConfig, ReportParamData, ReportParam } from '../../models/report-parameter';
import { ReportService } from '../../services/report.service';
import { UserDetails } from './../../../shared/models/shared.model';
@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {
  reportData: any[] = [];
  DATATYPE: DATATYPE;
  @Input() reportParam: ReportParameter = new ReportParameter();
  @Input() reportColumns: ReportColumn[];
  reportName: string = '';
  @Input() reportParamConfig: ReportParamConfig;
  selectedCities: any;
  form: FormGroup;
  userDetails: UserDetails = null;
  companyId: number;
  entities: ReportParam[] = [];
  departments: ReportParam[] = [];
  statuses: ReportParam[] = [];
  requesters: ReportParam[] = [];
  supplierTypes: ReportParam[] = [];
  constructor(private fb: FormBuilder,
    private sessionService: SessionStorageService,
    private reportService: ReportService) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    
    this.form = this.fb.group({
      Entities: [null],
      Departments: [null],
      Statuses: [null],
      SupplierTypes: [null],
      Requesters: [null]
    });
    try {
      this.reportName = REPORTTYPE[this.reportParam.ReportType];
    }
    catch { }
    this.supplierTypes = [{ Name: "Internal", Id: 1 }, { Name: "External", Id: 2 }];
  }

  ngOnInit() {
    this.getParamData();
  }
  getFilterData() {
    this.getReportData();
  }
  getReportData() {
    this.reportParam.UserId = this.userDetails.UserID;
    this.reportParam.FilterOptions = this.form.value;
    this.reportService.GetReportData(this.reportParam).subscribe((result: any[]) => {
      this.reportData = result;
    });
  }
  getParamData() {
    this.reportService.GetParamData(this.userDetails.UserID).subscribe((result: ReportParamData) => {
      this.entities = result.Entities;
      let defaultCompany = this.entities.filter(data => data.Id == this.sessionService.getCompanyId());
      this.form.get('Entities').setValue(defaultCompany);
      this.getReportData();
      this.statuses = result.Statuses;
      this.requesters = result.Requesters;
    });
  }
  export_xls(element) {
    var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';

    tab_text = tab_text + `<x:Name>${this.reportParam.Title}</x:Name>`;

    tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
    tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';

    tab_text = tab_text + "<table border='1px'>";
    tab_text = tab_text + document.getElementById(element).innerHTML;
    tab_text = tab_text + '</table></body></html>';

    var data_type = 'data:application/vnd.ms-excel';

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var title = `${this.reportParam.Title}-${new Date()}.xls`
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      if (window.navigator.msSaveBlob) {
        var blob = new Blob([tab_text], {
          type: "application/csv;charset=utf-8;"
        });
        navigator.msSaveBlob(blob, title);
      }
    } else {
      var downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      downloadLink.href = data_type + ', ' + encodeURIComponent(tab_text);
      downloadLink.download = title;
      downloadLink.click();
    }
  }
  sum(field: any): number {
    let sum: number = 0;
    this.reportData.forEach((obj) => {
      sum += obj[field];
    });
    return sum;
  }
}
