import { makeAutoObservable } from "mobx";
import { toJS } from "mobx";

class Store {
	constructor() {
		makeAutoObservable(this);
	}
	providers = [];
	locations = [];
	activeProviders = [];
	activeLocation = { id: 0 };
	refreshTimes = false;

	// Toggle provider
	toggleProvider(provider) {
		if (
			this.activeProviders.find(
				(activeProvider) => provider.id === activeProvider.id
			)
		)
			this.activeProviders.splice(this.activeProviders.indexOf(provider), 1);
		else this.activeProviders.push(provider);
		this.refreshTimes = !this.refreshTimes;
	}
}

const store = new Store();

export default store;
