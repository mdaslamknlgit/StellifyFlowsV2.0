import { Component, OnInit, ViewChild, Renderer, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, Companies, UserRoles, User, UserDetails, Countries } from '../../../shared/models/shared.model';
import { UserManagementList, UserManagement, UserManagementDisplayResult } from '../../models/usermanagement';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { EMAIL_PATTERN, INTERNATIONAL_NUMBER, NUMBER_PATERN } from '../../../shared/constants/generic';
import { SharedService } from '../../../shared/services/shared.service';
import { ConfirmationService } from 'primeng/primeng';
import { FullScreen, restrictMinus } from '../../../shared/shared';
import { UserManagementApiService } from '../../services/user-management-api.service';
import { Observable } from 'rxjs/internal/Observable';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { DisplayDateFormatPipe } from '../../../shared/pipes/display-date-format.pipe';
import {NgbModal, ModalDismissReasons, NgbDateAdapter, NgbDateNativeAdapter} from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SupplierApiService } from '../../../po/services/supplier-api.service';
import { Message } from '../../../../../node_modules/@angular/compiler/src/i18n/i18n_ast';
import { MatSnackBar, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  providers: [UserManagementApiService,SupplierApiService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class UserManagementComponent implements OnInit {

  
private result;
HeaderTitle: string;
ManagerId:number;
ManagerName:string;
IsReadonly:boolean;
ReportingUserList:any;

type: any;
  departmentsList = [];
  departmentListSettings = {};
  RoleListSettings = {};
  UserManagementPagerConfig: PagerConfig;  
  UserManagementList: Array<UserManagementList> = [];
  UserManagementListCols: any[];
  selectedUserManagementRecord: UserManagement;
  recordsToSkip: number = 0;
  recordsToFetch: number = 10;
  totalRecords: number = 0;
  hideText?: boolean = null;
  hideInput?: boolean = null;
  EditClicked:boolean=false;
  UserFilterInfoForm: FormGroup;
  filterMessage: string = "";
  initSettingsDone = true;
  showRightPanelLoadingIcon: boolean = false;
  showLeftPanelLoadingIcon: boolean = false;
  initDone = false;
  scrollbarOptions: any;
  isFilterApplied: boolean = false;
  userManagementForm: FormGroup;
  userRoles = [];
  formSubmitAttempt: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  ShowEditForm:boolean=false;
  UserID:number;
  filteredUser = [];
  userSearchKey: string = null;  
  companyId:number;
  gridRolesColumns: Array<{ field: string, header: string }> = [];
  linesToAdd:number=1;
  companiesList: Array<Companies> = [];
  rolesDetailsToDelete:Array<number> =[];
  countries = [];
  slideactive: boolean = false;
  slideactive1: boolean = false;
  showCodeErrorMessage:boolean = false;
  showGridErrorMessage:boolean=false;
  norecordserrmesagevisible:boolean=false
  newPermission: boolean;
  editPermission: boolean;
  importPermission: boolean;
  formError: string = "";
  errmesagevisible: boolean= false;
  UserName:string;
  SelectUserInfoForm:FormGroup;
  showSelectUsernameDialog:boolean=false;
  public screenWidth: any;
  showfilters:boolean=true;
  showfilterstext:string="Hide List" ;
  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('userName') private userRef: any;
  public innerWidth: any;
  constructor(
    public dialog: MatDialog,
    private formBuilderObj: FormBuilder,
    private supplierApiService: SupplierApiService,
    private userManagementApiServiceObj: UserManagementApiService,
    private confirmationServiceObj: ConfirmationService,
    private modalService: NgbModal,
    private sharedServiceObj: SharedService,
    private reqDateFormatPipe:RequestDateFormatPipe,
    public sessionService: SessionStorageService,private displayDateFormatPipe:DisplayDateFormatPipe,
    private renderer: Renderer) { 

      this.companyId = this.sessionService.getCompanyId();
        this.gridRolesColumns = [
          { field: 'Sno', header: 'S.no.' },
          { field: 'Company', header: 'Company' },
          { field: 'Role', header: 'Role' },
          { field: 'Department', header: 'Department' },
          { field: 'IsSelected', header: 'Default' },
          { field: 'IsDuplicate', header: 'Default' }
        
      ];
    }

  ngOnInit() {
      //getting role access levels  
      this.rightsection=true;
      this.EditClicked=false;
      this.UserManagementListCols = [
        { field: 'FirstName', header: 'First Name', width: '250px' },
        { field: 'UserName', header: 'User Name', width: '150px' },
        { field: 'EmailId', header: 'Email', width: '250px' },
        { field: 'PhoneNumber', header: 'Phone', width: '150px'  },
        { field: 'Designation', header: 'Designation', width: '200px'  },
        { field: '', header: 'Action',  width: '100px' },
    ];
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "usermanagement")[0];

      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.importPermission=formRole.IsImport;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.importPermission=true;
    }
      this.UserManagementPagerConfig = new PagerConfig();
      this.UserManagementPagerConfig.RecordsToSkip = 0;
      this.selectedUserManagementRecord = new UserManagement();
      this.UserManagementPagerConfig.RecordsToFetch = 25;

      this.userManagementForm = this.formBuilderObj.group({  
        'FirstName': [null, { validators: [Validators.required, this.noWhitespaceValidator]}],
        'MiddleName': [null],
        'LastName': [null, { validators: [Validators.required, this.noWhitespaceValidator]}],
        'Emailid': [null,{ validators: [Validators.required,Validators.pattern(EMAIL_PATTERN)]}],
        'PhoneNumber': [null, { validators: [Validators.pattern(INTERNATIONAL_NUMBER)] }],
        'Address1': [null,{ validators: [Validators.required, this.noWhitespaceValidator]}],
        'Address2': [null],
        'Address3': [null],
        'CountryName': ['', { validators: [Validators.required] }],
        'Country': ['', { validators: [Validators.required] }],
        'CountryId': [null,{ validators: [Validators.required]}],
        'ZipCode': [null, { validators: [Validators.pattern(NUMBER_PATERN), Validators.required] }],
        'EmailSignature': [null],
        'Designation': [null],
        'UserName': [null,{ validators: [Validators.required, this.noWhitespaceValidator]}],
        'IsActive': [null],
        'isLocked':[null],
        'isADUser':[null],
        'User': [null],
        'ApprovalStartDate': [null,{ validators: [Validators.required]}],
        'ApprovalEndDate': [null,{ validators: [Validators.required]}],
        'ManagerId': [null],
        'ManagerName': [null],
        'RolesDetails': this.formBuilderObj.array([])        
      });
      this.departmentListSettings = {
        singleSelection: false,
        maxHeight: 100,
        idField: 'LocationID',
        textField: 'Name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 1,
        allowSearchFilter: false
      };
      this.RoleListSettings = {
        singleSelection: false,
        maxHeight: 100,
        idField: 'RoleID',
        textField: 'RoleName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 1,
        allowSearchFilter: false
      };
      this.UserFilterInfoForm = this.formBuilderObj.group({
            UserName: [''],
            UserRoles: ['']
        });
        this.SelectUserInfoForm = this.formBuilderObj.group({
            UserName: [''],
            UserID: ['']
        });

    this.getUserRoles();
    this.getCountries();

    this.getUserManagement(0);
    //this.disableButton=true;
    if(window.innerWidth < 768){  
        this.screenWidth = window.innerWidth-160;
        }
        this.showfilters =false;
        this.showfilterstext="Hide List" ;    
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getDepartments(event,companyId): void {
      
    let departmentsList=<Observable<Array<any>>>this.sharedServiceObj.getDepartmentsByCompany(companyId);
    departmentsList.subscribe((data) => {
        debugger
      this.departmentsList = data;
    });
  }
  GetLDAPUserProfile()
  {
    let LDApUserResult = <Observable<Array<any>>>this.userManagementApiServiceObj.GetLDAPUserProfile();
    LDApUserResult.subscribe((data) => {   
       if(data !==null){
        this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.LDAPImportMessage,
            MessageType: MessageTypes.Success
        });
        // this.disableButton=true;
        //this.getUserManagement(0);
        return;
      }
    });
  }

  getUserRoles(): void {
      let usersResult = <Observable<Array<any>>>this.userManagementApiServiceObj.getUserRoles();
      usersResult.subscribe((data) => {
          this.userRoles = data;          
          this.userRoles = this.userRoles.filter(user => user.RoleName != "SupplierVerifier");          
      });
  }

  getCountries(): void {
    let countriesResult = <Observable<Array<any>>>this.supplierApiService.getCountries();
    countriesResult.subscribe((data) => {
      this.countries = data;
    });
  }
  
  showLeftCol(event)
  {
      $(".leftdiv").removeClass("hideleftcol"); 
      $(".rightPanel").removeClass("showrightcol"); 
  }

    showFullScreen() {
      FullScreen(this.rightPanelRef.nativeElement);
  }


  getUserManagement(UserIDToBeSelected: number) {
    let displayInput = {
        Skip: this.UserManagementPagerConfig.RecordsToSkip,
        Take: this.UserManagementPagerConfig.RecordsToFetch,
        Search: "",
        CompanyId: this.companyId
    };
    this.userManagementApiServiceObj.getUserManagement(displayInput)
        .subscribe((data: UserManagementDisplayResult) => {             
            this.UserManagementList = data.UserManagementList;
            this.UserManagementPagerConfig.TotalRecords = data.TotalRecords;
            this.showLeftPanelLoadingIcon = false;
            debugger;
            if (this.UserManagementList.length > 0) {
              this.split();
              this.ShowEditForm=false;
              //this.selectedUserManagementRecord = data.UserManagementList[0];            
              this.showRightPanelLoadingIcon = false;
              this.hideText = true;
              this.hideInput = true;

                if (UserIDToBeSelected == 0) {
                    //this.onRecordSelection(this.UserManagementList[0].UserID);
                    //this.UserIDToBeSelected = this.UserManagementList[0].UserID;
                }
                else {
                    //this.onRecordSelection(UserIDToBeSelected);
                }
            }
            else {
                //this.addRecord();
            }
        }, (error) => {
            this.showLeftPanelLoadingIcon = false;
        });
  }


  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  onSearchInputChange(event: any) {
    //debugger;
    if (this.userSearchKey != "") {
      if (this.userSearchKey.length > 3) {
        //debugger;
        this.getAllSearchUser(this.userSearchKey, 0);
      }
    }
    else {
      //this.getUserManagement(0);
      this.getAllSearchUser(this.userSearchKey, 0);
    }
  }

    userNameSelection(eventData: any)
    {
        this.norecordserrmesagevisible=false;
       this.userManagementForm.get('UserName').setValue(eventData);
       this.errmesagevisible = false;
      
    }

    usernameInputFormater = (x: UserManagement) => x.UserName;
    userNameSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
            if (term == "") {
              
                return of([]);
            }
            return this.userManagementApiServiceObj.GetUserNames(term).map((data: Array<UserManagement>) => {   
                
              
                if(data.length==0)
                {
                  
                    this.norecordserrmesagevisible=true;
                    this. errmesagevisible=false;
                }
                else
                {
                    this.norecordserrmesagevisible=false;
                return data;
               
                }


            }).pipe(
                catchError(() => {
                    return of([]);
                }))
        })
    ); 

    

    OpenUserNamepopup()
   {
     
    
     this.norecordserrmesagevisible=false;
     this. errmesagevisible=false;
     this.SelectUserInfoForm.get('UserID').setValue("");
    // this.showSelectUsernameDialog=true;
    this.displayUserNamePopup();
     
     
    }
