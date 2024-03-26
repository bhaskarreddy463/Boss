this.store$
      .pipe(
        select(getActiveView),
        switchMap((view) =>
          this.store$.pipe(
            select(getAccounts),
            map((accounts): [ViewState | undefined, Record<string, State['accounts'][0]>] => [view, accounts]),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(([view, accountsState]) => {
        if (!view || DashboardType.THREE_SIXTY !== view.type) {
          return;
        }

        this.view = view;

        const dateChanged = this.selectedRiskDate !== view.query?.riskDate;
        this.selectedAccount = { ...(view.datasets.accounts[0] || {}), viewId: this.view.id };

        if (dateChanged) {
          this.selectedRiskDate = view.query?.riskDate;
          this.selectedAccount = { ...this.selectedAccount, riskDate: this.selectedRiskDate };
        }

        // has this account ever been loaded?
        if ((!accountsState[this.selectedAccount.invest1Id] || dateChanged) && this.selectedAccount.invest1Id) {
          this.dispatchAccountQuery(this.selectedAccount, this.selectedRiskDate);
        }

        if (this.selectedDatasets.accounts[0] !== this.selectedAccount) {
          const accounts = this.selectedAccount?.invest1Id ? [this.selectedAccount] : [];
          this.selectedDatasets = { accounts, accountGroups: [], analysts: [], benchmarks: [] };
        }

        // relative date updater at midnight
        const timeUntilMidnight = DateTime.now().set({ hour: 24, minute: 0, second: 0 }).toMillis() - DateTime.now().toMillis();
        timer(timeUntilMidnight).subscribe(() => this.updateRelativeDateAtMidnight());

        this.asOfTime = DateTime.now();
        this.updateRelativeDateAtMidnight();
      });
