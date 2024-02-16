import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GshWrapperComponent } from './gsh-wrapper.component';
import { GshSelectorComponent } from '../../../gsh-selector/gsh-selector.component';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';

describe('GshWrapperComponent', () => {
  let component: GshWrapperComponent;
  let fixture: ComponentFixture<GshWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, PopoverModule],
      declarations: [GshWrapperComponent, GshSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GshWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit predicate filter change when received from gsh selector', () => {
    const mockValue = 'Mock Predicate Filter Value';
    const emitSpy = jest.spyOn(component.predicateFilterChanged, 'emit');

    component.emitPredicateFilterChange(mockValue);

    expect(emitSpy).toHaveBeenCalledWith(mockValue);
  });

  it('should open selector popover on ngAfterViewInit', () => {
    const clickSpy = jest.spyOn(component.input.nativeElement, 'click');
    component.ngAfterViewInit();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should focus first child of gsh selector on onKeydownFocusFirstElement', () => {
    // Setup
    const mockGshSelectorRef = {
      first: {
        focusFirstChild: jest.fn()
      }
    };
    component.gshSelectorRef = new QueryList<GshSelectorComponent>();
    (component.gshSelectorRef as any)._results = [mockGshSelectorRef];

    // Action
    component.onKeydownFocusFirstElement();

    // Assertion
    expect(mockGshSelectorRef.first.focusFirstChild).toHaveBeenCalledWith(0, true);
  });

  it('should destroy properly on ngOnDestroy', () => {
    // Setup
    const destroyNextSpy = jest.spyOn(component.destroy$, 'next');
    const destroyCompleteSpy = jest.spyOn(component.destroy$, 'complete');
    
    // Action
    component.ngOnDestroy();

    // Assertion
    expect(destroyNextSpy).toHaveBeenCalledWith(true);
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });
});




<input #input
        data-input
        placeholder="Select value..."
        type="text"
        name="date"
        inputId="text-input"
        className="free-input" (keydown)="onKeydownFocusFirstElement()" [gsPopoverVisible]="true" #queryCustomInput="gsPopover" [gsPopoverShowTip]="false" gsPopoverPlacement="bottom-left"
        gsPopoverClass="metrics-container__light-popover gsh-metrics-container__popover" gsPopover [gsPopoverBody]="gshSelector"/>

<ng-template #gshSelector>
    <metrics-gsh-selector #gshComp (predicateFilterChanged)="emitPredicateFilterChange($event)" [expanded]="true" class="custom-queryfield">
    </metrics-gsh-selector>
</ng-template>



import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GshSelectorComponent } from '../../../gsh-selector/gsh-selector.component';
import { Popover, PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { Subject } from 'rxjs';

@Component({
  selector: 'metrics-gsh-wrapper',
  standalone: true,
  imports: [CommonModule, PopoverModule, GshSelectorComponent],
  templateUrl: './gsh-wrapper.component.html',
})
export class GshWrapperComponent implements AfterViewInit, OnDestroy {
  @Output() readonly predicateFilterChanged: EventEmitter<string> = new EventEmitter();
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('queryCustomInput', { read: Popover }) selectorPopover!: Popover;
  @ViewChildren('gshComp', {read: GshSelectorComponent}) gshSelectorRef!: QueryList<GshSelectorComponent>;
  private destroy$: Subject<boolean> = new Subject();

  ngAfterViewInit(): void {
      this.input.nativeElement.click();
  }

  emitPredicateFilterChange(value: string): void {
    this.predicateFilterChanged.emit(value);
  }

  onKeydownFocusFirstElement(): void {
    if(this.gshSelectorRef && this.gshSelectorRef.length > 0){
      const firsGshCompRef = this.gshSelectorRef.first;
      firsGshCompRef.focusFirstChild(0, true);
    }
  }

  ngOnDestroy(): void {
    this.selectorPopover.ngOnDestroy();
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}


<input #input
        data-input
        placeholder="Select value..."
        type="text"
        name="date"
        inputId="text-input"
        className="free-input" (keydown)="onKeydownFocusFirstElement()" [gsPopoverVisible]="true" #queryCustomInput="gsPopover" [gsPopoverShowTip]="false" gsPopoverPlacement="bottom-left"
        gsPopoverClass="metrics-container__light-popover gsh-metrics-container__popover" gsPopover [gsPopoverBody]="gshSelector"/>

<ng-template #gshSelector>
    <metrics-gsh-selector #gshComp (predicateFilterChanged)="emitPredicateFilterChange($event)" [expanded]="true" class="custom-queryfield">
    </metrics-gsh-selector>
</ng-template>



import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { GshWrapperComponent } from './gsh-wrapper.component';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';

describe('GshWrapperComponent', () => {
  let component: GshWrapperComponent;
  let fixture: ComponentFixture<GshWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GshWrapperComponent, CommonModule, FormsModule, PopoverModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GshWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit predicate filter change when received from gsh selector', () => {
    const mockValue = 'Mock Predicate Filter Value';

    jest.spyOn(component.predicateFilterChanged, 'emit');

    component.emitPredicateFilterChange(mockValue);

    expect(component.predicateFilterChanged.emit).toHaveBeenCalledWith(mockValue);
  });

  it('should open selector popover on ngAfterViewInit', () => {
    jest.spyOn(component.input.nativeElement, 'click');
    component.ngAfterViewInit();

    expect(component.input.nativeElement.click).toHaveBeenCalled();
  });
});



