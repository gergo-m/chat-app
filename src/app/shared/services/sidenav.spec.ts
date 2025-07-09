import { TestBed } from '@angular/core/testing';

import { Sidenav } from './sidenav';

describe('Sidenav', () => {
  let service: Sidenav;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sidenav);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
