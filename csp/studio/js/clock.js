//var serverDateUTC = '20071120'; ///YYYYMMDD
//var serverTimeUTC = '132435'; ///HHMMSS
var theDT; /// последняя показанная дата и время
var lastTime; /// Метка времени последнего изменения серверного времени (в сек.)
var doInitClock = true; //Нужна иниц. времени 

var CLOCKID = 'nppsClockDiv';

// Формат отображения ДатыВремени ('' - по умолчанию)
//var DATETIMEFORMAT = '%sessionTimeout';
var DATETIMEFORMAT = '';
// Таймаут сессии в секундах (для обратного отсчёта)
//var SESSIONTIMEOUT = 10; 



var CalendarUA = new Object({
	Months : ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
	Days : ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота', 'Неділя']
	
}); 
var CalendarRU = new Object({
	Months : ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
	Days : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
	
}); 

/// ------------------------------------------------

/// Событие на пересчет и показ времени
function OnClock()
{         
	/// Если нужно иниц. время
	if (doInitClock) InitClock();
        theDT.setSeconds(theDT.getSeconds() + 1); //посекундно увеличиваем время
	if (sessionTimeout>0) {
		sessionTimeout+=-1; //таймаут сессии
	}
	else if (sessionTimeout==0) {
    	// Остановим таймаут сессии, чтобы не зацикливалось
	    sessionTimeout = -1; 
		// Обработчик при истечении таймаута сессии
		var w = top;
		while (w.opener) w = opener;
		zenPage.ExitSystem(1);
		//w.location.href = zenPage.getConfigurationProperty("AppLoginPage") + "?AutoLogout=1";
	}
	var params=[sessionTimeout];
	setDateTime(CLOCKID,theDT,DATETIMEFORMAT,params); //устанавливаем время на странице
	  
	if (doInitClock) {
		doInitClock = false;
	}
}

// Функция записывает в контейнер id ДатаВремя datetime в формате format
// Параметры:
//    id - ид-р контейнера (div, span, и т.п.)
//    datetime - объект класса Date
//    format - формат ДатаВремя (0 - по умолчанию "День, Дата Месяц Год, Час:Минута:Секунда"), расширяется
//    aParams - дополнительные параметры
function setDateTime(id,datetime,format,aParams) {
	// Формат по-умолчанию
	if (typeof(format)=='undefined') {format='';}
	var result='';
	// Контейнер (в нем будет отображаться ДатаВремя)
	var obj=document.getElementById(id);
	if ((obj)&&(CalendarUA)) {
		// Индекс месяца в локализованном массиве названий месяцев (0 - январь, 1 - февраль и т.п.)
		var monthIdx=datetime.getMonth();
		// Индекс дня в локализованном массиве названий дней (0 - понедельник, 1 - вторник и т.п.)
		var dayIdx=datetime.getDay()-1;
		if (dayIdx<0) {dayIdx=6}
		var lang = zenPage.GetSessionData("language");
		if (lang=='ru'){
			var dayName=CalendarRU.Days[dayIdx];
			var monthName=CalendarRU.Months[monthIdx];
		}else{
			var dayName=CalendarUA.Days[dayIdx];
			var monthName=CalendarUA.Months[monthIdx];
		}
		var date=justify(datetime.getDate(),2,'0');
		var year=datetime.getFullYear();
		var hours=justify(datetime.getHours(),2,'0');
		var minutes=justify(datetime.getMinutes(),2,'0');
		var seconds=justify(datetime.getSeconds(),2,'0');
		var sessionTO=aParams[0];
		if (sessionTO<0) {sessionTO=0}
		
		// Формат не задан - отображаем текущее ДатаВремя в формате по-умолчанию
		if (format=='') {
			result=dayName+', '+date+' '+monthName+' '+year+', '+hours+':'+minutes+':'+seconds;
		}
		// Формат задан
		else {
			var params=[seconds,minutes,hours,year,justify(monthIdx+1,2,'0'),date,monthName,dayName,sessionTO];
			result=parseString(format,params);
		}
		obj.innerHTML=result;
	}
}

