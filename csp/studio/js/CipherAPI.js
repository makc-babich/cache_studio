
// Определение глобальных переменных
var ccxAppletName = "applet509";
var ccxIsActiveModalMessage = false;
var ccxModalInputResult = "";
var ccxModalInputCallback = null;
var AppDebugEnabled = false;
var ccxIsLoginPage = false;
var ccxPasswordAttemptsCount = 0;
var ccxPasswordAttemptsLimit = 5;
var cryptoContext;


// Если находимся в дочернем окне, ты пробуем взять подготовленный контекст из родительского
if (opener && opener.cryptoContext) {
	cryptoContext = opener.cryptoContext;
}
else {
	// Иначе создаем новый объект контекста
	cryptoContext = new Object({
		context: 0,
		container : ccxGetCookie("lastKeyFileName"),
		password : null,
		serial : "", //zenPage.classGetSessionData("UserSerial"),
		applet : null,
		params : new Object({
			LDAPServer : null,
			LDAPBaseDN : null
		}),
		initialized : false,
		mode : "file",
		isScm: false,
		scmProvider: null,
		scmSlots: null,
		scmCurrentSlot: null		
	});
}


function ccxInitApp() {
	AppDebugEnabled = !! parseInt(zenPage.getConfigurationProperty("AppDebugEnabled"));
	ccxGetApplet();
}

