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

<div class="col">
    <gs-card class="h-100 d-block">
        <gs-card-header size="sm" class="row g-0 mt-2 mb-0 ms-2">
            <h6 class="col gs-uitk-text-heading-07 font-weight-bold mt-0 pt-2 px-0">
              Portfolio Composition
            </h6>
          </gs-card-header>    
          <gs-card-body class="px-0 pb-0 pt-1">
            <metrics-overflow-buttons [tags]="btnList"></metrics-overflow-buttons>
          </gs-card-body>
    </gs-card>
</div>
