import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinChatroomDialog } from './join-chatroom-dialog';

describe('JoinChatroomDialog', () => {
  let component: JoinChatroomDialog;
  let fixture: ComponentFixture<JoinChatroomDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinChatroomDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinChatroomDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
