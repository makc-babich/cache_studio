jQuery(function($){
   $("#phone").mask("+38(999)999-99-99");
});

$("#phone").keyup(function(){
    
    
	var regExp = /(^\+[0-9]+)|(\()|(\))|(-)|(_)/g;
	var phone = $('#phone').attr('value').replace(regExp,'');
	
    if(phone >= 0)
    {
    if(isValidPhone(phone))
    {
    $("#validPhone").css({
  "background-image": "url('img/validyes.png')"
    });
    } else {
    $("#validPhone").css({
  "background-image": "url('img/validno.png')"
    });
    }
    } else {
    $("#validPhone").css({
  "background-image": "none"
    }); 
    }
  
});

function emailChk() {
  	var emailb = zen('email').getValue();
 	var email = removeSpaces(emailb);
 	var emaila = zen('email');
  	emaila.setValue(email);
  
    if(email != 0)
    {
    if(isValidEmailAddress(email))
    {
    $("#validEmail").css({
  "background-image": "url('img/validyes.png')"
    });
    } else {
    $("#validEmail").css({
  "background-image": "url('img/validno.png')"
    });
    }
    } else {
    $("#validEmail").css({
  "background-image": "none"
    }); 
    }
  
  };

function passChk() {
  	var passb = zen('pass').getValue();
 	var pass = removeSpaces(passb);
 	var passa = zen('pass');
  	passa.setValue(pass);
  	repassChk();
    if(pass.length != 0)
    {
    if(isValidPass(pass))
    {
    $("#validPass").css({
  "background-image": "url('img/validyes.png')"
    });
    } else {
    $("#validPass").css({
  "background-image": "url('img/validno.png')"
    });
    }
    } else {
    $("#validPass").css({
  "background-image": "none"
    }); 
    }
  
};

function repassChk() {
  	var repassb = zen('repass').getValue();
 	var repass = removeSpaces(repassb);
 	var repassa = zen('repass');
  	repassa.setValue(repass);
	var pass = zen('pass').getValue();
  
    if(repass.length != 0)
    {
    if(isValidRepass(pass,repass))
    {
    $("#validRepass").css({
  "background-image": "url('img/validyes.png')"
    });
    } else {
    $("#validRepass").css({
  "background-image": "url('img/validno.png')"
    });
    }
    } else {
    $("#validRepass").css({
  "background-image": "none"
    }); 
    }
  
};

function nameChk() {
  	var nameb = zen('name').getValue();
 	var name = removeSpaces(nameb);
 	var namea = zen('name');
  	namea.setValue(name);
  
    if(name.length != 0)
    {
    if(isValidName(name))
    {
    $("#validName").css({
  "background-image": "url('img/validyes.png')"
    });
    } else {
    $("#validName").css({
  "background-image": "url('img/validno.png')"
    });
    }
    } else {
    $("#validName").css({
  "background-image": "none"
    }); 
    }
  
};

function snameChk() {
  	var snameb = zen('sname').getValue();
 	var sname = removeSpaces(snameb);
 	var snamea = zen('sname');
  	snamea.setValue(sname);  
};


function patrChk() {
  	var patrb = zen('patr').getValue();
 	var patr = removeSpaces(patrb);
 	var patra = zen('patr');
  	patra.setValue(patr);  
};
  
  function removeSpaces(spc) { 
  var allSpacesRe = /\s+/g;
  return spc.replace(allSpacesRe, ""); 
  }
  
  function isValidPhone(phone) {
	if(phone.length<10){
		return 0;
	}else{
	return 1;
	}
  };
  
  function isValidPass(pass) {
	if(pass.length<6||pass.length>20){
		return 0;
	}else{
	return 1;
	}
  };
  
  function isValidRepass(pass,repass) {
	if (pass!=repass){
		return 0;
	}else{
	return 1;
	}
  };
  
  function isValidName(name) {
	if (name.length<2){
		return 0;
	}else{
	return 1;
	}
  };
  
    function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
    };
	