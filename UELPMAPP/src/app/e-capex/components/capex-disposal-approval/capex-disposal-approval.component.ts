import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatSlideToggle } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { FullScreen } from '../../../shared/shared';
@Component({
  selector: 'app-capex-disposal-approval',
  templateUrl: './capex-disposal-approval.component.html',
  styleUrls: ['./capex-disposal-approval.component.css']
})
export class CapexDisposalApprovalComponent implements OnInit {
  hidetext: boolean = true;
  hideinput: boolean = false;
  savedsucess: boolean = false;
  hidealert: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  capexForm: FormGroup;
  scrollbarOptions: any;
  isEditMode: boolean = false;
  @ViewChild('rightPanel') rightPanelRef;
  requestDate = new Date()
  jobsheetDate = new Date()
  equipmentDetails =
    [
      {
        SNo: '1',
        SerialNo: '#S12345',
        Description: 'Description 1',
        TagNo: '#12313131313',
        purchaseDate: '28-Aug-2018',
        GrossBookValue: '$50.00',
        Depreciation: '$500.00',
        NetBookValue: '$100.00',
      },
      {
        SNo: '2',
        SerialNo: '#S66456',
        Description: 'Description 2',
        TagNo: '#12313131313',
        purchaseDate: '30-Aug-2018',
        GrossBookValue: '$50.00',
        Depreciation: '$500.00',
        NetBookValue: '$100.00',
      },
      {
        SNo: '3',
        SerialNo: '#S345555',
        Description: 'Description 3',
        TagNo: '#12313131313',
        purchaseDate: '20-Aug-2018',
        GrossBookValue: '$50.00',
        Depreciation: '$500.00',
        NetBookValue: '$100.00',
      },
    ]

  authorizations =
    [
      {
        Id: '1',
        Name: 'Authorization 1'
      },
      {
        Id: '2',
        Name: 'Authorization 2'
      },
      {
        Id: '3',
        Name: 'Authorization 3'
      },
      {
        Id: '4',
        Name: 'Authorization 4'
      },
    ]

  disposalMethods =
    [
      {
        Id: '1',
        Name: 'Scrap'
      },
      {
        Id: '2',
        Name: 'Computer recycle scheme'
      },
      {
        Id: '3',
        Name: 'Tender/sold'
      },
    ]

  jobsheetReferences = [
    {
      Id: '1',
      Value: 'Job123'
    },
    {
      Id: '2',
      Value: 'Job1234'
    },
    {
      Id: '3',
      Value: 'Job12345'
    },

  ]

  assetCategories =
    [
      {
        Id: '1',
        Name: 'Inventory'
      },
      {
        Id: '2',
        Name: 'Investments'
      },
      {
        Id: '3',
        Name: 'Land'
      },
      {
        Id: '4',
        Name: 'Buildings'
      },
      {
        Id: '5',
        Name: 'Furniture'
      },
    ]

  items = [
    {
      Id: '1',
      Value: '1'
    },
    {
      Id: '2',
      Value: '2'
    },
    {
      Id: '3',
      Value: '3'
    },
    {
      Id: '4',
      Value: '4'
    },
    {
      Id: '5',
      Value: '4'
    }
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
      'DisposalRefNo': new FormControl(null, [Validators.required]),
      'CompanyName': new FormControl(null, [Validators.required]),
      'ApplicantName': new FormControl(null, [Validators.required]),
      'Date': new FormControl(null, [Validators.required]),
      'DepartmentName': new FormControl(null, [Validators.required]),
      'Designation': new FormControl(null, [Validators.required]),
      'Status': new FormControl(null, [Validators.required]),
      'DisposalUserId': new FormControl(null, [Validators.required]),
      'ItemTypeId': new FormControl(null, [Validators.required]),
      'AssetTypeId': new FormControl(null, [Validators.required]),
      'AuthorizationForId': new FormControl(null, [Validators.required]),
      'DisposalMethodTypeId': new FormControl(null, [Validators.required]),
      'AssetCategoryId': new FormControl(null, [Validators.required]),
      'DisposalReason': new FormControl(null, [Validators.required]),
      'JobsheetReferenceNumber': new FormControl(null, [Validators.required]),
      'JobsheetDate': new FormControl(null, [Validators.required]),
      'NoOfItemsDisposed': new FormControl(null, [Validators.required]),
      'GrossValue': new FormControl(null, [Validators.required]),
      'Remarks': new FormControl(null, [Validators.required]),
      'ApprovalRemarks': new FormControl(null, [Validators.required]),
      'InspectionRemarks': new FormControl(null, [Validators.required]),
      'Attachments': new FormGroup({
        'achmentId': new FormControl(null, [Validators.required]),
        'AttachmentName': new FormControl(null, [Validators.required]),
      }),
    });
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

  showFullScreen(){
    FullScreen(this.rightPanelRef.nativeElement);
  }
}
