import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SupplierContactPerson } from '../../models/supplier';
import { Observable } from 'rxjs/internal/Observable';
import { Messages, MessageTypes, EmailSupplier ,UserDetails} from '../../../shared/models/shared.model';
import { POCreationService } from '../../services/po-creation.service';
import { EMAIL_PATTERN } from '../../../shared/constants/generic';
@Component({
  selector: 'email-purchase-order-popup',
  templateUrl: './email-purchase-order-popup.component.html',
  styleUrls: ['./email-purchase-order-popup.component.css'],
  providers: [POCreationService]
})
export class EmailPurchaseOrderPopupComponent implements OnInit, OnChanges {

  @Input() showEmailPopUp: boolean = false;
  @Input('SupId') SupplierId: number;
  @Input() PurchaseOrderId: number = 0;
  @Input() PurchaseOrderTypeId: number = 0;
  @Input('CompanyId') CompanyId: number = 0;
  @Output() onStatusUpdate: EventEmitter<{ PurchaseOrderId: number, PurchaseOrderTypeId: number }> = new EventEmitter<{ PurchaseOrderId: number, PurchaseOrderTypeId: number }>();

  @Output() hideEmailPopUp: EventEmitter<boolean> = new EventEmitter<boolean>();
  gridColumns: Array<{ field: string, header: string }> = [];
  purchaseOrderEmailForm: FormGroup;
  showGridErrorMessage: boolean = false;
  supplierContactList: Array<SupplierContactPerson> = [];
  rowsToAdd: number = 1;  
  constructor(private formBuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private sessionService: SessionStorageService, private pocreationObj: POCreationService, ) {

  }

  ngOnInit() {
    this.gridColumns = [
      { field: '', header: '' },
      { field: 'ContactName', header: 'Contact Name' },
      { field: 'Email', header: 'Email' }
    ];

  }
  ngOnChanges() {  
    console.log(this.SupplierId);
    console.log(this.PurchaseOrderId);
    console.log(this.PurchaseOrderTypeId);
    console.log(this.CompanyId);
    this.createPoEmailForm();
  }


  addGridItem(noOfLines: number) {
    let itemGroupControl = <FormArray>this.purchaseOrderEmailForm.controls['SupplierContactDetails'];
    for (let i = 0; i < noOfLines; i++) {
      itemGroupControl.push(this.initGridRows());
    }
  }

  onPopUpHide() {
    this.hideEmailPopUp.emit(true);
  }


  initGridRows() {
    return this.formBuilderObj.group({
      'Checked': [false],
      'ContactPersonId': 0,
      'ContactNumber':"",
      'Department':"",
      'Name': [""],
      'EmailId': [""]
    });
  }

  addSupplierEmail(noOfLines: number) {    
    let emailControl = <FormArray>this.purchaseOrderEmailForm.controls['SupplierContactDetails'];
    for (let i = 0; i < noOfLines; i++) {
      emailControl.push(this.initGridRows());
    }
  }

  checkValue(eventData: any, index: number) {
    let emailControl = <FormArray>this.purchaseOrderEmailForm.controls['SupplierContactDetails'];   
    if (emailControl.controls[index].get("Checked").value){
      emailControl.controls[index].get("Name").setValidators([Validators.required])
      emailControl.controls[index].get("Name").updateValueAndValidity();
      emailControl.controls[index].get("EmailId").setValidators([Validators.required,Validators.pattern(EMAIL_PATTERN)])
      emailControl.controls[index].get("EmailId").updateValueAndValidity();   
    }
    else {
      emailControl.controls[index].get("Name").clearValidators();
      emailControl.controls[index].get('Name').updateValueAndValidity();
      emailControl.controls[index].get("EmailId").clearValidators();
      emailControl.controls[index].get('EmailId').updateValueAndValidity();
    }
  }

