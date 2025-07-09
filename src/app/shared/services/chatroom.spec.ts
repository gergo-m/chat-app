import { TestBed } from '@angular/core/testing';

import { Chatroom } from './chatroom';

describe('Chatroom', () => {
  let service: Chatroom;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Chatroom);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
