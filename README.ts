import { ButtonComponent, ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { every, find, findIndex, first, isEmpty, orderBy, some } from 'lodash-es';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { InputModule } from '@gs-ux-uitoolkit-angular/input';
import { TreeInstance, TreeModule, TreeNode, TreeNodeMap, TreeOptions } from '@gs-ux-uitoolkit-angular/tree';

import { BaseColumnPicker } from '@gsam-fi/grids/column-picker';
import { ColumnCategories, ColumnListData, DragDropItem, SelectedColumn, SelectedPacket } from '@gsam-fi/grids/typings';
import { GsAnalyticsService, trackByField } from '@gsam-fi/common';

import { AnalyticsEvents, AnalyticsProperties } from '../../analytics.events';
import { BASE_COLUMN_PICKER } from './column-picker.tokens';
import { DetectOverflowModule } from '../helpers/detect-overflow.module';
import { DragDropListsComponent } from '../drag-drop-lists/drag-drop-lists.component';
import { DragDropListsContentDirective } from '../drag-drop-lists/drag-drop-lists.directive';
import { MenuBlurEvent, MenuValueType } from '@gs-ux-uitoolkit-angular/menu';
import { shouldBlurElementBeVisible } from '../helpers/gs-button.helper';

@Component({
  selector: 'metrics-column-picker',
  imports: [
    CommonModule,
    ButtonModule,
    DragDropListsComponent,
    DragDropListsContentDirective,
    IconModule,
    InputModule,
    TreeModule,
    DetectOverflowModule,
  ],
  providers: [{
      provide: BASE_COLUMN_PICKER,
      useClass: BaseColumnPicker
  }],
  templateUrl: './column-picker.component.html',
  styleUrl: './column-picker.component.scss',
  standalone: true,
})
export class ColumnPickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupByTitle: boolean = false;
  @Input() catalogue: ColumnCategories[] = [];
  @Input() selectedColumns: SelectedColumn[] = [];
  @Output() readonly columnsChanged: EventEmitter<{ categoryId: string; packetId: string; columns?: string[] }[]> = new EventEmitter();
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();
  @ViewChild('overflowButton', { read: ButtonComponent }) readonly dropdownButtonRef!: ButtonComponent;
  tags: string[] = [];
  activeTag: string = "";
  activeTreeParentKey: string | undefined = '';
  activeTreeKey = '';
  searchText: string = '';
  overflowDropdownVisible = false;
  overflowMenu: string[] = [];
  packetsToRender: string[] = [];
  catalogueAsTree: ColumnCategories[] = [];
  listItems: DragDropItem<ColumnListData>[] = [];
  hiddenCategories: Record<string, boolean> = {};
  options!: TreeOptions;
  selectedPackets: Record<string, SelectedPacket> = {};
  trackCategoryId = trackByField('categoryId');
  trackColumnField = trackByField('field');
  treeInstances!: TreeInstance[];
  private lastOverflowIndex = 0;
  private columnOrdered: DragDropItem<ColumnListData>[] = [];
  private originalTreeState!: TreeNodeMap[];
  private treeFilter$!: Subject<string>;

  constructor(
    private readonly analytics: GsAnalyticsService,
    private readonly cd: ChangeDetectorRef,
    @Inject(BASE_COLUMN_PICKER) private readonly columnPickerImpl: BaseColumnPicker,
  ) {
    this.options = columnPickerImpl.getOptions<TreeOptions>();
  }

  ngOnInit(): void {
    this.treeFilter$ = new Subject<string>();
    this.treeFilter$.pipe(debounceTime(250)).subscribe((value: string) => {
      if (this.activeTreeKey === "" && (!value?.length || value.length < 2)) {
        this.treeInstances.forEach((instance, position) => {
          const state = this.originalTreeState[position];
          instance.api.setState(state);
        });

        this.hiddenCategories = {};
        this.analytics.event(AnalyticsEvents.RESET_SEARCH_COLUMNS, {});

        return;
      }

      this.treeInstances.forEach((instance) => {
        let category = '';
        const api = instance.api;
        const searchState = { ...api.getState() } as Record<string, TreeNode & { expanded: boolean; visible: boolean; childrenKeys: string[], parentKey: string | undefined }>;
        Object.keys(searchState).forEach((key) => {
          let visible = true;
          category = first(key.split('|')) || '';
          const hasChildren = some(
            searchState[key].childrenKeys,
            (child) =>
              searchState[child].name.toLowerCase().includes(value.toLowerCase()) ||
              searchState[child].childrenKeys.some((cName) => searchState[cName].name.toLowerCase().includes(value.toLowerCase())),
          );

            if(this.activeTag !== "All" && !isEmpty(this.activeTreeKey)) {
              if((this.activeTreeParentKey === key) || key.includes(this.activeTreeKey)){
                if (!searchState[key].name.toLowerCase().includes(value.toLowerCase()) && !hasChildren) {
                  visible = false;
                }
              } else {
                visible = false;
              }
            } else if (!searchState[key].name.toLowerCase().includes(value.toLowerCase()) && !hasChildren) {
              visible = false;
            } else {
              this.activeTreeParentKey = searchState[key].parentKey;
              this.activeTreeKey = key;
            }

          searchState[key] = {
            ...searchState[key],
            visible,
            expanded: hasChildren,
          };
        });

        this.hiddenCategories[category] = every(searchState, { visible: false });
        api.setState(searchState);
      });

      this.analytics.event(AnalyticsEvents.SEARCH_COLUMNS, { [AnalyticsProperties.SEARCH_TERM]: value.toLowerCase() });
    });

    this.originalTreeState = [];
    this.treeInstances = [];
    this.columnPickerImpl.catalogue = this.catalogue;
    this.catalogueAsTree = this.columnPickerImpl.processCatalogueAsTree(this.groupByTitle);
    const accountPositioningObj = find(this.catalogueAsTree, {categoryId: "accountPositioning"});
    this.tags = accountPositioningObj?.packets[0].tags || [];
    this.activeTag = first(this.tags) || '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.catalogue && !changes.catalogue.firstChange) {
      this.columnPickerImpl.catalogue = changes.catalogue.currentValue as ColumnCategories[];
      this.catalogueAsTree = this.columnPickerImpl.processCatalogueAsTree(this.groupByTitle);
    }

    if (changes.selectedColumns) {
      const selectedColumns = changes.selectedColumns.currentValue as SelectedColumn[];
      this.selectedPackets = this.columnPickerImpl.generatePacketsFromSelectedColumns(selectedColumns);
      this.catalogue.forEach((category) => {
        if (!this.selectedPackets[category.categoryId]) {
          this.selectedPackets[category.categoryId] = { packets: [] };
        }
      });

      this.transformIntoListItems(this.selectedPackets);
      this.columnOrdered = orderBy(this.listItems, (item) => {
        const [categoryId, packetId] = item.data?.id.split('|') || [];

        return findIndex(selectedColumns, { categoryId, packetId });
      });
    }
  }

  ngOnDestroy(): void {
    this.originalTreeState = [];
    this.treeInstances = [];
    this.treeFilter$.complete();
  }

  clearSelectedPackets(): void {
    this.listItems = [];
    this.columnOrdered = [];

    Object.keys(this.selectedPackets).forEach((categoryId) => {
      this.selectedPackets[categoryId] = { packets: [] };
    });
    this.treeInstances.forEach((instance) => instance.api.deselectAllNodes());
    this.analytics.event(AnalyticsEvents.CLEAR_SELECTED_PACKETS, {});
  }

  close(): void {
    this.closed.emit();
    this.analytics.event(AnalyticsEvents.CLOSE_COLUMN_PICKER, {});
  }

  switchQuickFilterTags(tag: string, button?: ButtonComponent): void {
    this.activeTag = tag;
    this.activeTreeKey = '';
    this.activeTreeParentKey = '';
    this.searchText = '';

    if (button) {
      button.blur();
    }

    this.analytics.event(AnalyticsEvents.CLICK_QUICK_DESK_FILTER, { [AnalyticsProperties.QUICK_DESK_FILTER]: tag });
    
    this.treeFilter$.next(tag === "All"?'': tag);
  }

  switchFilterViaMenu ($event: MenuValueType, button: ButtonComponent) : void {
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

  toggleOverflowMenu(): void {
    this.overflowDropdownVisible = !this.overflowDropdownVisible;
    this.analytics.event(AnalyticsEvents.CLICK_QUICK_DESK_COLUMN_Filter_MORE_DROPDOWN, {});
    this.cd.detectChanges();
  }

  overflowingTabs($event: number): void {
    const original = this.tags;
    const originalLength = original.length;
    let sizeToSlice: number | undefined;

    if (originalLength && $event > 0) {
      sizeToSlice = $event;
    } else if ($event < 0) {
      const elementsToAdd = $event * -1;
      sizeToSlice = Math.min(originalLength, this.packetsToRender.length + elementsToAdd);
    }

    if (sizeToSlice) {
      this.overflowMenu = original.slice(sizeToSlice);
    }

    this.packetsToRender = original.slice(0, originalLength - this.overflowMenu.length);
    this.lastOverflowIndex = $event !== 0 ? $event : this.lastOverflowIndex;
    this.cd.detectChanges();
  }

  columnsReordered(columns: DragDropItem<ColumnListData>[]): void {
    this.columnOrdered = columns;
    this.analytics.event(AnalyticsEvents.REORDER_SELECTED_PACKETS, {
      [AnalyticsProperties.SELECTED_COLUMNS]: columns.map((col) => col.data?.includedColumns.map((includedCol) => includedCol.field)).flat(),
    });
  }

  emitSelectedColumns(): void {
    const orderedSelectedColumnSets = this.columnPickerImpl.getSelectedColumnSetsInOrder(this.columnOrdered, this.selectedPackets);
    this.columnsChanged.emit(orderedSelectedColumnSets);
    this.analytics.event(AnalyticsEvents.APPLY_COLUMN_PICKER, {
      [AnalyticsProperties.SELECTED_CATEGORIES]: orderedSelectedColumnSets.map((col) => col.categoryId),
      [AnalyticsProperties.SELECTED_PACKETS]: orderedSelectedColumnSets.map((col) => col.packetId),
      [AnalyticsProperties.SELECTED_COLUMNS]: orderedSelectedColumnSets.map((col) => col.columns?.flat()),
    });
  }

  packetRemoved({ item, parentId }: { item: DragDropItem<ColumnListData>; parentId?: string }): void {
    if (!item.data) {
      return;
    }

    const data = item.data;
    const tree = this.treeInstances.find((instance) => Object.keys(instance.api.getState()).includes(parentId ?? data.id));
    
    if (tree) {
      tree.api.select(data.id);
      this.analytics.event(AnalyticsEvents.DESELECT_COLUMN_PACKET, { [AnalyticsProperties.SELECTED_PACKETS]: data.id });
    }
  }

  treeInstanceCallback(treeInstance: TreeInstance): void {
    const instance = this.columnPickerImpl.registerTreeInstance({
      treeInstance,
      selectedPacketsRef: this.selectedPackets,
      listItemsCallback: (selectedPacketsRef) => this.transformIntoListItems(selectedPacketsRef),
      analyticsCallback: (callbackEvent) => this.analyticsCallback(callbackEvent),
    });
    this.treeInstances.push(instance);
    this.originalTreeState.push({ ...instance.api.getState() });
    this.transformIntoListItems(this.selectedPackets);
  }

  treeFilterChanged($event: string | number | undefined): void {
    const value = $event as string;
    this.searchText = value;
    this.treeFilter$.next(value);
  }

  private transformIntoListItems(selectedPackets: Record<string, SelectedPacket>): void {
    this.listItems = this.columnPickerImpl.orderSelectedPacketsIntoListItems(selectedPackets, this.columnOrdered);
    this.columnOrdered = this.listItems;
  }

  private analyticsCallback(callbackEvent: { type: string; identifiers: { categoryId: string; packetId: string; columnId?: string } }): void {
    let eventName: AnalyticsEvents | undefined = undefined;

    switch (callbackEvent.type) {
      case 'select':
        eventName = callbackEvent.identifiers.columnId ? AnalyticsEvents.SELECT_COLUMN : AnalyticsEvents.SELECT_COLUMN_PACKET;
        break;

      case 'deselect':
        eventName = callbackEvent.identifiers.columnId ? AnalyticsEvents.DESELECT_COLUMN : AnalyticsEvents.DESELECT_COLUMN_PACKET;
        break;

      case 'expand':
        eventName = AnalyticsEvents.EXPAND_COLUMN_PACKET;
        break;

      case 'collapse':
        eventName = AnalyticsEvents.COLLAPSE_COLUMN_PACKET;
        break;

      default:
        break;
    }

    if (eventName) {
      this.analytics.event(eventName, {
        [AnalyticsProperties.SELECTED_CATEGORIES]: callbackEvent.identifiers.categoryId,
        [AnalyticsProperties.SELECTED_COLUMNS]: callbackEvent.identifiers.columnId,
        [AnalyticsProperties.SELECTED_PACKETS]: callbackEvent.identifiers.packetId,
      });
    }
  }
}




