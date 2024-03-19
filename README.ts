<div class="row mt-2 mb-3 g-0 flex-nowrap" metricsDetectOverflow [reservedWidth]="100"
(overflowingElementIndex)="overflowingTabs($event)">
    @for(tag of tags; track $index; let isFirst = $first){
        <div class="col-auto me-1" [class.ms-1]="!isFirst"
        [class.d-none]="!packetsToRender.includes(tag)">
            <gs-button #button (click)="switchQuickFilterTags(tag, button)" size="sm" shape="circle" class="metrics-button" emphasis="subtle"
                [actionType]="tag === activeTag ? 'primary' : 'secondary'">
                {{ tag }}
            </gs-button>
        </div>
    }
    @if(overflowMenu.length){
        <div class="col-auto ms-1">
            <gs-dropdown size="sm" [menuVisible]="overflowDropdownVisible">
            <gs-button #overflowButton size="sm" shape="circle" size="sm" emphasis="subtle" class="metrics-button"
                [actionType]="overflowMenu.includes(activeTag) ? 'primary' : 'secondary'"
                (click)="toggleOverflowMenu()">More
                <gs-icon type="filled" role="img" size="md" [name]="overflowDropdownVisible ? 'expand-less' : 'expand-more'">
                </gs-icon></gs-button>
            <gs-dropdown-menu (change)="switchFilterViaMenu($event, overflowButton)" (blur)="blur($event)">
                @for (item of overflowMenu; track $index) {
                    <gs-menu-option [value]="item">
                    <div class="row g-0 m-0"><span class="col-auto">{{ item }}</span>
                        <gs-icon class="ms-auto col-auto gs-blue060-link" size="sm" type="outlined" name="check"
                        *ngIf="item === activeTag"></gs-icon>
                    </div>
                    </gs-menu-option>
                }
            </gs-dropdown-menu>
            </gs-dropdown>
        </div>
    }
</div>


import { ButtonComponent, ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule, MenuValueType } from '@gs-ux-uitoolkit-angular/dropdown';
import { GsAnalyticsService } from '@gsam-fi/common';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { MenuBlurEvent } from '@gs-ux-uitoolkit-angular/menu';

import { AnalyticsEvents } from '../../../analytics.events';
import { DetectOverflowModule } from '../../helpers/detect-overflow.module';
import { overflowingTabs } from '../../helpers/overflow-menu.helper';
import { shouldBlurElementBeVisible } from '../../helpers/gs-button.helper';

@Component({
  selector: 'metrics-overflow-buttons',
  standalone: true,
  imports: [CommonModule, ButtonModule, DropdownModule, IconModule, DetectOverflowModule],
  templateUrl: './overflow-buttons.component.html',
  styleUrl: './overflow-buttons.component.scss',
})
export class OverflowButtonsComponent {
  @Input() tags: string[] = [];
  activeTag: string = 'All';
  activeTreeParentKey: string | undefined = '';
  activeTreeKey = '';
  overflowMenu: string[] = [];
  packetsToRender: string[] = [];
  overflowDropdownVisible = false;

  @Output() readonly callFilterTreeInstance: EventEmitter<string> = new EventEmitter();

  @ViewChild('overflowButton', { read: ButtonComponent }) readonly dropdownButtonRef!: ButtonComponent;

  constructor(
    private readonly analytics: GsAnalyticsService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  overflowingTabs($event: number): void {
    const { overflowMenu, packetsToRender } = overflowingTabs($event, this.tags, this.packetsToRender, this.overflowMenu);
    this.overflowMenu = overflowMenu;
    this.packetsToRender = packetsToRender;
    this.cd.detectChanges();
  }

  switchQuickFilterTags(tag: string, button?: ButtonComponent): void {

    if (button) {
      button.blur();
    }
    
    this.callFilterTreeInstance.emit(tag);
  }

  toggleOverflowMenu(): void {
    this.overflowDropdownVisible = !this.overflowDropdownVisible;
    this.analytics.event(AnalyticsEvents.CLICK_QUICK_DESK_COLUMN_Filter_MORE_DROPDOWN, {});
    this.cd.detectChanges();
  }

  switchFilterViaMenu($event: MenuValueType, button: ButtonComponent): void {
    const tag = $event?.toString();

    if (!tag || !this.overflowMenu.includes(tag)) {
      return;
    }

    this.switchQuickFilterTags(tag, button);
    this.overflowDropdownVisible = false;
    button.blur();
    this.cd.detectChanges();
  }

  blur($event: MenuBlurEvent | FocusEvent): void {
    this.overflowDropdownVisible = shouldBlurElementBeVisible(this.overflowDropdownVisible, $event, this.dropdownButtonRef);
  }
}
