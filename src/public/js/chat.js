const socket = io()
let message = document.getElementById("message");
let name = document.getElementById("name");
let id = document.getElementById("id");
let btn = document.getElementById("send");
var output = document.getElementById("menem");

btn.addEventListener("click", function() {
  var numero = Math.floor(Math.random() * 112) + 1

  if (numero >= 1 && numero <= 25) {
    numero = "avatarColoryellow"
  }
  else if (numero >= 26 && numero <= 50) {
        numero = "avatarColorred"
  }
  else if (numero >= 51 && numero <= 75) {
        numero = "avatarColorgreen"
  }
  else if (numero >= 76 && numero <= 100) {
        numero = "avatarColorblue"
  }
  else if (numero >= 101 && numero <= 105) {
        numero = "avatarColorMulti"
  }
  else if (numero == 106) {
        numero = "avatarColorBlack"
  }
  else if (numero == 107) {
        numero = "avatarColorWhite"
  }
  else if (numero >= 108 && numero <= 112) {
        numero = "avatarColorInvertido"
  }
  console.log(numero);
  socket.emit("chat:message", {
    name: name.value,
    message: message.value,
    numero: numero,
    id: id.value,
  });
});

socket.on("chat:message", function (data) {
  var output = document.getElementById(data.id);
  output.innerHTML += "<div class=commentList id=commentList> <div class=comment>"  +  "<div class=commentAvatar> <div class=" + data.numero + ">  </div>  </div><div class=commentBody>" + "<div class=commentMetadata><div class=commentsTag unselect><span class=author>"+ data.name +"</span></div></div>  <div class=commentContent>" + data.message + "</div></div></div></div>"
});
