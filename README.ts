/* eslint-disable max-lines */
import { Actions } from '@ngrx/effects';
import { AlertModule } from '@gs-ux-uitoolkit-angular/alert';
import { AllModules } from '@gs-ux-uitoolkit-angular/datagrid-modules';
import { ButtonComponent, ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { catchError, finalize, NEVER, Subject, takeUntil } from 'rxjs';
import {
  clone,
  compact,
  every,
  find,
  findIndex,
  first,
  flatten,
  get,
  groupBy,
  intersection,
  isEqual,
  isEqualWith,
  join,
  keyBy,
  keys,
  last,
  map,
  reduce,
  some,
  uniq,
  uniqBy,
} from 'lodash-es';
import {
  ColDef,
  ColGroupDef,
  ColumnState,
  DataGridApi,
  DataGridModule,
  DataGridState,
  Events,
  GetRowIdParams,
  GridOptions,
  GSNumberFloatingFilter,
  ICellRendererParams,
  IRowNode,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  ModelUpdatedEvent,
  RegistryAndStoreContextArgs,
  RowNode,
  ValueFormatterFunc,
  ValueFormatterParams,
  ValueGetterParams,
} from '@gs-ux-uitoolkit-angular/datagrid';
import { colors } from '@gs-ux-uitoolkit-common/design-system';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import { DataToolbarModule } from '@gs-ux-uitoolkit-angular/datatoolbar';
import { DateTime, Duration } from 'luxon';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { LabelModule } from '@gs-ux-uitoolkit-angular/label';
import { lightTheme } from '@gs-ux-uitoolkit-common/theme';
import { LoadingModule } from '@gs-ux-uitoolkit-angular/loading';
import { MenuBlurEvent, MenuModule } from '@gs-ux-uitoolkit-angular/menu';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Popover, PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { PredicateInQuery, PredicateInQueryWithID, QueryfieldPredicateConfig } from '@gs-ux-uitoolkit-angular/queryfield';
import { select, Store } from '@ngrx/store';
import { ThemeModule } from '@gs-ux-uitoolkit-angular/theme';

import { AggregationFieldType, BucketGroupFilterModel, BucketGrouping, Column, ColumnCategories, ColumnPacket, RowGroupAggField } from '@gsam-fi/grids/typings';
import { FIConstants, GsAnalyticsActions, GsAnalyticsProperties, GsAnalyticsService } from '@gsam-fi/common';
import { FiGridControlsModule, GroupByOption } from '@gsam-fi/grids/angular';
import { FiPixels } from '@gsam-fi/common/design-system';

import {
  AgGridAllowedDimensionsOperatorsTranslation,
  ALLOWED_DIMENSIONS_SEPARATOR,
  AllowedDimension,
  AllowedDimensionsOperators,
  AllowedDimensionsOperatorsAgGridTranslation,
  AllowedDimensionTypes,
  DashboardDatasets,
  DashboardType,
} from '../typings/saved-dashboards.typings';
import { AnalyticsEvents, AnalyticsProperties, AnalyticsToggleState } from '../../analytics.events';
import { ColumnPickerComponent } from '../column-picker/column-picker.component';
import { ESGMetricsService } from '../esg-dashboard/esg-metrics.service';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { formatDecimals, formatNegatives, getColumnByIdentifier, recurseColumnFields, stripingColumnHeader } from '../helpers/grid.helper';
import { getGridSettingsInSession } from '../store/selectors/grid-settings.selectors';
import { getPlatformExposureInf, getProductsInf } from '../store/selectors/positions-grid-configuration.selectors';
import { GridSettingsComponent } from '../global-settings/grid-settings/grid-settings.component';
import { GridSettingsState } from '../typings/grid-settings.typing';
import { IncludeBenchmarksComponent } from '../include-benchmarks/include-benchmarks.component';
import { MetricDropdownModule } from '../metric-dropdown/metric-dropdown.module';
import { MetricsBucket } from '../typings/buckets.typings';
import { MetricsLabels, MetricSource, MetricsPnLLabels } from '../typings/metrics.typings';
import { PartialServerColDef, PositionalColumn } from '../typings/positions-grid.typings';
import { PositionsService } from '../services/positions.service';
import { ProductsPayload } from '../typings/products-service.typings';
import { shouldBlurElementBeVisible } from '../helpers/gs-button.helper';
import { Source, SourceType } from '../global-settings/account-groups/account-groups.typings';
import { ViewsService } from '../services/views.service';
import { ViewState } from '../typings/views.typings';

const overrideStyleSheet = new StyleSheet('products-grid-popover-styles', {
  settingsPopover: {
    paddingLeft: FiPixels.TWELVE,
    paddingRight: FiPixels.TWELVE,
    paddingTop: FiPixels.TWELVE,
    paddingBottom: FiPixels.SIXTEEN,
    backgroundColor: colors.white,
  },
});

const positioningColumnSet = { categoryId: 'accountPositioning', packetId: 'accountPositioning' };
const defaultColumnPackets: { categoryId: string; packetId: string; columns?: string[] }[] = [
  { categoryId: 'productIdentifiers', packetId: 'productIdentifiers', columns: ['LongDescription', 'BBTicker'] },
  positioningColumnSet,
  { categoryId: 'basicAttributes', packetId: 'econData' },
  { categoryId: 'basicAttributes', packetId: 'bondCharacteristics' },
];
const platformExposureColumnPackets: { categoryId: string; packetId: string; columns?: string[] }[] = [
  { categoryId: 'identifiers', packetId: 'identifiers', columns: ['LongDescription'] },
  { categoryId: 'basicAttributes', packetId: 'econData' },
  { categoryId: 'accountNonFinancials', packetId: 'bondCharacteristics' },
];
const TOTALS = 'TOTALS';

@Component({
  selector: 'metrics-products-grid',
  imports: [
    AlertModule,
    ButtonModule,
    CommonModule,
    DataGridModule,
    DataToolbarModule,
    FiGridControlsModule,
    FormsModule,
    IconModule,
    LabelModule,
    LoadingModule,
    NgbModalModule,
    MetricDropdownModule,
    MenuModule,
    PopoverModule,
    ThemeModule,

    ColumnPickerComponent,
    FilterBarComponent,
    GridSettingsComponent,
    IncludeBenchmarksComponent,
  ],
  templateUrl: './products-grid.component.html',
  styleUrl: './products-grid.component.scss',
  standalone: true,
})
export class ProductsGridComponent implements OnInit, OnChanges, OnDestroy {
  @Input() accountGroups: Record<string, Source[]> = {};
  @Input() allowColumnSelection = false;
  @Input() allowFilterBar = true;
  @Input() allowMetricsSelection = false;
  @Input() availableMetrics: MetricsBucket[] = [];
  @Input() drillDownDefinition!: Column['drillDownDefinition'];
  @Input() filters: PredicateInQueryWithID[] = [];
  @Input() generateAvailableMetrics = false;
  @Input() gridSettings: GridSettingsState = {};
  @Input() isDrillDown = false;
  @Input() selectedDatasets: DashboardDatasets | undefined = { accounts: [], accountGroups: [], analysts: [], benchmarks: [] };
  @Input() selectedMetrics: Record<string, { sources: MetricSource['fieldName'][]; fields: RowGroupAggField['displayName'][] }> = {
    sizingAndContribution: { sources: ['act', 'net'], fields: ['MV %'] },
    profitAndLoss: { sources: [], fields: [] },
  };
  @Input() selectedPositioningColumns: PositionalColumn[] = [];
  @Input() showIncludeBenchmarksToggle = true;
  @Input() predicates: PredicateInQueryWithID[] = [];
  @Input() provideSpaceForFullScreenToggle = false;
  @Input() view!: ViewState | undefined;
  @ViewChild('toggleSettings', { read: Popover }) settingsPopover!: Popover;
  @ViewChild('filterBar', { read: ElementRef, static: false }) filterBar!: ElementRef<HTMLDivElement>;
  allowGrouping = false;
  availablePnL: RowGroupAggField[] = [];
  dataGridApi!: DataGridApi;
  datagridModules = AllModules;
  loading = false;
  errorCode = 0;
  errorMessage = '';
  filterBarActive = true;
  filterOptions: { dimension: AllowedDimension; column: Column }[] = [];
  filterPredicates: QueryfieldPredicateConfig[] = [];
  registryAndStore!: RegistryAndStoreContextArgs;
  defaultGridState: Partial<DataGridState> = {
    zebraStripes: {
      stripeInterval: 0,
    },
  };
  groupByTitle = false;
  lightTheme = lightTheme;
  overrideClasses!: CssClasses<typeof overrideStyleSheet>;
  processedExportRows = 0;
  exportInProgress = false;
  heldOnlyProducts = true;
  includeBenchmarkWeights = true;
  columnCatalogue: ColumnCategories[] = [];
  columnMenuVisible = false;
  gridReady = false;
  groupByOptions: (GroupByOption & { bucketGrouping?: BucketGrouping })[] = [];
  totalRows = 0;
  datasource: IServerSideDatasource = {
    // eslint-disable-next-line complexity
    getRows: (params) => {
      const INITIAL_ROW_GROUPS = ['GSHLevel1'];
      const invest1Ids = uniq(compact(map(this.processGroupsInPositioningColumns(this.selectedPositioningColumns), 'value')));
      this.errorCode = 0;
      if ((every(this.selectedDatasets, (dataset) => dataset.length === 0) && !this.predicates.length) || !this.view) {
        this.totalRows = 0;
        params.fail();

        return;
      }

      let rowGroupAggs: Partial<RowGroupAggField>[] = [];
      const nonVisibleColumns: (string | undefined)[] = [...this.idColumns];

      if (
        this.allowMetricsSelection &&
        some(Object.values(this.selectedMetrics), (selectedMetric) => selectedMetric.fields?.length && selectedMetric.sources?.length)
      ) {
        rowGroupAggs = this.positionsService.generateInvest1IdRowGroupAggs(invest1Ids, this.selectedMetrics, this.availableMetrics);
      }

      if (this.generateAvailableMetrics) {
        const selectedMetrics = this.availableMetrics.reduce(
          (previousValue: Record<string, { sources: MetricSource['fieldName'][]; fields: RowGroupAggField['displayName'][] }>, currentValue) => {
            if (!previousValue[currentValue.id]) {
              previousValue[currentValue.id] = {
                fields: currentValue.fields.map((field) => field.displayName),
                sources: currentValue.sources.map((source) => source.fieldName),
              };
            }

            return previousValue;
          },
          {},
        );
        rowGroupAggs = this.positionsService.generateRowGroupAggs(selectedMetrics, this.availableMetrics);
      }

      rowGroupAggs.forEach((rowGroupAgg) => {
        nonVisibleColumns.push(rowGroupAgg.weightedFieldName, rowGroupAgg.weightedFieldToScaleBy, rowGroupAgg.fieldName);
      });

      const bucketGrouping = reduce(
        this.selectedGroupByOptions,
        (runningBucketGrouping: Record<string, BucketGrouping>, currentGrouping) => {
          const groupOption = find(this.groupByOptions, { value: currentGrouping.value });

          if (groupOption?.bucketGrouping) {
            runningBucketGrouping[groupOption.bucketGrouping.bucketedField] = groupOption.bucketGrouping;
          }

          return runningBucketGrouping;
        },
        {},
      );

      const rowGroups = INITIAL_ROW_GROUPS.concat(
        map(this.selectedGroupByOptions, (currentGrouping) => {
          const groupOption = find(this.groupByOptions, { value: currentGrouping.value });

          if (groupOption?.bucketGrouping) {
            return groupOption.bucketGrouping.bucketedField;
          }

          return currentGrouping.value;
        }),
      );

      nonVisibleColumns.push(...rowGroups);

      if (this.selectedGroupByOptions.length && !params.request.sortModel?.length && params.request.groupKeys?.length) {
        // row groups will always be at least 1 due to TOTALS, we minus 1 to take it back to the user selected options length
        const groupingLevel = params.request.groupKeys.length - 1;

        if (this.selectedGroupByOptions[groupingLevel]) {
          params.request.sortModel = [
            {
              colId: this.selectedGroupByOptions[groupingLevel].value,
              sort: 'asc',
            },
          ];
        }
      }

      const datasets: DashboardDatasets = this.selectedDatasets || { accounts: [], accountGroups: [], benchmarks: [], analysts: [] };
      const investOneAccounts = datasets.accounts.map((account) => account.value ?? account.invest1Id);

      if (this.selectedDatasets?.accountGroups.length) {
        const accounts = this.selectedDatasets?.accountGroups.map((group) => this.accountGroups[group.uuid]).flat();
        accounts.forEach((source) => {
          investOneAccounts.push(source.value);
        });
      }

      if (this.predicates.length) {
        const filterModel = this.buildPredicatesFilterModel(this.predicates);
        nonVisibleColumns.push(...Object.keys(filterModel));
        params.request.filterModel= {...params.request.filterModel, ...filterModel};
      }

      const payload: ProductsPayload = {
        datasets,
        investOneAccounts,
        investOnePositioningColumns: this.processGroupsInPositioningColumns(this.selectedPositioningColumns).map((column) => column.value),
        columns: [],
        rowGroups: this.allowGrouping && !this.exportInProgress ? rowGroups : INITIAL_ROW_GROUPS,
        bucketGrouping: this.allowGrouping && !this.exportInProgress ? bucketGrouping : undefined,
        includeBenchmarkProducts: !this.heldOnlyProducts,
        includeBenchmarkWeights: this.includeBenchmarkWeights || this.isDrillDown,
        includePositions: this.includePositions || this.isDrillDown,
        rowGroupAggs: rowGroupAggs.length ? rowGroupAggs : undefined,
      };

      const totalsRow = !this.exportInProgress && !params.request.groupKeys.length && first(payload.rowGroups) === INITIAL_ROW_GROUPS[0];

      if (this.exportInProgress) {
        params.request.groupKeys = [TOTALS];
      }

      if (this.isDrillDown && this.drillDownDefinition) {
        const { filterModel, orFilterModel, sortModel } = this.drillDownDefinition;

        if (sortModel) {
          params.request.sortModel = sortModel;
        }

        const additionalColumns = [...Object.keys(filterModel || {}), ...Object.keys(orFilterModel || {})];
        nonVisibleColumns.push(...additionalColumns);

        payload.drillDownDefinition = { filterModel, orFilterModel };
      }

      // combine all columns needed
      payload.columns = compact(uniq([...nonVisibleColumns, ...recurseColumnFields(this.gridOptions.api?.getColumnDefs())]));

      if (totalsRow) {
        params.success({
          rowData: [
            {
              ...rowGroupAggs.reduce((columnState: Record<string, string>, rowGroupAgg) => {
                if (!rowGroupAgg.aggFieldName) {
                  return columnState;
                }

                columnState[rowGroupAgg.aggFieldName] = 'Loading...';

                return columnState;
              }, {}),
              GSHLevel1: TOTALS,
            },
          ],
          rowCount: 1,
        });
      }

      // get data for request from server
      this.positionsService
        .fetchProducts(payload, params, this.view)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.totalRows = 0;
            this.errorCode = error.status;
            this.errorMessage = error.error.message;
            this.gridOptions.api?.hideOverlay();
            params.fail();

            return NEVER;
          }),
          takeUntil(this.accountsChanged$),
          finalize(() => {
            if (this.paginationResponse.success) {
              this.gridOptions.api?.hideOverlay();
              this.errorCode = 0;

              if (!this.isPlatformExposure || first(params.request.groupKeys) === TOTALS) {
                this.totalRows = this.paginationResponse.maxResults;

                if (this.totalRows === 0) {
                  this.gridOptions.api?.showNoRowsOverlay();
                }
              }

              if (this.isPlatformExposure && !params.request.groupKeys.length) {
                this.paginationResponse.rowData = this.paginationResponse.rowData.map((rowData) => {
                  // for platform exposure the overall MV% is not a useful number as there's no concept of the whole of AM's Market Value
                  // so we strip it out from the TOTALS row as below
                  rowData['marketValueWeight'] = undefined;
                  rowData['netTradeDateMktValueBase'] = undefined;

                  return rowData;
                });
              }

              if (totalsRow) {
                params.api.getRowNode(`${TOTALS}-0`)?.updateData(this.paginationResponse.rowData[0]);
              } else {
                params.success({
                  rowData: this.paginationResponse.rowData,
                  rowCount: this.paginationResponse.currentSize,
                });
              }
            } else {
              this.errorCode = 500;
              this.gridOptions.api?.hideOverlay();
              params.fail();
            }
          }),
        )
        .subscribe((response) => {
          this.paginationResponse = response;
        });
    },
  };
  gridOptions: GridOptions = {
    rowModelType: 'serverSide',
    rowBuffer: 0,
    cacheBlockSize: 250,
    blockLoadDebounceMillis: 100,

    defaultColDef: {
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['apply', 'clear'],
        closeOnApply: true,
        maxNumConditions: 10,
        numAlwaysVisibleConditions: 3,
      },
      floatingFilter: true,
      sortable: true,
      resizable: true,
      sortingOrder: ['desc', 'asc', null],
      suppressMovable: true,
      lockPinned: true,
    },
    components: {
      gsNumberFloatingFilter: GSNumberFloatingFilter,
    },
    serverSideSortAllLevels: true,
    serverSideFilterAllLevels: true,
    suppressFieldDotNotation: true,
    suppressDragLeaveHidesColumns: true,
    getRowId: (params: GetRowIdParams<Record<string, string>, unknown>) => {
      const parentKeysJoined: (string | undefined)[] = params.parentKeys || [];
      const rowGroupCols = params.columnApi.getRowGroupColumns();

      if (rowGroupCols[params.level]) {
        const thisGroupCol = rowGroupCols[params.level].getColDef().field || '';
        const bucketedField = this.findBucketedField(thisGroupCol);
        parentKeysJoined.push(params.data[bucketedField ?? thisGroupCol]);
      }

      const leafLevel: string[] = this.idColumns.map((col) => params.data[col]);
      parentKeysJoined.push(...leafLevel, params.level.toString());

      return compact(parentKeysJoined).join('-');
    },
    onRowGroupOpened: (event) => {
      if (!event.node.key) {
        return;
      }

      const key = this.recurseParentLevels(event.node);
      this.rowExpandedStates[key] = event.expanded;
      const eventName = event.expanded ? AnalyticsEvents.EXPAND_GROUP : AnalyticsEvents.COLLAPSE_GROUP;

      // if there is an actual event property we know this is user-driven and needs to be logged
      // this stops us logging a call for every grid interaction due to us expanding GSHLevel1 by default
      if (event.event) {
        const { dashboardId, id, type } = this.view || {};
        this.analytics.event(eventName, {
          [AnalyticsProperties.ROW_GROUP]: key,
          [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
          [AnalyticsProperties.DASHBOARD_TYPE]: type,
          [AnalyticsProperties.VIEW_ID]: id,
        });
      }
    },
    isServerSideGroupOpenByDefault: (params) => {
      if (!params.rowNode.key) {
        return false;
      }

      const key = this.recurseParentLevels(params.rowNode);
      const isExpanded = !this.exportInProgress && this.rowExpandedStates[key];
      delete this.rowExpandedStates[key];

      return isExpanded || params.rowNode.field === 'GSHLevel1';
    },
    onColumnMoved: () => {
      this.gridOptions.api?.refreshHeader();
    },
    onDragStopped: (params) => {
      console.log('params::', params);
      this.viewsService.updateView(this.view, 'columnState', params.columnApi.getColumnState());
    },
    onSortChanged: (params) => {
      if (!this.sortModelSetViaApi) {
        const columnState = params.columnApi.getColumnState();
        const sortedColumns = columnState.filter((col) => col.sort);

        this.analytics.event(AnalyticsEvents.SORT_GRID, {
          [AnalyticsProperties.SORTED_COLUMNS]: sortedColumns.map((col) => col.colId),
          [AnalyticsProperties.SORT_ORDER]: sortedColumns.map((col) => col.sort),
        });
        this.viewsService.updateView(this.view, 'columnState', columnState);
      }

      this.sortModelSetViaApi = false;
    },
    onFilterChanged: (params) => {
      if (!this.filterModelSetViaApi) {
        const model = params.api.getFilterModel();
        const modelKeys = Object.keys(model);
        let id = 0;

        const clearing = !modelKeys.length && this.filters.length > 0;
        const newFilters = modelKeys
          .map((field) => {
            const filters: PredicateInQueryWithID[] = [];

            if (model[field].conditions?.length) {
              const conditions: PredicateInQueryWithID[] = model[field].conditions.map((condition: BucketGroupFilterModel) => {
                if (!condition.type) {
                  return undefined;
                }

                return {
                  id: id++,
                  leftOperand: field,
                  rightOperand: condition.filter ?? '',
                  operator: AgGridAllowedDimensionsOperatorsTranslation[condition.type],
                };
              });
              filters.push(...compact(conditions));
            } else {
              id++;

              filters.push({
                id,
                leftOperand: field,
                rightOperand: model[field].filter ?? '',
                operator: AgGridAllowedDimensionsOperatorsTranslation[model[field].type],
              });
            }

            return filters;
          })
          .flat();

        this.saveFiltersToView(this.filters, newFilters, { clearing, afterFloatingFilter: params.afterFloatingFilter });
        this.filters = newFilters;

        const predicatesAsObject = groupBy(this.filters, 'leftOperand') || {};
        this.filterPredicates = Object.keys(predicatesAsObject).map((dimensionName) => {
          return { dimensionName, predicates: predicatesAsObject[dimensionName] };
        });

        this.lastFilterModel = model;
      }

      this.filterModelSetViaApi = false;
    },
    suppressCsvExport: true,
    suppressExcelExport: true,
  };
  selectedGroupByOptions: GroupByOption[] = [];
  selectedMetric!: MetricsBucket | undefined;
  selectedColumns: { categoryId: string; packetId: string; columns?: string[] }[] = [];
  initiated = false;
  isPlatformExposure = false;
  zebraStriping: boolean | undefined;

  private accountsChanged$: Subject<boolean> = new Subject();
  private allowedDimensions: AllowedDimension[] = [];
  private autoGroupColumnDef = {
    flex: undefined,
    pinned: true,
    headerName: 'Grouping',
    headerClass: `products-grid__group-column`,
    menuTabs: [],
    suppressAutoSize: true,
    suppressSizeToFit: true,
  };
  private destroy$: Subject<boolean> = new Subject();
  private filterModelSetViaApi = false;
  private fitColumnsToSize: boolean | undefined;
  private idColumns: string[] = [];
  private includePositions = true;
  private lastFilterModel!: Record<string, any>;
  private negativesInRed: boolean | undefined;
  private paginationResponse: { currentSize: number; maxResults: number; success: boolean; rowData: Record<string, unknown>[]; forbidden: object } = {
    currentSize: 0,
    maxResults: 0,
    success: false,
    rowData: [],
    forbidden: {},
  };
  private partialColumns!: Column[];
  private rowExpandedStates: Record<string, boolean> = {};
  private sortModelSetViaApi = false;

  constructor(
    @Inject(LOCALE_ID) public defaultLocale: string,
    private readonly actions$: Actions,
    private analytics: GsAnalyticsService,
    private esgMetricsService: ESGMetricsService,
    private modalService: NgbModal,
    private positionsService: PositionsService,
    private readonly store$: Store,
    private viewsService: ViewsService,
  ) {}

  ngOnInit(): void {
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);

    this.store$.pipe(select(getGridSettingsInSession), takeUntil(this.destroy$)).subscribe((state) => {
      if (this.zebraStriping !== state.zebraStriping) {
        if (state.zebraStriping) {
          if (this.initiated) {
            this.dataGridApi.setRowStripeInterval(1);
          } else {
            this.defaultGridState = {
              zebraStripes: {
                stripeInterval: 1,
              },
            };
          }
        } else {
          if (this.initiated) {
            this.dataGridApi.setRowStripeInterval(0);
          }
        }
      }

      this.fitColumnsToSize = state.fitColumnsToSize;
      this.zebraStriping = state.zebraStriping;
      this.negativesInRed = state.negativesInRed;

      if (this.initiated) {
        this.updateColumnDefinitions(this.partialColumns);
      }
    });

    if (!this.view) {
      return;
    }

    this.groupByTitle = this.view.type === DashboardType.ACCOUNT_LED;

    this.isPlatformExposure = this.view.type === DashboardType.PLATFORM_EXPOSURE;
    this.idColumns = this.isPlatformExposure ? ['ProductKey', 'invest1Id', 'accountShortName'] : ['ProductKey'];
    const selector = this.isPlatformExposure ? getPlatformExposureInf : getProductsInf;

    this.store$.pipe(select(selector), takeUntil(this.destroy$)).subscribe((gridConfiguration) => {
      const { categories, metrics, rowGroups } = gridConfiguration;

      // there may be available dimensions too if platform exposure
      if (this.isPlatformExposure) {
        this.allowedDimensions = gridConfiguration.allowedDimensions || [];
      }

      if (!categories.length) {
        return;
      }

      let isDifferent = false;
      this.allowGrouping = !!rowGroups?.length;

      if (this.allowGrouping && !this.isDrillDown) {
        isDifferent = isDifferent || this.groupByOptions.length !== rowGroups.length;
        const i1Group = rowGroups.find((group) => group.value === 'invest1Id');
        this.selectedGroupByOptions = compact(
          this.view?.settings?.groupBy
            ? this.view.settings.groupBy.map((value) => rowGroups.find((group) => group.value === value))
            : this.isPlatformExposure
            ? [i1Group]
            : [],
        );
      }

      this.groupByOptions = rowGroups;
      this.columnCatalogue = categories;
      this.selectedColumns = this.view?.settings?.columns || (this.isPlatformExposure ? platformExposureColumnPackets : defaultColumnPackets);

      if (!this.isDrillDown) {
        this.availableMetrics = this.generateAvailableMetrics
          ? this.positionsService.generateAvailableMetrics(this.selectedColumns, categories, {
              aggregationFieldOverride: AggregationFieldType.PLATFORM_EXPOSURE,
            })
          : metrics;
        this.addPositioningColumnToPicker();
      }

      this.generatePartialColumns(categories);
      this.updateColumnDefinitions(this.partialColumns, !this.isDrillDown ? keyBy(this.view?.settings?.columnState, 'colId') || {} : {});

      if (this.initiated || isDifferent) {
        this.retry();
      }

      this.initiated = true;
    });
  }

  // eslint-disable-next-line complexity
  ngOnChanges(changes: SimpleChanges): void {
    // on view change a few things need resetting to the view config
    if (changes.view && !this.isDrillDown) {
      const prev: ViewState = changes.view.previousValue || {};
      const curr: ViewState = changes.view.currentValue || {};
      let isDifferent = false;

      if (this.allowGrouping) {
        isDifferent = isDifferent || prev.settings?.groupBy?.join(',') !== curr.settings?.groupBy?.join(',');

        if (isDifferent) {
          this.selectedGroupByOptions = compact(
            curr.settings?.groupBy
              ? curr.settings.groupBy.map((value) => this.groupByOptions.find((group) => group.value === value))
              : this.isPlatformExposure
              ? [this.groupByOptions.find((group) => group.value === 'invest1Id')]
              : [],
          );
        }
      }

      if (this.allowColumnSelection) {
        isDifferent = isDifferent || !isEqual(prev.settings?.columns, curr.settings?.columns);

        if (isDifferent) {
          this.selectedColumns =
            curr.settings?.columns || (curr.type !== DashboardType.PLATFORM_EXPOSURE ? defaultColumnPackets : platformExposureColumnPackets);

          if (this.generateAvailableMetrics) {
            this.availableMetrics = this.positionsService.generateAvailableMetrics(this.selectedColumns, this.columnCatalogue, {
              aggregationFieldOverride: AggregationFieldType.PLATFORM_EXPOSURE,
            });
          }

          this.addPositioningColumnToPicker();
        }
      }

      if (this.allowMetricsSelection) {
        isDifferent = isDifferent || !isEqual(prev.settings?.metricsSettings, curr.settings?.metricsSettings);

        if (isDifferent) {
          const settings = curr.settings?.metricsSettings || {};
          const selectedMetrics = ['sizingAndContribution', 'profitAndLoss'].reduce(
            (_selectedMetrics: Record<string, { sources: (keyof typeof MetricsLabels)[]; fields: string[] }>, metricType) => {
              const defaultSources = metricType === 'sizingAndContribution' ? ['act'] : [];
              const defaultMetrics = metricType === 'sizingAndContribution' ? ['MV %'] : [];

              _selectedMetrics[metricType] = {
                sources: settings[metricType]?.sources || defaultSources,
                fields: settings[metricType]?.fields?.map((metric: string) => (metric === 'mv' ? 'MV' : metric)) || defaultMetrics,
              };

              return _selectedMetrics;
            },
            {},
          );

          this.selectedMetrics = selectedMetrics;

          this.includeBenchmarkWeights = !!intersection(curr.settings?.metricsSettings?.sizingAndContribution?.sources, ['bmk', 'net']).length;
          this.includePositions =
            !!curr.settings?.metricsSettings?.sizingAndContribution?.sources.includes('act') && this.selectedPositioningColumns?.length !== 0;
          this.includePositions = !this.includeBenchmarkWeights && !this.includePositions ? true : this.includePositions;
        }
      }

      // check held only flag
      isDifferent = isDifferent || prev.settings?.heldOnly !== curr.settings?.heldOnly;
      isDifferent = isDifferent || prev.query?.riskDate !== curr.query?.riskDate;
      isDifferent = isDifferent || prev.query?.asOfTime !== curr.query?.asOfTime;
      this.heldOnlyProducts = curr.settings?.heldOnly !== undefined ? curr.settings?.heldOnly : this.heldOnlyProducts;

      // if this is a product dash we need to re-run the columns
      if (isDifferent || prev.id !== curr.id) {
        this.generatePartialColumns(this.columnCatalogue);
        this.updateColumnDefinitions(this.partialColumns, keyBy(curr.settings?.columnState, 'colId') || {});

        if (this.initiated) {
          this.accountsChanged$.next(true);
          this.retry();
        }
      }
    }

    if (!isEqual(changes.selectedDatasets?.previousValue, changes.selectedDatasets?.currentValue)) {
      this.updateColumnDefinitions(this.partialColumns, keyBy(this.view?.settings?.columnState, 'colId') || {});
      const previousAccount = { ...changes.selectedDatasets?.previousValue?.accounts[0] };
      const currentAccount = { ...changes.selectedDatasets?.currentValue?.accounts[0] };

      // if dataset has changed and account is not 360 OR 360 dataset is more than just a short name change refresh the grid
      if (
        this.view?.type !== DashboardType.THREE_SIXTY ||
        !isEqualWith(previousAccount, currentAccount, (prevAcc, currAcc) => {
          if (prevAcc) {
            return prevAcc.invest1Id === currAcc.invest1Id && prevAcc.asOfTime === currAcc.asOfTime;
          } else {
            return false;
          }
        })
      ) {
        this.accountsChanged$.next(true);
        this.retry();
      }
    }

    if (
      this.view?.type !== DashboardType.THREE_SIXTY &&
      changes.selectedPositioningColumns?.previousValue !== changes.selectedPositioningColumns?.currentValue
    ) {
      this.accountsChanged$.next(true);
      this.updateColumnDefinitions(this.partialColumns, !this.isDrillDown ? keyBy(this.view?.settings?.columnState, 'colId') || {} : {});
      this.retry();
    }

    if (changes.predicates && !isEqual(changes.predicates.previousValue, changes.predicates.currentValue) && this.initiated) {
      this.accountsChanged$.next(true);
      this.retry();
    }

    if (this.isDrillDown) {
      if (changes.selectedMetrics) {
        this.selectedMetric = find(this.availableMetrics, { id: first(keys(changes.selectedMetrics.currentValue)) });
      }

      if (changes.availableMetrics) {
        this.selectedMetric = find(changes.availableMetrics.currentValue, { id: first(keys(this.selectedMetrics)) });
      }

      if (changes.selectedMetrics || changes.availableMetrics || changes.drillDownDefinition) {
        this.updateColumnDefinitions(this.partialColumns);
      }

      if ((changes.drillDownDefinition || changes.view?.previousValue?.query?.riskDate !== changes.view?.currentValue?.query?.riskDate) && this.initiated) {
        this.accountsChanged$.next(true);
        this.retry();
      }
    }
  }

  ngOnDestroy(): void {
    overrideStyleSheet.unmount(this);
    this.accountsChanged$.next(true);
    this.destroy$.next(true);

    this.accountsChanged$.complete();
    this.destroy$.complete();
  }

  retry(): void {
    this.gridOptions.api?.refreshServerSide({ purge: true });
  }

  blur($event: MenuBlurEvent | FocusEvent, dropdownButtonRef: ButtonComponent): void {
    this.columnMenuVisible = shouldBlurElementBeVisible(this.columnMenuVisible, $event, dropdownButtonRef);
  }

  drillDownMetricChanged($event: MetricsBucket): void {
    this.selectedMetrics = {
      [$event.id]: {
        sources: $event.sources.map((source) => source.fieldName),
        fields: $event.fields.map((field) => field.displayName.toLowerCase()),
      },
    };
    this.selectedMetric = $event;

    this.includeBenchmarkWeights = true;
    this.includePositions = true;
    this.updateColumnDefinitions(this.partialColumns);
    this.retry();
  }

  columnsChanged($event: { categoryId: string; packetId: string; columns?: string[] }[], modal: NgbModalRef): void {
    if (isEqual(this.selectedColumns, $event) || !this.view) {
      modal.close();

      return;
    }

    this.selectedColumns = $event;

    if (!this.isDrillDown) {
      this.viewsService.updateView(this.view, 'columns', $event);
    } else {
      this.generatePartialColumns(this.columnCatalogue);
      this.updateColumnDefinitions(this.partialColumns, keyBy(this.view?.settings?.columnState, 'colId') || {});
      this.retry();
    }

    modal.dismiss();
  }

  filtersChanged(predicates: PredicateInQueryWithID[]): void {
    const clearing = this.filters.length > 0 && !predicates.length;
    this.saveFiltersToView(this.filters, predicates, { clearing });
    this.filters = predicates;
    this.setFilterModel(this.filters);
  }

  logAccountColumnsAnalytics(): void {
    const { dashboardId, id, type } = this.view || {};
    this.analytics.event(AnalyticsEvents.OPEN_ACCOUNT_METRICS_COLUMNS_MENU, {
      [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
      [AnalyticsProperties.DASHBOARD_TYPE]: type,
      [AnalyticsProperties.VIEW_ID]: id,
    });
  }

  logGroupByAnalytics(): void {
    const { dashboardId, id, type } = this.view || {};
    this.analytics.event(AnalyticsEvents.OPEN_GROUPING_MENU, {
      [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
      [AnalyticsProperties.DASHBOARD_TYPE]: type,
      [AnalyticsProperties.VIEW_ID]: id,
    });
  }

  metricsChanged($event: Record<string, { sources: (keyof typeof MetricsLabels)[]; fields: (keyof typeof MetricsLabels)[] }>): void {
    if (isEqual(this.selectedMetrics, $event) || !this.view) {
      return;
    }

    this.selectedMetrics = $event;

    if (!this.isDrillDown) {
      this.viewsService.updateView(this.view, 'metricsSettings', $event);
    } else {
      this.includeBenchmarkWeights = !!intersection($event.sizingAndContribution.sources, ['bmk', 'net']).length;
      this.includePositions = $event.sizingAndContribution.sources.includes('act');
      this.updateColumnDefinitions(this.partialColumns, keyBy(this.view?.settings?.columnState, 'colId') || {});
      this.retry();
    }
  }

  toggleColumnDropdown(): void {
    this.columnMenuVisible = !this.columnMenuVisible;

    if (this.columnMenuVisible) {
      const { dashboardId, id, type } = this.view || {};
      this.analytics.event(AnalyticsEvents.OPEN_COLUMN_MENU, {
        [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
        [AnalyticsProperties.DASHBOARD_TYPE]: type,
        [AnalyticsProperties.VIEW_ID]: id,
      });
    }
  }

  updateHeldProductsSetting(): void {
    if (!this.view) {
      return;
    }

    if (!this.isDrillDown) {
      this.viewsService.updateView(this.view, 'heldOnly', this.heldOnlyProducts);
    }

    this.analytics.event(AnalyticsEvents.TOGGLE_HELD_ONLY, {
      [AnalyticsProperties.TOGGLE_STATE]: this.filterBarActive ? AnalyticsToggleState.ON : AnalyticsToggleState.OFF,
    });
    this.retry();
  }

  registryAndStoreCall(registryAndStore: RegistryAndStoreContextArgs): void {
    this.registryAndStore = registryAndStore;
  }

  instanceCallBackCall(dataGridApi: DataGridApi): void {
    this.dataGridApi = dataGridApi;
  }

  selectedGroupByOptionsChanged($event: GroupByOption[]): void {
    if (!this.view) {
      return;
    }

    const groupByValues = map($event, 'value');
    const orderOfOldValues = join(groupByValues, ',');
    const orderOfNewValues = join(map(this.selectedGroupByOptions, 'value'), ',');

    if (orderOfOldValues === orderOfNewValues) {
      return;
    }

    if (!this.isDrillDown) {
      this.viewsService.updateView(this.view, 'groupBy', groupByValues);
    }

    this.selectedGroupByOptions = $event;
    this.generatePartialColumns(this.columnCatalogue);
    this.updateColumnDefinitions(this.partialColumns, !this.isDrillDown ? keyBy(this.view?.settings?.columnState, 'colId') || {} : {});
    this.retry();
  }

  setFilterModel(filters: PredicateInQueryWithID[]): void {
    const groupedFilterModel = groupBy(
      filters.map((predicate) => {
        const dimensionConfig = this.filterOptions.find(({ dimension }) => dimension.field === predicate.leftOperand);

        return {
          filterType: dimensionConfig?.dimension.type,
          filter: predicate.rightOperand ?? '',
          type: AllowedDimensionsOperatorsAgGridTranslation[predicate.operator as AllowedDimensionsOperators],
          field: predicate.leftOperand,
        };
      }),
      'field',
    );
    const filterModel = Object.keys(groupedFilterModel).reduce((model: Record<string, any>, field: string) => {
      if (groupedFilterModel[field].length === 1) {
        model[field] = groupedFilterModel[field][0];

        return model;
      }

      // ag-grid supports 2 atm
      const firstCondition = groupedFilterModel[field][0];
      const filter =
        firstCondition.filterType !== AllowedDimensionTypes.DATE
          ? {
              conditions: groupedFilterModel[field],
              filterType: firstCondition.filterType,
              operator: 'OR',
            }
          : {
              filterType: firstCondition.filterType,
              type: firstCondition.type,
              dateFrom: firstCondition.filter,
            };

      model[field] = filter;

      return model;
    }, {});

    this.filterModelSetViaApi = true;
    this.gridOptions.api?.setFilterModel(filterModel);
    this.gridOptions.api?.onFilterChanged();
  }

  toggleFilterBar(): void {
    this.filterBarActive = !this.filterBarActive;
    this.analytics.event(AnalyticsEvents.TOGGLE_FILTER_BAR, {
      [AnalyticsProperties.TOGGLE_STATE]: this.filterBarActive ? AnalyticsToggleState.ON : AnalyticsToggleState.OFF,
    });

    if (this.filterBarActive) {
      setTimeout(() =>
        this.filterBar.nativeElement.getElementsByClassName('gs-queryfield__dimension-predicate-collection-container')[0].dispatchEvent(new Event('click')),
      );
    }
  }

  export(): void {
    if (!this.gridOptions.api || !this.view) {
      return;
    }

    const analyticsStartTimestamp = DateTime.now().valueOf();
    const columns: string[] = [...this.idColumns];
    const params: IServerSideGetRowsParams = {
      request: {
        filterModel: undefined,
      } as IServerSideGetRowsParams['request'],
    } as IServerSideGetRowsParams;

    const datasets: DashboardDatasets = this.selectedDatasets || { accounts: [], accountGroups: [], benchmarks: [], analysts: [] };
    const investOneAccounts = datasets.accounts.map((account) => account.value ?? account.invest1Id);

    if (this.selectedDatasets?.accountGroups.length) {
      const accounts = this.selectedDatasets?.accountGroups.map((group) => this.accountGroups[group.uuid]).flat();
      accounts.forEach((source) => {
        investOneAccounts.push(source.value);
      });
    }

    const formattedDate = this.view.query?.riskDate ?? this.esgMetricsService.defaultDate().toFormat('yyyy-MM-dd');
    const exportParams = {
      columnGroups: true,
      onlySelected: false,
      onlySelectedAllPages: false,
      author: 'AM Fixed Income Portfolio Metrics',
      fileName: `${this.view.name.replace(/\./g, '')} - ${formattedDate}`,
    };

    if (this.predicates?.length) {
      const filterModel = this.buildPredicatesFilterModel(this.predicates);
      columns.push(...Object.keys(filterModel));
      params.request.filterModel = filterModel;
    }

    const payload: ProductsPayload = {
      datasets,
      investOneAccounts,
      investOnePositioningColumns: this.processGroupsInPositioningColumns(this.selectedPositioningColumns).map((column) => column.value),
      columns,
      rowGroups: [],
      bucketGrouping: undefined,
      includeBenchmarkProducts: !this.heldOnlyProducts,
    };

    const gridApi = this.gridOptions.api;
    this.processedExportRows = 0;
    this.exportInProgress = true;
    this.positionsService
      .getTotalRowCountForAccounts(payload, params, this.view)
      .pipe(takeUntil(this.accountsChanged$))
      .subscribe((rowCount) => {
        // hold onto old group state
        const oldColumnState = this.gridOptions.columnApi?.getColumnState();
        this.gridOptions.columnApi?.applyColumnState({ state: map(oldColumnState, (state) => ({ ...state, rowGroup: false })) });
        this.updateColumnDefinitions(this.partialColumns);

        const existingCacheBlockSize = this.gridOptions.cacheBlockSize;
        this.gridOptions.cacheBlockSize = rowCount;

        const onModelUpdated = (modelParams: ModelUpdatedEvent) => {
          const firstRow = modelParams.api.getModel().getRow(0);

          if (firstRow?.data) {
            this.gridOptions.suppressExcelExport = false;
            gridApi.removeEventListener(Events.EVENT_MODEL_UPDATED, onModelUpdated);

            // export
            gridApi.exportDataAsExcel(exportParams);
            gridApi.ensureIndexVisible(0, 'top');

            this.gridOptions.suppressExcelExport = true;

            const responseTime = DateTime.now().valueOf() - analyticsStartTimestamp;
            const { dashboardId, id, type } = this.view || {};

            // analytics
            this.analytics.event(AnalyticsEvents.EXPORT_TO_EXCEL, {
              [AnalyticsProperties.NUM_OF_ACCOUNTS]: investOneAccounts.length,
              [AnalyticsProperties.NUM_OF_ACCOUNT_GROUPS]: datasets.accountGroups?.length || 0,
              [AnalyticsProperties.NUM_OF_ANALYSTS]: datasets.analysts?.length || 0,
              [AnalyticsProperties.NUM_OF_BENCHMARKS]: datasets.benchmarks?.length || 0,
              [AnalyticsProperties.RESPONSE_STATUS]: GsAnalyticsActions.SUCCESS,
              [GsAnalyticsProperties.REQUEST_DURATION]: responseTime,
              [GsAnalyticsProperties.REQUEST_DURATION_FRIENDLY]: Duration.fromMillis(responseTime).as('seconds'),
              [AnalyticsProperties.SERVER_REQUEST]: true,
              [AnalyticsProperties.TOTAL_ROWS]: rowCount,
              [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
              [AnalyticsProperties.DASHBOARD_TYPE]: type,
              [AnalyticsProperties.VIEW_ID]: id,
            });

            this.exportInProgress = false;
            this.updateColumnDefinitions(this.partialColumns, keyBy(oldColumnState, 'colId'));

            this.gridOptions.cacheBlockSize = existingCacheBlockSize;
            this.gridOptions.maxBlocksInCache = 2;
            (gridApi.getModel() as unknown as { resetRootStore: () => void }).resetRootStore();
          }
        };

        gridApi.addEventListener(Events.EVENT_MODEL_UPDATED, onModelUpdated);
        (gridApi.getModel() as unknown as { resetRootStore: () => void }).resetRootStore();
      });
  }

  openColumnSelectionModal(template: TemplateRef<HTMLElement>): void {
    this.columnMenuVisible = false;
    this.modalService.open(template, {
      modalDialogClass: 'column-picker-modal',
    });

    const { id, dashboardId } = this.view || {};
    this.analytics.event(AnalyticsEvents.OPEN_PRODUCT_COLUMNS_PICKER, { [AnalyticsProperties.DASHBOARD_ID]: dashboardId, [AnalyticsProperties.VIEW_ID]: id });
  }

  private updateColumnDefinitions(partialColumns: Column[], existingColumnState: Record<string, ColumnState> | undefined = {}): void {
    let columnStates: Record<string, ColumnState> = existingColumnState;
    let runStateUpdate = false;
    const partialColumnsGrouped = groupBy(partialColumns, 'packetName');
    const uniqAccounts = uniqBy(this.processGroupsInPositioningColumns(this.selectedPositioningColumns), 'value');

    this.filterOptions = [];

    const fullColumnSet = compact(
      flatten(
        map(partialColumnsGrouped, (columns, key): ColGroupDef | undefined => {
          return {
            headerName: key,
            headerClass: stripingColumnHeader,
            marryChildren: true,
            children: map(columns, (column) => {
              const newColumn = clone(column) as ColDef & Column;
              const field = newColumn.field;

              if (!field) {
                return newColumn;
              }

              if (field === 'LongDescription') {
                newColumn.initialWidth = 400;
              } else {
                newColumn.initialWidth = 150;
              }

              // account column on P.E view
              if (this.view?.type === DashboardType.PLATFORM_EXPOSURE) {
                if (field === 'invest1Id') {
                  newColumn.valueFormatter = (params: ValueFormatterParams) => {
                    if (params.node?.level === 0) {
                      return '';
                    }

                    return params.data['accountShortName'] ? `${params.data['accountShortName']} [${params.value}]` : ` - [${params.value}]`;
                  };
                }
              }

              columnStates[field] = existingColumnState[field]
                ? { ...existingColumnState[field], hide: column.columnProperties.hide || null, rowGroup: false, rowGroupIndex: null }
                : { colId: field, width: newColumn.width, sort: null, rowGroup: false, rowGroupIndex: null, hide: column.columnProperties.hide || null };

              const precision = { minPrecision: newColumn.columnProperties.minPrecision, maxPrecision: newColumn.columnProperties.maxPrecision };

              switch (newColumn.columnProperties.type) {
                case 'text':
                  newColumn.filter = 'agTextColumnFilter';
                  newColumn.type = undefined;
                  break;

                case 'number':
                  newColumn.type = 'numericColumn';
                  newColumn.floatingFilterComponent = 'gsNumberFloatingFilter';

                  if (newColumn.columnProperties.formatDecimals) {
                    newColumn.valueFormatter = formatDecimals(false, precision, this.defaultLocale, this.isDrillDown);
                  }
                  break;

                case 'numberWithPrefix':
                  newColumn.type = 'numericColumn';

                  if (newColumn.columnProperties.formatDecimals) {
                    newColumn.valueFormatter = formatDecimals(true, precision, this.defaultLocale, this.isDrillDown);
                  }
                  break;

                case 'date':
                  newColumn.filter = 'agDateColumnFilter';
                  newColumn.valueGetter = (params: ValueGetterParams) => {
                    let dateString: string | undefined = get(params.data, field, '');

                    if (dateString && dateString.startsWith('**')) {
                      dateString = undefined;
                    }

                    return dateString ? DateTime.fromFormat(dateString, 'yyyyMMdd').toFormat('yyyy-MM-dd') : '';
                  };
                  delete newColumn.type;
                  break;

                default:
                  break;
              }

              newColumn.hide = newColumn.columnProperties.hide;
              newColumn.columnProperties = {};
              // newColumn.floatingFilter = !this.isPlatformExposure;

              // is this a grouped column?
              const groupedColumns = ['GSHLevel1'].concat(map(this.selectedGroupByOptions, 'value'));

              if (groupedColumns.includes(field) && !this.exportInProgress) {
                columnStates[field].rowGroup = true;
                columnStates[field].rowGroupIndex = groupedColumns.indexOf(field);

                // is there a bucket group for this?
                const bucketedField = this.findBucketedField(field);
                if (bucketedField) {
                  newColumn.valueGetter = (params: ValueGetterParams) => {
                    return get(params.data, params.node?.group ? bucketedField : field) as string;
                  };
                  const originalFormatter = newColumn.valueFormatter as ValueFormatterFunc;
                  newColumn.valueFormatter = (params: ValueFormatterParams) => {
                    return (params.node?.group || !originalFormatter ? params.value : originalFormatter(params)) as string;
                  };
                }
              }

              if (newColumn.pinned) {
                newColumn.suppressSizeToFit = true;
                newColumn.pinned = true;
              }

              if (this.allowFilterBar) {
                this.addToFilterBar(newColumn);
              }

              const cellClass = newColumn.type === 'numericColumn' ? formatNegatives(this.negativesInRed) : undefined;

              // is this included with selected metrics?
              if (this.allowMetricsSelection && uniqAccounts.length && !this.isDrillDown) {
                (newColumn as unknown as ColGroupDef).children = [
                  {
                    field: newColumn.field,
                    cellClass,
                    headerName: '',
                    pinned: newColumn.pinned,
                    suppressSizeToFit: newColumn.suppressSizeToFit,
                    cellRenderer: newColumn.cellRenderer,
                    filter: newColumn.filter,
                    floatingFilterComponent: newColumn.floatingFilterComponent,
                    type: newColumn.type,
                    width: newColumn.columnProperties.width,
                    sortable: newColumn.columnProperties.sortable,
                    showRowGroup: newColumn.showRowGroup,
                    valueFormatter: newColumn.valueFormatter,
                    valueGetter: newColumn.valueGetter,
                    hide: newColumn.columnProperties.hide,
                    suppressMovable: true,
                  },
                ];

                delete newColumn.field;
              }

              return newColumn as ColDef;
            }),
          };
        }),
      ),
    );

    // are we adding in account columns?
    if (this.allowMetricsSelection && uniqAccounts.length) {
      const additionalFilterOptions: ProductsGridComponent['filterOptions'] = [];
      const additionalColumns = flatten(
        map(uniqAccounts, (account) => {
          const accountHeaderName =
            this.view?.type === DashboardType.THREE_SIXTY && account.value ? this.view.name : `${account.shortName ?? ''} [${account.value}]`;
          const { columns, columnState, requiresStateUpdate, filterOptions } = this.generateAccountColumns(account, columnStates);

          columnStates = columnState;
          runStateUpdate = requiresStateUpdate;

          additionalFilterOptions.push(
            ...filterOptions.map((option) => ({
              ...option,
              column: {
                ...option.column,
                headerName: `${accountHeaderName} ${option.column.headerName}`,
              },
            })),
          );

          return {
            headerName: accountHeaderName,
            headerClass: stripingColumnHeader,
            marryChildren: true,
            children: columns,
          };
        }),
      );

      if (this.isDrillDown) {
        const drillDownColumns = flatten(map(additionalColumns, 'children'));
        fullColumnSet.push(...drillDownColumns);
      } else {
        const positioningIdx = findIndex(this.selectedColumns, positioningColumnSet);
        fullColumnSet.unshift(...additionalColumns);
        additionalColumns.forEach(() => {
          moveItemInArray(fullColumnSet, 0, positioningIdx + additionalColumns.length - 1);
        });

        this.filterOptions.push(...additionalFilterOptions);
      }
    }

    const autoGroupColumnState = find(columnStates, { colId: 'ag-Grid-AutoColumn' });
    const autoGroupWidth = autoGroupColumnState?.width || 150;
    const amountOfUnderscores = Math.ceil(autoGroupWidth / 5.75);
    this.autoGroupColumnDef.headerName = '_'.repeat(amountOfUnderscores);

    this.filters = this.view?.settings?.filters || [];
    const predicatesAsObject = groupBy(this.filters, 'leftOperand') || {};
    this.filterPredicates = Object.keys(predicatesAsObject).map((dimensionName) => {
      return { dimensionName, predicates: predicatesAsObject[dimensionName] };
    });
    this.sortModelSetViaApi = true;

    if (this.gridOptions.api) {
      this.gridOptions.api.setColumnDefs(fullColumnSet);
      this.gridOptions.columnApi?.applyColumnState({ state: Object.values(columnStates) });
      this.gridOptions.api.setAutoGroupColumnDef(this.autoGroupColumnDef);
      this.setFilterModel(this.filters);

      // if in a drill down, resize to fit
      if (this.isDrillDown) {
        this.gridOptions.api.sizeColumnsToFit();
      }
    } else {
      this.gridOptions.autoGroupColumnDef = this.autoGroupColumnDef;
      this.gridOptions.columnDefs = fullColumnSet;

      setTimeout(() => {
        this.gridOptions.columnApi?.applyColumnState({ state: Object.values(columnStates) });
        this.setFilterModel(this.filters);

        if (this.isDrillDown) {
          this.gridOptions.api?.sizeColumnsToFit();
        }
      });
    }

    // if we require a state update on metrics columns, run it now
    if (runStateUpdate && !this.isDrillDown) {
      this.viewsService.updateView(this.view, 'columnState', Object.values(columnStates));
    }
  }

  private addToFilterBar(column: ColDef & Column): void {
    if (!column.field || column.field === 'GSHLevel1') {
      return;
    }

    const dimension: AllowedDimension = {
      field: column.field,
      type: column.type === 'numericColumn' ? AllowedDimensionTypes.NUMBER : AllowedDimensionTypes.TEXT,
      autocomplete: false,
    };

    this.filterOptions.push({
      column: column,
      dimension,
    });
  }

  private generateAccountColumns(
    account: { value: string; shortName: string },
    columnState: Record<string, ColumnState>,
  ): { columns: ColGroupDef[]; columnState: Record<string, ColumnState>; requiresStateUpdate: boolean; filterOptions: ProductsGridComponent['filterOptions'] } {
    const columns: ColGroupDef[] = [];
    const filterOptions: ProductsGridComponent['filterOptions'] = [];
    let requiresStateUpdate = false;

    Object.keys(this.selectedMetrics).forEach((selectedMetric) => {
      this.selectedMetrics[selectedMetric].fields.forEach((field) => {
        const metricBucket = this.availableMetrics.find((bucket) => bucket.id === selectedMetric);
        const metricField =
          metricBucket?.fields.find((metric) => metric.displayName.toLowerCase() === field.toLowerCase()) ||
          ({ supportedSources: [], aggFieldName: '' } as unknown as RowGroupAggField);
        const mainHeaderName = selectedMetric === 'profitAndLoss' ? MetricsPnLLabels[field] : field;
        let intersectionOfSources = this.selectedMetrics[selectedMetric].sources; // Object.keys(MetricsLabels);

        if (metricField.supportedSources) {
          intersectionOfSources = metricField.supportedSources as Array<keyof typeof MetricsLabels>;
        }

        columns.push({
          headerName: mainHeaderName,
          headerClass: 'justify-content-center text-uppercase',
          children: map(intersectionOfSources, (source): ColDef => {
            const sourceField = metricField.aggFieldName.replace('{account}', account.value).replace('{source}', source);
            const width = this.isDrillDown ? 75 : 125;

            const hide = !this.selectedMetrics[selectedMetric].sources.includes(source);

            if (hide) {
              // do we need to update this state?
              if (!columnState[sourceField]?.hide) {
                requiresStateUpdate = true;
              }

              columnState[sourceField] = { colId: sourceField, hide: true };
            } else {
              // do we need to update this state?
              if (columnState[sourceField]?.hide) {
                requiresStateUpdate = true;
              }

              columnState[sourceField] = { ...(columnState[sourceField] || {}), hide: false };
            }

            const precision = { minPrecision: metricField.minPrecision, maxPrecision: metricField.maxPrecision };
            const headerName = MetricsLabels[source];

            if (this.allowFilterBar && !hide) {
              const dimension: AllowedDimension = {
                field: sourceField,
                type: AllowedDimensionTypes.NUMBER,
                autocomplete: false,
              };

              filterOptions.push({
                column: {
                  columnProperties: {},
                  headerName: `${mainHeaderName} ${headerName}`,
                },
                dimension,
              });
            }

            return {
              field: sourceField,
              headerName,
              cellClass: formatNegatives(this.negativesInRed),
              cellRenderer: (params: ICellRendererParams) => {
                const forbidden = this.paginationResponse.forbidden;
                const columnId = params.colDef?.colId ? params.colDef?.colId.split('_')[0] : '';
                const formattedValue = formatDecimals(
                  source === MetricsLabels.net.toLowerCase(),
                  precision,
                  this.defaultLocale,
                  this.isDrillDown,
                )({ value: params.value } as ValueFormatterParams);

                if (columnId && forbidden) {
                  const exists = some(forbidden, (arr: Array<string>) => arr.includes(columnId));

                  return exists ? '<div class="permission-denied">Permission Denied</div>' : formattedValue;
                } else {
                  return formattedValue;
                }
              },
              type: 'numericColumn',
              initialWidth: width,
              minWidth: width,
              hide,
              suppressMovable: true,
            };
          }),
          marryChildren: true,
        });
      });
    });

    return { columns, columnState, requiresStateUpdate, filterOptions };
  }

  private generatePartialColumns(gridColumns: ColumnCategories[] | PartialServerColDef[]): void {
    if (this.isDrillDown) {
      this.partialColumns = [
        {
          packetName: 'Product Identifiers',
          pinned: false,
          field: 'LongDescription',
          headerName: 'Description',
          columnProperties: {
            width: 75,
          },
        },
      ];
    } else {
      this.partialColumns = compact(
        flatten(
          this.selectedColumns.map((selectedColumn) => {
            if (selectedColumn.categoryId === positioningColumnSet.categoryId && selectedColumn.packetId === positioningColumnSet.packetId) {
              return undefined;
            }

            const packet = this.esgMetricsService.requestFromCatalogue<ColumnPacket>(gridColumns as ColumnCategories[], [
              selectedColumn.categoryId,
              selectedColumn.packetId,
            ]);

            if (!selectedColumn.columns) {
              return packet?.columns.map((col) => ({ ...col, packetName: packet.packetName, pinned: packet.pinned })) || [];
            }

            return compact(
              selectedColumn.columns.map((col) => {
                const definition = getColumnByIdentifier(packet, col);

                if (!definition) {
                  return undefined;
                }

                return { ...definition, packetName: packet?.packetName, pinned: packet?.pinned };
              }),
            );
          }),
        ),
      );
    }

    // add in any row groups
    [...['GSHLevel1'].map((value) => ({ label: value, value })), ...this.selectedGroupByOptions].forEach((groupByOption) => {
      if (find(this.partialColumns, { field: groupByOption.value })) {
        return;
      }

      this.partialColumns.push({
        headerName: groupByOption.label,
        field: groupByOption.value,
        packetName: 'Hidden',
        columnProperties: {
          hide: true,
        },
      });
    });
  }

  private findBucketedField(field: string): string | undefined {
    const bucket = find(this.groupByOptions, { value: field });

    return bucket?.bucketGrouping?.bucketedField;
  }

  private addPositioningColumnToPicker(): void {
    const positioning = find(this.selectedColumns, positioningColumnSet);

    if (!positioning) {
      this.selectedColumns = [positioningColumnSet, ...this.selectedColumns];
      moveItemInArray(this.selectedColumns, 0, 1);
    }

    this.selectedColumns = this.selectedColumns.map((column) => {
      if (column.categoryId === positioningColumnSet.categoryId) {
        const columns = this.processGroupsInPositioningColumns(this.selectedPositioningColumns).map((account) => account.value);

        return {
          ...column,
          columns,
        };
      }

      return column;
    });

    this.columnCatalogue = this.columnCatalogue.map((category) => {
      if (category.categoryId === positioningColumnSet.categoryId) {
        return {
          ...category,
          packets: category.packets.map((packet) => {
            if (packet.packetId === positioningColumnSet.packetId) {
              return {
                ...packet,
                columns: this.processGroupsInPositioningColumns(this.selectedPositioningColumns).map((account) => ({
                  field: account.value,
                  headerName: `${account.shortName} [${account.value}]`,
                  columnProperties: {},
                })),
              };
            }

            return packet;
          }),
        };
      }

      return category;
    });
  }

  private buildPredicatesFilterModel(predicates: PredicateInQueryWithID[]): Record<string, BucketGroupFilterModel> {
    const groupedPredicates = groupBy(predicates, 'leftOperand');
    const filterModel: Record<string, BucketGroupFilterModel> = {};

    Object.keys(groupedPredicates).forEach((leftOperand) => {
      const dimension = this.allowedDimensions.find((_dimension) => _dimension.field === leftOperand);
      const columnId = last(leftOperand.split(ALLOWED_DIMENSIONS_SEPARATOR));

      if (!dimension || !columnId) {
        return;
      }

      if (groupedPredicates[leftOperand].length > 1) {
        filterModel[columnId] = {
          filterType: dimension.type,
          operator: 'OR',
          conditions: groupedPredicates[leftOperand].map((predicate) => this.buildPredicateCondition(dimension, predicate)),
        };
      } else {
        const predicate = groupedPredicates[leftOperand][0];
        filterModel[columnId] = this.buildPredicateCondition(dimension, predicate);
      }
    });

    return filterModel;
  }

  private buildPredicateCondition(dimension: AllowedDimension, predicate: PredicateInQueryWithID): BucketGroupFilterModel {
    const baseFilter: Partial<BucketGroupFilterModel> = {
      filterType: dimension.type,
      type: AllowedDimensionsOperatorsAgGridTranslation[predicate.operator as AllowedDimensionsOperators],
    };

    const additionalProps: Partial<BucketGroupFilterModel> = {};
    const rightOperand = predicate.rightOperand as any;

    if (baseFilter.filterType === AllowedDimensionTypes.DATE) {
      const dateFrom: string = predicate.operator !== AllowedDimensionsOperators.between ? rightOperand : rightOperand.operand1.value;
      const dateTo: string = predicate.operator === AllowedDimensionsOperators.between ? rightOperand.operand2.value : undefined;
      additionalProps.dateFrom = this.convertHumanDateToISO(dateFrom);
      additionalProps.dateTo = this.convertHumanDateToISO(dateTo);
    } else {
      additionalProps.filter = predicate.operator !== AllowedDimensionsOperators.between ? rightOperand : rightOperand.operand1.value;
      additionalProps.filterTo = predicate.operator === AllowedDimensionsOperators.between ? rightOperand.operand2.value : undefined;
    }

    return {
      ...baseFilter,
      ...additionalProps,
    } satisfies BucketGroupFilterModel;
  }

  private convertHumanDateToISO(dateString: string | undefined): string | undefined {
    if (!dateString) {
      return;
    }

    return DateTime.fromFormat(dateString, 'd MMM yyyy').toISO({ suppressMilliseconds: true, includeOffset: false }).replace('T', ' ');
  }

  private filterAnalytics(filters: PredicateInQuery[], clearing: boolean, eventName: AnalyticsEvents): void {
    const { dashboardId, id, type } = this.view || {};
    if (clearing) {
      this.analytics.event(AnalyticsEvents.CLEAR_ALL_FILTERS, {
        [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
        [AnalyticsProperties.DASHBOARD_TYPE]: type,
        [AnalyticsProperties.VIEW_ID]: id,
      });

      return;
    }

    this.analytics.event(eventName, {
      [AnalyticsProperties.DASHBOARD_ID]: dashboardId,
      [AnalyticsProperties.DASHBOARD_TYPE]: type,
      [AnalyticsProperties.FILTERS]: filters.map((predicate) => predicate.leftOperand),
      [AnalyticsProperties.FILTER_VALUES]: filters.map((predicate) => predicate.rightOperand),
      [AnalyticsProperties.VIEW_ID]: id,
    });
  }

  private processGroupsInPositioningColumns(positionalColumns: PositionalColumn[]): PositionalColumn[] {
    const processedPositionalColumns: PositionalColumn[] = [];

    (positionalColumns || []).forEach((column) => {
      if (column.isGroup) {
        const accountGroup = this.accountGroups[column.value];

        if (accountGroup) {
          processedPositionalColumns.push(
            ...accountGroup
              .filter((source) => source.source === SourceType.INVEST1)
              .map((source) => ({ value: source.value, shortName: source.name || source.value })),
          );
        }
      } else {
        processedPositionalColumns.push({
          ...column,
          value: column.value ?? column.invest1Id,
        });
      }
    });

    return processedPositionalColumns;
  }

  private recurseParentLevels(node: IRowNode | RowNode): string {
    if (!node.key) {
      return '';
    }

    const levels: string[] = [node.key];
    let parent = node.parent;

    while (parent !== null) {
      if (!parent.key) {
        break;
      }

      levels.push(parent.key);
      parent = parent.parent;
    }

    return levels.reverse().join('-');
  }

  private saveFiltersToView(before: PredicateInQueryWithID[], after: PredicateInQueryWithID[], { clearing = false, afterFloatingFilter = false }): void {
    const beforePredicatesWithoutID = before.map(({ leftOperand, rightOperand, operator }) => {
      return { leftOperand, rightOperand, operator };
    });

    const afterPredicatesWithoutID = after.map(({ leftOperand, rightOperand, operator }) => {
      return { leftOperand, rightOperand, operator };
    });

    if (isEqual(beforePredicatesWithoutID, afterPredicatesWithoutID)) {
      return;
    }

    this.viewsService.updateView(this.view, 'filters', afterPredicatesWithoutID);

    this.filterAnalytics(
      afterPredicatesWithoutID,
      clearing,
      afterFloatingFilter ? AnalyticsEvents.FILTER_USING_COLUMN : AnalyticsEvents.FILTER_USING_COLUMN_MENU,
    );
  }
}
