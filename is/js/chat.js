window.onload = function()
{
  const firebaseConfig = {
    apiKey: "AIzaSyAgpDGjZ897OYPH1gxMjfQxunGJvpMgSoI",
    authDomain: "randomchatis.firebaseapp.com",
    databaseURL: "https://randomchatis-default-rtdb.firebaseio.com",
    projectId: "randomchatis",
    storageBucket: "randomchatis.appspot.com",
    messagingSenderId: "432299910559",
    appId: "1:432299910559:web:b9ecae53b54be9c88d09aa",
    measurementId: "G-B2FPHRWR5E"
  };
  firebase.initializeApp(firebaseConfig);

  var db = firebase.database()
  var username = localStorage.getItem('name')
  var croom = localStorage.getItem('croom')
  var lasttext = ''
  const chat_container = document.getElementById('chat_container')
  const pcount = document.getElementById('ppl')

  function on_strangerjoin()
  {
    db.ref('rooms/'+croom).on('child_changed', function(childSnapshot) 
    {
    if (childSnapshot.key == "count")
    {
        var count = childSnapshot.val()
        if (count >= 2)
            create_message("ระบบ", "<i class='fa-solid fa-right-to-bracket'></i> คนแปลกหน้าได้เข้าร่วมห้องแชท.")
        else
            create_message("ระบบ", "<i class='fa-solid fa-right-from-bracket'></i> คนแปลกหน้าได้ออกจากห้องแชท.")
        pcount.innerHTML = count + "/2"
        chat_container.scrollTop = chat_container.scrollHeight;
    }
    });
  }

  function on_newmessage()
  {
    db.ref('rooms/'+croom+'/chats').on('child_added', function(childSnapshot) 
    {
    if (childSnapshot.key != username)
    {
        var msg = childSnapshot.val()
        var user = childSnapshot.key
        create_message(`คนแปลกหน้า (${user}):`, msg, user)
        chat_container.scrollTop = chat_container.scrollHeight;
    }
    });
    db.ref('rooms/'+croom+'/chats').on('child_changed', function(childSnapshot) 
    {
    if (childSnapshot.key != username)
    { 
        var msg = childSnapshot.val()
        var user = childSnapshot.key
        create_message(`คนแปลกหน้า (${user}):`, msg, user)
        chat_container.scrollTop = chat_container.scrollHeight;
    }
    });
  }

  function create_message(head, msg, from = 'ระบบ')
  {
    if (head == 'ระบบ')
      head += ' <i class="fa-solid fa-gears"></i>'

    var lastuser = ''
    let msglist = document.getElementsByTagName("p")
    var chat_container = document.getElementById('chat_container')
    var msg_box = document.createElement('div')
    msg_box.setAttribute('id', 'msg_box')
    var user = document.createElement('div')
    user.setAttribute('id', 'user')
    var userc = document.createElement('p')
    userc.innerHTML = head
    var message = document.createElement('div')
    message.setAttribute('id', 'message')
    var messagec = document.createElement('p')
    messagec.setAttribute('class', from)
    messagec.innerHTML = msg

    if (msglist.length > 0 ){
      for (let i = 0; i < msglist.length; i++) {
        var csname = msglist[i].className
        if (typeof(csname) == 'string')
        {
          if (i+1 >= msglist.length)
            lastuser = msglist[i].className
        }
      }
    }

    if (from == username)
      messagec.setAttribute('id', 'own')

    if (lastuser != from)
      msg_box.appendChild(user)

    user.appendChild(userc)
    msg_box.appendChild(message)
    message.appendChild(messagec)
    chat_container.appendChild(msg_box)
  }

  function on_leaveroom()
  {
    localStorage.clear()
    db.ref('users/'+username).remove()
    db.ref('rooms/'+croom).once('value').then(function(snapshot) 
    {
        var c = snapshot.child('count').val()
        if (c <= 1)
        {
          db.ref('rooms/'+croom).remove()
        }
        else
        {
          db.ref('rooms/'+croom+'/chats').remove()
          db.ref('rooms/'+croom+'/users/'+username).remove()
          db.ref('rooms/'+croom).update({count: 1})
        }
      });
  }

  function on_join()
  {

    if (croom == null)
      window.location.replace("https://randomchatis.web.app/")

    create_message("ระบบ", `<i class='fa-solid fa-right-to-bracket'></i> ยินดีต้อนรับคุณ (${username}) เข้าสู่ห้องแชท, โปรดรอผู้อื่นเข้าร่วมห้องแชท!`)
    const form = document.getElementById('form')
    const input = document.getElementById('input')
    const exit = document.getElementById('exit')

    form.addEventListener("submit", (e) => {
        e.preventDefault()
        var msg = input.value
        create_message(`คุณ (${username}):`, msg, username)
        if (lasttext == msg)
          db.ref("rooms/"+croom+"/chats/"+username).remove()
        db.ref("rooms/"+croom+"/chats/"+username).set(msg)
        input.value = ''
        input.focus()
        lasttext = msg
        chat_container.scrollTop = chat_container.scrollHeight;
    })

    exit.addEventListener("click", () => {
      setTimeout(function(){window.location.replace("https://randomchatis.web.app/")}, 700)
    });

    db.ref('rooms/'+croom+'/chats').set(null)
    db.ref('rooms/'+croom).once('value').then(function(snapshot){
      var count = snapshot.child('count').val()
      if (count >= 2)
        create_message("ระบบ", `<i class='fa-solid fa-right-to-bracket'></i> คนแปลกหน้าได้เข้าร่วมห้องแชท.`)
      if (snapshot.child('users').numChildren() >= 2 && count <= 1)
        db.ref('rooms/'+croom).child('count').set(2)
      pcount.innerHTML = count + "/2"
    })

    window.addEventListener('beforeunload', function leave(e) {
      e.preventDefault()
      e.returnValue = ''
      on_leaveroom()
      setInterval(() => {
        if (localStorage.getItem('croom') == null)
          window.location.replace("https://randomchatis.web.app/")
      }, 1000);
      window.removeEventListener('beforeunload', leave)
    })

    on_strangerjoin()
    on_newmessage()
  }

  on_join()
}
