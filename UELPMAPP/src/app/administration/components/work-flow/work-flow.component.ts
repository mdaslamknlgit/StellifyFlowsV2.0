import { ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef, Component, Renderer } from "@angular/core";
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkFlowApiService } from '../../services/workflow-api.service';
import { DOCUMENTS, FIXEDPOFIELDNAMES, CONTRACTPOFIELDNAMES, OPERATORS, FIELDNAMES, SUPPLIERFIELDNAMES, PROJECTPOFIELDNAMES } from '../../../shared/constants/workflow';
import { Observable, of, Subscription } from 'rxjs';
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages, MessageTypes, UserDetails, PagerConfig, GridDisplayInput, Location } from "../../../shared/models/shared.model";
import { WorkFlowSharedService } from '../../services/workflow-shared.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { FullScreen } from "../../../shared/shared";
import { UserManagementApiService } from '../../services/user-management-api.service';
import { Company } from '../../../administration/models/company';
import { ConfirmationService } from "primeng/api";
@Component({
  selector: 'app-work-flow',
  templateUrl: './work-flow.component.html',
  styleUrls: ['./work-flow.component.css'],
  providers: [UserManagementApiService]
})

export class WorkFlowComponent {
  @ViewChild('rightPanel') rightPanelRef: ElementRef;
  @ViewChild('searchInput') searchInputRef: ElementRef;
  @ViewChild("ProcessName") processNameInput: ElementRef;
  disableSelection: boolean = true;
  workflowInfoForm: FormGroup;
  workFlowFilterInfoForm: FormGroup;
  formSubmitAttempt: boolean = false;
  workFlowProcesses = [];
  index: number = 0;
  scrollbarOptions: any;
  users = [];
  operators = OPERATORS
  fieldNames = FIELDNAMES;
  isCondition: boolean = false;
  workFlowConfigurationId: number = 0;
  processId: number = 0;
  mandatoryWorkflow: boolean = true;
  canPost: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  isLevelCreated: boolean = false;
  isProcessCreated: boolean = true;
  isProcessRemoved: boolean = true;
  workFlowConfiguration: WorkFlowConfiguration
  isProcessExit: boolean = false;
  autocomplete: boolean = false;
  levleIndex: number = -1;
  procesIndex: number = -1;
  deletedWorkLevels: WorkFlowLevel[] = [];
  deletedWorkLevel: WorkFlowLevel;

  deletedWorProcesses: WorkFlowProcessLevel[] = [];
  deletedWorProcess: WorkFlowProcessLevel;
  companyId: number = 0;
  defaultWorkFlowConfigurationId; number = 0;
  workFlowPagerConfig: PagerConfig;
  workFlowConfigurationFilterInfoForm: FormGroup;
  isSearchApplied: boolean = false;
  isFilterApplied: boolean = false;
  initDone = false;
  filterMessage: string = "";
  departments: Location[] = [];
  workFlowConfigurations: Array<WorkFlowConfigurationList> = [];
  isFilter: boolean = false;
  locationId: number = 0;
  defaultLocationId: number = 0;
  showLeftPanelLoadingIcon: boolean = false;
  isNonDepartment: boolean = false;
  userRoles = [];
  filteredUserRoles = [];
  company: Company;
  previousConfigurationId: number = 0;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean = false;
  isAccessable: boolean;
  errorMessage: string = Messages.NoRecordsToDisplay;
  public innerWidth: any;
  
  showfilters:boolean=true;
  showfilterstext:string="Hide List" ;
  constructor(private fb: FormBuilder, private workFlowApiService: WorkFlowApiService,
    private sharedServiceObj: SharedService, private workFlowShared: WorkFlowSharedService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService, public route: ActivatedRoute, public router: Router, private renderer: Renderer,
    private userManagementApiServiceObj: UserManagementApiService) {
    this.companyId = this.sessionService.getCompanyId();
    this.initDone = true;
    this.workFlowPagerConfig = new PagerConfig();
    this.workFlowPagerConfig.RecordsToSkip = 0;
    this.workFlowPagerConfig.RecordsToFetch = 25;
  }

