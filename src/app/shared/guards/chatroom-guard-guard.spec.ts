import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { chatroomGuardGuard } from './chatroom-guard-guard';

describe('chatroomGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => chatroomGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
