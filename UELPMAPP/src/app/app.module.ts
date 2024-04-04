import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTypeaheadConfig } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppInterceptor } from "./http-interceptors/app-interceptor";
import { NgxSpinnerModule } from 'ngx-spinner';
import { CacheInterceptor } from './shared/services/cache-Interceptor';
import { CustomRequestOptions } from "./http-interceptors/request-options";
import { RequestOptions } from '@angular/http';
import {NgxScrollToFirstInvalidModule} from '@ismaestro/ngx-scroll-to-first-invalid';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { NgxCurrencyModule } from "ngx-currency";
import { AppCustomMaterialModuleModule } from './shared/app-custom-material-module/app-custom-material-module.module';
import { MatDialogModule } from '@angular/material';
import { TimeMaskDirective } from './crm/directives/time-mask.directive';
@NgModule({
  declarations: [
    AppComponent,
    ReleaseNotesComponent,
    TimeMaskDirective
            
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    HttpClientModule,   
    SharedModule,
    PerfectScrollbarModule,
    NoopAnimationsModule,
    MatSlideToggleModule,
    MatDialogModule,
    NgbModule.forRoot(),
    MalihuScrollbarModule.forRoot(),
    FontAwesomeModule,
    NgxSpinnerModule,
    NgxScrollToFirstInvalidModule,
    NgxCurrencyModule,
    AppCustomMaterialModuleModule,
    BrowserAnimationsModule
    ],
   exports: [
     MatSlideToggleModule,
     FontAwesomeModule,
     HttpClientModule
   ],
  providers: [
    NgbTypeaheadConfig,
    { provide: LocationStrategy, useClass: HashLocationStrategy},
    // { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
   { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }
  //  { provide: RequestOptions, useClass: CustomRequestOptions }
  ],
  
  bootstrap: [AppComponent]
})
export class AppModule { }
