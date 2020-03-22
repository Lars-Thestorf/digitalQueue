groupSize = 1;
let sessionID;

function loginClick() {
	var name = document.getElementById("name").value; 
	var pass = document.getElementById("pass").value; 
	login(name, pass,  gotoAdminInterface);
}
function createClick() {
	var name = document.getElementById("name2").value; 
	var pass = document.getElementById("pass2").value;
	createQueue(name, pass, queueCreated);
}
function queueCreated(jsonObject) {
	var name = document.getElementById("name2").value; 
	var pass = document.getElementById("pass2").value;
	login(name, pass, gotoAdminInterface);
}
function admitClick(){
	admit(queueID, groupSize, sessionID, () => {
		queuePosition(queueID, (result) => {
			document.getElementById("CurrentPos").innerText = result.position;
		})
	});
}
function closeClick(){
	document.getElementById("modal").style = "display: block;"
}
function closeModal(){
	document.getElementById("modal").style = "display: none;"
}
function confirmClose(){
	closeQueue(queueID, sessionID, () =>{
		closeModal();
		document.getElementById("adminInterface").style = "display: none;"
		showLogin();
	});
}
function gotoAdminInterface(jsonObject){
	document.getElementById("login").style = "display: none;"
	document.getElementById("newQueue").style = "display: none;"
	document.getElementById("adminInterface").style = "display: block;"
	sessionID = jsonObject.sessionID;
	queueID = jsonObject.queueID;
	document.getElementById("qrLink").href = "qrcode.html?queueID="+queueID;
	queuePosition(queueID, (result) => {
		document.getElementById("CurrentPos").innerText = result.position;
	})
}
function increase() {
	if (groupSize < 10) groupSize += 1;
	adminUpdate();
}
function decrease() {
	if (groupSize > 1) groupSize -= 1;
	adminUpdate();
}
function adminUpdate() {
    document.getElementById("groupSize").innerText = groupSize;
    document.getElementById("increase").disabled = groupSize > 9;
    document.getElementById("decrease").disabled = groupSize < 2;
}

function showNewQueue(){
	document.getElementById("login").style = "display: none;"
	document.getElementById("newQueue").style = "display: block;"
}

function showLogin(){
	document.getElementById("login").style = "display: block;"
	document.getElementById("newQueue").style = "display: none;"
}