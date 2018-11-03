var Tag = function(data) {
	var self = this instanceof Tag 
					? this
					: Object.create(Tag.prototype);
	self.text = ko.observable(data);
	self.url = ko.observable("https://cakes.abra.me/categories?tags=" + self.text().slice(1).split(" ").join("+"));
};