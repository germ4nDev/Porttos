import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLicenciaAfiliadoComponent } from './gestion-licencia-afiliado.component';

describe('GestionLicenciaAfiliadoComponent', () => {
  let component: GestionLicenciaAfiliadoComponent;
  let fixture: ComponentFixture<GestionLicenciaAfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionLicenciaAfiliadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionLicenciaAfiliadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
