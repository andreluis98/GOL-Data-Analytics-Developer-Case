import { TestBed } from '@angular/core/testing';

import { IataCodesService } from './iata-codes.service';

describe('IataCodesService', () => {
  let service: IataCodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IataCodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
