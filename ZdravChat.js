(function() {
  let ZdravChatContext = [];

  let ip =  "";
  let user_id = "";
  var request = new XMLHttpRequest();
  request.open('GET', 'https://zdravcode.ru/getUserInfo.php', true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      if (data.authorized === 'Y') {
        user_id = data.user_id;
        console.log('Пользователь авторизован. User ID:', data.user_id);
      } else {
        user_id = "Guest";
        console.log('Пользователь не авторизован');
      }
      ip = data.ip_address;
      console.log('IP-адрес пользователя:', data.ip_address);
    } else {
      console.error('Ошибка получения данных об авторизации, статус:', request.status);
    }
  };

request.onerror = function () {
  console.error('Ошибка соединения с сервером');
};

request.send();

  var ZdravChatBase = document.createElement("div");
  ZdravChatBase.style.backgroundColor = "#ebfffe"
  ZdravChatBase.style.borderRadius = "0.6rem";

  document.getElementsByClassName("col-12 col-xl-9")[0].insertBefore(ZdravChatBase, document.getElementsByClassName("col-12 col-xl-9")[0].firstChild);

  //ZdravChatBase.style.marginTop = "3.125rem";
  ZdravChatBase.style.marginBottom = "1.125rem";
  ZdravChatBase.style.paddingTop = "1.5rem";
  ZdravChatBase.style.paddingBottom = "1.5rem";
  ZdravChatBase.className = "container";

  var ZdravChatLogo = document.createElement("h3");
  ZdravChatLogo.innerHTML = "<b>Чат здоровья</b>";
  ZdravChatBase.appendChild(ZdravChatLogo);

  var ZdravChatSubLogo = document.createElement("a");
  ZdravChatSubLogo.innerHTML = "<b>Внимание! На связи исcкуственный интеллект!</b>";
  ZdravChatSubLogo.style.color = "#FF0000";
  ZdravChatSubLogo.style.fontSize = "0.75rem";
  ZdravChatBase.appendChild(ZdravChatSubLogo);

  var ZdravChatWidget = document.createElement("div");
  ZdravChatWidget.style.marginTop = "1.5rem";
  ZdravChatWidget.style.backgroundColor = "transparent";
  ZdravChatBase.style.position = "relative";
  ZdravChatBase.appendChild(ZdravChatWidget);

  var imageSrc = "https://zdravcode.ru/upload/medialibrary/b7b/rpxfpv530ez7msk2dfvand00rv4n9k1q.png"; // Замените путь_к_картинке на фактический путь к вашей картинке
  var ZdravChatImage = document.createElement("img");
  ZdravChatImage.src = imageSrc; // Установите источник изображения
  ZdravChatImage.style.position = "absolute";
  ZdravChatImage.style.top = "1rem";
  ZdravChatImage.style.right = "1rem";
  ZdravChatImage.style.width = "5rem"; 
  ZdravChatImage.style.height = "auto";
  ZdravChatBase.appendChild(ZdravChatImage);

  var ZdravChatMessages = document.createElement("div");
  ZdravChatMessages.style.MaxWidth = "100%";
  ZdravChatWidget.appendChild(ZdravChatMessages);

  ZdravChatEntry = document.createElement("input");
  ZdravChatEntry.className = "openai_entry form-control form-control-sm query ui-autocomplete-input form-control";
  ZdravChatEntry.placeholder = "Введите ваш вопрос";
  ZdravChatEntry.style.backgroundColor = "white";
  ZdravChatWidget.appendChild(ZdravChatEntry);

  ZdravChatCheckbox = document.createElement("label");
  ZdravChatCheckbox.className = "ZdravChatCheckbox";
  ZdravChatCheckbox.style.fontSize = "0.937rem";
  ZdravChatCheckbox.style.marginTop = "1.0rem";
  ZdravChatCheckbox.style.marginBottom = "1.0rem";
  ZdravChatCheckbox.style.textAlign = "center";
  ZdravChatCheckbox.innerHTML = "<input type=\"checkbox\" class=\"ZdravChatAgree\" name=\"agree\"> Используя \"Чат здоровья\" я принимаю <b><a href=\"https://zdravcode.ru/users/chatbot_rules.php\">правила использования чат-бота</b></a>.";
  ZdravChatWidget.appendChild(ZdravChatCheckbox);

  ZdravChatBTNWrapper = document.createElement("div");

  ZdravChatSendBTN = document.createElement("button");
  ZdravChatSendBTN.className = "ZdravChatSendBTN btn btn-sm btn-primary";
  ZdravChatSendBTN.textContent = "Отправить";
  ZdravChatSendBTN.style.width = "";
  ZdravChatBTNWrapper.appendChild(ZdravChatSendBTN);

  if (window.innerWidth < 768) {
    ZdravChatSendBTN.style.width = "100%";
    ZdravChatSubLogo.style.display = "block";
    ZdravChatSubLogo.style.width = "70%";
  }
  
  ZdravChatWidget.appendChild(ZdravChatBTNWrapper);
  
  let msgObjects = [];
  let userMsgs = [];
  let userMsgWrappers = [];
  let answerMsgs = [];
  let answerMsgWrappers = [];

  ZdravChatSendBTN.addEventListener('click', askQuestion);
  ZdravChatEntry.onkeydown = function(event) {if (event.keyCode === 13) {askQuestion()}}

  function askQuestion() {
    if (!document.getElementsByClassName("ZdravChatAgree")[0].checked) {
      ZdravChatCheckbox.classList.add('shake');
        let count = 0;
        const interval = setInterval(function() {
          if (count === 1)
            ZdravChatCheckbox.style.color = 'red';
          ZdravChatCheckbox.style.marginTop = count % 2 ? '1.1rem' : '1rem';
          ZdravChatCheckbox.style.marginBottom = count % 2 ? '0.9rem' : '1rem';
          ZdravChatCheckbox.style.marginLeft = count % 2 ? '0.1rem' : '0rem';
          count++;
          if (count === 17) {
              ZdravChatCheckbox.style.color = 'black';
              clearInterval(interval);
          }
        }, 30);
    } else {
      if (ZdravChatEntry.value !== "") {
        var UserMessageWrapper = document.createElement("div");
        UserMessageWrapper.style.width = "70%";
        UserMessageWrapper.style.textAlign = "right";
        UserMessageWrapper.style.marginTop = "0.7rem";
        UserMessageWrapper.style.marginLeft = "29.99999999%";

        var UserMessage = document.createElement("div");
        UserMessage.textContent = ZdravChatEntry.value;
        UserMessage.style.backgroundColor = "rgba(0, 169, 159, 0.10)";
        UserMessage.style.borderRadius = "0.375rem 0.375rem 0.075rem 0.375rem";
        UserMessage.style.padding = ".8125rem 1.25rem";
        UserMessage.style.display = "inline-block";
        UserMessage.style.verticalAlign = "top";
        UserMessageWrapper.appendChild(UserMessage);
        ZdravChatMessages.appendChild(UserMessageWrapper);

        let question = ZdravChatEntry.value
        ZdravChatEntry.disabled = true;
        ZdravChatEntry.value = "";

        var ZdravChatAnswerWrapper = document.createElement("div");
        ZdravChatAnswerWrapper.style.width = "70%";
        ZdravChatAnswerWrapper.style.marginTop = "0.7rem";

        var ZdravChatAnswer = document.createElement("div");
        ZdravChatAnswer.innerText = "Пожалуйста, подождите...";
        ZdravChatAnswer.style.backgroundColor = "rgba(0, 169, 159, 0.2)";
        ZdravChatAnswer.style.borderRadius = "0.375rem 0.375rem 0.375rem 0.075rem";
        ZdravChatAnswer.style.padding = ".8125rem 1.25rem";
        ZdravChatAnswer.style.display = "inline-block";
        ZdravChatAnswerWrapper.appendChild(ZdravChatAnswer);
        ZdravChatMessages.appendChild(ZdravChatAnswerWrapper);

        var screenWidth = window.innerWidth;
        console.log(screenWidth);
        if (screenWidth < 768) {
          UserMessageWrapper.style.width = "100%";
          UserMessage.style.width = "100%";
          UserMessageWrapper.style.marginLeft = "0px";
          UserMessageWrapper.style.textAlign = "left";
          ZdravChatAnswerWrapper.style.width = "100%";
          ZdravChatAnswer.style.width = "100%";
          ZdravChatSendBTN.style.width = "100%";
        }
        
        ZdravChatMessages.style.maxHeight = "20rem"; // фиксированная высота контейнера
        ZdravChatMessages.style.overflowY = "scroll"; // прокручиваемый контейнер
        ZdravChatMessages.style.marginBottom = "1.5rem";

        msgObjects.push(UserMessageWrapper);
        msgObjects.push(ZdravChatAnswerWrapper);
        msgObjects.push(UserMessage);
        msgObjects.push(ZdravChatAnswer);

        userMsgs.push(UserMessage);
        userMsgWrappers.push(UserMessageWrapper);
        answerMsgs.push(ZdravChatAnswer);
        answerMsgWrappers.push(ZdravChatAnswerWrapper);

        ZdravChatMessages.scrollTop = ZdravChatMessages.scrollHeight;
        
        ZdravChatContext.push("U[" + question + "]--");

        getAnswer(question, randomIntFromInterval(100000, 999999), 10, false, user_id, ZdravChatAnswer)
      }
    }
  }
  
  function getAnswer(q, id, i, isRev, username, openaiAnswer) {
   
    openaiAnswer.style.background = 'rgb(239, 247, 253)'; 
    openaiAnswer.style.color = 'rgb(0,0,0)'; 

    if (isRev) {
        i -= 50;
    } else {
        i += 50;
    }

    if (i < 0) {
        isRev = false;
    } else if (i > 1600) {
        isRev = true;
    }

    let u = Math.round(i/10);

    let color = 'rgb(' + u + ',' + u + ',' + u + ')'
    openaiAnswer.style.color = color;

    let resp = '';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://37.140.192.66:50003/ZdravCode.AskChatGPT?q='+q+"&id="+id+"&u="+username+"&c="+ZdravChatContext);
    xhr.onload = () => {
    if(xhr.status == 200) {
      resp = JSON.parse(xhr.responseText);
      if (resp.text!="") {
        openaiAnswer.innerHTML = resp.text;
        openaiAnswer.style.display = 'block';
        ZdravChatMessages.scrollTop = ZdravChatMessages.scrollHeight;
      }
      if (resp.ready) {
        openaiAnswer.style.display = 'block'; 
        ZdravChatEntry.disabled = false;
        if (resp.error) {
          openaiAnswer.style.backgroundColor = "rgba(0, 169, 159, 0.2)";
          openaiAnswer.style.color = 'rgb(0,0,0)'; 
        } else {
          openaiAnswer.style.backgroundColor = "rgba(0, 169, 159, 0.2)";
          openaiAnswer.style.color = 'rgb(0,0,0)'; 
          ZdravChatContext.push("B=[" + resp.text + "]--");
        }
      } else {
        getAnswer("", id, i, isRev, username, openaiAnswer);
      }
    } else {
      console.error('Error, status code: ' + xhr.status);
    }
  };
  xhr.send();
  }

  function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function adjustStyles() {
    var screenWidth = window.innerWidth;
    console.log(screenWidth);
    if (screenWidth < 768) {
      ZdravChatSendBTN.style.width = "100%";
      for (let i = 0; i < msgObjects.length; i++) {
        let msgObj = msgObjects[i];
        msgObj.style.marginLeft = "0px";
        msgObj.style.textAlign = "left";
        msgObj.style.maxWidth = "100%";
        msgObj.style.width = "100%";
      }
    } else {
      ZdravChatSendBTN.style.width = "";
      for (let i = 0; i < userMsgWrappers.length; i++) {
        let msgObj = userMsgWrappers[i];
        msgObj.style.marginLeft = "29.99999999%";
        msgObj.style.textAlign = "right";
        msgObj.style.maxWidth = "70%";
        msgObj.style.width = "";
      }
      for (let i = 0; i < userMsgs.length; i++) {
        let msgObj = userMsgs[i];
        msgObj.style.textAlign = "right";
        msgObj.style.maxWidth = "";
        msgObj.style.width = "";
      }
      for (let i = 0; i < answerMsgWrappers.length; i++) {
        let msgObj = answerMsgWrappers[i];
        msgObj.style.maxWidth = "70%";
        msgObj.style.width = "";
      }
      for (let i = 0; i < answerMsgs.length; i++) {
        let msgObj = answerMsgs[i];
        msgObj.style.maxWidth = "";
        msgObj.style.width = "";
      }
    }
  }

  window.addEventListener('resize', adjustStyles);
  
})();