// Функция добавляет слева от nubmer символы fullchar, чтобы длина number была равна digits
// Параметры:
//    number - анализируемая строка/число
//    digits - до скольких символов необходимо дополнить
//    fullchar - символ для заполнения до требуемой длины
function justify(number,digits,fullchar) {
	var result='';
	if (typeof(number)!='undefined') {
		result=number;
		number=number+'';
		if (typeof(digits)!='undefined') {
			if (number.length<digits) {
				if (typeof(fullchar)=='undefined') {fullchar='0';}
				var diff = digits - number.length + 1;
				for (var i=1;i<diff;i++) {
					number=fullchar+number;
				}
				result=number;
			}
		}
	}
	return result;
}

// Функция парсит строку template и подставляет туда вместо специальных переменных их значения
// Параметры:
//    template - выходной формат
//       %ss - секунды
//       %mm - минуты
//       %hh - часы
//       %YYYY - год (4 цифры)
//       %YY - год (2 цифры)
//       %MM - месяц
//       %DD - дата
//       %Month - название месяца
//       %Day - название дня
//       %stS - секунды (в контексте разложения на часы/минуты/секунды)
//       %stM - минуты (в контексте разложения на часы/минуты/секунды)
//       %stH - часы (в контексте разложения на часы/минуты/секунды)
//       %sessionTimeout - время до окончания сессии в секундах
//    params - массив с параметрыми
//       0 - секунды (0-59)
//       1 - минуты (0-59)
//       2 - часы
//       3 - год (4 цифры)
//       4 - номер месяца (1-12)
//       5 - дата (1-31)
//       6 - название месяца
//       7 - название дня
//       8 - таймаут сессии (абсолютные секунды)
function parseString(template,params) {
	var result='';
	if ((template!='')&&(typeof(params)!='undefined')) {
		result = template.replace(/%ss/g,params[0]); //секунды
		result = result.replace(/%mm/g,params[1]); //минуты
		result = result.replace(/%hh/g,params[2]); //часы
		result = result.replace(/%YYYY/g,params[3]); //год (4 цифры)
		result = result.replace(/%YY/g,(params[3]+'').slice(2,4)); //год (2 цифры)
		result = result.replace(/%MM/g,params[4]); //месяц
		result = result.replace(/%DD/g,params[5]); //день месяца
		result = result.replace(/%Month/g,params[6]); //название месяца
		result = result.replace(/%Day/g,params[7]); //название дня
		
		var stS = params[8];
		var stM = Math.round(stS/60-.5);
		stS = stS - stM * 60;
		var stH = Math.round(stM/60-.5);
		stM = stM - stH * 60;
		
		result = result.replace(/%stS/g,justify(stS,2,'0')); //таймаут сессии (секунды)
		result = result.replace(/%stM/g,justify(stM,2,'0')); //таймаут сессии (минуты)
		result = result.replace(/%stH/g,justify(stH,2,'0')); //таймаут сессии (часы)
		result = result.replace(/%sessionTimeout/g,justify(params[8],2,'0')); //таймаут сессии (абсолютные секунды)
	}
	return result;
}

/// Иниц. времени
/// Вычисляется разница между серверным и локальным временем в UTC.
function InitClock()
{
  var yyyy, mm, dd;
  var hh, nn, ss;
  yyyy = serverDateUTC.slice(0,4);

  mm = serverDateUTC.slice(4,6);
  // Т.к. в JavaScript месяц начинается с 0
  mm = mm - 1;
  dd = serverDateUTC.slice(6,8);

  hh = serverTimeUTC.slice(0,2);
  nn = serverTimeUTC.slice(2,4);
  ss = serverTimeUTC.slice(4,6);
  
  theDT = new Date(yyyy, mm, dd, hh, nn, ss);

  var nowDT = new Date();
  lastTime = Math.round(nowDT.getTime() / 1000); // в сек.
  sessionTimeout=SESSIONTIMEOUT;
}

//// Включение!!!
top.window.setInterval('OnClock();',1000);
