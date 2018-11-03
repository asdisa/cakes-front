function getUrlParameterDecodedValue(param) {
	var urlEnding = window.location.search.substring(1);
	var urlParams =  urlEnding.split('&');
	for (var i = 0; i < urlParams.length; i++) {
		var paramPair = urlParams[i].split('=');
		if (paramPair[0] == param) {
			var paramVal = decodeURI(paramPair[1]).split("+").join(" ");
			if (!isNaN(paramVal)) {
				return parseInt(paramVal);
			}
		}
	}
	return undefined;
}