  createPoEmailForm() {
    this.showGridErrorMessage = false;
    if (this.purchaseOrderEmailForm == undefined) {
      this.purchaseOrderEmailForm = this.formBuilderObj.group({
        'SupplierContactDetails': this.formBuilderObj.array([])
      });
    }
    this.sharedServiceObj.getSupplierContact(this.SupplierId, this.CompanyId,this.PurchaseOrderId,this.PurchaseOrderTypeId)
      .subscribe((data: Array<SupplierContactPerson>) => {
        this.supplierContactList = data;
        this.addGridItem(this.supplierContactList.length);
        this.purchaseOrderEmailForm.patchValue({
          SupplierContactDetails: this.supplierContactList
        });
      });
  }

  emailRecord() {  
    let count: number = 0;
    let emailString: string = "";
    let SupplierContactPersons =[];
    this.showGridErrorMessage = false;
    let itemGroupControl = <FormArray>this.purchaseOrderEmailForm.controls['SupplierContactDetails'];
    let userDetails = <UserDetails>this.sessionService.getUser();
    if (itemGroupControl.length > 0) {
      for (let i = 0; i < itemGroupControl.length; i++) {
        let checked = itemGroupControl.controls[i].get('Checked').value;
        if (checked == true) {
          if (itemGroupControl.controls[i].get('EmailId').value != null || itemGroupControl.controls[i].get('EmailId').value != "") {
            SupplierContactPersons.push({
              ContactPersonId: 0,
              Name: itemGroupControl.controls[i].get('Name').value != null? itemGroupControl.controls[i].get('Name').value : null,
              CompanyId: this.CompanyId,
              ContactNumber: itemGroupControl.controls[i].get('ContactNumber').value !=  null? itemGroupControl.controls[i].get('ContactNumber').value : null,
              EmailId: itemGroupControl.controls[i].get('EmailId').value != null? itemGroupControl.controls[i].get('EmailId').value : null,
              IsModified: true,
              Saluation:null,
              Surname: null,
              UserID: userDetails.UserID,              
              Department: itemGroupControl.controls[i].get('Department').value != null? itemGroupControl.controls[i].get('Department').value : null,
            });
            
            //emailString += itemGroupControl.controls[i].get('EmailId').value + ","","
            count++;
          }
          console.log(SupplierContactPersons);
        }
      }
      if (count == 0) {
        this.showGridErrorMessage = true;
      }
      else {
        if (this.purchaseOrderEmailForm.valid) {
          //emailString = emailString.slice(0, -1);
          let displayInput: EmailSupplier = {
            SupplierContactPersonList: SupplierContactPersons,
             PurchaseOrderId:this.PurchaseOrderId,
             PurchaseOrderTypeId : this.PurchaseOrderTypeId,
             CompanyId: this.CompanyId,
             UserID: userDetails.UserID
          };

          this.sendEmail(displayInput);
          //this.sendEmail(emailString, this.PurchaseOrderId, this.PurchaseOrderTypeId, this.CompanyId);
        }
        else {
          let contactControl = <FormArray>this.purchaseOrderEmailForm.controls['SupplierContactDetails'];
          if (contactControl.controls.length > 0) {
            contactControl.controls.forEach(controlObj => {
              Object.keys(controlObj["controls"]).forEach((key: string) => {
                let contactControl = controlObj.get(key);
                if (contactControl.status == "INVALID" && contactControl.touched == false) {
                  contactControl.markAsTouched();
                }
              });
            });
          }
        }
      }
    }
    else {
      return;
    }
  }

  sendEmail(displayInput:EmailSupplier) {  
    // let result = <Observable<Array<any>>>this.pocreationObj.sendPurchaseOrderMailtoSupplierContactPerson(displayInput);
    let result = <Observable<any>>this.pocreationObj.sendPurchaseOrderMailtoSupplierContactPerson(displayInput);
    result.subscribe((data) => {
      if (data) {
        this.onStatusUpdate.emit({ PurchaseOrderId: displayInput.PurchaseOrderId, PurchaseOrderTypeId: displayInput.PurchaseOrderTypeId });
        //this.onStatusUpdate.emit({ PurchaseOrderId: this.PurchaseOrderId, PurchaseOrderTypeId: this.PurchaseOrderTypeId });
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.EmailResponse,
          MessageType: MessageTypes.Success
        });
      }
    });
  }

  HidePopUp() {
    this.showEmailPopUp = false;
  }

}
