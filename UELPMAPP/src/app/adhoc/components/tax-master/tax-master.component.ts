import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, TransactionType, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { MasterProcess, MasterProcessTypes, TaxGroup, TaxMaster } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { TaxMasterColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';

@Component({
  selector: 'app-tax-master',
  templateUrl: './tax-master.component.html',
  styleUrls: ['./tax-master.component.css']
})
export class TaxMasterComponent implements OnInit {

  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  taxGroups: TaxGroup[] = [];
  TaxMasterForm: FormGroup;
  TaxMasterColumns: PTableColumn[] = [];
  TaxMasterGrid: TaxMaster[] = [];
  userDetails: UserDetails = null;
  showLogPopUp: boolean = false;
  companyId: number = 0;
  userRoles = [];
  rolesAccessList = [];
  transactionTypes: TransactionType[];
  constructor(private fb: FormBuilder,
    private sessionService: SessionStorageService,
    private adhocMasterService: AdhocMasterService,
    private sharedService: SharedService,
    private confirmationService: ConfirmationService) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.companyId = this.sessionService.getCompanyId();
    this.GetTaxGroups();
    this.GetTransactionTypes();
  }
  get f() {
    return this.TaxMasterForm.controls;
  }
  ngOnInit() {
    this.showDetailsScreen = false;
    this.TaxMasterForm = this.fb.group({
      TaxMasterId: 0,
      TransactionType: new FormControl(new TransactionType()),
      TaxGroup: new FormControl(new TaxGroup()),
      TaxName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      Description: [{ value: '', disabled: true }],
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.TaxMasterColumns = TaxMasterColumns.filter(x => x);
    this.GetTaxMasters();
    this.TaxMasterForm.valueChanges.subscribe((form: TaxMaster) => {
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
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "taxmaster")[0];
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
  OnTransactionTypeChange() {
    this.f.TransactionType.clearValidators();
    if (this.f.TransactionType.value == null) {
      this.f.TransactionType.setErrors({ 'invalid': true });
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
      this.GetTaxMasters();
    }
  }
  GetTaxMasters() {
    this.adhocMasterService.GetTaxMasters(this.companyId).subscribe((result: TaxMaster[]) => {
      if (result != null) {
        this.TaxMasterGrid = result;
      }
    });
  }
  GetTaxGroups() {
    this.adhocMasterService.GetTaxGroups(this.companyId).subscribe((result: TaxGroup[]) => {
      if (result != null) {
        this.taxGroups = result;
      }
    });
  }

  GetTransactionTypes() {
    this.sharedService.GetTransactionTypes().subscribe((result: TransactionType[]) => {
      if (result != null) {
        this.transactionTypes = result;
      }
    });
  }

  ChangeStatus(value: TaxMaster, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      Status: value.IsActive,
      DocumentId: value.TaxMasterId,
      ProcessId: MasterProcessTypes.TaxMaster,
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
              Message: `TaxMaster ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetTaxMasters();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.TaxMasterGrid.forEach((element: TaxMaster) => {
          debugger
          if (element.TaxMasterId == value.TaxMasterId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }

  PostTaxMaster() {
    this.SetValidators();
    if (this.TaxMasterForm.valid) {
      let TaxMaster: TaxMaster = this.TaxMasterForm.value;
      TaxMaster.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostTaxMaster(TaxMaster).subscribe((result: number) => {
        if (result == -1) {
          this.TaxMasterForm.get('TaxGroup').setErrors({ 'TaxGrouperror': true });
        }
        else {
          this.GetTaxMasters();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.TaxMasterForm);
    }
  }
  SetValidators() {
    let taxGroup = this.f.TaxGroup.value;
    this.f.TaxGroup.clearValidators();
    let Description = '';
    if (taxGroup != null && taxGroup !=undefined)
      Description = taxGroup.Description;
    else
      this.f.TaxGroup.setErrors({ 'invalid': true });
    this.f.Description.setValue(Description);
  }

  GetTaxMasterById(index) {
    this.GetTaxGroups();
    this.GetTransactionTypes();
    this.showDetailsScreen = true;
    this.adhocMasterService.GetTaxMasterById(this.companyId, index).subscribe((data: TaxMaster) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: any) {
    debugger
    this.TaxMasterForm.reset();
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
      let tt: TransactionType = {
        TransactionTypeId: 1,
        TransactionTypeName: 'Sales'
      }
      data = {
        TaxMasterId: 0,
        TaxGroup: tg,
        TransactionType: tt,
        TaxName: '',
        IsActive: true,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }

    data.Description = '';
    this.ExistingVal = data;
    this.TaxMasterForm.setValue(data);
    let selectedTType = this.transactionTypes.filter(x => x.TransactionTypeId == data.TransactionType.TransactionTypeId);
    let selectedtgGroup = this.taxGroups.filter(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
    this.TaxMasterForm.get('TransactionType').setValue(selectedTType[0]);
    this.TaxMasterForm.get('TaxGroup').setValue(selectedtgGroup[0]);
    this.TaxMasterForm.get('Description').setValue(data.TaxGroup.Description);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}
