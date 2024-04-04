import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, SortEvent } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, UserDetails } from '../../../shared/models/shared.model';
import { DepartmentManagement, DepartmentManagementDisplayResult } from '../../models/department';
import { DepartmentApiService } from '../../services/department-api.service';
import { FullScreen } from '../../../shared/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css'],
  providers: [DepartmentApiService]
})
export class DepartmentsListComponent implements OnInit {

    public selectedItems: any[];
    departmentPagerConfig: PagerConfig;  
    departmentManagementList: Array<DepartmentManagement> = [];
    selectedDepartmentManagementRecord: DepartmentManagement;
    slideactive:number=0;
    recordsToSkip: number = 0;
    recordsToFetch: number = 100;
    totalRecords: number = 0;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    departmentFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    initDone = false;
    scrollbarOptions: any;
    isFilterApplied: boolean = false;
    departmentForm: FormGroup;  
    formSubmitAttempt: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    filteredDepartment = [];
    departmentSearchKey: string = null;  
    companyId:number;
    newPermission: boolean;
    editPermission: boolean;
    showfilters:boolean=true;
    showfilterstext:string="Hide List" ;

    public innerWidth: any;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('userName') private userRef: any;

    
    constructor(private formBuilderObj: FormBuilder,
        private router: Router,
      private departmentApiServiceObj: DepartmentApiService,
      private confirmationServiceObj: ConfirmationService,
      private sharedServiceObj: SharedService,
      public sessionService: SessionStorageService,
      private renderer: Renderer) {
        this.companyId = this.sessionService.getCompanyId();

       }