  ngOnInit() {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "workflow")[0];
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.deletePermission = false;
    }

    this.workflowInfoForm = this.fb.group({
      WorkFlowConfigurationId: 0,
      CompanyId: this.companyId,
      LocationID: ['', { validators: [Validators.required] }],
      WorkFlowName: ['', { validators: [Validators.required] }],
      IsFollowWorkflow: [true],
      ProcessId: [0, { validators: [Validators.required] }],
      IsDeleted: false,
      CreatedBy: null,
      UpdatedBy: null,
      'WorkFlowProcess': this.fb.array([]),
    });

    this.company = new Company();

    this.workFlowFilterInfoForm = this.fb.group({
      DepartmentName: [''],
      CompanyName: ['']
    });

    this.workFlowConfigurationFilterInfoForm = this.fb.group({
      ProcessName: [''],
      WorkFlowName: [''],
      Department: ['']
    });

    this.getCompanyDetails(this.companyId)
    this.getWorkFlowProcesses();
    this.getUsers();
    this.getUserRoles();
    this.getDepartments(this.companyId);
    this.getWorkFlowCounfigurations();
    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        this.companyId = data;
        //this.getWorkFlowConfiguration(this.processId, this.companyId);
        this.getDepartments(this.companyId);
        this.getCompanyDetails(this.companyId)
        this.getWorkFlowCounfigurations();
      });

  }

  getDepartments(companyId: number): void {
    let departmentResult = <Observable<Array<any>>>this.sharedServiceObj.getDepartmentsByCompany(companyId);
    departmentResult.subscribe((data) => {
      this.departments = data;
    });
  }

  getUserRoles(): void {
    let usersResult = <Observable<Array<any>>>this.userManagementApiServiceObj.getUserRoles();
    usersResult.subscribe((data) => {
      this.userRoles = data;
      this.filteredUserRoles = data
    });
  }

  getCompanyDetails(companyId: number) {
    this.sharedServiceObj.getCompanyDetails(companyId)
      .subscribe((data: Company) => {
        this.company = data;
      });
  }

  usersInputFormater = (x: Users) => x.UserName;

  searchFunctionFactory(processIndex: any, levelIndex: any): (text: Observable<string>) => Observable<any[]> {
    let users = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          if (term === '') {
            return []
          }
          else {
            let filteredUsers = [];
            let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
            let workFlowLevels = workFlowProcess.controls[processIndex].get('WorkFlowLevels') as FormArray;
            let approvers = workFlowLevels.controls[levelIndex].get('Approvers') as FormArray;
            let roleId = Number(workFlowLevels.controls[levelIndex].get('RoleID').value);
            filteredUsers = approvers.value;

            let role = this.userRoles.filter(x => x.RoleID === roleId)[0];
            return this.sharedServiceObj.getUsersByCompany({
              searchKey: term,
              roleId: roleId,
              companyId: this.companyId
            }).map((res: any) => {
              res.forEach((item, index) => {
                item.index = index;
              });
              //this.users = res;
              return res;
            }).pipe(
              catchError((data) => {
                return of([]);
              }))
          }
        }
        )
      );
    return users;
  }

  // public searchFunctionFactory(processIndex: any, levelIndex: any): (text: Observable<string>) => Observable<any[]> {
  //   let users = (text$: Observable<string>) =>
  //     text$.pipe(
  //       debounceTime(200),
  //       distinctUntilChanged(),
  //       map(term => {
  //         if (term === '') {
  //           return []
  //         }
  //         else {
  //           let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
  //           let workFlowLevels = workFlowProcess.controls[processIndex].get('WorkFlowLevels') as FormArray;
  //           let approvers = workFlowLevels.controls[levelIndex].get('Approvers') as FormArray;
  //           let roleId = Number(workFlowLevels.controls[levelIndex].get('RoleID').value);
  //           let filteredUsers = approvers.value;

  //           let role = this.userRoles.filter(x => x.RoleID === roleId)[0];
  //           if (filteredUsers.length > 0) {
  //             // if (role.RoleName.toLowerCase() === "supplierverifier") {
  //             //   return filteredUsers.filter(x => x.UserName.toLowerCase().indexOf(
  //             //     term.toLowerCase()) !== -1 && x.RoleID === roleId && x.UserID === Number(this.company.SupplierVerifier))
  //             // }
  //             // else {
  //               return filteredUsers.filter(x => x.UserName.toLowerCase().indexOf(
  //                 term.toLowerCase()) !== -1 && x.RoleID === roleId)
  //            //}
  //           }
  //           else {
  //             // if (role.RoleName.toLowerCase() === "supplierverifier") {
  //             //   return this.users.filter(x => x.UserName.toLowerCase().indexOf(
  //             //     term.toLowerCase()) !== -1 && x.RoleID === roleId && x.UserID === Number(this.company.SupplierVerifier))
  //             // }
  //             // else {
  //               return this.users.filter(x => x.UserName.toLowerCase().indexOf(
  //                 term.toLowerCase()) !== -1 && x.RoleID === roleId)
  //             //}
  //           }
  //         }
  //       })
  //     );
  //   return users;
  // }

  departmentInputFormater = (x: Location) => x.Name;
  departmentSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.sharedServiceObj.getAllSearchDepartments({
          searchKey: term,
          companyId: this.companyId
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      )
    );

  processInputFormater = (x: WorkFlowProcess) => x.ProcessName;
  processSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.workFlowApiService.getWorkFlowProcesses({
          searchKey: term
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      )
    );

  onRoleChange(processIndex: number, levelIndex: number) {
    let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workFlowLevels = workFlowProcess.controls[processIndex].get('WorkFlowLevels') as FormArray;
    workFlowLevels.controls[levelIndex].get('ApproverUser').setValue("");
  }

  getWorkFlowProcesses(): void {
    let workFlowProcess = {
      searchKey: ""
    };
    let workFlowProcessResult = <Observable<Array<any>>>this.workFlowApiService.getWorkFlowProcesses(workFlowProcess);
    workFlowProcessResult.subscribe((data) => {
      this.workFlowProcesses = data;
    });
  }

  getUsers(): void {
    let usersResult = <Observable<Array<Users>>>this.workFlowApiService.getUsers();
    usersResult.subscribe((data) => {
      this.users = data;
    });
  }

  getWorkFlowCounfigurations() {
    let workFlowDisplayInput = {
      Skip: this.workFlowPagerConfig.RecordsToSkip,
      Take: this.workFlowPagerConfig.RecordsToFetch,
      CompanyId: this.companyId
    };
    this.showLeftPanelLoadingIcon = true;
    this.workFlowApiService.getWorkFlowConfigurations(workFlowDisplayInput)
      .subscribe((data: WorkFlowConfigurationDisplayResult) => {
        this.workFlowConfigurations = data.WorkFlowConfigurations;
        this.workFlowPagerConfig.TotalRecords = data.TotalRecords;
        if (this.workFlowConfigurations.length > 0) {
          this.defaultWorkFlowConfigurationId = this.workFlowConfigurations[0].WorkFlowConfigurationId;
          this.defaultLocationId = this.workFlowConfigurations[0].LocationID;
          this.showLeftPanelLoadingIcon = false;
          this.processId = this.workFlowConfigurations[0].ProcessId;

          this.getWorkFlowConfiguration(this.workFlowConfigurations[0].ProcessId, this.companyId, this.workFlowConfigurations[0].LocationID);
        }
        else {
          this.showLeftPanelLoadingIcon = false;
          this.workflowInfoForm.setErrors(null);
          this.isNonDepartment = false;
          this.workflowInfoForm.reset();
          this.isLevelCreated = false;
          this.previousConfigurationId = 0;
          this.resetControls();
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  getAllSearchWorkFlowCounfigurations(searchString: string, filterString: string, workFlowName: string, processName: string, department: string): void {
    let workFlowDisplayInput = {
      Skip: this.workFlowPagerConfig.RecordsToSkip,
      Take: this.workFlowPagerConfig.RecordsToFetch,
      Search: searchString,
      Filter: filterString,
      CompanyId: this.companyId,
      WorkFlowName: workFlowName,
      ProcessName: processName,
      Department: department
    };
    this.showLeftPanelLoadingIcon = true;
    this.workFlowApiService.getAllSearchWorkFlowConfigurations(workFlowDisplayInput)
      .subscribe((data: WorkFlowConfigurationDisplayResult) => {
        this.workFlowConfigurations = data.WorkFlowConfigurations;
        this.workFlowPagerConfig.TotalRecords = data.TotalRecords;
        if (this.workFlowConfigurations.length > 0) {
          if (this.isFilter) {
            this.initDone = false;
            this.isFilterApplied = true;
          }
          this.showLeftPanelLoadingIcon = false;
          this.defaultWorkFlowConfigurationId = this.workFlowConfigurations[0].WorkFlowConfigurationId;
          this.getWorkFlowConfiguration(this.workFlowConfigurations[0].ProcessId, this.companyId, this.workFlowConfigurations[0].LocationID);
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }


  openOptions(event) {
    $(event.target).parent().prev().toggleClass("InvertImage");
  }

  validateControl(control: any) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  createWorkFlowLevelDetails(workFlowLevelId, workFlowProcessId, fieldName, operator, value, approverUserId, isCondition, levelIndex, approverUser, roleId): FormGroup {
    return this.fb.group({
      WorkFlowLevelId: workFlowLevelId,
      WorkFlowProcessId: workFlowProcessId,
      FieldName: [fieldName, { validators: [Validators.required] }],
      Operator: [operator, { validators: [Validators.required] }],
      Value: [value, { validators: [Validators.required] }],
      ApproverUserId: approverUserId,
      ApproverUser: [approverUser, { validators: [Validators.required] }],
      IsCondition: isCondition,
      LevelIndex: levelIndex,
      DepartmentName: '',
      CompanyName: '',
      IsDeleted: false,
      'Approvers': this.fb.array([]),
      RoleID: [roleId, { validators: [Validators.required] }]

    });
  }

  createWorkFlowProcess(workFlowProcessId, workFlowConfigurationId, LevelOrder, processIndex): FormGroup {
    return this.fb.group({
      WorkFlowProcessId: workFlowProcessId,
      WorkFlowConfigurationId: workFlowConfigurationId,
      LevelOrder: LevelOrder,
      ProcessIndex: processIndex,
      IsDeleted: false,
      'WorkFlowLevels': this.fb.array([]),
    });
  }

  createUser(userId, userName): FormGroup {
    return this.fb.group({
      UserID: userId,
      UserName: userName
    });
  }

  createProcessComponent = function (event) {
    $('.dummyline').removeClass("dummyline");
    $('.menu-open').removeClass("InvertImage");
    this.isCondition = true;
    this.isLevelCreated = true;
    if (this.newPermission) {
      this.isAccessable = true;
    }

    this.isProcessExit = true;
    this.createWorkFlowProcessElement(this.isCondition);
  }

  createProcessApproval = function (event) {
    $('.dummyline').removeClass("dummyline");
    $('.menu-open').removeClass("InvertImage");
    this.isCondition = false;
    this.isLevelCreated = true;
    if (this.newPermission) {
      this.isAccessable = true;
    }
    this.isProcessExit = true;
    this.createWorkFlowProcessElement(this.isCondition);
  }

  createWorkFlowLevel(workLevels: FormArray, isCondition: boolean, processId: number) {
    let index;
    let newId = 0;
    let levelOrder;
    let isProcess = false;
    if (workLevels.value.length === 0) {
      index = 0;
      //newId = 1;
      if (isCondition) {
        workLevels.push(this.createWorkFlowLevelDetails(newId, processId, null, null, null, null, isCondition, index, null, null));
        workLevels.controls[index].get("ApproverUser").clearValidators();
        workLevels.controls[index].get('ApproverUser').updateValueAndValidity();
        workLevels.controls[index].get("RoleID").clearValidators();
        workLevels.controls[index].get('RoleID').updateValueAndValidity();

        workLevels.controls[index].get("FieldName").setValidators([Validators.required]);
        workLevels.controls[index].get('FieldName').updateValueAndValidity();

        workLevels.controls[index].get("Operator").setValidators([Validators.required]);
        workLevels.controls[index].get('Operator').updateValueAndValidity();

        workLevels.controls[index].get("Value").setValidators([Validators.required]);
        workLevels.controls[index].get('Value').updateValueAndValidity();
      }
      else {
        workLevels.push(this.createWorkFlowLevelDetails(newId, processId, null, null, null, null, isCondition, index, null, null));
        workLevels.controls[index].get("FieldName").clearValidators();
        workLevels.controls[index].get('FieldName').updateValueAndValidity();
        workLevels.controls[index].get("Operator").clearValidators();
        workLevels.controls[index].get('Operator').updateValueAndValidity();
        workLevels.controls[index].get("Value").clearValidators();
        workLevels.controls[index].get('Value').updateValueAndValidity();

        workLevels.controls[index].get("ApproverUser").setValidators([Validators.required]);
        workLevels.controls[index].get('ApproverUser').updateValueAndValidity();

        workLevels.controls[index].get("RoleID").setValidators([Validators.required]);
        workLevels.controls[index].get('RoleID').updateValueAndValidity();
      }

    }
    else {
      index = this.getMaxIndex(workLevels.value, isProcess) + 1;
      //newId = this.getMaxWorkFlowLevelId(workLevels.value) + 1;
      index = index + 1;

      if (isCondition) {
        workLevels.push(this.createWorkFlowLevelDetails(newId, processId, null, null, null, null, isCondition, index, null, null));
      }
      else {
        workLevels.push(this.createWorkFlowLevelDetails(newId, processId, null, null, null, null, isCondition, index, null, null));
      }
    }
  }

  createWorkFlowProcessElement(isCondition) {
    let index;
    let newindex;
    let newId = 0;
    let levelOrder;
    let isProcess = false;
    let prevLength = 0;
    let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    if (workFlowProcess.value.length === 0) {
      index = 0;
      //newId = 1;
      levelOrder = 1;
      newindex = 0;
    }
    else {
      isProcess = true;
      prevLength = workFlowProcess.value.length;
      index = this.getMaxIndex(workFlowProcess.value, isProcess) + 1;
      //newId = this.getMaxWorkFlowProcessId(workFlowProcess.value) + 1;
      levelOrder = this.getMaxLevelOrder(workFlowProcess.value) + 1;
      newindex = index;
    }

    workFlowProcess.push(this.createWorkFlowProcess(newId, this.workFlowConfigurationId, levelOrder, newindex))
    //let levels = workFlowProcess.controls[index].get('WorkFlowLevels').value;
    //if (prevLength === 1) {
    let workFlowLevels = workFlowProcess.controls[index].get('WorkFlowLevels') as FormArray;
    this.createWorkFlowLevel(workFlowLevels, isCondition, newId);
    //}
    // else {
    //   let workFlowLevels = workFlowProcess.controls[index].get('WorkFlowLevels') as FormArray;
    //   this.createWorkFlowLevel(workFlowLevels, isCondition, newId);
    // }

    if (this.workFlowConfigurationId > 0) {
      newId = this.workFlowConfigurationId;
    }
  }

  createComponent = function (value, index) {
    let newId = 0;
    this.isCondition = true;
    let workFlowProcesses = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workLevels = workFlowProcesses.controls[index].get('WorkFlowLevels') as FormArray;
    let newIndex = this.getMaxIndex(workLevels.value, false)
    newIndex = newIndex + 1;
    //let newId = this.getMaxWorkFlowLevelId(workLevels.value) + 1;
    workLevels.push(this.createWorkFlowLevelDetails(newId, value, null, null, null, null, this.isCondition, newIndex))
    workLevels.controls[newIndex].get("ApproverUser").clearValidators();
    workLevels.controls[newIndex].get('ApproverUser').updateValueAndValidity();
    workLevels.controls[newIndex].get("RoleID").clearValidators();
    workLevels.controls[newIndex].get('RoleID').updateValueAndValidity();
  }

  createApproval = function (value, index) {
    let newId = 0;
    this.isCondition = false;
    let workFlowProcesses = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workLevels = workFlowProcesses.controls[index].get('WorkFlowLevels') as FormArray;
    let newIndex = this.getMaxIndex(workLevels.value, false)
    newIndex = newIndex + 1;
    //let newId = this.getMaxWorkFlowLevelId(workLevels.value) + 1;

    workLevels.push(this.createWorkFlowLevelDetails(newId, value, null, null, null, null, this.isCondition, newIndex, null, null))
    workLevels.controls[newIndex].get("FieldName").clearValidators();
    workLevels.controls[newIndex].get('FieldName').updateValueAndValidity();
    workLevels.controls[newIndex].get("Operator").clearValidators();
    workLevels.controls[newIndex].get('Operator').updateValueAndValidity();
    workLevels.controls[newIndex].get("Value").clearValidators();
    workLevels.controls[newIndex].get('Value').updateValueAndValidity();
  }

  deleteComponent(processIndex: number, index: number) {
    let workFlowProcesses = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workLevels = workFlowProcesses.controls[processIndex].get('WorkFlowLevels') as FormArray;

    //maintaining deleted levels   
    let workLevel = workLevels.controls[index].value;
    this.deletedWorkLevel = workLevel;
    this.deletedWorkLevel.IsDeleted = true;
    this.deletedWorkLevels.push(this.deletedWorkLevel);
    workLevels.removeAt(index);


    if (workLevels.value.length === 0) {
      let workProcess = workFlowProcesses.controls[processIndex].value;
      if (workProcess.WorkFlowProcessId > 0) {
        this.deletedWorProcess = workProcess;
        this.deletedWorProcess.IsDeleted = true;
        this.deletedWorProcesses.push(this.deletedWorProcess);
      }
      workFlowProcesses.removeAt(processIndex);
    }


    //rearrange work flow processes
    let count = 0;
    workFlowProcesses.controls.forEach(data => {
      data.get('ProcessIndex').setValue(count);
      let subCount = 0;
      let workLevels = workFlowProcesses.controls[processIndex].get('WorkFlowLevels') as FormArray;
      workLevels.controls.forEach(data => {
        data.get('LevelIndex').setValue(subCount);
        subCount = subCount + 1;
      });

      count = count + 1;
    });


    if (workFlowProcesses.value.length === 0) {
      this.isProcessExit = false;
      //this.isLevelCreated = false;
      // if (this.workFlowConfigurationId === 0) {
      //   this.workflowInfoForm.get('ProcessId').setValue("");
      //   this.workflowInfoForm.get('WorkFlowName').setValue("");
      //   this.workflowInfoForm.reset();
      //   this.workflowInfoForm.setErrors(null);
      //   this.isProcessExit = false;
      // }
    }
  }

  getMaxIndex(data, IsProcess) {
    if (IsProcess) {
      return data.reduce((max, b) => Math.max(max, b.ProcessIndex), data[0].ProcessIndex);
    }
    else {
      return data.reduce((max, b) => Math.max(max, b.LevelIndex), data[0].LevelIndex);
    }
  }

  getMaxWorkFlowProcessId(data) {
    return data.reduce((max, b) => Math.max(max, b.WorkFlowProcessId), data[0].WorkFlowProcessId);
  }

  getMaxWorkFlowLevelId(data) {
    return data.reduce((max, b) => Math.max(max, b.WorkFlowLevelId), data[0].WorkFlowLevelId);
  }

  getMaxLevelOrder(data) {
    return data.reduce((max, b) => Math.max(max, b.LevelOrder), data[0].LevelOrder);
  }

  selectedItem(item, index, levelIndex) {
    let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workFlowLevels = workFlowProcess.controls[index].get('WorkFlowLevels') as FormArray;
    workFlowLevels.controls[levelIndex].get('ApproverUserId').setValue(item.item.UserID);
  }


  autocompletepopup(event, index, processIdex) {
    $('.autocomplete-popup').removeClass("hideautocomplete")
    event.stopPropagation();
    this.levleIndex = index;
    this.procesIndex = processIdex;
    //this.autocomplete = !this.autocomplete
  }
  hideautocomplete(event) {
    $('.autocomplete-popup').addClass("hideautocomplete")
    event.stopPropagation();

  }
  showautocomplete(event) {
    $('.autocomplete-popup').removeClass("hideautocomplete")
    event.stopPropagation();
  }

  onDocumentChange(event) {
    // this.defaultLocationId = this.workflowInfoForm.get('LocationID').value;
    //this.processId = this.workflowInfoForm.get('ProcessId').value;  
    this.processId = event.target.value;
    // this.locationId = this.defaultLocationId;
    debugger
    this.levleIndex = -1;
    this.procesIndex = -1;
    this.userRoles = this.filteredUserRoles;
    this.mandatoryWorkflow = this.workFlowProcesses.filter(x => x.ProcessId == this.processId)[0].IsMandatoryFollowWorkflow;
    let processName = this.workFlowProcesses.filter(x => x.ProcessId == this.processId)[0].ProcessName;
    if (processName.toLowerCase() === "supplier") {
      // this.isNonDepartment = true;
      // this.locationId = 0;
      // this.workflowInfoForm.get('LocationID').setValue(null);
    }
    else if ((processName.toLowerCase() === "project master contract") || (processName.toLowerCase() === "project contract variation order")) {
      //this.isNonDepartment = true;
      //this.locationId = 0;
      // // this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);   // supplier verifier role is excluding here
      // this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
      // this.workflowInfoForm.get('LocationID').setValue(null);
      this.isNonDepartment = false;
      // this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);
      this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
      if (this.workflowInfoForm.get('LocationID').value != null) {
        this.defaultLocationId = this.workflowInfoForm.get('LocationID').value;
      }
      else {
        this.defaultLocationId = this.departments[0].LocationID;
      }

      this.locationId = this.defaultLocationId;
    }
    else if (processName.toLowerCase() === "project po") {
      this.isNonDepartment = true;
      this.locationId = 0;
      // this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);
      this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
      this.workflowInfoForm.get('LocationID').setValue(null);
    }
    else {
      this.isNonDepartment = false;
      // this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);
      this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
      if (this.workflowInfoForm.get('LocationID').value != null) {
        this.defaultLocationId = this.workflowInfoForm.get('LocationID').value;
      }
      else {
        this.defaultLocationId = this.departments[0].LocationID;
      }

      this.locationId = this.defaultLocationId;
    }

    if ((processName.toLowerCase() === "inventory po") || (processName.toLowerCase() === "purchase request") || (processName.toLowerCase() === "sales order")) {
      this.fieldNames = FIELDNAMES;
    }
    else if (processName.toLowerCase() === "fixed asset po") {
      this.fieldNames = FIXEDPOFIELDNAMES;
    }
    else if ((processName.toLowerCase() === "project master contract") || (processName.toLowerCase() === "project contract variation order")) {
      this.fieldNames = PROJECTPOFIELDNAMES;
    }
    else if (processName.toLowerCase() === "project po") {
      this.fieldNames = PROJECTPOFIELDNAMES;
    }
    else if (processName.toLowerCase() === "supplier" || processName.toLowerCase() === "customer master") {
      this.fieldNames = SUPPLIERFIELDNAMES;
    }

    else {
      this.fieldNames = CONTRACTPOFIELDNAMES;
    }

    // if (this.processId > 0 && this.defaultLocationId > 0) {
    if (this.processId > 0) {
      this.getWorkFlowConfiguration(this.processId, this.companyId, this.locationId);
    }
  }

  onDepartmentChange(event) {
    this.processId = this.workflowInfoForm.get('ProcessId').value;
    this.defaultLocationId = event.target.value;
    this.locationId = event.target.value;
    this.levleIndex = -1;
    this.procesIndex = -1;
    let processName = this.workFlowProcesses.filter(x => x.ProcessId == this.processId)[0].ProcessName;
    if ((processName.toLowerCase() === "inventory po") || (processName.toLowerCase() === "purchase request") || (processName.toLowerCase() === "sales order")) {
      this.fieldNames = FIELDNAMES;
    }
    else if (processName.toLowerCase() === "fixed asset po") {
      this.fieldNames = FIXEDPOFIELDNAMES;
    }
    else if (processName.toLowerCase() === "supplier" || processName.toLowerCase() === "customer master") {
      this.fieldNames = SUPPLIERFIELDNAMES;
    }
    else if ((processName.toLowerCase() === "project master contract") || (processName.toLowerCase() === "project contract variation order")) {
      this.fieldNames = PROJECTPOFIELDNAMES;
    }
    else if (processName.toLowerCase() === "project po") {
      this.fieldNames = PROJECTPOFIELDNAMES;
    }
    else {
      this.fieldNames = CONTRACTPOFIELDNAMES;
    }

    if (this.processId > 0 && this.defaultLocationId > 0) {
      this.getWorkFlowConfiguration(this.processId, this.companyId, this.locationId);
    }
  }
  showLeftCol(event) {
    $(".leftdiv").removeClass("hideleftcol");
    $(".rightPanel").removeClass("showrightcol");
  }
  hidefilter() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 550) {
      $(".filter-scroll tr").click(function () {
        $(".leftdiv").addClass("hideleftcol");
        $(".rightPanel").addClass("showrightcol");
        $(".rightcol-scrroll").height("100%");
      });
    }
  }
  addData() {
    this.showfilters =false;
    this.showfilterstext="Hide List" ;    
    
    this.workflowInfoForm.setErrors(null);
    this.workflowInfoForm.reset();
    this.isLevelCreated = false;
    this.defaultWorkFlowConfigurationId = 0;
    this.previousConfigurationId = 0;
    this.resetControls();
  }

  cancelData() {
    this.workflowInfoForm.setErrors(null);
    this.isNonDepartment = false;
    this.workflowInfoForm.reset();
    this.isLevelCreated = false;
    this.formSubmitAttempt = false;
    this.previousConfigurationId = 0;
    this.resetControls();
    this.getWorkFlowCounfigurations();

  }

  DeleteWorkflow() {
    this.workFlowConfiguration = new WorkFlowConfiguration();
    this.workFlowConfiguration = this.workflowInfoForm.value;
    this.workFlowConfiguration.WorkFlowConfigurationId = (this.workflowInfoForm.get('WorkFlowConfigurationId').value);
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.workFlowApiService.DeleteWorkFlowConfiguration(this.workFlowConfiguration).subscribe((res: any) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DeletedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.getWorkFlowConfiguration(this.workFlowConfiguration.ProcessId, this.workFlowConfiguration.CompanyId, this.workFlowConfiguration.LocationID);
        });
      },
      acceptLabel: "Ok"
    });
  }

  resetControls() {
    let workProcesses = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    workProcesses.controls = [];
    var index = 0;
    workProcesses.value.forEach(element => {
      workProcesses.removeAt(index++);
    });

    this.workflowInfoForm.get('WorkFlowConfigurationId').setValue(0);
    this.workflowInfoForm.get('WorkFlowName').setValue("");
    this.workflowInfoForm.get('ProcessId').setValue("");

    this.workflowInfoForm.get('ProcessId').clearValidators();
    this.workflowInfoForm.get('ProcessId').updateValueAndValidity();
    this.workflowInfoForm.get('WorkFlowName').clearValidators();
    this.workflowInfoForm.get('WorkFlowName').updateValueAndValidity();
    this.workflowInfoForm.get('LocationID').clearValidators();
    this.workflowInfoForm.get('LocationID').updateValueAndValidity();
    this.mandatoryWorkflow = true;
  }

  getWorkFlowConfiguration(processId: number, companyId: number, locationId: number) {
    let workFlowResult = <Observable<any>>this.workFlowApiService.getWorkFlowConfiguationId(processId, companyId, locationId);
    workFlowResult.subscribe((data) => {
      debugger;
      if (data != null) {
        this.isLevelCreated = true;
        this.workFlowConfiguration = data;
        this.previousConfigurationId = this.workFlowConfiguration.WorkFlowConfigurationId;
        this.userRoles = this.filteredUserRoles;
        this.mandatoryWorkflow = this.workFlowConfiguration.IsMandatoryFollowWorkflow;
        let processName = this.workFlowProcesses.filter(x => x.ProcessId == processId)[0].ProcessName;
        if ((processName.toLowerCase() === "project master contract") || (processName.toLowerCase() === "project contract variation order")) {
          // this.isNonDepartment = true;
          //this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);
          this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
          this.fieldNames = PROJECTPOFIELDNAMES;
        }
        else if (processName.toLowerCase() === "project po") {
          //this.isNonDepartment = true;
          //this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);
          this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
          this.fieldNames = PROJECTPOFIELDNAMES;
        }
        else if (processName.toLowerCase() === "supplier" || processName.toLowerCase() === "customer master") {
          // this.isNonDepartment = true;
          this.fieldNames = SUPPLIERFIELDNAMES;
        }
        else {
          if (this.workFlowConfiguration.LocationID === null) {
            this.workFlowConfiguration.LocationID = Number(this.defaultLocationId);
          }
          this.isNonDepartment = false;
          //this.userRoles = this.userRoles.filter(h => h.RoleID !== 5);
          this.userRoles = this.userRoles.filter(h => h.RoleName.trim().toLowerCase() !== "supplierverifier");
          if ((processName.toLowerCase() === "inventory po") || (processName.toLowerCase() === "purchase request") || (processName.toLowerCase() === "sales order")) {
            this.fieldNames = FIELDNAMES;
          }
          else if (processName.toLowerCase() === "fixed asset po") {
            this.fieldNames = FIXEDPOFIELDNAMES;
          }
          else {
            this.fieldNames = CONTRACTPOFIELDNAMES;
          }
        }
        // if (this.workFlowConfiguration.LocationID === null) {
        //   this.workFlowConfiguration.LocationID = Number(this.defaultLocationId);
        // }

        this.defaultWorkFlowConfigurationId = this.workFlowConfiguration.WorkFlowConfigurationId;
        this.workflowInfoForm.patchValue(this.workFlowConfiguration);
        if (processName.toLowerCase() === "supplier" && this.workFlowConfiguration.LocationID == null) {
          this.workflowInfoForm.get('LocationID').setValue(this.locationId);
        }
        let workProcesses = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
        workProcesses.controls = [];
        var index = 0;
        workProcesses.value.forEach(element => {
          workProcesses.removeAt(index++);
        });
        if (this.workFlowConfiguration.WorkFlowProcess.length > 0) {
          this.isProcessExit = true;
        }
        else {
          this.isProcessExit = false;
        }

        this.workFlowConfiguration.WorkFlowProcess.forEach(flowProcess => {
          workProcesses.push(this.createWorkFlowProcess(flowProcess.WorkFlowProcessId, flowProcess.WorkFlowConfigurationId, flowProcess.LevelOrder, flowProcess.ProcessIndex));
          let workFlowLevels = workProcesses.controls[flowProcess.ProcessIndex].get('WorkFlowLevels') as FormArray;
          workFlowLevels.controls = [];
          var index = 0;
          workFlowLevels.value.forEach(element => {
            workFlowLevels.removeAt(index++);
          });

          flowProcess.WorkFlowLevels.forEach(workFlowLevel => {
            let approverUser = this.users.filter(x => x.UserID == workFlowLevel.ApproverUserId)[0];
            workFlowLevels.push(this.createWorkFlowLevelDetails(workFlowLevel.WorkFlowLevelId, workFlowLevel.WorkFlowProcessId, workFlowLevel.FieldName, workFlowLevel.Operator, workFlowLevel.Value, workFlowLevel.ApproverUserId, workFlowLevel.IsCondition, workFlowLevel.LevelIndex, approverUser, workFlowLevel.RoleID));
          });

          workFlowLevels = workProcesses.controls[flowProcess.ProcessIndex].get('WorkFlowLevels') as FormArray;

          for (let control of workFlowLevels.controls) {
            if (control.get("IsCondition").value) {
              control.get("ApproverUser").clearValidators();
              control.get('ApproverUser').updateValueAndValidity();
              control.get("RoleID").clearValidators();
              control.get('RoleID').updateValueAndValidity();
            }
            else {
              control.get("FieldName").clearValidators();
              control.get('FieldName').updateValueAndValidity();
              control.get("Operator").clearValidators();
              control.get('Operator').updateValueAndValidity();
              control.get("Value").clearValidators();
              control.get('Value').updateValueAndValidity();
            }
          }

        });

        this.workFlowConfigurationId = this.workFlowConfiguration.WorkFlowConfigurationId;
        if (this.editPermission) {
          this.isAccessable = true;
        }
        else {
          this.isAccessable = false;
        }
        this.workflowInfoForm.patchValue({ 'IsFollowWorkflow': this.workFlowConfiguration.IsFollowWorkflow });
      }
      else {
        this.workFlowConfiguration = new WorkFlowConfiguration();
        let configurationId = this.workFlowConfiguration.WorkFlowConfigurationId;
        this.workFlowConfiguration = null;
        this.workFlowConfigurationId = 0;
        this.isProcessExit = false;
        this.workflowInfoForm.get('WorkFlowConfigurationId').setValue(0);
        if (this.previousConfigurationId > 0) {
          this.workflowInfoForm.get('WorkFlowName').setValue("");
        }

        this.previousConfigurationId = 0;
        //this.workflowInfoForm.reset();  
        this.workflowInfoForm.setErrors(null);
        this.isLevelCreated = false;
        this.formSubmitAttempt = false;
        let workProcesses = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
        workProcesses.controls = [];
        var index = 0;
        workProcesses.value.forEach(element => {
          workProcesses.removeAt(index++);
        });

        // let workLevels = workProcesses.controls[index].get('WorkFlowLevels') as FormArray;
        // workLevels.controls = [];
        // var index = 0;
        // workLevels.value.forEach(element => {
        //   workProcesses.removeAt(index++);
        // });
      }
    });
  }

  filterData(processIndex, levelIndex) {
    let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workFlowLevels = workFlowProcess.controls[processIndex].get('WorkFlowLevels') as FormArray;
    let departmentName = "";
    let companyName = "";
    let filteredUsers = null;

    if (workFlowLevels.controls[levelIndex].get('CompanyName').value != "") {
      companyName = workFlowLevels.controls[levelIndex].get('CompanyName').value;
    }

    if (workFlowLevels.controls[levelIndex].get('DepartmentName').value != "") {
      departmentName = workFlowLevels.controls[levelIndex].get('DepartmentName').value;
    }

    if (departmentName != '' && companyName != '') {
      filteredUsers = this.users.filter(x =>
        x.CompanyName === null ? '' : x.CompanyName.toLowerCase().indexOf(companyName.toLowerCase()) !== -1 && (x.DepartmentName === null ? '' : x.DepartmentName.toLowerCase().indexOf(departmentName.toLowerCase()) !== -1)
      );
    }

    if (departmentName != '' && companyName === '') {
      filteredUsers = this.users.filter(x =>
        x.DepartmentName === null ? '' : x.DepartmentName.toLowerCase().indexOf(departmentName.toLowerCase()) !== -1
      );
    }

    if (departmentName === '' && companyName != '') {
      filteredUsers = this.users.filter(x =>
        x.CompanyName === null ? '' : x.CompanyName.toLowerCase().indexOf(companyName.toLowerCase()) !== -1
      );
    }

    if (filteredUsers.length > 0) {
      workFlowLevels.controls[levelIndex].value.Users = [];
      let approvers = workFlowLevels.controls[levelIndex].get('Approvers') as FormArray;
      approvers.controls = [];
      var index = 0;
      approvers.value.forEach(element => {
        approvers.removeAt(index++);
      });

      filteredUsers.forEach(user => {
        approvers.push(this.createUser(user.UserID, user.UserName));
      });
    }

    workFlowLevels.controls[levelIndex].get('ApproverUserId').setValue(null);
    workFlowLevels.controls[levelIndex].get('ApproverUser').setValue(null);
    $('.autocomplete-popup').addClass("hideautocomplete")
    event.stopPropagation();
  }

  resetData(processIndex, levelIndex) {
    let workFlowProcess = this.workflowInfoForm.get('WorkFlowProcess') as FormArray;
    let workFlowLevels = workFlowProcess.controls[processIndex].get('WorkFlowLevels') as FormArray;
    workFlowLevels.controls[levelIndex].get('DepartmentName').setValue("");
    workFlowLevels.controls[levelIndex].get('CompanyName').setValue("");
  }

  onSubmit() {
    debugger;
    this.formSubmitAttempt = true;
    let processName = this.workFlowProcesses.filter(x => x.ProcessId == this.processId)[0].ProcessName;
    this.setValidation(processName);
    if (this.workflowInfoForm.valid) {
      if (this.workFlowConfigurationId > 0) {
        this.updateWorkFlow(this.workflowInfoForm.value);
      }
      else {
        this.createWorkFlow(this.workflowInfoForm.value);
      }
    }
    else {
    }
  }

  createWorkFlow(workFlow: any): void {
    const self = this;
    let userDetails = <UserDetails>this.sessionService.getUser();
    workFlow.CreatedBy = userDetails.UserID;
    workFlow.UpdatedBy = userDetails.UserID;
    workFlow.CompanyId = this.sessionService.getCompanyId();
    this.workFlowApiService.createWorkFlow(workFlow).subscribe(
      (data: any) => {
        this.formSubmitAttempt = false;
        this.clearValidation();
        this.getWorkFlowCounfigurations();
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.SavedSuccessFully,
          MessageType: MessageTypes.Success
        });

      },
      err => {

      }
    );
  }

  updateWorkFlow(workFlow: any): void {
    const self = this;
    let userDetails = <UserDetails>this.sessionService.getUser();
    workFlow.UpdatedBy = userDetails.UserID;
    this.deletedWorProcesses.forEach(workProcess => {
      workFlow.WorkFlowProcess.push(workProcess);
    });

    if (this.deletedWorkLevels.length > 0) {
      this.deletedWorkLevels.forEach(workLevel => {
        workFlow.WorkFlowProcess.forEach(flowProcess => {
          if (workLevel.WorkFlowProcessId === flowProcess.WorkFlowProcessId) {
            flowProcess.WorkFlowLevels.push(workLevel);
          }
        });
      });

    }
    debugger;
    this.workFlowApiService.updateWorkFlow(workFlow).subscribe(
      (data: any) => {
        this.formSubmitAttempt = false;
        this.deletedWorProcesses = []
        this.clearValidation();
        //this.getWorkFlowConfiguration(this.processId, this.companyId, this.locationId);
        this.getWorkFlowCounfigurations();
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });

      },
      err => {

      }
    );
  }

  setValidation(processName: string) {
    this.workflowInfoForm.get('ProcessId').setValidators([Validators.required]);
    this.workflowInfoForm.get('ProcessId').updateValueAndValidity();
    this.workflowInfoForm.get('WorkFlowName').setValidators([Validators.required]);
    this.workflowInfoForm.get('WorkFlowName').updateValueAndValidity();

    if ((processName.toLowerCase() === "supplier") || (processName.toLowerCase() === "project master contract") || (processName.toLowerCase() === "project po") || (processName.toLowerCase() === "project contract variation order")) {
      this.workflowInfoForm.get('LocationID').clearValidators();;
      this.workflowInfoForm.get('LocationID').updateValueAndValidity();
    }
    else {
      this.workflowInfoForm.get('LocationID').setValidators([Validators.required]);
      this.workflowInfoForm.get('LocationID').updateValueAndValidity();
    }
  }

  clearValidation() {
    this.workflowInfoForm.get('ProcessId').clearValidators();
    this.workflowInfoForm.get('ProcessId').updateValueAndValidity();
    this.workflowInfoForm.get('WorkFlowName').clearValidators();;
    this.workflowInfoForm.get('WorkFlowName').updateValueAndValidity();
    this.workflowInfoForm.get('LocationID').clearValidators();;
    this.workflowInfoForm.get('LocationID').updateValueAndValidity();
  }

  pageChange(currentPageNumber: any) {
    this.workFlowPagerConfig.RecordsToSkip = this.workFlowPagerConfig.RecordsToFetch * (currentPageNumber - 1);
    this.getWorkFlowCounfigurations();
  }

  fullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  onSearch(event: any) {
    if (event.target.value.trim() != "") {
      this.isSearchApplied = true;
      this.getAllSearchWorkFlowCounfigurations(event.target.value, "", "", "", "");
    }
    else {
      this.isSearchApplied = false;
      this.getWorkFlowCounfigurations();
    }
  }

  filterWorkflow() {
    let workFlowName: string = "";
    let processName: string = '';
    let department: string = "";
    this.filterMessage = "";

    if (this.workFlowConfigurationFilterInfoForm.get('WorkFlowName').value != "") {
      workFlowName = this.workFlowConfigurationFilterInfoForm.get('WorkFlowName').value;
    }
    if (this.workFlowConfigurationFilterInfoForm.get('ProcessName').value != "") {
      processName = this.workFlowConfigurationFilterInfoForm.get('ProcessName').value.ProcessName;
    }
    if (this.workFlowConfigurationFilterInfoForm.get('Department').value != "") {
      department = this.workFlowConfigurationFilterInfoForm.get('Department').value.Name;
    }

    if (workFlowName === '' && processName === '' && department === '') {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }

    this.isFilter = true;
    this.getAllSearchWorkFlowCounfigurations("", "Filter", workFlowName, processName, department);

  }

  resetFilters() {
    this.workFlowConfigurationFilterInfoForm.get('ProcessName').setValue("");
    this.workFlowConfigurationFilterInfoForm.get('WorkFlowName').setValue("");
    this.workFlowConfigurationFilterInfoForm.get('Department').setValue("");
    this.filterMessage = "";
    this.isFilterApplied = false;
    this.initDone = false;
    this.isFilter = false;
    this.getWorkFlowCounfigurations();
    this.cancelData();

  }

  resetWorkFlowData() {
    this.isFilterApplied = false;
    this.initDone = false;
    this.isFilter = false;
    this.resetFilters();
  }

  openDialog() {
    this.initDone = true;
    if (this.processNameInput != null) {
      this.processNameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.processNameInput.nativeElement, 'focus'); // NEW VERSION     
    }
  }

  onRecordSelected(configuration: WorkFlowConfigurationList) {
    this.showfilters =false;
    this.showfilterstext="Show List" ;    
    this.isNonDepartment = false;
    this.processId = configuration.ProcessId;
    this.locationId = configuration.LocationID;
    this.defaultLocationId = configuration.LocationID;

    if (this.editPermission) {
      this.isAccessable = true;
    }
    else {
      this.isAccessable = false;
    }

    //alert("Process Id : " + configuration.ProcessId + " Company Id : " + configuration.CompanyId + " Location Id : " + configuration.LocationID );
    this.getWorkFlowConfiguration(configuration.ProcessId, configuration.CompanyId, configuration.LocationID);
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
    

  onEnableWorkflowChange(event) {
    this.canPost = (event.target.value == "false") ? true : false;
  }
}