import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { TreeAPI, TreeInstance } from '@gs-ux-uitoolkit-angular/tree';
import { when } from 'jest-when';

import { BaseColumnPicker } from '@gsam-fi/grids/column-picker';
import { catalogue, catalogueAsTree } from '@gsam-fi/grids/mocks';
import { GsAnalyticsService } from '@gsam-fi/common';

import { BASE_COLUMN_PICKER } from './column-picker.tokens';
import { ColumnPickerComponent } from './column-picker.component';
import { CommonModule } from '@angular/common';

describe('Column Picker Component', () => {
  let baseColumnPicker: jest.Mocked<BaseColumnPicker>;
  let component: ColumnPickerComponent;
  let fixture: ComponentFixture<ColumnPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnPickerComponent],
      providers: [
        {
          provide: GsAnalyticsService,
          useValue: createSpyObj('GsAnalyticsService', ['bulkEvent', 'event']),
        },
      ],
    }).overrideComponent(ColumnPickerComponent, {
      set: {
        imports: [CommonModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [{
          provide: BASE_COLUMN_PICKER,
          useValue: createSpyObj('BaseColumnPicker', [
            'getOptions',
            'processCatalogueAsTree',
            'generatePacketsFromSelectedColumns',
            'getSelectedColumnSetsInOrder',
            'registerTreeInstance',
            'orderSelectedPacketsIntoListItems',
          ]),
        }]
      }
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnPickerComponent);
    component = fixture.componentInstance;
    baseColumnPicker = fixture.componentRef.injector.get(BASE_COLUMN_PICKER) as jest.Mocked<BaseColumnPicker>;
    baseColumnPicker.registerTreeInstance.mockReturnValue({
      api: {
        getState: () => ({}),
        setState: () => undefined,
        select: () => undefined,
        deselectAllNodes: () => undefined,
      } as unknown as TreeAPI,
      on: () => undefined,
      off: () => undefined,
    });
  });

  describe('ngOnChanges', () => {
    it('should not update catalogue if this is the first change', () => {
      baseColumnPicker.processCatalogueAsTree.mockReturnValue(catalogueAsTree);
      expect(component.catalogue).toEqual([]);
      const change = new SimpleChange(undefined, catalogue, false);

      fixture.detectChanges();
      component.ngOnChanges({ catalogue: change });
      expect(component.catalogue).toEqual([]);
    });

    it('should update catalogue if this is not the first change', () => {
      baseColumnPicker.processCatalogueAsTree.mockReturnValue(catalogueAsTree);
      expect(component.catalogue).toEqual([]);
      const change = new SimpleChange(undefined, catalogue, false);

      fixture.detectChanges();
      component.ngOnChanges({ catalogue: change });
      expect(component.catalogueAsTree).toEqual(catalogueAsTree);
    });

    it('should update selectedPackets if selected columns are changed', () => {
      const selectedColumns = [
        {
          categoryId: 'CategoryA',
          packetId: 'PacketA',
          columns: ['columnA'],
        },
      ];

      const selectedPackets = {
        CategoryA: {
          packets: [
            {
              packetId: 'PacketA',
              include: ['columnA'],
            },
          ],
        },
      };

      when(baseColumnPicker.generatePacketsFromSelectedColumns).calledWith(selectedColumns).mockReturnValue(selectedPackets);
      expect(component.selectedPackets).toEqual({});
      const change = new SimpleChange(undefined, selectedColumns, false);

      fixture.detectChanges();
      component.ngOnChanges({ selectedColumns: change });
      expect(component.selectedPackets).toEqual(selectedPackets);
    });

    it('should make sure selectedPackets has entries for anything in the catalogue if not already present', () => {
      const selectedColumns = [
        {
          categoryId: 'CategoryA',
          packetId: 'PacketA',
          columns: ['columnA'],
        },
      ];

      const selectedPackets = {
        CategoryA: {
          packets: [
            {
              packetId: 'PacketA',
              include: ['columnA'],
            },
          ],
        },
      };

      const additionalCatalogue = [
        { categoryId: 'CategoryA', categoryName: 'Category A', packets: [] },
        { categoryId: 'CategoryB', categoryName: 'Category B', packets: [{ packetId: 'ABC', packetName: 'Packet ABC', columns: [] }] },
      ];

      when(baseColumnPicker.generatePacketsFromSelectedColumns).calledWith(selectedColumns).mockReturnValue(selectedPackets);
      component.catalogue = additionalCatalogue;
      expect(component.selectedPackets).toEqual({});
      const change = new SimpleChange(undefined, selectedColumns, false);

      fixture.detectChanges();
      component.ngOnChanges({ selectedColumns: change });
      expect(component.selectedPackets).toEqual({
        CategoryA: {
          packets: [
            {
              packetId: 'PacketA',
              include: ['columnA'],
            },
          ],
        },
        CategoryB: {
          packets: [],
        },
      });
    });
  });

  it('should not create a catalogue if no data passed in', () => {
    baseColumnPicker.processCatalogueAsTree.mockReturnValue([]);
    fixture.detectChanges();
    expect(component.catalogueAsTree).toEqual([]);
    expect(component.listItems).toEqual([]);
    expect(component.hiddenCategories).toEqual({});
  });

  it('should convert a sent in catalogue into a format GS Tree understands', () => {
    component.catalogue = catalogue;
    baseColumnPicker.processCatalogueAsTree.mockReturnValue(catalogueAsTree);
    fixture.detectChanges();
    expect(component.catalogueAsTree).toEqual(catalogueAsTree);
  });

  it('should clear tree state and selected packets', () => {
    fixture.detectChanges();
    component.listItems = [
      {
        data: {
          id: 'A',
          includedColumns: [],
        },
        name: 'A',
        id: 'A',
      },
    ];
    component.selectedPackets = {
      PacketA: {
        packets: [
          {
            packetId: 'PacketA',
            include: ['columnA'],
          },
        ],
      },
    };
    component.treeInstances = [
      {
        api: {
          deselectAllNodes: jest.fn(),
        },
      },
    ] as unknown as TreeInstance[];

    component.clearSelectedPackets();
    expect(component.listItems).toEqual([]);
    expect(component.selectedPackets).toEqual({ PacketA: { packets: [] } });
    component.treeInstances.forEach((instance) => {
      expect(instance.api.deselectAllNodes).toHaveBeenCalled();
    });
  });

  it('should emit columns in the correct order', () => {
    const columns = [
      {
        data: {
          id: 'CategoryA|PacketA',
          includedColumns: [],
        },
        id: 'a',
        name: 'A',
      },
      {
        data: {
          id: 'CategoryB|PacketA',
          includedColumns: [],
        },
        id: 'b',
        name: 'B',
      },
      {
        data: {
          id: 'CategoryB|PacketB',
          includedColumns: [],
        },
        id: 'c',
        name: 'C',
      },
      {
        id: 'd',
        name: 'CorruptItemWithNoData',
      },
    ];
    component.selectedPackets = {
      CategoryA: {
        packets: [{ packetId: 'PacketA', include: ['DefaultCol'] }],
      },
      CategoryB: {
        packets: [{ packetId: 'PacketA', include: ['AnotherDefaultCol'] }, 'PacketB'],
      },
    };
    component.listItems = columns;
    (component as any).columnsChanged = { emit: jest.fn() } as any;
    fixture.detectChanges();

    component.columnsReordered(columns);

    const expectedOutput = [
      {
        categoryId: 'CategoryA',
        packetId: 'PacketA',
        columns: ['DefaultCol'],
      },
      {
        categoryId: 'CategoryB',
        packetId: 'PacketA',
        columns: ['AnotherDefaultCol'],
      },
      {
        categoryId: 'CategoryB',
        packetId: 'PacketB',
      },
    ];

    when(baseColumnPicker.getSelectedColumnSetsInOrder).calledWith(component.listItems, component.selectedPackets).mockReturnValue(expectedOutput);
    component.emitSelectedColumns();
    expect(component.columnsChanged.emit).toHaveBeenCalledWith(expectedOutput);
  });

  it('should filter results down to search term', fakeAsync(() => {
    component.catalogue = catalogue;
    fixture.detectChanges();
    component.treeInstances = [
      {
        api: {
          getState: () => ({
            'productIdentifiers|productIdentifiers|LongDescription': {
              name: 'Description',
              visible: true,
            },
          }),
          setState: jest.fn(),
        },
      },
      {
        api: {
          getState: () => ({
            'basicAttributes|gshClassification|GSHLevel1': {
              name: 'GSH L1',
              visible: true,
            },
            'basicAttributes|gshClassification|GSHLevel2': {
              name: 'GSH L2',
              visible: true,
            },
            'basicAttributes|gshClassification|GSHLevel3': {
              name: 'NOT L3',
              visible: true,
            },
            'basicAttributes|gshClassification|GSHLevel4': {
              name: 'NOT L3 BUT HAS GROUP',
              childrenKeys: ['basicAttributes|gshClassification|GSHLevel1'],
              visible: true,
            }
          }),
          setState: jest.fn(),
        },
      },{
        api: {
          getState: () => ({
            'risk|xSectorFactorExpCTD': {
              name: 'Risk Summary',
              childrenKeys: ['risk|xSectorFactorExpCTD|GSHLevel3'],
              visible: true,
            },
            'risk|xSectorFactorExpCTD|GSHLevel3': {
              name: 'GSH L3',
              visible: true,
            },
            'risk|x-sector': {
              name: 'X-sector',
              childrenKeys: ['risk|xSectorFactorExpCTD'],
              visible: true,
            },
          }),
          setState: jest.fn(),
        },
      }
    ] as unknown as TreeInstance[];
    component.treeFilterChanged('GSH');

    // nothing should happen until 250ms after the last key press
    expect(component.treeInstances[0].api.setState).not.toHaveBeenCalled();
    expect(component.treeInstances[1].api.setState).not.toHaveBeenCalled();
    // expect(component.treeInstances[2].api.setState).not.toHaveBeenCalled();
    tick(250);

    expect(component.treeInstances[0].api.setState).toHaveBeenCalledWith({
      'productIdentifiers|productIdentifiers|LongDescription': {
        name: 'Description',
        visible: false,
        expanded: false,
      },
    });
    expect(component.treeInstances[1].api.setState).toHaveBeenCalledWith({
      'basicAttributes|gshClassification|GSHLevel1': {
        name: 'GSH L1',
        visible: true,
        expanded: false,
      },
      'basicAttributes|gshClassification|GSHLevel2': {
        name: 'GSH L2',
        visible: true,
        expanded: false,
      },
      'basicAttributes|gshClassification|GSHLevel3': {
        name: 'NOT L3',
        visible: false,
        expanded: false,
      },
      'basicAttributes|gshClassification|GSHLevel4': {
        name: 'NOT L3 BUT HAS GROUP',
        childrenKeys: ['basicAttributes|gshClassification|GSHLevel1'],
        visible: true,
        expanded: true,
      }
    });

     expect(component.treeInstances[2].api.setState).toHaveBeenCalledWith({
        'risk|xSectorFactorExpCTD': {
          name: 'Risk Summary',
          childrenKeys: ['risk|xSectorFactorExpCTD|GSHLevel3'],
          visible: true,
          expanded:true
        },
        'risk|xSectorFactorExpCTD|GSHLevel3': {
          name: 'GSH L3',
          visible: true,
          expanded:false
        },
        'risk|x-sector': {
          name: 'X-sector',
          childrenKeys: ['risk|xSectorFactorExpCTD'],
          visible: true,
          expanded: true,
        },
    });
    expect(component.hiddenCategories).toEqual({
      productIdentifiers: true,
      basicAttributes: false,
      risk: false
    });

    // we should reset if < 2 length term passed in
    component.treeFilterChanged('a');
    tick(250);
    expect(component.hiddenCategories).toEqual({});
    expect(component.treeInstances[0].api.setState).toHaveBeenCalledWith(undefined);
    expect(component.treeInstances[1].api.setState).toHaveBeenCalledWith(undefined);

    component.treeFilterChanged(undefined);
    tick(250);
    expect(component.hiddenCategories).toEqual({});
    expect(component.treeInstances[0].api.setState).toHaveBeenCalledWith(undefined);
    expect(component.treeInstances[1].api.setState).toHaveBeenCalledWith(undefined);
  }));

  it('should remove a packet from the tree state', () => {
    fixture.detectChanges();

    const treeInstance = {
      api: {
        getState: () => ({
          'my|column|id': {
            visible: true,
          },
        }),
        select: jest.fn(),
      },
    } as any;
    component.treeInstances = [treeInstance];

    // should not invoke select if no data is provided
    component.packetRemoved({ item: { id: 'a', name: 'My Column Packet' } });
    expect(treeInstance.api.select).not.toHaveBeenCalled();

    // should invoke select as my|column|id exists in the tree getState
    component.packetRemoved({ item: { id: 'a', name: 'My Column Packet', data: { id: 'my|column|id', includedColumns: [] } } });
    expect(treeInstance.api.select).toHaveBeenCalledWith('my|column|id');

    // this shouldn't invoke select as this column id does not exist in the tree getState
    component.packetRemoved({ item: { id: 'a', name: 'My Column Packet', data: { id: 'not|my|column|id', includedColumns: [] } } });
    expect(treeInstance.api.select).not.toHaveBeenCalledWith('not|my|column|id');
  });

  it('should toggle overflow menu when clicked', () => {
    component.toggleOverflowMenu();
    expect(component.overflowDropdownVisible).toBeTruthy();

    component.toggleOverflowMenu();
    expect(component.overflowDropdownVisible).toBeFalsy();
  });
});





