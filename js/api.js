function doRestAPICall(method, url, body, cFunction, eFunction){
	if (cFunction == null) cFunction = ()=>{};
	if (eFunction == null) eFunction = ()=>{};
	//cFunction({queueID: 15});
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
			if (this.status == 200) {
				var jsonObject = JSON.parse(this.responseText); 
				cFunction(jsonObject);
			} else {
				eFunction(this.status, this.responseText);
			}
        }
	};
	xhttp.open(method, url, true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(body);
}

function queuePosition(queueID, cFunction, eFunction) {
	doRestAPICall("POST","/queue_position", JSON.stringify({queueID: queueID}), cFunction, eFunction);
}
function enterQueue(queueID, cFunction, eFunction) {
	doRestAPICall("POST","/enter_queue", JSON.stringify({queueID: queueID}), cFunction, eFunction);
}
function leaveQueue(queueID, sessionID, cFunction, eFunction) {
	doRestAPICall("POST","/leave_queue", JSON.stringify({queueID: queueID, sessionID: sessionID}), cFunction, eFunction);
}
function login(name, pass, cFunction, eFunction) {
	doRestAPICall("POST","/login", JSON.stringify({name: name, password: pass}), cFunction, eFunction);
}
function createQueue(name, pass, cFunction, eFunction) {
	doRestAPICall("POST","/create_queue", JSON.stringify({name: name, password: pass}), cFunction, eFunction);
}
function closeQueue(queueID, sessionID, cFunction, eFunction) {
	doRestAPICall("POST","/close", JSON.stringify({queueID: queueID, sessionID: sessionID}), cFunction, eFunction);
}
function admit(queueID, count, sessionID, cFunction, eFunction) {
	doRestAPICall("POST","/admit", JSON.stringify({queueID: queueID, count: count, sessionID: sessionID}), cFunction, eFunction);
}
function modifyPersons(queueID, count, sessionID, cFunction, eFunction) {
	doRestAPICall("POST","/modify_persons", JSON.stringify({queueID: queueID, count: count, sessionID: sessionID}), cFunction, eFunction);
}