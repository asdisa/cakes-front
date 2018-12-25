class Tag {
    constructor(tagObj=null) {
        this.text = ko.observable(tagObj.text);
        this.repr = ko.observable(`#${tagObj.text}`);
        this.selected = ko.observable(false);
        this.url = ko.observable("https://cakes.abra.me?tags=" + this.text().slice(1).split(" ").join("+"));
    } 
}

class Step {
    constructor(stepObj=null) {
        this.ordinal = ko.observable(stepObj.ordinal);
        this.text = ko.observable(stepObj.text);
        this.repr = ko.computed(() => `${this.ordinal()}) ${this.text()}.`)
    }
}

class Ingredinet {
    constructor(ingredientObj=null, basicWeight=ko.observable(1), totalWeight=ko.observable(1)) {
        this.title = ko.observable(ingredientObj.title);
        this.basicQuantityUnits = ko.observable(ingredientObj.quantity_units);
        this.unit = ko.observable(ingredientObj.unit);
        this.costPerGram = ko.observable(ingredientObj.cost_per_gram);
        this.quantityGrams = ko.observable(ingredientObj.quantity_grams);
        this.basicCost = ko.observable(ingredientObj.cost_per_gram ? ingredientObj.cost_per_gram * this.quantityGrams() : 0);
        this.quantityInPercent = ko.observable(this.quantityGrams() / (basicWeight() / 100));
	    this.quantityInPercentRepr = ko.observable(Math.round(this.quantityInPercent()) + "%");
        this.currentQuantityUnits = ko.computed(() => 
            totalWeight() / basicWeight() * this.basicQuantityUnits()
        );
        this.quantityRepr = ko.computed(function() {
            let integerPartOfWeight = parseInt(this.currentQuantityUnits());
            if (["шт", "стл", "чл"].indexOf(this.unit()) === -1) {
                return integerPartOfWeight;
            } else {
                const decimalPartOfWheight = this.currentQuantityUnits() - integerPartOfWeight;
                const fractionText = ko.computed(function() {
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
                });
                integerPartOfWeight = fractionText() !== "" && integerPartOfWeight === 0 ? "" : integerPartOfWeight + " ";
                return integerPartOfWeight + fractionText();
            } 
        }, this);
        
        console.log(this.basicCost(), this.currentQuantityUnits(), this.basicQuantityUnits())
        this.currentCost = ko.computed(() => this.basicCost() * this.currentQuantityUnits() / this.basicQuantityUnits());
        this.costRepr = ko.computed(() => this.currentCost().toFixed(2) === "0.00" ? "" : this.currentCost().toFixed(2) + "p");
        this.repr = ko.computed(() => `${this.title()} (${this.quantityRepr()} ${this.unit()}) ${this.costRepr()}`)
        const significantPercentValue = 5;
        this.progressBarVisible = ko.computed(() => this.quantityInPercent() >= significantPercentValue ? true : false)
    }
}

class RecipeCard {
    constructor(recipeCardObj=null, selectedTags) {
        this.id = ko.observable(recipeCardObj.id ? recipeCardObj.id : null);
        this.url = ko.observable(`https://cakes.abra.me/recipe?id=${this.id()}`);
        this.title = ko.observable(recipeCardObj.title);
        this.imgSm = ko.observable(recipeCardObj.img_small ? `https://cakes.abra.me${recipeCardObj.img_small}` : null);
        this.hasImg = ko.observable(this.imgSm != null);
        this.tags = ko.observableArray();
        this.visible = ko.computed(() => {
            return this.tags().filter(tag => selectedTags().includes(tag().text())).length === selectedTags().length; 
        });

        for (let tagObj of recipeCardObj.tags) {
            this.tags.push(ko.observable(new Tag(tagObj)));
        };
        this.checkTags = ko.computed(() => {
            for (let tag of this.tags()) {
                if(selectedTags().includes(tag().text())){
                    tag().selected(true);
                } else { tag().selected(false); }
            }
        });
    }
}

class Recipe {
    constructor(recipeObj=null) {
        this.id = ko.observable(recipeObj.id ? recipeObj.id : null);
	    this.url = ko.observable(`https://cakes.abra.me/recipe?id=${this.id()}`);
        this.title = ko.observable(recipeObj.title);
        this.ownerEmail = ko.observable(recipeObj.ownerEmail);
        this.isPublic = ko.observable(true);
        this.imgSm = ko.observable(recipeObj.img_small ? `https://cakes.abra.me${recipeObj.img_small}` : null);
        this.imgLg = ko.observable(recipeObj.img_large ? `https://cakes.abra.me${recipeObj.img_large}` : null);
	    this.imgMd = ko.observable(recipeObj.img_medium ? `https://cakes.abra.me${recipeObj.img_medium}` : null);
        
        this.hasImg = ko.computed(() => this.imgSm !== undefined);
        this.tags = ko.observableArray();
        for (let tagObj of recipeObj.tags) {
            this.tags.push(ko.observable(new Tag(tagObj)));
        };

        this.steps = ko.observableArray();
        for (let stepObj of recipeObj.steps) {
            this.steps.push(ko.observable(new Step(stepObj)));
        };

        this.basicWeight = ko.observable(0);	
		this.ingredients = ko.observableArray();
		this.majorIngredients = ko.observableArray();
        this.minorIngredients = ko.observableArray();
        
        for (let ingredientObj of recipeObj.ingredients) {
            this.basicWeight(this.basicWeight() + ingredientObj().quantity_units);
        };

        

        this.totalQuantityGrams = ko.observable(recipeObj.total_quantiy_grams);
        this.totalQuantityGramsRepr = ko.computed(() => this.totalQuantityGrams());

        for (let ingredientObj of recipeObj.ingredients) {
           let ingredient = ko.observable(new Ingredinet(ingredientObj(), this.basicWeight, this.totalQuantityGrams));

            this.ingredients.push(ingredient);
            if (ingredient().progressBarVisible()) {
				this.majorIngredients.push(ingredient);
			} else {
				this.minorIngredients.push(ingredient);
			}
        };
		
        this.totalCost = ko.computed(() => this.ingredients().map(ingredient => ingredient().currentCost()).reduce((prev, next) => prev + next, 0).toFixed(2));
        this.totalCostPerGram = ko.computed(() => this.ingredients().map(ingredient => ingredient().costPerGram()).reduce((prev, next) => prev + next, 0).toFixed(2));
        
        this.changeUrl = ko.observable("https://cakes.abra.me/change_recipe?id=" + this.id());
        this.recipeIsShown = ko.observable(true);
        this.stepsAreShown = ko.observable(false);
        this.showStepsBtnName = ko.computed(() => this.stepsAreShown() ? "Скрыть рецепт" : "Показать рецепт");
    }
}
