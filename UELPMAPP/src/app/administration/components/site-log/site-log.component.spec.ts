import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteLogComponent } from './site-log.component';

describe('SiteLogComponent', () => {
  let component: SiteLogComponent;
  let fixture: ComponentFixture<SiteLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
