import { TestBed, inject } from '@angular/core/testing';

import { SchedulerNoService } from './scheduler-no.service';

describe('SchedulerNoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchedulerNoService]
    });
  });

  it('should be created', inject([SchedulerNoService], (service: SchedulerNoService) => {
    expect(service).toBeTruthy();
  }));
});
