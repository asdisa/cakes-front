class TagObj {
    constructor() {
        this.text = '';
    }
}

class StepObj {
    constructor() {
        this.ordinal = 0;
        this.text = '';
    }
}

class IngredinetObj {
    constructor() {
        this.title = '';
        this.quantity_units = 0;
        this.unit = 'гр';
        this.cost_per_gram = 0;
        this.quantity_grams = 0;
    }
}

class RecipeObj {
    constructor() {
        this.id = null;
        this.title = '';
        this.isPublic = true;
        this.img_small = null;
        this.img_medium = null;
        this.img_large = null;
        this.total_cost = null;
        this.total_cost_per_gram = null;
        this.total_quantiy_grams = null;
        this.owner_email = 'asde3211q@gmail.com';
        this.tags = [];
        this.steps = [];
        this.ingredients = [];
    }
}