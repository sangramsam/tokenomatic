import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketAuthorizeTokenWanComponent } from './basket-authorize-token-wan.component';

describe('BasketAuthorizeTokenWanComponent', () => {
  let component: BasketAuthorizeTokenWanComponent;
  let fixture: ComponentFixture<BasketAuthorizeTokenWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketAuthorizeTokenWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketAuthorizeTokenWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
