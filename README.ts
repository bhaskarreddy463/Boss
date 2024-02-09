import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GshWrapperComponent } from './gsh-wrapper.component';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { QueryFieldComponent } from '@gs-ux-uitoolkit-angular/queryfield';

describe('GshWrapperComponent', () => {
  let component: GshWrapperComponent;
  let fixture: ComponentFixture<GshWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GshWrapperComponent],
      imports: [CommonModule, FormsModule, PopoverModule],
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
    const queryFieldRef: QueryFieldComponent = {} as QueryFieldComponent;

    spyOn(component.predicateFilterChanged, 'emit');

    // Manually trigger the predicate filter change event
    component.emitPredicateFilterChange(mockValue);

    // Check if the event was emitted with the correct value
    expect(component.predicateFilterChanged.emit).toHaveBeenCalledWith(mockValue);
  });

  it('should open selector popover on ngAfterViewInit', () => {
    spyOn(component.input.nativeElement, 'click');
    component.ngAfterViewInit();

    // Check if the click method of the input element was called
    expect(component.input.nativeElement.click).toHaveBeenCalled();
  });
});



<input #input
        data-input
        placeholder="Select value..."
        type="text"
        name="date"
        readonly
        inputId="text-input"
        className="free-input" #queryCustomInput="gsPopover" [gsPopoverShowTip]="false" gsPopoverPlacement="bottom-left"
        gsPopoverClass="metrics-container__light-popover gsh-metrics-container__popover" gsPopover [gsPopoverBody]="gshSelector" [gsPopoverVisible]="true"/>

<ng-template #gshSelector>
    <metrics-gsh-selector (predicateFilterChanged)="emitPredicateFilterChange($event)" [queryfieldRef]="queryfieldRef" [expanded]="true" class="custom-queryfield">
    </metrics-gsh-selector>
</ng-template>

          import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GshSelectorComponent } from '../../../gsh-selector/gsh-selector.component';