<div class="row column-picker h-100">
    <div class="col h-100">
        <div class="d-flex flex-column h-100 p-3 pt-2">
            <div class="col-auto ms-auto"><gs-icon size="sm" name="clear" type="outlined" (click)="close()" class="column-picker__close-picker"></gs-icon></div>
            <div class="col flex-grow-1 column-picker__columns">
                <div class="row h-100">
                    <div class="col d-flex flex-column h-100 column-picker__columns-pane">
                        <h6 class="gs-uitk-text-heading-06">Choose columns</h6>
                        @if(tags.length){
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
                        }
                        <div class="row mb-4">
                            <div class="col">
                                <gs-input [value]="searchText" type="search" placeholder="Search columns" class="w-100" size="sm"
                                    (valueChange)="treeFilterChanged($event)"/>
                            </div>
                        </div>
                        <div class="row column-picker__trees-wrapper">
                            <div class="col pt-0 flex-grow-1">
                                <div class="row"
                                    *ngFor="let categories of catalogueAsTree; let first=first; let last=last; trackBy: trackCategoryId" [hidden]="hiddenCategories[categories.categoryId]">
                                    <div class="col" [class.column-picker__tree]="!last" *ngIf="!categories.hidden">
                                        <h6 class="gs-uitk-text-heading-07 column-picker__tree--heading"
                                            [class.mt-0]="first">{{ categories.categoryName }}</h6>
                                        <gs-tree [data]="categories.tree" [options]="options"
                                            (instance)="treeInstanceCallback($event)"></gs-tree>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col h-100">
                        <div class="column-picker__selected-columns-pane">
                            <h6 class="gs-uitk-text-heading-06 d-flex mx-1">Selected Columns <span
                                    class="ms-auto column-picker__clear" (click)="clearSelectedPackets()">Clear
                                    all</span></h6>
                            <metrics-drag-drop-lists class="d-block column-picker__selected-columns-pane-wrapper"
                                placeholder="Please select columns to appear in this list" [items]="listItems"
                                (listReordered)="columnsReordered($event)" (itemRemoved)="packetRemoved($event)">
                            </metrics-drag-drop-lists>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-auto ms-auto">
                <gs-button emphasis="bold" actionType="primary" size="sm"
                    (click)="emitSelectedColumns()" [disabled]="!listItems.length">Done</gs-button>
            </div>
        </div>
    </div>
</div>
