import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponseBase, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { HttpResponse } from 'selenium-webdriver/http';
import { NgxSpinnerService } from 'ngx-spinner';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  count = 0;
  constructor(private spinner: NgxSpinnerService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //debugger;
    if (sessionStorage.getItem("access_token")) {
      //debugger;
     // reqHeaders = reqHeaders.append('StellifyAuthToken', `${token}`);
     request.headers.append('StellifyAuthToken', `${sessionStorage.getItem("access_token")}`);
      // request = request.clone({
      //   setHeaders: {
      //     'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      //     'Pragma': 'no-cache',
      //     'Expires': '0',
      //     'If-Modified-Since': '0',
      //     'Access-Control-Allow-Origin':'*',
      //     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      //     'Authorization': `Bearer ` + sessionStorage.getItem("access_token")
      //   }
      // });
      next.handle(request);

    }
    else

    {
      //debugger;
      //reqHeaders.append('StellifyAuthToken', `${token}`);
      //request.headers.append('StellifyAuthToken','a');
      //next.handle(request);
      // request = request.clone({
      //   setHeaders: {
      //     'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      //     'Pragma': 'no-cache',
      //     'Expires': '0',
      //     'If-Modified-Since': '0',
      //     'Access-Control-Allow-Origin':'*',
      //     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      //   }
      // });
      next.handle(request);
    }
    if (request.url.toLowerCase().indexOf('notifications') == -1) 
    {
      this.spinner.show();
      this.count++;
      return next.handle(request).pipe(tap(
        event => {
           //console.log(event)
        },
        error => {
           //console.log(error)
        }
      ), finalize(() => {
        this.count--;
        if (this.count == 0) this.spinner.hide();
      })
      );
    }
    else {   //for related to notifications
      console.log(request);
      return next.handle(request);
    }

    /**
     * continues request execution
     */
    // return next.handle(request).pipe(catchError((error, caught) => {
    //     //intercept the respons error and displace it to the console
    //     console.log(error);
    //     this.handleAuthError(error);
    //     return of(error);
    // }) as any);
    // return next.handle(request);
  }
  handleAuthError(error: HttpResponseBase): any {
    if (error.status == 401)//if not authorized
    {

    }
    console.log("handle error", error);
  }
}