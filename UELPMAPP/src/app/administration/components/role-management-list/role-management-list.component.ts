import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit, Renderer } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleManagementApiService } from '../../services/role-management-api.service';
import { Roles, RoleGrid, RoleAccessLevel, PageTreeNode, RolePageModule, PageAccessLevel } from "../../models/role";
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages, MessageTypes, Taxes, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AutofocusDirective } from '../../../shared/directives/focusdirective';
import { FullScreen } from "../../../shared/shared";
import { ConfirmationService } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { GridDisplayInput } from '../../../po/models/supplier';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
@Component({
  selector: 'app-role-management-list',
  templateUrl: './role-management-list.component.html',
  styleUrls: ['./role-management-list.component.css'],
  providers: [RoleManagementApiService]
})
export class RoleManagementListComponent implements OnInit {
  RolesListsCols: any[];
  @ViewChild('rightPanel') rightPanelRef: ElementRef;
  @ViewChild('searchInput') searchInputRef: ElementRef;
  @ViewChild("RoleName") roleNameInput: ElementRef;
  hideText: boolean = true;
  hideInput: boolean = false;
  ShowEditForm:boolean=false;
  savedsucess: boolean = false;
  hidealert: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  roleInfoForm: FormGroup;
  roleFilterInfoForm: FormGroup;
  roles: Roles[] = [];
  defaultRole: Roles;
  formSubmitAttempt: boolean = false;
  roleID: number = 0;
  isExistingRole: boolean = false;
  HideDetails:boolean=true;
  message: string = "";
  isDisplayMode: boolean = false;
  filterCriteria: string = "";
  rolePagerConfig: PagerConfig;
  isFilterApplied: boolean = false;
  isSearchApplied: boolean = false;
  modalReference: NgbModalRef;
  filterMessage: string = "";
  scrollbarOptions: any;
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  initDone = false;
  linesToAdd: number = 1;
  companyId: number = 0;
  errorMessage: string = Messages.NoRecordsToDisplay;
  formError: string = "";
  pageModules: PageTreeNode[];
  rolePageModules: PageTreeNode[];
  roleAccessLevels: RoleAccessLevel[];
  gridColumns: Array<{ field: string, header: string }> = [];
  userDetails: UserDetails;
  loading: boolean;
  rolesAccessList: Array<PageAccessLevel> = [];
  disableView: boolean = true;
  isChecked: boolean = true;
  isEditMode: boolean = false;
  isHeaderCheckboxChecked: boolean = false;
  isCompanyChanged: boolean = false;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  public innerWidth: any;
  showfilters:boolean=true;
  showfilterstext:string="Show List" ;
  public screenWidth: any;
  constructor(private fb: FormBuilder,
    private roleApiService: RoleManagementApiService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService, private modalService: NgbModal,
    private renderer: Renderer,
    config: NgbDropdownConfig) {

    this.companyId = this.sessionService.getCompanyId();
    this.defaultRole = new Roles();
    this.initDone = true;
    this.rolePagerConfig = new PagerConfig();
    this.rolePagerConfig.RecordsToSkip = 0;
    this.rolePagerConfig.RecordsToFetch = 25;
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.gridColumns = [
      // { field: 'SNo', header: '#' },
      { field: 'PageName', header: 'Page Name' },
      { field: 'IsView', header: 'View' },
      { field: 'IsAdd', header: 'Add' },
      { field: 'IsEdit', header: 'Edit' },
      { field: 'IsDelete', header: 'Delete' },
      { field: 'IsEmail', header: 'Email' },
      { field: 'IsPrint', header: 'Print' },
      { field: 'IsVerify', header: 'Verify' },
      { field: 'IsApprove', header: 'Approve' },
      { field: 'IsVoid', header: 'Void / Terminate' },
      { field: 'IsImport', header: 'Import' },
      { field: 'IsExport', header: 'Export' },
      { field: 'IsGeneratePOC', header: 'Generate POC' },
      { field: 'IsGenerateReport', header: 'Generate Report' },
      { field: 'IsAddEnable', header: 'Add Enable' },
      { field: 'IsEditEnable', header: 'Edit Enable' },
      { field: 'IsDeleteEnable', header: 'Delete Enable' },
      { field: 'IsEmailEnable', header: 'Email Enable' },
      { field: 'IsPrintEnable', header: 'Print Enable' },
      { field: 'IsVerifyEnable', header: 'Verify Enable' },
      { field: 'IsApproveEnable', header: 'Approve Enable' },
      { field: 'IsVoidEnable', header: 'Void Enable' } ,
      { field: 'IsImportEnable', header: 'Import Enable' },
      { field: 'IsExportEnable', header: 'Export Enable' },
      // { field: 'IsGeneratePOCEnable', header: 'GeneratePOC Enable' },
      { field: 'IsGenerateReportEnable', header: 'Generate Report' }
    ];
  }

