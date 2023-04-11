// Rest based chat client
// Jim Skon 2022
// Kenyon College

var baseUrl = 'http://13.58.143.75:5005';
var state="off";
var myname="";
var inthandle;
var inthandle2;
var inthandle3;
var inthandle4;
var inthandle5 = setInterval(fetchUsers, 1000);


/* Start with text input and status hidden */
document.getElementById('chatinput').style.display = 'none';
document.getElementById('status').style.display = 'none';
document.getElementById('leave').style.display = 'none';
// Action if they push the join button
document.getElementById('login-btn').addEventListener("click", (e) => {
	join();
})

/* Set up buttons */
document.getElementById('leave-btn').addEventListener("click", leaveSession);
document.getElementById('send-btn').addEventListener("click", sendText);
// Watch for enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
    if (e.code == "Enter") {
	sendText();
    }   
});


// Call function on page exit
window.onbeforeunload = leaveSession;


function completeJoin(results) {
	var status = results['status'];
	console.log(status)
	if (status != "success") {
		alert("Account Not Found");
		leaveSession();
		return;
	}
	var user = results['user'];
	console.log("Join:"+user);
	//https://stackoverflow.com/questions/3180710/javascript-change-p-content-depending-on-select-option
	startSession(user);
}

function join() {
	myname = document.getElementById('yourname').value;
	mypass = document.getElementById('yourpass').value;
	fetch(baseUrl+'/chat/join/'+myname+'/'+mypass, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeJoin(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })
}

function completeSend(results) {
	var status = results['status'];
	document.getElementById('message').value = '';
	if (status == "success") {
		console.log("Send succeeded")
	} else {
		alert("Error sending message!");
	}
}

//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
	document.getElementById('message').value = '';
    console.log("Send: "+myname+":"+message);
	fetch(baseUrl+'/chat/send/'+myname+'/'+message, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeSend(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })    
	
}



function completeFetch(result) {
	messages = result["messages"];
	messages.forEach(function (m,i) {
		name = m['user'];
		message = m['message'];
		document.getElementById('chatBox').innerHTML +=
	    	"<font color='red'>" + name + ": </font>" + message + "<br />";
	});
}

/* Check for new messaged */
function fetchMessage() {
	fetch(baseUrl+'/chat/fetch/'+myname, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeFetch(data))
    .catch(error => {
        {console.log("Server appears to be down");}
    })
}
/* Functions to set up visibility of sections of the display */
var nameHold;
function startSession(name){
    state="on";
    
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'none';
    document.getElementById('user').innerHTML = "User: " + name;
	nameHold = name;
	console.log(nameHold);
    document.getElementById('chatinput').style.display = 'block';
    document.getElementById('status').style.display = 'block';
    document.getElementById('leave').style.display = 'block';
    /* Check for messages every 500 ms */
    inthandle=setInterval(fetchMessage,500);
	inthandle2=setInterval(getUsers,500);
	inthandle3=setInterval(checkTyping,200);
	inthandle4=setInterval(updateShowTyping,200);
	inthandle5 = setInterval(fetchUsers, 500)
}

function leaveSession(){
    state="off";
    removeUser(nameHold);
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'block';
    document.getElementById('user').innerHTML = "";
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('status').style.display = 'none';
    document.getElementById('leave').style.display = 'none';
	clearInterval(inthandle);
	clearInterval(inthandle2);
	clearInterval(inthandle3);
	clearInterval(inthandle4);
	clearInterval(inthandle5);

}

//FUNCTIONS THAT I HAVE ADDED BELOW-------------------------------------------------------------------





