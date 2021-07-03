import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTComponent } from './public-t.component';

describe('PublicTComponent', () => {
  let component: PublicTComponent;
  let fixture: ComponentFixture<PublicTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
