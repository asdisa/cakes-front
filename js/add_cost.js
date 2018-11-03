$(document).ready(function() {	

	var Unit = function(name, inGrams) {
		this.unitName = name;
		this.inGrams = inGrams;
	}

	var ViewModel = function(data) {
		self = this;
		this.avaliableUnits = ko.observableArray([
			new Unit("г", 1),
			new Unit("мл", 1),
			new Unit("ч л", 5),
			new Unit("ст л", 20),
			new Unit("шт", 100)
		]);
		this.quantityUnits = ko.observable();
		this.selectedUnit = ko.observable(self.avaliableUnits()[0]);
		this.grammPerPieceInputShown = ko.computed(function() {
			if (self.selectedUnit() === self.avaliableUnits()[4]) {
				return true;	
			}
			return false;
		}, this);
		this.grammPerPiece = ko.observable();
		this.quantityGrams = ko.computed(function() {
			if (self.selectedUnit() !== self.avaliableUnits()[4]) {
				return self.quantityUnits() * self.selectedUnit().inGrams;
			}
			return self.quantityUnits() * self.grammPerPiece();
		},this);
		this.baseName = ko.observable();
		this.cost = ko.observable();
		this.costPerGram = function() {
			return self.cost() / self.quantityGrams();
		};


		this.addCost = function() {
			var cost = {
				base_name: self.baseName(),
				cost_per_gram: self.costPerGram()
			};
			console.log(self.cost(), self.quantityGrams(), self.costPerGram(), cost);
			$.ajax({
			    type: 'POST',
			    url: 'https://cakes.abra.me/api/cost/add',
			    data: JSON.stringify(cost),
			    success: function(data) { alert("Стоимость успешно добавлена"); },
			    contentType: "application/json",
			    dataType: 'json'
			});
				

		};
	}

	ko.applyBindings(new ViewModel());
});



