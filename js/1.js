
$(document).ready(function() {	

	let recipes = [];
	let selectedTags = [];
	const recipeCardBuilder = new RecipeCardBuilder();
	$.getJSON("https://cakes.abra.me/api/v2/recipe/all", data => {
		if (data.status === "ok") {
			const allRecipes = data.recipes;
			for (recipe of allRecipes) {
				recipes.push(ko.observable(new RecipeCard(recipeCardBuilder.fromAbraSchema(recipe))));
			}
		}
	}).done(function() {
		var VM = new ViewModel(recipes);
		ko.applyBindings(VM);
	});

	let ViewModel = function(recipes) {
		self = this;
		this.shownRecipes = ko.observableArray();
		this.canShowMoreRecipes = ko.observable(true);
		
		this.selectTag = (tag) => {
			let checkSelectTag = selectedTags.indexOf(tag);
			if(checkSelectTag == -1){
				selectedTags.push(tag);
				console.log(selectedTags);
			}

			else {
				selectedTags.splice(checkSelectTag, 1);
				console.log(selectedTags);
			}
			this.checkTag();
		}
		
		this.showOneMoreRecipe = () => {
			if (recipes.length > 0) {
				this.shownRecipes.push(recipes.pop());
			} else {
				self.canShowMoreRecipes(false);
			}
		};
		this.showMoreRecipes = function() {
			for (let i = 0; i < 11; i++) {
				self.showOneMoreRecipe();
			}
		}
		self.showMoreRecipes();
	}; 

});
