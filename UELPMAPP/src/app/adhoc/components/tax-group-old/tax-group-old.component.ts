import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from '../../../shared/models/shared.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { TaxGroup, MasterProcess, MasterProcessTypes } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from '../../../shared/classes/control-validator';
import { TaxGroupColumns } from '../../models/grid-columns';
import { markAllAsTouched } from '../../../shared/shared';
import { SharedService } from '../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from '../../../administration/models/role';

@Component({
  selector: 'app-tax-group-old',
  templateUrl: './tax-group-old.component.html',
  styleUrls: ['./tax-group-old.component.css']
})
export class TaxGroupOldComponent implements OnInit {
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  TaxGroupForm: FormGroup;
  TaxGroupColumns: PTableColumn[] = [];
  TaxGroupGrid: TaxGroup[] = [];
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
    this.TaxGroupForm = this.fb.group({
      TaxGroupId: 0,
      CompanyId: this.companyId,
      Description: new FormControl('', [Validators.required, ControlValidator.Validator]),
      TaxGroupName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.TaxGroupColumns = TaxGroupColumns.filter(x => x);
    this.GetTaxGroups();
    this.TaxGroupForm.valueChanges.subscribe((form: TaxGroup) => {
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
              let roles = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "taxgroup");
              let role = roles.filter(x => x.PageId == 96)[0];
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
      this.GetTaxGroups();
    }
  }

  GetTaxGroups() {
    this.adhocMasterService.GetTaxGroups(this.companyId).subscribe((result: TaxGroup[]) => {
      if (result != null) {
        this.TaxGroupGrid = result;
      }
    })
  }

  ChangeStatus(value: TaxGroup, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      Status: value.IsActive,
      DocumentId: value.TaxGroupId,
      ProcessId: MasterProcessTypes.TaxGroup,
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
              Message: `TaxGroup ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetTaxGroups();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.TaxGroupGrid.forEach((element: TaxGroup) => {
          debugger
          if (element.TaxGroupId == value.TaxGroupId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }

  PostTaxGroup() {
    if (this.TaxGroupForm.valid) {
      let TaxGroup: TaxGroup = this.TaxGroupForm.value;
      TaxGroup.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostTaxGroup(TaxGroup).subscribe((result: number) => {
        if (result == -1) {
          this.TaxGroupForm.get('TaxGroupName').setErrors({ 'TaxGroupNameerror': true });
        }
        else {
          this.GetTaxGroups();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.TaxGroupForm);
    }
  }

  GetTaxGroupById(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetTaxGroupById(index).subscribe((data: TaxGroup) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: TaxGroup) {
    this.TaxGroupForm.reset();
    if (data == null) {
      data = {
        CompanyId: this.companyId,
        TaxGroupId: 0,
        TaxGroupName: '',
        Description: '',
        IsActive: true,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    this.ExistingVal = data;
    this.TaxGroupForm.setValue(data);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}
