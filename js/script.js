groupSize = 1;
myNumbers = [];
index = 0;
let sessionID;
function init() {
	var url_string = window.location.href;
	var url = new URL(url_string);
    queueID = url.searchParams.get("queueID");
    newNumber();
}
function newNumber(){
    enterQueue(queueID,(result) =>{
        myNumbers.push({position: result.position,sessionID: result.sessionID, groupSize: 1});
        index = myNumbers.length -1;
        update();
		if (myNumbers.length <= 1) {
			setInterval(refreshQueuePos, 3000);
		}
    },(status, responseText) =>{
        if(status == 400){
            response = JSON.parse(responseText);
            if(response.status == "Unknown Error: list index out of range"){
                document.getElementById("main").style = "display: none;"
                document.getElementById("queueClosed").style = "display: block;"
            }
        }
    })
}
function addPerson() {
    if(groupSize <= 2){
        myNumbers[index].groupSize += 1;
        update();
        modifyPersons(queueID, myNumbers[0].groupSize, myNumbers[0].sessionID, null);
    }
}
function removePerson() {
    if(groupSize >= 1){
        myNumbers[index].groupSize -= 1;
        update();
        modifyPersons(queueID, myNumbers[0].groupSize, myNumbers[0].sessionID, null);
    }
}
function update() {
    document.getElementById("YourPos").innerText = myNumbers[index].position; 
    if(myNumbers.length > index +1){
       document.getElementById("rightNumber").style = "visibility: visible;"
    } else{
        document.getElementById("rightNumber").style = "visibility: hidden;"
    }
    if(index > 0){
        document.getElementById("leftNumber").style = "visibility: visible;"
     } else{
         document.getElementById("leftNumber").style = "visibility: hidden;"
     }
    document.getElementById("groupSize").innerText = myNumbers[index].groupSize;
    document.getElementById("addPerson").disabled = myNumbers[index].groupSize > 2;
    document.getElementById("removePerson").disabled = myNumbers[index].groupSize < 2;
}

function refreshQueuePos() {
	queuePosition(queueID, (result) => {
		document.getElementById("CurrentPos").innerText = result.position;
		document.getElementById("vordir").innerText = myNumbers[index].position - result.position;
	})
}

function closeModal(){
    document.getElementById("modal").style = "display: none;"
}

function leave(){
    document.getElementById("modal").style = "display: block;"
}

function confirmLeave(){
    leaveQueue(queueID, myNumbers[0].sessionID, () =>{
        if(myNumbers.length == 0){
            document.getElementById("main").style = "display: none;"
            document.getElementById("leftQueue").style = "display: block;"
        }else{
            myNumbers.splice(index, 1);
            index = 0;
            closeModal();
            update();
        }
    });
}

function leftNumber(){
    index -= 1;
    update();
}

function rightNumber(){
    index += 1;
    update();
}