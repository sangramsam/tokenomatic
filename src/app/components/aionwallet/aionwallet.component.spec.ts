import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AionwalletComponent } from './aionwallet.component';

describe('AionwalletComponent', () => {
  let component: AionwalletComponent;
  let fixture: ComponentFixture<AionwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AionwalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AionwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
