import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { TaxType, MasterProcess, MasterProcessTypes, TaxGroup } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { TaxTypeColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';

@Component({
  selector: 'app-tax-type',
  templateUrl: './tax-type.component.html',
  styleUrls: ['./tax-type.component.css']
})
export class TaxTypeComponent implements OnInit {
  taxGroups: TaxGroup[] = [];
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  TaxTypeForm: FormGroup;
  TaxColumns: PTableColumn[] = [];
  TaxTypeGrid: TaxType[] = [];
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
    this.GetAssignedTaxGroups();
  }
  get f() {
    return this.TaxTypeForm.controls;
  }
  ngOnInit() {
    this.showDetailsScreen = false;
    this.TaxTypeForm = this.fb.group({
      TaxTypeId: 0,
      TaxTypeName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      TaxPercentage: new FormControl('', [Validators.required, ControlValidator.Validator, Validators.min(0), Validators.max(99)]),
      TaxGroup: new FormControl(new TaxGroup()),
      TaxClass: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true,
      IsDefault: false
    });
    this.TaxColumns = TaxTypeColumns.filter(x => x);
    this.GetTaxTypes();
    this.TaxTypeForm.valueChanges.subscribe((form: TaxType) => {
      this.IsFormValueChanges = false;
      for (var key in this.ExistingVal) {
        var formcontrol = form[key];
        if (formcontrol != null) {
          var JsonFC;
          var JsonEV;
          JsonFC = formcontrol.toString().trim();
          JsonEV = this.ExistingVal[key].toString().trim();

          if (JsonFC == "[object Object]") {
            let newtg: TaxGroup = formcontrol;
            let oldtg: TaxGroup = this.ExistingVal[key];
            if (newtg.TaxGroupId != oldtg.TaxGroupId) {
              this.IsFormValueChanges = true;
              break;
            };
          }
          else if (JsonFC.trim() != JsonEV.trim()) {
            this.IsFormValueChanges = true;
            break;
          }
        }
      }
    });
    this.getRoles();
  }
  GetAssignedTaxGroups() {
    this.adhocMasterService.GetAssignedTaxGroups(this.companyId).subscribe((result: TaxGroup[]) => {
      if (result != null) {
        this.taxGroups = result;
      }
    });
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
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "taxtype")[0];
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
      this.GetTaxTypes();
    }
  }

  GetTaxTypes() {
    this.adhocMasterService.GetTaxTypes(this.companyId).subscribe((result: TaxType[]) => {
      if (result != null) {
        this.TaxTypeGrid = result;
      }
    })
  }

  ChangeStatus(value: TaxType, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      IsDefault : value.IsDefault,
      Status: value.IsActive,
      DocumentId: value.TaxTypeId,
      ProcessId: MasterProcessTypes.TaxType,
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
              Message: `Tax Type ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetTaxTypes();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.TaxTypeGrid.forEach((element: TaxType) => {
          if (element.TaxTypeId == value.TaxTypeId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }
  SetValidators() {
    let taxGroup = this.f.TaxGroup.value;
    this.f.TaxGroup.clearValidators();
    if (taxGroup == null || taxGroup == undefined)
      this.f.TaxGroup.setErrors({ 'invalid': true });
  }
  PostTaxType() {
    this.SetValidators();
    if (this.TaxTypeForm.valid) {
      let TaxTypeDetail: TaxType = this.TaxTypeForm.value;
      TaxTypeDetail.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostTaxType(TaxTypeDetail).subscribe((result: number) => {
        if (result == -1) {
          this.TaxTypeForm.get('TaxClass').setErrors({ 'TaxClasserror': true });
        }
        else {
          this.GetTaxTypes();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.TaxTypeForm);
    }
  }

  EditTaxTypeDetails(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetTaxTypeById(this.companyId, index).subscribe((data: TaxType) => {
      this.resetFormData(data);
    });
  }
  ChangeDefault(taxType: TaxType) {
    let masterProcess: MasterProcess = {
      IsDefault: !taxType.IsDefault,
      DocumentId: taxType.TaxTypeId,
      ProcessId: MasterProcessTypes.TaxType,
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
              Message: `Tax Type ${taxType.IsDefault ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetTaxTypes();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.GetTaxTypes();
      }
    });
  }
  resetFormData(data: TaxType) {
    this.TaxTypeForm.reset();
    if (data == null) {
      let tg: TaxGroup = {
        CompanyId: 0,
        CreatedBy: 0,
        Description: '',
        IsActive: true,
        TaxGroupId: 0,
        TaxGroupName: '',
        UpdatedBy: 0
      };
      data = {
        TaxTypeId: 0,
        TaxTypeName: '',
        TaxPercentage: 0,
        TaxGroup: tg,
        TaxClass: '',
        IsActive: true,
        IsDefault: false,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    data.TaxGroup.UpdatedBy = this.userDetails.UserID;
    data.TaxGroup.IsActive = true;
    this.ExistingVal = data;
    this.TaxTypeForm.setValue(data);
    let selectedtgGroup = this.taxGroups.filter(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
    this.TaxTypeForm.get('TaxGroup').setValue(selectedtgGroup[0]);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}
