import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule as PrimeNgSharedModule } from "primeng/shared";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { MatAutocompleteModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule } from '@angular/material';
import { AutoCompleteModule, CheckboxModule, ConfirmDialogModule, DialogModule, MultiSelectModule } from 'primeng/primeng';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxScrollToFirstInvalidModule } from '@ismaestro/ngx-scroll-to-first-invalid';
import { NgxCurrencyModule } from 'ngx-currency';
import { SharedModule } from '../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    NgbModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    SharedModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    AutoCompleteModule,
    MultiSelectModule,
    CheckboxModule,
    PrimeNgSharedModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxScrollToFirstInvalidModule,
    NgxCurrencyModule,
    NgSelectModule
  ],
  exports: [
    TableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    NgbModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    SharedModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    AutoCompleteModule,
    MultiSelectModule,
    CheckboxModule,
    PrimeNgSharedModule,
    NgMultiSelectDropDownModule,
    NgxScrollToFirstInvalidModule,
    NgxCurrencyModule,
    NgSelectModule
  ],
  declarations: []
})
export class IpsLibrariesModule { }