    ngOnInit() {
         //getting role access levels  
    let roleAccessLevels = this.sessionService.getRolesAccess();
      if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "department")[0];

      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;      
    }
    else {
      this.newPermission = true;
      this.editPermission = true;      
    }
      this.departmentPagerConfig = new PagerConfig();
      this.departmentPagerConfig.RecordsToSkip = 0;
      this.selectedDepartmentManagementRecord = new DepartmentManagement();
      this.departmentPagerConfig.RecordsToFetch = 100;

      this.departmentForm = this.formBuilderObj.group({  
        'Name': [null,{ validators: [Validators.required]}],
        'Code': [null, [Validators.required]],
        'Description':[""],
        'IsDeleted':[null, [Validators.required]]
        // 'IsDepartment': 0,

      });

      this.sharedServiceObj.CompanyId$
        .subscribe((data)=>{
          this.companyId = data;
          this.getDepartment(0);         
        });

        this.getDepartment(0);
        this.showfilters =false;
        this.showfilterstext="Hide List" ;
    }

    matselect(event){ 
        if(event.checked==1){
        this.slideactive=0;  
        }
        else{
          this.slideactive=1;   
        }
    }

    retrievematselect(event){ 
        if(event==1){
        this.slideactive=0;  
        }
        else{
          this.slideactive=1;   
        }
    }
    
  onSearchInputChange(event: any) { 
    if (this.departmentSearchKey != "") {
        if (this.departmentSearchKey.length >= 3) {
            this.getAllSearchCurrency(this.departmentSearchKey, 0);
        }
    }
    else {
          this.getDepartment(0);
        }
    }

    getAllSearchCurrency(searchKey: string, idToBeSelected: number) {
        let userListInput = {
            Skip: 0,
            Take: this.departmentPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId:this.companyId
        };
        this.departmentApiServiceObj.getDepartment(userListInput)
            .subscribe((data: DepartmentManagementDisplayResult) => {
                this.departmentManagementList = data.DepartmentList
                this.departmentPagerConfig.TotalRecords = data.TotalRecords
                if (this.departmentManagementList.length > 0) {
                    if (idToBeSelected === 0) {
                        this.onRecordSelection(this.departmentManagementList[0].LocationId);
                    }
                    else {
                        this.onRecordSelection(idToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }

    getDepartment(IdToBeSelected: number) {
      let displayInput = {
          Skip: this.departmentPagerConfig.RecordsToSkip,
          Take: this.departmentPagerConfig.RecordsToFetch,
          Search: "",
          CompanyId:this.companyId
      };
      this.departmentApiServiceObj.getDepartment(displayInput)
          .subscribe((data: DepartmentManagementDisplayResult) => {             
              this.departmentManagementList = data.DepartmentList;
              this.departmentPagerConfig.TotalRecords = data.TotalRecords;
              this.showLeftPanelLoadingIcon = false;
              if (this.departmentManagementList.length > 0) {
                //   if (IdToBeSelected == 0) {
                //       this.onRecordSelection(this.departmentManagementList[0].LocationId);

                //   }
                //   else {
                //       this.onRecordSelection(IdToBeSelected);
                //   }
              }
              else {
                  this.addRecord();
              }
          }, (error) => {
              this.showLeftPanelLoadingIcon = false;
          });
    }

    EditDepartment(deptId)
    {
        this.router.navigate([`/admin/departments/${'EDIT'}/${deptId}`]);
    }

    onRecordSelection(locationId: number) {

        this.split();
        this.departmentApiServiceObj.getDepartmentDetails(locationId)
            .subscribe((data: DepartmentManagement) => {
                this.selectedDepartmentManagementRecord = data;
                this.departmentForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon = false;
            });
    }

    hidefilter(){
        this.innerWidth = window.innerWidth;       
        if(this.innerWidth < 550){      
        $(".filter-scroll tr").click(function() {       
        $(".leftdiv").addClass("hideleftcol");
        $(".rightPanel").addClass("showrightcol");  
        $(".rightcol-scrroll").height("100%");  
      }); 
      }
      }

    addRecord() {

        this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }
  
        this.hidetext = false;
        this.hideinput = true;
        this.selectedDepartmentManagementRecord = new DepartmentManagement();
        this.departmentForm.reset();
        this.departmentForm.setErrors(null);
        this.departmentForm.patchValue({            
           // IsDepartment:0            
           IsDeleted:0
          });
          this.showfilters =false;
    this.showfilterstext="Hide List" ;
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.departmentForm.reset();
        this.departmentForm.setErrors(null);
        console.log(this.selectedDepartmentManagementRecord);     
        this.departmentForm.patchValue(this.selectedDepartmentManagementRecord);
        // this.matselect(this.selectedDepartmentManagementRecord.IsDepartment)
        //this.retrievematselect(this.selectedDepartmentManagementRecord.IsDeleted)
    }

    cancelRecord() {
          this.departmentForm.reset();
          this.departmentForm.setErrors(null);
          this.formSubmitAttempt = false;
          if (this.departmentManagementList.length > 0 && this.selectedDepartmentManagementRecord != undefined) {
              if (this.selectedDepartmentManagementRecord.LocationId == undefined || this.selectedDepartmentManagementRecord.LocationId == 0) {
                  this.onRecordSelection(this.departmentManagementList[0].LocationId);
              }
              else {
                  this.onRecordSelection(this.selectedDepartmentManagementRecord.LocationId);
              }
              this.hideinput = false;
              this.hidetext = true;
          }
          else {
              this.hideinput = null;
              this.hidetext = null;
          }
      }

  
    deleteRecord() {    
        let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();    
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedDepartmentManagementRecord.LocationId;
                this.departmentApiServiceObj.deleteDepartment(recordId,userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });

                    this.getDepartment(0);
                });
            },
            reject: () => {
            }
        });
    }


    saveRecord() {
          console.log(this.departmentForm.value);         
          let departmentFormStatus = this.departmentForm.status;            
          if (departmentFormStatus != "INVALID") {
            if(this.departmentForm.get('Name').value.trim()==""||this.departmentForm.get('Name').value.trim()==null){
                this.departmentForm.get('Name').setErrors({
                    'EmptyDepartment': true
                });
                    return;
            }
            if(this.departmentForm.get('Code').value.trim()==""||this.departmentForm.get('Code').value.trim()==null){         
                this.departmentForm.get('Code').setErrors({
                    'EmptyCode': true
                });     
                return;
            }       
            let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();    
              let departmentmanagementDetails: DepartmentManagement = this.departmentForm.value;
              
            //   departmentmanagementDetails.IsDepartment=departmentmanagementDetails.IsDepartment==1?1:0;
              departmentmanagementDetails.IsDeleted=departmentmanagementDetails.IsDeleted==1?1:0;
              departmentmanagementDetails.CreatedBy = userDetails.UserID;
              departmentmanagementDetails.CompanyId=this.companyId;
              console.log(departmentmanagementDetails);

              if (this.selectedDepartmentManagementRecord.LocationId == 0 || this.selectedDepartmentManagementRecord.LocationId == null) {
                departmentmanagementDetails.LocationId=0;
                  this.departmentApiServiceObj.createDepartment(departmentmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                      if (response.Status == ResponseStatusTypes.Success) {
                          this.hidetext = true;
                          this.hideinput = false;
                          this.sharedServiceObj.showMessage({
                              ShowMessage: true,
                              Message: Messages.SavedSuccessFully,
                              MessageType: MessageTypes.Success
                          });
                          this.formSubmitAttempt = false;
                          this.getDepartment(response.Value);
                      }
                      else if (response.Status == "Duplicate Department Name") {
                          this.departmentForm.get('Name').setErrors({
                              'DuplicateDepartment': true
                          });
                      }
                  });
              }
              else {
                departmentmanagementDetails.LocationId = this.selectedDepartmentManagementRecord.LocationId;

                  this.departmentApiServiceObj.updateDepartment(departmentmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                      if (response.Status == ResponseStatusTypes.Success) {
                          this.hidetext = true;
                          this.hideinput = false;
                          this.sharedServiceObj.showMessage({
                              ShowMessage: true,
                              Message: Messages.UpdatedSuccessFully,
                              MessageType: MessageTypes.Success
                          });
                          this.formSubmitAttempt = false;

                          this.getDepartment(departmentmanagementDetails.LocationId);

                      }
                      else if (response.Status == "Duplicate Department Name") {
                        this.departmentForm.get('Name').setErrors({
                            'DuplicateDepartment': true
                        });
                    }
                  });
              }
          }
          else {            
              Object.keys(this.departmentForm.controls).forEach((key: string) => {
                  if (this.departmentForm.controls[key].status == "INVALID" && this.departmentForm.controls[key].touched == false) {
                      this.departmentForm.controls[key].markAsTouched();
                  }
              });
          }
      }


    pageChange(currentPageNumber: any) {
        this.departmentPagerConfig.RecordsToSkip = this.departmentPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getDepartment(0);
        this.showfilters =false;
        this.showfilterstext="Hide List" ;
    }

    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
        if(this.showfilters == false){ 
         //   this.showfilterstext="Show List"
        }
      }
      
    split() {
    this.showfilters=!this.showfilters;
    if(this.showfilters == false){ 
    this.showfilterstext="Hide List" 
    }
    else{
      this.showfilterstext="Show List" 
    }
    }

    showLeftCol(event)
    {
        $(".leftdiv").removeClass("hideleftcol"); 
        $(".rightPanel").removeClass("showrightcol"); 
    }

    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
    }

    
    openDialog() {
      this.initDone = true;
      if (this.userRef != undefined) {
          this.userRef.nativeElement.focus();
          this.renderer.invokeElementMethod(this.userRef.nativeElement, 'focus'); // NEW VERSION
      }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        //this.resetFilters();
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
      
        sortTableData(event) {
        event.data.sort((data1, data2) => {
          let value1 = data1[event.field];
          let value2 = data2[event.field];
          let result = null;
          if (value1 == null && value2 != null) result = -1;
          else if (value1 != null && value2 == null) result = 1;
          else if (value1 == null && value2 == null) result = 0;
          else if (typeof value1 === 'string' && typeof value2 === 'string')
            result = value1.localeCompare(value2);
          else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      
          return event.order * result;
        });
      }
      
}
