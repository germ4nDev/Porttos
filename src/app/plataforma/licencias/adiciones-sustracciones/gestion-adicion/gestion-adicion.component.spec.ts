import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAdicionComponent } from './gestion-adicion.component';

describe('GestionAdicionComponent', () => {
  let component: GestionAdicionComponent;
  let fixture: ComponentFixture<GestionAdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionAdicionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionAdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
