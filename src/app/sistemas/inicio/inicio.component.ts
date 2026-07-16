import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit, OnDestroy {

    constructor() {}

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }
}
