import { Injectable } from '@angular/core';
import { BaseRequestOptions, Headers } from '@angular/http';

@Injectable()
export class CustomRequestOptions extends BaseRequestOptions {
    headers = new Headers({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    });
}