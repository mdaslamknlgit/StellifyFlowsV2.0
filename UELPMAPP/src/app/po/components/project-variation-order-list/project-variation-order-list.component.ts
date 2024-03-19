import { ProjectMasterContract, VariationOrder, VOColumns } from './../../models/project-variation-order.model';
import { Component, OnInit } from '@angular/core';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Observable, of } from 'rxjs';
import { PagerConfig,Messages, Suppliers, UserDetails, WorkFlowProcess } from '../../../shared/models/shared.model';
import { SharedService } from "../../../shared/services/shared.service";
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ProjectContractVariationApiService } from '../../services/project-contract-variation.api.service';
import { PMCGridColumns, PTableColumn } from '../../models/project-payment-history.model';
import { ProjectContractMasterService } from '../../services/project-contract-master.service';
import { ProjectMasterContractDisplayResult } from '../../models/project-contract-master.model';
import { RequestConfig } from '../../models/RequestConfig';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Locations } from '../../../inventory/models/item-master.model';
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { ConfirmationService } from 'primeng/api';
import { GenericService } from '../../../shared/sevices/generic.service';
import jsPDF from 'jspdf';
import { ExportToCsv } from 'export-to-csv';
import { ExportService } from '../../services/export.service';
import { ExcelJson } from '../interfaces/excel-json.interface';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-project-variation-order-list',
  templateUrl: './project-variation-order-list.component.html',
  styleUrls: ['./project-variation-order-list.component.css']
})
export class ProjectVariationOrderListComponent implements OnInit {
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

  exportColumns;
  SelexportColumns;
  purchaseOrderPagerConfig:PagerConfig;
  currentPage:number =1;
  showLeftPanelLoadingIcon:boolean=false;
  pMCGridColumns: PTableColumn[] = [];
  showContractDialog: boolean = false;
  FiltersForm: FormGroup;
  MastersFiltersForm: FormGroup;
  userDetails: UserDetails = null;
  importVOColumns: Array<{ field: string, header: string }> = [];
  companyId: number = 0;
  variationOrders: VariationOrder[] = [];
  VariationOrdersFilters:VariationOrder[] = [];

 
  IsFilterDataArrive:boolean=false;
  interval;
  FileName:string="";
  FileNo:number=0;
  CurrentDate:string="";
  moduleHeading: string = "";
  isApprovalPage: boolean = false;
  pageType: string = "";
  projectPoList: ProjectMasterContract[] = [];
  
