import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TreeNode } from '../models/treenode';



@Injectable()
export class NodeService {

  constructor(private http: HttpClient) { }

  getFiles() {
    return this.http.get<any>('assets/showcase/data/files.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

  getLazyFiles() {
    return this.http.get<any>('assets/showcase/data/files-lazy.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

  getFilesystem() {
    return this.http.get<any>('assets/showcase/data/filesystem.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

  getLedsFilesystem() {
    return this.http.get<any>('assets/showcase/data/leadslist.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

  getLedadsByGroupFilesystem() {
    return this.http.get<any>('assets/showcase/data/leadsbygroup.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

  getLazyFilesystem() {
    return this.http.get<any>('assets/showcase/data/filesystem-lazy.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }
}