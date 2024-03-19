import {Directive, OnInit, Input} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Directive({
  selector: '[profile-image]',
  host: {
    '[src]': 'sanitizedImageData'
  }
})
export class ProfileImageDirective implements OnInit {
  imageData: any;
  sanitizedImageData: any;
  @Input('profile-image') profileId: number;
  itemsEndpoint : string = `${environment.apiEndpoint}`;
  constructor(private http: HttpClient,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {        
    this.http.get(`${this.itemsEndpoint}/ProfileImage/` + this.profileId)
      .map(image =>{ 
        
       if(image!=null){
        return image.toString()
       } })
      .subscribe(
        data => {
          if(data==null)
          {
            this.sanitizedImageData ="../assets/images/profile.png";
          }
          else
          {
            this.imageData = 'data:image/png;base64,' + data;
            this.sanitizedImageData = this.sanitizer.bypassSecurityTrustUrl(this.imageData);
          }
        }
      );
  }
}