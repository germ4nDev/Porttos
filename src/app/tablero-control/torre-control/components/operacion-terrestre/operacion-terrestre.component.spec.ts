import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperacionTerrestreComponent } from './operacion-terrestre.component';

describe('OperacionTerrestreComponent', () => {
  let component: OperacionTerrestreComponent;
  let fixture: ComponentFixture<OperacionTerrestreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperacionTerrestreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OperacionTerrestreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
