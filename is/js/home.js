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
    var croom = 'room_1'
    var can = true

    function RandomInt(min, max) 
    {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    function get_room(leftroom, user)
    {
      var tojoins = ['']
      db.ref('rooms/').once('value').then(function(snapshot) 
      {
        //console.log("key once:",snapshot.val())
        snapshot.forEach(function(childSH)
        {
          //console.log('count: ', childSH.child('count').val(), " room: ", childSH.key)
          if (childSH.child('count').val() <= 1)
          { 
              //console.log("push once:", childSH.key)
              tojoins.push(childSH.key)
          }   
        });
        //console.log("tojoin once:",tojoins)
        croom = tojoins[RandomInt(1, tojoins.length)]
        localStorage.setItem('croom', croom)
        db.ref('rooms/'+croom+'/users/'+user).set(true)
        if (leftroom > 0)
          db.ref('rooms/' + croom).update({count: 2}) 
      });
    }

    function check_existname(user)
    {
      db.ref('users').once('value').then(function(snapshot) {
        if (snapshot.hasChild(user)) {
          can = false
        }
        else {
          can = true
          db.ref('users/'+user).set(true)
          localStorage.setItem('name', user)
        }
      })
    }

    function onjoin_room()
    {
        const form = document.getElementById('form')
        const input = document.getElementById('input')
        const btn = document.getElementById('btn')

        input.value = ''
        input.focus()
        btn.classList.remove('enabled')

        input.onkeyup = function()
        {
            if(input.value.length > 0)
                btn.classList.add('enabled')
            else
                btn.classList.remove('enabled')
        }

        form.addEventListener("submit", function act(e) {
            e.preventDefault()
            var user = input.value
            check_existname(user)
            setTimeout(function() {
              if (can)
              {
                var leftroom = 0
                db.ref('rooms/').once('value').then(function(snapshot) 
                {
                  console.log('start')
                  snapshot.forEach(function(childSH)
                  {
                      if (childSH.child('count').val() <= 1)
                          leftroom += 1
                  });
                  var index = parseFloat(snapshot.numChildren())
                  if (index <= 0)
                    db.ref('rooms/room_1').update({count: 1}) 
                  else if (leftroom <= 0)
                    db.ref('rooms/' + `room_${index+1}`).update({count: 1})
                  
                  get_room(leftroom, user)
                  setTimeout(function() {window.location.href = "chat.html"}, 1000)
                });
              }
              else
              {
                input.value = "This nickname has been taken already!"
                btn.classList.remove('enabled')
                setTimeout(function() {input.value = ''; input.focus()},500)
              }
              if (can) {
                form.removeEventListener("submit", act)
                form.addEventListener("submit", (e) => {
                  e.preventDefault()
                })
              }}, 1000) 
        })
    }
    
    onjoin_room()
}