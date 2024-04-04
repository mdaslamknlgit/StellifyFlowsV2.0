import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { markAllAsTouched, ValidateImage } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { BankListColumns } from '../../models/grid-columns';
import { Bank, MasterProcess, MasterProcessTypes } from '../../models/adhoc-master.model';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'app-bank-master',
  templateUrl: './bank-master.component.html',
  styleUrls: ['./bank-master.component.css']
})
export class BankMasterComponent implements OnInit {
  apiEndPoint: string = environment.apiEndpoint;
  uploadedFiles: Array<File> = [];
  @ViewChild('takeInput') InputVariable: ElementRef;
  imageSrc: string;
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  BankForm: FormGroup;
  bankColumns: PTableColumn[] = [];
  bankGrid: Bank[] = [];
  userDetails: UserDetails = null;
  showLogPopUp: boolean = false;
  companyId: number = 0;
  userRoles = [];
  rolesAccessList = [];
  constructor(private fb: FormBuilder,
    private sessionService: SessionStorageService,
    private adhocMasterService: AdhocMasterService,
    private sharedService: SharedService,
    private confirmationService: ConfirmationService) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.companyId = this.sessionService.getCompanyId();
    this.apiEndPoint = this.apiEndPoint.slice(0, this.apiEndPoint.lastIndexOf('/'));
  }
  get f() {
    return this.BankForm.controls;
  }
  ngOnInit() {
    this.showDetailsScreen = false;
    this.BankForm = this.fb.group({
      BankMasterId: 0,
      CompanyId: this.companyId,
      BankACNo: new FormControl('', [Validators.required, ControlValidator.Validator]),
      BankName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      BankCode: new FormControl('', [Validators.required, ControlValidator.Validator]),
      BranchCode: new FormControl('', [Validators.required, ControlValidator.Validator]),
      SwiftCode: new FormControl('', [Validators.required, ControlValidator.Validator]),
      Misc1Information: new FormControl(''),
      Misc2Information: new FormControl(''),
      ImageSource: new FormControl(''),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsDefault: false,
      IsActive: true
    });


    this.bankColumns = BankListColumns.filter(x => x);
    this.GetBanks();
    this.BankForm.valueChanges.subscribe((form: Bank) => {
      this.IsFormValueChanges = false;
      for (var key in this.ExistingVal) {
        var formcontrol = form[key];
        if (formcontrol != null && (this.ExistingVal[key].toString().trim() != formcontrol.toString().trim())) {
          this.IsFormValueChanges = true;
          break;
        }
      }
    });
    this.getRoles();
  }
  getRoles() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    if (this.companyId > 0) {
      this.sharedService.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        userDetails.Roles = this.userRoles;
        this.sessionService.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedService.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionService.getRolesAccess();
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
              this.ClearPermissions();
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "bankmaster")[0];
              let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
              this.logPersmission = auditLogRole.IsView;
              this.addPersmission = role.IsAdd;
              this.editPersmission = role.IsEdit;
              this.deletePersmission = role.IsDelete;
            }
          });
        }
      });
    }
  }

  ClearPermissions() {
    this.logPersmission = false;
    this.addPersmission = false;
    this.editPersmission = false;
    this.deletePersmission = false;
  }

  onFileUploadChange(event: any) {
    this.f.ImageSource.setErrors(null);
    let files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      let fileItem = files.item(i);
      if (ValidateImage(fileItem.name)) {
        this.uploadedFiles.push(fileItem);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageSrc = e.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);
        this.IsFormValueChanges = true;
      }
      else {
        this.imageSrc = '';
        this.f.ImageSource.setErrors({ 'invalidformat': true });
        this.InputVariable.nativeElement.value = "";
        event.preventDefault();
        break;
      }
    }
  }
  addRecord(e) {
    this.showDetailsScreen = true;
    this.resetFormData(null);
  }
  cancelRecord() {
    let result: boolean = true;
    if (this.IsFormValueChanges) {
      result = confirm(Messages.DiscardWarning);
    }
    if (result) {
      this.showDetailsScreen = false;
      this.GetBanks();
    }
  }

  GetBanks() {
    this.adhocMasterService.GetBanks(this.companyId).subscribe((result: Bank[]) => {
      if (result != null) {
        this.bankGrid = result;
      }
    })
  }

  ChangeStatus(value: Bank, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      IsDefault: value.IsDefault,
      Status: value.IsActive,
      DocumentId: value.BankMasterId,
      ProcessId: MasterProcessTypes.BankMaster,
      UserId: this.userDetails.UserID
    };
    this.confirmationService.confirm({
      message: "Are you sure that you want to proceed? ",
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.adhocMasterService.ChangeMasterProcessStatus(masterProcess).subscribe((data: boolean) => {
          if (data) {
            this.sharedService.showMessage({
              ShowMessage: true,
              Message: `Bank ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetBanks();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.GetBanks();
      }
    });
  }
  ChangeDefault(bank: Bank) {
    let masterProcess: MasterProcess = {
      IsDefault: !bank.IsDefault,
      DocumentId: bank.BankMasterId,
      ProcessId: MasterProcessTypes.BankMaster,
      UserId: this.userDetails.UserID
    };
    this.confirmationService.confirm({
      message: "Are you sure that you want to proceed? ",
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.adhocMasterService.ChangeDefault(masterProcess).subscribe((data: boolean) => {
          if (data) {
            this.sharedService.showMessage({
              ShowMessage: true,
              Message: `Bank ${bank.IsDefault ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetBanks();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.GetBanks();
      }
    });
  }

  PostBank() {
    debugger
    if (this.BankForm.valid) {
      let bank: Bank = this.BankForm.value;
      bank.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostBank(bank, this.uploadedFiles).subscribe((result: number) => {
        if (result == -1) {
          this.BankForm.get('BankCode').setErrors({ 'BankCodeerror': true });
        }
        else {
          this.GetBanks();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.BankForm);
    }
  }

  EditBankDetails(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetBankById(index).subscribe((data: Bank) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: Bank) {
    this.BankForm.reset();
    this.uploadedFiles = [];
    this.imageSrc = '';
    if (data == null) {
      data = {
        BankMasterId: 0,
        CompanyId: this.companyId,
        BankName: '',
        BankACNo: '',
        SwiftCode: '',
        BankCode: '',
        BranchCode: '',
        ImageSource: '',
        Misc1Information: '',
        Misc2Information: '',
        IsActive: true,
        IsDefault: false,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    else {
      data = {
        BankMasterId: data.BankMasterId,
        CompanyId: this.companyId,
        BankName: data.BankName,
        BankACNo: data.BankACNo,
        SwiftCode: data.SwiftCode,
        BankCode: data.BankCode,
        BranchCode: data.BranchCode,
        ImageSource: data.ImageSource,
        Misc1Information: data.Misc1Information,
        Misc2Information: data.Misc2Information,
        IsActive: data.IsActive,
        IsDefault: data.IsDefault,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    this.imageSrc = data.ImageSource == '' ? '' : `${this.apiEndPoint}/${data.ImageSource}`;
    this.ExistingVal = data;
    this.BankForm.setValue(data);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}