//Functions to dynamically update user list
function getUsers() {
	fetch(baseUrl+'/chat/userlist', {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>updateUsers(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })
}
function updateUsers(result) {
	userList = result["userList"];
	//console.log("user list printed");
	document.getElementById('userlist').innerHTML = userList;
}

//functions to register a user , /chat/register/username/email/password
document.getElementById('submitButton').addEventListener("click", registerUser);
function registerUser(){
	console.log("registerUser() running");
	username = document.getElementById('user-name').value;
	email = document.getElementById('user-email').value;
	pass = document.getElementById('user-password').value;
	fetch(baseUrl+'/chat/register/'+username +'/'+email+'/'+pass, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeRegisterUser(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })
}

function completeRegisterUser(results){
	var status = results['status'];
	console.log(status)
	if (status != "success") {
		alert("Username or Email already exists! Password must be more than 6 characters");
		leaveSession();
		return;
	}
	var user = results['user'];
	alert("Registration Successful");
	console.log("Registered:"+user);
	username = document.getElementById('user-name').value = '';
	email = document.getElementById('user-email').value = '';
	pass = document.getElementById('user-password').value = '';
}

//Function to remove a user after they leave the site.
function removeUser(){
		fetch(baseUrl+'/chat/userlist/remove/'+nameHold, {
        method: 'get'
    })
}	

let gateway = 0;
//Functions to update the server as to whether someone is typing
function checkTyping(){
	var message = document.getElementById('message').value;
	//console.log(message);
		if(message != ""){
		updateTyping();
	} else{
		removeTyping();
	}
}

function updateTyping(){
		fetch(baseUrl+'/chat/typing/update/'+nameHold, {
        method: 'get'
    })
	gateway += 1;
	//console.log(gateway);
	//console.log("User is Typing");
}

function removeTyping(){
		gateway = 0;
		fetch(baseUrl+'/chat/typing/remove/'+nameHold, {
        method: 'get'
		})
		//console.log(gateway);
	//console.log("User is not typing");
}


function updateShowTyping(){
	if(gateway == 1){
		fetch(baseUrl+'/chat/typingmessage/'+nameHold, {
        method: 'get'
    })
		console.log(gateway);
	}
}

//IMAGE DRAG AND DROP---------------------------------------
function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        console.log(`… file[${i}].name = ${file.name}`);
      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
}

function handleDrop(ev) {
  ev.preventDefault();
  let dt = ev.dataTransfer;
  let files = dt.files;
  handleFiles(files);
}

function handleFiles(files) {
  ([...files]).forEach(uploadFile)
}

function uploadFile(file) {
  let url = 'http://13.58.143.75:5005/chat/image/send';
  let formData = new FormData()
  formData.append('file', file)
  fetch(url, {
    method: 'POST',
	body: formData
  })
  .then(() => { /* Done. Inform the user */ })
  .catch(() => { /* Error. Inform the user */ })
}

//SEND AN EMAIL--------------
//https://kaustubh72.medium.com/send-e-mails-with-smtp-js-a8e07e1d0b6b
//https://www.smtpjs.com/

document.getElementById('sendEmailButton').addEventListener("click", sendEmail);
function sendEmail(){
let url = "http://13.58.143.75/restChat/restChat.html";
let email = document.getElementById('friend-email').value;
let body = document.getElementById('email-message').value + " " + url;
console.log(email);
Email.send({
    Host : "smtp.elasticemail.com",
    Username : "kenyonsoftwaredev@gmail.com",
    Password : "375F1C624A4AA040B8B4E8BF48D81CD73E83",
    To : email,
    From : "kenyonsoftwaredev@gmail.com",
    Subject : document.getElementById('email-subject').value,
    Body : body
})

}

//Sammy//

