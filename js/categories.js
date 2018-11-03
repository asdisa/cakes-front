
$(document).ready(function() {	



	var Tag = function(data) {
		this.text = ko.observable(data);
		this.selected = ko.observable(false);
		this.url = ko.observable("https://cakes.abra.me/categories?tags=" + this.text().slice(1).split(" ").join("+"));
		this.onClick = function(data) {
			this.selected(!this.selected());
			console.log(this.selected());
		}

		//this.urlWithoutThisTag = ko.observable(decodeURI(window.location.href).replace(new RegExp(",?"+this.urlRepr()+"", "g"), ""));


		/*this.newUrl = ko.computed(function() {
			if (this.selected()) {
				return this.urlWithoutThisTag();
			}

			if (window.location.href.search(/\?tags=./) === -1 ){
				return this.urlOfJustThisTag();
			}
			return window.location.href + "," +this.urlRepr();
		}, this);*/		
		//console.log(this.url());
	};

	var Recipe = function(data) {
		this.id = ko.observable(data.id);
		this.title = ko.observable(data.title);
		this.title1 = ko.observable(1);
		this.imgLg = ko.observable();
		this.imgSm = ko.observable();
		this.imgMd = ko.observable();
		this.hasImg = ko.computed(function() {
			return data.img_small !== undefined;
		}, this);
		if (this.hasImg()) {
			this.imgLg("https://cakes.abra.me/" + data.img_large);
			this.imgMd("https://cakes.abra.me/" + data.img_medium);
			this.imgSm("https://cakes.abra.me/" + data.img_small);
		}
		this.url = ko.observable("https://cakes.abra.me/recipe?id=" + this.id());	
		this.description = ko.computed(function() {
			if (data.steps[0] === undefined) {
				return "";
			}
			var arrayOfWordsInFirstStep = data.steps[0].text.split(" ");
			if (arrayOfWordsInFirstStep.length > 20) {
				arrayOfWordsInFirstStep = arrayOfWordsInFirstStep.slice(0, 20);
			}
			return arrayOfWordsInFirstStep.join(" ");
		}, this);

		//ko.observable(data.steps[0].text.split(" ").slice(0, 20) + "...");
		console.log(data.id);
		console.log(data.steps[0]);
		this.tags = ko.observableArray();
		for (i = 0; i < data.tags.length; i++) {
			this.tags.push(ko.observable(
				new Tag(data.tags[i])));
		};

		this.containsAllTags = function(tagsObservableArray) {
			var testingSetOfTagTexts = new Set([]);
			this.tags().forEach(function(tagObservable) {
				testingSetOfTagTexts.add(tagObservable().text());
			});

			var mergedTagSet = new Set(testingSetOfTagTexts);
			tagsObservableArray().forEach(function(tag) {
				mergedTagSet.add(tag.text());
			});
			return testingSetOfTagTexts.size === mergedTagSet.size;
		}

		this.recipeIsShown = ko.observable(false);
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
		return -1;
	}

	function getSetOfTagsInUrl() {
		var stringOfTags = getUrlParameterDecodedValue("tags");
		if (stringOfTags === -1) {
			return new Set([]);
		}
		var arrayOfTagsInUrl = stringOfTags.split(",");
		for (var i = 0; i < arrayOfTagsInUrl.length; i++) {
			arrayOfTagsInUrl[i] = "#" + arrayOfTagsInUrl[i];
		}
		return new Set(arrayOfTagsInUrl);
	}

	var recipes = [];
	var recipeIDs = [];
	var tags = new Set([]);

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
			  		recipe = recipe.message.recipe;
			  		recipes.push(recipe);
					recipe.tags.forEach(function(tag) {
						tags.add(tag);
					});
					
			  		count++;
			  		if (count > recipeIDs.length - 1) done();	
				});
			}(recipeIDs[i]));
		}
		function done() {
			var VM = new ViewModel();
			
			var tag = getUrlParameterDecodedValue("tags");
			var setOfTagsInUrl = getSetOfTagsInUrl();
			
			console.log(VM.selectedTags());

			var tagArray = [];
			tags.forEach(function(tag) {
				var tagObject = new Tag(tag);
				if (setOfTagsInUrl.has(tag)) {
					tagObject.selected(true);
				}
				tagArray.push(tagObject);	
			});
			tagArray.sort(function(a, b) {
				var textA = a.text().toUpperCase();
				var textB = b.text().toUpperCase();
				if (textA < textB) {
					return -1;
				}
				if (textA > textB) {
					return 1;
				}
				return 0;
			});
			VM.tags(tagArray);


			recipes.forEach(function(recipe) {
				VM.recipes.push(new Recipe(recipe));	
			});



			//console.log(VM.tags());
			ko.applyBindings(VM);
		};
	});

	var One = function(value) {
		this.value = ko.observable(value);
	}

	var ViewModel = function() {

		self = this;

		this.recipes = ko.observableArray();

		this.tags = ko.observableArray();
		this.selectedTags = ko.computed(function() {
			var selectedTags = [];
			self.tags().forEach(function(tag) {
				if (tag.selected() === true) {
					selectedTags.push(tag);
				}
			});
			return selectedTags;
		}, this);

		this.shownRecipes = ko.computed(function() {
			var recipesWithTags = [];
			self.recipes().forEach(function(recipe) {
				if (recipe.containsAllTags(self.selectedTags)) {
					recipesWithTags.push(recipe);
				}
			});
			return recipesWithTags;
		}, this);

		this.onTagBtnClick = function(clickedTag) {
			self.tags().forEach(function(tag) {
				if (tag == clickedTag) {
					clickedTag.selected(!clickedTag.selected());
					console.log("Selected tags: ", self.selectedTags());
					console.log("Shown recipes: ", self.shownRecipes());

				}
			});
		}

		
	}; 
});
