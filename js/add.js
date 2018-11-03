$(document).ready(function() {	

	var Unit = function(name, inGrams) {
		this.unitName = name;
		this.inGrams = inGrams;
	}

	var Ingredient = function() {

		this.avaliableUnits = ko.observableArray([
			new Unit("г", 1),
			new Unit("мл", 1),
			new Unit("чл", 5),
			new Unit("стл", 20),	
			new Unit("шт", 100)
		]);

		this.selectedUnit = ko.observable(this.avaliableUnits()[0]);

		this.gramPerUnitInputShown = ko.computed(function() {
			if (this.selectedUnit() == this.avaliableUnits()[4]) {
				return true;
			}
			return false;
		}, this);

		this.gramPerUnit = ko.observable();

		this.quantityUnits = ko.observable();

		this.quantityGrams = ko.computed(function() {
			if (this.gramPerUnitInputShown()) {
				return this.quantityUnits() * this.gramPerUnit();
			}
			console.log(this.quantityUnits(), this.selectedUnit().inGrams, this.quantityUnits() * this.selectedUnit().inGrams)
			return this.quantityUnits() * this.selectedUnit().inGrams;
		}, this);

		this.name = ko.observable();

		this.cost = ko.observable(0);
		
		this.costPerGram = ko.computed(function() {
			return this.cost() / this.quantityGrams();
		}, this);
	};

	var Step = function(ordinal) {
		this.ordinal = ko.observable(ordinal);
		this.text = ko.observable();
	};

	var Tag = function(data) {
		this.text = ko.observable(data);
	};

	var Recipe = function(data) {
		data = data.message.recipe;
		this.id = ko.observable(data.id);
		this.title = ko.observable(data.title);
		
		this.totalWeight = ko.observable();
		this.ingredients = ko.observableArray();

		for (i = 0; i < data.ingredients.length; i++) {
			this.ingredients.push(data.ingredients()[i]);
		};

		this.steps = ko.observableArray();
		for (i = 0; i < data.steps.length; i++) {
			this.steps.push(data.steps()[i]);
		};

		this.tags = ko.observableArray();
		for (i = 0; i < data.tags.length; i++) {
			this.tags.push(data.tags()[i]);
		};
	};	
		


	


	var ViewModel = function(data) {
		self = this;
		this.title = ko.observable("");
		this.ingredients = ko.observableArray([new Ingredient()]);
		this.canAddIngredient = ko.observable(true);
		this.maxIngredients = 15;		
		this.addIngredient = function(data) {
			if (self.ingredients().length < self.maxIngredients) {
				self.ingredients.push(new Ingredient());
			} else {
				canAddIngredient = ko.observable(false);
			}
			console.log(self.ingredients());
		};

		this.removeIngredient = function() {
        	self.ingredients.remove(this);
    	};
		this.steps = ko.observableArray([{"text": ""}]);
		this.canAddStep = ko.observable(true);
		this.maxSteps = 15;
		this.addStep = function(data) {
			if (self.steps().length < self.maxSteps) {
				self.steps.push({"text": ""});
			} else {
				canAddStep = ko.observable(false);
			}
			console.log(self.steps());
		};

		this.removeStep = function() {
			self.steps.remove(this);
		};


		this.tags = ko.observableArray([{"text": ""}]);
		this.canAddTag = ko.observable(true);
		this.maxTags = 10;

		this.addTag = function(data) {
			if (self.tags().length < self.maxTags) {
				self.tags.push({"text": ""});
			} else {
				canAddTag = ko.observable(false);
			}
			console.log(self.tags());
		}

		this.removeTag = function() {
			self.tags.remove(this);
		}

		this.imgLg = ko.observable("");
		this.imgSm = ko.observable("");
		this.imgMd = ko.observable("");
		//console.log(self.imgSm());
		this.hasImg = function() {
			return self.imgSm() !== "";
		};

		this.loadImg = function() {
			console.log("clicked");
			$.ajax({
		        // Your server script to process the upload
		        url: '/api/img/upload',
		        type: 'POST',

		        // Form data
		        data: new FormData($('form')[0]),

		        // Tell jQuery not to process data or worry about content-type
		        // You *must* include these options!
		        cache: false,
		        contentType: false,
		        processData: false,
		        success: function(answer) {
		        	self.imgLg(answer.message.img_large);
		        	self.imgSm(answer.message.img_small);
		        	self.imgMd(answer.message.img_medium);
		        	console.log("has img:", self.hasImg());
		        },
		        // Custom XMLHttpRequest
		        xhr: function() {
		            var myXhr = $.ajaxSettings.xhr();
		            if (myXhr.upload) {
		                // For handling the progress of the upload
		                myXhr.upload.addEventListener('progress', function(e) {
		                    if (e.lengthComputable) {
		                        $('progress').attr({
		                            value: e.loaded,
		                            max: e.total,
		                        });
		                    }
		                } , false);
		            }
		            console.log("done");
		            return myXhr;
		        },
		    });
		}

		this.makeRecipe = function() {
			var newRecipe = {
				"ingredients": [], 
				"steps": [],
				"tags": [],  
				"title": self.title()
			};

			if (self.hasImg()) {
				newRecipe.img_large = self.imgLg();
				newRecipe.img_medium = self.imgMd();
				newRecipe.img_small = self.imgSm();
			}
			console.log(newRecipe);

			for (var i = 0; i < self.ingredients().length; i++) {
				var ingredient = self.ingredients()[i];
				newRecipe.ingredients.push({
					"name": ingredient.name(), 
					"quantity_grams": ingredient.quantityGrams(), 
					"quantity_number": parseInt(ingredient.quantityUnits()), 
					"quantity_text": Math.round(ingredient.quantityUnits()).toString(), 
					"unit": ingredient.selectedUnit().unitName,
					"cost_base_name": ingredient.name(),
					"cost_per_gram": ingredient.costPerGram()
			    });
			}
			

			for (var i = 0; i < self.steps().length; i++) {
				var step = self.steps()[i];
				newRecipe.steps.push({
					"ordinal": i + 1,
					"text": step.text
				});				
			}
			

			for (var i = 0; i < self.tags().length; i++) {
				var tag = self.tags()[i].text;
				if (tag[0] !== "#") {
					tag = "#" + tag;
				}
				newRecipe.tags.push(tag);
			}
			console.log(newRecipe);
			
			$.ajax({
			    type: 'POST',
			    url: 'https://cakes.abra.me/api/add_recipe',
			    data: JSON.stringify(newRecipe),
			    success: function(data) { alert("Рецепт успешно добавлен"); },
			    contentType: "application/json",
			    dataType: 'json'
			});
				

		};
	}

	ko.applyBindings(new ViewModel());
});



