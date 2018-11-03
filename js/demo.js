$(document).ready(function() {	

	var ViewModel = function(data) {
		self = this;

		this.test = function() {
			console.log(1)
		}
		
		
	ko.applyBindings(new ViewModel());
});



