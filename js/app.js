
$(document).ready(function() {	

	let payload = JSON.stringify({"id": getUrlParameterDecodedValue("id")});
	const recipeBuilder = new RecipeBuilder()
	$.ajax({
		url: 'https://cakes.abra.me/api/v2/recipe/get',
		type: 'POST',
		dataType: 'json',
		data: payload,
		contentType: 'application/json'
	}).done(function(data) {
		if (data.status === "ok") {
			let recipe = ko.observable(new Recipe(recipeBuilder.fromAbraSchema(data.recipe)));
			VM = new ViewModel(recipe);
			ko.applyBindings(VM);		
		}
	});


	var ViewModel = function(recipe) {
		self = this;
		this.recipe = recipe;
		this.showStepsBtnName = ko.computed(function() {
			return this.recipe().stepsAreShown() ? "Скрыть рецепт" : "Показать рецепт"
		}, this);		
		this.changeStepsAreShown = function(recipe) {
			self.recipe().stepsAreShown(!self.recipe().stepsAreShown());
		};
	}; 
});
