import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-supplier-reject-popup',
  templateUrl: './supplier-reject-popup.component.html',
  styleUrls: ['./supplier-reject-popup.component.css']
})
export class SupplierRejectPopupComponent implements OnInit {
  @Input() showVoidPopUp: boolean = false;
  @Output() hideVoidPopUp: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() rejectInvoice: EventEmitter<string> = new EventEmitter<string>();
  rejectForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.rejectForm = this.fb.group({
      Reasons: ["", [Validators.required]]
    });
  }

  ngOnInit() {
  }
  rejectRecord() {
    if (this.rejectForm.valid) {
      this.rejectInvoice.emit(this.rejectForm.get('Reasons').value);
    }
  }
  onPopUpHide() {
    this.hideVoidPopUp.emit(true);
  }
}
