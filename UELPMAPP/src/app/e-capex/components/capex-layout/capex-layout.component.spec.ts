import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapexLayoutComponent } from './capex-layout.component';

describe('CapexLayoutComponent', () => {
  let component: CapexLayoutComponent;
  let fixture: ComponentFixture<CapexLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapexLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapexLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
