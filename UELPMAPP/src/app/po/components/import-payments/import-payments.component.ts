import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDetails, Messages, MessageTypes } from '../../../shared/models/shared.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/Payment.model';
import { ConfirmationService } from 'primeng/primeng';
import { PaymentImportColumns } from '../../models/project-payment-history.model';
import { ControlValidator } from '../../../shared/classes/control-validator';

@Component({
  selector: 'app-import-payments',
  templateUrl: './import-payments.component.html',
  styleUrls: ['./import-payments.component.css']
})
export class ImportPaymentsComponent implements OnInit {
  userDetails: UserDetails;
  public screenWidth: any;
  paymentformArray = new FormArray([]);
  paymentformGroup = new FormGroup({});
  importPaymentColumns: Array<{ field: string, header: string }> = [];
  disableConfirm: boolean = true;
  constructor(
    private fb: FormBuilder,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService,
    private paymentService: PaymentService,
    private confirmationServiceObj: ConfirmationService) {
    this.userDetails = <UserDetails>this.sessionService.getUser()
    this.paymentformGroup = new FormGroup({
      Payments: this.paymentformArray
    });
  }

  ngOnInit() {
    this.importPaymentColumns = PaymentImportColumns.filter(item => item);
    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-150;
      }
  }
  uploadFile(event) 
  {
    this.onCancel();
    if (event.target.files.length == 0) {
      return
    }
    let file: File = event.target.files[0];
    if (file.type.toLowerCase() == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.paymentService.uploadPayments(file).subscribe((data: Payment[]) => {
        this.disableConfirm = data.filter((obj) => obj.Status == false).length == 0 ? false : true;
        if (data.length == 0) {
          this.disableConfirm = true;
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.PaymentExcelIncorrect,
            MessageType: MessageTypes.Error
          });
        }
        let itemGroupControl = new FormArray([]);
        itemGroupControl = <FormArray>this.paymentformGroup.controls['Payments'];
        data.forEach((element: Payment) => {
          itemGroupControl.push(this.Add(element));
        });
      });
    }
    else {
      this.sharedServiceObj.showMessage({
        ShowMessage: true,
        Message: Messages.AssetSubcategoryAcceptExcel,
        MessageType: MessageTypes.Error
      });
    }
  }
  onConfirm() {
    if (this.paymentformGroup.valid) {
      this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header: Messages.DeletePopupHeader,
        accept: () => {
          this.paymentService.SavePayments(this.paymentformArray.value, this.userDetails.UserID).subscribe((data) => {
            if (data) {
              this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: Messages.PaymentUpdated,
                MessageType: MessageTypes.Success
              });
              this.onCancel();
            }
          });
        },
        reject: () => {
        }
      });
    }
    else {
      (<FormArray>this.paymentformGroup.controls['Payments']).controls.forEach(item => {
        item.get('Remarks').markAsTouched();
      });
    }
  }
  onCancel() {
    this.paymentformArray.controls = [];
    this.paymentformGroup.reset();
    this.disableConfirm = true;
  }
  Add(payment: Payment) {
    return (this.fb.group({
      'ProcessId': payment.ProcessId,
      'CompanyId': payment.CompanyId,
      'SupplierId': payment.SupplierId,
      'DocumentId': payment.DocumentId,
      'SupplierInvoiceRefNo': new FormControl(payment.SupplierInvoiceRefNo),
      'InvoiceDate': new FormControl(payment.InvoiceDate),
      'ChequeNo': new FormControl(payment.ChequeNo),
      'ChequeDate': new FormControl(payment.ChequeDate),
      'VendorId': new FormControl(payment.VendorId),
      'SupplierName': new FormControl(payment.SupplierName),
      'PaymentAmount': new FormControl(payment.PaymentAmount),
      'DocumentNo': new FormControl(payment.DocumentNo),
      'Status': new FormControl(payment.Status),
      'StatusText':new FormControl(payment.StatusText),
      'Remarks': new FormControl(payment.Remarks, payment.IsOverPayment ? [Validators.required, ControlValidator.Validator] : null),
      "IsOverPayment": new FormControl(payment.IsOverPayment),
    }));
  }
}