@if(gshValues.length){
    <div [hidden]="!expanded && gshLevel !== 3">
        <gs-label [classes]="{ label: overrideClasses.label}"><strong>{{ gshLevelLabel }}</strong></gs-label>
        @for(gsh of gshValues; track $index) {
            <div class="gsh-row row g-0" (keydown)="navigateSelector($event, gsh, $index)">
                <div autofocus tabindex="0" #dropdownButton [class]="'col-auto dropdown-button-' + (gshLevel-2)" *ngIf="gsh.children.length" (click)="selectDropdown(gsh, $index, dropdownButton); $event.stopPropagation()" (keydown.enter)="selectDropdown(gsh, $index, dropdownButton); $event.stopPropagation()">
                    <gs-icon [ngStyle]="gsh.clicked ? { 'rotate': '90deg' } : {}" name="chevron-right" type="filled"
                        size="sm"></gs-icon>
                </div>
                <!-- div with ngIf on gsh.children.length -->
                <div tabindex="0" #dropdownButton *ngIf="!gsh.children.length" [class]="'col-auto childless-dropdown-' + (gshLevel-2)"></div>
                <div tabindex="0" #gshLevelButton class="d-flex flex-column flex=1"
                    [class]="gsh.children.length ? 'col gsh-button' : 'col gsh-button gsh-button__childless-' + (gshLevel-2)"
                    (click)="selectLevel(gsh)" (keydown.enter)="selectLevel(gsh); $event.stopPropagation()">
                    <div class="key-label">{{ gsh.value }}</div>
                    <div class="sub-label">Enter to select this item</div>
                </div>
            </div>
            @if(gsh.children.length) {
                <metrics-gsh-selector #childCmp (predicateFilterChanged)="emitPredicateFilterChange($event)" [expanded]="expandedNodes[$index]" [gshLevel]="gshLevel+1" [gshChildren]="gsh.children" (outOfBounds)="detectOutOfBounds($event)"></metrics-gsh-selector>
            }
        }
    </div>
} @else {
    <gs-loading-icon size="sm" shape="circle" color="gray" label="Loading"></gs-loading-icon>
}




import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { colors } from '@gs-ux-uitoolkit-common/design-system';
import { CommonModule } from '@angular/common';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import { ESGMetricsService } from '../esg-dashboard/esg-metrics.service';
import { FIConstants } from '@gsam-fi/common';
import { FiPixels } from '@gsam-fi/common/design-system';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { LabelModule } from '@gs-ux-uitoolkit-angular/label';
import { LoadingModule } from '@gs-ux-uitoolkit-angular/loading';
import { map, Subject, takeUntil } from 'rxjs';
import { MenuModule } from '@gs-ux-uitoolkit-angular/menu';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { TreeModule } from '@gs-ux-uitoolkit-angular/tree';

const overrideStyleSheet = new StyleSheet('gsh-label-override', {
  label: { color: colors.gray060, backgroundColor: colors.gray020, paddingLeft: FiPixels.SIXTEEN, marginBottom: FiPixels.ZERO },
});

export interface GSH {
  id: string;
  value: string;
  children: GSH[];
  clicked?: boolean;
}

