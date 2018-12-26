function getUrlParameterInitialValue(param) {
	let urlEnding = window.location.search.substring(1);
	let urlParams =  urlEnding.split('&');
	for (let i = 0; i < urlParams.length; i++) {
		let paramPair = urlParams[i].split('=');
		if (paramPair[0] == param) {
			let paramVal = decodeURI(paramPair[1]).split("+").join(" ");
			return paramVal;
		}
	}
	return null;
}


function getUrlParameterDecodedValue(param) {
	let paramValue = getUrlParameterInitialValue(param);
	return !isNaN(paramValue) ? parseInt(paramValue) : null;
}

