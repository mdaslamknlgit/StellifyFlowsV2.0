import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from "primeng/treetable";
import { TreeNode } from "primeng/api";
import { NodeService } from '../../services/node-service';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-treetable',
  templateUrl: './treetable.component.html',
  styleUrls: ['./treetable.component.css']
})
export class TreetableComponent implements OnInit {
  tableData: TreeNode[] = [];
  cols: any[] = [];
  loading: boolean;
  files1: TreeNode[];
  constructor(
    private nodeService: NodeService,
  ) { }

  ngOnInit() {
    //this.loadAll();

    this.nodeService.getLedadsByGroupFilesystem().then((res) => {
      // Success
      //console.log(res.json());
      //resolve();
      //
      
      //debugger;
      
      this.files1 = res;
    });
  }

  // loadAll() {
  //   this.service
  //     .findProducts()
  //     .subscribe(
  //       (res: HttpResponse<Product[]>) => {
  //         this.products = res.body;
  //       },
  //       (res: HttpErrorResponse) => {
  //         console.log(res);
  //       }
  //     );
  // }

  onNodeExpand(event) {
    const node = event.node;
    debugger;
    // this.service.findChildProducts(node.cola).subscribe(
    //     (res: HttpResponse<Product[]>) => {
    //       const childs: Product[] = res.body;
    //       for (let i = 0; i < products.length; i++) {
    //         childs[i].expanded = false;
    //       }
    //       node.children = childs;
    //     },
    //     (res: HttpErrorResponse) => {
    //       console.log(res);
    //     }
    //   );
  }

}



export interface Product {
  cola?: string;
  colb?: string;
  colc?: string;
  cold?: string;
  
  // tree table fields
      label?: string;
      data?: any;
      icon?: any;
      expandedIcon?: any;
      collapsedIcon?: any;
      children?: Product[];
      leaf?: boolean;
      expanded?: boolean;
      type?: string;
      partialSelected?: boolean;
      styleClass?: string;
      draggable?: boolean;
      droppable?: boolean;
      selectable?: boolean;
  }