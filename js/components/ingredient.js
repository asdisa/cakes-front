var Ingredient = function(data, basicWeight, totalWeight) {
	var self = this instanceof Ingredient 
					? this 
					: Object.create(Ingredient.prototype);
	self.basicQuantityUnits = ko.observable(data.quantity_number);
	self.currentQuantityUnits = ko.computed(function(){
		return totalWeight() / basicWeight * self.basicQuantityUnits()
	}, self);
	self.unit = ko.observable(data.unit);
	
	self.costBaseName = ko.observable(data.cost_base_name);
	self.costPerGramm = ko.observable(data.cost_per_gramm);
	self.name = ko.observable(data.name);
	self.quantityGrams = ko.observable(data.quantity_grams);
	self.quantityNumber = ko.observable(data.quantity_number);
	self.quantityText = ko.observable(data.quantity_text);
	self.unit = ko.observable(data.unit);

	self.quantityRepr = ko.computed(function() {
		var integerPartOfWeight = parseInt(self.currentQuantityUnits());
		if (["шт", "стл", "чл"].indexOf(self.unit()) === -1) {
			
			return integerPartOfWeight;
		} else {
			var decimalPartOfWheight = self.currentQuantityUnits() - integerPartOfWeight;
			var fractionText = ko.computed(function() {
				if (decimalPartOfWheight < 0.25) {
					return "";
				}
				if (decimalPartOfWheight < 0.33) {
					return "1/4";
				}
				if (decimalPartOfWheight < 0.5) {
					return "1/3";
				}
				if (decimalPartOfWheight < 0.66) {
					return "1/2";
				}
				if (decimalPartOfWheight < 0.75) {
					return "2/3";
				}
				if (decimalPartOfWheight < 1) {
					return "3/4";
				}
			}, self);

			if (fractionText() !== "" && integerPartOfWeight === 0) {
				integerPartOfWeight = "";
			} else {
				integerPartOfWeight += " ";
			}
			return integerPartOfWeight + fractionText();
		} 
		
	}, self);



	self.basicCost = ko.observable(0);
	if (data.cost_per_gram !== undefined) {
		self.basicCost(data.cost_per_gram * self.quantityGrams());
		console.log(data.cost_per_gram);
	}

	self.currentCost = ko.computed(function(){
		return self.basicCost() * totalWeight() / basicWeight;
	}, self);

	self.costRepr = ko.computed(function() {
		if (self.currentCost().toFixed(2) !== "0.00") {
			return self.currentCost().toFixed(2) + "p";
		} else {
			return "";
		}
	}, self);	

	self.repr = ko.computed(function() {
		return self.name() + " ("+ self.quantityRepr() + " " + self.unit() + ") " + self.costRepr();
	}, self);


	self.quantityInPercent = ko.observable(self.quantityGrams() / (basicWeight / 100));
	self.quantityInPercentRepr = ko.observable(Math.round(self.quantityInPercent()) + "%");
	self.significantPercentValue = 5;
	self.progressBarVisible = ko.computed(function() {
		return self.quantityInPercent() >= self.significantPercentValue ? true : false
	}, self);
};