  ngOnInit() 
  {
    this.RolesListsCols = [
      { field: 'RoleName', header: 'Role Name', width: '400px' },
      { field: 'Description', header: 'Description', width: '400px' },
      { field: '', header: 'Action', width: '200px'  },
  ];
  
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {    
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "rolemanagement")[0];     
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
     
    }
    else
    {
      this.newPermission = true;
      this.editPermission = true;
      this.deletePermission = true;
     
    }

    this.roleInfoForm = this.fb.group({
      RoleID: 0,
      RoleName: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      Description: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      IsActive: true,
      // RoleAccessLevels: this.fb.array([]),
    });

    this.roleFilterInfoForm = this.fb.group({
      RoleName: ['']
    });   

    this.defaultRole = new Roles();
    this.getPageModules();
    this.getRoles();
    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-180;
      }
      this.showfilters =false;
      this.showfilterstext="Hide List" ;
      //this.HideDetails=true;

  }

  getPageModules(): void {
    this.loading = true;
    let pageModuleResult = <Observable<RolePageModule>>this.roleApiService.getPageModules();
    pageModuleResult.subscribe((data) => {
      debugger;
      this.pageModules = data.PageTreeNodes;
      this.roleAccessLevels = data.RoleAccessLevels;
      this.loading = false;
    });
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getRoles(): void {
    let roleGrid: GridDisplayInput = {
      Search: "",
      Skip: this.rolePagerConfig.RecordsToSkip,
      Take: this.rolePagerConfig.RecordsToFetch,
      CompanyId: this.companyId
    };
    let roleResult = <Observable<RoleGrid>>this.roleApiService.getRoles(roleGrid);
    roleResult.subscribe((data) => {
      if (data != null) {
        this.roles = data.Roles;
        if (this.roles.length > 0) {
          this.rolePagerConfig.TotalRecords = data.TotalRecords;
          //this.onRecordSelected(this.roles[0]);
          this.cancleData();

          if (this.isSearchApplied) {
            this.GetAllSearchRoles(this.searchInputRef.nativeElement.value);
          }
        }
        else {
          this.isDisplayMode = true;
          this.defaultRole = new Roles();
          this.roleID = 0;
        }
      }
      else {
        this.isDisplayMode = true;
        this.defaultRole = new Roles();
        this.roleID = 0;
      }

    });
  }

  GetAllSearchRoles(searchString: string): void {
    let roleGrid: GridDisplayInput = {
      Search: searchString,
      Skip: this.rolePagerConfig.RecordsToSkip,
      Take: this.rolePagerConfig.RecordsToFetch,
      CompanyId: this.companyId
    };

    let customerResult = <Observable<RoleGrid>>this.roleApiService.GetAllSearchRoles(roleGrid);
    customerResult.subscribe((data) => {
      this.roles = data.Roles;
      this.rolePagerConfig.TotalRecords = data.TotalRecords;
      this.defaultRole = this.roles[0];
      this.roleID = this.defaultRole.RoleID;
    });
  }

  onRecordSelected(role: Roles) {
    debugger;
    this.split();
    this.loading = true;
    this.hideText = true;
    this.hideInput = false;
    this.isDisplayMode = true;
    this.HideDetails=true;
    let customerResult = <Observable<Roles>>this.roleApiService.getRoleById(role.RoleID);
    customerResult.subscribe((data) => {
      if (data != null) {
        this.defaultRole = data;
        this.roleInfoForm.patchValue(this.defaultRole);
        this.pageModules = data.RolePageModule.PageTreeNodes;
        this.roleAccessLevels = data.RolePageModule.RoleAccessLevels;
        this.rolePageModules = data.RolePageModule.PageTreeNodes;
        this.roleID = this.defaultRole.RoleID;
        this.loading = false;
        if(this.isDisplayMode && this.editPermission)
        {
          this.editData();
        }
      }
      else {
        this.isDisplayMode = true;
      }
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
  
  filterData() {

  }

  fullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  //adding row to the grid..
  addGridItem(noOfLines: number) {
    //this.showGridErrorMessage = false;
    let accessLevelControl = <FormArray>this.roleInfoForm.controls['RoleAccessLevel'];
    for (let i = 0; i < noOfLines; i++) {
      accessLevelControl.push(this.initGridRows());
    }
  }

  resetFilters() {
    this.roleFilterInfoForm.get('RoleName').setValue("");
    this.filterMessage = "";

    if (this.roles.length > 0) {
      this.defaultRole = this.roles[0];
      this.roleID = this.defaultRole.RoleID;
    }

    this.isFilterApplied = false;
    this.rolePagerConfig.TotalRecords = this.roles.length;
    if (this.roleNameInput != undefined) {
      this.roleNameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.roleNameInput.nativeElement, 'focus'); // NEW VERSION
    }
  }

  initGridRows() {
    return this.fb.group({
      'AccessLevelId': [0],
      'RoleID': [0],
      'PageId': [0],
      'PageName': [""],
      'IsView': [""],
      'IsAdd': [""],
      'IsEdit': [""],
      'IsDelete': [""],
      'IsEmail': [""],
      'IsVerify': [""],
      'IsApprove': [""],
      'IsVoid': [""],
      'IsImport': [""],
      'IsExport': [""],
      'IsGeneratePOC':[""],
      'IsGenerateReport':[""]
    });
  }


  openDialog() {
    this.initDone = true;
  }

  resetData() {
    this.isFilterApplied = false;
    this.initDone = false;
    this.resetFilters();
  }

  onChange(event: any) {
    if (event.target.value != "") {
      this.isSearchApplied = true;
      this.GetAllSearchRoles(event.target.value);
    }
    else {
      this.isSearchApplied = false;
      this.getRoles();
    }
  }


  editData() {
    this.ShowEditForm=true;
    this.HideDetails=true;
    this.hideText = false;
    this.hideInput = true;
    this.formError = "";
    this.message = "";
    this.isDisplayMode = false;
    this.isExistingRole = true;
    this.isChecked = false;
    this.isEditMode = true;
    this.isHeaderCheckboxChecked = false;
    this.roleInfoForm.reset();
    this.roleInfoForm.setErrors(null);
    this.roleInfoForm.patchValue(this.defaultRole);
    this.pageModules = this.defaultRole.RolePageModule.PageTreeNodes;
    this.roleAccessLevels = this.defaultRole.RolePageModule.RoleAccessLevels;
    //this.getPageModules();
  }

  getEnaableCheckbox(index: number, isChecked: boolean, count: number){   
    if (count === this.roleAccessLevels.length) {
      $('#' + index).prop('checked', isChecked);
    }
  }

  ngAfterViewChecked(): void { 
    let index = 0;
    if (this.isEditMode && !this.isHeaderCheckboxChecked) {
      this.gridColumns.forEach(column => {
        if (column.header.replace(/\s/g, "").toLowerCase() != "pagename") {
          if (column.header.replace(/\s/g, "").toLowerCase() === "view") {
            let count = this.roleAccessLevels.filter(x => x.IsView === true).length;
            index += 1;
            this.getEnaableCheckbox(index, true, count);          
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "add") {
            let count = this.roleAccessLevels.filter(x => x.IsAdd === true).length;
            index += 1;
            this.getEnaableCheckbox(index, true, count);          
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "edit") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsEdit === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }

          if (column.header.replace(/\s/g, "").toLowerCase() === "delete") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsDelete === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "email") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsEmail === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }

          if (column.header.replace(/\s/g, "").toLowerCase() === "print") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsPrint === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }

          if (column.header.replace(/\s/g, "").toLowerCase() === "verify") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsVerify === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }

          if (column.header.replace(/\s/g, "").toLowerCase() === "approve") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsApprove === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }

          if (column.header.replace(/\s/g, "").toLowerCase() === "void/terminate") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsVoid === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "Import") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsImport === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "Export") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsExport === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "GeneratePOC") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsGeneratePOC === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }
          if (column.header.replace(/\s/g, "").toLowerCase() === "GenerateReport") {
            index += 1;
            let count = this.roleAccessLevels.filter(x => x.IsGenerateReport === true).length;
            this.getEnaableCheckbox(index, true, count);  
          }
        }
      });
    }
  }


  addData() {
    debugger;
    this.ShowEditForm=true;
    this.showfilters = false;
    this.showfilterstext = "Show List";

    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 550) {
      $(".leftdiv").addClass("hideleftcol");
      $(".rightPanel").addClass("showrightcol");
    }

    this.hideText = false;
    this.hideInput = true;
    this.formError = "";
    this.message = "";
    this.isDisplayMode = false;
    this.isExistingRole = false;
    this.linesToAdd = 1;
    this.roleAccessLevels = [];
    this.pageModules = [];
    this.roleInfoForm.reset();
    this.clearForm();
    this.getPageModules();
    this.isEditMode = false;
    this.isChecked = true;
    this.isHeaderCheckboxChecked = false;
    this.HideDetails=true;
    this.roleInfoForm.patchValue({
      'RoleID': 0,
      'IsActive': true
    });
  }

  clearForm() {
    this.roleInfoForm.reset();
    this.roleInfoForm.setErrors(null);
    // let roleAccessLevels = <FormArray>this.roleInfoForm.controls['RoleAccessLevels'];
    // roleAccessLevels.controls = [];
    // roleAccessLevels.controls.length = 0;
  }

  cancleData() {
    this.ShowEditForm=false;
    this.hideText = true;
    this.hideInput = false;
    this.formError = "";
    this.message = "";
    this.isExistingRole = false;
    this.isDisplayMode = true;
    this.formSubmitAttempt = false;
    this.isEditMode = false;
    this.isChecked = false;
    this.isHeaderCheckboxChecked = false;
    this.HideDetails=false;
    this.split();
    //this.pageModules = [];
    //this.roleAccessLevels = [];
  }
  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  showLeftCol(event)
  {
      $(".leftdiv").removeClass("hideleftcol"); 
      $(".rightPanel").removeClass("showrightcol"); 
  }
  
  showFullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  onClickedOutside(e: Event) {
  //  this.showfilters= false; 
    if(this.showfilters == false){ 
     // this.showfilterstext="Show List"
  }
  }
  split() {
    this.showfilters = !this.showfilters;
    if (this.showfilters == true) {
      this.showfilterstext = "Hide List"
    }
else{
  this.showfilterstext="Show List" 
}
}

  ontoggleAll(event: any, rowData: any) {
    if (event.currentTarget.checked) {

    }
    else {

    }
  }

  onIsViewChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsView = event.currentTarget.checked;
  }

  onIsAddChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsAdd = event.currentTarget.checked;
  }

  onIsEditChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsEdit = event.currentTarget.checked;
  }

  onIsDeleteChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsDelete = event.currentTarget.checked;
  }

  onIsEmailChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsEmail = event.currentTarget.checked;
  }

  onIsPrintChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsPrint = event.currentTarget.checked;
  }

  onIsVerifyChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsVerify = event.currentTarget.checked;
  }

  onIsApproveChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsApprove = event.currentTarget.checked;
  }

  onIsVoidChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsVoid = event.currentTarget.checked;
  }

  onIsImportChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsImport = event.currentTarget.checked;
  }

  onIsExportChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsExport = event.currentTarget.checked;
  }

  onIsGeneratePOCChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsGeneratePOC = event.currentTarget.checked;
  }

  onIsGenerateReportChecked(event: any, rowData: any) {
    let roleAccessLevel = this.roleAccessLevels.filter(x => x.PageId == rowData.PageId && x.AccessLevelId == rowData.AccessLevelId)[0];
    roleAccessLevel.IsGenerateReport = event.currentTarget.checked;
  }

  loopRecursive(pageModules: PageTreeNode[], pageAccess: string, isChecked: boolean, parentId?: number) {
    pageModules.forEach(page => {    
      let data: RoleAccessLevel = page.data;   
      let children: PageTreeNode[] = page.children;
      let expanded: boolean = page.expanded;

      if (pageAccess.toLowerCase() === "view") {
        data.IsView = isChecked;
      }
      else if (pageAccess.toLowerCase() === "add") {
        data.IsAdd = isChecked;
      }
      else if (pageAccess.toLowerCase() === "edit") {
        data.IsEdit = isChecked;
      }
      else if (pageAccess.toLowerCase() === "delete") {
        data.IsDelete = isChecked;
      }
      else if (pageAccess.toLowerCase() === "print") {
        data.IsPrint = isChecked;
      }
      else if (pageAccess.toLowerCase() === "email") {
        data.IsEmail = isChecked;
      }
      else if (pageAccess.toLowerCase() === "verify") {
        data.IsVerify = isChecked;
      }
      else if (pageAccess.toLowerCase() === "approve") {
        data.IsApprove = isChecked;
      }
      else if (pageAccess.toLowerCase() === "void") {
        data.IsVoid = isChecked;
      }
      else if (pageAccess.toLowerCase() === "import") {
        data.IsImport = isChecked;
      }
      else if (pageAccess.toLowerCase() === "export") {
        data.IsExport = isChecked;
      }
      else if (pageAccess.toLowerCase() === "generatepoc") {
        data.IsGeneratePOC = isChecked;
      }
      else if (pageAccess.toLowerCase() === "generatereport") {
        data.IsGenerateReport = isChecked;
      }

      this.loopRecursive(children, pageAccess, isChecked, page.data.ParentId);
    });
  }

  onHeaderCheckboxChecked(event: any, header: any, index: number) { 
    this.isHeaderCheckboxChecked = true;
    let isChecked: boolean = false;
    if (header === "View") {
      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked);
      this.roleAccessLevels.forEach(page => {
        page.IsView = isChecked;
      });

      this.loopRecursive(this.pageModules, "View", isChecked, null);
    }
    if (header === "Add") {
      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked);
      this.roleAccessLevels.forEach(page => {
        page.IsAdd = isChecked;
      });

      this.loopRecursive(this.pageModules, "Add", isChecked, null);
    }
    if (header === "Edit") {
      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsEdit = isChecked;
      });

      this.loopRecursive(this.pageModules, "Edit", isChecked, null);
    }
    if (header === "Delete") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsDelete = isChecked;
      });

      this.loopRecursive(this.pageModules, "Delete", isChecked, null);
    }
    if (header === "Print") {
      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsPrint = isChecked;
      });

      this.loopRecursive(this.pageModules, "Print", isChecked, null);
    }
    if (header === "Email") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsEmail = isChecked;
      });

      this.loopRecursive(this.pageModules, "Email", isChecked, null);
    }
    if (header === "Verify") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsVerify = isChecked;
      });

      this.loopRecursive(this.pageModules, "Verify", isChecked, null);
    }
    if (header === "Approve") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsApprove = isChecked;
      });

      this.loopRecursive(this.pageModules, "Approve", isChecked, null);

    }

    if (header === "Void / Terminate") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsVoid = isChecked;
      });

      this.loopRecursive(this.pageModules, "Void", isChecked, null);
    }

    if (header === "Import") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsImport = isChecked;
      });

      this.loopRecursive(this.pageModules, "Import", isChecked, null);
    }

    if (header === "Export") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsExport = isChecked;
      });

      this.loopRecursive(this.pageModules, "Export", isChecked, null);
    }

    if (header === "Generate POC") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsGeneratePOC = isChecked;
      });

      this.loopRecursive(this.pageModules, "GeneratePOC", isChecked, null);
    }
    if (header === "Generate Report") {

      if (event.currentTarget.checked) {
        isChecked = true;
      }
      else {
        isChecked = false;
      }

      $('#' + event.currentTarget.id).prop('checked', isChecked)
      this.roleAccessLevels.forEach(page => {
        page.IsGenerateReport = isChecked;
      });

      this.loopRecursive(this.pageModules, "GenerateReport", isChecked, null);
    }
  }

  createRole(role: Roles): void {
    const self = this;
    role.CreatedBy = this.userDetails.UserID;
    this.roleApiService.createRole(role).subscribe(
      (data: any) => {
        if (data === -2) {
          this.message = "Role is already existed...";
          return;
        }
        else {
          this.hideText = true;
          this.hideInput = false;
          this.isDisplayMode = true;
          this.formSubmitAttempt = false;

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.SavedSuccessFully,
            MessageType: MessageTypes.Success
          });

          this.getRoles();
          this.getRolesAccessLevel();
        }
      },
      err => {
        this.hideText = false;
        this.hideInput = true;
      }
    );
  }

  updateRole(role: Roles): void {
    const self = this;
    role.UpdatedBy = this.userDetails.UserID;
    this.roleApiService.updateRole(role).subscribe(
      (data: any) => {
        if (data === -2) {
          this.message = "Role is already existed...";
          return;
        }
        else {
          this.hideText = true;
          this.hideInput = false;
          this.isDisplayMode = true;
          this.formSubmitAttempt = false;

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.UpdatedSuccessFully,
            MessageType: MessageTypes.Success
          });

          this.getRoles();
          this.getRolesAccessLevel();
        }

      },
      err => {
        this.hideText = false;
        this.hideInput = true;
      }
    );
  }

  getRolesAccessLevel() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();  
    this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
      this.rolesAccessList = data;
      this.sessionService.setRolesAccess(this.rolesAccessList);
      let roleAccessLevels = this.sessionService.getRolesAccess();     
    });
  }

  deleteRecord() {
    let recordId = this.defaultRole.RoleID;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.roleApiService.deleteRole(recordId).subscribe((data) => {
          if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.RoleValidationMessage,
              MessageType: MessageTypes.Error
            
            });
          }
          else
          {
              this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success
            
            });
          }
            this.getRoles();
         // }
        });

      },
      reject: () => {
      }
    });
  }

  onSubmit() {
    let result = this.pageModules;
    $(".toast-message-view").removeClass("slide-down-and-up");
    this.savedsucess = false;
    this.formError = "";
    this.formSubmitAttempt = true;

    if (!this.roleInfoForm.valid) {
      this.formError = "Please fill in the mandatory fields (marked in red) and then click on Save";
      return;
    }
    this.savedsucess = true;
    let roleDetails: Roles = this.roleInfoForm.value;

    roleDetails.RoleAccessLevels = this.roleAccessLevels;

    if (this.isExistingRole) {
      this.updateRole(roleDetails);
    }
    else {
      this.createRole(roleDetails);
    }
  }

  pageChange(currentPageNumber: any) {
    this.rolePagerConfig.RecordsToSkip = this.rolePagerConfig.RecordsToFetch * (currentPageNumber - 1);
    this.getRoles();
    this.showfilters =false;
    this.showfilterstext="Hide List" ;
  }
}


