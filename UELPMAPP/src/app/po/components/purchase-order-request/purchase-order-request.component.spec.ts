import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderRequestComponent } from './purchase-order-request.component';

describe('PurchaseOrderRequestComponent', () => {
  let component: PurchaseOrderRequestComponent;
  let fixture: ComponentFixture<PurchaseOrderRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
