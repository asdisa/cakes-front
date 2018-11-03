
$(document).ready(function() {	

	var Unit = function(name, inGrams) {
		this.unitName = name;
		this.inGrams = inGrams;
	}

	var Ingredient = function(ingredient) {

		this.avaliableUnits = ko.observableArray([
			new Unit("г", 1),
			new Unit("мл", 1),
			new Unit("ч л", 5),
			new Unit("ст л", 20),
			new Unit("шт", 100)
		]);
		this.selectedUnit = ko.observable(this.avaliableUnits()[0]);
		this.grammPerUnitInputShown = ko.computed(function() {
			if (this.selectedUnit() === this.avaliableUnits()[4]) {
				return true;	
			}
			return false;
		}, this);
		this.quantityUnits = ko.observable(100);
		this.quantityGrams = ko.observable(100);
		this.grammPerUnit = ko.computed(function(){ 
			return this.quantityGrams() / this.quantityUnits()
		}, this);
		this.name = ko.observable("");

		if (ingredient !== undefined) {
			this.selectedUnit(this.avaliableUnits().find(function(unit) {
				return unit.unitName === ingredient.unit;
			}));

			this.quantityUnits(ingredient.quantity_number);
			this.quantityGrams(ingredient.quantity_grams);
			this.name(ingredient.name);
		}
		this.cost = ko.observable(0);
		console.log(ingredient);
		if (ingredient.cost_per_gram !== undefined) {
			this.cost(ingredient.cost_per_gram * this.quantityGrams());
		}
		this.costPerGram = ko.computed(function() {
			return this.cost() / this.quantityGrams();
		}, this);
		
	};

	var Step = function(step) {
		this.text = ko.computed(function() {
			if (step !== undefined) {
				return step.text;
			}
			return "";
		}, this);
		this.textInput = ko.observable(this.text());
	};

	var Tag = function(text) {
		this.text = ko.observable(text);
	};

	var Recipe = function(recipe) {
		this.id = ko.observable(recipe.id);
		this.title = ko.observable(recipe.title);
		this.titleIsOK = ko.computed(function() {
			return this.title() === "";
		}, this);
		this.titleIsNotOk = ko.observable(!this.titleIsOK());
		this.imgLg = ko.observable();
		this.imgSm = ko.observable();
		this.imgMd = ko.observable();
		this.hasImg = ko.computed(function() {
			return recipe.img_small !== undefined;
		}, this);
		if (this.hasImg()) {
			this.imgLg("https://cakes.abra.me/" + recipe.img_large);
			this.imgMd("https://cakes.abra.me/" + recipe.img_medium);
			this.imgSm("https://cakes.abra.me/" + recipe.img_small);
		}
		this.ingredients = ko.observableArray();

		for (i = 0; i < recipe.ingredients.length; i++) {
			this.ingredients.push(new Ingredient(recipe.ingredients[i]));
		};

		this.steps = ko.observableArray();
		for (i = 0; i < recipe.steps.length; i++) {
			this.steps.push(new Step(recipe.steps[i]));
		};

		this.tags = ko.observableArray();
		for (i = 0; i < recipe.tags.length; i++) {
			this.tags.push(new Tag(recipe.tags[i]));
		};
	};

	function getUrlParameterDecodedValue(param) {
		var urlEnding = window.location.search.substring(1);
		var urlParams =  urlEnding.split('&');
		for (var i = 0; i < urlParams.length; i++) {
			var paramPair = urlParams[i].split('=');
			if (paramPair[0] == param) {
				return decodeURI(paramPair[1]).split("+").join(" ");
			}
		}
		return "";
	}

	var changingRecipeId = getUrlParameterDecodedValue("id");
	var apiResponse;
	var canWorkWithRecipe = false;
	console.log(1);
	$.getJSON("https://cakes.abra.me/api/get_recipe?id=" + changingRecipeId, function(data) {
  		apiResponse = data;
  		if (apiResponse.status === "ok") {
  			canWorkWithRecipe = true;
  		}
	}).done(function() {
		var recipeObj = new Recipe(apiResponse.message.recipe);
		console.log(recipeObj);
		var VM = new ViewModel(recipeObj);
		ko.applyBindings(VM);
	});

	var ViewModel = function(recipe) {
		self = this;
		this.recipe = ko.observable(recipe);

		this.addTag = function() {
			self.recipe().tags.push(new Tag());
		}
		this.removeTag = function(removedTag) {
			self.recipe().tags.remove(removedTag);
		}

		this.addIngredient = function() {
			self.recipe().ingredients.push(new Ingredient());
		}
		this.removeIngredient = function(removedIngredient) {
			self.recipe().ingredients.remove(removedIngredient);
		}

		this.addStep = function() {
			self.recipe().steps.push(new Step());
		}
		this.removeStep = function(removedStep) {
			self.recipe().steps.remove(removedStep);
		}		

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
		        	self.recipe().imgLg(answer.message.img_large);
		        	self.recipe().imgSm(answer.message.img_small);
		        	self.recipe().imgMd(answer.message.img_medium);
		        	console.log("has img:", self.recipe().hasImg());
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
				"id": self.recipe().id(),
				"ingredients": [], 
				"steps": [],
				"tags": [], 
				"title": self.recipe().title()
			};
			if (self.recipe().hasImg()) {
				newRecipe.img_large = self.recipe().imgLg();
				newRecipe.img_small = self.recipe().imgSm();
				newRecipe.img_medium = self.recipe().imgMd();

			}

			for (var i = 0; i < self.recipe().ingredients().length; i++) {
				var ingredient = self.recipe().ingredients()[i];
				newRecipe.ingredients.push({
					"name": ingredient.name(), 
					"quantity_grams": ingredient.quantityGrams(), 
					"quantity_number": parseInt(ingredient.quantityUnits()), 
					"quantity_text": Math.round(ingredient.quantityUnits()).toString(), 
					"cost_base_name": ingredient.name(),
					"cost_per_gram": ingredient.costPerGram(), 
					"unit": ingredient.selectedUnit().unitName
			    });
			}
			

			for (var i = 0; i < self.recipe().steps().length; i++) {
				var step = self.recipe().steps()[i];

				console.log(step.text());
				newRecipe.steps.push({
					"ordinal": i + 1,
					"text": step.textInput()
				});				
			}
			

			for (var i = 0; i < self.recipe().tags().length; i++) {
				var tag = self.recipe().tags()[i].text();
				if (tag[0] !== "#") {
					tag = "#" + tag;
				}
				newRecipe.tags.push(tag);
			}
			console.log(newRecipe);
			return newRecipe;
		}

		this.print = function() {
			console.log(self.makeRecipe());
		}

		this.changeRecipe = function() {
			self.print();
			$.ajax({
			    type: 'POST',
			    url: 'https://cakes.abra.me/api/recipe/change',
			    data: JSON.stringify(self.makeRecipe()),
			    success: function(data) { alert("Рецепт успешно изменен"); },
			    contentType: "application/json",
			    dataType: 'json'
			});
			//console.log("Changed");
		}

		this.deleteRecipe = function() {
			var id = {
				id: self.recipe().id()
			};
			$.ajax({
			    type: 'POST',
			    url: 'https://cakes.abra.me/api/delete_recipe?id=' + self.recipe().id(),
			    success: function(data) { alert("Рецепт успешно удален"); },
			    contentType: "application/json",
			    dataType: 'json'
			});
			console.log("deleted");
		}
 	}


});
