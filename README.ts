import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import {
  CurrentPredicateOptions,
  DimensionConfig,
  DimensionValueConfig,
  FilterConfig,
  PredicateInQueryWithID,
  QueryChangeEvent,
  QueryFieldComponent,
  QueryfieldModule,
  QueryfieldPredicateConfig,
} from '@gs-ux-uitoolkit-angular/queryfield';
import { debounceTime, lastValueFrom, Observable, of, Subject } from 'rxjs';
import { isEqual } from 'lodash-es';

import { Column } from '@gsam-fi/grids/typings';
import GsQueryFieldStyles from '@styles/gs-queryfield';

import { DateDimensionComponent } from './custom-dimensions/date-dimension/date-dimension.component';
import { FIConstants } from '@gsam-fi/common';
import { FiPixels } from '@gsam-fi/common/design-system';

import { AllowedDimension, AllowedDimensionsOperators, AllowedDimensionTypes } from '../typings/saved-dashboards.typings';
import { DatePickerModule } from '@gs-ux-uitoolkit-angular/datepicker';
import { GshSelectorComponent } from '../gsh-selector/gsh-selector.component';
import { GshWrapperComponent } from './custom-dimensions/gsh-wrapper/gsh-wrapper.component';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';

const overrideStyleSheet = new StyleSheet('filter-bar-popover-styles', {
  selectorPopover: {
    paddingLeft: FiPixels.ZERO,
    paddingRight: FiPixels.ZERO,
    paddingTop: FiPixels.ZERO,
    paddingBottom: FiPixels.ZERO,
  },
});

const COVERAGE_GROUP_DIMENSION = 'research|researchSummary|coverageGroup';
const FI_CORPS_KEY = 'FI_CORPS';

@Component({
  selector: 'metrics-filter-bar',
  styleUrls: ['./filter-bar.component.scss'],
  templateUrl: 'filter-bar.component.html',
  imports: [CommonModule, DatePickerModule, QueryfieldModule, GshSelectorComponent, PopoverModule, DateDimensionComponent, GshWrapperComponent],
  standalone: true,
})
export class FilterBarComponent implements OnInit, OnChanges, OnDestroy {
  //TODO: add Input()
  @Input() allowedDimensions: { dimension: AllowedDimension; column: Column }[] = [];
  @Input() fetchDimensionValues!: ({
    predicate,
    filter,
  }: {
    predicate: CurrentPredicateOptions & { leftOperand: string };
    filter: FilterConfig;
  }) => Observable<DimensionValueConfig[]>;
  @Input() queryfieldPredicates: QueryfieldPredicateConfig[] = [];
  @Output() readonly filtersChanged: EventEmitter<PredicateInQueryWithID[]> = new EventEmitter();
  @ViewChild('queryfield', { read: QueryFieldComponent }) readonly queryfield!: QueryFieldComponent;
  allowFreeTextPredicate = false;
  allowedDimensionTypes = AllowedDimensionTypes;
  customDimensionConfig: Record<string, unknown> = {};
  customQueryfieldInput!: string | undefined;

