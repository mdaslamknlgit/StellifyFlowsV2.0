import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplierServicesComponent } from './supplier-services.component';

describe('SupplierservicesComponent', () => {
  let component: SupplierServicesComponent;
  let fixture: ComponentFixture<SupplierServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