import { Popover, PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { QueryFieldComponent } from '@gs-ux-uitoolkit-angular/queryfield';

@Component({
  selector: 'metrics-gsh-wrapper',
  standalone: true,
  imports: [CommonModule, PopoverModule, GshSelectorComponent],
  templateUrl: './gsh-wrapper.component.html',
  styleUrl: './gsh-wrapper.component.scss',
})
export class GshWrapperComponent implements AfterViewInit {
  @Input() queryfieldRef!: QueryFieldComponent;
  @Output() readonly predicateFilterChanged: EventEmitter<string> = new EventEmitter();
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('queryCustomInput', { read: Popover }) selectorPopover!: Popover;

  ngAfterViewInit(): void {
      this.input.nativeElement.click();
  }

  emitPredicateFilterChange(value: string): void {
    this.predicateFilterChanged.emit(value);
  }
}


import { GshSelectorComponent } from './gsh-selector.component';
import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { provideMockStore } from '@ngrx/store/testing';

export default {
  title: 'Grids/GSH Selector',
  tags: ['autodocs'],
  component: GshSelectorComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<GshSelectorComponent>;

const Template: StoryFn<GshSelectorComponent> = (args: GshSelectorComponent) => ({
  props: args,
  providors: [provideMockStore({})],
});

export const DefaultView = Object.assign(Template.bind({}), { order: 0 });
<div [hidden]="!expanded && gshLevel !== 3">
    <gs-label [classes]="{ label: overrideClasses.label}"><strong>{{ gshLevelLabel }}</strong></gs-label>
    <div *ngFor="let gsh of gshValues let i = index">
        {{i}}
        <div class="gsh-row row g-0" (keydown)="navigateSelector($event, gsh, i)">
            <div autofocus tabindex="0" #dropdownButton [class]="'col-auto dropdown-button-' + (gshLevel-2)" *ngIf="gsh.children.length" (click)="selectDropdown(gsh, i, dropdownButton); $event.stopPropagation()" (keydown.enter)="selectDropdown(gsh, i, dropdownButton); $event.stopPropagation()">
                <gs-icon [ngStyle]="gsh.clicked ? { 'rotate': '90deg' } : {}" name="chevron-right" type="filled"
                    size="sm"></gs-icon>
            </div>
            <!-- div with ngIf on gsh.children.length -->
            <div tabindex="0" #dropdownButton *ngIf="!gsh.children.length" [class]="'col-auto childless-dropdown-' + (gshLevel-2)"></div>
            <div tabindex="0" #gshLevelButton class="d-flex flex-column flex=1"
                [class]="gsh.children.length ? 'col gsh-button' : 'col gsh-button gsh-button__childless-' + (gshLevel-2)"
                (click)="selectLevel(gsh, gshLevel)" (keydown.enter)="selectLevel(gsh, gshLevel); $event.stopPropagation()">
                <div class="key-label">{{ gsh.value }}</div>
                <div class="sub-label">Enter to select this item</div>
            </div>
        </div>
        <!-- <metrics-gsh-selector #childCmp [queryfieldRef]="queryfieldRef" [expanded]="expandedNodes[i]" [gshLevel]="gshLevel+1" [gshChildren]="gsh.children" (outOfBounds)="detectOutOfBounds($event)"
            *ngIf="!gsh.children.length"></metrics-gsh-selector> -->
        <metrics-gsh-selector #childCmp [queryfieldRef]="queryfieldRef" [expanded]="expandedNodes[i]" [gshLevel]="gshLevel+1" [gshChildren]="gsh.children" (outOfBounds)="detectOutOfBounds($event)"
            *ngIf="gsh.children.length"></metrics-gsh-selector>
    </div></div>

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { colors } from '@gs-ux-uitoolkit-common/design-system';
import { CommonModule } from '@angular/common';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import { ESGMetricsService } from '../esg-dashboard/esg-metrics.service';
import { FIConstants } from '@gsam-fi/common';
import { FiPixels } from '@gsam-fi/common/design-system';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { LabelModule } from '@gs-ux-uitoolkit-angular/label';
import { MenuModule } from '@gs-ux-uitoolkit-angular/menu';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { QueryFieldComponent } from '@gs-ux-uitoolkit-angular/queryfield';
import { selectorData } from './gsh-selector-data';
import { TreeModule } from '@gs-ux-uitoolkit-angular/tree';

const overrideStyleSheet = new StyleSheet('gsh-label-override', {
  label: { color: colors.gray060, backgroundColor: colors.gray020, paddingLeft: FiPixels.SIXTEEN, marginBottom: FiPixels.ZERO },
});

export interface GSH {
  value: string;
  children: GSH[];
  clicked?: boolean;
}

@Component({
  selector: 'metrics-gsh-selector',
  templateUrl: 'gsh-selector.component.html',
  styleUrls: ['./gsh-selector.component.scss'],
  imports: [ButtonModule, CommonModule, IconModule, LabelModule, PopoverModule, TreeModule, MenuModule],
  standalone: true,
})
export class GshSelectorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() queryfieldRef!: QueryFieldComponent;
  @Input() expanded: boolean | undefined;
  @Input() gshLevel: number = 3; //replace with enum
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
  // queryfieldRef!: QueryFieldComponent;

  constructor(private readonly metricsService: ESGMetricsService) {}

  //this will be called for every child component
  ngOnInit(): void {
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);
    // this.gshValues = this.store$.pipe(select(this.gshLevel));
    this.gshLevelLabel = `L${this.gshLevel}`;
    // this.gshValues = this.findGSHLevel(this.getGSH(), this.gshLevel); // gives { Agency: {}, ... ]}

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
    // this.metricsService.gshSelector('TOTALS,FI', 4).subscribe((response) => {
    console.log(selectorData);
    const res = [selectorData];
    let i = 0;
    res.forEach((resu) => {
      Object.keys(resu).forEach((result) => {
        this.gshValues.push(this.formatLevels(new Map<string, object>().set(result, Object.values(resu)[i])));
        i++;
      });
      console.log(this.gshValues);
    });
    console.log('res', res);
    // });
  }

  private formatLevels(level: Map<string, object>): GSH {
    const gsh = <GSH>{
      value: '',
      children: [],
    };

    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value as object;
    const childMap = new Map<string, object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map<string, object>().set(key, childMap.get(key) || {}))));
    }

    return gsh;
  }

  // to run on first
  ngAfterViewInit(): void {
    this.focusFirstChild(this.parentPosition, true);
  }

  selectLevel(selectedGSH: GSH, gshLevel: number): void {
    if (this.queryfieldRef) {
      // this.predicateFilterChanged.emit(`${selectedGSH.value  } (L${gshLevel})`);
      this.queryfieldRef.updateCurrentPredicate({
        rightOperand: `${selectedGSH.value} (L${gshLevel})`,
      });
    }
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
  selectDropdown(gsh: GSH, currentSelected: number, dropdownButtonRef: HTMLDivElement) {
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
        console.log(this.childCmp.get(currentSelected));
        if (this.expandedNodes[currentSelected] && this.childCmp.get(currentSelected)) {
          this.childCmp.get(currentSelected - (this.gshLevelElementRef.length - this.childCmp.length))?.focusFirstChild(currentSelected, this.onDropdown);
          this.childCmp.get(currentSelected - (this.gshLevelElementRef.length - this.childCmp.length))!.onDropdown = this.onDropdown;
          break;
        }

        //check if needed
        // case where dropdowns and level indexes are out of sync
        if (!this.childCmp.get(currentSelected)) {
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
        console.log(this.dropdownElementRef.length);
        console.log(this.gshValues);
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
