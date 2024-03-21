export class CORS {
	static doCORSRequest(options, result) {
		var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
    	result(x.status, x.responseText || '');
    };
    if (/^POST/i.test(options.method)) {
      x.setRequestHeader('Content-Type', 'application/json');
      x.send(JSON.stringify(options.data));
    }
    else {
      x.send(options.data);
    }
  }
}