@Component({
  selector: 'metrics-gsh-selector',
  templateUrl: 'gsh-selector.component.html',
  styleUrls: ['./gsh-selector.component.scss'],
  imports: [ButtonModule, CommonModule, IconModule, LabelModule, PopoverModule, TreeModule, MenuModule, LoadingModule],
  standalone: true,
})
export class GshSelectorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() expanded: boolean | undefined;
  @Input() gshLevel: number = 3;
  @Input() gshChildren: GSH[] | undefined;
  @Output() readonly predicateFilterChanged: EventEmitter<string> = new EventEmitter();
  @Output() readonly outOfBounds: EventEmitter<{ direction: string; currentSelected: number; onDropdown: boolean }> = new EventEmitter();
  @ViewChildren('gshLevelButton', { read: ElementRef }) gshLevelElementRef!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('dropdownButton', { read: ElementRef }) dropdownElementRef!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('childCmp', { read: GshSelectorComponent }) childCmp!: QueryList<GshSelectorComponent>;
  gshLevelLabel: string | undefined;
  gshValues: GSH[] = [];
  selectedHasChildren: boolean | undefined;
  parent: GSH | undefined;
  overrideClasses!: CssClasses<typeof overrideStyleSheet>;
  parentPosition!: number;
  prevSelected: GSH | undefined;
  onDropdown!: boolean;
  expandedNodes: { [level: number]: boolean } = {};
  private destroy$: Subject<boolean> = new Subject();

  constructor(private readonly metricsService: ESGMetricsService) {}

  //this will be called for every child component
  ngOnInit(): void {
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);
    this.gshLevelLabel = `L${this.gshLevel}`;

    if (this.gshChildren) {
      this.gshValues = this.gshChildren;
    }

    if (!this.gshLevel) {
      this.gshLevel = 3;
    }

    this.onDropdown = true;

    if (this.gshValues.length === 0) {
      this.loadGSHLevels();
    }
  }

  private loadGSHLevels(): void {
    this.metricsService
      .gshSelector('TOTALS,FI', 4)
      .pipe(
        takeUntil(this.destroy$),
        map((response) => {
          return Object.entries(response).map(([key, value]) => this.formatLevels(new Map<string, object>().set(key, value as object)));
        }),
      )
      .subscribe((gshValues) => {
        this.gshValues.push(...gshValues);
      });
  }

  ngOnDestroy(): void {
    console.log('test');
    overrideStyleSheet.unmount(this);
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private formatLevels(level: Map<string, object>, parentValues: string[] = []): GSH {
    const gsh = <GSH>{
      id:'',
      value: '',
      children: [],
    };

    gsh.value = level.keys().next().value;
    gsh.children = [];
    gsh.id = [...parentValues, gsh.value].join('|');
    const children = level.values().next().value as object;
    const childMap = new Map<string, object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map<string, object>().set(key, childMap.get(key) || {}), [...parentValues, gsh.value])));
    }

    return gsh;
  }

  // to run on first
  ngAfterViewInit(): void {
    this.focusFirstChild(this.parentPosition, true);
  }

  emitPredicateFilterChange(value: string): void {
    this.predicateFilterChanged.emit(value);
  }

  selectLevel(selectedGSH: GSH): void {
    this.emitPredicateFilterChange(selectedGSH.id);
  }

  //to run on all after
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expanded.currentValue && this.expanded && this.dropdownElementRef?.length) {
      this.focusFirstChild(this.parentPosition, this.onDropdown);
    }
  }

  //called by afterView + onChanges
  focusFirstChild(parentPosition = 0, onDropdown = false): void {
    this.parentPosition = parentPosition;

    if (onDropdown) {
      this.dropdownElementRef.get(0)?.nativeElement.focus();
    } else {
      this.gshLevelElementRef.get(0)?.nativeElement.focus();
    }
  }

  // new clicked logic
  selectDropdown(gsh: GSH, currentSelected: number, dropdownButtonRef: HTMLDivElement): void {
    if (this.onDropdown) {
      let currentClosed = false;
      //check if any others are expanded and if so close them
      for (const expanded in this.expandedNodes) {
        if (this.expandedNodes[expanded]) {
          if (this.gshValues[expanded] === gsh) {
            currentClosed = true;
          }
          this.expandedNodes[expanded] = false;
          this.gshValues[expanded].clicked = false;
        }
      }

      if (currentClosed) {
        return;
      }

      // breaks those above childless
      dropdownButtonRef.click();
      gsh.clicked = true;
      this.expandedNodes[currentSelected] = true;
    } else {
      this.gshLevelElementRef.get(currentSelected)?.nativeElement.click();
    }
  }

  detectOutOfBounds($event: { direction: string; currentSelected: number; onDropdown: boolean }): void {
    if ($event.direction === 'down') {
      if ($event.onDropdown) {
        this.dropdownElementRef.get($event.currentSelected + 1)?.nativeElement.focus();
      } else {
        this.gshLevelElementRef.get($event.currentSelected + 1)?.nativeElement.focus();
      }
    } else if ($event.direction === 'up') {
      if ($event.onDropdown) {
        this.dropdownElementRef.get($event.currentSelected)?.nativeElement.focus();
      } else {
        this.gshLevelElementRef.get($event.currentSelected)?.nativeElement.focus();
      }
    }
  }

  navigateSelector($event: KeyboardEvent, gsh: GSH, currentSelected: number, dropdownButton?: HTMLDivElement): void {
    $event.preventDefault();

    if (!this.gshLevelElementRef) {
      return;
    }

    switch ($event.code) {
      case 'Enter':
        $event?.stopPropagation();
        if (dropdownButton) {
          this.selectDropdown(gsh, currentSelected, dropdownButton);
        }
        break;

      case 'ArrowDown':
        if (this.expandedNodes[currentSelected]) {
          const cmpChildObj = this.childCmp.find((cmp) => cmp.expanded || false);
          if (cmpChildObj) {
            cmpChildObj?.focusFirstChild(currentSelected, this.onDropdown);
            cmpChildObj.onDropdown = this.onDropdown;
          }
          break;
        }

        //check if needed
        // case where dropdowns and level indexes are out of sync
        if (!this.childCmp.get(currentSelected) && currentSelected > this.dropdownElementRef.length) {
          this.childCmp.get(currentSelected - this.dropdownElementRef.length)?.focusFirstChild(currentSelected, false);
          break;
        }

        if (currentSelected + 1 > this.gshValues.length - 1) {
          this.outOfBounds.emit({ direction: 'down', currentSelected: this.parentPosition, onDropdown: this.onDropdown });
          break;
        }

        //if on dropdown button get by dropdown ref
        if (this.onDropdown) {
          this.dropdownElementRef.get(currentSelected + 1)?.nativeElement.focus();
        } else {
          this.gshLevelElementRef.get(currentSelected + 1)?.nativeElement.focus();
        }

        break;

      case 'ArrowUp':
        //check if on first dropdown
        if (!this.dropdownElementRef.get(currentSelected - 1) && this.dropdownElementRef.length > 0) {
          const tempOnDropdown = this.onDropdown;
          this.onDropdown = true;
          this.outOfBounds.emit({ direction: 'up', currentSelected: this.parentPosition, onDropdown: tempOnDropdown });
          break;
        }

        if (currentSelected - 1 < 0) {
          if (this.dropdownElementRef.length === 0) {
            this.outOfBounds.emit({ direction: 'up', currentSelected: this.parentPosition, onDropdown: false });
          } else {
            //don't need this? - covered in first logic at top
            const tempOnDropdown = this.onDropdown;
            this.onDropdown = true;
            this.outOfBounds.emit({ direction: 'up', currentSelected: this.parentPosition, onDropdown: tempOnDropdown });
          }
          break;
        }

        if (this.onDropdown) {
          this.dropdownElementRef.get(currentSelected - 1)?.nativeElement.focus();
        } else {
          this.gshLevelElementRef.get(currentSelected - 1)?.nativeElement.focus();
        }

        break;

      case 'ArrowLeft':
        if (this.dropdownElementRef.length !== this.gshLevelElementRef.length) {
          if (this.dropdownElementRef.length === 0) {
            break;
          }
          this.dropdownElementRef.get(currentSelected - this.dropdownElementRef.length)?.nativeElement.focus();
        }
        this.dropdownElementRef.get(currentSelected)?.nativeElement.focus();
        this.onDropdown = true;

        break;

      case 'ArrowRight':
        this.gshLevelElementRef.get(currentSelected)?.nativeElement.focus();
        this.onDropdown = false;

        break;

      default:
        break;
    }
  }
}




