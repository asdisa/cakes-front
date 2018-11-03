
$(document).ready(function() {	

	var recipes = [];
	$.getJSON("https://cakes.abra.me/api/v2/recipe/all", function(data) {
		if (data.status === "ok") {
			var allRecipes = data.recipes;
			allRecipes.forEach(function (recipe) {
				recipes.push(new Recipe(recipe));
			});
		}
	}).done(function() {
		var VM = new ViewModel(recipes);
		ko.applyBindings(VM);
	});

	var ViewModel = function(recipes) {
		self = this;
		this.shownRecipes = ko.observableArray();
		this.canAddRecipes = ko.observable(true);
		this.addRecipe = function(){
			if (recipes.length > 0) {
				this.shownRecipes.push(recipes.pop());
			} else {
				self.canAddRecipes(false);
			}
		};
		this.addRecipes = function() {
			for (var i = 0; i < 11; i++) {
				self.addRecipe();
			}
		}
		self.addRecipes();
	}; 

});
