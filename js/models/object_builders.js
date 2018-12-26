class TagBuilder {
    constructor() { }

    fromAbraSchema(text) {
        let tagObj = new TagObj();
        tagObj.text = text;
        return tagObj;
    }

    fromDisaSchema(text) {
        let tagObj = new TagObj();
        tagObj.text = text;
        return tagObj;
    }

    toDisaSchema(tag) {
        return tag().text();
    }

    toAbraSchema(tag) {
        return tag().text();
    }
}


class StepBuilder {
    constructor() { }

    fromAbraSchema(abraStep) {
        let stepObj = new StepObj();
        stepObj.ordinal = abraStep.ordinal;
        stepObj.text = abraStep.step;
        return stepObj;
    }

    fromDisaSchema(disaStep, ordinal) {
        let stepObj = new StepObj();
        stepObj.ordinal = ordinal;
        stepObj.text = disaStep;
        return stepObj;
    }

    toAbraSchema(step) {
        const abraStepObj = {
            "ordinal": step().ordinal(),
            "step": step().text()
        }
        return abraStepObj;
    }

    toDisaSchema(step) {
        return step().text();
    }
}

class IngredientBuilder {
    constructor() { 
        this.disaUnitDict = {
            "4": {
                "short_name": "г",
                "full_name": "грамм",
                "weight_in_grams": 1.0
            }
        }
    }

    fromAbraSchema(abraIngredient) {
        let ingredientObj = new IngredinetObj();
        ingredientObj.title = abraIngredient.name;
        ingredientObj.quantity_units = abraIngredient.quantity_number;
        ingredientObj.unit = abraIngredient.unit;
        ingredientObj.cost_per_gram = abraIngredient.cost_per_gram;
        ingredientObj.quantity_grams = abraIngredient.quantity_grams;
        return ko.observable(ingredientObj);
    }

    fromDisaSchema(disaIngredient) {
        console.log(disaIngredient);
        let ingredientObj = new IngredinetObj();
        const unit = this.disaUnitDict[String(disaIngredient.ingredient.unit)];

        ingredientObj.title = disaIngredient.ingredient.name;
        ingredientObj.quantity_units = disaIngredient.amount_in_units;
        ingredientObj.unit = unit.short_name;
        ingredientObj.cost_per_gram = disaIngredient.ingredient.price_per_gram;
        ingredientObj.quantity_grams = unit.weight_in_grams;
        return ko.observable(ingredientObj);
    }

    toAbraSchema(ingredient) {
        const abraIngredientObj = {
            "name": ingredient().title(),
            "unit": ingredient().unit(),
            "quantity_text": `${ingredient().basicQuantityUnits()} ${ingredient().unit()}`,
            "quantity_number": ingredient().basicQuantityUnits(),
            "quantity_grams": ingredient().quantityGrams(),
            "cost_base_name": ingredient().title(),
            "cost_per_gram": ingredient().costPerGram()
        }
        return abraIngredientObj;
    }

    toDisaSchema(ingredient) {
        const disaIngredientObj = {
            "ingredient": {
                "name": ingredient().title(),
                "price_per_gram": ingredient().costPerGram(),
                "unit": 4
            },
            "amount_in_units": ingredient().basicQuantityUnits(),
        }
        return disaIngredientObj;
    }
}

class RecipeCardBuilder {
    constructor() {
        this.tagBuilder = new TagBuilder();
    }

    fromAbraSchema(abraRecipeCard) {
        let recipeCardObj = new RecipeCardObj();
        recipeCardObj.id = abraRecipeCard.id;   
        recipeCardObj.title = abraRecipeCard.title;
        recipeCardObj.is_public = abraRecipeCard.is_public;
        recipeCardObj.img_small = abraRecipeCard.img_small;

        for (let abraTag of abraRecipeCard.tags) {
            recipeCardObj.tags.push(this.tagBuilder.fromAbraSchema(abraTag));
        }

        return recipeCardObj;
    }

    fromDisaSchema(disaRecipe) {
        let recipeCardObj = new RecipeCardObj();
        recipeCardObj.id = disaRecipe.id;
        recipeCardObj.title = disaRecipe.title;
        recipeCardObj.is_public = true;
        recipeCardObj.img_small = disaRecipe.image_container.img_small.slice(21);

        for (let abraTag of disaRecipe.tags) {
            recipeCardObj.tags.push(this.tagBuilder.fromDisaSchema(abraTag));
        }

        return recipeCardObj;
    }
}

class RecipeBuilder {
    constructor() {
        this.tagBuilder = new TagBuilder();
        this.stepBuilder = new StepBuilder();
        this.ingredientBuilder = new IngredientBuilder();
    }

