import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpRequest, HttpHandler, HttpResponseBase, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    debugger;
    if (sessionStorage.getItem("access_token")) {    
      if (request.method === "GET") {
        const httpRequest = request.clone({
          headers: new HttpHeaders({
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Expires": "Sat, 01 Jan 2000 00:00:00 GMT",
            'Authorization': `Bearer` + sessionStorage.getItem("access_token")
          })
        });
        return next.handle(httpRequest);
      }
      else {
        request = request.clone({
          headers: new HttpHeaders({          
            'Authorization': `Bearer` + sessionStorage.getItem("access_token")
          })
        });
      }
      
      return next.handle(request);
    }
  }

  handleAuthError(error: HttpResponseBase): any {
    if (error.status == 401)//if not authorized
    {

    }
    console.log("handle error", error);
  }
}