import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';

import { ESGMetricsService } from '../esg-dashboard/esg-metrics.service';
import { GSH, GshSelectorComponent } from './gsh-selector.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { selectorData } from './gsh-selector-data';

describe('GshSelectorComponent', () => {
  let component: GshSelectorComponent;
  let fixture: ComponentFixture<GshSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GshSelectorComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ESGMetricsService,
          useValue: {
            gshSelector: () => of(selectorData),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GshSelectorComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('set gsh values on load', () => {
    fixture.detectChanges();
    expect(component.gshLevelLabel).toEqual('L3');
    expect(component.onDropdown).toEqual(true);
  });

  it('should always focus on first child after view init', () => {
    fixture.detectChanges();
    jest.spyOn(component, 'focusFirstChild');

    component.ngAfterViewInit();

    expect(component.focusFirstChild).toBeCalledTimes(1);
  });

  it('should focus on first child on changes if there is a child', () => {
    fixture.detectChanges();
    jest.spyOn(component, 'focusFirstChild');

    component.expanded = true;
    component.ngOnChanges({ expanded: new SimpleChange(false, true, false) });

    expect(component.focusFirstChild).toBeCalledTimes(1);
  });

  it('should not focus on first child on changes if there is not a child', () => {
    fixture.detectChanges();
    jest.spyOn(component, 'focusFirstChild');

    component.expanded = true;
    component.ngOnChanges({ expanded: new SimpleChange(false, false, false) });

    expect(component.focusFirstChild).toBeCalledTimes(0);
  });

  it('should focus on first dropdown child', () => {
    fixture.detectChanges();
    jest.spyOn(component.dropdownElementRef.first.nativeElement, 'focus');
    component.focusFirstChild(0, true);

    expect(component.dropdownElementRef.get(0)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should focus on first gsh level child', () => {
    fixture.detectChanges();
    jest.spyOn(component.gshLevelElementRef.first.nativeElement, 'focus');
    component.focusFirstChild(0, false);

    expect(component.gshLevelElementRef.get(0)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select parent dropdown child when out of bounds downwards', () => {
    fixture.detectChanges();
    const $event = {
      direction: 'down',
      currentSelected: 0,
      onDropdown: true,
    };

    jest.spyOn(component.dropdownElementRef.get($event.currentSelected + 1)?.nativeElement as HTMLElement, 'focus');

    component.detectOutOfBounds($event);

    expect(component.dropdownElementRef.get($event.currentSelected + 1)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select parent gsh level child when out of bounds downwards', () => {
    fixture.detectChanges();
    const $event = {
      direction: 'down',
      currentSelected: 0,
      onDropdown: false,
    };

    jest.spyOn(component.gshLevelElementRef.get($event.currentSelected + 1)?.nativeElement as HTMLElement, 'focus');

    component.detectOutOfBounds($event);

    expect(component.gshLevelElementRef.get($event.currentSelected + 1)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select parent dropdown when out of bounds upwards', () => {
    fixture.detectChanges();
    const $event = {
      direction: 'up',
      currentSelected: 0,
      onDropdown: true,
    };

    jest.spyOn(component.dropdownElementRef.get($event.currentSelected)?.nativeElement as HTMLElement, 'focus');

    component.detectOutOfBounds($event);

    expect(component.dropdownElementRef.get($event.currentSelected)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select parent gsh level when out of bounds upwards', () => {
    fixture.detectChanges();
    const $event = {
      direction: 'up',
      currentSelected: 0,
      onDropdown: false,
    };

    jest.spyOn(component.gshLevelElementRef.get($event.currentSelected)?.nativeElement as HTMLElement, 'focus');

    component.detectOutOfBounds($event);

    expect(component.gshLevelElementRef.get($event.currentSelected)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should emit downwards out of bounds event when at bottom of levels on Arrow Down keypress', () => {
    fixture.detectChanges();
    const currentSelected = 1;
    jest.spyOn(component.outOfBounds, 'emit');

    const $event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
    const fin = { id: '', value: 'Fin', children: [] } as GSH;
    const corp = { id: '', value: 'Corp', children: [fin] } as GSH;

    component.gshValues = [corp];

    component.navigateSelector($event, corp, currentSelected);

    expect(component.outOfBounds.emit).toBeCalledTimes(1);
    expect(component.outOfBounds.emit).toBeCalledWith({ direction: 'down', currentSelected: component.parentPosition, onDropdown: component.onDropdown });
  });

  it('should select the next dropdown in level on Arrow Down keypress', () => {
    fixture.detectChanges();
    const currentSelected = 0;
    jest.spyOn(component.dropdownElementRef.get(currentSelected + 1)?.nativeElement as HTMLElement, 'focus');

    const $event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
    const fin = { id: '', value: 'Fin', children: [] } as GSH;
    const corp = { id: '', value: 'Corp', children: [] } as GSH;

    component.gshValues = [corp, fin];

    component.navigateSelector($event, corp, currentSelected);

    expect(component.dropdownElementRef.get(currentSelected + 1)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select the next gsh level in level on Arrow Down keypress', () => {
    fixture.detectChanges();
    const currentSelected = 0;
    jest.spyOn(component.gshLevelElementRef.get(currentSelected + 1)?.nativeElement as HTMLElement, 'focus');

    const $event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
    const fin = { id: '', value: 'Fin', children: [] } as GSH;
    const corp = { id: '', value: 'Corp', children: [] } as GSH;

    component.gshValues = [corp, fin];
    component.onDropdown = false;

    component.navigateSelector($event, corp, currentSelected);

    expect(component.gshLevelElementRef.get(currentSelected + 1)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should emit upwards out of bounds event when on a childless level on Arrow Up keypress', () => {
    fixture.detectChanges();
    const currentSelected = 0;
    jest.spyOn(component.outOfBounds, 'emit');

    const $event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    const corp = { id: '', value: 'Corp', children: [] } as GSH;

    component.gshValues = [corp];

    component.navigateSelector($event, corp, currentSelected);

    expect(component.outOfBounds.emit).toBeCalledTimes(1);
    expect(component.outOfBounds.emit).toBeCalledWith({ direction: 'up', currentSelected: component.parentPosition, onDropdown: true });
  });

  it('should select the above dropdown on Arrow Up keypress', () => {
    fixture.detectChanges();
    const currentSelected = 1;
    jest.spyOn(component.dropdownElementRef.get(currentSelected - 1)?.nativeElement as HTMLElement, 'focus');

    const $event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    const corp = { id: '', value: 'Corp', children: [] } as GSH;

    component.navigateSelector($event, corp, currentSelected);

    expect(component.dropdownElementRef.get(currentSelected - 1)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select the above gsh level on Arrow Up keypress', () => {
    fixture.detectChanges();
    const currentSelected = 1;
    component.onDropdown = false;
    jest.spyOn(component.gshLevelElementRef.get(currentSelected - 1)?.nativeElement as HTMLElement, 'focus');

    const $event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    const corp = { id: '', value: 'Corp', children: [] } as GSH;

    component.navigateSelector($event, corp, currentSelected);

    expect(component.gshLevelElementRef.get(currentSelected - 1)?.nativeElement.focus).toBeCalledTimes(1);
  });

  it('should select the corresponding dropdown if no childless gsh level on Arrow Left keypress', () => {
    const currentSelected = 0;

    const $event = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
    const advertising = { id: '', value: 'Advertising', children: [] } as GSH;
    const agency = { id: '', value: 'Agency', children: [advertising] } as GSH;

    fixture.detectChanges();
    jest.spyOn(component.dropdownElementRef.get(currentSelected)?.nativeElement as HTMLElement, 'focus');

    component.navigateSelector($event, agency, currentSelected);

    expect(component.dropdownElementRef.get(currentSelected)?.nativeElement.focus).toBeCalledTimes(1);
    expect(component.onDropdown).toEqual(true);
  });

  it('should select the corresponding gsh level on Arrow Right keypress', () => {
    const currentSelected = 0;

    const $event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
    const agency = { id: '', value: 'Agency', children: [] } as GSH;

    fixture.detectChanges();
    jest.spyOn(component.gshLevelElementRef.get(currentSelected)?.nativeElement as HTMLElement, 'focus');

    component.navigateSelector($event, agency, currentSelected);

    expect(component.gshLevelElementRef.get(currentSelected)?.nativeElement.focus).toBeCalledTimes(1);
    expect(component.onDropdown).toEqual(false);
  });
});
