Studio
============
Установка
----------
1. Создать новую область и БД ("STUDIO")
2. Импортировать классы с директории cls:

		zn "STUDIO" 
		d $System.OBJ.ImportDir("$GIT_DIR$\cache_studio\cls\", "*.xml", "ckbud", .err, 1)
		
3. Скопировать файлы с директории csp\studio в директорию X:\Intersystems\Ensemble\CSP\studio

Настройка
----------
* Директория проектов должна обязательно находится внутри X\Ensemble\CSP'\studio
чтобы работала функция предпросмотра.
* Меню "Инструменты" -> "Настройки":
  * Каталог базы данных: X:\Intersystems\ensemble\mgr\
  * Каталог CSP файлов: X:\Intersystems\ensemble\CSP\
  * Директория проектов: X:\Intersystems\ensemble\CSP\studio\projects\

