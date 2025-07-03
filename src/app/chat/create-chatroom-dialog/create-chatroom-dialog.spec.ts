import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChatroomDialog } from './create-chatroom-dialog';

describe('CreateChatroomDialog', () => {
  let component: CreateChatroomDialog;
  let fixture: ComponentFixture<CreateChatroomDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateChatroomDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateChatroomDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