// NEW 
function updateUsersSam(data){
	//console.log(data);
	fetchTypers();
	const users = data['userList'];
	//Returning list like Grant,Sammy,Joe,etc. and then turning it into a javascript array.
	//https://dev.to/sanchithasr/6-ways-to-convert-a-string-to-an-array-in-javascript-1cjg
	//https://www.educative.io/answers/how-to-add-an-id-to-element-in-javascript
	const usersArray = users.split(',');
	console.log(users);
	console.log(typerArray);
	//console.log(usersArray);
    // Get the user list container element
    const userBar = document.getElementById('bottomPageList');
    // Clear any existing user list items
    userBar.innerHTML = '';
	let numGate = 0;
	let listNum = "a";
    // Create a new list item for each user and append it to the user list, first user added will have blue background
    usersArray.forEach((user) => {
		if(typerArray == null){
			if(numGate == 0){
				const listItem = document.createElement('li');
				//Set the Class of the list , then after set the ID and Text
				listItem.classList.add('list-group-item');
				listItem.classList.add('active');
				listItem.setAttribute('id' , listNum);
				listItem.textContent = user;
				userBar.appendChild(listItem);
				const spanItem = document.createElement('span');
				//Set the Class of the Span in the list , then after set the Text
				spanItem.classList.add('badge');
				spanItem.classList.add('rounded-pill');
				spanItem.classList.add('bg-success');
				spanItem.textContent = "Online";
				listItem.appendChild(spanItem);
				numGate += 1;
				listNum += "a";
			}else{
				const listItem = document.createElement('li');
				listItem.classList.add('list-group-item');
				listItem.setAttribute('id' , listNum);
				listItem.textContent = user;
				userBar.appendChild(listItem);
				const spanItem = document.createElement('span');
				spanItem.classList.add('badge');
				spanItem.classList.add('rounded-pill');
				spanItem.classList.add('bg-success');
				spanItem.textContent = "Online";
				listItem.appendChild(spanItem);
				listNum += "a";
			}
		}else{
			if(numGate == 0 && typerArray.includes(user) == true){
				let userStatus = "Is typing...";
				UpdateUsersSamTyping(user , listNum , userBar , userStatus);
				numGate += 1;
				listNum += "a";
		}else{
			if(numGate == 0 && typerArray.includes(user) == false){
				let userStatus = "Online";
				UpdateUsersSamTyping(user , listNum , userBar , userStatus);
				numGate += 1;
				listNum += "a";
		}else{
			if(numGate == 0 && typerArray.includes(user) == false){
				let userStatus = "Is typing...";
				UpdateUsersSamTyping(user , listNum , userBar , userStatus);
				numGate += 1;
				listNum += "a";
			}else{
				if(numGate != 0 && typerArray.includes(user) == true){
					let userStatus = "Is typing...";
					UpdateUsersSamNotTyping(user , listNum , userBar , userStatus);
					listNum += "a";
				}else{
					let userStatus = "Online";
					UpdateUsersSamNotTyping(user , listNum , userBar , userStatus);
					listNum += "a";
				}
			}
		}		
	}
}})};

function UpdateUsersSamTyping(user , listNum , userBar , userStatus){
			const listItem = document.createElement('li');
			//Set the Class of the list , then after set the ID and Text
			listItem.classList.add('list-group-item');
			listItem.classList.add('active');
			listItem.setAttribute('id' , listNum);
			listItem.textContent = user;
			userBar.appendChild(listItem);
			const spanItem = document.createElement('span');
			//Set the Class of the Span in the list , then after set the Text
			if(userStatus == "Is typing..."){
				spanItem.classList.add('badge');
				spanItem.classList.add('rounded-pill');
				spanItem.classList.add('bg-warning');
				spanItem.classList.add('text-dark');					
			}else{
				spanItem.classList.add('badge');
				spanItem.classList.add('rounded-pill');
				spanItem.classList.add('bg-success');	
			}
			spanItem.textContent = userStatus;
			listItem.appendChild(spanItem);
};

function UpdateUsersSamNotTyping(user , listNum , userBar , userStatus){
			const listItem = document.createElement('li');
			listItem.classList.add('list-group-item');
			listItem.setAttribute('id' , listNum);
			listItem.textContent = user;
			userBar.appendChild(listItem);
			const spanItem = document.createElement('span');
			if(userStatus == "Is typing..."){
				spanItem.classList.add('badge');
				spanItem.classList.add('rounded-pill');
				spanItem.classList.add('bg-warning');
				spanItem.classList.add('text-dark');					
			}else{
				spanItem.classList.add('badge');
				spanItem.classList.add('rounded-pill');
				spanItem.classList.add('bg-success');	
			}
			spanItem.textContent = userStatus;
			listItem.appendChild(spanItem);
};


function fetchUsers() {
    fetch(baseUrl+'/chat/users', {
        method: 'get'
    })
    .then(response => response.json())
    .then(data => updateUsersSam(data))
    .catch(error => {
        console.log("Error fetching user list:", error);
    });
}
// Call fetchUsers every 5 seconds to update the user list

function fetchTypers() {
    fetch(baseUrl+'/chat/users/typing', {
        method: 'get'
    })
    .then(response => response.json())
    .then(data => makeTyperArray(data))
    .catch(error => {
        console.log("No users are typing so there is no JSON object to fetch", error);
		typerArray = null;
    });
}

var typerArray = "";
function makeTyperArray(data){
	console.log(data);
	const users = data['typerList'];
	//Returning list like Grant,Sammy,Joe,etc. and then turning it into a javascript array.
	//https://dev.to/sanchithasr/6-ways-to-convert-a-string-to-an-array-in-javascript-1cjg
	typerArray = users.split(',');
}
