import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss'
})
export class AdministracionComponent implements OnInit, OnDestroy {

    constructor() {}

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }
}
