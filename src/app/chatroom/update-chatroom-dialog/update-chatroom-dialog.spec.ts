import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateChatroomDialog } from './update-chatroom-dialog';

describe('UpdateChatroomDialog', () => {
  let component: UpdateChatroomDialog;
  let fixture: ComponentFixture<UpdateChatroomDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateChatroomDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateChatroomDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
