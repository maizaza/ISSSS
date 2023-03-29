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
    
    var db = firebase.database() //ตั้งค่า Database
    var croom = 'room_1' //ตัวแปรเอาไว้เก็บค่า ห้องแชทปัจจุบันที่เราอยู่
    var can = true //ตัวแปรเอาไว้ตรวจสอบว่า สามารถใช้ชื่อได้ไหม

    function RandomInt(min, max) //ฟังชั่น​สุ่มค่าตัวเลขระหว่าง Min-Max Ex. 1-10 
    {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    function get_room(leftroom, user) //ฟังชั่นที่เอาไว้ใช้หาห้องที่สามารถเข้าได้
    {
      var tojoins = ['']
      db.ref('rooms/').once('value').then(function(snapshot) 
      {
        //console.log("key once:",snapshot.val())
        snapshot.forEach(function(childSH) //ลูปแต่ละตัวเพื่อเช็คว่าห้องในว่างบ้าง
        {
          //console.log('count: ', childSH.child('count').val(), " room: ", childSH.key)
          if (childSH.child('count').val() <= 1)
          { 
              //console.log("push once:", childSH.key)
              tojoins.push(childSH.key)
          }   
        });
        //console.log("tojoin once:",tojoins)
        croom = tojoins[RandomInt(1, tojoins.length)] //เปลี่ยนค่าตัวแปรเป็นห้องที่เราจะเข้าใช้งาน
        localStorage.setItem('croom', croom)
        db.ref('rooms/'+croom+'/users/'+user).set(true) //ใส่ชื่อลง database
        if (leftroom > 0)
          db.ref('rooms/' + croom).update({count: 2}) //ใส่จำนวนคนลง database
      });
    }

    function check_existname(user) //ฟังชั่น​เอาไว้เช็คว่าชื่อที่เราใส่มีอยู่ใน Database หรือป่าว
    {
      db.ref('users').once('value').then(function(snapshot) { //ฟังชั่นเพื่อเอาไว้รับค่า username จาก database
        if (snapshot.hasChild(user)) { // ถ้ามีชื่อ
          can = false //ไม่สามารถใช้งานได้
        }
        else { // ถ้าไม่มี
          can = true //สามารถใช้งานได้
          db.ref('users/'+user).set(true) //นำข้อมูลลง database
          localStorage.setItem('name', user) //ใส่ชื่อลงใน local storage เพื่อนำไปใช่ต่อในห้องแชท (chat.js)​
        }
      })
    }

    function onjoin_room() //ฟังชั่นตอนก่อนจะเข้าห้องแชท
    {
        const form = document.getElementById('form')
        const input = document.getElementById('input')
        const btn = document.getElementById('btn')

        input.value = ''
        input.focus()
        btn.classList.remove('enabled')

        input.onkeyup = function() //เอาไว้ตกแต่งสวยๆ
        {
            if(input.value.length > 0)
                btn.classList.add('enabled')
            else
                btn.classList.remove('enabled')
        }

        form.addEventListener("submit", function act(e) { //ฟังชั่นหลัก ตอนเรากดเข้าร่วมห้อง
            e.preventDefault()
            var user = input.value //ชื่อที่เราใส่
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
    
    onjoin_room() //ใช้งานฟังชั่น
}
