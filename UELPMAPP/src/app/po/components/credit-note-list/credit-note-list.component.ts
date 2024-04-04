import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Invoices, Suppliers, UserDetails } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { ActivatedRoute, ParamMap, Router } from '../../../../../node_modules/@angular/router';
import { CreditNoteService } from '../../services/credit-note.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { RequestConfig } from '../../models/RequestConfig';
import { CreditNotePaymentColumns, PTableCreditNoteColumn } from '../../models/credit-note.model';

import * as moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-credit-note-list',
  templateUrl: './credit-note-list.component.html',
  styleUrls: ['./credit-note-list.component.css'],
  providers: [CreditNoteService]
})
export class CreditNoteListComponent implements OnInit {
  moduleHeading = '';
  // public cols: Array<{ field: string, header: string, width: string }> = [];
  public CreditNoteLists: any;
  companyId: any
  FiltersForm: FormGroup;
  AddPermission: boolean = false;
  userDetails: UserDetails = null;
  pageType: string = "";
  isApprovalPage: boolean = false;
  requestConfig: RequestConfig = new RequestConfig();
  fetchFilterData: boolean = false;
  public screenWidth: any;
  public CreditNoteCols: PTableCreditNoteColumn[] = [];
  //*****************************************************************************************************************/
  //Dates Related Variables
  //*****************************************************************************************************************/
  firstDay:string="";
  currentDay:string="";
  lastDay:string="";
  currentDate:string;
  priorDate:Date;
  todayDate = new Date();

  firstDate:string="";
  lastDate:string="";

  FromDateStr:string;
  ToDateStr:string;

  jsonString: string = '[{"year":2023,"month":3,"day":1}]';
  jsonObj: Array<object>;
  jsonObj2: Array<object> = [{ title: 'test' }, { title: 'test2' }];

  DateToJsonString:string;
  DateFromJsonString:string;

  FromDateDayStr:string;
  ToDateDayStr:string;
//*****************************************************************************************************************/
  
  constructor(private route: Router,
    private CreditListService: CreditNoteService,
    private sharedServiceObj: SharedService,
    private ActivateRoute: ActivatedRoute,
    private formbuilderObj: FormBuilder,
    private router: Router,
    private sessionServiceObj: SessionStorageService,
    private datePipe: DatePipe) {
    this.companyId = this.sessionServiceObj.getCompanyId();
    this.userDetails = <UserDetails>this.sessionServiceObj.getUser();
  }
  initializeFilterForm(): void {
    this.FiltersForm = this.formbuilderObj.group({
      'DocumentCode': [''],
      'InvoiceCode': [''],
      'SupplierName': [''],
      'FromDate': [''],
      'ToDate': [''],
    });
  //   this.FiltersForm = this.formbuilderObj.group({
  //     DocumentCode: [''],
  //     InvoiceCode: [],
  //     SupplierName: [''],
  //     ToDate: [],
  //     FromDate: []
  // });

}

