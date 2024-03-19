import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ProjectPaymentExport, ReportParams } from '../../models/project-payment-history.model';
import { ProjectPaymentMasterService } from '../../services/project-payment-history.service';

@Component({
  selector: 'app-project-payment-report',
  templateUrl: './project-payment-report.component.html',
  styleUrls: ['./project-payment-report.component.css']
})
export class ProjectPaymentReportComponent implements OnInit {
  moduleHeading: string = '';
  companyId: number = 0;
  reportParams: ReportParams = new ReportParams();
  paymentContractId: number = 0;
  masterContractId: number = 0;
  reportData: ProjectPaymentExport = new ProjectPaymentExport();
  constructor(public route: ActivatedRoute,
    private sessionService: SessionStorageService,
    private router: Router,
    private projectContractPaymentServiceObj: ProjectPaymentMasterService
  ) { }

  ngOnInit() {
    this.moduleHeading = 'Contract Payment Report';
    this.companyId = this.sessionService.getCompanyId();
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.paymentContractId = Number(param.get('ppcid'));
      this.masterContractId = Number(param.get('pmcid'));
      this.reportParams.DocumentsData = [];
      this.reportParams = {
        Type: 'print',
        DocumentsData: [{ POPId: this.masterContractId, PaymentContractId: this.paymentContractId }]
      };
      this.getProjectPaymentReport();
    });

  }
  getProjectPaymentReport() {
    this.projectContractPaymentServiceObj.getProjectPaymentReport(this.reportParams).subscribe((result: ProjectPaymentExport) => {
      if (result != null) {
        this.reportData = result;
      }
    });
  }
  onCancelClick(){
    this.router.navigate(['po/projectpaymentlist/request']);
  }
  export_xls(element) {
    var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  
    tab_text = tab_text + '<x:Name>Test Sheet</x:Name>';
  
    tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
    tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';
  
    tab_text = tab_text + "<table border='1px'>";
    tab_text = tab_text + document.getElementById(element).innerHTML;
    tab_text = tab_text + '</table></body></html>';
  
    var data_type = 'data:application/vnd.ms-excel';
  
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
  
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        if (window.navigator.msSaveBlob) {
            var blob = new Blob([tab_text], {
                type: "application/csv;charset=utf-8;"
            });
            navigator.msSaveBlob(blob, 'POPPaymentReport.xls');
        }
    } else {
      var downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      downloadLink.href = data_type + ', ' + encodeURIComponent(tab_text);
          downloadLink.download = 'POPPaymentReport.xls';
          downloadLink.click();
    }
  }
}
