import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatroom } from './chatroom';

describe('Chatroom', () => {
  let component: Chatroom;
  let fixture: ComponentFixture<Chatroom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatroom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chatroom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
