import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketNewWanComponent } from './basket-new-wan.component';

describe('BasketNewWanComponent', () => {
  let component: BasketNewWanComponent;
  let fixture: ComponentFixture<BasketNewWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketNewWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketNewWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