displayUserNamePopup()
{
   let term="";
            return this.userManagementApiServiceObj.GetAllUserNames(term).subscribe((data: Array<UserManagement>) => {   
                
              
                if(data.length<=1)
                {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.UserValidationMessage ,
                        MessageType: MessageTypes.Error
            
                      });
                }
                else
                this.showSelectUsernameDialog=true;


            });
}

    SaveUserName(action:string)
    {
        let userData = this.SelectUserInfoForm.get('UserID').value;
        if(userData=="" || userData==undefined)
        {
           this. errmesagevisible=true;

        }
        this.userManagementApiServiceObj.saveUserNames(userData.UserID).subscribe((data:any)=>{

            if(data!=null)
            {
                this.showSelectUsernameDialog=false;
                this.SelectUserInfoForm.reset();
               this.getUserManagement(userData.UserID);
              
            }
            this.onRecordSelection(userData.UserID);

        });
        this.onRecordSelection(userData.UserID);
    }
            
  getAllSearchUser(searchKey: string, UserIDToBeSelected: number) {
            let userListInput = {
                Skip: 0,
                Take: this.UserManagementPagerConfig.RecordsToFetch,
                Search: searchKey,
                CompanyId:this.companyId
            };
            this.userManagementApiServiceObj.getUserManagement(userListInput)
                .subscribe((data: UserManagementDisplayResult) => {
                    this.UserManagementList = data.UserManagementList
                    this.UserManagementPagerConfig.TotalRecords = data.TotalRecords
                    // if (this.UserManagementList.length > 0) {
                    //     // if (UserIDToBeSelected === 0) {
                    //     //     this.onRecordSelection(this.UserManagementList[0].UserID);
                    //     // }
                    //     // else {
                    //     //     this.onRecordSelection(UserIDToBeSelected);
                    //     // }
                    // }
                    // else {
                    //     this.addRecord();
                    // }
                });
        }


  addRecord() {
    this.showfilters = false;
    this.showfilterstext = "Show List";
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 550) {
      $(".leftdiv").addClass("hideleftcol");
      $(".rightPanel").addClass("showrightcol");

    }

    this.ShowEditForm=true;
    this.hideText = false;
    this.hideInput = true;
    this.selectedUserManagementRecord = new UserManagement();
    this.userManagementForm.reset();
    this.userManagementForm.setErrors(null);
    this.showCodeErrorMessage = false;
    let itemGroupUserControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
    itemGroupUserControl.controls = [];
    itemGroupUserControl.controls.length = 0;
    this.userManagementForm.get('ApprovalStartDate').setValue(new Date());
    this.userManagementForm.get('ApprovalEndDate').setValue(new Date());
    this.userManagementForm.patchValue({
      IsActive: true
    });

    this.formError = "";
  }

    cancelRecord() {
      this.userManagementForm.reset();
      this.userManagementForm.setErrors(null);
      this.formSubmitAttempt = false;
      this.showCodeErrorMessage = false;
      this.showGridErrorMessage = false;
      if (this.UserManagementList.length > 0 && this.selectedUserManagementRecord != undefined) {
          if (this.selectedUserManagementRecord.UserID == undefined || this.selectedUserManagementRecord.UserID == 0) {
              this.onRecordSelection(this.UserManagementList[0].UserID);
          }
          else {
              this.onRecordSelection(this.selectedUserManagementRecord.UserID);
          }
          this.hideInput = false;
          this.hideText = true;
      }
      else {
          this.hideInput = null;
          this.hideText = null;
      }

      this.formError ="";
      this.ShowEditForm=false;
  }

  editRecord() {
      this.EditClicked=false;
      this.hideInput = true;
      this.hideText = false;
      this.userManagementForm.reset();
      this.userManagementForm.setErrors(null);
      let itemGroupUserControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
      itemGroupUserControl.controls = [];
      itemGroupUserControl.controls.length = 0;
     // console.log(this.selectedUserManagementRecord);
      this.addGridItem(this.selectedUserManagementRecord.RolesDetails.length);
      this.userManagementForm.patchValue(this.selectedUserManagementRecord);
      this.userManagementForm.get('ApprovalStartDate').setValue(new Date(this.selectedUserManagementRecord.ApprovalStartDate));
      this.userManagementForm.get('ApprovalEndDate').setValue(new Date(this.selectedUserManagementRecord.ApprovalEndDate));
      this.UserID=this.selectedUserManagementRecord.UserID;
      if(this.selectedUserManagementRecord.isADUser == true)
      {
        this.userManagementForm.get('LastName').clearValidators();;
        this.userManagementForm.get('LastName').updateValueAndValidity();
      }
      else {
        this.userManagementForm.get('LastName').setValidators([Validators.required]);
        this.userManagementForm.get('LastName').updateValueAndValidity();
      }

      this.formError ="";
  }

  deleteRecord() {
    
      this.confirmationServiceObj.confirm({
          message: Messages.ProceedDelete,
          header: Messages.DeletePopupHeader,
          accept: () => {
              let recordId = this.selectedUserManagementRecord.UserID;
              this.userManagementApiServiceObj.deleteUserManagement(recordId).subscribe((data) => {
                  this.sharedServiceObj.showMessage({
                      ShowMessage: true,
                      Message: Messages.DeletedSuccessFully,
                      MessageType: MessageTypes.Success
                  });

                  this.getUserManagement(0);
              });
          },
          reject: () => {
          }
      });
  }

  retainStructure() {    
      this.userManagementApiServiceObj.retainStructure(this.selectedUserManagementRecord.UserID).subscribe(
        (data: any) => {       
          if (data > 0) {          
            this.selectedUserManagementRecord.IsWorkFlowAssigned = false
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.WorkFlowRetainMessage,
              MessageType: MessageTypes.Success
            });
          }
        },
        err => {
         
        }
      );
  }

  RedirectUser(UserId)
  {
    //alert(" User Id " + UserId);
    //debugger;
    this.ShowEditForm=true;
    this.EditClicked=true;
    this.onRecordSelection(UserId);
    //this.editRecord();
    //this.hideInput=true;
    //this.onRecordSelection(PurchaseOrderId,PurchaseOrderTypeId);
    //this.router.navigate([`/po/pocreation/${PurchaseOrderId}/${PurchaseOrderTypeId}/${SupplierId}`]);
    
  }
  onRecordSelection(UserID: number) {
      this.split();
        let userId = UserID;
        this.userManagementApiServiceObj.getUserDetails(userId)
            .subscribe((data: UserManagement) => {
              debugger;
                this.selectedUserManagementRecord = data;            
                this.showRightPanelLoadingIcon = false;
                this.hideText = true;
                this.hideInput = true;
                if(this.EditClicked)
                {
                    this.editRecord();
                }
            }, (error) => {
                this.hideText = true;
                this.hideInput = false;
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
  pageChange(currentPageNumber: any) {
      this.UserManagementPagerConfig.RecordsToSkip = this.UserManagementPagerConfig.RecordsToFetch * (currentPageNumber - 1);
      this.getUserManagement(0);

      this.showfilters =false;
      this.showfilterstext="Hide List" ;
  

  }

  onClickedOutside(e: Event) {
   // this.showfilters= false; 
    if(this.showfilters == false){ 
      //  this.showfilterstext="Show List"
    }
  }
split() {
this.showfilters=!this.showfilters;
if(this.showfilters == true){ 
this.showfilterstext="Hide List" 
}
else{
  this.showfilterstext="Show List" 
}
}


  onUserChange(event?: any) {
      if (event != null && event != undefined) {
          this.UserID = event.item.UserID;
      }
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
      this.resetFilters();
  }

  resetFilters() {
        
    this.UserFilterInfoForm.get('UserName').setValue("");
    this.UserFilterInfoForm.get('UserRoles').setValue("");
    this.filterMessage = "";
    this.filteredUser = this.UserManagementList;
    if (this.filteredUser.length > 0) {
        this.getUserManagement(0);
    }

    this.isFilterApplied = false;
    if (this.userRef != undefined) {
        this.userRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.userRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  openSettingsMenu() {
      this.initSettingsDone = true;
  } 

  filterData() {      
        let userName = "";
        let userRoles = "";
        this.filterMessage = "";

        if (this.UserFilterInfoForm.get('UserName').value != "") {
            userName = this.UserFilterInfoForm.get('UserName').value.UserName;
        }

        if (this.UserFilterInfoForm.get('UserRoles').value != "") {
          userRoles = this.UserFilterInfoForm.get('UserRoles').value;
        }

        if (userName === '' && userRoles === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        // let userManagementFilterDisplayInput: UserManagementFilterDisplayInput = {
        //     Skip: this.UserManagementPagerConfig.RecordsToSkip,
        //     Take: this.UserManagementPagerConfig.RecordsToFetch,
        //     UserNameFilter: userName,
        //     RolesNameFilter: userRoles
        // };
        // this.userManagementApiServiceObj.getUserManagementFilter(userManagementFilterDisplayInput)

        //     .subscribe((data: UserManagementDisplayResult) => {
        //         if ( data.TotalRecords > 0) {
        //             this.isFilterApplied = true;
        //             if (open) {
        //                 this.initDone = false;
        //             }
        //             this.UserManagementPagerConfig.TotalRecords = data.TotalRecords;
        //             this.UserManagementList = data.UserManagementList;
        //             this.onRecordSelection(this.UserManagementList[0].UserID);
        //         }
        //         else {
        //             this.filterMessage = "No matching records are found";
        //         }
        //     }, (error) => {

        //         this.hideText = false;
        //         this.hideInput = true;
        //     });

    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }

    addGridItem(noOfLines:number)
    {
        let itemGroupControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
        for(let i=0;i<noOfLines;i++)
        {      
            itemGroupControl.push(this.initGridRows());            
        }
    }

          
    initGridRows() {
      return this.formBuilderObj.group({
          'UserRoleId':0,
          'UserID':0,
          'Company':["",[Validators.required]],
          'Role':["",[Validators.required]],
          'DepartmentList':["",[Validators.required]],
          "IsSelected":[false,[Validators.required]],
          "IsDuplicate":false
         // 'Taxes':[],
      });
    }

    matselect(event) {
        if (event.checked == true) {
            this.slideactive = true;
            this.userManagementForm.get('IsActive').setValue(this.slideactive);
        }
        else {
            this.slideactive = false;
            this.userManagementForm.get('IsActive').setValue(this.slideactive);
        }
    }

    matselect1(event) {
        if (event.checked == true) {
            this.slideactive1 = true;            
        }
        else {
            this.slideactive1 = false;
        }
    }

    saveRecord() {      
      //console.log(this.userManagementForm.value);
      debugger;
      this.showGridErrorMessage = false;      
      this.formError = "";
      let usermanagementFormStatus = this.userManagementForm.status;
      if (usermanagementFormStatus != "INVALID") {

        let isExisted = false;      
        isExisted = this.CheckRoleDuplicate();
          if(isExisted){
              this.formError = "Please fix the errors (marked in red) and then click on Save";
              return;
          }

          let usermanagementDetails: UserManagement = this.userManagementForm.value;
          let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();

          let itemGroupControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
          if(itemGroupControl.controls.length>0)
          {
                let attCount = 0; 
                for(let i = 0; i < itemGroupControl.length; i++) 
                {
                    if(itemGroupControl.controls[i].get('IsSelected').value==true)
                    {
                        attCount++;
                    }
                }
                    if(attCount==0){
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.DefaultCompanyMessage,
                            MessageType: MessageTypes.NoChange
                        });
                        return;
                }
          }
          else
          {
            this.showGridErrorMessage = true;
            return;
          }

          usermanagementDetails.CompanyId=this.companyId;
          usermanagementDetails.CreatedBy=userDetails.UserID;
          usermanagementDetails["ApprovalStartDate"]= this.reqDateFormatPipe.transform(usermanagementDetails.ApprovalStartDate);
          usermanagementDetails["ApprovalEndDate"]= this.reqDateFormatPipe.transform(usermanagementDetails.ApprovalEndDate);
          if(usermanagementDetails.User==undefined)
          {
              usermanagementDetails.AlterApprovarUserId=0;
          }
          else{
              usermanagementDetails.AlterApprovarUserId=usermanagementDetails.User.UserID;
          }
         
         // console.log(this.userManagementForm.value);
          debugger;
          if (this.selectedUserManagementRecord.UserID == 0 || this.selectedUserManagementRecord.UserID == null) {
            usermanagementDetails.UserID = this.UserID;
            usermanagementDetails.isLocked=false;
              this.userManagementApiServiceObj.createUserManagement(usermanagementDetails).subscribe((response: { Status: string, Value: any }) => {
              
                  if (response.Status === ResponseStatusTypes.Success) {
                      this.hideText = true;
                      this.hideInput = false;
                      this.sharedServiceObj.showMessage({
                          ShowMessage: true,
                          Message: Messages.SavedSuccessFully,
                          MessageType: MessageTypes.Success
                      });
                      this.formSubmitAttempt = false;
                      this.showGridErrorMessage = false;
                      this.getUserManagement(0);
                  }
                  else if (response.Status === "Existed") {   
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DuplicateUserMessage,
                        MessageType: MessageTypes.Error
                    });
                  }
                  
              });
          }
          else {
            usermanagementDetails.UserID = this.selectedUserManagementRecord.UserID;
            usermanagementDetails.RolesDetailsToDelete = this.rolesDetailsToDelete;         
            if(this.selectedUserManagementRecord.IsWorkFlowAssigned && !this.slideactive){
                this.confirmationServiceObj.confirm({
                    message: Messages.WorkFlowRetainConfirmationMessage,
                    header: "Confirmation",
                    acceptLabel: "Ok",
                    rejectLabel: "Cancel",
                    rejectVisible: true,
                    accept: () => {
                        usermanagementDetails.IsWorkFlowAssigned = true;
                        this.userManagementApiServiceObj.updateUserManagement(usermanagementDetails).subscribe((response: { Status: string, Value: any }) => {
                         
                            if (response.Status === ResponseStatusTypes.Success) {
                                this.hideText = true;
                                this.hideInput = false;
                                this.sharedServiceObj.showMessage({
                                    ShowMessage: true,
                                    Message: Messages.UpdatedSuccessFully,
                                    MessageType: MessageTypes.Success
                                });
                                this.formSubmitAttempt = false;
                                this.showGridErrorMessage = false;
                                this.rolesDetailsToDelete =[];
                                this.rolesDetailsToDelete.length=0;
          
                                this.getUserManagement(usermanagementDetails.UserID);
          
                            }
                            else if (response.Status === "Existed") {                         
                              this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.DuplicateUserEmailMessage,
                                MessageType: MessageTypes.Error
                            });
                          }                        
                        });
                    },
                    reject: () => {                    
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.WorkFlowRetainCancelMessage,
                            MessageType: MessageTypes.Error
                          });
                    }
                });
            }
           else{
            // usermanagementDetails.IsActive=this.selectedUserManagementRecord.IsActive;
              this.userManagementApiServiceObj.updateUserManagement(usermanagementDetails).subscribe((response: { Status: string, Value: any }) => {
               
                  if (response.Status === ResponseStatusTypes.Success) {
                      this.hideText = true;
                      this.hideInput = false;
                      this.sharedServiceObj.showMessage({
                          ShowMessage: true,
                          Message: Messages.UpdatedSuccessFully,
                          MessageType: MessageTypes.Success
                      });
                      this.formSubmitAttempt = false;
                      this.showGridErrorMessage = false;
                      this.rolesDetailsToDelete =[];
                      this.rolesDetailsToDelete.length=0;

                      this.getUserManagement(usermanagementDetails.UserID);

                  }
                  else if (response.Status === "Existed") {                 
                    this.sharedServiceObj.showMessage({
                      ShowMessage: true,
                      Message: Messages.DuplicateUserMessage,
                      MessageType: MessageTypes.Error
                  });
                }
                //   else if (response.Status == "Duplicate UserID") {
                //     this.userManagementForm.get('UserProfile').setErrors({
                //         'DuplicateUser': true
                //     });
                // }
              });
            }

          }
      }
      else {            
          Object.keys(this.userManagementForm.controls).forEach((key: string) => {
              if (this.userManagementForm.controls[key].status == "INVALID" && this.userManagementForm.controls[key].touched == false) {
                  this.userManagementForm.controls[key].markAsTouched();
              }
          });
      }
  }


    companyInputFormater = (x: Companies) => x.CompanyName;
    companySearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
            if (term == "") {
                let itemGroupControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
                //itemGroupControl.controls[this.selectedSupplierRowId].reset();
                return of([]);
            }
            return this.sharedServiceObj.getCompaniesbykey(term).map((data: Array<Companies>) => {      
                let gridData = <FormArray>this.userManagementForm.controls['RolesDetails'];
                gridData.controls.forEach((rowdata)=>{                  
                    let companyRec:Companies = rowdata.get('Company').value;
                    if(companyRec!=undefined)
                    {
                        data  = data.filter(i=>i.CompanyId!=companyRec.CompanyId);
                    }
                });
                return data;

            }).pipe(
                catchError(() => {
                    return of([]);
                }))
        })
    );    

    

    userroleInputFormater = (x: UserRoles) => x.RoleName;
    userroleSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
            if (term == "") {
                let itemGroupControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
                //itemGroupControl.controls[this.selectedSupplierRowId].reset();
                return of([]);
            }
            return this.sharedServiceObj.getuserManagementRole(term).map((data: Array<UserRoles>) => {      
                    
                let gridData = <FormArray>this.userManagementForm.controls['RolesDetails'];
                gridData.controls.forEach((rowdata)=>{                   
                    let companyRec:UserRoles = rowdata.get('Role').value;
                    // if(companyRec!=undefined)
                    // {
                    //     data  = data.filter(i=>i.RoleID!=companyRec.RoleID);
                    // }
                });
                return data;

            }).pipe(
                catchError(() => {
                    return of([]);
                }))
        })
    );    

    userInputFormater = (x: User) => x.UserName;
    userSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.userManagementApiServiceObj.getUsers({
                    searchKey: term
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );


    removeRoleGridItem(rowIndex:number)
    {
        let itemGroupControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
        let RoleUserId = itemGroupControl.controls[rowIndex].get('UserRoleId').value;
        if(RoleUserId > 0)
        {
            this.rolesDetailsToDelete.push(RoleUserId);
        }
        itemGroupControl.removeAt(rowIndex);
    }

    onRoleSelect(rowIndex: number, gridRow: any, event?: any) {     
        let roleDetails: UserRoles;     
        if (event != null && event != undefined) {
            roleDetails = event.item;
        }       
        
        let roleControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
        roleControl.controls[rowIndex].get('Role').setValue(roleDetails);

        let isExisted = false;
        let grnRoleControl = gridRow.get('Role');
        isExisted = this.CheckDuplicate(rowIndex, gridRow);      
        if (isExisted) {      
            roleControl.controls[rowIndex].get('IsDuplicate').setValue(true);     
            //grnRoleControl.setErrors({'duplicateError': true });
        }
        else{
            roleControl.controls[rowIndex].get('IsDuplicate').setValue(false);     
            //grnRoleControl.setErrors({'duplicateError': false });           
        }
    }

    CheckDuplicate(rowIndex: number, result: any): boolean {
        let isExisted = false;
        let count = 0;
        let roleControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
        if (roleControl != null) {           
            roleControl.controls.forEach((control, index) => {           
            let role = <any>control.get("Role").value;
            let company = <any>control.get("Company").value;         
            if(role!=null && role!=""){
                if (role.RoleName.trim().toLowerCase() === result.get('Role').value.RoleName.trim().toLowerCase() && company.CompanyName.trim().toLowerCase() === result.get('Company').value.CompanyName.trim().toLowerCase()) {
                count++;
                }
            }
            if (count > 1) {
              isExisted = true;
              return;
            }
          });
        }
    
        return isExisted;
      }

      onRoleChange(rowIndex: number, event?: any) {     
        if(event.target.value===""){
            let roleControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
            roleControl.controls[rowIndex].get('IsDuplicate').setValue(false);    
        }
      }

    userselect(event)
    {      
        this.userManagementApiServiceObj.getCheckUserName({
            searchKey:event
        })
        .subscribe((data: any) => {     
            if(data > 0)
            {
                this.showCodeErrorMessage = true;
            }
            else{
                this.showCodeErrorMessage = false;
            }
        }, (error) => {
            this.showLeftPanelLoadingIcon = false;
        });

    }
    validateDates(from:string)
    {
        let startDateControl = this.userManagementForm.get('ApprovalStartDate');
        let endDateControl = this.userManagementForm.get('ApprovalEndDate');
        let startDate = <Date>startDateControl.value;
        let endDate = <Date>endDateControl.value;
        if(from=="start")
        {
            if(endDate!=null && startDate >= endDate)
            {
                startDateControl.setErrors({
                    'invalid_date':true
                });
                startDateControl.markAsTouched();
                return;
            }
        }
        else if(from=="end")
        {
            if(startDate!=null && startDate >= endDate)
            {
                endDateControl.setErrors({
                    'invalid_date':true
                });
                endDateControl.markAsTouched();
                return;
            }
        }       
    }

    SelectRoles (eventData:any,rowIndex:number)
    {  
        let itemGroupControl:FormArray = <FormArray>this.userManagementForm.controls['RolesDetails'];
        itemGroupControl.controls.forEach(element => {         
                element.get('IsSelected').setValue(false); 
        });
        itemGroupControl.controls[rowIndex].get('IsSelected').setValue(true);
      
    }

    checkDuplicates ()
    {  
        let itemGroupControl:FormArray = <FormArray>this.userManagementForm.controls['RolesDetails'];
        itemGroupControl.controls.forEach(element => {         
                element.get('IsSelected').setValue(false); 
        });
       
    }

    CheckRoleDuplicate(): boolean {
        let isExisted = false;
        let count = 0;
        let roleControl = <FormArray>this.userManagementForm.controls['RolesDetails'];
        if (roleControl != null) {           
            roleControl.controls.forEach((control, index) => {           
            let isDuplicate = <any>control.get("IsDuplicate").value;           
            if(isDuplicate){               
                count++;              
            }
            if (count > 0) {
              isExisted = true;
              return;
            }
          });
        }
    
        return isExisted;
      }

      countryInputFormatter = (x: Countries) => x.Name;
      countryNameSearch = (text$: Observable<string>) =>
        text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => {         
              return this.sharedServiceObj.getSearchCountries({
                searchKey: term,
                companyId: this.companyId
              }).map((data: Array<any>) => {
                   
                data.forEach((item, index) => {
                  item.index = index;
                });    
              
                return data;
              }).pipe(
                catchError((data) => {
                  return of([]);
                }))          
          })
        );

        onCountryChange(event?: any) {
            let countryDetails: Countries;    
            if (event != null && event != undefined) {
              countryDetails = event.item;
            }
        
            this.userManagementForm.patchValue({
             'CountryName': countryDetails.Name,   
              'Country':    countryDetails,
              'CountryId': countryDetails.Id
            });
        
        
          }


