import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatlistSidenav } from './chatlist-sidenav';

describe('ChatlistSidenav', () => {
  let component: ChatlistSidenav;
  let fixture: ComponentFixture<ChatlistSidenav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatlistSidenav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatlistSidenav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
