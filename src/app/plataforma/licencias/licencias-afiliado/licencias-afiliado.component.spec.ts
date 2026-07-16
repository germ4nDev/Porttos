import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciasAfiliadoComponent } from './licencias-afiliado.component';

describe('LicenciasAfiliadoComponent', () => {
  let component: LicenciasAfiliadoComponent;
  let fixture: ComponentFixture<LicenciasAfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenciasAfiliadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LicenciasAfiliadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