  ngOnInit() {
    
    this.initializeFilterForm();

    //**********************************************************************************************************************
    //Set Dates
    //**********************************************************************************************************************
    
    this.firstDate = moment().startOf('month').format('YYYY-MM-DD');
    this.currentDate = moment().format('YYYY-MM-DD').toString();
    this.priorDate = new Date(new Date().setDate(this.todayDate.getDate() - 30));
    this.lastDate = moment().endOf('month').format("YYYY-MM-DD");

    const FDate = this.priorDate;
    const CDate = new Date(this.currentDate);

    const FirstDateYear = Number(this.datePipe.transform(FDate, 'yyyy'));
    const FirstDateMonth = Number(this.datePipe.transform(FDate, 'MM'));
    const FirstDateDay = Number(this.datePipe.transform(FDate, 'dd'));

    const CurrentDateYear = Number(this.datePipe.transform(CDate, 'yyyy'));
    const CurrentDateMonth = Number(this.datePipe.transform(CDate, 'MM'));
    const CurrentDateDay = Number(this.datePipe.transform(CDate, 'dd'));

    this.FiltersForm.controls.FromDate.setValue({
        year: FirstDateYear,
        month: FirstDateMonth,
        day: FirstDateDay
    });

    this.FiltersForm.controls.ToDate.setValue({
        year: CurrentDateYear,
        month: CurrentDateMonth,
        day: CurrentDateDay
    });
  //**********************************************************************************************************************

    this.pageType = this.router.url.indexOf('request') > 0 ? 'request' : 'approval';
    this.moduleHeading = this.pageType == "request" ? "Credit Note" : "Credit Note Approval";
    this.isApprovalPage = this.pageType == "approval" ? true : false;
    this.ActivateRoute.queryParams.subscribe((params) => {
      if (params['cid'] != null && params['cid'] != undefined) {
        this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
      }
    });
    let roleAccessLevels = this.sessionServiceObj.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let withInvRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "creditnotewithinvoice")[0];
      let withOutInvRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "creditnotewithoutinvoice")[0];
      this.AddPermission = (withInvRole.IsAdd) ? (withInvRole.IsAdd) : (withOutInvRole.IsAdd);
    }

    this.CreditNoteCols = CreditNotePaymentColumns.filter(item => item);

    // this.cols = [
    //   { field: 'S.No.', header: 'S.No.', width: '40px' },
    //   { field: 'Document Code', header: 'Document Code', width: '100px' },
    //   { field: 'Invoice Code', header: 'Invoice Code', width: '100px' },
    //   { field: 'Supplier Name', header: 'Supplier Name', width: '190px' },
    //   { field: 'Invoice No', header: 'Invoice No', width: '140px' },
    //   { field: 'Supplier Credit Note No', header: 'Supplier Credit Note No', width: '140px' },
    //   { field: 'Invoice Total Amount', header: 'Invoice Total Amount', width: '120px' },
    //   // { field: 'Invoice OS Amount', header: 'Invoice OS Amount', width: '120px' },
    //   { field: 'CreditNoteTotal', header: 'Credit Note Total', width: '140px' },
    //   { field: 'Status', header: 'Status', width: '120px' },
    //   { field: 'Option', header: 'Option', width: '80px' }
    // ];


    this.CreditNoteList();

    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      this.companyId = data;
    });
    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-170;
      }
  
  }

  CreditNoteList() {
    let supplier = this.FiltersForm.get('SupplierName').value;
    let supplierName = '';
    if (supplier != null) {
      supplierName = supplier.SupplierName;
    }
    this.requestConfig = {
      CompanyId: this.companyId,
      IsApprovalPage: this.isApprovalPage,
      UserId: this.userDetails.UserID,
      FetchFilterData: this.fetchFilterData,
      SupplierName: supplierName,
      InvoiceCode: this.FiltersForm.get('InvoiceCode').value,
      DocumentCode: this.FiltersForm.get('DocumentCode').value
    };
    this.CreditListService.GetCreditNotesList(this.requestConfig).subscribe(result => {
      this.CreditNoteLists = result
    })
  }

  CreditNotepage(id) {
    this.route.navigate(['/po/CreditNote/' + this.pageType + '/' + id + '']);
  }
  AddNewCreditNote() {
    this.route.navigate(['/po/CreditNote/' + this.pageType + '/0']);
  }

  supplierInputFormater = (x: Suppliers) => x.SupplierName;
  supplierSearch = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => {
      if (term == "") {

      }
      return this.sharedServiceObj.getSuppliers({
        searchKey: term,
        supplierTypeId: 0,
        companyId: this.companyId
      }).pipe(
        catchError(() => {
          return of([]);
        }))
    })
  );

  FilterData() {
    this.fetchFilterData = true;
    this.CreditNoteList();
  }

  resetFilters() {
    this.FiltersForm.reset();
    this.fetchFilterData = false;
    this.CreditNoteList();
  }
}
