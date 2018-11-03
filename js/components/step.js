var Step = function(data) {
	var self = this instanceof Step 
					? this 
					: Object.create(Step.prototype);
	self.ordinal = ko.observable(data.ordinal);
	self.step = ko.observable(data.step);
	self.resultGrams = ko.observable(data.result_grams);
	self.repr = ko.computed(function() {
		return self.ordinal() + ") "+ self.step() + ".";
	}, self);
};