import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPurchaseOrderPopupComponent } from './email-purchase-order-popup.component';

describe('EmailPurchaseOrderPopupComponent', () => {
  let component: EmailPurchaseOrderPopupComponent;
  let fixture: ComponentFixture<EmailPurchaseOrderPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailPurchaseOrderPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailPurchaseOrderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