// Установка значения cookie
function ccxSetCookie(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

// Запрос значения cookie
function ccxGetCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for ( i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
	return null;
}

// Получение значения переменной из запроса GET
function ccxGetUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

// Вывод окна с запросов пароля пользователя (синхронно)
function ccxPasswordPrompt() {
	var applet = ccxGetApplet();
	ccxPasswordAttemptsCount++;
	return applet.passwordPrompt(cryptoContext.container);
}

// Получение объекта крипто-аплета
function ccxGetApplet() {
	var applet;

	if (opener && opener.cryptoContext && opener.cryptoContext.applet) {
		cryptoContext = opener.cryptoContext;
	} 
	else {
		applet = document.getElementById(ccxAppletName);
		cryptoContext.applet = applet;
	}
	ccxCheckAppletState();
	return cryptoContext.applet;
}

// Запрос состояния аплета
function ccxCheckAppletState() {
	var applet = cryptoContext.applet;
	if (!applet || ! applet.initState) {
		zenPage.modalErrorMessage("На Вашем компьютере не установлена Java, либо неправильно настроен веб-браузер.<br>Работа в системе невозможна.<br>Обратитесь в службу поддержки.", "Помилка", "Апплет не найден либо непроинициализирован.");
		if (ccxIsLoginPage) {
			window.setTimeout("ccxDisableLoginInputs();", 300);
		}
	}
}

function ccxDisableLoginInputs() {
	zen('keyLoginButton').setProperty('caption', 'Вхід до системи неможливий');
	zen('keyLoginButton').setProperty('disabled', true);
	zen('keyPassword').setProperty('disabled', true);

}

// Инициализация контекста крипто-провайдера.
// Возвращает объект контекста в случае успеха (также объект записывается в cryptoContext.context для дальнейшего использования).
// Неудача - null
function ccxGetProviderContext() {
	try {
		// Если контекст уже есть - просто вернем его
		if (cryptoContext.context) {
			return cryptoContext.context;
		}
		
		// Имя файла ключевого контейнера или слот SecureMedia
		var container = cryptoContext.isScm ? cryptoContext.scmCurrentSlot : cryptoContext.container; 

		// Пароль к контейнеру
		var password = cryptoContext.password;
		
		// Если контейнер не задан - ошибка
		if (!container) {
			zenPage.modalErrorMessage("Невірний ключ або пароль.<br>Вхід до системи неможливий.<br> Спробуйте ще раз або зверніться до адміністратора.", "Помилка авторизації", "Не обрано ключового контейнеру.");
			return null;
		}

		var applet = ccxGetApplet(); //TODO: check object
		
		// Контекст не проинициализирован - запрашиваем пароль на контейнер.
		if (password == null) {
			password = ccxPasswordPrompt();
			if (password) {
				cryptoContext.password = password
			}
			//else {
			//	return null;
			//}
		}
		
		// Длина пароля должна быть 8 или более символов
		if (password.length < 8) {
			zenPage.modalErrorMessage("Невірний пароль.<br>Вхід до системи неможливий.<br> Спробуйте ще раз або зверніться до адміністратора.", "Помилка авторизації", "Довжина пароля має бути 8 або більше символів.");
			cryptoContext.password = null;
			return null;
		}
		
		// Запрос параметров конфигурации с сервера
		var ldapServer = zenPage.getConfigurationProperty("CCXLdapServer");
		var ldapDN = zenPage.getConfigurationProperty("CCXLdapDN");
		var ocspServer = zenPage.getConfigurationProperty("CCXOcspServer");
		var tsaServer = zenPage.getConfigurationProperty("CCXTsaServer");
		
		// Инициализация контекста - вызов Java.
		// Возвращает готовый объект com.cipher.ccx509.CCX509Context, либо null, либо Exception.
		var context = applet.initContext2(container, password, ldapServer, ldapDN, ocspServer, tsaServer, cryptoContext.scmProvider);
		
		if (context) {
			cryptoContext.context = context;
			cryptoContext.initialized = true;
		}
		//ccxPasswordAttempsCount = 0; // Сбрасываем счетчик попыток ввода пароля
		return context; 
	} catch(ex) {
		cryptoContext.context = null;
		cryptoContext.password = null;
		if (ccxIsLoginPage) {
			zenPage.modalErrorMessage("Невірний ключ або пароль.<br>Вхід до системи неможливий.<br> Спробуйте ще раз або зверніться до адміністратора.", "Помилка авторизації", ex);
		}
		zenPage.logDebugMessage("Error: getProviderContext failed: " + ex);
		//throw ex;
	}
	return null;
}


function ccxGetScmProvider() {
	if (cryptoContext.scmProvider ) {
		return cryptoContext.scmProvider;
	}
	try {
		var applet = ccxGetApplet();
		cryptoContext.scmProvider = applet.getScmProvider2();
	}
	catch(ex) {
		//TODO: change to messageManager
		zenPage.modalErrorMessage("Ошибка взаимодействия с защищенными носителями.<br>Работа в системе невозможна.<br>Обратитесь в службу поддержки.", "Помилка системи.", ex);
		throw ex;
	}
	return null; //TODO: remove
}

function ccxGetMediaList() {
	try {
		var prov = ccxGetScmProvider();
		var applet = ccxGetApplet();
		if (applet && prov) {
			return applet.getMediaList2(prov);
		}
		else {
			//TODO
			//TODO: fix //throw "Не удалось получить список носителей.";
		}
	}
	catch(ex) {
		zenPage.modalErrorMessage("Ошибка взаимодействия с защищенными носителями.<br>Работа в системе невозможна.<br>Обратитесь в службу поддержки.", "Помилка системи.", ex);
		throw ex;
	}
}

function ccxGetMediaInfo(slotId) {
	try {
		var prov = ccxGetScmProvider();
		var applet = ccxGetApplet();
		if (applet && prov && slotId) {
			return applet.getMediaInfo2(slotId, prov);
		}
		else {
			throw "Не удалось получить информацию с носителя.";
		}
	}
	catch(ex) {
		zenPage.modalErrorMessage("Ошибка взаимодействия с защищенными носителями.<br>Работа в системе невозможна.<br>Обратитесь в службу поддержки.", "Помилка системи.", ex);
		throw ex;
	}
}


// Функция подписи данных. 
// На вход принимает данные в виде строки.
// Результат выполнения - строка, состоящая из префикса и суффикса подписи в шестнадцатеричном виде, разделенные \x01.
// В случае ошибки - null. 
function ccxSignData(data) {
	var result = null;
	try {
		// Получение контекста провайдера
		ccxGetProviderContext();
		var ctx = cryptoContext.context;
		if (!ctx) {
			zenPage.logDebugMessage("ccxSignData: no context");
			return null;
		}
		
		// Преобразуем данные в байтовый массив
		var sigDataBytes = ccxStrToBytes(data);
		zenPage.logDebugMessage("Подписываемые данные: bytes: " + sigDataBytes);
		
		// Начинаем подпись
		var sig = ctx.begin_create_sign();
		zenPage.logDebugMessage("SignatureContext = " + sig);

		// Получаем префикс подписи
		var valEnc = sig.get_prefix().getEncoded();
		var valHex = ccxJavaByteArrayToHex(valEnc);
		zenPage.logDebugMessage("Prefix Length = " + valEnc.length);
		zenPage.logDebugMessage("Prefix HEX    = " + valHex);
		result = valHex;
		
		// Протоколируем дату создания подписи
		valEnc = sig.get_prefix().getSignDate();
		zenPage.logDebugMessage("SignDate = " + valEnc);

		// Подписываем данные
		sig.update(sigDataBytes, 0, sigDataBytes.length);

		// Получаем суффикс подписи
		var suffix = sig.finalize_produce();
		valEnc = suffix.getEncoded();
		valHex = ccxJavaByteArrayToHex(valEnc);
		zenPage.logDebugMessage("Suffix Length = " + valEnc.length);
		zenPage.logDebugMessage("Suffix HEX    = " + valHex);

		result += "\x01" + valHex;
		zenPage.logDebugMessage("ccxSignData = " + result);
		return result;
	} catch (ex) {
		zenPage.logDebugMessage("ccxSignData : SIGN Exception = " + ex);
		//throw ex;
	}
	return null;
}

// Обработка туннелированного запроса к Сайфер
function ccxHandleTunnelRequest(javaBytes) {
	var hexString = ccxJavaByteArrayToHex(javaBytes);
	return zenPage.handleTunnelRequest(hexString);
}

// Проверка подписи данных (на сервере).
// См. erdr.web.template.Object.cls
function ccxVerifyData(complexSign, data) {
	return zenPage.serverVerifySignature(complexSign, data);	
}

// Преобразование Java byte[] -> HexString
function ccxJavaByteArrayToHex(bytes)
{
	// TDA 2012-07
	// TODO: Method is very slow, we have to change algo
	var str = "";
  	for (var i = 0; i < bytes.length; i++) {
    	var s = (bytes[i] & 0xff).toString(16);
    	if (s.length == 1) s = "0" + s;
    	str += s;
  	}
  	return str.toUpperCase();
}

// Преобразование строки в массив байт
function ccxStrToBytes(str)
{
	// TDA 2012-07
	var bytes = [];
    for(var i = 0, n = str.length; i < n; i++) {
        var ch = str.charCodeAt(i);
        //bytes.push(ch >>> 8, ch & 0xFF);
        bytes.push(ch)
    }
    return bytes;
}

function ccxFixString(str) {
	var result = "";
	for (var i=0; i < str.length; i++) {
		if (str.charCodeAt(i) < 255) {
			// &0xff
			result += str[i];
		}
	}	
	return result;
}


