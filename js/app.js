
$(document).ready(function() {	

	var dataStr = JSON.stringify({"id": getUrlParameterDecodedValue("id")});
	$.ajax({
		url: 'https://cakes.abra.me/api/v2/recipe/get',
		type: 'POST',
		dataType: 'json',
		data: dataStr,
		contentType: 'application/json'
	}).done(function(data) {
		if(data.status === "ok") {
			var recipe = new Recipe(data.recipe);
			console.log(recipe.totalCost());
			VM = new ViewModel(recipe);
			ko.applyBindings(VM);		}
	});


	var ViewModel = function(recipe) {
		self = this;
		this.recipe = ko.observable(recipe);
		this.showStepsBtnName = ko.computed(function() {
			return this.recipe().stepsAreShown() ? "Скрыть рецепт" : "Показать рецепт"
		}, this);		
		this.changeStepsAreShown = function(recipe) {
			self.recipe().stepsAreShown(!self.recipe().stepsAreShown());
		};
	}; 
});
