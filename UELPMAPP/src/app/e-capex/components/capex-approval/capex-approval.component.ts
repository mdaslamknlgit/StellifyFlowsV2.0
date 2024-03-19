import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatSlideToggle } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-capex-approval',
  templateUrl: './capex-approval.component.html',
  styleUrls: ['./capex-approval.component.css']
})
export class CapexApprovalComponent implements OnInit {
  hidetext: boolean = true;
  hideinput: boolean = false;
  savedsucess: boolean = false;
  hidealert: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  capexForm: FormGroup;
  scrollbarOptions: any;
  @ViewChild('rightPanel') rightPanelRef;
  isEditMode: boolean = false;
  requestDate = new Date()
  
  capexDetails =
    [
      {
        SNo: '1',
        ItemName: 'Item Name 1',
        Description: 'First item',
        Quantity: '1',
        Price: '$50.00',
        Amount: '$50.00'
      },
      {
        SNo: '2',
        ItemName: 'Item Name 2',
        Description: 'Second item',
        Quantity: '1',
        Price: '$25.00',
        Amount: '$25.00'
      },
      {
        SNo: '3',
        ItemName: 'Item Name 3',
        Description: 'Third item',
        Quantity: '2',
        Price: '$100.00',
        Amount: '$200.00'
      },
    ]

  priceDetails =
    [
      {
        SNo: '1',
        VendorName: 'Vendor 1',
        Price: '$50.00'
      },
      {
        SNo: '2',
        VendorName: 'Vendor 2',
        Price: '$25.00'
      },
      {
        SNo: '3',
        VendorName: 'Vendor 3',
        Price: '$100.00'
      },
    ]

  requestTypes =
    [
      {
        RequestTypeId: '1',
        Name: 'Request 1'
      },
      {
        RequestTypeId: '2',
        Name: 'Request 2'
      },
      {
        RequestTypeId: '3',
        Name: 'Request 3'
      },
      {
        RequestTypeId: '4',
        Name: 'Request 4'
      }
    ]

  capexNatures =
    [
      {
        NatureId: '1',
        Name: 'Nature 1'
      },
      {
        NatureId: '2',
        Name: 'Nature 2'
      },
      {
        NatureId: '3',
        Name: 'Nature 3'
      },
      {
        NatureId: '4',
        Name: 'Nature 4'
      }
    ]

  capexPurposes =
    [
      {
        PurposeId: '1',
        Name: 'Purpose 1'
      },
      {
        PurposeId: '2',
        Name: 'Purpose 2'
      },
      {
        PurposeId: '3',
        Name: 'Purpose 3'
      },
      {
        PurposeId: '4',
        Name: 'Purpose 4'
      }
    ]

  constructor(public fb: FormBuilder) { }

  ngOnInit() {
    this.capexForm = new FormGroup({
      'CapexId': new FormControl(null, [Validators.required]),
      'CompanyName': new FormControl(null, [Validators.required]),
      'ApplicantName': new FormControl(null, [Validators.required]),
      'BudgetYear': new FormControl(null, [Validators.required]),
      'DepartmentName': new FormControl(null, [Validators.required]),
      'Designation': new FormControl(null, [Validators.required]),
      'RequestDate': new FormControl(null, [Validators.required]),
      'ApplicationStatus': new FormControl(null, [Validators.required]),
      'CapexUser': new FormControl(null, [Validators.required]),
      'RequestTypeId': new FormControl(null, [Validators.required]),
      'NatureId': new FormControl(null, [Validators.required]),
      'PurposeId': new FormControl(null, [Validators.required]),
      'PurchasedFixedAsset': new FormControl(null, [Validators.required]),
      'IsPurchaseForProject': new FormControl(null, [Validators.required]),
      'IsFinancialEvaluation': new FormControl(null, [Validators.required]),
      'Currency': new FormControl(null, [Validators.required]),
      'IsQuotationsSupported': new FormControl(null, [Validators.required]),
      'IsSelectionAttached': new FormControl(null, [Validators.required]),
      'AddionalWorkingCapital': new FormControl(null, [Validators.required]),
      'CapitalExpenditureJustification': new FormControl(null, [Validators.required]),
      'SourceOfFunding': new FormControl(null, [Validators.required]),
      'Remarks': new FormControl(null, [Validators.required]),
      'InspectionRemarks': new FormControl(null, [Validators.required]),
      'Attachments': new FormGroup({
        'achmentId': new FormControl(null, [Validators.required]),
        'AttachmentName': new FormControl(null, [Validators.required]),
      }),
    });
  }
  

  showFullScreen(){
    FullScreen(this.rightPanelRef.nativeElement);
  }

  addData() {
    this.hidetext = false;
    this.hideinput = true;
    this.savedsucess = false;
    this.isEditMode = false;
  }

  editData() {
    this.hidetext = false;
    this.hideinput = true;
    this.savedsucess = false;
    this.isEditMode = true;
  }

  veData() {
    this.savedsucess = true;
    this.hidetext = true;
    this.hideinput = false;
    this.isEditMode = false;
  }

  oseWindow() {
    this.savedsucess = false;
  }

  cancleData() {
    this.hidetext = true;
    this.hideinput = false;
    this.isEditMode = false;
  }

  closeWindow(): void {
    this.savedsucess = false;
  }
  split() {
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }

}
