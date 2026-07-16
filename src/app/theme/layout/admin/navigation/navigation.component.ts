import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GradientConfig } from 'src/app/app-config';
import { NavigationService } from '../../../shared/service/navigation.service';
import { CommonModule } from '@angular/common';
import { NavContentComponent } from './nav-content/nav-content.component';
import { Observable } from 'rxjs';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [CommonModule, NavContentComponent],
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
    // public props
    @Output() NavMobCollapse = new EventEmitter();
    navigationItems!: Observable<NavigationItem[]>;
    windowWidth: number;
    gradientConfig;

    constructor(private _navigationService: NavigationService) {
        this.gradientConfig = GradientConfig;
        this.windowWidth = window.innerWidth;
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.navigationItems = this._navigationService.menuItems$ || [];
        console.log('navigationItems full', this.navigationItems);
    }

    navMobCollapse() {
        if (this.windowWidth < 992) {
            this.NavMobCollapse.emit();
        }
    }
}