// Reporting Manager Code Starts Here          
  SelectReportingManager(event): void {
    this.HeaderTitle = "Reporting manager";

    let ReportingManager = <Observable<any>>this.userManagementApiServiceObj.GetReportingUsers(this.companyId);
    ReportingManager.subscribe((ReportingUsers) => {
      debugger;
      if (ReportingUsers.length > 0) {

        this.ReportingUserList = ReportingUsers;

        //Dialog starts here
        let dialogRef = this.dialog.open(ReportingManagerDialog, {
          width: '550px',
          height: '450px',
          disableClose: true,
          data: { HeaderTitle: this.HeaderTitle, ManagerList: this.ReportingUserList, Type: this.type }
        });

        //Dialog before close
        dialogRef.beforeClose().subscribe(result => {
          let mlistname = dialogRef
        });
        //Dialog after closed
        dialogRef.afterClosed().subscribe((result) => {
          //
          console.log(result);
          if (dialogRef.componentInstance.data.SaveClick == "NO") {
            console.log('in No btnClick');
          }
          else if (dialogRef.componentInstance.data.SaveClick == 'YES') {
            debugger;
            this.ManagerId = dialogRef.componentInstance.data.ManagerId;
            this.ManagerName = dialogRef.componentInstance.data.ManagerName;

            this.userManagementForm.controls["ManagerId"].setValue(this.ManagerId);
            this.userManagementForm.controls["ManagerName"].setValue(this.ManagerName);


            console.log('in Yes btnClick');

            //this.getList()
            //Get the reporting manager list
          }
        });
        //Dialog ends here
      }
    });
  }
