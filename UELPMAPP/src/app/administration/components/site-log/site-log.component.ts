import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit, Renderer } from '@angular/core';
import { AuditLogAPIService } from '../../services/audit-log-api.service';
import { AuditLogData } from '../../models/audit-log';
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages, MessageTypes, PagerConfig, UserDetails, Months } from "../../../shared/models/shared.model";
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, identity } from 'rxjs';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AutofocusDirective } from '../../../shared/directives/focusdirective';
import { FullScreen } from "../../../shared/shared";
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute } from '@angular/router';
import { SortEvent } from 'primeng/components/common/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder } from '../../../../../node_modules/@angular/forms';
import { DatePipe } from '../../../../../node_modules/@angular/common';
import { POFilterModel, AuditLogFilter } from '../../../po/models/po-creation.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import * as moment from 'moment';

@Component({
  selector: 'app-site-log',
  templateUrl: './site-log.component.html',
  styleUrls: ['./site-log.component.css']
})
export class SiteLogComponent implements OnInit {
  leftSection: boolean = false;
  rightSection: boolean = false;
  scrollbarOptions: any;
  auditLogs: AuditLogData[] = [];
  showGridErrorMessage: boolean = false;
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  formSubmitAttempt: boolean = false;
  gridColumns: Array<{ field: string, header: string }> = [];
  errorMessage: string = Messages.NoRecordsToDisplay;
  companyId: number = 0;
  userDetails: UserDetails;
  message: string = "";
  isNewRecord: boolean = false;
  showLeftPanelLoadingIcon:boolean = false;
  auditlogFilterInfoForm: FormGroup;
  filterMessage: string;
  public screenWidth: any;
  constructor(private auditLogAPIService: AuditLogAPIService, private spinnerObj: NgxSpinnerService,
    private sharedServiceObj: SharedService,
    private renderer: Renderer,
    public sessionService: SessionStorageService,
    private formBuilderObj:FormBuilder,
    public datepipe: DatePipe,
    private reqDateFormatPipe:RequestDateFormatPipe) {
    this.companyId = this.sessionService.getCompanyId();
    this.auditlogFilterInfoForm = this.formBuilderObj.group({
       FromDate:[new Date()],
       ToDate:[new Date()]
  });
  }

  ngOnInit() {
    this.gridColumns = [
      { field: 'Sno', header: 'S.no' },
      // { field: 'DocumentId', header: 'Document Id' },
      { field: 'LogDate', header: 'Log Date' },
      { field: 'Level', header: 'Level' },    
      { field: 'Logger', header: 'User' },
      { field: 'Message', header: 'Message' },
      { field: 'PageName', header: 'Page Name' },
      { field: 'Method', header: 'Method' }
    ];
   
     let md=new Date();
     let m =new Date(moment(md).format("YYYY-MM-DD"));
    this.auditlogFilterInfoForm.get('FromDate').setValue({
      year: parseInt(moment(md).format('YYYY'), 10),
      month: parseInt(moment(md).format('M'), 10) ,
      day: parseInt(moment(md).format('D'), 10)
    });

    this.auditlogFilterInfoForm.get('ToDate').setValue({
      year: parseInt(moment(md).format('YYYY'), 10),
      month: parseInt(moment(md).format('M'), 10),
      day: parseInt(moment(md).format('D'), 10)
    });
      let fromdate1: any =  this.auditlogFilterInfoForm.get('FromDate').value ;
      let todate1: any =  this.auditlogFilterInfoForm.get('ToDate').value ;
      let frmdateStr1 : string = null;
      let todateStr1 : string = null;
      frmdateStr1 = fromdate1["month"] + '-' + fromdate1["day"] + '-' + fromdate1["year"];
      fromdate1 = this.reqDateFormatPipe.transform(frmdateStr1);
      todateStr1 = todate1["month"] + '-' + todate1["day"] + '-' + todate1["year"];
      todate1 = this.reqDateFormatPipe.transform(todateStr1);
      let auditlogFilterData: AuditLogFilter = new AuditLogFilter();
      auditlogFilterData.FromDate = this.reqDateFormatPipe.transform(frmdateStr1);
      auditlogFilterData.ToDate = this.reqDateFormatPipe.transform(todateStr1);
      auditlogFilterData.CompanyId = this.companyId;
      this.getAuditLogs(auditlogFilterData);
      this.showLeftPanelLoadingIcon = true;
      this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
          this.companyId = data;
      });
       
    this.screenWidth = window.innerWidth-180;
   
    }
  filterData() { 
   let fromdate: any =  this.auditlogFilterInfoForm.get('FromDate').value ;
   let todate: any =  this.auditlogFilterInfoForm.get('ToDate').value ;
   let frmdateStr : string = null;
   let todateStr : string = null;
    if (fromdate != null) {
      frmdateStr = fromdate["month"] + '-' + fromdate["day"] + '-' + fromdate["year"];
      fromdate = this.reqDateFormatPipe.transform(frmdateStr);
    }
    if (todate != null) {
      todateStr = todate["month"] + '-' + todate["day"] + '-' + todate["year"];
      todate = this.reqDateFormatPipe.transform(todateStr);
    }
                     
    if ( fromdate == null && todate == null)
    {
           this.filterMessage = "Please select any filter criteria";
       
        return;
    }
    else if(fromdate!=null && todate == null)
    {
        if (open) {
            this.filterMessage = "Please select To Date";
        }
        return;
    }
    else if(fromdate==null && todate != null)
    {   if (open) {
            this.filterMessage = "Please select From Date";
        }
        return;
    }
 
    else
     if((fromdate!=null && todate != null && fromdate > todate))
    {   if (open) {
            this.filterMessage = "From Date Should be less than To Date";
        }
        return;
    }
    let auditlogFilterData: AuditLogFilter = new AuditLogFilter();
    auditlogFilterData.FromDate = this.reqDateFormatPipe.transform(frmdateStr);
    auditlogFilterData.ToDate = this.reqDateFormatPipe.transform(todateStr);
    auditlogFilterData.CompanyId = this.companyId;
   
    this.auditLogAPIService.filterAuditLog(auditlogFilterData)
    .subscribe((data: any)=>{
      console.log(data);
      if (data != null) {
         this.auditLogs =data;
       }
       else
       {
         this.gridNoMessageToDisplay; 
       }
   });
  }
  resetFilters()
  {
    this.auditlogFilterInfoForm.reset();
    this.filterMessage="";
  }

  showLeftCol(event)
  {
   $(".leftdiv").removeClass("hideleftcol"); 
   $(".rightPanel").removeClass("showrightcol"); 
  }

  getAuditLogs(auditlogFilterData): void {
    this.showLeftPanelLoadingIcon = true;
    let auditLogResult = <Observable<Array<any>>>this.auditLogAPIService.getAuditLogs(auditlogFilterData);
    auditLogResult.subscribe((data: any) => {
      if (data != null) {
      this.auditLogs = data;
     
      }
      this.showLeftPanelLoadingIcon = false;
    });
  }
  fullScreen() {

  }

  customSort(event: SortEvent) {    

    event.data.sort((data1, data2) => {
        let value1 = data1[event.field];
        let value2 = data2[event.field];
        let result = null;

        if (value1 == null && value2 != null)
            result = -1;
        else if (value1 != null && value2 == null)
            result = 1;
        else if (value1 == null && value2 == null)
            result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
            result = value1.localeCompare(value2);
        else
            result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

        return (event.order * result);
    });
}
}

