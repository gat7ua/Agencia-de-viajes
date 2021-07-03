import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateTComponent } from './private-t.component';

describe('PrivateTComponent', () => {
  let component: PrivateTComponent;
  let fixture: ComponentFixture<PrivateTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