    fromAbraSchema(abraRecipe=null) {
        let recipeObj = new RecipeObj();
        if (!abraRecipe) {
            return ko.observable(new Recipe(recipeObj));
        }
        recipeObj.id = abraRecipe.id;
        recipeObj.title = abraRecipe.title;
        recipeObj.ownerEmail = abraRecipe.owner_email;
        recipeObj.isPublic = abraRecipe.isPublic;
        recipeObj.img_small = abraRecipe.img_small;
        recipeObj.img_medium = abraRecipe.img_medium;
        recipeObj.img_large = abraRecipe.img_large;
        recipeObj.total_cost = abraRecipe.cost_summary.total_cost;
        recipeObj.total_cost_per_gram = abraRecipe.cost_summary.total_cost_per_gram;
        recipeObj.total_quantiy_grams = abraRecipe.cost_summary.total_quantity_grams;
        for (let abraTag of abraRecipe.tags) {
            recipeObj.tags.push(this.tagBuilder.fromAbraSchema(abraTag));
        }
        for (let abraStep of abraRecipe.steps) {
            recipeObj.steps.push(this.stepBuilder.fromAbraSchema(abraStep));
        }
        for (let abraIngredient of abraRecipe.ingredients) {
            recipeObj.ingredients.push(this.ingredientBuilder.fromAbraSchema(abraIngredient));
        }
        return recipeObj;
    }
 
    fromDisaSchema(disaRecipe=null) {
        let recipeObj = new RecipeObj();
        if (!disaRecipe) {
            return ko.observable(new Recipe(recipeObj));
        }

        recipeObj.id = disaRecipe.id;
        recipeObj.title = disaRecipe.title;
        recipeObj.img_small = disaRecipe.image_container.img_small.substr(21);
        recipeObj.img_medium = disaRecipe.image_container.img_medium.substr(21);
        recipeObj.img_large = disaRecipe.image_container.img_large.substr(21);
        recipeObj.total_quantiy_grams = 0;
        for (let ingredient of disaRecipe.ingredients) {
            recipeObj.total_quantiy_grams += ingredient["amount_in_units"];
        }
        recipeObj.total_cost_per_gram = disaRecipe.ingredients.reduce((sum, i2) => sum + i2["ingredient"]["price_per_gram"], 0);
        recipeObj.total_cost = recipeObj.total_quantiy_grams * recipeObj.total_cost_per_gram;
        
        for (let abraTag of disaRecipe.tags) {
            recipeObj.tags.push(this.tagBuilder.fromDisaSchema(abraTag));
        }

        for (let i = 0; i< disaRecipe.steps.length; i++) {
            recipeObj.steps.push(this.stepBuilder.fromDisaSchema(disaRecipe.steps[i], i));
        }

        for (let abraIngredient of disaRecipe.ingredients) {
            recipeObj.ingredients.push(this.ingredientBuilder.fromDisaSchema(abraIngredient));
        }

        return recipeObj;
    }

    toAbraSchema(recipe) {
        let abraTags = [];
        for (let tag of recipe().tags()) {
            abraTags.push(this.tagBuilder.toAbraSchema(tag));
        }
        let abraIngredients = [];
        for (let ingredient of recipe().ingredients()) {
            abraIngredients.push(this.ingredientBuilder.toAbraSchema(ingredient));
        }
        let abraSteps = [];
        for (let step of recipe().steps()) {
            abraSteps.push(this.stepBuilder.toAbraSchema(step));
        }

        const abraRecipeObj = {
            "title": recipe().title(),
            "tags": abraTags,
            "ingredients": abraIngredients,
            "steps": abraSteps,
            "owner_email": recipe().ownerEmail(),
            "is_public": recipe().isPublic()
        }
        if (recipe().id() !== null) {
            abraRecipeObj.id = recipe().id();
        } 
        if (recipe().imgSm() !== null) {
            abraRecipeObj.img_small = recipe().imgSm().substr(21);
        }
        if (recipe().imgMd() !== null) {
            abraRecipeObj.img_medium = recipe().imgMd().substr(21);
        }
        if (recipe().imgLg() !== null) {
            abraRecipeObj.img_large = recipe().imgLg().substr(21);
        }
        return abraRecipeObj;
    }

    toDisaSchema(recipe) {
        let disaTags = [];
        for (let tag of recipe().tags()) {
            disaTags.push(this.tagBuilder.toDisaSchema(tag));
        }

        let disaIngredients = [];   
        for (let ingredient of recipe().ingredients()) {
            disaIngredients.push(this.ingredientBuilder.toDisaSchema(ingredient));
        }

        let disaSteps = [];
        for (let step of recipe().steps()) {
            disaSteps.push(this.stepBuilder.toDisaSchema(step));
        }

        const disaRecipeObj = {
            "title": recipe().title(),
            "tags": disaTags,
            "ingredients": disaIngredients,
            "steps": disaSteps,
        }

        if (recipe().id() !== null) {
            disaRecipeObj.id = recipe().id();
        }

        let image_container = {};
        if (recipe().imgSm() !== null) {
            image_container.img_small = recipe().imgSm().substr(21);
            image_container.img_medium = recipe().imgMd().substr(21);
            image_container.img_large = recipe().imgLg().substr(21);
            disaRecipeObj.image_container = image_container;
        }

        return disaRecipeObj;
    }
}
