import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { clone, differenceBy, flatten, map, remove } from 'lodash-es';
import { colors } from '@gs-ux-uitoolkit-common/design-system';
import { Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import { darkTheme, ThemeService } from '@gs-ux-uitoolkit-angular/theme';
import { MenuBlurEvent } from '@gs-ux-uitoolkit-angular/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FIConstants, GsAnalyticsService, trackByField } from '@gsam-fi/common';
import { FiPixels } from '@gsam-fi/common/design-system';

import { AnalyticsEvents, AnalyticsProperties } from '../analytics.events';

const overrideStyleSheet = new StyleSheet('dropdown-button-override', {
  menu: { marginTop: `${FiPixels.TWO} !important`, maxHeight: '300px !important', maxWidth: '600px !important' },
  menuContainer: { maxHeight: '300px !important', maxWidth: '600px !important', overflow: 'hidden' },
  label: { marginRight: FiPixels.SIX, color: colors.gray040 },
});

export interface GroupByOption {
  label: string;
  value: string;
}

@Component({
  selector: 'gsam-fi-grid-controls-group-by',
  templateUrl: './group-by.component.html',
  styleUrls: ['./group-by.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GroupByComponent),
      multi: true,
    },
  ],
})
export class GroupByComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() label = 'Group by';
  @Input() options!: GroupByOption[];
  @Input() maximumSelected!: number;
  @Input() placeholder = 'None';
  @Input() selectedOptions: GroupByOption[] = [];
  @Input() showLabel = true;
  @Input() showSelectedValuesInButton = true;
  @Output() readonly optionsChanged: EventEmitter<GroupByOption[]> = new EventEmitter();
  @ViewChild('menuToggleButton', { read: ElementRef }) readonly menuToggleButtonRef!: ElementRef | undefined;
  searchValue = '';
  activeZone = '';
  availableOptions!: GroupByOption[];
  filteredOptions!: GroupByOption[];
  draggingIndex!: number | undefined;
  initialMenuValue: string[] = [];
  isDarkMode!: boolean;
  overrideClasses!: CssClasses<typeof overrideStyleSheet>;
  previewClass = '';
  trackByValue = trackByField('value');
  visible = false;
  private destroy$: Subject<boolean> = new Subject();
  private _propagateChange!: (items: GroupByOption[]) => void; // this function gets updated by registerOnChange of ControlValueAccessor
  private _propagateTouch!: () => void; // this function gets updated by registerOnTouched of ControlValueAccessor

  constructor(
    private readonly analytics: GsAnalyticsService,
    private readonly themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);

    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
      this.isDarkMode = theme === darkTheme;
      this.previewClass = this.isDarkMode ? 'group-by--dark-mode' : '';
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedOptions) {
      setTimeout(() => this.checkSelectedOptions(this.selectedOptions));
    }
  }

  ngOnDestroy(): void {
    overrideStyleSheet.unmount(this);
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onBlur($event: MenuBlurEvent | FocusEvent): void {
    if (this.isFocusEvent($event)) {
      return;
    }

    // When blurring from GS Menu it fires the event on the underlying element (and we can't prevent propagation as not exposed via MenuBlurEvent)
    // so we check to see if the next element would be the toggle button itself, and if so we don't change visibility as onToggle() will immediately
    // fire causing the menu to always be visible with no escape
    if ($event.nextActiveElement !== this.menuToggleButtonRef?.nativeElement.firstChild) {
      this.visible = false;
    }

    this.optionsChanged.emit(this.selectedOptions);
  }

  removeOption(option: GroupByOption): void {
    const selectedOptions = clone(this.selectedOptions);
    remove(selectedOptions, { value: option.value });
    this.checkSelectedOptions(selectedOptions);
    this.analytics.event(AnalyticsEvents.REMOVE_GROUPING_OPTION, { [AnalyticsProperties.GROUP_OPTION]: option.value });
  }

  selectOption({ item, currentIndex, container, previousContainer }: CdkDragDrop<GroupByOption[], GroupByOption, GroupByOption>): void {
    const selectedOptions = clone(this.selectedOptions);
    if (container.id !== previousContainer.id) {
      selectedOptions.splice(currentIndex, 0, item.data);
      this.analytics.event(AnalyticsEvents.SELECT_GROUPING_OPTION, { [AnalyticsProperties.GROUP_OPTION]: item.data.value });
    } else {
      remove(selectedOptions, { value: item.data.value });
      selectedOptions.splice(currentIndex, 0, item.data);
      this.analytics.event(AnalyticsEvents.REORDER_GROUPING_OPTIONS, {
        [AnalyticsProperties.GROUP_OPTION]: item.data.value,
        [AnalyticsProperties.POSITION]: currentIndex + 1,
      });
    }

    this.checkSelectedOptions(selectedOptions);
  }

  onToggle(): void {
    this.visible = !this.visible;
  }

  /**
   * this is implementation of ControlValueAccessor to support angular forms ngModel
   * @param fn Function to be called on value change
   */
  registerOnChange(fn: (items: GroupByOption[]) => void): void {
    this._propagateChange = fn;
  }

  /**
   * this is implementation of ControlValueAccessor to support angular forms touch/blur
   * @param fn Function to be called on blur
   */
  registerOnTouched(fn: () => void): void {
    this._propagateTouch = fn;
  }

  writeValue(value: GroupByOption[]): void {
    this.selectedOptions = value;
    this.checkSelectedOptions(value);
  }

  filterOptions($event: string | number | undefined): void {
    const value = $event as string;
    this.searchValue = value;
    
    if (value.length < 3) {
      this.filteredOptions = this.availableOptions;
      this.analytics.event(AnalyticsEvents.RESET_SEARCH_GROUPING_OPTIONS, {});

      return;
    }

    this.filteredOptions = this.availableOptions.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()));
    this.analytics.event(AnalyticsEvents.SEARCH_GROUPING_OPTIONS, { [AnalyticsProperties.SEARCH_TERM]: value });
  }

  private checkSelectedOptions(selectedOptions: GroupByOption[]): void {
    this.selectedOptions = selectedOptions;
    this.initialMenuValue = flatten(map(selectedOptions, 'value'));
    this.availableOptions = differenceBy(this.options, selectedOptions, 'value');
    this.filteredOptions = clone(this.availableOptions);
    this.filterOptions(this.searchValue);
  }

  private isFocusEvent($event: MenuBlurEvent | FocusEvent): $event is FocusEvent {
    return 'type' in $event && $event.type === 'blur';
  }
}