class WorkFlowConfiguration {
  WorkFlowConfigurationId: number;
  CompanyId: number;
  WorkFlowName: string;
  ProcessId: number;
  LocationID: number;
  IsDeleted: boolean;
  WorkFlowProcess: WorkFlowProcessLevel[] = [];
  IsFollowWorkflow: boolean;
  IsMandatoryFollowWorkflow: boolean;
}

class WorkFlowProcessLevel {
  WorkFlowProcessId: number;
  WorkFlowConfigurationId: number;
  LevelOrder: number;
  ProcessIndex: number;
  WorkFlowLevels: WorkFlowLevel[] = [];
  IsDeleted: boolean;
}

class WorkFlowLevel {
  WorkFlowLevelId: number;
  WorkFlowProcessId: number;
  FieldName: string;
  Operator: string;
  Value: string;
  ApproverUserId: number;
  RoleID: number;
  IsCondition: boolean;
  LevelIndex: number;
  IsDeleted: boolean;
}

export class Users {
  UserID: number;
  RoleID: number;
  UserName: string;
  DepartmentName: string;
  CompanyId: number;
  CompanyName: string;
  UserRole: string;
}

export class WorkFlowProcess {
  ProcessId: number;
  ProcessName: string;
}

export class WorkFlowConfigurationList {
  WorkFlowConfigurationId: number;
  ProcessId: number;
  CompanyId: number;
  LocationID: number;
  WorkFlowName: string;
  ProcessName: string;
  Department: string
}

export class WorkFlowConfigurationDisplayResult {
  WorkFlowConfigurations: Array<WorkFlowConfigurationList>;
  TotalRecords: number;
  Search: string;
}