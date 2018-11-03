var Recipe = function(data) {
	var self = this instanceof Recipe 
					? this
					: Object.create(Recipe.prototype);
	self.id = ko.observable(data.id);
	self.url = ko.observable("https://cakes.abra.me/recipe?id=" + self.id());
	console.log(self.url());
	self.title = ko.observable(data.title);
	self.isPublic = ko.observable(true);
	self.ownerNickname = ko.observable();
	self.imgSm = ko.observable();
	self.hasImg = ko.computed(function() {
		return data.img_small !== undefined;
	}, self);
	self.imgSm("https://cakes.abra.me/" + data.img_small);
	self.imgLg = ko.observable("https://cakes.abra.me/" + data.img_large);
	self.imgMd = ko.observable("https://cakes.abra.me/" + data.img_medium);

	self.tags = ko.observableArray();
	for (i = 0; i < data.tags.length; i++) {
		self.tags.push(ko.observable(
			new Tag(data.tags[i])));
	};

	if (data.cost_summary !== undefined) {
		self.totalCost = ko.observable(data.cost_summary.total_cost);
		self.totalCostPerGram = ko.observable(data.cost_summary.total_cost_per_gram);
		self.totalQuantityGrams = ko.observable(data.cost_summary.total_quantiy_grams);
	}	
	
	if (data.ingredients !== undefined) {
		self.basicWeight = ko.observable(0);
		for (i = 0; i < data.ingredients.length; i++) {
			self.basicWeight(self.basicWeight() + data.ingredients[i].quantity_grams);
		};
		self.totalWeight = ko.observable(self.basicWeight());
		self.totalWeightRepr = ko.computed(function() {
			return self.totalWeight();
		}, self);	
		self.inputWeight = ko.observable("");	
		self.ingredients = ko.observableArray();
		self.majorIngredients = ko.observableArray();
		self.minorIngredients = ko.observableArray();

		for (i = 0; i < data.ingredients.length; i++) {
			self.ingredients.push(ko.observable(
				new Ingredient(data.ingredients[i], self.basicWeight(), self.totalWeight)));
			if (self.ingredients()[i]().progressBarVisible()) {
				self.majorIngredients.push(self.ingredients()[i]);
			} else {
				self.minorIngredients.push(self.ingredients()[i]);
			}
		};

		self.totalCost = ko.computed(function() {
			var sum = 0;
			for (var i = 0; i < self.ingredients().length; i++) {
				sum += self.ingredients()[i]().currentCost();
			}
			return sum.toFixed(2);
		}, self);

		self.steps = ko.observableArray();
		for (i = 0; i < data.steps.length; i++) {
			self.steps.push(ko.observable(
				new Step(data.steps[i])));
		};
	}

	self.changeUrl = ko.observable("https://cakes.abra.me/change_recipe?id=" + self.id());
	self.recipeIsShown = ko.observable(true);
	self.stepsAreShown = ko.observable(false);
	self.showStepsBtnName = ko.computed(function() {
		return self.stepsAreShown() ? "Скрыть рецепт" : "Показать рецепт"
	}, self);
}