import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit, Renderer } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkFlowReAssignmentAPIService } from '../../services/workflow-re-assignment-api.service';
// import { } from '../../models/workflow-re-assignment';
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages, MessageTypes, Taxes, PagerConfig, UserDetails, ResponseStatusTypes } from "../../../shared/models/shared.model";
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, identity } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AutofocusDirective } from '../../../shared/directives/focusdirective';
import { FullScreen } from "../../../shared/shared";
import { ConfirmationService } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute } from '@angular/router';
import { UserManagementApiService } from '../../services/user-management-api.service';
import { WorkFlowReAssignment, WorkflowItems, Documents } from '../../models/workflowreassignment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-workflow-re-assignment',
  templateUrl: './workflow-re-assignment.component.html',
  styleUrls: ['./workflow-re-assignment.component.css']
})
export class WorkflowReAssignmentComponent implements OnInit {
  @ViewChild('rightPanel') rightPanelRef;
  leftSection: boolean = false;
  rightSection: boolean = false;
  hideInput: boolean = false;
  scrollbarOptions: any;
  workflowReAssignmentInfoForm: FormGroup;
  showGridErrorMessage: boolean = false;
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  formSubmitAttempt: boolean = false;
  // rolesGridColumns: Array<{ field: string, header: string }> = [];
  workItemsGridColumns: Array<{ field: string, header: string }> = [];
  documentGridColumns: Array<{ field: string, header: string }> = [];
  rolesColumns: Array<{ field: string, header: string }> = [];
  errorMessage: string = Messages.NoRecordsToDisplay;
  companyId: number = 0;
  disableSubmit: boolean = true;
  userDetails: UserDetails;
  message: string = "";
  users: Array<UserDetails> = [];
  approvers = [];
  selectedUserRoles = [];
  workFlowReAssignmentData: WorkFlowReAssignment
  userRoles = [];
  showLeftPanelLoadingIcon: boolean = false;
  formError: string = "";
  isDisplayMode: boolean = false;
  workFlowReAssignmentLogId: number = 0;
  selectedCompanyId: number = 0;
  public screenWidth: any;
  constructor(private workflowReAssignmentAPIService: WorkFlowReAssignmentAPIService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private sharedServiceObj: SharedService,
    private renderer: Renderer,
    public sessionService: SessionStorageService,
    private userManagementApiService: UserManagementApiService,
    private confirmationServiceObj: ConfirmationService) {
    this.companyId = this.sessionService.getCompanyId();
  }

