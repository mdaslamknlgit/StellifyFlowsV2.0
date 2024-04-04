import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { CreditTerm, MasterProcess, MasterProcessTypes } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { CreditTermsColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';

@Component({
  selector: 'app-credit-term',
  templateUrl: './credit-term.component.html',
  styleUrls: ['./credit-term.component.css']
})
export class CreditTermComponent implements OnInit {
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  CreditTermsForm: FormGroup;
  CreditTermColumns: PTableColumn[] = [];
  CreditTermGrid: CreditTerm[] = [];
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
  }

  ngOnInit() {
    this.showDetailsScreen = false;
    this.CreditTermsForm = this.fb.group({
      CreditTermId: 0,
      CompanyId: this.companyId,
      Description: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CreditTermCode: new FormControl('', [Validators.required, ControlValidator.Validator]),
      NoOfDays: new FormControl(0, [Validators.required, Validators.min(0)]),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.CreditTermColumns = CreditTermsColumns.filter(x => x);
    this.GetCreditTerms();
    this.CreditTermsForm.valueChanges.subscribe((form: CreditTerm) => {
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
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "creditterm")[0];
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
      this.GetCreditTerms();
    }
  }

  GetCreditTerms() {
    this.adhocMasterService.GetCreditTerms(this.companyId).subscribe((result: CreditTerm[]) => {
      if (result != null) {
        this.CreditTermGrid = result;
      }
    })
  }

  ChangeStatus(value: CreditTerm, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      IsDefault: value.IsDefault,
      Status: value.IsActive,
      DocumentId: value.CreditTermId,
      ProcessId: MasterProcessTypes.CreditTerm,
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
              Message: `Credit Term ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetCreditTerms();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.GetCreditTerms();
      }
    });
  }
  ChangeDefault(creditTerm: CreditTerm) {
    let masterProcess: MasterProcess = {
      IsDefault: !creditTerm.IsDefault,
      DocumentId: creditTerm.CreditTermId,
      ProcessId: MasterProcessTypes.CreditTerm,
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
              Message: `Credit Term ${creditTerm.IsDefault ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetCreditTerms();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.GetCreditTerms();
      }
    });
  }

  PostCreditTerm() {
    if (this.CreditTermsForm.valid) {
      let creditTerm: CreditTerm = this.CreditTermsForm.value;
      creditTerm.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostCreditTerm(creditTerm).subscribe((result: number) => {
        if (result == -1) {
          this.CreditTermsForm.get('CreditTermCode').setErrors({ 'CreditTermCodeerror': true });
        }
        else {
          this.GetCreditTerms();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.CreditTermsForm);
    }
  }

  GetCreditTermById(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetCreditTermById(index).subscribe((data: CreditTerm) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: CreditTerm) {
    this.CreditTermsForm.reset();
    if (data == null) {
      data = {
        CreditTermId: 0,
        CompanyId: this.companyId,
        CreditTermCode: '',
        NoOfDays: 0,
        Description: '',
        IsActive: true,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID,
        IsDefault: false
      };
    }
    this.ExistingVal = data;
    this.CreditTermsForm.setValue(data);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}
