class TagBuilder {
    constructor() { }

    fromAbraSchema(text) {
        let tagObj = new TagObj();
        tagObj.text = text;
        return tagObj;
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

    toAbraSchema(step) {
        const abraStepObj = {
            "ordinal": step().ordinal(),
            "step": step().text()
        }
        return abraStepObj;
    }
}

class IngredientBuilder {
    constructor() {  }

    fromAbraSchema(abraIngredient) {
        let ingredientObj = new IngredinetObj();
        ingredientObj.title = abraIngredient.name;
        ingredientObj.quantity_units = abraIngredient.quantity_number;
        ingredientObj.unit = abraIngredient.unit;
        ingredientObj.cost_per_gram = abraIngredient.cost_per_gram;
        ingredientObj.quantity_grams = abraIngredient.quantity_grams;
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
}

class RecipeCardBuilder {
    constructor() {
        this.tagBuilder = new TagBuilder();
    }

    fromAbraSchema(abraRecipeCard) {
        let recipeCardObj = new RecipeCardObj();
        recipeCardObj.id = abraRecipeCard.id;
        recipeCardObj.id = abraRecipeCard.id;
        recipeCardObj.title = abraRecipeCard.title;
        recipeCardObj.is_public = abraRecipeCard.is_public;
        recipeCardObj.img_small = abraRecipeCard.img_small;

        for (let abraTag of abraRecipeCard.tags) {
            recipeCardObj.tags.push(this.tagBuilder.fromAbraSchema(abraTag));
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
}