  ngOnInit() {


    this.workItemsGridColumns = [
      { field: 'Sno', header: 'S.No' },
      { field: 'CompanyName', header: 'Company' },
      { field: 'ProcessName', header: 'Document Name' },
      { field: 'DepartmentName', header: 'Dept. Name' },
      // { field: 'LevelIndex', header: 'Workflow Order' },
      { field: 'RoleName', header: 'Role' },
      { field: 'WorkFlowLevelId', header: 'Default' }
    ];

    this.documentGridColumns = [
      { field: 'SNo', header: 'S.No' },
      { field: 'DocumentCode', header: 'Document Code' },
      { field: 'ProcessName', header: 'Document Type' },
      // { field: 'LevelIndex', header: 'Workflow Order' },
      { field: 'WorkFlowStatus', header: 'Workflow Status' },
      { field: 'CompanyName', header: 'Company' },
      { field: 'WorkFlowId', header: 'Default' },
      { field: 'DocumentId', header: 'Default' }
    ];

    this.rolesColumns = [
      { field: 'SNo', header: 'No.' },
      { field: 'CompanyName', header: 'Company' },
      { field: 'RoleName', header: 'Role(s)' }
    ];

    this.workFlowReAssignmentData = null;
    this.workflowReAssignmentInfoForm = this.fb.group({
      CurrentApproverUserId: 0,
      CurrentApproverUser: [null, { validators: [Validators.required] }],
      AlternateApproverUserId: 0,
      AlternateApproverUser: [null, { validators: [Validators.required] }],
      UserRoles: [],
      WorkflowItems: this.fb.array([]),
      Documents: this.fb.array([]),
      Roles: this.fb.array([])
    });

    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.workFlowReAssignmentData = new WorkFlowReAssignment();
    this.workFlowReAssignmentData.UserRoles = [];

    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-180;
      }
  }

  usersInputFormater = (x: UserDetails) => x.UserName;

  searchUsers(): (text: Observable<string>) => Observable<any[]> {
    let users = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          if (term === '') {
            this.clearForm();
            return []
          }
          else {
            return this.userManagementApiService.getUsersByCompany({
              Search: term,
              CompanyId: this.companyId,
              UserID: ""
            }).map((res: any) => {
              res.forEach((item, index) => {
                item.index = index;
              });
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

  searchApprovers(): (text: Observable<string>) => Observable<any[]> {
    let users = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          if (term === '') {
            return []
          }
          else {
            let user = null;
            if (this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value != null) {
              user = this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value;
            }
            let userRoles = this.workflowReAssignmentInfoForm.get('UserRoles').value;
            if (userRoles != null) {
              this.selectedCompanyId = userRoles[0].CompanyId;
            }
            return this.userManagementApiService.getUsersByRole({
              Search: term,
              CompanyId: this.selectedCompanyId,
              UserID: user.UserID
            }).map((res: any) => {
              res.forEach((item, index) => {
                item.index = index;
              });
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

  //adding row to the grid..
  addDocumentGridItem(noOfLines: number) {
    let documentControl = <FormArray>this.workflowReAssignmentInfoForm.controls['Documents'];
    for (let i = 0; i < noOfLines; i++) {
      documentControl.push(this.initDocumentsGridRows());
    }
  }

  initDocumentsGridRows() {
    return this.fb.group({
      'WorkFlowReAssignmentDocumentLogId': 0,
      'WorkFlowId': 0,
      'DocumentId': 0,
      // 'LevelIndex': '',
      'DocumentCode': '',
      'ProcessName': '',
      'WorkFlowStatus': '',
      'CompanyName': '',
      'CompanyId': ''
    });
  }

  //adding row to the grid..
  addWorkItemsGridItem(noOfLines: number) {
    let workflowItemsControl = <FormArray>this.workflowReAssignmentInfoForm.controls['WorkflowItems'];
    for (let i = 0; i < noOfLines; i++) {
      workflowItemsControl.push(this.initWorkItemsGridRows());
    }
  }

  initWorkItemsGridRows() {
    return this.fb.group({
      'WorkFlowReAssignmentStrucutreLogId': 0,
      'WorkFlowLevelId': 0,
      'ProcessName': '',
      'DepartmentName': '',
      'LevelIndex': '',
      'RoleName': '',
      'CompanyName': '',
      'CompanyId': ''
    });
  }

  addRolesGridItem(noOfLines: number) {
    let workflowItemsControl = <FormArray>this.workflowReAssignmentInfoForm.controls['Roles'];
    for (let i = 0; i < noOfLines; i++) {
      workflowItemsControl.push(this.initRolesGridRows());
    }
  }

  initRolesGridRows() {
    return this.fb.group({
      'CompanyName': '',
      'RoleName': ''
    });
  }

  validateControl(control: any) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  fullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  resetData() {
    this.clearForm();
  }

  clearForm() {
    this.workflowReAssignmentInfoForm.reset();
    this.workflowReAssignmentInfoForm.setErrors(null);
    this.formError = "";
    let workflowItems = <FormArray>this.workflowReAssignmentInfoForm.controls['WorkflowItems'];
    workflowItems.controls = [];
    workflowItems.controls.length = 0;

    let documents = <FormArray>this.workflowReAssignmentInfoForm.controls['Documents'];
    documents.controls = [];
    documents.controls.length = 0;

    let roles = <FormArray>this.workflowReAssignmentInfoForm.controls['Roles'];
    roles.controls = [];
    roles.controls.length = 0;
    this.workFlowReAssignmentData = new WorkFlowReAssignment();
    this.workFlowReAssignmentData.UserRoles = [];
    this.isDisplayMode = false;
    this.disableSubmit = true;
  }

  onAlternateApproverChange(event?: any) {
    let userDetails: UserDetails;
    if (event != null && event != undefined) {
      userDetails = event.item;
      let currentUser = this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value;
      if (currentUser != null) {
        this.workflowReAssignmentAPIService.VerifyAlternateUser(currentUser.UserID, userDetails.UserID).subscribe((data: string) => {
          this.disableSubmit = false;
          if (data != '') {
            this.disableSubmit = true;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.WorkFlowReAssignmentVerifyMessage + data,
              MessageType: MessageTypes.Error
            });
          }
        });
      }
    }
    if (this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value != null && (event != null && event != undefined)) {
      this.formError = "";
      this.workFlowReAssignmentData.AlternateApproverUserId = userDetails.UserID;
      this.workflowReAssignmentInfoForm.patchValue({
        AlternateApproverUserId: userDetails.UserID
      });
    }
  }

  onUserChange(event?: any) {
    this.formError = "";
    this.showLeftPanelLoadingIcon = true;
    this.isDisplayMode = false;
    let userDetails: UserDetails;
    if (event != null && event != undefined) {
      userDetails = event.item;
      this.workflowReAssignmentInfoForm.get('AlternateApproverUser').setValue('');
    }

    let workflowItems = <FormArray>this.workflowReAssignmentInfoForm.controls['WorkflowItems'];
    workflowItems.controls = [];
    workflowItems.controls.length = 0;

    let documents = <FormArray>this.workflowReAssignmentInfoForm.controls['Documents'];
    documents.controls = [];
    documents.controls.length = 0;

    //populating user related roles, workflow structure and pending documents details
    if (userDetails != undefined) {
      let userWorkflowResult = <Observable<WorkFlowReAssignment>>this.workflowReAssignmentAPIService.getUserWorkFlowReAssignDetails(userDetails.UserID, this.companyId);
      userWorkflowResult.subscribe((data) => {
        if (data != null) {
          debugger
          this.workFlowReAssignmentData = data;
          this.showLeftPanelLoadingIcon = false;
          if (this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value != null) {
            this.workFlowReAssignmentData.CurrentApproverUserId = this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value.UserID;

          }

          if (this.workFlowReAssignmentData.Documents != undefined) {
            this.addDocumentGridItem(this.workFlowReAssignmentData.Documents.length);
          }

          if (this.workFlowReAssignmentData.WorkflowItems != undefined) {
            this.addWorkItemsGridItem(this.workFlowReAssignmentData.WorkflowItems.length);
          }

          if (this.workFlowReAssignmentData.UserRoles == null) {
            this.workFlowReAssignmentData.UserRoles = [];
          }

          if (this.workFlowReAssignmentData.UserRoles != undefined) {
            this.addRolesGridItem(this.workFlowReAssignmentData.UserRoles.length);
          }

          this.workflowReAssignmentInfoForm.patchValue(this.workFlowReAssignmentData);
          if (this.workFlowReAssignmentData.Documents.length == 0) {
            this.disableSubmit = true;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.WorkFlowReAssignmentNoDocsMessage,
              MessageType: MessageTypes.Error
            });
          }
        }
        else {
          this.showLeftPanelLoadingIcon = false;
        }
      });
    }
  }

  onPDFPreview() {
    let workFlowReAssignDetails: WorkFlowReAssignment = this.workflowReAssignmentInfoForm.value;
    workFlowReAssignDetails.CurrentApproverUserName = this.workflowReAssignmentInfoForm.value.CurrentApproverUser.UserName;
    workFlowReAssignDetails.AlternateApproverUserName = this.workflowReAssignmentInfoForm.value.AlternateApproverUser.UserName;
    workFlowReAssignDetails.CompanyId = this.companyId;
    workFlowReAssignDetails.CreatedBy = this.userDetails.UserID;
    workFlowReAssignDetails.UserRoles = this.workFlowReAssignmentData.UserRoles;
    workFlowReAssignDetails.WorkFlowReAssignmentLogId = this.workFlowReAssignmentLogId;
    this.workFlowReAssignmentData = workFlowReAssignDetails;

    workFlowReAssignDetails.preview = true;
    let pdfDocument = this.workflowReAssignmentAPIService.printDetails(workFlowReAssignDetails);
    pdfDocument.subscribe((data) => {
      var todaydate = this.datePipe.transform(new Date(), "dd-MM-yyyy");
      saveAs(new Blob([(data)], { type: 'application/pdf' }), workFlowReAssignDetails.CurrentApproverUserName + todaydate + ".pdf");

    });


  }

  onPDFPrint() {
    if (this.isDisplayMode) {
      this.showLeftPanelLoadingIcon = true;
      let workFlowReAssignDetails = this.workFlowReAssignmentData;
      workFlowReAssignDetails.WorkFlowReAssignmentLogId = this.workFlowReAssignmentLogId;
      workFlowReAssignDetails.UserRoles = [];
      workFlowReAssignDetails.WorkflowItems = [];
      workFlowReAssignDetails.Documents = [];
      workFlowReAssignDetails.preview = false;
      let pdfDocument = this.workflowReAssignmentAPIService.printDetails(workFlowReAssignDetails);
      pdfDocument.subscribe((data) => {
        let result = new Blob([data], { type: 'application/pdf' });
        this.showLeftPanelLoadingIcon = false;
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {//IE
          window.navigator.msSaveOrOpenBlob(result, "WprkFlowReAssignment.pdf");
        } else {
          const fileUrl = URL.createObjectURL(result);
          let tab = window.open();
          tab.location.href = fileUrl;
        }
        this.clearForm();
      });
    }
  }

  onSubmit() {
    this.hideInput = true;
    this.formError = "";
    if (!this.workflowReAssignmentInfoForm.valid) {

      Object.keys(this.workflowReAssignmentInfoForm.controls).forEach((key: string) => {
        let itemGroupControl = <FormArray>this.workflowReAssignmentInfoForm.controls[key];
        if (itemGroupControl.controls != undefined) {
          Object.keys(itemGroupControl.controls).forEach((key: string) => {
            if (itemGroupControl.controls[key].status == "INVALID" && itemGroupControl.controls[key].touched == false) {
              itemGroupControl.controls[key].markAsTouched();
            }
          });
        }

        if (this.workflowReAssignmentInfoForm.controls[key].status == "INVALID" && this.workflowReAssignmentInfoForm.controls[key].touched == false) {
          this.workflowReAssignmentInfoForm.controls[key].markAsTouched();
        }
      });

      this.formError = "Please fill in the mandatory fields (marked in red) and then click on Save";
      this.showLeftPanelLoadingIcon = false;
      return;
    }

    let documentControl = <FormArray>this.workflowReAssignmentInfoForm.controls['Documents'];
    let workflowItemsControl = <FormArray>this.workflowReAssignmentInfoForm.controls['WorkflowItems'];
    if (documentControl.controls.length === 0 && workflowItemsControl.controls.length === 0) {
      this.formError = "Unable to assign as there are no workflow items and pending documents for user : " + this.workflowReAssignmentInfoForm.get('CurrentApproverUser').value.UserName;
      this.showLeftPanelLoadingIcon = false;
      return;
    }

    this.confirmationServiceObj.confirm({
      message: Messages.WorkFlowReAssignmentMessage,
      header: "Confirmation",
      acceptLabel: "Yes",
      rejectLabel: "No",
      rejectVisible: true,
      accept: () => {
        this.showLeftPanelLoadingIcon = true;
        let workFlowReAssignDetails: WorkFlowReAssignment = this.workflowReAssignmentInfoForm.value;
        workFlowReAssignDetails.CurrentApproverUserName = this.workflowReAssignmentInfoForm.value.CurrentApproverUser.UserName;
        workFlowReAssignDetails.AlternateApproverUserName = this.workflowReAssignmentInfoForm.value.AlternateApproverUser.UserName;
        workFlowReAssignDetails.CompanyId = this.companyId;
        workFlowReAssignDetails.CreatedBy = this.userDetails.UserID;
        workFlowReAssignDetails.UserRoles = this.workFlowReAssignmentData.UserRoles;
        this.workFlowReAssignmentData = workFlowReAssignDetails;
        this.createWorkFlowReAssignment(workFlowReAssignDetails);
      },
      reject: () => {
        this.showLeftPanelLoadingIcon = false;
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.WorkFlowReAssignmentCancelMessage,
          MessageType: MessageTypes.Error
        });
      }
    });
  }

  createWorkFlowReAssignment(workFlowReAssignDetails: any): void {
    const self = this;
    this.workflowReAssignmentAPIService.createWorkFlowReAssignment(workFlowReAssignDetails).subscribe(
      (data: any) => {
        if (data > 0) {
          this.workFlowReAssignmentLogId = data;
          this.isDisplayMode = true;
          this.disableSubmit = true;
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.WorkFlowReAssignmentSuccessMessage,
            MessageType: MessageTypes.Success
          });
        }
      },
      err => {
        this.showLeftPanelLoadingIcon = false;
      }
    );
  }
}