  dimensions: DimensionConfig[] = [];
  dimensionValues: DimensionValueConfig[] = [];
  overrideClasses!: CssClasses<typeof overrideStyleSheet>;
  predicates: PredicateInQueryWithID[] = [];
  queryfieldClasses!: CssClasses<typeof GsQueryFieldStyles>;
  selectedOperator!: string | null;
  private corporateDesks = ['EMERGING_MARKET', 'HIGH_YIELD', 'INVESTMENT_GRADE'];
  private debounceFiltersChanged$: Subject<PredicateInQueryWithID[]> = new Subject();
  private filtersUpdated$: Subject<{ predicate: CurrentPredicateOptions & { leftOperand: string }; filter: FilterConfig }> = new Subject();
  private metricsDimensionConfig: FilterBarComponent['allowedDimensions'] = [];
  private predefinedOptions: Record<string, DimensionValueConfig[]> = {
    'identifiers|identifiers|advisorChannel': [
      {
        dimensionName: '',
        value: 'pwm',
        displayText: 'PWM',
      },
      {
        dimensionName: '',
        value: 'uc',
        displayText: 'PFM',
      },
      {
        dimensionName: '',
        value: 'ayco',
        displayText: 'AYCO',
      },
      {
        dimensionName: '',
        value: 'tpd',
        displayText: '3rd-Party Distributor',
      },
    ],
    'research|analystRecommendationsMuni|recommendations.ISSUER_TIER': [
      {
        dimensionName: '',
        value: 'Tier 0',
        displayText: 'Tier 0',
      },
      {
        dimensionName: '',
        value: 'Tier 1',
        displayText: 'Tier 1',
      },
      {
        dimensionName: '',
        value: 'Tier 2',
        displayText: 'Tier 2',
      },
      {
        dimensionName: '',
        value: 'Tier 3',
        displayText: 'Tier 3',
      },
    ],
    [COVERAGE_GROUP_DIMENSION]: [
      {
        dimensionName: '',
        value: FI_CORPS_KEY,
        displayText: 'FI Corporates',
      },
      {
        dimensionName: '',
        value: 'EMERGING_MARKET',
        displayText: 'Emerging Market',
      },
      {
        dimensionName: '',
        value: 'HIGH_YIELD',
        displayText: 'High Yield',
      },
      {
        dimensionName: '',
        value: 'INVESTMENT_GRADE',
        displayText: 'Investment Grade',
      },
      {
        dimensionName: '',
        value: 'FI_MUNI',
        displayText: 'Municipal',
      },
    ],
  };

  constructor(readonly changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateQueryFieldCssClasses(false);
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);
    this.queryfieldClasses = GsQueryFieldStyles.mount(this, { searchHidden: false });

    this.filtersUpdated$.pipe(debounceTime(100)).subscribe(async ({ predicate, filter }) => {
      if (!predicate.leftOperand) {
        return;
      }

      // find from dimensions
      const dimension = this.dimensions.find((_dimension) => _dimension.name === predicate.leftOperand);
      if (!dimension) {
        return;
      }

      // reset to empty list if filter is blank
      if (!filter.value || filter.value.length < 2) {
        this.dimensionValues = [];

        return;
      }

      this.dimensionValues = await lastValueFrom(this.fetchDimensionValues ? this.fetchDimensionValues({ predicate, filter }) : of([]));
    });

