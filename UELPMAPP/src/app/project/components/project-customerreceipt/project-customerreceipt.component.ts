import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Messages } from '../../../shared/models/shared.model';

@Component({
  selector: 'app-project-customerreceipt',
  templateUrl: './project-customerreceipt.component.html',
  styleUrls: ['./project-customerreceipt.component.css']
})
export class ProjectCustomerreceiptComponent implements OnInit {

  customerReceiptInForm: FormGroup;
  hidetext: boolean = false;
  customerInvoices: any[];
  totalRecords: number = 0;
  gridColumns: Array<{ field: string, header: string }> = [];
  selectedCustomer: CustomerReceipt
  scrollbarOptions: any;
  loading: boolean = false;
  rightsection:boolean=false;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
  constructor(public fb: FormBuilder) {
    this.selectedCustomer = new CustomerReceipt();
  }

  CustomerReceipts =
    [
      {
        CustomerID: 1,
        CustomerName: 'Customer 1',
        CustomerEmail: 'customer1@test.com',
        PaymentAmount: '10000'
      },
      {
        CustomerID: 2,
        CustomerName: 'Customer 2',
        CustomerEmail: 'customer2@test.com',
        PaymentAmount: '40000'
      },
      {
        CustomerID: 3,
        CustomerName: 'Customer 3',
        CustomerEmail: 'customer3@test.com',
        PaymentAmount: '25000'
      },
      {
        CustomerID: 4,
        CustomerName: 'Customer 4',
        CustomerEmail: 'customer4@test.com',
        PaymentAmount: '50000'
      },
    ]

  ngOnInit() {
    this.loading = true;
    this.customerReceiptInForm = new FormGroup({
      'CustomerID': new FormControl(null),
      'CustomerEmail': new FormControl(null, [Validators.required]),
      'PaymentAmount': new FormControl(null, [Validators.required]),
      'InvoiceDetails': this.fb.array([
      ]),
    });

    let invoiceDetails = this.customerReceiptInForm.get('InvoiceDetails') as FormArray;
    invoiceDetails.controls = [];

    this.gridColumns = [
      { field: 'InvoiceDate', header: 'Invoice Date' },
      { field: 'InvoiceNo', header: 'Invoice No' },
      { field: 'InvoiceAmount', header: 'Invoice Amount' },
      { field: 'OutStandingAmount', header: 'OutStanding Amount' },
      { field: 'PaymentAmount', header: 'Payment Amount' }
    ];

    this.customerInvoices = [
      { IsPayable: true, InvoiceDate: '2018/08/01', InvoiceNo: 'Inv-111', InvoiceAmount: '10,000.00', OutStandingAmount: '10000.00', PaymentAmount: '2000.00' },
      { IsPayable: true, InvoiceDate: '2018/08/05', InvoiceNo: 'Inv-222', InvoiceAmount: '20,000.00', OutStandingAmount: '10000.00', PaymentAmount: '5000.00' },
      { IsPayable: false, InvoiceDate: '2018/08/15', InvoiceNo: 'Inv-333', InvoiceAmount: '5,000.00', OutStandingAmount: '1000.00', PaymentAmount: '' },
      { IsPayable: false, InvoiceDate: '2018/08/25', InvoiceNo: 'Inv-444', InvoiceAmount: '4,000.00', OutStandingAmount: '2000.00', PaymentAmount: '' },
      { IsPayable: true, InvoiceDate: '2018/08/31', InvoiceNo: 'Inv-555', InvoiceAmount: '25,000.00', OutStandingAmount: '15000.00', PaymentAmount: '5000.00' },
      { IsPayable: false, InvoiceDate: '2018/09/01', InvoiceNo: 'Inv-666', InvoiceAmount: '30,000.00', OutStandingAmount: '30000.00', PaymentAmount: '' },
      { IsPayable: false, InvoiceDate: '2018/09/05', InvoiceNo: 'Inv-777', InvoiceAmount: '80,000.00', OutStandingAmount: '20000.00', PaymentAmount: '' },
      { IsPayable: false, InvoiceDate: '2018/09/01', InvoiceNo: 'Inv-888', InvoiceAmount: '30,000.00', OutStandingAmount: '30000.00', PaymentAmount: '' },
      { IsPayable: true, InvoiceDate: '2018/08/05', InvoiceNo: 'Inv-999', InvoiceAmount: '40,000.00', OutStandingAmount: '10000.00', PaymentAmount: '2500.00' },


    ];

    invoiceDetails.patchValue(this.customerInvoices);

    this.totalRecords = this.customerInvoices.length;

    this.loading = false;
  }

  cancleData() {
    this.hidetext = false;
    this.customerReceiptInForm.get('CustomerID').setValue("");
  }

  onChange(event) {   
    this.selectedCustomer = this.CustomerReceipts.filter(x => x.CustomerID === Number(event.target.value))[0];
    this.hidetext = true;
    this.customerReceiptInForm.patchValue(this.selectedCustomer);
  }

}

export class CustomerReceipt {
  CustomerID: number
  CustomerName: string
  CustomerEmail: string
  PaymentAmount: string
}
