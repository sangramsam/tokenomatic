import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AionAuthorizeComponent } from './aion-authorize.component';

describe('AionAuthorizeComponent', () => {
  let component: AionAuthorizeComponent;
  let fixture: ComponentFixture<AionAuthorizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AionAuthorizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AionAuthorizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
