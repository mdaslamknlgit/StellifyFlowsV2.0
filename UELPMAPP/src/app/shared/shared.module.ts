import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
//import { ApiService } from './services/api.service'; 
import { AuditlogComponent } from '../shared/components/auditlog/auditlog.component';
import { FooterComponent } from './components/footer/footer.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from "./services/shared.service";
import { ConfirmationService } from 'primeng/components/common/api';
import { NegativeInParenthesisPipe } from './pipes/negative-in-parenthesis.pipe';
import { DisplayDateFormatPipe } from "./pipes/display-date-format.pipe";
import { ButtonDisplayPipe } from "./pipes/button-display.pipe";
import { RequestDateFormatPipe } from "./pipes/request-date-format.pipe";
import { AutofocusDirective } from './directives/focusdirective';
import { TextAreaContentDisplay } from "./pipes/textarea-content-display.pipe";
import { ApprovalButtonPipe } from "./pipes/approval-button-text.pipe";
import { AutoResize } from "./directives/textarea-autoresize.directive";
import { ShowMoreDirective } from "./directives/show-more.directive";
import { ProfileImageDirective } from "./directives/ProfileImageDirective";
import { CustomSpinnerDirective } from "./directives/custom-spinner.directive";
import { MenuRolePipe } from "./pipes/menu-role.pipe";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { VersionListComponent } from './components/version-list/version-list.component';
// import { ResponseComponent } from './components/response/response.component';

import { ClickOutsideModule } from 'ng4-click-outside';
import { EncodeURIComponentPipe } from './pipes/encode-uricomponent.pipe'
import { FocusRemoverDirective } from './directives/focus-remover.directive';
import { PaymentDetailsComponent } from './components/payment-details/payment-details.component';
import { DialogModule } from 'primeng/primeng';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { ApprovalRemarksComponent } from './components/approval-remarks/approval-remarks.component';
import { DocumentRemarksComponent } from './components/document-remarks/document-remarks.component';
import { AppCustomMaterialModuleModule } from './app-custom-material-module/app-custom-material-module.module';
import { StarRaterComponent } from './components/star-rater/star-rater.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  imports: [
    CommonModule,
    SharedRoutingModule,
    PerfectScrollbarModule,
    NgbModule,
    NgbTypeaheadModule,
    MalihuScrollbarModule,
    FontAwesomeModule,
    FormsModule,
    ClickOutsideModule,
    DialogModule,
    AppCustomMaterialModuleModule,
  ],
  exports: [
    CommonModule,
    PageNotFoundComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    StarRaterComponent,
    FontAwesomeModule,
    RequestDateFormatPipe,
    DisplayDateFormatPipe,
    MenuRolePipe,
    ButtonDisplayPipe,
    EncodeURIComponentPipe,
    AutofocusDirective,
    FocusRemoverDirective,
    TextAreaContentDisplay,
    AutoResize,
    ShowMoreDirective,
    ProfileImageDirective,
    CustomSpinnerDirective,
    NegativeInParenthesisPipe,
    ApprovalButtonPipe,
    // ResponseComponent,
    VersionListComponent,
    ClickOutsideModule,
    PaymentDetailsComponent,
    AuditlogComponent,
    AttachmentsComponent,
    ApprovalRemarksComponent,
    DocumentRemarksComponent
  ],
  declarations: [PageNotFoundComponent, HeaderComponent, SidebarComponent,StarRaterComponent, FooterComponent, RequestDateFormatPipe,
    ButtonDisplayPipe, ApprovalButtonPipe, DisplayDateFormatPipe, AutofocusDirective, FocusRemoverDirective, AutoResize, TextAreaContentDisplay,
    ShowMoreDirective, MenuRolePipe, 
    ProfileImageDirective, CustomSpinnerDirective, VersionListComponent, EncodeURIComponentPipe, NegativeInParenthesisPipe, PaymentDetailsComponent,AuditlogComponent, AttachmentsComponent, ApprovalRemarksComponent, DocumentRemarksComponent],
  entryComponents: [AuditlogComponent],
  providers: [
    SharedService,
    ConfirmationService,
    ButtonDisplayPipe,
    DisplayDateFormatPipe,
    RequestDateFormatPipe,
    MenuRolePipe,
    NegativeInParenthesisPipe,
    ApprovalButtonPipe,
    //HttpClientModule,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA]
})
export class SharedModule { }
