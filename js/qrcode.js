function onLoad(){
var url_string = window.location.href;
var url = new URL(url_string);
const baseUrl = url.protocol + "//" + url.hostname + ":" + url.port;
const queueID = url.searchParams.get("queueID");
const joinUrl = baseUrl + "/wait.html?queueID=" + queueID;
console.log(baseUrl);
document.getElementById("qrCode").src="https://api.qrserver.com/v1/create-qr-code?format=svg&data=" + encodeURI(joinUrl);
}
