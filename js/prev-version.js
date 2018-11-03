
$(document).ready(function() {	



	var Ingredient = function(data, basicWeight, totalWeight) {
		this.basicQuantityUnits = ko.observable(data.quantity_number);
		this.currentQuantityUnits = ko.computed(function(){
			return totalWeight() / basicWeight * this.basicQuantityUnits()
		}, this);
		this.quantityGrams = ko.observable(data.quantity_grams);
		this.unit = ko.observable(data.unit);
		this.name = ko.observable(data.name);

		this.quantityRepr = ko.computed(function() {
			var integerPartOfWeight = parseInt(this.currentQuantityUnits());
			if (["шт", "стл", "чл"].indexOf(this.unit()) === -1) {
				
				return integerPartOfWeight;
			} else {
				var decimalPartOfWheight = this.currentQuantityUnits() - integerPartOfWeight;
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
				}, this);

				if (fractionText() !== "" && integerPartOfWeight === 0) {
					integerPartOfWeight = "";
				} else {
					integerPartOfWeight += " ";
				}
				return integerPartOfWeight + fractionText();
			} 
			
    	}, this);



		this.basicCost = ko.observable(0);
		if (data.cost !== undefined) {
			this.basicCost(data.cost * this.basicQuantityUnits());
		}

		this.currentCost = ko.computed(function(){
			return this.basicCost() * totalWeight() / basicWeight;
		}, this);

		this.costRepr = ko.computed(function() {
			if (this.currentCost().toFixed(2) !== "0.00") {
				return this.currentCost().toFixed(2) + "p";
			} else {
				return "";
			}
		}, this);	

		this.repr = ko.computed(function() {
			return this.name() + " ("+ this.quantityRepr() + " " + this.unit() + ") " + this.costRepr();
		}, this);


		this.quantityInPercent = ko.observable(this.quantityGrams() / (basicWeight / 100));
		this.quantityInPercentRepr = ko.observable(Math.round(this.quantityInPercent()) + "%");
		this.significantPercentValue = 5;
		this.progressBarVisible = ko.computed(function() {
			return this.quantityInPercent() >= this.significantPercentValue ? true : false
		}, this);

	};

	var Step = function(data) {
		this.ordinal = ko.observable(data.ordinal);
		this.text = ko.observable(data.text);
		this.resultGrams = ko.observable(data.result_grams);
		this.repr = ko.computed(function() {
			return this.ordinal() + ") "+ this.text();
		}, this);
	};



	var Tag = function(data) {
		this.text = ko.observable(data);
		this.url = ko.observable("https://cakes.abra.me/categories?tags=" + this.text().slice(1).split(" ").join("+"));
	};

	var Recipe = function(data) {
		this.id = ko.observable(data.id);
		this.title = ko.observable(data.title);
		this.imgLg = ko.observable("https://cakes.abra.me/" + data.img_large);
		this.imgMd = ko.observable("https://cakes.abra.me/" + data.img_medium);
		this.imgSm = ko.observable("https://cakes.abra.me/" + data.img_small);
		this.url = ko.observable("https://cakes.abra.me/?title=" + this.title().toLowerCase().split(" ").join("+"));
		this.changeUrl = ko.observable("https://cakes.abra.me/change_recipe?id=" + this.id());
		console.log(this.url());
		this.basicWeight = ko.observable(0);
		for (i = 0; i < data.ingredients.length; i++) {
			this.basicWeight(this.basicWeight() + data.ingredients[i].quantity_grams);
		};

		this.totalWeight = ko.observable(this.basicWeight());
		this.totalWeightRepr = ko.computed(function() {
			return this.totalWeight();
		}, this);	

		this.inputWeight = ko.observable("");	




		this.ingredients = ko.observableArray();
		this.majorIngredients = ko.observableArray();
		this.minorIngredients = ko.observableArray();

		for (i = 0; i < data.ingredients.length; i++) {
			this.ingredients.push(ko.observable(
				new Ingredient(data.ingredients[i], this.basicWeight(), this.totalWeight)));
			if (this.ingredients()[i]().progressBarVisible()) {
				this.majorIngredients.push(this.ingredients()[i]);
			} else {
				this.minorIngredients.push(this.ingredients()[i]);
			}
		};

		this.totalCost = ko.computed(function() {
			var sum = 0;
			for (var i = 0; i < this.ingredients().length; i++) {
				sum += this.ingredients()[i]().currentCost();
			}
			return sum.toFixed(2);
		}, this);

		//this.totalCost = ko.observable(this.basicCost());


		this.steps = ko.observableArray();
		for (i = 0; i < data.steps.length; i++) {
			this.steps.push(ko.observable(
				new Step(data.steps[i])));
		};

		this.tags = ko.observableArray();
		for (i = 0; i < data.tags.length; i++) {
			this.tags.push(ko.observable(
				new Tag(data.tags[i])));
		};

		this.recipeIsShown = ko.observable(true);
		this.stepsAreShown = ko.observable(false);
		this.btnName = ko.computed(function() {
			return this.stepsAreShown() ? "Скрыть рецепт" : "Показать рецепт"
		}, this);
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

	var recipes = [];
	var recipeIDs = [];
	$.getJSON("https://cakes.abra.me/api/list_recipes", function(data) {
  		data = data.message.recipes;
  		for (var i = 0; i < data.length; i++) {
  			recipeIDs.push(data[i].id);
  		};
	})
	  .done(function() {
	  	var count = 0
		for (var i = 0; i < recipeIDs.length; i++) {
			(function(id) {
				$.getJSON("https://cakes.abra.me/api/get_recipe?id=" + id, function(recipe) {
			  		if (recipe.status === "ok") {
				  		recipe = recipe.message.recipe;
				  		recipes.push(recipe);
				  		count++;
				  		if (count > recipeIDs.length - 1) done();	
			  		}
				});
			}(recipeIDs[i]));
		}
		function done() {
			var VM = new ViewModel();
			var recipeTitle = getUrlParameterDecodedValue("title");
			
			recipes.forEach(function(recipe) {
				var recipeObject = new Recipe(recipe);
				if (recipeTitle === "" || recipe.title.toLowerCase() === recipeTitle) {
					recipeObject.recipeIsShown(true);
				}
				VM.recipes.push(recipeObject);				
			});

			ko.applyBindings(VM);
		};
	});



	var ViewModel = function() {

		self = this;

		this.recipes = ko.observableArray();
		this.one = 1;

		this.changeStepsAreShown = function(recipe) {
			for (var i = 0; i < self.recipes().length; i++) {
				if (self.recipes()[i].id() === recipe.id()) {
					self.recipes()[i].stepsAreShown(!self.recipes()[i].stepsAreShown());
				};
			};
		};

		this.tag = ko.observable("");
		
		this.onTagBtnClick = function(tag) {
			console.log(tag);
		}
		

		this.searchByTag = function(tag) {
			var inputTagSet;
			if (tag.text === undefined) { //handleling user's input
				if (this.tag() === "") {return}
				tag = this.tag().split(" ").join("");
				//console.log(tag);
				inputTagSet = new Set(tag.split(","));
			} else {
				inputTagSet = new Set([tag.text()]);
				tag = tag.text();
			}


			var adress = "https://cakes.abra.me/api/list_recipes_by_tag?tag=" + tag.split("#").join("%23");
			console.log(adress);
			$.getJSON(adress, function(data) {
				data = data.message.recipes;
				self.recipes().forEach(function(recipe) {
					var ok = false;
					var recipeTagSet = new Set([]);
					//console.log(recipe.tags());
					recipe.tags().forEach(function(recipeTag) {
						recipeTagSet.add(recipeTag().text());						
					});
					var mergedTagSet = new Set(function*() { yield* inputTagSet; yield* recipeTagSet; }());;
					if (mergedTagSet.size === recipeTagSet.size) {
						ok = true;
					}
					recipe.recipeIsShown(ok);
				});
				console.log("Serach finished");
			});
		};
	}; 

});