  fetchFilterData: boolean = false;
  requestConfig: RequestConfig = new RequestConfig();
  showWFPopup: boolean = false;
  validationMessage: string = '';
  newPermission: boolean = false;
  public screenWidth: any;
  userRoles = [];
  rolesAccessList = [];
  constructor(
    private exportService: ExportService,
    private sessionService: SessionStorageService,
    private router: Router,
    private formbuilderObj: FormBuilder,
    public route: ActivatedRoute,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    private projectContractMasterServiceObj: ProjectContractMasterService,
    public projectContractVariationAPIService: ProjectContractVariationApiService,
    public genericService: GenericService,
    private datePipe: DatePipe) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
  }

  resetPagerConfig()
  {
      this.purchaseOrderPagerConfig.RecordsToSkip = 0;
      this.purchaseOrderPagerConfig.RecordsToFetch = 25;
      this.currentPage = 1;
  }
  initializeFilterForm(): void {
    // Here also we can set the intial value Like dob:[ {year:1989 ,month:06, day: 10  }, ..... 
    //   this.profileForm = this.fb.group({
    //     userInfo: this.fb.group({
    //       dob: ['', [Validators.required]],
    //     }),
    //   });
    this.FiltersForm = this.formbuilderObj.group({
      'FromDate': [new Date()],
      'ToDate': [new Date()],
      'POPDocumentCode': [''],
      'SupplierName': ['']
    });

}

  ngOnInit() {
    this.purchaseOrderPagerConfig = new PagerConfig();
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


    this.MastersFiltersForm = this.formbuilderObj.group({
      'StartDate': [new Date()],
      'EndDate': [new Date()],
      'ContractName': [''],
      'SupplierName': ['']
    });
    this.importVOColumns = VOColumns.filter(item => item);
    this.pMCGridColumns = PMCGridColumns.filter(item => item);
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Project Variation Order List" : "Project Variation Order Approval List";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
      this.getVOList();
      this.getRoles();
    });
    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      this.companyId = data;
      this.getVOList();
      this.getRoles();
    });

    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-180;
      }
  }
  getRoles() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    if (this.companyId > 0) {
      this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        userDetails.Roles = this.userRoles;
        this.sessionService.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            if (this.rolesAccessList != null && this.rolesAccessList.length > 0) {
              let formRole = this.rolesAccessList.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectvariationorder")[0];
              this.newPermission = formRole.IsAdd;
            }
            else {
              this.newPermission = false;
            }
          });
        }
      });
    }
  }
  getVOList() {
    this.showLeftPanelLoadingIcon=true;
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
      FromTime: moment(this.FiltersForm.get('FromDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      ToTime: moment(this.FiltersForm.get('ToDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      SupplierName: supplierName,
      POPDocumentCode: this.FiltersForm.get('POPDocumentCode').value
    };
    debugger;
    this.projectContractVariationAPIService.getVOList(this.requestConfig).subscribe((data: VariationOrder[]) => {
      debugger;
      if(data.length>0)
      {

        // this.interval = setTimeout(() => {
        //   debugger;
        //   this.variationOrders = data;
        //   this.VariationOrdersFilters=data;
        //   this.IsFilterDataArrive=true;
        //   this.showLeftPanelLoadingIcon=false;
        // }, 3000);

        this.variationOrders = data;
        this.VariationOrdersFilters=data;
        this.IsFilterDataArrive=true;
        this.showLeftPanelLoadingIcon=false;
      }
      else
      {
        this.IsFilterDataArrive=false;
        this.showLeftPanelLoadingIcon=false;
      }
    });
  }

  addRecord() {
    this.MastersFiltersForm.reset();
    this.showContractDialog = true;
    this.projectContractMasterServiceObj.GetProjectMasterApprovedDetails(this.companyId, this.userDetails.UserID).subscribe((data: ProjectMasterContractDisplayResult) => {
      if (data != null && data.ProjectMasterContractList != null) {
        this.projectPoList = data.ProjectMasterContractList;
      }
    });
  }
  viewRecord(voList: VariationOrder) {
    this.router.navigate(['po/projectcontractvariation/' + this.pageType + '/' + voList.POPId + '/' + voList.VOId]);
  }
  getProjectContractMasterDetails(data: ProjectMasterContract) {
    this.sharedServiceObj.getDepartmentsWorkFlow(this.companyId, WorkFlowProcess.ProjectContractVariationOrder).subscribe((res: Array<Locations>) => {
      let Departments = res.filter(item => item.Name != 'Inventory');
      var wfDepartment = Departments.filter(x => x.HasWorkflow && x.Name.toLowerCase() == data.Location.toLowerCase());
      if (wfDepartment.length == 0) {
        this.showWFPopup = true;
        this.validationMessage = 'Selected department ' + data.Location + ' does not have workflow.'
      }
      else {
        let document: any = {
          DocumentId: data.ProjectMasterContractId,
          DocumentTypeId: WorkFlowProcess.ProjectContractVariationOrder
        };
        this.genericService.checkPendingDocuments(document).subscribe((result: boolean) => {
          if (result) {
            this.showContractDialog = false;
            this.showWFPopup = true;
            this.validationMessage = Messages.VOHasPendingDocuments;
          }
          else {
            this.router.navigate(['po/projectcontractvariation/request/' + data.ProjectMasterContractId + '/0']);
          }
        });
      }
    });
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
  getFilterData() {
    this.fetchFilterData = true;
    this.getVOList();
  }
  getMasterFilterData() {
    debugger;
    let supplier = this.MastersFiltersForm.get('SupplierName').value;
    let supplierName = '';
    if (supplier != null) {
      supplierName = supplier.SupplierName;
    }
    let displayInput = {
      ProjectName: this.MastersFiltersForm.get('ContractName').value,
      SupplierName: supplierName,
      CompanyId: this.companyId,
      CreatedBy: this.userDetails.UserID,
      StartDate: moment(this.MastersFiltersForm.get('StartDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      EndDate: moment(this.MastersFiltersForm.get('EndDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString()
    };
    this.projectContractMasterServiceObj.getPaymentProjectMasterFilterData(displayInput).subscribe((data: ProjectMasterContractDisplayResult) => {
      if (data != null) {
        this.projectPoList = data.ProjectMasterContractList;
      }
    });
  }
  resetFilters() {
    this.FiltersForm.reset();
    this.fetchFilterData = false;
    this.getVOList();
  }
  closeValidationPopUp() {
    this.showWFPopup = false;
  }

  //Export Functionality Starts Here
  stopTime() {
    clearInterval(this.interval);
    this.showLeftPanelLoadingIcon=false;
  }
  SetFilterData()
  {
    let supplier = this.MastersFiltersForm.get('SupplierName').value;
    let supplierName = '';
    if (supplier != null) {
      supplierName = supplier.SupplierName;
    }
    let displayInput = {
      ProjectName: this.MastersFiltersForm.get('ContractName').value,
      SupplierName: supplierName,
      CompanyId: this.companyId,
      CreatedBy: this.userDetails.UserID,
      StartDate: moment(this.MastersFiltersForm.get('StartDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      EndDate: moment(this.MastersFiltersForm.get('EndDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString()
    };

    

     //*************************************************************************************************************/
     //From Date Str
     //*************************************************************************************************************/
    //  this.DateFromJsonString=  JSON.stringify(poFilterData.FromDate);

    //  let jsonFromObj = JSON.parse(this.DateFromJsonString); // string to "any" object first
    //  let FromDateObj = jsonFromObj as DateObj;

    //   if (FromDateObj != null) {
    //       if (FromDateObj.month.toString().length > 0) {
    //           //Day
    //           let FromDateDay = Number(FromDateObj.day);
    //           if (FromDateDay <= 9) {
    //               this.FromDateDayStr = "0" + FromDateDay;
    //           }
    //           else {
    //               this.FromDateDayStr = FromDateDay.toString();
    //           }
    //           //Month
    //           let FromDateMonth = Number(FromDateObj.month);
    //           if (FromDateMonth <= 9) {
    //               this.FromDateStr = FromDateObj.year + "-0" + FromDateObj.month + "-" + this.FromDateDayStr;
    //           }
    //           else {
    //               this.FromDateStr = FromDateObj.year + "-" + FromDateObj.month + "-" + this.FromDateDayStr;
    //           }
    //       }
    //   }
     
    //  console.log(this.FromDateStr);
     //*************************************************************************************************************/
     //*************************************************************************************************************/
     //To Date Str
     //*************************************************************************************************************/
    //  this.DateToJsonString=  JSON.stringify(poFilterData.ToDate);

    //  let jsonToObj = JSON.parse(this.DateToJsonString); // string to "any" object first
    //  let ToDateObj = jsonToObj as DateObj;

     
    //  if(ToDateObj !=null)
    //  {
    //     if(ToDateObj.month.toString().length>0)
    //     {
    //         let ToDateDay= Number(ToDateObj.day);
    //         if(ToDateDay<=9)
    //         {
    //             this.ToDateDayStr="0"+ ToDateDay;
    //         }
    //         else
    //         {
    //             this.ToDateDayStr=ToDateDay.toString();
    //         }

    //         let ToDateMonth= Number(ToDateObj.month);
    //         if(ToDateMonth<=9)
    //         {
    //             this.ToDateStr =ToDateObj.year +"-0" + ToDateObj.month + "-" + this.ToDateDayStr;
    //         }
    //         else
    //         {
    //             this.ToDateStr =ToDateObj.year +"-" + ToDateObj.month + "-" + this.ToDateDayStr;
    //         }
    //     }
    // }
     
    //  console.log(this.ToDateStr);
     //*************************************************************************************************************/
     debugger;
     this.getVOList();
    
  }

  ExportToExcel()
  {
    //alert("Export To CSV");
    debugger;

    this.SetFilterData();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        debugger;
        if(this.IsFilterDataArrive)
        {
            debugger;
            if (this.VariationOrdersFilters.length > 0) {
                //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //this.exportToExcel();
                const edata: Array<ExcelJson> = [];
                const udt: ExcelJson = {
                data: [
                    //{ A: 'User Data' }, // title
                    { 
                      A: 'POP Code', B: 'VO Code',C:'Supplier Name', D: 'Created Date',E: 'Original Contract Value' , F: 'Current VO Sum',G: 'Total VO Sum',H: 'Revised Contract Value',I: 'Status'
                    }, // table header
                ],
                skipHeader: false
                };

                this.VariationOrdersFilters.forEach(polist => {
                  //debugger;
                  let VCreatedDAte=moment(polist.CreatedDate).format('YYYY-MM-DD').toLocaleString();
                  udt.data.push({
                      A: polist.POPDocumentCode,
                      B: polist.VODocumentCode,
                      C: polist.SupplierName,
                      D: VCreatedDAte,
                      E: polist.OriginalContractSum,
                      F: polist.VOSum,
                      G: polist.TotalVOSum,
                      H: polist.RevisedContractTotal,
                      I: polist.Status 
                  });
                });
                edata.push(udt);

                // // adding more data just to show "how we can keep on adding more data"
                // const bd = {
                //   data: [
                //     // chart title
                //     { A: 'Some more data', B: '' },
                //     { A: '#', B: 'First Name', C: 'Last Name', D: 'Handle' }, // table header
                //   ],
                //   skipHeader: true
                // };
                // this.users.forEach(user => {
                //   bd.data.push({
                //     A: String(user.id),
                //     B: user.firstName,
                //     C: user.lastName,
                //     D: user.handle
                //   });
                // });
                // edata.push(bd);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ProjectVariationOrdersLists_" + this.CurrentDate+"_"+this.FileNo.toString();

                this.exportService.exportJsonToExcel(edata, this.FileName);
                this.stopTime();
            }
        }
      }, 1000);
    
  }
  ExportToCSV()
  {
    //alert("Export To CSV");
    //alert("Total Records CSV : " +this.TotalRecords);
    this.SetFilterData();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        debugger;
        if(this.IsFilterDataArrive)
        {
            debugger;
            if (this.VariationOrdersFilters.length > 0) {
                //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //A: 'POP Code', B: 'VO Code',C:'Supplier Name', D: 'Created Date',E: 'Original Contract Value' , 
                //F: 'Current VO Sum',G: 'Total VO Sum',H: 'Revised Contract Value',I: 'Status'
                // POPId,
                // VOId,
                // POPDocumentCode,
                // VODocumentCode,
                // RevisedContractTotal,
                // SupplierName,
                // OriginalContractSum,
                // TotalVOSum,
                // Status,
                // CreatedDate,
                // VOSum:string
                const options = { 
                    fieldSeparator: ',',
                    quoteStrings: '"',
                    decimalSeparator: '.',
                    showLabels: true, 
                    showTitle: true,
                    title: this.moduleHeading,
                    useTextFile: false,
                    useBom: true,
                    headers: ['POPId','VOId','POPDocumentCode','VODocumentCode','RevisedContractTotal','SupplierName',
                    'OriginalContractSum','TotalVOSum','Status','CreatedDate','VOSum']
                };
                 const csvExporter = new ExportToCsv(options);
                 csvExporter.generateCsv(this.VariationOrdersFilters);
                 this.stopTime();
            }
        }
      }, 1000);
  }

  ExportToPDF()
  {
    //alert("Export To PDF");
    // const doc = new jsPDF();
    //alert("Total Records PDF : " +this.TotalRecords);
    debugger;

    //Get Filter Data
    this.SetFilterData();

      this.interval = setTimeout(() => {
        //alert("Alert activated")
        debugger;
        if(this.IsFilterDataArrive)
        {
            debugger;
            if (this.VariationOrdersFilters.length > 0) {
                //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
    
                this.exportColumns = this.importVOColumns.map((col) => ({
                    title: col.header,
                    dataKey: col.field,
                }));
    
                //Remove Action Column
                this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                const doc = new jsPDF('p', 'pt');
                doc['autoTable'](this.SelexportColumns, this.VariationOrdersFilters);
                // doc.autoTable(this.exportColumns, this.products);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ProjectVariationOrdersLists_" + this.CurrentDate+"_"+this.FileNo.toString();

                doc.save(this.FileName+ '.pdf');
                this.IsFilterDataArrive=false;
                this.stopTime();
            }
        }
      }, 1000);
    }  

  //Export Functionality Ends Here



}
