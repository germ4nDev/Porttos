import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { GradientConfig } from 'src/app/app-config';
import { NavigationService } from '../../../../shared/service/navigation.service';
import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Observable, Subscription } from 'rxjs';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { IaChatFlotanteComponent } from "src/app/theme/shared/components/ia-chat-flotante/ia-chat-flotante.component";

@Component({
    selector: 'app-nav-content',
    standalone: true,
    templateUrl: './nav-content.component.html',
    styleUrls: ['./nav-content.component.scss'],
    imports: [
        CommonModule,
        NavGroupComponent,
        NavCollapseComponent,
        NavItemComponent,
        NgScrollbarModule,
        IaChatFlotanteComponent
    ]
})
export class NavContentComponent implements OnInit, AfterViewInit {
    @Input() navigationItems: NavigationItem[] | null = [];
    @Output() NavMobCollapse = new EventEmitter();
    gradientConfig = GradientConfig;
    windowWidth = window.innerWidth;
    prevDisabled = 'disabled';
    nextDisabled = '';
    scrollWidth = 0;
    contentWidth = 0;
    currentApplicationVersion = 0;
    wrapperWidth!: number;
    public mostrarChat: boolean = true;
    menuItems$!: Observable<NavigationItem[]>;
    private menuSubscription: Subscription = new Subscription();

    @ViewChild('navbarContent', { static: false }) navbarContent!: ElementRef;
    @ViewChild('navbarWrapper', { static: false }) navbarWrapper!: ElementRef;

    constructor(
        private _navigationService: NavigationService,
        private location: Location,
        private locationStrategy: LocationStrategy,
        private zone: NgZone
    ) { }

    ngOnInit(): void {
        // console.log('1');

        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        // this.menuSubscription = this.menuItems$.subscribe(items => {
        //     // console.log('Todos los items del menu', items);
        //   if (items && items.length > 0) {
        //     // console.log('Primer elemento del menú (Suite/Group):', items);
        //   }
        // });
        if (this.windowWidth < 992) {
            GradientConfig.layout = 'vertical';
            setTimeout(() => {
                document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
                (document.querySelector('#nav-ps-gradient-able') as HTMLElement).style.maxHeight = '100%';
            }, 500);
        }
    }

    ngAfterViewInit(): void {
        if (GradientConfig.layout === 'horizontal') {
            this.contentWidth = this.navbarContent.nativeElement.clientWidth;
            this.wrapperWidth = this.navbarWrapper.nativeElement.clientWidth;
        }
    }

    scrollPlus(): void {
        this.scrollWidth += this.wrapperWidth - 80;
        if (this.scrollWidth > this.contentWidth - this.wrapperWidth) {
            this.scrollWidth = this.contentWidth - this.wrapperWidth + 80;
            this.nextDisabled = 'disabled';
        }
        this.prevDisabled = '';

        const sideNav = document.querySelector('#side-nav-horizontal') as HTMLElement;
        if (GradientConfig.isRtlLayout) {
            sideNav.style.marginRight = '-' + this.scrollWidth + 'px';
        } else {
            sideNav.style.marginLeft = '-' + this.scrollWidth + 'px';
        }
    }

    scrollMinus(): void {
        this.scrollWidth -= this.wrapperWidth;
        if (this.scrollWidth < 0) {
            this.scrollWidth = 0;
            this.prevDisabled = 'disabled';
        }
        this.nextDisabled = '';

        const sideNav = document.querySelector('#side-nav-horizontal') as HTMLElement;
        if (GradientConfig.isRtlLayout) {
            sideNav.style.marginRight = '-' + this.scrollWidth + 'px';
        } else {
            sideNav.style.marginLeft = '-' + this.scrollWidth + 'px';
        }
    }

    fireLeave(): void {
        const sections = document.querySelectorAll('.pcoded-hasmenu');
        sections.forEach((el) => el.classList.remove('active', 'pcoded-trigger'));

        let current_url = this.location.path();
        const baseHref = this.locationStrategy.getBaseHref();
        if (baseHref) {
            current_url = baseHref + current_url;
        }
        const link = "a.nav-link[href='" + current_url + "']";
        const ele = document.querySelector(link);
        if (ele) {
            const parent = ele.parentElement;
            const up_parent = parent?.parentElement?.parentElement;
            const last_parent = up_parent?.parentElement;

            if (parent?.classList.contains('pcoded-hasmenu')) {
                parent.classList.add('active');
            } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
                up_parent.classList.add('active');
            } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
                last_parent.classList.add('active');
            }
        }
    }

    navMob(): void {
        if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
            this.NavMobCollapse.emit();
        }
    }

    fireOutClick(): void {
        this.fireLeave();
    }
}