// Reporting Manager Code Starts Here   

}



//User Reporting Manager Dialog starts here
@Component({
    selector: 'reporting-manager-dialog',
    templateUrl: 'reportmanager-dialog.html',
    styleUrls: ['reportmanager-dialog.css']
  })
  export class ReportingManagerDialog implements OnInit {
    //Auto mapping variables
    selectedRows: any[];
  
    MyListID: any;
    router: any;
    nodes: any;
    //postComments = comments;
    constructor(
      public dialogRef: MatDialogRef<ReportingManagerDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      public snackBar: MatSnackBar,
      private sessionStorageService: SessionStorageService,
      private route: ActivatedRoute) {
    }
    ngOnInit() {
      this.nodes=this.data.ManagerList;
      let timeoutId = setTimeout(() => {
          this.exapandORcollapse(this.nodes);
        }, 200);
    }
    exapandORcollapse(nodes) {
      for (let node of nodes) {
        if (node.children) {
          if (node.expanded == true)
            node.expanded = false;
          else
            node.expanded = true;
          for (let cn of node.children) {
            this.exapandORcollapse(node.children);
          }
        }
      }
    }
  
    nodeSelect(event) {
      //
      console.log(event)
    }
    onNoClick(): void {
  
      this.data.SaveClick = "NO";
      this.dialogRef.close(this.MyListID);
    }
    YesClick(event, listData): void {
      const self = this;
      debugger;
      this.data.SaveClick = "YES";
  
      
      if(this.selectedRows)
      {
        this.data.ManagerId=listData.data.UserId;
        this.data.ManagerName=listData.data.UserName;
      }
      else{
        alert("Please select");
        
      }
      this.dialogRef.close(this.selectedRows);
      if (this.data.FormMode == 1) {
        //Create
      }
      else {
        //Update
      }
    }
  }
  //User Reporting Manager Dialog ends here