    this.debounceFiltersChanged$.pipe(debounceTime(100)).subscribe((filter) => this.filtersChanged.next(filter));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allowedDimensions) {
      this.processAllowedDimensions(changes.allowedDimensions.currentValue as FilterBarComponent['allowedDimensions']);
    }

    if (changes.queryfieldPredicates) {
      this.predicates = changes.queryfieldPredicates.currentValue.predicates;
    }
  }

  ngOnDestroy(): void {
    overrideStyleSheet.unmount(this);
    GsQueryFieldStyles.unmount(this);
    this.debounceFiltersChanged$.complete();
    this.filtersUpdated$.complete();
  }

  updateQueryFieldCssClasses(visible: boolean): void {
    this.allowFreeTextPredicate = visible;

    if (this.queryfieldClasses) {
      GsQueryFieldStyles.unmount(this);
    }

    this.queryfieldClasses = GsQueryFieldStyles.mount(this, { searchHidden: !this.allowFreeTextPredicate });
  }

  onQueryChange = ({ changeCode, predicates, filter, currentPredicate }: QueryChangeEvent): DimensionValueConfig[] => {
    const metricsDimensionConfig = this.metricsDimensionConfig.find((d) => d.dimension.field === currentPredicate.leftOperand);
    const customQueryfieldInput = metricsDimensionConfig?.column.columnProperties.customFilterInput ? metricsDimensionConfig?.dimension.type : undefined;
    this.customDimensionConfig = metricsDimensionConfig?.column.columnProperties.customDimensionConfig ?? {};
    this.customQueryfieldInput = currentPredicate.operator ? customQueryfieldInput : undefined;

    this.selectedOperator = currentPredicate.operator;

    if (
      (['updateCurrentPredicate', 'removePill'].includes(changeCode) && !isEqual(this.predicates, predicates) && !currentPredicate.leftOperand) ||
      (changeCode === 'updateFilter' && !predicates.length && this.predicates?.length)
    ) {
      const fiCorpsPredicate = predicates.find((predicate) => predicate.leftOperand === COVERAGE_GROUP_DIMENSION && predicate.rightOperand === FI_CORPS_KEY);

      if (fiCorpsPredicate) {
        const coverageGroupPredicates = predicates.filter((predicate) => predicate.leftOperand === COVERAGE_GROUP_DIMENSION);

        const currentDeskValues = coverageGroupPredicates.map((predicate) => predicate.rightOperand);
        this.corporateDesks.forEach((desk) => {
          if (!currentDeskValues.includes(desk)) {
            predicates.push({
              leftOperand: COVERAGE_GROUP_DIMENSION,
              operator: AllowedDimensionsOperators.equals,
              rightOperand: desk,
            } as PredicateInQueryWithID);
          }
        });

        this.predicates = predicates.filter((predicate) => predicate !== fiCorpsPredicate);
      } else {
        this.predicates = predicates;
      }

      this.debounceFiltersChanged$.next(this.predicates);
    }

    if (changeCode === 'updateCurrentPredicate' && currentPredicate.leftOperand && currentPredicate.operator) {
      if ([AllowedDimensionsOperators.blank, AllowedDimensionsOperators.notBlank].includes(currentPredicate.operator as AllowedDimensionsOperators)) {
        setTimeout(() => {
          if (currentPredicate.leftOperand) {
            this.queryfield.dimensionValues = [];
            this.queryfield.handleQueryFieldKeyDown({ keyCode: 13, which: 13 } as KeyboardEvent);
          }
        }, 10);

        return [];
      }

      if (currentPredicate.rightOperand) {
        this.predicates = predicates;
        this.debounceFiltersChanged$.next(this.predicates);
      }
    }

    // GS QueryField doesn't support async or remote data fetching so we have to conform to its standard whilst sending async requests off afterwards
    if (changeCode === 'updateFilter') {
      const predicate = currentPredicate as CurrentPredicateOptions & { leftOperand: string };
      const dimension = this.dimensions.find((d) => d.name === predicate.leftOperand) || { name: '', dataType: undefined, type: AllowedDimensionTypes.CUSTOM };

      // hardcoded options for UI to move to config in 2024
      if (this.predefinedOptions[dimension.name]) {
        this.updateQueryFieldCssClasses(false);
        this.dimensionValues = this.predefinedOptions[dimension.name].map((dimensionConfig) => ({ ...dimensionConfig, dimensionName: predicate.leftOperand }));

        return this.dimensionValues;
      }

      if (dimension.dataType !== 'autocomplete') {
        this.updateQueryFieldCssClasses(false);
      } else {
        this.updateQueryFieldCssClasses(true);
        this.filtersUpdated$.next({ predicate, filter });
      }

      if (dimension.type === AllowedDimensionTypes.BOOLEAN) {
        this.dimensionValues = [
          {
            dimensionName: predicate.leftOperand,
            value: 'true',
            displayText: 'Yes',
          },
          {
            dimensionName: predicate.leftOperand,
            value: 'false',
            displayText: 'No',
          },
        ];
      }
    }

    // Always return dimensionValues:
    return this.dimensionValues;
  };

  updateCurrentPredicate(type: AllowedDimensionTypes, value: string): void {
    let rightOperand: string | { operand1: { value: string; displayText: string }; operand2: { value: string; displayText: string } } = value;

    if (this.selectedOperator === AllowedDimensionsOperators.between && type === AllowedDimensionTypes.DATE) {
      const dates = value.split(' to ');
      rightOperand = {
        operand1: {
          value: dates[0],
          displayText: dates[0],
        },
        operand2: {
          value: dates[1],
          displayText: dates[1],
        },
      };
    }

    this.queryfield.updateFilter({
      value: '',
    });
    this.queryfield.updateCurrentPredicate({ rightOperand });
  }

  private processAllowedDimensions(dimensions: FilterBarComponent['allowedDimensions']): void {
    this.metricsDimensionConfig = dimensions;
    this.dimensions = dimensions.map(({ dimension, column }) => {
      const operators: { name: string; displayText: string }[] = [];

      //TODO: Add new case here for custom dimension type 'GSH'
      switch (dimension.type) {
        case AllowedDimensionTypes.TEXT:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: 'equals',
            },
            {
              name: AllowedDimensionsOperators.contains,
              displayText: 'contains',
            },
            {
              name: AllowedDimensionsOperators.notEqual,
              displayText: 'does not equal',
            },
            {
              name: AllowedDimensionsOperators.blank,
              displayText: AllowedDimensionsOperators.blank,
            },
            {
              name: AllowedDimensionsOperators.notBlank,
              displayText: AllowedDimensionsOperators.notBlank,
            },
          );
          break;

        case AllowedDimensionTypes.NUMBER:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: AllowedDimensionsOperators.equals,
            },
            {
              name: AllowedDimensionsOperators.lessThan,
              displayText: AllowedDimensionsOperators.lessThan,
            },
            {
              name: AllowedDimensionsOperators.greaterThan,
              displayText: AllowedDimensionsOperators.greaterThan,
            },
            {
              name: AllowedDimensionsOperators.between,
              displayText: AllowedDimensionsOperators.between,
            },
            {
              name: AllowedDimensionsOperators.atLeast,
              displayText: AllowedDimensionsOperators.atLeast,
            },
            {
              name: AllowedDimensionsOperators.atMost,
              displayText: AllowedDimensionsOperators.atMost,
            },
            {
              name: AllowedDimensionsOperators.blank,
              displayText: AllowedDimensionsOperators.blank,
            },
            {
              name: AllowedDimensionsOperators.notBlank,
              displayText: AllowedDimensionsOperators.notBlank,
            },
          );
          break;
          case AllowedDimensionTypes.BOOLEAN:
          case AllowedDimensionTypes.GSHLEVEL:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: 'equals',
            },
            {
              name: AllowedDimensionsOperators.notEqual,
              displayText: 'does not equal',
            },
          );
          break;

        case AllowedDimensionTypes.DATE:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: AllowedDimensionsOperators.equals,
            },
            {
              name: AllowedDimensionsOperators.before,
              displayText: AllowedDimensionsOperators.before,
            },
            {
              name: AllowedDimensionsOperators.after,
              displayText: AllowedDimensionsOperators.after,
            },
            {
              name: AllowedDimensionsOperators.between,
              displayText: AllowedDimensionsOperators.between,
            },
          );
          break;

        case AllowedDimensionTypes.CUSTOM:
          // add condition on custom field being gsh
          operators.push({
            name: AllowedDimensionsOperators.equals,
            displayText: AllowedDimensionsOperators.equals,
          });
          break;
        default:
          break;
      }

      return {
        name: dimension.field,
        viewConfig: {
          displayText: column.headerName,
        },
        type: dimension.type,
        operators,
        dataType: dimension.autocomplete ? 'autocomplete' : 'fixed',
      };
    });
  }
}




<gs-queryfield [classes]="queryfieldClasses" placeholder="Search..." [dimensions]="dimensions"
    [dimensionValues]="dimensionValues" [autoSelectSingleOperator]="true" [onQueryChange]="onQueryChange"
    [maxOptionsToDisplay]="15" [disableCreatePillOnSpace]="true" [throttleWait]="0"
    [predicates]="queryfieldPredicates" [sortDropdownItems]="false" [clearable]="true">
    <gs-queryfield-custom-input *ngIf="queryFieldCustomInput" >
        <input data-input placeholder="search value..." type="text" name="date" inputId="text-input"
                className="free-input" gsPopover [gsPopoverBody]="selector" gsPopoverClass="metrics-container__light-popover" [gsPopoverClasses]="{ content: overrideClasses.selectorPopover }" [gsPopoverShowTip]="false"
                gsPopoverPlacement="bottom-left"/>
    </gs-queryfield-custom-input>
</gs-queryfield>