<gs-label *ngIf="showLabel" [classes]="{ label: overrideClasses.label }" size="sm" [inline]="true">{{ label }}
</gs-label>
<gs-button #menuToggleButton (click)="onToggle()" shape="circle" emphasis="subtle" size="sm">
  {{ selectedOptions.length && showSelectedValuesInButton ? selectedOptions[0].label : placeholder }}
  {{ selectedOptions && showSelectedValuesInButton && selectedOptions.length > 1 ? '+' + (selectedOptions.length - 1) : ''}}
  <gs-icon type="filled" role="img" size="md" [name]="visible ? 'expand-less' : 'expand-more'"></gs-icon>
</gs-button>
<gs-menu (blur)="onBlur($event)"
  [classes]="{ root: overrideClasses.menu, optionsContainer: overrideClasses.menuContainer }" [visible]="visible"
  [multiple]="true" [target]="menuToggleButtonRef?.nativeElement">
  <div class="group-by" [class.group-by--dark-mode]="isDarkMode">
    <div class="group-by__menu-wrapper">
      <div class="group-by__search-box" *ngIf="availableOptions && availableOptions.length > 9">
        <gs-input [value]="searchValue" type="search" size="sm" [minLength]="2" placeholder="Search..." (valueChange)="filterOptions($event)">
        </gs-input>
      </div>
      <ul class="group-by__group-order-item-list" [class.masked-overflow]="availableOptions && availableOptions.length > 9"
        [class.group-by__group-order-item-list--with-search]="availableOptions && availableOptions.length > 9" cdkDropList
        [cdkDropListSortingDisabled]="true" #availableOptionsZone="cdkDropList" [cdkDropListData]="filteredOptions"
        [cdkDropListConnectedTo]="[selectedOptionsZone]" (cdkDropListEntered)="activeZone = 'availableOptionsZone'"
        (cdkDropListExited)="activeZone = ''">
        <li *ngFor="let option of filteredOptions; trackBy: trackByValue" class="group-by__group-order-item"
          [class.group-by__group-order-item--drag-disabled]="!!(maximumSelected && selectedOptions && selectedOptions.length >= maximumSelected)"
          cdkDrag [cdkDragPreviewClass]="previewClass"
          [cdkDragDisabled]="!!(maximumSelected && selectedOptions && selectedOptions.length >= maximumSelected)"
          [cdkDragData]="option" (cdkDragStarted)="activeZone = 'availableOptionsZone'">
          <gs-icon type="filled" name="drag-handle" size="sm" class="group-by__group-order-drag"></gs-icon>
          {{ option.label }}
          <ng-template cdkDragPreview matchSize>
            <div class="group-by__group-order-item-preview">
              <gs-icon type="filled" name="drag-handle" size="sm" class="group-by__group-order-drag"></gs-icon>
              {{ option.label }}
            </div>
          </ng-template>
          <div [class.group-by__group-order-item--placeholder]="activeZone === 'selectedOptionsZone'"
            [class.group-by__group-order-item--placeholder-dark]="activeZone === 'availableOptionsZone'"
            *cdkDragPlaceholder>{{ option.label }}</div>
        </li>
      </ul>
    </div>
    <div class="group-by__group-order" (dragover)="$event.preventDefault()">
      <span
        class="group-by__group-order-message">{{ selectedOptions && selectedOptions.length >= maximumSelected ? 'Maximum options selected' : 'Drag items here' }}</span>
      <span class="group-by__none-selected" *ngIf="!selectedOptions.length">No grouping set</span>
      <ul class="group-by__group-order-item-list group-by__group-order-item-list--selected-zone" cdkDropList
        #selectedOptionsZone="cdkDropList" [cdkDropListData]="selectedOptions"
        [cdkDropListConnectedTo]="[availableOptionsZone]" (cdkDropListDropped)="selectOption($event)"
        (cdkDropListEntered)="activeZone = 'selectedOptionsZone'" (cdkDropListExited)="activeZone = ''">
        <li *ngFor="let option of selectedOptions; trackBy: trackByValue"
          class="group-by__group-order-item group-by__group-order-item--selected" cdkDrag
          [cdkDragPreviewClass]="previewClass" cdkDragLockAxis="y" [cdkDragData]="option"
          (cdkDragStarted)="activeZone = 'selectedOptionsZone'">
          <gs-icon type="filled" name="drag-handle" size="sm" class="group-by__group-order-drag"></gs-icon>
          {{ option.label }}
          <gs-icon type="filled" name="close" size="sm" class="group-by__group-order-close"
            (click)="removeOption(option)"></gs-icon>
          <ng-template cdkDragPreview matchSize>
            <div class="group-by__group-order-item-preview">
              <gs-icon type="filled" name="drag-handle" size="sm" class="group-by__group-order-drag"></gs-icon>
              {{ option.label }}
            </div>
          </ng-template>
          <div [class.group-by__group-order-item--placeholder]="activeZone === 'selectedOptionsZone'"
            [class.group-by__group-order-item--placeholder-dark]="activeZone === 'availableOptionsZone'"
            *cdkDragPlaceholder>{{ option.label }}</div>
        </li>
      </ul>
    </div>
  </div>
</gs-menu>
