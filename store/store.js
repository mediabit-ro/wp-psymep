import { makeAutoObservable } from "mobx";
import { toJS } from "mobx";

class Store {
	constructor() {
		makeAutoObservable(this);
	}
	name = "";
	providers = [];
	locations = [];
	activeProviders = [];
	activeLocation = { id: 0 };
	refreshTimes = false;
	terms = {
		user: {}, // Used to login after accepting terms
		content: "", // Content from post displayed in terms page
		postId: 0, // Post id from post displayed in terms page
		users: [], // Users from post displayed in terms page
	};

	// Toggle provider
	toggleProvider(provider) {
		if (
			this.activeProviders.find(
				(activeProvider) => provider.id === activeProvider.id
			)
		)
			this.activeProviders.splice(
				this.activeProviders.findIndex(
					(activeProvider) => activeProvider.id === provider.id
				),
				1
			);
		else this.activeProviders.push(provider);
		this.refreshTimes = !this.refreshTimes;
	}
}

const store = new Store();

export default store;
