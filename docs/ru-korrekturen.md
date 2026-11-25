# Hybridblock – RU-Korrekturen

Stand der Quellen `dev` (`29d8629`). Geprüft wurden das Wörterbuch und die Zusatztexte aus der Stand-Datei. Die häufigsten Korrekturen betreffen uneinheitliches Fitnessvokabular, wörtliche Übertragungen aus dem Deutschen, geschlechtsspezifische Formulierungen und zu allgemeine Themen der Wissensbank.

| Bereich | Geprüft | Geändert oder neu |
|---|---:|---:|
| A. Wörterbuch | 5.416 formal geprüft | 368 |
| B. Code-Stellen aus § 2.1 | 16 | 16 |
| C. Wissensbank | 546 formal geprüft | 167 |
| D. `cues.js` | 242 Übungen × 3 Hinweise | 80 Übungen |
| D. `cues-ru.js` | 76 Übungen × 3 Hinweise | 32 Übungen |
| E. Push-Texte | 4 Ereignisse | 3 Zeilen |
| F. Datenschutzerklärung | 9 Abschnitte | 1 vollständige RU-Fassung |
| G. Manifest | 1 Beschreibung | 1 Beschreibung |

## A. Wörterbuch

```tsv
 Einträge. Jede Aussage ist mit ihrer Quelle verlinkt (DOI oder PubMed). Allgemeine Information, kein Ersatz für ärztlichen Rat und keine Einschätzung deines Einzelfalls.	 entries. Every statement links to its source (DOI or PubMed). General information, no substitute for medical advice and no assessment of your individual case.	 записей. К каждому утверждению есть ссылка на источник (DOI или PubMed). Это общая информация. За советом по своей ситуации обращайся к врачу.
 Einträge. Jede Aussage ist mit ihrer Quelle verlinkt (DOI oder PubMed). Kein Ersatz für ärztlichen Rat.	 entries. Every statement links to its source (DOI or PubMed). Not a substitute for medical advice.	 записей. К каждому утверждению есть ссылка на источник (DOI или PubMed). Это не заменяет консультацию врача.
 kg e1RM	 kg e1RM	 кг e1RM
 min. Übungen passend zu den Geräten des Athleten	 min. Exercises match the athlete's equipment	 мин. Упражнения подобраны под оборудование атлета
 · Evidenz 	 · Evidence	 · Доказательность 
% über den Vorwochen. Das ist nur ein Hinweis: Ob es zu viel war, zeigen Schlaf, Ruhepuls und dein Gefühl besser als diese Zahl.	% above the previous weeks. This is only a hint: sleep, resting heart rate and how you feel show better than this number whether it was too much.	% выше, чем в предыдущие недели. Сон, пульс в покое и самочувствие лучше покажут, не перебор ли это.
% über den Vorwochen. Zusätzliche Cardio-Einheiten oder Spiele lieber locker halten.	% above the previous weeks. Keep extra cardio sessions or matches easy.	% выше, чем в предыдущие недели. Дополнительное кардио или игры лучше оставить лёгкими.
). Barcode-Scan oder „Neu“ funktionieren trotzdem.	). Barcode scan or “New” still work.	). Штрихкод можно отсканировать или добавить продукт через «Новый».
+ Gemeinsames Training planen	+ Plan a joint session	+ Совместная тренировка
+{n} Teilwiederholungen in der Dehnung	+{n} lengthened partials	+{n} частичных повторений в растянутой позиции
, Beschwerden berücksichtigt	, complaints taken into account	, с учётом ограничений
, Daten unter ODbL.	, data under ODbL.	, данные по лицензии ODbL.
. Bewusst leicht halten.	. Keep it light on purpose.	. Держи нагрузку лёгкой.
. Eine Woche ohne Defizit gibt Leistung und Erholung Luft.	. A week without a deficit gives performance and recovery some room.	. Неделя без дефицита поможет восстановиться и сохранить результаты.
/10. Nach dem Aufwärmen oben eintragen.	/10. Enter it above after warming up.	/10. Укажи вверху после разминки.
1 Formcheck offen	1 form check pending	1 проверка техники в ожидании
1.000 m Kraul am Stück, 30 min Dauerlauf, 1 h Radfahren; Sporttauglichkeit ärztlich abklären.	1,000 m freestyle non-stop, 30 min continuous run, 1 h bike ride; get medical clearance for sport.	1 000 м кролем без остановки, 30 мин непрерывного бега и 1 ч на велосипеде. Обсуди с врачом, подходит ли тебе такая нагрузка.
2 Wochen ohne neues e1RM	2 weeks without a new e1RM	2 недели без нового e1RM
2000 m Rudern	2000 m row	Гребля 2 000 м
2× pro Woche 4×4 min bei 90–95 % HFmax mit 3 min locker dazwischen, 1× Z2 40–60 min, 1× Ganzkörper-Kraft zum Erhalt. Deload in Woche 4 und 8 mit 3×4.	2× a week 4×4 min at 90–95% HRmax with 3 min easy in between, 1× Z2 40–60 min, 1× full-body strength to maintain. Deload in weeks 4 and 8 with 3×4.	2 раза в неделю: 4×4 мин при 90–95 % ЧССмакс, между интервалами по 3 мин легко. Ещё 1 тренировка в Z2 на 40–60 мин и 1 силовая на всё тело для поддержания силы. Делоуд на 4-й и 8-й неделях: 3×4.
3 Ganzkörper-Einheiten A, B, C. Jede beginnt mit einer Hüftstreckung (Hip Thrust, einbeinig oder Glute Bridge), dann Beine, Rudern, Drücken und Rumpf. 3×8–12, doppelte Progression. Das Original steigert über drei Phasen von Körpergewicht zu Langhantel; hier wählst du die passende Stufe unter „Varianten“.	3 full-body sessions A, B, C. Each starts with a hip extension (hip thrust, single-leg or glute bridge), then legs, rows, presses and core. 3×8–12, double progression. The original progresses over three phases from bodyweight to barbell; here you pick the right level under “Variations”.	3 тренировки на всё тело: A, B, C. Начинай каждую с разгибания в тазобедренных суставах (Hip Thrust, вариант на одной ноге или ягодичный мост с пола). Затем — ноги, тяги, жимы и кор. Работай по 3×8–12 с двойной прогрессией. В оригинале за три фазы переходят от собственного веса к штанге. Здесь нужный уровень можно выбрать в «Вариантах».
3 Krafteinheiten (Unterkörper + Zug, Oberkörper, Ganzkörper), 1× HIIT 4×4, 1× Z2. Deine Schwerpunkt-Muskeln bekommen 12–20 Sätze pro Woche. RPE-Autoregulation, Deload in Woche 4 und 8, Testwoche 12.	3 strength sessions (lower body + pull, upper body, full body), 1× HIIT 4×4, 1× Z2. Your focus muscles get 12–20 sets per week. RPE autoregulation, deloads in weeks 4 and 8, test week 12.	3 силовые тренировки (низ + тяга, верх, всё тело), 1 HIIT 4×4, 1 в Z2. На приоритетные мышцы — 12–20 подходов в неделю. Авторегуляция по RPE, делоуд на 4-й и 8-й неделях, тест на 12-й.
3 Krafteinheiten (Unterkörper + Zug, Oberkörper, Ganzkörper), 1× HIIT 4×4, 1× Z2. Schwerpunkt Waden, Hamstrings, Bizeps, Bauch mit 12–20 Sätzen pro Woche. RPE-Autoregulation, Deload in Woche 4 und 8, Testwoche 12.	3 strength sessions (lower body + pull, upper body, full body), 1× HIIT 4×4, 1× Z2. Focus on calves, hamstrings, biceps, abs with 12–20 sets per week. RPE autoregulation, deloads in weeks 4 and 8, test week 12.	3 силовые тренировки (низ + тяга, верх, всё тело), 1 HIIT 4×4, 1 в Z2. В приоритете икры, задняя поверхность бедра, бицепс и пресс: 12–20 подходов в неделю. Авторегуляция по RPE, делоуд на 4-й и 8-й неделях, тест на 12-й.
3 × 5 @ 70 %. Deload.	3 × 5 @ 70%. Deload.	3 × 5 @ 70 %. Делоуд.
3 × 6 @ 75 %. Deload.	3 × 6 @ 75%. Deload.	3 × 6 @ 75 %. Делоуд.
3× Kraft, 1× HIIT, 1× Z2. Schwerpunkt Waden, Hamstrings, Bizeps, Bauch.	3× strength, 1× HIIT, 1× Z2. Focus on calves, hamstrings, biceps, abs.	3 силовые тренировки, 1 HIIT и 1 в Z2. В приоритете икры, задняя поверхность бедра, бицепс и пресс.
3× Kraft, 1× HIIT, 1× Z2. Schwerpunkt-Muskeln wählst du selbst.	3× strength, 1× HIIT, 1× Z2. You choose your focus muscles.	3 силовые тренировки, 1 HIIT и 1 в Z2. Выбери приоритетные мышцы.
3× pro Woche dasselbe Ganzkörper-Training: drei Superset-Paare (Klimmzug + Kniebeuge, Dips + Hüftstreckung, Rudern + Liegestütz), dann Rumpf. 3×5–8, bei 3×8 die nächste schwerere Variante. Varianten findest du bei jeder Übung unter „Varianten“.	3× a week the same full-body workout: three superset pairs (pull-up + squat, dips + hip hinge, row + push-up), then core. 3×5–8; at 3×8 move to the next harder variation. You'll find variations under “Variations” on every exercise.	Три одинаковые тренировки на всё тело в неделю: подтягивания + присед, брусья + разгибание в тазобедренных суставах, тяга + отжимания. Делай эти три пары суперсетами, затем поработай над кором. Выполняй 3×5–8. Когда получается 3×8, переходи к более сложному варианту. Варианты есть в карточке каждого упражнения.
3×5 @ 40/50/60 % TM (Deload)	3×5 @ 40/50/60% TM (deload)	3×5 @ 40/50/60 % TM (делоуд)
4 Ganzkörper-Einheiten. Pro Woche etwa 18–22 Sätze für das Gesäß (Hip Thrust, Kreuzheben-Varianten, Ausfallschritte, Abduktion, Kickback), 10–12 für Oberschenkel vorne und hinten, 9–12 für Rücken, 6–9 für Brust und Schultern. Arme arbeiten bei Zug und Druck mit. RPE-Steuerung, Deload in Woche 4 und 8.	4 full-body sessions. Per week about 18–22 sets for the glutes (hip thrust, deadlift variations, lunges, abduction, kickbacks), 10–12 for front and back of the thighs, 9–12 for the back, 6–9 for chest and shoulders. Arms work along in pulls and presses. RPE-based, deloads in weeks 4 and 8.	4 тренировки на всё тело. В неделю примерно 18–22 подхода на ягодицы (Hip Thrust, варианты становой тяги, выпады, отведения и махи назад), 10–12 на переднюю и заднюю поверхность бедра, 9–12 на спину и 6–9 на грудь и плечи. Руки работают в тягах и жимах. Авторегуляция по RPE, делоуд на 4-й и 8-й неделях.
4-Wochen-Welle pro Hauptübung: Woche 1 Fünfer, Woche 2 Dreier, Woche 3 5/3/1, Woche 4 Deload. Letzter Hauptsatz so viele wie möglich. Danach 5×10 derselben Übung leicht (Original 50–60 % vom Trainingsmax), dazu Zug- und Rumpfarbeit.	4-week wave per main lift: week 1 fives, week 2 threes, week 3 5/3/1, week 4 deload. Last main set as many as possible. Then 5×10 of the same lift, light (original 50–60% of training max), plus pulling and core work.	4-недельная волна для каждого базового упражнения: 1-я неделя — пятёрки, 2-я — тройки, 3-я — 5/3/1, 4-я — делоуд. В последнем основном подходе сделай как можно больше повторений. Затем 5×10 того же упражнения с лёгким весом (в оригинале 50–60 % от тренировочного максимума), плюс тяги и упражнения на кор.
4×4-Intervalle steigern die VO₂max stärker als moderates Dauertraining	4×4 intervals raise VO₂max more than moderate steady training	Интервалы 4×4 повышают VO₂max сильнее, чем умеренная равномерная работа
90/90-Hüftöffner	90/90 hip opener	Мобилизация бёдер 90/90
Ab etwa {c} harten Sätzen pro Einheit bringt jeder weitere Satz weniger. Ein Teil passt besser in „{o}“.	Beyond about {c} hard sets per session, each extra set brings less. Some of them fit better in “{o}”.	Примерно после {c} тяжёлых подходов за тренировку отдача от каждого следующего ниже. Часть лучше перенести в «{o}».
Ab etwa {c} harten Sätzen pro Einheit bringt jeder weitere Satz weniger. Verteile den Rest auf eine zweite Einheit.	Beyond about {c} hard sets per session, each extra set brings less. Move the rest to a second session.	Примерно после {c} тяжёлых подходов за тренировку отдача от каждого следующего ниже. Перенеси оставшиеся подходы на вторую тренировку.
Absagen, Einheit allein machen	Cancel and do the session on my own	Отменить встречу и тренироваться отдельно
Alle Uhren und Fitness-Apps, die in Health Connect schreiben: Zepp, Samsung, Garmin, Fitbit, Polar, Withings, Oura und viele mehr. Hybridblock liest von dort.	All watches and fitness apps that write to Health Connect: Zepp, Samsung, Garmin, Fitbit, Polar, Withings, Oura and many more. Hybridblock reads from there.	Подойдут любые часы и фитнес-приложения, которые передают данные в Health Connect: Zepp, Samsung, Garmin, Fitbit, Polar, Withings, Oura и другие. Hybridblock получает данные из Health Connect.
Alles (Kalorien und Makros)	Everything (calories and macros)	Всё (калории и БЖУ)
Alles für Sportwissenschaftler: ACWR, Monotonie, Strain, HRV, TRIMP, Methoden, Evidenzgrade und Quellen.	Everything for sports scientists: ACWR, monotony, strain, HRV, TRIMP, methods, evidence grades and sources.	Для спортивных специалистов: ACWR, монотонность, суммарная нагрузка (strain), HRV, TRIMP, методы, уровни доказательности и источники.
Als 21er.	As 21s.	По схеме «21».
Als 21er: 7 unten, 7 oben, 7 voll. Optional.	As 21s: 7 bottom, 7 top, 7 full. Optional.	По схеме «21»: 7 в нижней половине, 7 в верхней и 7 в полной амплитуде. По желанию.
Als Nächstes	Up next	Дальше по плану
An Tag 1 ging es dir bisher meist schlechter, plane dafür ruhig etwas Leichtes ein.	Day 1 has usually been harder for you, so plan something easy.	В первый день самочувствие обычно было хуже. Запланируй на этот день лёгкую нагрузку.
An {n} Athleten gesendet	Sent to {n} athletes	Отправлено атлетам: {n}
Angaben für {n} eintragen	Enter details for {n}	Указать данные для {n}
Ansicht als Athlet:	Viewing as athlete:	Просмотр как атлет:
Anstrengungswellen statt starrem Deload	Effort waves instead of a rigid deload	Волны нагрузки вместо делоуда по жёсткому графику
App entscheidet	App decides	Автовыбор
App entscheidet, du wirst informiert	App decides, you get notified	Приложение решит и сообщит
Athleten oder Vorlagen suchen	Search athletes or templates	Поиск атлетов или шаблонов
Aus Ziel, Erfahrung, Tagen, Zeit, Geräten und Beschwerden.	From goal, experience, days, time, equipment and complaints.	По цели, опыту, дням тренировок, доступному времени, оборудованию и ограничениям.
Aus deinen Angaben erstellt. Übungen mit Stillstand werden getauscht, Muskeln unter dem Soll bekommen mehr Sätze, Startgewichte kommen aus deinen letzten Leistungen.	Built from your details. Exercises that stalled are swapped, muscles below target get more sets, starting weights come from your latest performance.	План составлен по твоим данным. Упражнения, в которых прогресс встал, заменены. Если на мышцу не хватает работы, добавлены подходы. Стартовые веса рассчитаны по последним результатам.
Aus deinen Ergebnissen: {a} Übungen getauscht, {b}× ein Satz mehr für Muskeln unter dem Soll.	From your results: {a} exercises swapped, {b}× one extra set for muscles below target.	По твоим результатам: заменено упражнений — {a}, {b}× добавлен подход на мышцы, которым не хватало нагрузки.
Aus den Angaben von {n} erstellt: 	Built from {n}'s details: 	План по данным {n}: 
BWS-Öffner an der Wand	Wall T-spine opener	Мобилизация грудного отдела у стены
Bahnen	Lengths	Отрезки
Barcode scannen	Scan barcode	Сканировать код
Bau einen Plan einmal und weise ihn beliebig vielen Athleten zu, jeweils mit eigenem Startdatum. Im Plan-Editor eines Athleten geht das auch über „Als Vorlage speichern“.	Build a plan once and assign it to as many athletes as you like, each with their own start date. You can also do this from an athlete’s plan editor with “Save as template”.	Составь план один раз и назначай его сколько угодно атлетам, каждому со своей датой старта. Это можно сделать и в редакторе плана атлета через «Сохранить как шаблон».
Bedarf = Ø Aufnahme minus Änderung des Trendgewichts × 7.700 kcal/kg, über 14 Tage, langsam geglättet.	Expenditure = avg intake minus change in trend weight × 7,700 kcal/kg, over 14 days, slowly smoothed.	Расход = среднее потребление минус изменение трендового веса × 7 700 ккал/кг. Расчёт за 14 дней со сглаживанием.
Beinbeuger	Hamstrings	Задняя поверхность бедра
Beinbeuger aktiv.	Keep the hamstrings working.	Напряги заднюю поверхность бедра.
Beinbeuger-Brücke	Hamstring bridge	Мост на заднюю поверхность бедра
Belastung = Minuten × Session-RPE (Foster). Monotonie = Mittelwert ÷ Streuung der Tageswerte. Über 2 steigt laut Foster das Risiko für Überlastung.	Load = minutes × session RPE (Foster). Monotony = mean ÷ spread of daily values. Above 2, Foster reports a higher risk of overload.	Нагрузка = длительность в минутах × RPE тренировки (Foster). Монотонность = средняя нагрузка ÷ стандартное отклонение дневной нагрузки. По Foster, при значении выше 2 риск перегрузки растёт.
Belastung, je 7 Tage	Load, per 7 days	Нагрузка по 7-дневным периодам
Bereit	Ready	Можно тренироваться
Bereitschaft aus Schlaf, Ruhepuls, HRV und deinem Gefühl	Readiness from sleep, resting heart rate, HRV and how you feel	Готовность по сну, пульсу покоя, HRV и самочувствию
Bereitschaft {n} von 100, keine Warnzeichen.	Readiness {n} out of 100, no warning signs.	Готовность {n} из 100. Тревожных признаков нет.
Beschreib kurz, was du gegessen hast.	Briefly describe what you ate.	Коротко опиши, что было на тарелке.
Beschwerden	Complaints	Ограничения
Beschwerden & Training	Pain & training	Ограничения и тренировки
Bist du schwanger, stillst du oder planst du gerade eine Schwangerschaft?	Are you pregnant, breastfeeding or planning a pregnancy?	Есть ли сейчас беременность, грудное вскармливание или планы на беременность?
Bluetooth geht hier nicht. In der Android-App oder in Chrome klappt es.	Bluetooth doesn't work here. It works in the Android app or in Chrome.	Здесь Bluetooth недоступен. Открой приложение для Android или зайди через Chrome.
Check-in fällig	Check-in due	Пора на чек-ин
Check-in fällig:	Check-in due:	Пора на чек-ин:
Check-ins und Formchecks deiner Athleten, wer am längsten wartet, steht oben.	Your athletes' check-ins and form checks; whoever has waited longest is at the top.	Чек-ины и проверки техники твоих атлетов; кто ждёт дольше всех — наверху.
Coaching	Coaching	Работа тренера
Crazy-8-Curls	Crazy 8 curls	Сгибания Crazy 8
Crosstrainer	Elliptical	Эллипсоид
Damit läge dein Kalorienziel unter 1.200 kcal am Tag. Darunter nur mit fachlicher Begleitung.	That would put your calorie target below 1,200 kcal a day. Going lower needs professional support.	Цель окажется ниже 1 200 ккал в день. Опускайся ниже только под наблюдением специалиста.
Damit setzt du dein Passwort selbst zurück, falls du es vergisst. Er wird nur dieses eine Mal angezeigt.	Use it to reset your password yourself if you forget it. It is shown only this once.	С этим кодом можно сбросить забытый пароль. Код показывается один раз.
Das ist dein eigenes Training, nicht das eines Athleten.	This is your own training, not an athlete’s.	Это твоя личная тренировка.
Dein Athlet sieht sie täglich auf „Heute“. Schritte, Wasser, Schlaf, Protein und Essen hakt die App selbst ab, wenn Daten da sind.	Your athlete sees them daily on "Today". Steps, water, sleep, protein and food are checked off by the app itself when data is available.	Атлет видит их каждый день на «Сегодня». Шаги, воду, сон, белок и питание приложение отмечает само, если есть данные.
Dein Coach hat Training für dich eingetragen.	Your coach logged training for you.	В плане появилась тренировка от тренера.
Dein Coach hat deinen Plan aktualisiert.	Your coach updated your plan.	В плане есть изменения от тренера.
Dein Essensfenster: {a} bis {b} Uhr. Ein früheres Fenster (Ende bis etwa 17–19 Uhr) ist für viele günstiger als spätes Essen.	Your eating window: {a} to {b}. An earlier window (ending around 5–7 pm) suits many people better than eating late.	Окно питания: с {a} до {b}. Многим подходит более ранний график, когда последний приём пищи приходится примерно на 17:00–19:00.
Dein Kalorienziel steht während der Pause auf Erhaltung, Eiweiß bleibt hoch. Das hilft beim Gesundwerden und schützt die Muskeln.	During the break your calorie target is set to maintenance and protein stays high. That helps you recover and protects your muscle.	Во время паузы цель по калориям — поддержание веса, а белок остаётся высоким. Это может помочь восстановиться и сохранить мышцы.
Dein Kalorienziel steht während der Pause auf Erhaltung. Eiweiß ist auf mindestens 2 g pro kg Körpergewicht angehoben, verteilt auf 4–5 Mahlzeiten. Das bremst den Muskelabbau.	During the break your calorie target is set to maintenance. Protein is raised to at least 2 g per kg of body weight, spread over 4–5 meals. That slows muscle loss.	На паузе цель по калориям — поддержание веса. Цель по белку повышена как минимум до 2 г на кг веса. Распредели белок на 4–5 приёмов пищи, чтобы замедлить потерю мышц.
Dein Plan endet ohne Deload. Eine lockere Übergangswoche mit halben Sätzen baut Ermüdung ab, bevor der nächste Plan startet.	Your plan ends without a deload. An easy transition week with half the sets clears fatigue before the next plan starts.	План заканчивается без делоуда. Чтобы снизить усталость перед следующим планом, проведи лёгкую неделю с половиной обычных подходов.
Dein Trendgewicht liegt bei {v} kg, dein Ziel bei {z} kg. Die App hebt die Kalorien jetzt Woche für Woche bis zu deinem gemessenen Bedarf an (höchstens 300 kcal pro Woche) und hält dein Gewicht danach in einem Bereich von ±1 kg.	Your trend weight is {v} kg and your goal is {z} kg. The app now raises your calories week by week up to your measured needs (at most 300 kcal per week), then keeps your weight within ±1 kg.	Трендовый вес — {v} кг, цель — {z} кг. Приложение будет повышать цель по калориям до уровня измеренного расхода (не больше 300 ккал в неделю), а затем поддерживать вес в пределах ±1 кг.
Dein aktueller Plan wird ersetzt. Dein Verlauf bleibt erhalten, die Wochenzählung beginnt wieder bei Woche 1.	Your current plan will be replaced. Your history stays, the week count restarts at week 1.	Новый план заменит текущий. История сохранится, а отсчёт недель начнётся заново с первой.
Dein alter Code gilt nicht mehr. Der neue wird nur dieses eine Mal angezeigt.	Your old code no longer works. The new one is shown only this once.	Старый код больше не действует. Новый код показывается один раз.
Deine Athleten sehen auf „Heute“, wer sie betreut. Name und Logo stehen auch im Chat.	Your athletes see who coaches them on "Today". Name and logo also appear in the chat.	Твои атлеты видят на «Сегодня», кто их тренер. Имя и логотип есть и в чате.
Deine Athleten sehen ihn unter „Meine Pläne“.	Your athletes see it under “My plans”.	Твои атлеты видят его в разделе «Мои планы».
Deine Beschreibung oder dein Foto wird zur Erkennung an Google (Gemini) geschickt und danach nicht gespeichert, weder von uns noch zum Training von Google-Modellen. Zurück kommen nur die erkannten Lebensmittel mit geschätzten Mengen.	Your description or photo is sent to Google (Gemini) for recognition and is not stored afterwards, neither by us nor to train Google's models. All that comes back is the recognised foods with estimated amounts.	Описание или фото отправляется в Google (Gemini) для распознавания. Мы не сохраняем его, и Google не хранит его для обучения моделей. В ответ приходит только список распознанных продуктов с примерными порциями.
Deine Ergebnisse sprechen für die Stufe „Fortgeschritten“.	Your results say you're ready for “Intermediate”.	По результатам тебе подходит уровень «Продвинутый».
Deine Makros sind gespeichert	Your macros are saved	БЖУ сохранены
Deine Pace: schnelle Abschnitte {i} /km, Erholung locker ab {e} /km.	Your pace: fast sections {i} /km, easy recovery from {e} /km.	Твой темп: быстрые отрезки — {i} /км, лёгкое восстановление — от {e} /км.
Deload	Deload	Делоуд
Deload in Woche	Deload in week	Делоуд на неделе
Deload in Woche {w}	Deload in week {w}	Делоуд на неделе {w}
Deload nur optional	Deload optional only	Делоуд по желанию
Deload spätestens nach	Deload at the latest after	Делоуд не позже чем через
Deload, ohne Zusatzgewicht.	Deload, no added weight.	Делоуд без дополнительного веса.
Deload-Woche: 2 Sätze, 75 s, Kondition halbiert	Deload week: 2 sets, 75 s, conditioning halved	Неделя делоуда: 2 подхода, 75 с, вдвое меньше работы на выносливость
Deload: 25 min locker	Deload: 25 min easy	Делоуд: 25 мин легко
Deload: 3 × 10 leicht.	Deload: 3 × 10 light.	Делоуд: 3 × 10 с лёгким весом.
Deload: 30 min locker	Deload: 30 min easy	Делоуд: 30 мин легко
Deload: 3×10.	Deload: 3×10.	Делоуд: 3×10.
Deload: 5 @ 40 %, 50 %, 60 % TM.	Deload: 5 @ 40%, 50%, 60% TM.	Делоуд: 5 @ 40 %, 50 %, 60 % TM.
Deload: Pause oder 1 Satz @ RPE 6–7	Deload: rest or 1 set @ RPE 6–7	Делоуд: отдых или 1 подход @ RPE 6–7
Deload: locker, Technik.	Deload: easy, focus on technique.	Делоуд: легко, упор на технику.
Deload: locker.	Deload: easy.	Делоуд: лёгкая нагрузка.
Deload: −30 % Umfang, keine harten Teile	Deload: −30% volume, no hard sessions	Делоуд: −30 % объёма, без тяжёлых отрезков
Der Code erstellt ein Coach-Konto. Der Coach kann danach selbst Athleten einladen.	The code creates a coach account. The coach can then invite athletes.	Код создаёт аккаунт тренера. Затем тренер сам сможет приглашать атлетов.
Der neue Plan ersetzt den aktuellen Plan des Athleten und beginnt am gewählten Tag mit Woche 1. Bisherige Einheiten bleiben im Verlauf.	The new plan replaces the athlete’s current plan and starts with week 1 on the chosen day. Past sessions stay in their history.	Новый план заменит текущий план атлета и начнётся с 1-й недели в выбранный день. Прошлые тренировки останутся в истории.
Die App verschiebt nichts. Offene Einheiten bleiben stehen, du siehst sie im Team-Überblick und planst selbst um.	The app moves nothing. Open sessions stay where they are, you see them in the team overview and reschedule them yourself.	Приложение оставит незавершённые тренировки на месте. Их можно перенести в обзоре команды.
Die App verschiebt wie gewohnt, du siehst im Team-Überblick, was verschoben wurde.	The app reschedules as usual, and the team overview shows you what was moved.	Приложение перенесёт тренировки как обычно. Какие именно, видно в обзоре команды.
Die Apple Watch läuft nur mit dem iPhone. Ihre Daten kommen mit der iOS-App über Apple Health. Bis dahin: Trainings in der App aufzeichnen oder nachtragen.	The Apple Watch only works with the iPhone. Its data will come via Apple Health with the iOS app. Until then: record or log workouts in the app.	Apple Watch работает только с iPhone. Данные с часов будут доступны через Apple Health в приложении для iOS. Пока можно записывать тренировки в приложении или добавлять их вручную.
Die Begründung wird gespeichert und den Betroffenen angezeigt.	The reason is saved and shown to those affected.	Обоснование сохраняется. Его увидят пользователи, которых касается решение.
Die Gewichtung ist eine Setzung der App, keine Studienlage (Grad D). Nach schwerem Krafttraining hinkt die Erholung der Muskeln der HRV hinterher, dann zählt dein Gefühl besonders.	The weighting is the app’s own choice, not research (grade D). After heavy strength training your muscles recover more slowly than your HRV, so your own feel counts most then.	Приложение задаёт эти доли само, без опоры на исследования (уровень D). После тяжёлой силовой мышцы восстанавливаются медленнее, чем HRV возвращается к обычному уровню. В такие дни ориентируйся прежде всего на самочувствие.
Die andere Variante wird überschrieben. Im Zweifel vorher unter Einstellungen eine Sicherung exportieren.	The other version will be overwritten. If unsure, export a backup in Settings first.	Другую версию заменит эта. Если сомневаешься, сначала экспортируй резервную копию в настройках.
Die direkte Verbindung läuft über Health Connect und funktioniert nur in der Android-App. Im Browser kannst du deinen Zepp-Datenexport importieren.	The direct connection runs through Health Connect and only works in the Android app. In the browser you can import your Zepp data export.	Прямое подключение через Health Connect доступно в приложении для Android. В браузере можно загрузить файл с данными из Zepp.
Diese Woche keine gemeinsamen Trainings. Planen kannst du sie in der Athletenansicht.	No joint sessions this week. You can plan them from an athlete’s page.	На этой неделе совместных тренировок нет. Запланировать их можно на странице атлета.
Dieser Coach hat noch Athleten. Erst die Athleten einem anderen Coach zuweisen.	This coach still has athletes. Assign them to another coach first.	У этого тренера ещё есть атлеты. Сначала назначь их другому тренеру.
Diätpause	Diet break	Пауза в диете
Drei Krafttage mit Prozentwellen und drei Muskeltage mit fester Pausen- und Tempovorgabe – stärker und größer in 13 Wochen.	Three strength days with percentage waves and three muscle days with set rest and tempo – stronger and bigger in 13 weeks.	Три дня на силу с волнами нагрузки в процентах и три дня на рост мышц с заданным отдыхом и темпом. План на 13 недель для силы и массы.
Drei Wellen à 3 Wochen: Woche 1 leicht, Woche 2 mittel, Woche 3 hart. Grundübungen steigen innerhalb der Welle um je 1 Wdh. oder 1 Satz, zur nächsten Welle um 2,5 % 1RM; Zubehör wird über RPE gesteuert und pro Welle teilweise getauscht.	Three 3-week waves: week 1 light, week 2 medium, week 3 hard. Main lifts go up by 1 rep or 1 set within a wave and by 2.5% 1RM to the next wave; accessories are RPE-based and partly swapped each wave.	Три волны по 3 недели: лёгкая, средняя и тяжёлая. В каждой волне добавляй в базовых упражнениях по 1 повторению или подходу. В следующей волне увеличь вес на 2,5 % от 1ПМ. Вспомогательные упражнения выполняй по RPE и частично меняй с каждой волной.
Drei kurze Blöcke pro Woche mit wechselnder Belastung (schwer, mittel, leicht). Wdh. bzw. Haltezeit steigen bis zum Limit, dann das Gewicht; das Wochenvolumen steigt alle 2 Wochen von 20 auf 26 Sätze, danach eine Deload-Woche.	Three short blocks per week with varying load (heavy, medium, light). Reps or hold time go up to the limit, then the weight; weekly volume rises every 2 weeks from 20 to 26 sets, followed by a deload week.	Три коротких блока в неделю с разной нагрузкой: тяжёлой, средней и лёгкой. Сначала прибавляй повторения или время удержания до верхней границы, затем повышай вес. Объём растёт каждые 2 недели с 20 до 26 подходов в неделю, затем идёт неделя делоуда.
Du hast diesen Plan schon gemeldet. Die Prüfung läuft.	You've already reported this plan. The review is in progress.	Твоя жалоба на этот план уже на рассмотрении.
Du hast schon 2 Pläne veröffentlicht.	You've already published 2 plans.	У тебя уже 2 опубликованных плана.
Echter Kalorienbedarf aus Gewicht und Essen	Your real calorie needs from weight and food	Реальный расход калорий по весу и питанию
Eigene	Custom	Свой
Eigene Fragen, die dein Athlet einmal pro Woche beantwortet. Die Antworten siehst du in seiner Ansicht und im Team-Überblick.	Custom questions your athlete answers once a week. You'll see the answers in their view and in the team overview.	Свои вопросы, на которые атлет отвечает раз в неделю. Ответы ты увидишь в карточке атлета и в обзоре команды.
Eigenes Demo-Video für deine Athleten	Your own demo video for your athletes	Своё демо-видео для твоих атлетов
Ein Deload senkt Volumen und Intensität für etwa eine Woche, um Ermüdung abzubauen. Fällt die Leistung bei hoher Ermüdung, wird er vorgezogen.	A deload lowers volume and intensity for about a week to shed fatigue. If performance drops with high fatigue, it is brought forward.	Делоуд — это примерно неделя с меньшим объёмом и интенсивностью, чтобы снизить усталость. Если на фоне сильной усталости падают результаты, начни делоуд раньше.
Einbeinige Hüftstreckung (GHD)	Single-leg hip extension (GHD)	Разгибание в тазобедренном суставе на одной ноге (GHD)
Einbeiniger Hip Thrust	Single-leg hip thrust	Hip Thrust на одной ноге
Eingaben gelten für normale Wochen. In Deload- und Testwochen halbiert die App Sätze und senkt die RPE automatisch. Hauptübungen aus der Hybridblock-Vorlage sind über die Phasen periodisiert.	Values apply to normal weeks. In deload and test weeks the app halves sets and lowers RPE automatically. Main lifts from the Hybridblock template are periodised across phases.	Значения действуют для обычных недель. В недели делоуда и тестов приложение само сокращает число подходов вдвое и снижает RPE. Нагрузка в основных упражнениях шаблона Hybridblock меняется по фазам.
Eingeschaltet blendet der Wochen-Check-in Vorschläge mit Grad C oder D aus.	When on, the weekly check-in hides suggestions graded C or D.	При включении недельный чек-ин скрывает рекомендации с уровнем C или D.
Einheiten pro Woche · 12 Wochen mit Deload in Woche 4 und 8	sessions per week · 12 weeks with deloads in weeks 4 and 8	трен. в неделю · 12 недель с делоудом на 4-й и 8-й неделе
Einträge. Alle Quellen wurden gegen Crossref und PubMed geprüft. Allgemeine Information, kein Ersatz für ärztlichen Rat und keine Einschätzung deines Einzelfalls.	entries. All sources checked against Crossref and PubMed. General information, no substitute for medical advice and no assessment of your individual case.	записей. Все источники проверены по Crossref и PubMed. Это общая информация. За советом по своей ситуации обращайся к врачу.
Einverstanden	I agree	Принимаю
Entwurf: Athlet sieht diese Einheit erst nach Freigabe	Draft: the athlete only sees this session once you release it	Черновик: атлет увидит эту тренировку только после публикации
Er beantwortet Fragen zu Ziel, Erfahrung, Tagen und Beschwerden. Du bekommst eine Benachrichtigung und erstellst den Plan.	They answer questions on goal, experience, days and complaints. You get a notification and create the plan.	Атлет отвечает на вопросы о цели, опыте, днях тренировок и ограничениях. Ты получаешь уведомление и составляешь план.
Er entscheidet selbst: fertigen Plan wählen, Plan aus seinen Angaben erstellen lassen, selbst planen oder ohne festen Plan trainieren.	They decide: pick a ready plan, have one created from their details, plan themselves or train without a fixed plan.	Атлет решает, как тренироваться: выбрать готовый план, получить план по своим данным, составить его вручную или тренироваться без плана.
Erklärt unter „Warum diese Zahl?“ bei Bedarf und Kalorien	Explained under “Why this number?” for needs and calories	Подробнее в «Почему это число?» рядом с расходом и калориями
Ernährungsziele und die Nachricht an den Athleten werden nicht mitgespeichert.	Nutrition targets and the message to the athlete aren’t saved with it.	Цели по питанию и сообщение атлету не сохраняются.
Erst die Angaben für {n} eintragen.	Enter the details for {n} first.	Сначала укажи данные для {n}.
Etwa {v} harte Sätze pro Woche. Belegt sind mindestens {lo}.	About {v} hard sets per week. The evidence supports at least {lo}.	Около {v} тяжёлых подходов в неделю. По данным исследований, ориентир — минимум {lo}.
Explosive Hüftstreckung, Rücken neutral.	Explosive hip extension, neutral back.	Резко разогни бёдра. Держи спину нейтрально.
Fester Deload	Fixed deload	Делоуд по графику
Fester Deload alle 4 Wochen evtl. zu häufig	Fixed deload every 4 weeks may be too frequent	Делоуд каждые 4 недели может быть слишком частым
Fett ist am Minimum ({g} g, 20 % der Kalorien). Weniger empfiehlt die Wissensbank nicht.	Fat is at the minimum ({g} g, 20% of calories). The knowledge base doesn't recommend going lower.	Жиры на минимуме ({g} г, 20 % калорий). По данным базы знаний, ниже опускаться не стоит.
Freiwillig: Trag an Tagen mit Periode deine Beschwerden ein. Bei starken Beschwerden schlägt die App leichteres Training oder Ersatz vor, sonst trainierst du ganz normal.	Optional: on period days, log your symptoms. With strong symptoms the app suggests lighter training or an alternative; otherwise you train as usual.	Если хочешь, отмечай, как себя чувствуешь в дни менструации. При сильном дискомфорте приложение предложит облегчить тренировку или заменить упражнения. В остальном тренируйся как обычно.
Frontkniebeuge, Hip Thrust, Abduktion, Waden	Front squat, hip thrust, abduction, calves	Фронтальный присед, Hip Thrust, отведения, икры
Fünf Übungen, jeden Tag leicht, nie bis ans Limit. Für Sportler neben ihrem Sport.	Five exercises, light every day, never to the limit. For athletes alongside their sport.	Пять упражнений ежедневно с лёгкой нагрузкой и запасом. Для тех, кто совмещает силовые со своим видом спорта.
Für Ausdauersportler*innen mit Grundlage, die in rund sechs Monaten ihre erste Langdistanz finishen wollen und bis zu 13 Stunden pro Woche Zeit haben.	For endurance athletes with a base who want to finish their first long-distance triathlon in about six months and have up to 13 hours a week.	Для атлетов с базовой выносливостью, которые хотят примерно за полгода финишировать на первой длинной дистанции и могут тренироваться до 13 часов в неделю.
Für Fitness-Sportler*innen, die definierter werden und gleichzeitig ihre Kondition verbessern wollen.	For fitness athletes who want to get leaner and improve their conditioning at the same time.	Для тех, кто хочет стать рельефнее и заодно подтянуть выносливость.
Für Leute mit Krafterfahrung, die gleichzeitig abnehmen, VO₂max steigern und Kraft halten wollen.	For people with strength experience who want to lose weight, raise VO₂max and keep strength at the same time.	Для тех, кто уже занимается силовыми и хочет одновременно снизить вес, повысить VO₂max и сохранить силу.
Für Sportler (z. B. Fußball), die neben Training und Spielen stärker werden wollen, ohne müde zu sein.	For athletes (e.g. football) who want to get stronger alongside training and matches without feeling tired.	Для тех, кто хочет стать сильнее и сохранить свежесть для своего спорта, например для футбольных тренировок и матчей.
Für Sportler*innen, die Schnelligkeit, Sprungkraft und Maximalkraft gleichzeitig verbessern wollen, z. B. in der Saisonvorbereitung.	For athletes who want to improve speed, jumping power and max strength at the same time, e.g. in pre-season.	Для тех, кто хочет одновременно развить скорость, прыгучесть и максимальную силу, например в предсезонке.
Für alle, die ihre VO₂max gezielt steigern wollen. Mit Krafterhalt-Einheit auch für Hybrid-Athleten.	For anyone who wants to specifically raise their VO₂max. With a strength maintenance session, also for hybrid athletes.	Для всех, кто хочет повысить VO₂max. Есть силовая тренировка для поддержания силы, так что план подойдёт и гибридным атлетам.
Für alle, die mit Kaloriendefizit Körperfett verlieren, Kondition aufbauen und dabei Muskeln erhalten wollen.	For anyone who wants to lose body fat in a calorie deficit, build conditioning and keep their muscle.	Для тех, кто хочет снизить процент жира на дефиците калорий, подтянуть выносливость и сохранить мышцы.
Für einen Athleten gehst du über Team → Athlet → „Aus Bibliothek“.	For an athlete, go to Team → athlete → “From library”.	Для атлета: Команда → атлет → «Из библиотеки».
Für welchen Athleten?	For which athlete?	Для какого атлета?
Für {n}	For {n}	Для {n}
Für {n} empfohlen	Recommended for {n}	Рекомендуем для {n}
Ganzkörper 3× pro Woche mit Hip Thrust oder Glute Bridge in jeder Einheit. Einfacher Einstieg mit doppelter Progression.	Full body 3× a week with a hip thrust or glute bridge in every session. Easy start with double progression.	Три тренировки на всё тело в неделю. На каждой — Hip Thrust или ягодичный мост с пола. Простой старт с двойной прогрессией.
Garmin gibt Schlaf, Puls, Schritte, Gewicht und Trainings weiter, aber kein VO₂max und keinen HRV-Status.	Garmin shares sleep, heart rate, steps, weight and workouts, but no VO₂max and no HRV status.	Garmin передаёт данные о сне, пульсе, шагах, весе и тренировках. VO₂max и статус HRV не передаются.
Geht einzeln an {n} Athleten, jeder sieht nur seinen eigenen Chat. {name} wird durch den Vornamen ersetzt.	Sent individually to {n} athletes; each one only sees their own chat. {name} is replaced with the first name.	Уйдёт каждому отдельно (атлетов: {n}), каждый видит только свой чат. {name} заменится на имя.
Gemeinsames Training. Was du einträgst, landet im Verlauf deines Athleten.	Joint session. What you log goes into your athlete’s history.	Совместная тренировка. Всё, что ты внесёшь, попадёт в историю атлета.
Gepolsterte Bank, oft verstellbar (flach, schräg, aufrecht). Für Bankdrücken, Kurzhantelübungen, Rudern einarmig und Hip Thrusts.	A padded bench, often adjustable (flat, incline, upright). For bench press, dumbbell work, one-arm rows and hip thrusts.	Скамья с мягкой обивкой, часто с регулировкой спинки: горизонтально, под наклоном и вертикально. Подходит для жимов, упражнений с гантелями, тяги одной рукой и Hip Thrust.
Gewicht eintragen, Kalorien und Makros auf einen Blick	Log your weight, see calories and macros at a glance	Записывай вес и сразу смотри калории и БЖУ
Gewichte als Startgewichte beim Athleten verbuchen	Log the weights as the athlete’s starting weights	Записать веса как стартовые веса атлета
Gewichtet aus Schlaf gegen deinen Bedarf (30 %), Ruhepuls gegen deine Basis (25 %), HRV gegen dein 7-Tage-Mittel (20 %) und deinem Gefühl (25 %). Fehlt ein Wert, zählen die anderen anteilig.	Weighted from sleep vs. your need (30%), resting HR vs. your baseline (25%), HRV vs. your 7-day average (20%) and how you feel (25%). If a value is missing, the others count proportionally.	Готовность считается по сну относительно твоей нормы (30 %), пульсу в покое относительно обычного (25 %), HRV относительно среднего за 7 дней (20 %) и самочувствию (25 %). Если данных не хватает, доли остальных показателей пересчитываются пропорционально.
Gewohnheit bei {n} Athleten hinzugefügt	Habit added for {n} athletes	Привычка добавлена атлетам: {n}
Gilt nur für diese Planauswahl. Die Angaben und Geräte des Athleten bleiben unverändert.	Only applies to this plan selection. The athlete's details and equipment stay unchanged.	Действует только для этого выбора плана. Данные и оборудование атлета не меняются.
Gilt täglich. Wochentage kannst du danach im Plan des Athleten ändern.	Applies daily. You can change the weekdays later in the athlete's plan.	Действует ежедневно. Дни недели можно потом поменять в плане атлета.
Gleichmäßiger Konditionsblock	Steady conditioning block	Ровная работа на выносливость
HRV	HRV	HRV
HRV als	HRV as	HRV как
HRV-Anteil der Bereitschaft	HRV part of readiness	Доля HRV в готовности
Hamstrings	Hamstrings	Задняя поверхность бедра
Hang Power Clean	Hang power clean	Взятие на грудь с виса в полуприсед
Hast du in den letzten 12 Monaten wegen Schwindel das Gleichgewicht oder das Bewusstsein verloren?	In the past 12 months, have you lost your balance or consciousness because of dizziness?	Были ли у тебя за последние 12 месяцев случаи потери равновесия или сознания из-за головокружения?
Hat die Makros selbst angepasst (gleiches Kalorienziel). Neue Vorgabe im Plan setzt sie zurück.	Adjusted their macros themselves (same calorie target). A new target in the plan resets them.	БЖУ настроено вручную в аккаунте атлета, цель по калориям прежняя. Новые настройки из плана заменят ручные.
Hip Thrust	Hip thrust	Hip Thrust
Hip Thrust (Kurzhantel)	Hip thrust (dumbbell)	Hip Thrust с гантелью
Hip Thrust Machine, Glute Drive	Hip thrust machine, glute drive	Тренажёр для Hip Thrust
Hip Thrust leicht, Beinpresse, Klimmzug	Light hip thrust, leg press, pull-up	Лёгкий Hip Thrust, жим ногами, подтягивания
Hip Thrust schwer, Kniebeuge, Latzug	Heavy hip thrust, squat, pulldown	Тяжёлый Hip Thrust, присед, тяга верхнего блока
Hip Thrust und Kniebeuge bauen den Po ähnlich stark auf, die Kniebeuge zusätzlich die Oberschenkel	Hip thrusts and squats build the glutes similarly; squats also build the thighs	Hip Thrust и присед примерно одинаково развивают ягодицы. Присед дополнительно нагружает бёдра.
Hip Thrust und Kniebeuge zusammen treffen Po und Oberschenkel	Hip thrusts and squats together hit glutes and thighs	Hip Thrust и присед вместе нагружают ягодицы и бёдра.
Hip Thrust, Box Squat, Rudern	Hip thrust, box squat, row	Hip Thrust, присед на ящик, тяга
Hip Thrust, Kniebeuge, Swing	Hip thrust, squat, swing	Hip Thrust, присед, махи
Hochgeladene Videos werden ohne Ton und verkleinert gespeichert und sind nur für deine Athleten sichtbar.	Uploaded videos are stored without sound and compressed, and are only visible to your athletes.	Загруженные видео сохраняются без звука и в уменьшенном размере и видны только твоим атлетам.
Hoher Reiz (Schwelle / VO₂max)	High stimulus (threshold / VO₂max)	Высокая нагрузка (порог / VO₂max)
Huawei Health schreibt nicht selbst in Health Connect. Die App „Health Sync“ überträgt die Daten.	Huawei Health doesn't write to Health Connect itself. The “Health Sync” app transfers the data.	Huawei Health не передаёт данные напрямую в Health Connect. Для переноса используется приложение «Health Sync».
Hybridblock verarbeitet Gesundheitsdaten: Puls, Schlaf, Gewicht, Trainings, Beschwerden und, wenn du aufzeichnest, deine GPS-Strecke. Dafür brauchen wir deine ausdrückliche Einwilligung.	Hybridblock processes health data: heart rate, sleep, weight, workouts, complaints and, when you record, your GPS route. For this we need your explicit consent.	Hybridblock обрабатывает данные о здоровье: пульс, сон, вес, тренировки, ограничения и GPS-маршрут, если включена запись. Для этого нужно твоё явное согласие.
Hybridblock verarbeitet Gesundheitsdaten: Puls, Schlaf, Gewicht, Trainings, Einschränkungen und, wenn du aufzeichnest, deine GPS-Strecke. Dafür brauchen wir deine ausdrückliche Einwilligung.	Hybridblock processes health data: heart rate, sleep, weight, workouts, limitations and, if you record, your GPS route. For this we need your explicit consent.	Hybridblock обрабатывает данные о здоровье: пульс, сон, вес, тренировки, ограничения и GPS-маршрут, если включена запись. Для этого нужно твоё явное согласие.
Höhere Sätze zählen nicht für e1RM, Verlauf und PRs	Sets with more reps don’t count for e1RM, history and PRs	Подходы с большим числом повторений не учитываются в e1RM, истории и рекордах
Ich habe das ärztlich abgeklärt.	I've discussed this with my doctor.	Это уже обсуждалось с врачом.
Ich willige ein	I consent	Даю согласие
Ihr Fortschritt und die Planwoche bleiben erhalten. Was du bei einzelnen Athleten angepasst hast, wird dabei überschrieben.	Their progress and plan week stay as they are. Anything you adjusted for individual athletes will be overwritten.	Прогресс атлетов и текущая неделя плана сохранятся. Индивидуальные правки для отдельных атлетов будут перезаписаны.
In Open Food Facts nichts gefunden. Anders formulieren, Barcode scannen oder unter „Neu“ selbst anlegen.	Nothing found in Open Food Facts. Rephrase, scan the barcode or create it under “New”.	В Open Food Facts ничего не найдено. Измени запрос, отсканируй штрихкод или добавь продукт вручную через «Новый».
In den Dateien wurden keine bekannten Zepp-Daten gefunden.	No known Zepp data found in the files.	В файлах не нашлось данных Zepp в поддерживаемом формате.
In der App deiner Athleten anzeigen	Show in your athletes' app	Показывать в приложении твоих атлетов
In der Athletenansicht kannst du deinen eigenen Plan nicht ändern.	You can’t change your own plan while viewing an athlete.	В режиме просмотра атлета нельзя менять свой план.
In der Studie stieg die VO₂max mit 4×4 um 7 % mehr als mit Dauerlauf bei gleicher Arbeit	In the study VO₂max rose 7% more with 4×4 than with steady running at equal work	В исследовании прирост VO₂max после интервалов 4×4 был на 7 % больше, чем после равномерного бега при одинаковом объёме работы.
Ins Konto des Athleten übertragen	Send to the athlete’s account	Передать в аккаунт атлета
Intensität: nur locker (unter 70 % HFmax), 15–30 Minuten, nach jeder Stufe 24 Stunden beobachten.	Intensity: easy only (below 70% HRmax), 15–30 minutes; watch for 24 hours after each step.	Только лёгкая нагрузка (ниже 70 % ЧССмакс), 15–30 мин. После каждого шага следи за самочувствием 24 ч.
Intervalle nach Phase: 4×3 min, dann 4×4 min, Deload als Z2, am Ende 2000-m-Test.	Intervals by phase: 4×3 min, then 4×4 min, deload as Z2, 2000 m test at the end.	Интервалы по фазам: 4×3 мин, затем 4×4 мин. На делоуде — Z2, в конце — тест на 2 000 м.
Jede Woche schneller. Im Wechsel: 3000 m am Stück.	Faster every week. Alternating: 3000 m non-stop.	Каждую неделю быстрее. В чередующихся тренировках — 3 000 м без остановки.
Kalorien schrittweise auf den gemessenen Bedarf, Gewicht in ±1 kg halten	Raise calories step by step to your measured needs, keep weight within ±1 kg	Постепенно поднять калории до измеренного расхода и удерживать вес в пределах ±1 кг
Kalorienbedarf aus echten Daten ab	Calorie needs from real data after	Расход калорий по реальным данным через
Kalorienverbrauch durch Training ist klein gegenüber der Ernährung	Calories burned in training are small compared with nutrition	На тренировках можно потратить сравнительно мало калорий относительно того, сколько поступает с едой.
Kalorienziel nie unter die Mindest-Energie fallen lassen	Never let the calorie target drop below the minimum energy	Не опускать цель по калориям ниже минимума
Kalorienziel {k} kcal bleibt. Es kommt aus deinem Check-in bzw. von deinem Coach.	Your calorie target of {k} kcal stays the same. It comes from your check-in or your coach.	Цель по калориям остаётся на уровне {k} ккал. Её задаёт чек-ин или тренер.
Kein Deload bei 6 Tagen	No deload despite 6 days	6 дней тренировок без делоуда
Kein Deload innerhalb der 8 Wochen, im Defizit riskant	No deload within the 8 weeks, risky in a deficit	Нет делоуда за 8 недель, в дефиците рискованно
Keine Beschwerden angegeben.	No complaints given.	Ограничения не указаны.
Keine Beschwerden markiert.	No complaints marked.	Ограничения не отмечены.
Keine Deload-Wochen	No deload weeks	Нет недель делоуда
Keine offenen Meldungen.	No open reports.	Жалоб на рассмотрении нет.
Klare Blockperiodisierung mit Deload und Zuspitzung	Clear block periodisation with deload and peaking	Чёткая блочная периодизация с делоудом и подводкой
Kniebeuge, Hamstrings, Waden	Squat, hamstrings, calves	Присед, задняя поверхность бедра, икры
Kniedominante Übungen etwa {a}, hüftdominante etwa {b} harte Sätze pro Woche.	Knee-dominant moves about {a}, hip-dominant about {b} hard sets per week.	Около {a} тяжёлых подходов в неделю в упражнениях с упором на колени и около {b} — с упором на тазобедренные суставы.
Kombi-Cardio 15, Z5 13 × 20 s; Hip Thrust 3 × 10 dazu	Combo cardio 15, Z5 13 × 20 s; plus hip thrust 3 × 10	Комбо-кардио 15, Z5 13 × 20 с. Добавь Hip Thrust 3 × 10
Kommen von dir, mit deinem Namen, als normale Chat-Nachricht mit Push. Die App prüft einmal am Tag gegen 8 Uhr. {name} wird durch den Vornamen des Athleten ersetzt.	They come from you, with your name, as a normal chat message with push. The app checks once a day around 8 am. {name} is replaced with the athlete's first name.	Приходят от тебя, с твоим именем, как обычное сообщение в чате с пушем. Приложение проверяет раз в день около 8 утра. {name} заменяется на имя атлета.
Kommentar (wird an der aktuellen Videostelle gespeichert)	Comment (saved at the current point in the video)	Комментарий (с привязкой к текущему моменту видео)
Kompakte Planung zurückgenommen	Compact plan undone	Сокращённый режим планирования отключён
Kondition sauber nach dem Krafttraining	Conditioning placed cleanly after strength work	Работа на выносливость после силовой
Konditionsblock: Ablauf steht im Hinweis. Trag die Zeit oder Runden als Wiederholungen ein.	Conditioning block: the sequence is in the note. Log the time or rounds as reps.	Порядок работы на выносливость указан в подсказке. Время или число кругов запиши в поле повторений.
Konditionsleiter	Conditioning ladder	Лесенка на выносливость
Kraft (bestes e1RM)	Strength (best e1RM)	Сила (лучший e1RM)
Kraft mit Autoregulation, Cardio nach Puls und Ernährung mit adaptivem Kalorienbedarf.	Strength with autoregulation, cardio by heart rate and nutrition with adaptive calorie needs.	Силовые с авторегуляцией, кардио по пульсу и питание с учётом расхода калорий.
Kreuzheben, Frontkniebeuge, Beinbeuger, Rumpf	Deadlift, front squat, hamstrings, core	Становая тяга, фронтальный присед, сгибания ног, кор
Kreuzheben, Frontkniebeuge, Po, Beinbeuger	Deadlift, front squat, glutes, hamstrings	Становая тяга, фронтальный присед, ягодицы, сгибания ног
Krämpfe / Beschwerden	Cramps / symptoms	Спазмы / дискомфорт
Kugel mit Griff. Für Swings, Goblet Squats, Carries und Türkisches Aufstehen.	A ball with a handle. For swings, goblet squats, carries and Turkish get-ups.	Гиря с ручкой. Для махов, гоблет-приседаний, переносок и турецкого подъёма.
Langsame Sätze, dann schnelle Kondition.	Slow sets, then fast conditioning.	Медленные подходы, затем интенсивная работа на выносливость.
Langsame Tempo-Supersets für Muskelaufbau, danach kurze Konditionsblöcke – Körperform und Fitness in einem Plan.	Slow tempo supersets for muscle, then short conditioning blocks – physique and fitness in one plan.	Медленные суперсеты для роста мышц, затем короткие блоки на выносливость. Один план для фигуры и физической формы.
Lass einen Maximaltest weg, wenn du gerade erst mit dem Laufen anfängst, Herz-, Kreislauf- oder Stoffwechselerkrankungen hast, Medikamente für Herz oder Blutdruck nimmst, schwanger bist oder bei Belastung schon einmal Brustschmerz, Schwindel oder Atemnot hattest. Dann zuerst ärztlich abklären. Alternative ohne Maximaltest: 20–30 Minuten so laufen, dass du noch in ganzen Sätzen sprechen kannst, und das als lockeres Tempo nutzen.	Skip a maximal test if you're just starting to run, have heart, circulatory or metabolic conditions, take heart or blood pressure medication, are pregnant, or have ever had chest pain, dizziness or shortness of breath during exercise. In that case, see a doctor first. Alternative without a maximal test: run 20–30 minutes at a pace where you can still speak in full sentences and use that as your easy pace.	Отложи максимальный тест, если только начинаешь бегать, при сердечно-сосудистых или обменных заболеваниях, приёме препаратов для сердца или давления, беременности или если при нагрузке уже возникали боль в груди, головокружение или одышка. Сначала обсуди тест с врачом. Без максимального теста можно выбрать лёгкий темп: беги 20–30 мин в таком темпе, чтобы получалось говорить целыми предложениями.
Last dieser Woche geteilt durch den 4-Wochen-Schnitt. Nur ein grober Hinweis: Der Wert sagt Verletzungen kaum voraus und ist methodisch umstritten. Die App stützt keine Warnung allein darauf.	This week’s load divided by the 4-week average. Only a rough hint: the value barely predicts injuries and is methodologically disputed. The app never bases a warning on it alone.	Нагрузка этой недели, делённая на среднее за 4 недели. Это грубый ориентир со спорной методикой, который почти не предсказывает травмы. Приложение учитывает и другие данные, прежде чем показать предупреждение.
Leg Curl sitzend statt liegend (Maeo 2021), Curls mit gestrecktem Arm, Teilwiederholungen in der Dehnung bei den Waden (Kassiano 2023).	Seated instead of lying leg curls (Maeo 2021), curls with an extended arm, lengthened partials for calves (Kassiano 2023).	Сгибания ног сидя вместо варианта лёжа (Maeo 2021), сгибания рук из положения с выпрямленным локтем и частичные повторения в растянутой позиции для икр (Kassiano 2023).
Lädt hoch …	Uploading …	Видео загружается…
Makro-Aufteilung	Macro split	Распределение БЖУ
Makros anpassen	Adjust macros	Изменить БЖУ
Makros einstellen	Set macros	Настроить БЖУ
Makros im Plan gesetzt. Speichern nicht vergessen.	Macros set in the plan. Don't forget to save.	БЖУ заданы в плане. Не забудь сохранить.
Mehr oder weniger Sätze, Deload vorziehen	More or fewer sets, bring a deload forward	Скорректировать число подходов или начать делоуд раньше
Meldungen gehen an unser Prüfteam. Der Ersteller erfährt nicht, wer gemeldet hat. Du siehst die Entscheidung unter „Meine Pläne“.	Reports go to our review team. The creator won't learn who reported. You'll see the decision under “My plans”.	Жалобу рассмотрит наша команда. Имя отправителя скрыто от автора плана. Решение появится в разделе «Мои планы».
Mindestens 5 strikte Klimmzüge, sichere Technik in Kreuzheben-Varianten und Bankdrücken, Grundkondition für 15–20 min Intervalle.	At least 5 strict pull-ups, solid technique in deadlift variations and bench press, base fitness for 15–20 min intervals.	Минимум 5 строгих подтягиваний, уверенная техника в вариантах становой тяги и жиме лёжа, выносливость для 15–20 мин интервальной работы.
Mo, Mi, Fr Grundübungen nach Prozentwellen (Volumen – mittel – schwer mit AMRAP), Di, Do, Sa Muskelarbeit mit kurzen Pausen und kontrolliertem Tempo. Drei 4-Wochen-Wellen mit steigender Last, Woche 4 und 8 als Wechselwochen, Woche 13 Formtest.	Mon, Wed, Fri main lifts in percentage waves (volume – medium – heavy with AMRAP), Tue, Thu, Sat muscle work with short rests and controlled tempo. Three 4-week waves with rising load, weeks 4 and 8 as switch weeks, week 13 form test.	Пн, ср, пт — базовые упражнения с волнами нагрузки в процентах: объём, средняя нагрузка, тяжёлая с AMRAP. Вт, чт, сб — работа на рост мышц с коротким отдыхом и контролем темпа. Три 4-недельные волны с ростом нагрузки. Недели 4 и 8 переходные, неделя 13 — тест формы.
Modul hinzugefügt: 	Module added:	Модуль добавлен: 
Nachricht von deinem Athleten	Message from your athlete	Сообщение от атлета
Nachrichten mit deinen Athleten	Messages with your athletes	Сообщения со атлетами
Neue Bestform erkannt: VDOT {v}. In den Einstellungen kannst du deine Laufzonen aktualisieren.	New best form detected: VDOT {v}. You can update your running zones in Settings.	Новый лучший результат: VDOT {v}. Уточни беговые зоны в настройках.
Neue Bestform: {km} km in {t} am {d}.	New best form: {km} km in {t} on {d}.	Новый рекорд: {km} км за {t}, {d}.
Neue Übungen (Schlitten, Swing + Box Jump, Schrägbank, Hip Thrust); 10 × 20 s Z5, 3 × 30 min Z2, Kombi-Cardio 10 Runden	New exercises (sled, swing + box jump, incline bench, hip thrust); 10 × 20 s Z5, 3 × 30 min Z2, combo cardio 10 rounds	Новые упражнения (сани, махи гирей + прыжок на тумбу, наклонный жим, Hip Thrust). В Z5 — 10 × 20 с, в Z2 — 3 × 30 мин. Комбо-кардио — 10 кругов.
Neuer PR: e1RM	New PR: e1RM	Новый рекорд: e1RM
Neuer PR: e1RM 	New PR: e1RM 	Новый рекорд: e1RM 
Nicht einverstanden	I don't agree	Не принимаю
Noch keine Athleten im Team.	No athletes in your team yet.	В команде пока нет атлетов.
Notiz, z. B. Sitz auf Stufe 4	Note, e.g. seat at level 4	Заметка, например «сиденье на отметке 4»
Nur Hinweis im Wochen-Check-in, keine Warnung	Only a note in the weekly check-in, no warning	Только подсказка в недельном чек-ине, без предупреждения
Nur für dich sichtbar, dein Athlet sieht sie nie.	Only visible to you, your athlete never sees them.	Видны только тебе, атлет их никогда не увидит.
Nur meine Athleten	Only my athletes	Только мои атлеты
Ohne Kalorien kann die App deinen Bedarf nicht aus echten Daten berechnen. Der Check-in schaut dann nur auf Gewichtstrend und Protein, das Kalorienziel bleibt beim Startwert.	Without calories, the app can’t work out your needs from real data. Check-ins then only look at your weight trend and protein, and the calorie target stays at the starting value.	Без записей о калориях приложение не сможет оценить реальный расход. Чек-ин учтёт только тренд веса и белок, а цель по калориям останется стартовой.
Pausen-Kniebeuge, Hip Thrust, Bulgarian Split Squat	Pause squat, hip thrust, Bulgarian split squat	Присед с паузой, Hip Thrust, болгарские сплит-приседания
Pflicht-Deload: 65 % Last, 70 % der Sätze, Sprünge halbiert	Mandatory deload: 65% load, 70% of sets, jumps halved	Обязательный делоуд: 65 % веса, 70 % подходов, вдвое меньше прыжков
Plan gemeinsam erstellen. Trag Übungen, Sätze und Startgewichte ein.	Building the plan together. Enter exercises, sets and starting weights.	Совместное составление плана. Укажи упражнения, подходы и стартовые веса.
Plan-Standard	Plan default	В плане по умолчанию
Plotkin et al. 2023: Hip Thrust vs. Kniebeuge	Plotkin et al. 2023: hip thrust vs. squat	Plotkin et al. 2023: Hip Thrust и присед
Polster für die Knie und eine Halterung, die die Fersen festhält. Du lässt dich langsam nach vorn sinken, trainiert die Beinbeuger und senkt das Verletzungsrisiko.	A pad for your knees and a holder that locks your heels. You lower yourself slowly forward, training the hamstrings and cutting injury risk.	Мягкий упор под колени и фиксатор для пяток. Медленно опускайся вперёд, нагружая заднюю поверхность бедра. Упражнение может снизить риск травм.
Pro Tag eine Grundübung in einer 3-Wochen-Welle plus Deload, danach 5 × 10 derselben Übung (oder der Gegenübung). Das Volumengewicht steigt pro Zyklus – Einsteiger 40 → 60 %, Fortgeschrittene 50 → 70 % des Trainingsmax –, das Trainingsmax nach jedem Zyklus um 2,5 bzw. 5 kg.	One main lift per day in a 3-week wave plus deload, then 5 × 10 of the same lift (or its counterpart). The volume weight rises each cycle – beginners 40 → 60%, intermediates 50 → 70% of the training max – and the training max goes up by 2.5 or 5 kg after each cycle.	Каждый день одно базовое упражнение в 3-недельной волне плюс делоуд, затем 5 × 10 того же упражнения (или парного). Вес в объёмных подходах растёт с каждым циклом — новичкам 40 → 60 %, продвинутым 50 → 70 % тренировочного максимума, — а тренировочный максимум после каждого цикла растёт на 2,5 или 5 кг.
Pro Tag eine Hauptübung in einer 3-Wochen-Welle (5er, 3er, 5/3/1) plus Deload-Woche, gerechnet vom Trainingsmax (90 % 1RM). Nach jedem Zyklus steigt das Trainingsmax um 2,5 kg (oben) bzw. 5 kg (unten); bei Stillstand wird nur die betroffene Übung auf 90 % des aktuellen e1RM zurückgesetzt.	One main lift per day in a 3-week wave (5s, 3s, 5/3/1) plus a deload week, calculated from the training max (90% 1RM). After each cycle the training max goes up by 2.5 kg (upper body) or 5 kg (lower body); on a stall, only that lift is reset to 90% of the current e1RM.	Каждый день одно основное упражнение по 3-недельной схеме (пятёрки, тройки, 5/3/1), затем неделя делоуда. Веса рассчитываются от тренировочного максимума (90 % 1ПМ). После каждого цикла этот максимум повышается на 2,5 кг для верха или на 5 кг для низа. При застое пересчитай максимум только для этого упражнения: 90 % от текущего e1RM.
Prozent-Vorgaben der Originale sind als RPE umgesetzt: Die App rechnet aus deinem geschätzten 1RM die passende Last und passt sie an deine Tagesform an. Pläne mit 8 Wochen laufen im 12-Wochen-Block weiter, die Welle beginnt dann neu.	The originals' percentages are converted to RPE: the app calculates the right load from your estimated 1RM and adjusts it to how you feel that day. 8-week plans continue within the 12-week block, and the wave then starts again.	Вместо процентов из оригиналов здесь используется RPE. Приложение рассчитывает вес по твоему расчётному 1ПМ и подстраивает его под готовность в этот день. Если план рассчитан на 8 недель, в 12-недельном блоке волна начинается заново.
RDL, Ausfallschritte, Hip Thrust, Goblet Squat	RDL, lunges, hip thrust, goblet squat	Румынская тяга, выпады, Hip Thrust, гоблет-присед
Referenz = bestes e1RM der letzten zwei vergleichbaren Wochen (ohne Deload und Test). Stillstand: unter +0,5 % zweimal in Folge.	Reference = best e1RM of the last two comparable weeks (excluding deload and test). Plateau: below +0.5% twice in a row.	Ориентир — лучший e1RM за две последние сопоставимые недели (без делоуда и теста). Застой — прирост меньше 0,5 % два раза подряд.
Rudern 1000 m	Rowing 1000 m	Гребля 1 000 м
Ruhezeiten für Coaching-Meldungen (20–7 Uhr)	Quiet hours for coaching alerts (8 pm–7 am)	Тихие часы для тренерских уведомлений (20:00–7:00)
Saubere Technik in Kniebeuge, Hip Thrust und Romanian Deadlift, Fitnessstudio.	Clean technique in squat, hip thrust and Romanian deadlift, gym.	Уверенная техника приседа, Hip Thrust и румынской тяги. Нужен зал.
Schlaf, Ruhepuls, HRV, Gefühl	sleep, resting heart rate, HRV, feel	сон, пульс в покое, HRV, самочувствие
Schmerz bis 5 von 10, der am nächsten Morgen nicht schlimmer ist, ist bei vielen Beschwerden in Ordnung. Stärker oder stechend: die Übung auslassen und beobachten.	Pain up to 5 out of 10 that isn't worse the next morning is fine for many complaints. Stronger or stabbing: skip the exercise and keep an eye on it.	При многих ограничениях боль до 5 из 10 может быть допустима, если к следующему утру она не усиливается. Если боль сильнее или острая, пропусти упражнение и проверь, как меняются ощущения.
Schoenfeld et al. 2017, Dosis-Wirkung Volumen	Schoenfeld et al. 2017, volume dose-response	Schoenfeld et al. 2017: связь объёма с эффектом
Schreib oder diktiere, was du gegessen hast, mit Mengen, wenn du sie weißt.	Type or dictate what you ate, with amounts if you know them.	Напиши или продиктуй, что было в еде. Если знаешь, укажи количество.
Schräge Bank mit Polster an der Hüfte und Fußhalterung. Für Rückenstrecken, Po und Beinbeuger.	An angled bench with a hip pad and foot holder. For back extensions, glutes and hamstrings.	Наклонная скамья с упором для таза и фиксацией стоп. Для разгибаний спины и работы на ягодицы и заднюю поверхность бедра.
Schwerpunkt Waden, Hamstrings, Bizeps, Bauch:	Focus calves, hamstrings, biceps, abs:	Акцент на икры, заднюю поверхность бедра, бицепс и пресс:
Sehr hohes Volumen, ohne Deload	Very high volume, no deload	Очень большой объём, без делоуда
Sitz mit Polstern außen an den Knien. Du drückst die Beine auseinander, trainiert den seitlichen Po.	A seat with pads on the outside of your knees. You push your legs apart, training the side of the glutes.	Упоры с внешней стороны коленей. Разводи ноги, чтобы нагрузить боковую часть ягодиц.
Sitz, Polster über den Oberschenkeln, Rolle hinter den Waden. Du beugst die Knie nach unten. Sitzend dehnt die Beinbeuger stärker als liegend.	A seat, a pad over your thighs, a roller behind your calves. You bend your knees downward. Seated stretches the hamstrings more than lying.	Зафиксируй бёдра под упором, помести валик за икры. Сгибай ноги в коленях. Сидя мышцы задней поверхности бедра растягиваются сильнее, чем лёжа.
Sitzend schlägt liegend beim Muskelaufbau (Maeo 2021): Hüfte gebeugt = Hamstrings gedehnt.	Seated beats lying for muscle growth (Maeo 2021): hips flexed = hamstrings stretched.	Для роста мышц задней поверхности бедра сгибания ног сидя эффективнее, чем лёжа (Maeo 2021). Когда бёдра согнуты, эти мышцы растянуты.
SkiErg 1000 m	SkiErg 1000 m	SkiErg 1 000 м
Soll die App passend zu den Angaben einen Plan für diese Dauer erstellen, oder baust du selbst?	Should the app create a plan for this length based on the profile, or will you build it yourself?	Создать план на этот срок по данным профиля или составить вручную?
Starke Regelbeschwerden heute.	Strong period symptoms today.	Сегодня сильный дискомфорт из-за менструации.
Starke Sprünge in der Wochenbelastung gehen mit mehr Überlastungsbeschwerden einher. Die genaue Grenze (Verhältnis akut zu chronisch) ist umstritten.	Big jumps in weekly load go along with more overuse complaints. The exact threshold (acute to chronic ratio) is debated.	При резких скачках недельной нагрузки чаще возникает дискомфорт от перегрузки. Точный порог соотношения краткосрочной и долгосрочной нагрузки остаётся спорным.
Startgewichte beim Athleten verbuchen	Log starting weights for the athlete	Записать стартовые веса атлету
Suchen, z. B. Protein, Deload, Kreatin	Search, e.g. protein, deload, creatine	Поиск, напр. белок, делоуд, креатин
Superset mit BWS-Öffner.	Superset with the T-spine opener.	Суперсет с мобилизацией грудного отдела.
Sätze, Wiederholungen und RPE richten sich nach deinem Ziel. Deload- und Testwochen rechnet die App automatisch ein.	Sets, reps and RPE follow your goal. The app adds deload and test weeks automatically.	Подходы, повторения и RPE зависят от твоей цели. Приложение само учитывает недели делоуда и тестов.
Termin an einer Einheit des Athleten	Appointment tied to one of the athlete’s sessions	Встреча, привязанная к тренировке атлета
Tipp: Klick auf eine Zeile zeigt rechts Werte und Notizen. Doppelklick öffnet die Athletenansicht.	Tip: click a row to see key stats and notes on the right. Double-click opens the athlete view.	Нажми на строку, чтобы увидеть показатели и заметки справа. Двойное нажатие откроет карточку атлета.
Trag unten ein, wie du dich fühlst. Mit Zepp-Daten kommen Schlaf, Ruhepuls und HRV dazu.	Enter how you feel below. With Zepp data, sleep, resting HR and HRV are added.	Укажи ниже самочувствие. С данными Zepp добавятся сон, пульс покоя и HRV.
Trag unten ein, wie du dich fühlst. Mit den Daten deiner Uhr kommen Schlaf, Ruhepuls und HRV dazu.	Enter below how you feel. With data from your watch, sleep, resting heart rate and HRV are added.	Отметь ниже самочувствие. С данными часов добавятся сон, пульс покоя и HRV.
Training: Punkte pro Einheit dieser Woche (grün erledigt, gelb angefangen oder verschoben, rot ausgelassen, grau offen), darunter die Umsetzung der letzten Wochen. Ernährung: erfasste Tage der letzten 7 Tage und Ø Kalorien zum Ziel. „Erledigt“ blendet die Hinweise aus, bis sich beim Athleten etwas ändert.	Training: one dot per session this week (green done, yellow started or moved, red skipped, grey open), below it the completion rate of the last weeks. Nutrition: days logged in the last 7 days and average calories vs. target. "Done" hides the alerts until something changes for the athlete.	Тренировки: по точке на тренировку этой недели (зелёная — выполнена, жёлтая — начата или перенесена, красная — пропущена, серая — ещё открыта). Ниже — доля выполненных тренировок за прошлые недели. Питание: дни с записями за последние 7 дней и средние калории относительно цели. «Готово» скрывает подсказки, пока у атлета что-то не изменится.
Trendgewicht, echter Kalorienbedarf, Kraft, Belastung und Schlaf über die Wochen. Tage und Balken lassen sich antippen.	Trend weight, real calorie needs, strength, load and sleep over the weeks. Days and bars can be tapped.	Трендовый вес, реальный расход калорий, сила, нагрузка и сон по неделям. Нажми на день или столбец, чтобы посмотреть подробнее.
Umsetzgriff, mit Pausen. Tempo 3131, Halte unter Knie und am Oberschenkel.	Clean grip, with pauses. Tempo 3131, holds below the knee and at the thigh.	Хват как для взятия на грудь. Темп 3131. Паузы чуть ниже коленей и на уровне бёдер.
Unterstrichene Begriffe wie RPE oder Deload kannst du überall antippen. Viel Erfolg beim Training.	You can tap underlined terms like RPE or deload anywhere. Enjoy your training.	Подчёркнутые термины, например RPE или делоуд, можно открыть нажатием. Удачных тренировок!
Urlaub oder Pause	Holiday or break	Отпуск или пауза
VO₂max	VO₂max	VO₂max
VO₂max (optional)	VO₂max (optional)	VO₂max (необязательно)
VO₂max-Block 4×4	VO₂max block 4×4	Блок VO₂max 4×4
Verwerfen	Discard	Сбросить правки
Verworfen	Discarded	Правки сброшены
Von dir	By you	Твой план
Vorschlag im Check-in nach längerer Diät	Suggested in the check-in after a longer diet	Подсказка в чек-ине после долгой диеты
Vorschlag im Wochen-Check-in	Suggested in the weekly check-in	Подсказка в недельном чек-ине
Vorschlag im Wochen-Check-in bei Ermüdung	Suggested in the weekly check-in when fatigued	Подсказка в недельном чек-ине при усталости
Vorschlag Übungstausch im Wochen-Check-in	Exercise swap suggested in the weekly check-in	Подсказка о замене упражнения в недельном чек-ине
Vorschlag: nach spätestens 8 harten Wochen eine Deload-Woche einbauen.	Suggestion: add a deload week after 8 hard weeks at the latest.	Добавь неделю делоуда не позже чем через 8 тяжёлых недель.
Was du bei einem einzelnen Athleten anpasst, ändert nie die Vorlage. Änderungen an der Vorlage gelten für neue Zuweisungen. Nur wenn du ausdrücklich „übertragen“ wählst, bekommen auch die zugewiesenen Athleten die neue Version.	What you adjust for a single athlete never changes the template. Template changes apply to new assignments. Only if you explicitly choose to send them do assigned athletes get the new version.	Индивидуальные правки для атлета не меняют шаблон. Изменения шаблона действуют для новых назначений. Чтобы уже назначенные атлеты получили новую версию, выбери «Перенести».
Wenig Isolation, keine Waden	Little isolation, no calves	Мало изоляции, нет работы на икры
Wie deine Athleten dich in der App sehen	How your athletes see you in the app	Как твои атлеты видят тебя в приложении
Willst du sie auch an die {n} zugewiesenen Athleten senden?	Do you also want to send it to the {n} assigned athletes?	Отправить её и назначенным атлетам ({n})?
Wird bei {n} Athleten zum Plan hinzugefügt. Bestehende Gewohnheiten bleiben.	Will be added to the plan of {n} athletes. Existing habits stay.	Добавится в план атлетов: {n}. Текущие привычки останутся.
Wochen-Check-in schlägt das vor, sobald das Trendgewicht das Ziel erreicht; bis dahin rechnet der Check-in ab dem Ziel ohne Defizit	The weekly check-in suggests this once your trend weight reaches the goal; until then, the check-in stops the deficit once the goal is reached	Недельный чек-ин предложит это, когда трендовый вес достигнет цели. Для расчётов после достижения цели чек-ин уже использует калории без дефицита.
Wusste ich	Knew it	Знакомо
Wähle mindestens einen Athleten.	Pick at least one athlete.	Выбери хотя бы одного атлета.
Während Krankheit oder Verletzung ohne feste Essenspausen essen. Der Timer läuft nach deinem Wiedereinstieg weiter.	While you're sick or injured, eat without fixed fasting windows. The timer resumes once you're back to training.	Во время болезни или травмы ешь без фиксированных перерывов. Таймер снова запустится после возвращения к тренировкам.
Während du selbst trainierst, hält die App Coaching-Meldungen zurück und schickt sie danach gesammelt. Meldungen zu deinem eigenen Training laufen über einen eigenen Kanal.	While you’re training yourself, the app holds back coaching alerts and sends them together afterwards. Alerts about your own training use a separate channel.	Пока идёт твоя тренировка, приложение откладывает тренерские уведомления и присылает их вместе после неё. Уведомления о твоих тренировках идут по отдельному каналу.
Zeig deinen Athleten die Ausführung so, wie du sie willst: als Link (YouTube, Instagram, Vimeo) oder als eigenes Video bis 30 Sekunden. Es erscheint in der Übungsanleitung, auch im Training.	Show your athletes how you want the exercise performed: as a link (YouTube, Instagram, Vimeo) or as your own video up to 30 seconds. It appears in the exercise guide, also during training.	Покажи атлетам технику так, как нужно тебе: ссылкой (YouTube, Instagram, Vimeo) или своим видео до 30 секунд. Оно появится в описании упражнения, в том числе во время тренировки.
Zone-2-Dauer nach Woche: 40–50 min, in Deload-Wochen kürzer.	Zone 2 duration by week: 40–50 min, shorter in deload weeks.	Длительность тренировок в зоне 2 по неделям: 40–50 мин, во время делоуда — меньше.
Zugesagt	Accepted	Встреча подтверждена
Zum Beispiel: Kreatin, Mein Studio, RPE, Kniebeuge, Sprache, Deload	For example: creatine, my gym, RPE, squat, language, deload	Например: креатин, мой зал, RPE, присед, язык, делоуд
Zurück zum Coaching	Back to coaching	К работе тренера
Zwei Schwimm-, zwei Rad- und zwei Laufeinheiten pro Woche, dazu zwei kurze Krafteinheiten. Lange Einheiten wachsen phasenweise, die Qualität wechselt von locker über Kraftausdauer und Intervalle zu Wettkampftempo und Koppeleinheiten. Jede 4. Woche leichter, Woche 23 Taper, Woche 24 Rennen. Ruhetage flexibel nach Aufwärm-Test.	Two swim, two bike and two run sessions per week, plus two short strength sessions. Long sessions grow phase by phase, the focus moves from easy through strength endurance and intervals to race pace and brick sessions. Every 4th week lighter, week 23 taper, week 24 race. Rest days flexible based on a warm-up test.	Две тренировки в бассейне, две на велосипеде и две беговые в неделю, плюс две короткие силовые. Длительность длинных тренировок растёт от фазы к фазе. Вначале лёгкая работа, затем силовая выносливость и интервалы, потом соревновательный темп и связки дисциплин. Каждая 4-я неделя легче, на 23-й — подводка, на 24-й — старт. Дни отдыха выбирай по результатам проверки на разминке.
Zwei Tempo-Supersets pro Tag, danach ein Konditionsblock; zwei Übungssätze wechseln wöchentlich. Alle 2 Wochen werden Pausen kürzer oder Sätze mehr, die Last steigt, sobald alle Sätze am oberen Ende sauber gelingen.	Two tempo supersets per day, then a conditioning block; two exercise sets alternate weekly. Every 2 weeks rests get shorter or sets go up, the load rises once all sets are clean at the top of the range.	Два суперсета с заданным темпом за тренировку, затем блок на выносливость. Два набора упражнений чередуются по неделям. Каждые 2 недели отдых сокращается или подходов становится больше. Прибавляй вес, когда во всех подходах получаются чистые повторения по верхней границе.
am Check-in-Tag, wenn der Athlet noch nicht geantwortet hat (Fragebogen im Plan einrichten)	on check-in day if the athlete hasn't replied yet (set up the questionnaire in the plan)	в день чек-ина, если атлет ещё не ответил (анкету настраивают в плане)
e1RM	e1RM	e1RM
e1RM (bestes)	e1RM (best)	e1RM (лучший)
e1RM = Gewicht × (1 + (Wdh. + RIR) / 30). Ohne RPE-Eintrag wird die Plan-RPE angenommen.	e1RM = weight × (1 + (reps + reps in reserve) / 30). Without an RPE entry the planned RPE is assumed.	e1RM = вес × (1 + (повт. + RIR) / 30). Если RPE не указано, берётся значение из плана.
e1RM = Mittel aus den Formeln von Epley, Brzycki und Wathen, mit Wiederholungen im Tank (RIR). Nur Sätze bis 10 Wiederholungen zählen, darüber ist die Schätzung zu ungenau. Ohne RPE-Eintrag wird die Plan-RPE angenommen. Beim Kreuzheben liegt die Schätzung oft 9–14 % unter dem echten Maximum.	e1RM = average of the Epley, Brzycki and Wathen formulas, including reps in reserve (RIR). Only sets of up to 10 reps count; above that the estimate is too inaccurate. Without an RPE entry the planned RPE is used. On the deadlift the estimate is often 9–14% below your true max.	e1RM — среднее по формулам Эпли, Бжицки и Уэтена с учётом повторений в запасе (RIR). Учитываются подходы до 10 повторений включительно: при большем числе повторений оценка слишком неточна. Если RPE не указано, берётся значение из плана. В становой тяге оценка часто на 9–14 % ниже фактического максимума.
e1RM der Hauptübungen	e1RM of the main lifts	e1RM основных упражнений
e1RM nach Epley mit RPE-Korrektur	e1RM by Epley with RPE correction	e1RM по Эпли с поправкой на RPE
e1RM nur aus Sätzen bis	e1RM only from sets up to	e1RM только из подходов до
für {n} Athleten	for {n} athletes	для атлетов: {n}
getrennte Tage oder mindestens 3–6 h Abstand. Laufen stört den Beinaufbau stärker als Rad oder Rudern (Schumann 2022).	separate days or at least 3–6 h apart. Running hurts leg growth more than cycling or rowing (Schumann 2022).	разные дни или хотя бы 3–6 ч между тренировками. Бег сильнее мешает росту мышц ног, чем велосипед или гребля (Schumann 2022).
kg e1RM	kg e1RM	кг e1RM
sobald ein Athlet deinen Einladungscode einlöst	as soon as an athlete redeems your invite code	как только атлет введёт твой код приглашения
unbekannt. Erst unter „Neu“ anlegen.	unknown. Create it under “New” first.	не найден. Добавь продукт через «Новый».
z. B. Zu wenig Volumen für den Rücken, Deload fehlt	e.g. Too little back volume, no deload	например: мало объёма на спину, нет делоуда
zweimal 4–8 langsame Wiederholungen in Gym B. Exzentrisches Hamstring-Training senkt das Risiko für Zerrungen deutlich (van Dyk 2019).	twice 4–8 slow reps in Gym B. Eccentric hamstring training clearly lowers strain risk (van Dyk 2019).	дважды по 4–8 медленных повторений в Gym B. Эксцентрические упражнения на заднюю поверхность бедра заметно снижают риск растяжений (van Dyk 2019).
{n} Athleten	{n} athletes	Атлетов: {n}
{n} Athleten zugewiesen	{n} athletes assigned	Назначено атлетам: {n}
{n} Athleten · {a} brauchen Aufmerksamkeit	{n} athletes · {a} need attention	Атлетов: {n} · требуют внимания: {a}
{n} Wochen am Stück ohne Deload. Üblich ist eine leichtere Woche alle 4–8 Wochen.	{n} weeks in a row without a deload. A lighter week every 4–8 weeks is common.	{n} недель подряд без делоуда. Обычно лёгкая неделя бывает раз в 4–8 недель.
{n} neue Coaching-Meldungen	{n} new coaching alerts	Новых тренерских уведомлений: {n}
· e1RM	· e1RM	· e1RM
„Alle Wochen“ ist der Standard. Die App steigert Sätze und Lasten über die Phasen und halbiert in Deload-Wochen automatisch. Tippe auf eine Woche, um sie eigens zu planen.	“All weeks” is the standard. The app increases sets and loads across the phases and halves them in deload weeks automatically. Tap a week to plan it separately.	По умолчанию выбраны «Все недели». Приложение увеличивает число подходов и веса от фазы к фазе и автоматически сокращает их вдвое в недели делоуда. Нажми на неделю, чтобы настроить её отдельно.
„Plan gemeinsam erstellen“: Ihr geht im Gym Übung für Übung durch, du trägst Sätze und auf Wunsch Startgewichte ein. Daraus wird eine Einheit im Plan, ein Eintrag im Verlauf deines Athleten oder eine Vorlage.	“Build the plan together”: you go through it exercise by exercise at the gym and enter sets and, if you like, starting weights. This becomes a session in the plan, an entry in your athlete’s history, or a template.	«Составить план вместе»: в зале вы с атлетом проходите упражнения одно за другим, а ты указываешь подходы и при желании стартовые веса. Так можно добавить тренировку в план, записать её в историю атлета или сделать шаблон.
Baustein entfernen	Remove snippet	Удалить заготовку
Textbausteine	Snippets	Заготовки сообщений
Aktuellen Text als Baustein speichern. {name} wird durch den Vornamen ersetzt.	Save the current text as a snippet. {name} is replaced with the first name.	Сохранить этот текст как заготовку. Вместо {name} подставится имя.
Baustein	Snippet	Заготовка
Baustein gespeichert	Snippet saved	Заготовка сохранена
{n} doppelte Einheiten zusammengeführt (Uhr + App)	Merged {n} duplicate sessions (watch + app)	Объединено совпавших тренировок (часы + приложение): {n}
Getrennt. Die Uhr-Einheit steht wieder als freie Aktivität drin.	Separated. The watch session is back as a free activity.	Записи разделены. Тренировка с часов снова отображается как свободная активность.
```

## B. Neue Texte für Code-Stellen

| Datei | Stelle | DE | EN | RU |
|---|---|---|---|---|
| `www/index.html` | Scanner, Schaltfläche `scanClose` (`aria-label`) | Scanner schließen | Close scanner | Закрыть сканер |
| `www/index.html` | Scanner, Schaltfläche `torch` (`aria-label`) | Taschenlampe | Flashlight | Фонарик |
| `www/index.html` | Scanner, `scanCode` (`placeholder`) | Nummer eintippen | Enter number | Введи номер |
| `www/index.html` | Scanner, `scanCode` (`aria-label`) | Barcode-Nummer | Barcode number | Номер штрихкода |
| `www/app.js` | Wochenleiste, Schaltfläche `week` (`aria-label`) | Woche {n} | Week {n} | Неделя {n} |
| `www/app.js` | Logger, Gewicht (`aria-label`) | Satz {n} kg | Set {n} kg | Подход {n}, кг |
| `www/app.js` | Logger, Anstrengung (`aria-label`) | Satz {n} RPE | Set {n} RPE | Подход {n}, RPE |
| `www/app.js` | Logger, Schaltfläche `done` (`aria-label`) | Satz {n} erledigt | Set {n} done | Подход {n} выполнен |
| `www/app.js` | Körperkarte, SVG `front` (`aria-label`) | Körperkarte vorne | Body map, front | Карта тела, вид спереди |
| `www/app.js` | Körperkarte, SVG `back` (`aria-label`) | Körperkarte hinten | Body map, back | Карта тела, вид сзади |
| `www/micro.js` | Filter `nrMeal`, Mahlzeiten-Kopf, z. B. `0 / 651 kcal` | kcal | kcal | ккал |
| `www/libtabs.js` | Bibliothek, Reiter `com` | Community | Community | Сообщество |
| `www/levels.js` | Verlauf, Quellenhinweis `swRef` | Impellizzeri 2020 (Kritik) | Impellizzeri 2020 (critique) | Impellizzeri 2020 (критика) |
| `www/planwide.js` | Breiter Plan-Editor, Name im Platzhalter `{s}` in `„+“ fügt zu {s} hinzu. Oder in eine Einheit ziehen.` | Ganzkörper A | Full body A | Всё тело A |
| `www/manifest.webmanifest` | Feld `description` | Training mit Autoregulation, Ernährung mit adaptivem Bedarf und Zepp-Gesundheitsdaten. | Training with autoregulation, nutrition with adaptive calorie needs and Zepp health data. | Тренировки с авторегуляцией, питание с учётом расхода калорий и данные о здоровье из Zepp. |
| `www/privacypolicy.html`, `www/privacy.js` | Webseite und Dialog, vollständiger Abschnitt | Datenschutzerklärung | Privacy policy | [Политика конфиденциальности](#f-datenschutzerklärung-ru) |

## C. Wissensbank

```json
{
  "BLK-101": {
    "u": "Размер профицита калорий",
    "sl": {
      "h": "Набор с небольшим профицитом",
      "kn": [
        "+250–500",
        "ккал в день"
      ],
      "b": [
        "При умеренном профиците лучше соотношение набранных мышц и жира",
        "Больше калорий не ускоряет рост мышц",
        "Рекомендация основана на мнении экспертов"
      ],
      "fd": "Для набора массы достаточно 250–500 ккал сверх дневного расхода.",
      "q": {
        "q": "Каким примерно должен быть ежедневный профицит при наборе массы?",
        "r": "250–500 ккал",
        "w": [
          "2 000 ккал",
          "Не профицит, а дефицит",
          "5 000 ккал"
        ]
      }
    }
  },
  "BLK-102": {
    "u": "Темп набора у новичков и атлетов среднего уровня",
    "sl": {
      "h": "Новички: +0,25–0,5 % в неделю",
      "kn": [
        "+10–20 %",
        "калорий сверх поддержания"
      ],
      "b": [
        "Новичкам и атлетам среднего уровня подходит чуть больший профицит",
        "Цель: 0,25–0,5 % массы тела в неделю",
        "Примерно 1–2 % в месяц"
      ],
      "fd": "При 75 кг: +0,2–0,4 кг в неделю — хороший темп.",
      "q": {
        "q": "Какой темп набора в неделю подходит новичку при наборе массы?",
        "r": "0,25–0,5 % массы тела",
        "w": [
          "2 % массы тела",
          "0 %",
          "5 кг в неделю"
        ]
      }
    }
  },
  "BLK-111": {
    "u": "Рекомпозиция тела на поддерживающих калориях",
    "sl": {
      "h": "Рост мышц и на поддержании",
      "kn": [
        "1,6–2,4 г/кг",
        "белка для рекомпозиции"
      ],
      "b": [
        "Наращивать мышцы и сжигать жир можно и без профицита",
        "Даже у тренированных",
        "С прогрессивными тренировками и большим количеством белка"
      ],
      "fd": "Не хочешь набирать вес: ешь на поддержание, много белка, тренируйся тяжело.",
      "q": {
        "q": "Обязательно ли нужен профицит калорий для роста мышц?",
        "r": "Нет, на поддержании это возможно при большом количестве белка",
        "w": [
          "Да, всегда минимум 1 000 ккал",
          "Да, иначе мышцы уменьшаются",
          "Только без тренировок"
        ]
      }
    }
  },
  "LOD-101": {
    "u": "Тренировки по HRV",
    "sl": {
      "h": "По HRV: меньше тяжёлых тренировок, а результат лучше",
      "kn": [
        "13 против 18",
        "тяжёлых тренировок"
      ],
      "b": [
        "Бегуны тренировались по HRV с меньшим числом тяжёлых тренировок",
        "И сильнее улучшили результат на 3 000 м",
        "Если HRV вне нормы, тренировка становится лёгкой"
      ],
      "fd": "HRV утром заметно ниже обычного: сегодня лучше легко, а не интервалы.",
      "q": {
        "q": "Чего добились бегуны, тренировавшиеся по HRV, по сравнению с фиксированным планом?",
        "r": "Меньше тяжёлых тренировок и больший прогресс на 3 000 м",
        "w": [
          "Больше травм",
          "Никакого прогресса",
          "Вдвое больше тяжёлых тренировок"
        ]
      }
    }
  },
  "LOD-102": {
    "u": "Тренировки по HRV (противоречия по VO₂max)",
    "sl": {
      "h": "HRV и VO₂max: единого мнения нет",
      "kn": [
        "≥ 3",
        "измерения в неделю"
      ],
      "b": [
        "Управление по HRV улучшает вагусную HRV",
        "Для VO₂max результаты противоречивы",
        "Больше всего выигрывают новички и любители"
      ],
      "fd": "Хочешь тренироваться по HRV: минимум 3 утренних замера в неделю и ориентируйся на среднее за 7 дней.",
      "q": {
        "q": "Что говорят метаанализы о пользе HRV-управления для VO₂max?",
        "r": "Результаты противоречивы",
        "w": [
          "Однозначно вдвое больше",
          "Однозначно вредно",
          "Исследований нет"
        ]
      }
    }
  },
  "LOD-103": {
    "u": "Тренировки по HRV (силовые)",
    "sl": {
      "h": "В силовых управление по HRV ничего не даёт",
      "kn": [
        "7 недель",
        "никакой пользы для силы и мышц"
      ],
      "b": [
        "Выбор тренировочных дней по HRV не дал преимуществ",
        "Ни для силы, ни для мышечной массы",
        "Достаточно фиксированного плана на неделю"
      ],
      "fd": "Для силовых: держись своего плана, а не цифры HRV.",
      "q": {
        "q": "Даёт ли силовая тренировка по HRV больше силы или мышц?",
        "r": "Нет, преимуществ перед фиксированным планом нет",
        "w": [
          "Да, вдвое больше",
          "Да, только у мужчин",
          "Да, но только мышцы"
        ]
      }
    }
  },
  "LOD-105": {
    "u": "Пульс покоя и вегетативная регуляция сердечного ритма",
    "sl": {
      "h": "Высокая HRV — не всегда хорошо",
      "kn": [
        "24",
        "исследования, 355 спортсменов на выносливость"
      ],
      "b": [
        "HRV растёт при хорошей адаптации",
        "Но она растёт и при перегрузке",
        "Без учёта самочувствия цифра неоднозначна"
      ],
      "fd": "HRV резко растёт, а ты разбит? Это может быть перегрузка.",
      "q": {
        "q": "Почему рост HRV может быть неоднозначным?",
        "r": "Она растёт и при хорошей адаптации, и при перегрузке",
        "w": [
          "Она растёт только во сне",
          "Она всегда плохая",
          "Она измеряет сахар в крови"
        ]
      }
    }
  },
  "LOD-112": {
    "u": "Субъективные опросники (самочувствие против объективных показателей)",
    "sl": {
      "h": "Главное — как ты себя чувствуешь",
      "kn": [
        "56",
        "исследований в обзоре"
      ],
      "b": [
        "Вопросы о самочувствии реагируют на нагрузку чувствительнее, чем пульс или HRV",
        "Стабильно при острой и хронической нагрузке",
        "И в разгрузочные фазы"
      ],
      "fd": "Готовность в приложении учитывает твоё самочувствие сильнее, чем измерения.",
      "q": {
        "q": "Что, по данным обзора, чувствительнее всего реагирует на тренировочную нагрузку?",
        "r": "Субъективная оценка самочувствия",
        "w": [
          "Пульс покоя",
          "Масса тела",
          "Размер обуви"
        ]
      }
    }
  },
  "LOD-114": {
    "u": "Перетренированность и функциональная перегрузка (гиперактивность парасимпатической системы)",
    "sl": {
      "h": "Перегрузка видна в среднем за 7 дней",
      "kn": [
        "7 дней",
        "среднее вместо одного замера"
      ],
      "b": [
        "При перегрузке средняя HRV росла, а результаты падали",
        "Один замер в неделю это пропускает",
        "Ежедневные замеры делают это видимым"
      ],
      "fd": "Для HRV всегда смотри среднее за 7 дней, а не сегодняшнее значение.",
      "q": {
        "q": "Как распознать функциональную перегрузку по HRV?",
        "r": "По среднему за 7 дней при одновременном падении результатов",
        "w": [
          "По одному замеру в неделю",
          "Никак",
          "По массе тела"
        ]
      }
    }
  },
  "NRG-104": {
    "u": "Точность фитнес-часов по расходу калорий (общий обзор)",
    "sl": {
      "h": "Фитнес-часы угадывают расход",
      "kn": [
        "60",
        "исследований, 40 устройств"
      ],
      "b": [
        "Трекеры в среднем занижают расход энергии",
        "Разброс огромный",
        "Особенно неточно при езде на велосипеде"
      ],
      "fd": "Приложение не прибавляет к цели по калориям весь расход, который показывают часы.",
      "q": {
        "q": "Насколько точно фитнес-часы оценивают расход калорий?",
        "r": "Неточно, с большим разбросом",
        "w": [
          "С точностью до калории",
          "Точнее лаборатории",
          "Они вообще ничего не измеряют"
        ]
      }
    }
  },
  "NRG-106": {
    "u": "Колебания веса и трендовый вес по неделям и праздникам",
    "sl": {
      "h": "В понедельник тяжелее, в пятницу легче",
      "kn": [
        "0,35 %",
        "колебание за неделю"
      ],
      "b": [
        "Вес выше всего в воскресенье и понедельник",
        "Ниже всего в пятницу",
        "Новогодние праздники: +1,35 %, часто уходит не полностью"
      ],
      "fd": "Доверяй тренду за 7 дней, а не одной цифре на весах.",
      "q": {
        "q": "В какие дни масса тела обычно выше всего?",
        "r": "Воскресенье и понедельник",
        "w": [
          "Среда",
          "Пятница",
          "Всегда одинаково"
        ]
      }
    }
  },
  "NRG-108": {
    "u": "Недооценка калорий при учёте (устойчивость к диете)",
    "sl": {
      "h": "Кто не худеет, часто недооценивает съеденное",
      "kn": [
        "47 %",
        "калорий указано меньше"
      ],
      "b": [
        "Застой при якобы менее 1 200 ккал: обмен веществ был в норме",
        "Количество еды сильно недооценили",
        "А активность переоценили"
      ],
      "fd": "Вес стоит, несмотря на дефицит: неделю точно взвешивай еду.",
      "q": {
        "q": "Почему люди не худели, хотя записывали 1 000 ккал?",
        "r": "Они заметно недооценивали съеденное",
        "w": [
          "У них был сломан обмен веществ",
          "У них было слишком много мышц",
          "От воды толстеют"
        ]
      }
    }
  },
  "NRG-117": {
    "u": "Удержание веса после диеты (метаболическая адаптация и объём движения)",
    "sl": {
      "h": "Обмен веществ после диеты почти не тормозит",
      "kn": [
        "~50 ккал",
        "меньше обмен в покое в день"
      ],
      "b": [
        "Адаптация после умеренной диеты небольшая",
        "Она не предсказывает повторный набор",
        "Часто называемые 250 мин спорта в неделю плохо доказаны"
      ],
      "fd": "Цель достигнута? Пересчитай потребность по новому весу — без паники.",
      "q": {
        "q": "Насколько в среднем падает обмен в покое после умеренной диеты?",
        "r": "Примерно на 50 ккал в день",
        "w": [
          "На 1 000 ккал в день",
          "Вдвое",
          "Он растёт на 500 ккал"
        ]
      }
    }
  },
  "HYB-104": {
    "u": "Требования Hyrox и фитнес-соревнований",
    "sl": {
      "h": "Колени и ахиллово сухожилие — слабые места",
      "kn": [
        "~75 %",
        "проблем связаны с перегрузкой"
      ],
      "b": [
        "Почти три четверти проблем связаны с перегрузкой",
        "Прежде всего колени, голени и ахиллово сухожилие",
        "Травмы плеч редки"
      ],
      "fd": "Лёгкая боль в колене или ахилле: сразу урежь объём бега и выпадов.",
      "q": {
        "q": "Какие части тела чаще всего страдают у атлетов Hyrox?",
        "r": "Колени и голени или ахиллово сухожилие",
        "w": [
          "Плечи",
          "Запястья",
          "Шея"
        ]
      }
    }
  },
  "HYB-105": {
    "u": "Что влияет на результат",
    "sl": {
      "h": "Решает выносливость, а не сила хвата",
      "kn": [
        "VO₂max",
        "самая сильная связь со временем"
      ],
      "b": [
        "Более высокий VO₂max связан с более быстрым прохождением дистанции",
        "А также с большим объёмом выносливости и меньшим жиром",
        "Сила хвата и мышечная масса связи не показали"
      ],
      "fd": "Хочешь улучшить результат в Hyrox? Начни с VO₂max и объёма бега.",
      "q": {
        "q": "Что у любителей сильнее всего было связано с более быстрым временем в Hyrox?",
        "r": "Более высокий VO₂max",
        "w": [
          "Сила хвата",
          "Мышечная масса",
          "Объём силовых"
        ]
      }
    }
  },
  "HYB-106": {
    "u": "Что влияет на результат",
    "sl": {
      "h": "Тяжёлым саням нужен запас силы",
      "kn": [
        "202 кг",
        "sled push у мужчин Pro"
      ],
      "b": [
        "На станциях фиксированные тяжёлые веса",
        "Кроме выносливости важны силовая выносливость и максимальная сила",
        "Кто сильнее, тот меньше устаёт от фиксированных весов"
      ],
      "fd": "Переходишь в Pro: в подготовке наращивай максимальную силу для саней и выпадов.",
      "q": {
        "q": "Почему максимальная сила важна в Hyrox, хотя это гонка на выносливость?",
        "r": "Потому что на станциях фиксированные тяжёлые веса",
        "w": [
          "Потому что веса можно выбирать самому",
          "Потому что там нет бега",
          "Не важна"
        ]
      }
    }
  },
  "HYB-107": {
    "u": "Бег после силовых станций (Compromised Running)",
    "sl": {
      "h": "Тяжёлые силовые ухудшают следующую пробежку",
      "kn": [
        "≤ 24 ч",
        "хуже экономичность бега после"
      ],
      "b": [
        "После тяжёлых силовых ты бежишь менее экономично до 24 часов",
        "Иногда и несколько дней",
        "Важные пробежки не сразу после тренировки ног"
      ],
      "fd": "Перед темповой или интервальной пробежкой: 24 часа без тяжёлых ног.",
      "q": {
        "q": "Как долго тяжёлые силовые могут ухудшать экономичность бега?",
        "r": "До 24 часов и дольше",
        "w": [
          "Всего 5 минут",
          "Совсем не ухудшают",
          "Несколько месяцев"
        ]
      }
    }
  },
  "HYB-108": {
    "u": "Бег после силовых станций (Compromised Running)",
    "sl": {
      "h": "Бег после станций: опыт практиков",
      "kn": [
        "4–6 недель",
        "перед стартом, 1–2 раза в неделю"
      ],
      "b": [
        "Исследований по тренировке перехода станция — бег пока нет",
        "Рекомендации основаны на опыте экспертов",
        "Обычно: 4–6 кругов из станции плюс 400–1 000 м бега"
      ],
      "fd": "Последние 4–6 недель: 1–2 тренировки со сменой станции и бега.",
      "q": {
        "q": "Сколько контролируемых исследований о тренировке compromised running?",
        "r": "Ни одного",
        "w": [
          "Больше 50",
          "Ровно 10",
          "Сотни"
        ]
      }
    }
  },
  "HYB-112": {
    "u": "Структура недели для гибридных атлетов",
    "sl": {
      "h": "Совмещаешь? Сначала силовая",
      "kn": [
        "+6,9 %",
        "больше силы ног"
      ],
      "b": [
        "Силовая перед кардио даёт больше силы ног",
        "VO₂max и рост мышц не меняются",
        "Исключение: целенаправленный бег после станций"
      ],
      "fd": "Мало времени и всё в одной тренировке: всегда сначала силовая.",
      "q": {
        "q": "В каком порядке делать силовую и кардио в одной тренировке?",
        "r": "Сначала силовая, потом кардио",
        "w": [
          "Сначала кардио, потом силовая",
          "Одновременно",
          "Всё равно"
        ]
      }
    }
  },
  "FRA-105": {
    "u": "Фазы цикла и тренировки",
    "sl": {
      "h": "Самочувствие важнее гормонов",
      "kn": [
        "до 85 %",
        "спортсменок ощущают влияние"
      ],
      "b": [
        "Многие спортсменки в определённые дни чувствуют себя ограниченными",
        "Особенно во время месячных и незадолго до них",
        "Результат зависит от самочувствия, а не напрямую от уровня гормонов"
      ],
      "fd": "Сильные спазмы или усталость: отметь это в чек-ине, приложение предложит тренировку полегче.",
      "q": {
        "q": "С чем сильнее всего связана готовность тренироваться в течение цикла?",
        "r": "По самочувствию и ограничениям",
        "w": [
          "Напрямую с уровнем гормонов в крови",
          "С днём недели",
          "С цветом волос"
        ]
      }
    }
  },
  "FRA-111": {
    "u": "Перименопауза и менопауза",
    "sl": {
      "h": "После менопаузы: силовые 3 раза в неделю",
      "kn": [
        "60 мин",
        "за тренировку"
      ],
      "b": [
        "Больше силы в руках и ногах",
        "Повышается VO₂max",
        "Меньше обхват талии"
      ],
      "fd": "После менопаузы: 3 силовые тренировки в неделю примерно по 60 минут.",
      "q": {
        "q": "Какая частота тренировок оптимальна после менопаузы?",
        "r": "3 силовые тренировки в неделю",
        "w": [
          "Раз в месяц",
          "Дважды в день",
          "Никакая"
        ]
      }
    }
  },
  "BES-111": {
    "u": "Модель контроля боли",
    "sl": {
      "h": "Немного боли во время упражнений допустимо",
      "kn": [
        "SMD −0,27",
        "сильнее облегчение боли в краткосрочной перспективе"
      ],
      "b": [
        "Упражнения с терпимой болью в краткосрочной перспективе работали даже лучше",
        "В долгосрочной — так же, как без боли",
        "Не повод сразу прекращать"
      ],
      "fd": "При хронической боли умеренная боль во время упражнения сама по себе не требует остановки.",
      "q": {
        "q": "Что показали упражнения, где допускалась терпимая боль?",
        "r": "Сильнее облегчение боли в краткосрочной перспективе",
        "w": [
          "Больше травм",
          "Хуже результаты",
          "Никакого эффекта"
        ]
      }
    }
  },
  "BES-112": {
    "u": "Адаптация упражнений или пауза",
    "sl": {
      "h": "Острая боль в спине: оставайся активным",
      "kn": [
        "10",
        "исследований, 1923 человека"
      ],
      "b": [
        "Активность облегчает боль быстрее постельного режима",
        "Касается боли в спине без отдачи в ногу",
        "При ишиасе разницы нет"
      ],
      "fd": "Прострел? Двигайся, насколько получается, — без постельного режима.",
      "q": {
        "q": "Что лучше постельного режима при острой боли в спине без отдачи в ногу?",
        "r": "Оставаться активным в пределах боли",
        "w": [
          "Неделю лежать",
          "Тяжёлые силовые на максимум",
          "Ничего не делать"
        ]
      }
    }
  },
  "BES-113": {
    "u": "Адаптация упражнений или пауза",
    "sl": {
      "h": "После растяжения — беречься лишь недолго",
      "kn": [
        "1–3 дня",
        "разгрузки"
      ],
      "b": [
        "После острой травмы мягких тканей хватает 1–3 дней покоя",
        "Потом постепенно нагружать",
        "Рано начинать кардио"
      ],
      "fd": "Растяжение или подвернул ногу: 1–3 дня поберечься, потом осторожно нагружать.",
      "q": {
        "q": "Сколько разгружать после острого растяжения по концепции PEACE & LOVE?",
        "r": "1–3 дня",
        "w": [
          "3 месяца",
          "Совсем не разгружать",
          "1 год"
        ]
      }
    }
  },
  "CAR-101": {
    "u": "Зона 2 и базовая выносливость: что известно",
    "sl": {
      "h": "Объём строит митохондрии, интенсивность делает их сильнее",
      "kn": [
        "3–5×",
        "базовых тренировки в неделю плюс интервалы"
      ],
      "b": [
        "Больше объёма — больше митохондрий",
        "Очень тяжёлые интервалы (≥ 90 %) сильнее всего улучшают их работу",
        "Лучше всего сочетать то и другое"
      ],
      "fd": "3–5 лёгких базовых тренировок в неделю плюс одна тяжёлая интервальная.",
      "q": {
        "q": "Что в первую очередь определяет, сколько митохондрий образуется в мышце?",
        "r": "Объём тренировок",
        "w": [
          "Только интенсивность",
          "Время суток",
          "Растяжка"
        ]
      }
    }
  },
  "CAR-102": {
    "u": "Зона 2 и базовая выносливость: что известно",
    "sl": {
      "h": "Тренированным мало только лёгкой работы",
      "kn": [
        "9 недель",
        "только база: VO₂max не растёт"
      ],
      "b": [
        "Хорошо тренированные спортсмены на одной базе не прогрессировали",
        "Даже при 10–20 часах в неделю",
        "Им нужны и тяжёлые интервалы"
      ],
      "fd": "Ты уже в форме: делай около 20 % кардио в виде тяжёлых интервалов.",
      "q": {
        "q": "Что произошло с хорошо тренированными спортсменами за 9 недель только лёгкой базы?",
        "r": "VO₂max больше не рос",
        "w": [
          "VO₂max вырос вдвое",
          "Они стали заметно медленнее",
          "Они набрали 10 кг мышц"
        ]
      }
    }
  },
  "CAR-103": {
    "u": "Рост VO₂max: HIIT и равномерные тренировки",
    "sl": {
      "h": "HIIT поднимает VO₂max чуть сильнее",
      "kn": [
        "+1,2",
        "мл/кг/мин больше, чем равномерная работа"
      ],
      "b": [
        "И HIIT, и равномерная работа заметно повышают VO₂max",
        "HIIT — немного сильнее",
        "Изучено у людей 18–45 лет"
      ],
      "fd": "Если времени мало, а цель — повысить VO₂max, включи 2–3 HIIT-тренировки в неделю на 4–12 недель.",
      "q": {
        "q": "Какой метод чуть сильнее повышает VO₂max у здоровых взрослых?",
        "r": "HIIT",
        "w": [
          "Лёгкая равномерная работа",
          "Ни тот, ни другой",
          "Растяжка"
        ]
      }
    }
  },
  "CAR-104": {
    "u": "Рост VO₂max (протокол 4×4 минуты)",
    "sl": {
      "h": "Классика 4×4",
      "kn": [
        "4 × 4 мин",
        "при 90–95 % ЧССмакс"
      ],
      "b": [
        "4 интервала по 4 минуты, 3 минуты активного отдыха",
        "Сильнее повышает VO₂max, чем пороговая или лёгкая тренировка",
        "Альтернатива: 15 с работы, 15 с отдыха"
      ],
      "fd": "3 раза в неделю 4 × 4 минуты при 90–95 % максимального пульса, между ними 3 минуты легко.",
      "q": {
        "q": "Как выглядит классический протокол 4×4?",
        "r": "4 × 4 минуты при 90–95 % ЧССмакс с 3 минутами активного отдыха",
        "w": [
          "4 спринта по 4 секунды",
          "4 часа легко",
          "4 × 40 минут при 50 %"
        ]
      }
    }
  },
  "CAR-105": {
    "u": "Поляризованное и пороговое распределение интенсивности",
    "sl": {
      "h": "Поляризованно: много легко, немного очень тяжело",
      "kn": [
        "75–80 %",
        "времени в зоне 1"
      ],
      "b": [
        "У тренированных поляризованная схема даёт чуть больше",
        "Много легко, мало средне, 15–20 % очень тяжело",
        "Проверено при VO₂max выше 50"
      ],
      "fd": "Хорошо тренирован: большую часть времени легко, пятую часть тяжело, мало в середине.",
      "q": {
        "q": "Что характерно для поляризованной тренировки?",
        "r": "Много лёгкой и немного очень тяжёлой работы, мало средней",
        "w": [
          "Всё в среднем диапазоне",
          "Только очень тяжёлые тренировки",
          "Только силовые"
        ]
      }
    }
  },
  "CAR-115": {
    "u": "VO₂max и здоровье/смертность",
    "sl": {
      "h": "Выносливость продлевает жизнь",
      "kn": [
        "122 007",
        "взрослых исследовано"
      ],
      "b": [
        "Чем выше форма, тем ниже смертность",
        "Без верхней границы, выигрывают даже очень тренированные",
        "Низкая форма — сильный фактор риска"
      ],
      "fd": "Выносливость — одно из лучших вложений в продолжительность твоей жизни.",
      "q": {
        "q": "Есть ли у очень высокой выносливости точка, после которой она вредит?",
        "r": "Нет, вредного эффекта не нашли",
        "w": [
          "Да, с VO₂max 40",
          "Да, марафонцы умирают раньше",
          "Да, с 3 тренировок в неделю"
        ]
      }
    }
  },
  "EIN-101": {
    "u": "Потеря мышц и силы на паузе",
    "sl": {
      "h": "Мышцы держатся и при малом объёме",
      "kn": [
        "1/9",
        "объёма хватает молодым"
      ],
      "b": [
        "Молодые сохраняют мышцы при девятой части объёма",
        "Пожилые при этом теряют толщину мышечных волокон",
        "Сила сохраняется у обеих групп"
      ],
      "fd": "Мало времени? До 35 лет для поддержания хватает 1 тренировки в неделю, после 60 лучше 2.",
      "q": {
        "q": "Кому нужно больше тренировок, чтобы сохранить мышцы?",
        "r": "Пожилым",
        "w": [
          "Молодым",
          "Тренировки не нужны никому",
          "Детям"
        ]
      }
    }
  },
  "EIN-102": {
    "u": "Потеря мышц и силы на паузе",
    "sl": {
      "h": "Кто тренировался тяжело, держит форму дольше",
      "kn": [
        "−18–27 %",
        "силы после 12 недель перерыва"
      ],
      "b": [
        "После перерывов сила у пожилых заметно падает",
        "Кто раньше тренировался тяжело, остаётся на более высоком уровне",
        "80 % вместо 60 % 1ПМ дали разницу"
      ],
      "fd": "После 65 и долгого перерыва: при возвращении снизь веса примерно на четверть.",
      "q": {
        "q": "Какая группа сохранила больше силы после перерыва?",
        "r": "Группа, которая раньше тренировалась с высокой интенсивностью",
        "w": [
          "Группа, которая раньше не тренировалась",
          "Группа с очень лёгкими весами",
          "Нет разницы"
        ]
      }
    }
  },
  "EIN-103": {
    "u": "Потеря мышц и силы на паузе",
    "sl": {
      "h": "Как быстро уходят мышцы, неясно",
      "kn": [
        "16–24 недели",
        "преимущество в силе сохраняется"
      ],
      "b": [
        "Точный ход потери мышц плохо изучен",
        "Преимущество в силе сохранялось даже после долгих перерывов",
        "Не пользуйся жёсткой формулой потерь"
      ],
      "fd": "После долгого перерыва: начни с теста, а не с расчётной формулы.",
      "q": {
        "q": "Насколько изучен точный ход потери мышц в перерывах?",
        "r": "Недостаточно",
        "w": [
          "С точностью до дня",
          "Тысячами исследований",
          "Это совсем не важно"
        ]
      }
    }
  },
  "EIN-107": {
    "u": "Силовые после 50 и 65",
    "sl": {
      "h": "И в возрасте: тяжело работает лучше всего",
      "kn": [
        "> 70 %",
        "от 1ПМ для большей силы"
      ],
      "b": [
        "Высокая интенсивность даёт пожилым больше силы, чем лёгкая",
        "Повышать после 4–8 недель привыкания",
        "При отсутствии ограничений"
      ],
      "fd": "Старше и уже втянулся: смело тренируйся выше 70 % от максимума.",
      "q": {
        "q": "Какая интенсивность даёт людям старше 65 наибольший прирост силы?",
        "r": "Высокая, выше 70 % 1ПМ",
        "w": [
          "Ниже 30 % 1ПМ",
          "Совсем без веса",
          "Только растяжка"
        ]
      }
    }
  },
  "PLY-112": {
    "u": "Плиометрика для видов спорта на выносливость",
    "sl": {
      "h": "Прыжки делают бег экономичнее",
      "kn": [
        "2–8 %",
        "лучше экономичность бега"
      ],
      "b": [
        "Прыжковая и силовая тренировка улучшают экономичность бега",
        "Без прибавки веса тела",
        "VO₂max не страдает"
      ],
      "fd": "Бегунам и гибридным атлетам: 1–2 дополнительные силовые или прыжковые тренировки в неделю.",
      "q": {
        "q": "Что происходит с экономичностью бега, если бегуны добавляют прыжки и силовую?",
        "r": "Улучшается на 2–8 %",
        "w": [
          "Ухудшается из-за лишнего веса",
          "Ничего",
          "Только спринт становится хуже"
        ]
      }
    }
  },
  "KRA-105": {
    "u": "Пробел в данных: минимальная доза для женщин и становой тяги",
    "sl": {
      "h": "Пробел: минимальная доза для женщин и становой тяги",
      "kn": [
        "0",
        "исследований о тренированных женщинах и становой"
      ],
      "b": [
        "Исследований о минимальной дозе для становой тяги нет",
        "Для тренированных женщин данных тоже не хватает",
        "По опыту специалистов, тяжёлые подходы на 1–5 повторений делают 1 раз в неделю"
      ],
      "fd": "Здесь приложение использует экспертные значения: 2–3 тяжёлых подхода становой в неделю, с пометкой «опыт практиков».",
      "q": {
        "q": "Что известно о минимальной дозе становой тяги для тренированных женщин?",
        "r": "Контролируемых исследований пока нет",
        "w": [
          "Хватит 1 повторения в месяц",
          "Минимум 20 подходов в неделю",
          "Женщинам нельзя делать становую"
        ]
      }
    }
  },
  "KRA-116": {
    "u": "Оценка 1ПМ по субмаксимальным подходам",
    "sl": {
      "h": "Оценка 1ПМ: лучше всего по 2–5 повторениям",
      "kn": [
        "≈ 5 %",
        "погрешность при 2–5 повторениях"
      ],
      "b": [
        "По подходам на 2–5 повторений максимум оценивается хорошо",
        "Больше 10 повторений — оценка становится неточной",
        "В становой тяге все формулы занижают на 9–14 %"
      ],
      "fd": "Приложение оценивает твой e1RM только по подходам не больше 10 повторений и учитывает RPE.",
      "q": {
        "q": "По каким подходам 1ПМ оценивается точнее всего?",
        "r": "По подходам на 2–5 повторений",
        "w": [
          "По подходам на 20 повторений",
          "По разминочным подходам",
          "По подходам с весом тела"
        ]
      }
    }
  },
  "PER-112": {
    "u": "Делоуд: результаты эксперимента с облегчённой неделей (Coleman 2024)",
    "sl": {
      "h": "Разгрузка: тренироваться легче, а не отдыхать",
      "kn": [
        "от −30 до −50 %",
        "подходов в разгрузочную неделю"
      ],
      "b": [
        "Полная неделя отдыха отняла силу ног",
        "Мышцы и взрывная сила не пострадали",
        "Активная разгрузка с меньшим числом подходов — лучший выбор"
      ],
      "fd": "В разгрузочные недели ты продолжаешь тренироваться, просто примерно с вдвое меньшим числом подходов.",
      "q": {
        "q": "Что лучше в разгрузочную неделю: полный отдых или меньше подходов?",
        "r": "Продолжать тренироваться с заметно меньшим числом подходов",
        "w": [
          "Полный отдых",
          "Больше подходов, чем обычно",
          "Только кардио"
        ]
      }
    }
  },
  "PER-113": {
    "u": "Делоуд на практике: как часто и как проводить",
    "sl": {
      "h": "Так делают опытные атлеты",
      "kn": [
        "каждые 4–6 недель",
        "5–7 дней разгрузки"
      ],
      "b": [
        "Опытные делают разгрузку каждые 4–6 недель или при застое",
        "Объём −30–50 %, усилие 3–4 RIR",
        "Упражнения и частота не меняются"
      ],
      "fd": "Приложение планирует разгрузку на 4-й и 8-й неделе и дополнительно предлагает её, если ты застрял.",
      "q": {
        "q": "Как часто в среднем опытные силовики планируют разгрузочную неделю?",
        "r": "Примерно каждые 4–6 недель",
        "w": [
          "Через неделю",
          "Раз в год",
          "Никогда"
        ]
      }
    }
  },
  "FAT-115": {
    "u": "Шаги и NEAT",
    "sl": {
      "h": "Расход за день может вырасти меньше, чем расход на тренировку",
      "kn": [
        "< 9 %",
        "общего расхода объясняется активностью"
      ],
      "b": [
        "Общий расход растёт только до умеренной активности",
        "При очень большом объёме спорта тело компенсирует",
        "Не съедай обратно весь расход по часам"
      ],
      "fd": "Не съедай обратно все калории со спортивных часов.",
      "q": {
        "q": "Что происходит с общим расходом при очень большом объёме спорта?",
        "r": "Он перестаёт расти линейно, тело компенсирует",
        "w": [
          "Всегда удваивается",
          "Падает до нуля",
          "Растёт без предела"
        ]
      }
    }
  },
  "REC-106": {
    "u": "Противоречивые данные о росте мышц в дефиците энергии",
    "sl": {
      "h": "Дефицит и рост мышц: противоречие",
      "kn": [
        "200–300 ккал",
        "идеальный дефицит для рекомпозиции"
      ],
      "b": [
        "В среднем рост мышц останавливается при дефиците 500 ккал",
        "Отдельные исследования показывают прирост и при дефиците 19–40 %",
        "При большом количестве белка и тяжёлых тренировках"
      ],
      "fd": "Для рекомпозиции: дефицит 200–300 ккал в день. Больше — только с большим количеством белка и тяжёлыми тренировками.",
      "q": {
        "q": "Какой дневной дефицит считается идеальным для одновременного роста мышц и сжигания жира?",
        "r": "Примерно 200–300 ккал",
        "w": [
          "1 500 ккал",
          "0 ккал, только профицит",
          "Больше 2 000 ккал"
        ]
      }
    }
  },
  "CON-106": {
    "u": "Интервал между тренировками (6 и 24 часа)",
    "sl": {
      "h": "Целый день между ними — ещё лучше",
      "kn": [
        "24 ч",
        "лучше, чем 0 или 6 ч"
      ],
      "b": [
        "При интервале 24 ч больше выросли взрывная сила и VO₂max",
        "Изучалось на регбистах-любителях",
        "Для амбициозных целей — оба стимула в разные дни"
      ],
      "fd": "Хочешь максимум выносливости и взрывной силы: силовая и кардио в разные дни.",
      "q": {
        "q": "Какой интервал дал лучшие результаты для VO₂max и взрывной силы?",
        "r": "24 часа",
        "w": [
          "0 часов",
          "6 часов",
          "1 час"
        ]
      }
    }
  },
  "CON-107": {
    "u": "Порядок внутри тренировки",
    "sl": {
      "h": "Сначала силовая, потом кардио",
      "kn": [
        "+6,9 %",
        "больше силы ног"
      ],
      "b": [
        "В одной тренировке силовая перед выносливостью даёт больше силы ног",
        "VO₂max от этого не страдает",
        "Рост мышц одинаковый"
      ],
      "fd": "Совмещаешь оба в одной тренировке: сначала железо, потом беговая дорожка.",
      "q": {
        "q": "Какой порядок в комбинированной тренировке лучше для силы?",
        "r": "Силовая перед тренировкой выносливости",
        "w": [
          "Выносливость перед силовой",
          "Чередовать каждую минуту",
          "Неважно, одинаково"
        ]
      }
    }
  },
  "CON-111": {
    "u": "Различия между полами (женщины и мужчины)",
    "sl": {
      "h": "Женщины: кардио не отнимает силу",
      "kn": [
        "59",
        "исследований, 1346 участников"
      ],
      "b": [
        "У мужчин кардио немного тормозит силу ног",
        "У женщин — нет",
        "Сила верха тела, взрывная сила и VO₂max: разницы нет"
      ],
      "fd": "Если ты женщина, можешь сочетать силу и выносливость без потерь.",
      "q": {
        "q": "У кого не было эффекта интерференции на силу ног?",
        "r": "У женщин",
        "w": [
          "У мужчин",
          "У обоих одинаково",
          "Только у пожилых"
        ]
      }
    }
  },
  "CON-112": {
    "u": "Изменение VO₂max в зависимости от подготовки на выносливость",
    "sl": {
      "h": "У новичков силовые могут замедлить рост VO₂max",
      "kn": [
        "нетренированные",
        "меньший прирост VO₂max"
      ],
      "b": [
        "У нетренированных людей совмещение силовых и кардио даёт меньший прирост VO₂max",
        "Тренированным спортсменам на выносливость это не мешает",
        "Новичкам с целью на выносливость: дозируй силовую умеренно"
      ],
      "fd": "Ты новичок в спорте и цель — выносливость: начни с умеренной силовой.",
      "q": {
        "q": "У кого VO₂max растёт медленнее при добавлении силовых тренировок?",
        "r": "Нетренированные люди",
        "w": [
          "Высокотренированные спортсмены на выносливость",
          "Никто",
          "Все одинаково"
        ]
      }
    }
  },
  "CON-113": {
    "u": "Силовая для экономичности бега и выносливости",
    "sl": {
      "h": "Силовая делает бегунов быстрее",
      "kn": [
        "≥ 80 %",
        "1ПМ, 2–3 раза в неделю"
      ],
      "b": [
        "Тяжёлая и взрывная работа улучшает экономичность бега и спринт",
        "Результат в гонке на время растёт",
        "Без прибавки веса тела и без потерь в VO₂max"
      ],
      "fd": "Бегунам: 8–12 недель по 2–3 силовые тренировки в неделю с тяжёлыми весами.",
      "q": {
        "q": "Что происходит с весом тела бегунов от тяжёлой силовой?",
        "r": "Не растёт",
        "w": [
          "Сильно растёт",
          "Сильно падает",
          "Его нельзя измерить"
        ]
      }
    }
  },
  "CON-114": {
    "u": "Доступность энергии и дефицит калорий при силовой",
    "sl": {
      "h": "В большом дефиците мышцы не растут",
      "kn": [
        "−500 ккал",
        "в день: рост мышц останавливается"
      ],
      "b": [
        "Дефицит калорий тормозит рост мышц",
        "Примерно с 500 ккал дефицита в день мышцы почти не растут",
        "Сила при этом продолжает расти"
      ],
      "fd": "Хочешь растить мышцы и худеть: держи дефицит ниже 500 ккал в день.",
      "q": {
        "q": "С какого дневного дефицита в среднем останавливается рост мышц?",
        "r": "Примерно с 500 ккал",
        "w": [
          "С 50 ккал",
          "С 2 000 ккал",
          "Никогда"
        ]
      }
    }
  },
  "SUP-114": {
    "u": "Железо у спортсменок: дефицит железа без анемии (IDNA)",
    "sl": {
      "h": "Железо помогает при низком ферритине",
      "kn": [
        "≤ 20 мкг/л",
        "ферритин: результат растёт с железом"
      ],
      "b": [
        "Дефицит железа без анемии у спортсменок на выносливость встречается часто",
        "Добавки железа повышали уровень ферритина, гемоглобина и VO₂max",
        "Рост результатов — прежде всего при ферритине до 20"
      ],
      "fd": "Постоянная усталость на тренировках выносливости? Проверь ферритин у врача, прежде чем принимать железо.",
      "q": {
        "q": "При каком уровне ферритина железо стабильно улучшало результаты?",
        "r": "При 20 мкг/л и ниже",
        "w": [
          "Выше 200 мкг/л",
          "При любом уровне",
          "Никогда"
        ]
      }
    }
  },
  "GES-103": {
    "u": "Давление",
    "sl": {
      "h": "Тренировки на выносливость и суточное давление",
      "kn": [
        "76 %",
        "рейтинг для HIIT"
      ],
      "b": [
        "HIIT и комбинированные тренировки надёжнее всего снижают суточное давление",
        "Чисто силовые заметны в основном при измерении в покое",
        "Данные здесь неоднозначны"
      ],
      "fd": "Гипертония: выносливость или HIIT всегда должны быть в плане.",
      "q": {
        "q": "Что надёжнее всего снижает суточное давление?",
        "r": "HIIT, выносливость или комбинированные тренировки",
        "w": [
          "Только изометрия",
          "Только силовые",
          "Только растяжка"
        ]
      }
    }
  },
  "GES-109": {
    "u": "Инсулин",
    "sl": {
      "h": "При диабете: HIIT лучше после обеда",
      "kn": [
        "11",
        "мужчин в исследовании"
      ],
      "b": [
        "После HIIT во второй половине дня уровень сахара за сутки снижался сильнее",
        "Утром у некоторых он даже рос",
        "Очень маленькое исследование, у здоровых разницы нет"
      ],
      "fd": "Диабет 2-го типа и скачки сахара после утреннего HIIT? Перенеси на вторую половину дня.",
      "q": {
        "q": "Когда HIIT лучше действовал на сахар у мужчин с диабетом 2-го типа?",
        "r": "После обеда",
        "w": [
          "Рано утром",
          "Ночью",
          "Разницы не было"
        ]
      }
    }
  },
  "PSY-107": {
    "u": "Формирование привычек (привычки, планы «если — то»)",
    "sl": {
      "h": "Планы «если — то» работают",
      "kn": [
        "0,3",
        "эффект на активность"
      ],
      "b": [
        "Конкретный план, например «В понедельник в 18:00 иду на тренировку», помогает больше двигаться",
        "С напоминаниями работает лучше",
        "Без освежения эффект слабеет"
      ],
      "fd": "Для каждой тренировки определи: когда, где, что — и что делать при препятствии.",
      "q": {
        "q": "Что такое план «если — то»?",
        "r": "Жёсткая связка ситуации и действия",
        "w": [
          "План питания",
          "Цель на соревнования",
          "Приложение для тренировок"
        ]
      }
    }
  },
  "TST-111": {
    "u": "Полевые тесты выносливости (Купер, гребля на 2 000 м, Yo-Yo, 30-15 IFT)",
    "sl": {
      "h": "Тест Купера хорошо оценивает VO₂max",
      "kn": [
        "r = 0,78",
        "связь с лабораторией"
      ],
      "b": [
        "12 минут бежать как можно дальше",
        "Один из лучших полевых тестов",
        "Всё равно остаётся оценкой"
      ],
      "fd": "Без лаборатории: тест Купера для проверки выносливости.",
      "q": {
        "q": "Какой полевой тест особенно хорошо оценивает VO₂max?",
        "r": "12-минутный тест Купера",
        "w": [
          "Спринт на 10 м",
          "Тест 1ПМ",
          "Прыжковый тест"
        ]
      }
    }
  },
  "TST-112": {
    "u": "Полевые тесты выносливости (Купер, гребля на 2 000 м, Yo-Yo, 30-15 IFT)",
    "sl": {
      "h": "2 000 м гребли проверяют не только выносливость",
      "kn": [
        "21–30 %",
        "анаэробная доля"
      ],
      "b": [
        "Время зависит от VO₂max и лактатного порога",
        "Четверть энергии — анаэробная",
        "У новичков тест сильно колеблется"
      ],
      "fd": "Новичкам в гребле лучше тесты короче 2 000 м.",
      "q": {
        "q": "Что в основном определяет время на 2 000 м гребли?",
        "r": "Выносливость плюс сила",
        "w": [
          "Только сила рук",
          "Только вес тела",
          "Только техника"
        ]
      }
    }
  },
  "TST-113": {
    "u": "Полевые тесты выносливости (Купер, гребля на 2 000 м, Yo-Yo, 30-15 IFT)",
    "sl": {
      "h": "Тест Yo-Yo для игровиков",
      "kn": [
        "8 %",
        "типичный разброс"
      ],
      "b": [
        "Измеряет восстановление между интенсивными пробежками",
        "Сравнивай значения по виду спорта и лиге",
        "Разница меньше 8 % ненадёжна"
      ],
      "fd": "Тест Yo-Yo: сравнивай только со значениями своего вида спорта.",
      "q": {
        "q": "С чем сравнивать результат теста Yo-Yo?",
        "r": "Со значениями твоего вида спорта и лиги",
        "w": [
          "С марафонцами",
          "С твоим 1ПМ",
          "Со временем в плавании"
        ]
      }
    }
  },
  "TST-114": {
    "u": "Полевые тесты выносливости (Купер, гребля на 2 000 м, Yo-Yo, 30-15 IFT)",
    "sl": {
      "h": "Тест 30-15 задаёт интервалы",
      "kn": [
        "0,5",
        "км/ч = одна ступень"
      ],
      "b": [
        "Одновременно измеряет выносливость, смену направления и восстановление",
        "Хорош для выбора темпа интервалов",
        "Реальный прогресс — только на 1–2 ступени больше"
      ],
      "fd": "Задавай интервалы по результату теста 30-15.",
      "q": {
        "q": "Для чего особенно подходит тест 30-15?",
        "r": "Для выбора темпа интервалов",
        "w": [
          "Для измерения максимальной силы",
          "Для измерения мобильности",
          "Для оценки жира"
        ]
      }
    }
  },
  "TST-115": {
    "u": "Оценка VO₂max часами",
    "sl": {
      "h": "VO₂max по часам: только для тренда",
      "kn": [
        "±10",
        "мл/кг/мин отклонение"
      ],
      "b": [
        "Значения из пробежек точнее, чем в покое",
        "Для конкретного человека часы часто сильно ошибаются",
        "Хорошо для динамики за месяцы"
      ],
      "fd": "VO₂max по часам: следи за трендом, не переоценивай число.",
      "q": {
        "q": "Для чего годится оценка VO₂max твоими часами?",
        "r": "Для динамики за долгое время",
        "w": [
          "Как точное лабораторное значение",
          "Для медицинских диагнозов",
          "Нигде"
        ]
      }
    }
  },
  "SPD-111": {
    "u": "Спринт и травмы задней поверхности бедра",
    "sl": {
      "h": "Резко больше спринтов: опасность для бицепса бедра",
      "kn": [
        "6×",
        "выше риск растяжения"
      ],
      "b": [
        "Опасен не объём, а быстрый рост",
        "Особенно за неделю до этого",
        "Опытные игроки были защищены"
      ],
      "fd": "Наращивай объём спринтов постепенно, без скачков от недели к неделе.",
      "q": {
        "q": "Что сильнее всего повышает риск растяжения бицепса бедра?",
        "r": "Резкий рост быстрого бега",
        "w": [
          "Регулярные спринты",
          "Много ходьбы",
          "Растяжка"
        ]
      }
    }
  },
  "SPD-112": {
    "u": "Спринт и травмы задней поверхности бедра",
    "sl": {
      "h": "Регулярный быстрый бег защищает",
      "kn": [
        "7–8",
        "спринтов на максимуме в неделю максимум"
      ],
      "b": [
        "И слишком мало, и слишком много спринтов повышают риск",
        "Каждую неделю несколько спринтов быстрее 90 % максимума",
        "Хорошая общая форма защищает"
      ],
      "fd": "Каждую неделю несколько настоящих спринтов — не много и не мало.",
      "q": {
        "q": "Что по данным исследований защищает бицепс бедра?",
        "r": "Регулярные дозированные спринты на максимуме",
        "w": [
          "Полностью избегать спринтов",
          "Каждый день спринты на максимум",
          "Только растяжка"
        ]
      }
    }
  },
  "SPD-113": {
    "u": "Спринт и травмы задней поверхности бедра",
    "sl": {
      "h": "Спринт лучше всего укрепляет бицепс бедра",
      "kn": [
        "57 %",
        "растяжений случаются в спринте"
      ],
      "b": [
        "Спринт удлиняет мышечные пучки сильнее, чем скандинавские сгибания",
        "Одновременно он улучшает технику спринта",
        "Скандинавские сгибания остаются хорошим дополнением"
      ],
      "fd": "Защита бицепса бедра: спринты плюс скандинавские сгибания.",
      "q": {
        "q": "Что удлиняет пучки бицепса бедра сильнее, чем скандинавские сгибания?",
        "r": "Прогрессивная спринтерская тренировка",
        "w": [
          "Растяжка",
          "Велосипед",
          "Жим ногами"
        ]
      }
    }
  },
  "SPD-114": {
    "u": "Спринт в недельном плане командных видов спорта",
    "sl": {
      "h": "После спринтов восстанавливайся 72 часа",
      "kn": [
        "48–72 ч",
        "до полного восстановления"
      ],
      "b": [
        "Тяжёлые спринтерские и ножные тренировки утомляют надолго",
        "При усталости таз наклоняется, страдает бицепс бедра",
        "Усталость сидит в мышце"
      ],
      "fd": "Между двумя максимальными спринтерскими или ножными тренировками — 2–3 дня.",
      "q": {
        "q": "Сколько нужно на полное восстановление после тяжёлой спринтерской тренировки?",
        "r": "До 72 часов",
        "w": [
          "2 часа",
          "12 часов",
          "Неделя"
        ]
      }
    }
  },
  "SPD-115": {
    "u": "Спринт в недельном плане командных видов спорта",
    "sl": {
      "h": "Спринты в начале игровой недели",
      "kn": [
        "MD-4",
        "день для спринтов"
      ],
      "b": [
        "Больше всего спринтов — за 3–4 дня до матча",
        "Перед матчем объём снижают",
        "Запасным нужны компенсирующие спринты"
      ],
      "fd": "Игровая неделя: спринты за 3–4 дня до матча, потом меньше.",
      "q": {
        "q": "Когда в игровой неделе ставить спринты?",
        "r": "За 3–4 дня до матча",
        "w": [
          "За день до матча",
          "Сразу после матча",
          "Нигде"
        ]
      }
    }
  },
  "ALG-111": {
    "u": "Адаптивная оценка расхода энергии",
    "sl": {
      "h": "Лучшая стартовая формула для основного обмена",
      "kn": [
        "70–82 %",
        "попадают в ±10 %"
      ],
      "b": [
        "Миффлин — Сан Жеор попадает чаще всего",
        "У отдельных людей ошибка всё равно заметная",
        "Поэтому приложение подстраивает потребность по реальным данным"
      ],
      "fd": "Формула — только старт. Через 2 недели приложение считает по твоим данным.",
      "q": {
        "q": "Какая формула надёжнее всего оценивает основной обмен?",
        "r": "Миффлин — Сан Жеор",
        "w": [
          "Харрис — Бенедикт",
          "Вес тела × 30",
          "Ни одна не попадает"
        ]
      }
    }
  },
  "ALG-112": {
    "u": "Адаптивная оценка расхода энергии",
    "sl": {
      "h": "Правило 7 700 ккал не работает",
      "kn": [
        "≈ 100 %",
        "прогноз похудения завышен"
      ],
      "b": [
        "Организм подстраивает свой расход",
        "Вода и гликоген раскачивают весы",
        "Поэтому важен тренд, а не цифра за день"
      ],
      "fd": "Взвешивайся часто и смотри на недельный тренд, а не на отдельные дни.",
      "q": {
        "q": "Почему правило «7 700 ккал на килограмм» завышает потерю веса?",
        "r": "Организм подстраивает расход энергии",
        "w": [
          "Потому что мышцы тяжелее",
          "Потому что вода не важна",
          "Оно точное"
        ]
      }
    }
  },
  "ALG-116": {
    "u": "Данные часов против золотого стандарта",
    "sl": {
      "h": "60 секунд утром хватает для HRV",
      "kn": [
        "60 s",
        "лёжа после пробуждения"
      ],
      "b": [
        "Короткий замер равен 5-минутному",
        "RMSSD — лучший показатель",
        "Лёжа колебания меньше"
      ],
      "fd": "Меряй HRV каждое утро одинаково: 1 минута, лёжа, сразу после пробуждения.",
      "q": {
        "q": "Сколько минимум должен длиться утренний замер HRV, чтобы ему можно было верить?",
        "r": "Около 60 секунд",
        "w": [
          "10 минут",
          "1 час",
          "5 секунд"
        ]
      }
    }
  },
  "ALG-118": {
    "u": "Данные часов против золотого стандарта",
    "sl": {
      "h": "VO₂max с часов — это оценка",
      "kn": [
        "≈ 7 %",
        "средняя ошибка"
      ],
      "b": [
        "Годится для тренда",
        "Не так точно, как лабораторный тест",
        "Небольшое исследование со спортсменами"
      ],
      "fd": "Смотри на динамику VO₂max, а не на точную цифру.",
      "q": {
        "q": "Как правильно пользоваться VO₂max со спортивных часов?",
        "r": "Как трендом во времени",
        "w": [
          "Как точным лабораторным значением",
          "Совсем не завышают",
          "Только раз в год"
        ]
      }
    }
  },
  "ALG-120": {
    "u": "Оценки готовности и восстановления",
    "sl": {
      "h": "Тренировки по HRV помогают выносливости",
      "kn": [
        "0,30",
        "эффект на пороги"
      ],
      "b": [
        "Лучше показатели на порогах",
        "Меньше людей без прогресса",
        "На максимуме почти без разницы"
      ],
      "fd": "HRV низкая? Лучше тренируйся легко, а не интенсивно.",
      "q": {
        "q": "Что, по исследованиям, даёт тренировка на выносливость по HRV?",
        "r": "Лучше пороги и меньше тех, кто не прогрессирует",
        "w": [
          "Намного выше VO₂max",
          "Ничего",
          "Больше мышц"
        ]
      }
    }
  },
  "ALG-121": {
    "u": "Оценки готовности и восстановления",
    "sl": {
      "h": "После силовой HRV говорит не всё",
      "kn": [
        "24–48",
        "часов разное восстановление"
      ],
      "b": [
        "HRV восстанавливается быстрее мышц",
        "Прыгучести и крепатуре нужно больше времени",
        "Учитывай самочувствие и результаты"
      ],
      "fd": "После дня ног твоё самочувствие важнее хорошей HRV.",
      "q": {
        "q": "Что после тяжёлой силовой часто восстанавливается быстрее всего?",
        "r": "HRV",
        "w": [
          "Прыгучесть",
          "Крепатура",
          "Всё одинаково"
        ]
      }
    }
  },
  "ALG-123": {
    "u": "Модели тренировочной нагрузки",
    "sl": {
      "h": "Hyrox по HRV: тот же прогресс, меньше мучений",
      "kn": [
        "−13,6",
        "меньше тяжёлых дней"
      ],
      "b": [
        "Тот же прогресс в силе, выносливости и составе тела",
        "При заметно меньшем числе тяжёлых дней",
        "6-недельное исследование с 55 участниками"
      ],
      "fd": "Гибридный тренинг: ставь тяжёлые дни по HRV и самочувствию.",
      "q": {
        "q": "Что показал функциональный тренинг по HRV по сравнению с жёстким планом?",
        "r": "Тот же прогресс при меньшем числе тяжёлых дней",
        "w": [
          "Больше травм",
          "Хуже сила",
          "Нет прогресса"
        ]
      }
    }
  },
  "FAT-120": {
    "u": "Позиция ISSN по снижению веса (2026)",
    "sl": {
      "h": "Худеть по плану: 0,5–1 % в неделю",
      "kn": [
        "0,5–1 %",
        "веса тела в неделю"
      ],
      "b": [
        "Плюс много белка: 1,6–2,2 г на кг",
        "Силовые тренировки берегут мышцы",
        "Меньше 1 200 ккал — только под контролем специалиста"
      ],
      "fd": "Выбирай темп от 0,5 до 1 % своего веса в неделю.",
      "q": {
        "q": "Какой темп похудения ISSN рекомендует активным людям?",
        "r": "0,5–1 % веса тела в неделю",
        "w": [
          "2–3 % в неделю",
          "5 кг в неделю",
          "Как можно быстрее"
        ],
        "d": {}
      }
    }
  },
  "FAT-121": {
    "u": "Темп похудения у стройных спортсменов",
    "sl": {
      "h": "Чем ты стройнее, тем медленнее",
      "kn": [
        "0,25–0,5 %",
        "в неделю при очень низком проценте жира"
      ],
      "b": [
        "Стройные при похудении теряют больше мышц",
        "Поэтому чем меньше жира, тем медленнее темп",
        "Больше белка дополнительно защищает"
      ],
      "fd": "Уже очень стройный? Тогда лучше 0,25–0,5 % в неделю.",
      "q": {
        "q": "Что стоит делать очень стройным спортсменам при похудении?",
        "r": "Худеть медленнее и есть больше белка",
        "w": [
          "Худеть быстрее",
          "Убрать белок",
          "Бросить силовые"
        ],
        "d": {}
      }
    }
  },
  "FAT-122": {
    "u": "Предел Альперта для расхода жира",
    "sl": {
      "h": "«Предел Альперта» не годится как цель",
      "kn": [
        "69 ккал",
        "на кг жира в день по модели"
      ],
      "b": [
        "Расчётная модель по старым исследованиям голодания",
        "Без силовых и без большого количества белка",
        "Нужен точный процент жира"
      ],
      "fd": "Приложение считает в % от веса тела, а не по формуле Альперта.",
      "q": {
        "q": "Почему приложение не использует формулу Альперта как цель?",
        "r": "Она основана на старых данных о голодании и требует точного процента жира",
        "w": [
          "Она слишком медленная",
          "Она только для женщин",
          "Она запрещена"
        ],
        "d": {}
      }
    }
  },
  "FAT-123": {
    "u": "Ранняя фаза: вода и гликоген",
    "sl": {
      "h": "Первые дни обманчивы",
      "kn": [
        "70 %",
        "раннего снижения — это вода"
      ],
      "b": [
        "Сначала уходят в основном вода и гликоген",
        "Примерно через 3 недели — уже в основном жир",
        "Поэтому тренд имеет значение только с 3-й недели"
      ],
      "fd": "Вес резко упал в первую неделю? Обычно это потеря воды.",
      "q": {
        "q": "Из чего в основном состоит снижение веса в первые дни диеты?",
        "r": "Из воды и гликогена",
        "w": [
          "Из жира",
          "Из костей",
          "Из мышц"
        ],
        "d": {}
      }
    }
  },
  "FAT-124": {
    "u": "Адаптивный термогенез и масса органов",
    "sl": {
      "h": "В дефиците организм экономит энергию",
      "kn": [
        "−108 ккал",
        "адаптация через 3 недели"
      ],
      "b": [
        "Основной обмен падает сильнее, чем ожидалось",
        "Даже органы немного уменьшаются",
        "Жёсткий дефицит это усиливает"
      ],
      "fd": "Умеренный дефицит вместо жёсткой диеты: меньше адаптации, больше результата.",
      "q": {
        "q": "Что происходит с основным обменом на жёсткой диете?",
        "r": "Он падает сильнее, чем объясняет снижение веса",
        "w": [
          "Он растёт",
          "Он не меняется",
          "Он удваивается"
        ],
        "d": {}
      }
    }
  },
  "FAT-125": {
    "u": "Риск желчных камней и темп похудения",
    "sl": {
      "h": "Больше 1,5 кг в неделю — выше риск желчных камней",
      "kn": [
        "1,5 кг",
        "в неделю как верхний предел"
      ],
      "b": [
        "При быстром похудении риск резко растёт",
        "Это касается и веса 150 или 200 кг",
        "Быстрее — только под наблюдением врача"
      ],
      "fd": "Больше 1,5 кг в неделю? Это уже под наблюдением врача.",
      "q": {
        "q": "При каком темпе похудения заметно растёт риск желчных камней?",
        "r": "Больше 1,5 кг в неделю",
        "w": [
          "Больше 0,2 кг в неделю",
          "Только больше 5 кг в неделю",
          "Никогда"
        ],
        "d": {}
      }
    }
  },
  "FAT-126": {
    "u": "Желчные камни при очень низкокалорийной диете",
    "sl": {
      "h": "Очень мало еды — в 3 раза больше желчных камней",
      "kn": [
        "3,4×",
        "риск при 500 против 1200+ ккал"
      ],
      "b": [
        "Сравнивали 500 ккал и 1200–1 500 ккал в день",
        "При очень малом питании камней заметно больше",
        "Ниже этого нужна программа под контролем врача"
      ],
      "fd": "Ниже 1 200 ккал в день приложение не опускается без специалиста.",
      "q": {
        "q": "Как диета с очень малым количеством калорий влияет на риск желчных камней?",
        "r": "Он вырастает примерно втрое",
        "w": [
          "Он снижается",
          "Он не меняется",
          "Он касается только мужчин"
        ],
        "d": {}
      }
    }
  },
  "FAT-127": {
    "u": "Доступность энергии и цикл у женщин",
    "sl": {
      "h": "Женщины: нехватка энергии нарушает цикл",
      "kn": [
        "30 ккал",
        "на кг безжировой массы в день"
      ],
      "b": [
        "Ниже этого сбивается гормональная регуляция",
        "При 30 ккал она оставалась стабильной",
        "При 20 и ниже — уже нет"
      ],
      "fd": "Цикл сбивается в дефиците? Ешь больше и поговори с врачом.",
      "q": {
        "q": "При какой доступности энергии у женщин сбивается гормональная регуляция?",
        "r": "Ниже 30 ккал на кг безжировой массы в день",
        "w": [
          "Ниже 60 ккал",
          "Только ниже 5 ккал",
          "Такого не бывает"
        ],
        "d": {}
      }
    }
  },
  "FAT-128": {
    "u": "Доступность энергии и гормоны у мужчин",
    "sl": {
      "h": "Мужчины: нехватка энергии снижает тестостерон",
      "kn": [
        "−16 %",
        "тестостерона при очень малой энергии"
      ],
      "b": [
        "При очень низкой энергии тестостерон упал",
        "Усталость заметно выросла",
        "А жира больше не ушло"
      ],
      "fd": "Тяжёлые тренировки и диета? Ешь достаточно, иначе страдают результаты и гормоны.",
      "q": {
        "q": "Что произошло у мужчин при очень низкой доступности энергии?",
        "r": "Тестостерон упал, усталость выросла, жира больше не ушло",
        "w": [
          "Ушло больше жира",
          "Стало больше силы",
          "Ничего"
        ],
        "d": {}
      }
    }
  },
  "FAT-129": {
    "u": "Плотность костей при похудении",
    "sl": {
      "h": "Долгие диеты снижают плотность костей",
      "kn": [
        "4 месяца",
        "и плотность кости бедра падает"
      ],
      "b": [
        "Диета без тренировок снижает плотность костей",
        "С тренировками этого не было",
        "Особенно важно после 50 и после менопаузы"
      ],
      "fd": "Долгая диета? Продолжай силовые 2–3 раза в неделю.",
      "q": {
        "q": "Что защищает кости при долгой диете?",
        "r": "Силовые тренировки",
        "w": [
          "Меньше белка",
          "Больше сидеть",
          "Худеть быстрее"
        ],
        "d": {}
      }
    }
  },
  "FAT-130": {
    "u": "Похудение после 65",
    "sl": {
      "h": "После 65: худеть медленно и с силовыми",
      "kn": [
        "0,2–0,5 %",
        "в неделю, только при ожирении"
      ],
      "b": [
        "С силовыми сохранялось гораздо больше мышц",
        "Сила выросла почти на 20 %, несмотря на диету",
        "Худеть только при явном лишнем весе"
      ],
      "fd": "Худеешь после 65? Медленно, с силовыми и достаточным белком.",
      "q": {
        "q": "Что лучше всего защищало мышцы пожилых людей при похудении?",
        "r": "Силовые тренировки",
        "w": [
          "Только кардио",
          "Никаких тренировок",
          "Меньше белка"
        ],
        "d": {}
      }
    }
  },
  "FAT-131": {
    "u": "Темп похудения и эффект йо-йо",
    "sl": {
      "h": "Быстро или медленно — йо-йо одинаковый",
      "kn": [
        "71 %",
        "веса вернулось через 3 года в обеих группах"
      ],
      "b": [
        "При быстрой диете больше людей доходят до цели",
        "Через 3 года возвращается столько же",
        "Сохранение мышц помогает удержать вес"
      ],
      "fd": "После диеты запланируй фазу поддержания, а не ешь сразу всё подряд.",
      "q": {
        "q": "Что показало долгосрочное исследование о быстром и медленном похудении?",
        "r": "Через 3 года обе группы вернули одинаково",
        "w": [
          "Медленно полностью защищает от йо-йо",
          "Быстро полностью защищает от йо-йо",
          "Никто не набрал вес обратно"
        ],
        "d": {}
      }
    }
  },
  "PACE-101": {
    "u": "Бег на 1,5 мили и тест Купера",
    "sl": {
      "h": "Тест формы без лаборатории",
      "kn": [
        "0,78–0,90",
        "Точность тестов (1,0 = идеал)"
      ],
      "b": [
        "Бег на 1,5 мили и 12-минутный тест самые точные",
        "С возрастом, весом и полом оценка точнее",
        "Темп и мотивация искажают результат"
      ],
      "fd": "Чтобы оценить форму без лаборатории, пробеги на тесте 12 мин или 1,5 мили.",
      "q": {
        "q": "Какие забеги лучше всего оценивают выносливость без лаборатории?",
        "r": "Бег на 1,5 мили и 12-минутный бег",
        "w": [
          "Только спринт на 100 м",
          "Только лёгкая пробежка по лесу",
          "Тест на 20 секунд"
        ]
      }
    }
  },
  "PACE-102": {
    "u": "Тест Купера (12 мин)",
    "sl": {
      "h": "12-минутный бег",
      "kn": [
        "r = 0,90",
        "Связь дистанции и формы"
      ],
      "b": [
        "Чем дальше за 12 минут, тем ты в лучшей форме",
        "Тест почти всегда даёт одинаковый результат",
        "На коротких дистанциях разброс больше"
      ],
      "fd": "Беги 12 мин ровно и сравнивай результат со своими предыдущими попытками.",
      "q": {
        "q": "О чём говорит дистанция за 12 минут?",
        "r": "О твоей максимальной выносливости",
        "w": [
          "О силе ног",
          "О скорости спринта",
          "О твоём весе"
        ]
      }
    }
  },
  "PACE-103": {
    "u": "Тест Купера: систематическая погрешность и надёжность",
    "sl": {
      "h": "Где тест Купера ошибается",
      "kn": [
        "0,96–0,98",
        "Повторяемость теста"
      ],
      "b": [
        "Тест очень стабильно повторяется",
        "У нетренированных он занижает результат",
        "У очень подготовленных завышает"
      ],
      "fd": "Если ты новичок, выбери более мягкий тест.",
      "q": {
        "q": "Для кого стандартная формула Купера ненадёжна?",
        "r": "Для очень нетренированных и очень подготовленных",
        "w": [
          "Для всех одинаково",
          "Только для женщин",
          "Только для детей"
        ]
      }
    }
  },
  "PACE-104": {
    "u": "Беговой тест на 3 км (3 000 м)",
    "sl": {
      "h": "Тест на 3 км",
      "kn": [
        "r = 0,74–0,79",
        "Связь с реальной формой"
      ],
      "b": [
        "Время на 3 км показывает твою выносливость",
        "У мужчин и женщин разные формулы",
        "Нужно выложиться по-настоящему"
      ],
      "fd": "Бег на 3 км с максимальным усилием даёт рабочую оценку формы.",
      "q": {
        "q": "Что нужно сделать, чтобы тест на 3 км был информативным?",
        "r": "Реально выложиться",
        "w": [
          "Бежать как можно медленнее",
          "Ходить по ходу",
          "Не есть заранее"
        ]
      }
    }
  },
  "PACE-105": {
    "u": "Тест на 3 км и лактатный порог",
    "sl": {
      "h": "Оценка порога по бегу на 3 км",
      "kn": [
        "87 %",
        "Доля, которую объясняет порог"
      ],
      "b": [
        "Темп на 3 км сильно зависит от лактатного порога",
        "По нему можно вывести темп на пороге",
        "Верно для хорошо тренированных бегунов"
      ],
      "fd": "Тест на 3 км поможет примерно задать темповые зоны.",
      "q": {
        "q": "Что время на 3 км говорит о твоей подготовке?",
        "r": "Твой темп на лактатном пороге",
        "w": [
          "Твой рост",
          "Твою потребность во сне",
          "Твой уровень силы"
        ]
      }
    }
  },
  "PACE-106": {
    "u": "Бег на 5 км на время: надёжность и порог",
    "sl": {
      "h": "5 км как надёжный ориентир",
      "kn": [
        "CV = 1,2 %",
        "Разброс от теста к тесту"
      ],
      "b": [
        "Забег на 5 км отлично повторяется",
        "Темп примерно равен порогу",
        "Примерно с 1–2 % улучшения это настоящий прогресс"
      ],
      "fd": "Пробеги 5 км по ровной трассе. Прогресс лучше оценивать по заметным изменениям времени.",
      "q": {
        "q": "С какого улучшения на 5 км это настоящий прогресс?",
        "r": "Примерно с 1–2 %",
        "w": [
          "Уже с 0,1 %",
          "Только с 20 %",
          "Никогда, это чистая случайность"
        ]
      }
    }
  },
  "PACE-107": {
    "u": "30-минутный тест (Фрил / Макгихи)",
    "sl": {
      "h": "30-минутный тест",
      "kn": [
        "8 bpm",
        "Типичная ошибка пульса"
      ],
      "b": [
        "30 минут на максимум показывают пороговый темп",
        "Пульс последних 20 минут считается пороговым",
        "Новичкам сложно распределить силы"
      ],
      "fd": "30-минутный тест стоит делать, если ты хорошо чувствуешь темп.",
      "q": {
        "q": "Какой пульс считается пороговым в 30-минутном тесте?",
        "r": "Средний за последние 20 минут",
        "w": [
          "Пульс первой минуты",
          "Самый низкий пульс",
          "Пульс покоя"
        ]
      }
    }
  },
  "PACE-108": {
    "u": "Критическая скорость (CS) по двум забегам на время",
    "sl": {
      "h": "Критическая скорость по двум забегам",
      "kn": [
        "r = 0,89",
        "Совпадение с лабораторией"
      ],
      "b": [
        "Два тяжёлых забега определяют твой темп на длинной дистанции",
        "Critical Speed — самый быстрый темп, который можно держать долго",
        "Твой устойчивый темп примерно на 6 % ниже"
      ],
      "fd": "Два забега с интервалом 30 мин позволяют оценить критическую скорость.",
      "q": {
        "q": "Как определить Critical Speed в поле?",
        "r": "Двумя максимальными забегами разной длины",
        "w": [
          "Лёгкой прогулкой",
          "Только пульсом покоя",
          "Весами"
        ]
      }
    }
  },
  "PACE-109": {
    "u": "Разговорный тест и вентиляционный порог",
    "sl": {
      "h": "Разговорный тест",
      "kn": [
        "VT1",
        "Первый дыхательный порог, твой лёгкий темп"
      ],
      "b": [
        "Если говоришь свободно, это базовый темп",
        "Слегка затруднённая речь — это порог",
        "Выкладываться на максимум не нужно"
      ],
      "fd": "Если можешь говорить целыми предложениями, темп подходит для лёгких тренировок.",
      "q": {
        "q": "Как понять, что темп базовый, по разговорному тесту?",
        "r": "Ты свободно говоришь",
        "w": [
          "Ты ловишь воздух",
          "Можешь сказать лишь отдельные слова",
          "Ты слушаешь музыку"
        ]
      }
    }
  },
  "PACE-110": {
    "u": "VDOT по Дэниелсу и Гилберту и тренировочные зоны",
    "sl": {
      "h": "VDOT: показатель беговой формы",
      "kn": [
        "5 зон",
        "E, M, T, I, R из одного числа"
      ],
      "b": [
        "Из времени забега получается число формы",
        "Из него выводятся пять темповых зон",
        "Для длинных дистанций работает только с марафонской подготовкой"
      ],
      "fd": "Введи реальное время забега, и приложение рассчитает твои зоны.",
      "q": {
        "q": "Что система VDOT считает по твоему времени забега?",
        "r": "Твои темповые зоны",
        "w": [
          "Процент жира",
          "Пульс покоя",
          "Цель по сну"
        ]
      }
    }
  },
  "PACE-111": {
    "u": "Формула Ригеля и её ограничения в любительском беге",
    "sl": {
      "h": "Прогноз времени: формула Ригеля",
      "kn": [
        "≥ 10 мин",
        "Ошибка на марафоне у каждого второго"
      ],
      "b": [
        "До полумарафона прогноз в среднем верен",
        "На марафоне он часто слишком оптимистичен",
        "Недельный объём улучшает прогноз"
      ],
      "fd": "Прогноз подходит для дистанций до 21 км. Для марафона учитывай объём тренировок.",
      "q": {
        "q": "На какой дистанции формула Ригеля часто слишком оптимистична?",
        "r": "На марафоне",
        "w": [
          "На 400 м",
          "На 1 км",
          "На 100 м"
        ]
      }
    }
  },
  "PACE-112": {
    "u": "Максимальный пульс по Танаке и резерв ЧСС по Карвонену",
    "sl": {
      "h": "Оценка максимального пульса",
      "kn": [
        "208 – 0,7 × возраст",
        "Формула Танаки"
      ],
      "b": [
        "Формула оценивает максимальный пульс по возрасту",
        "С пульсом покоя зоны точнее",
        "Оценка может ошибаться на ±10 ударов"
      ],
      "fd": "По возможности измерь максимальный пульс, а формулу используй как старт.",
      "q": {
        "q": "Как формула Танаки оценивает максимальный пульс?",
        "r": "208 минус 0,7 × возраст",
        "w": [
          "220 минус вес",
          "Пульс покоя × 3",
          "Возраст × 5"
        ]
      }
    }
  },
  "PACE-113": {
    "u": "Индекс пульса и скорости бега (HR-RS)",
    "sl": {
      "h": "Форма по лёгким пробежкам",
      "kn": [
        "+ 0,4 км/ч",
        "Прирост скорости при том же пульсе"
      ],
      "b": [
        "Пульс и скорость показывают прогресс",
        "Максимальные тесты не нужны",
        "Жара и холмы искажают пульс"
      ],
      "fd": "Если темп растёт при том же пульсе, форма улучшается.",
      "q": {
        "q": "Как увидеть прогресс формы по лёгким пробежкам?",
        "r": "Быстрее темп при том же пульсе",
        "w": [
          "Выше пульс при том же темпе",
          "Больше пота",
          "Дольше паузы"
        ]
      }
    }
  },
  "PACE-114": {
    "u": "Точность расстояния по GPS и фильтр лучших результатов",
    "sl": {
      "h": "Ошибки GPS",
      "kn": [
        "0,6–6 %",
        "Типичная ошибка измерения дистанции"
      ],
      "b": [
        "GPS-часы никогда не измеряют идеально",
        "В лесу и между домами они занижают дистанцию",
        "Зоны меняются только после улучшения примерно на 2 %"
      ],
      "fd": "Одна быстрая запись GPS ещё не подтверждает улучшение формы.",
      "q": {
        "q": "Почему приложение меняет зоны только при улучшении около 2 %?",
        "r": "Потому что GPS и форма дня колеблются",
        "w": [
          "Чтобы экономить заряд",
          "Потому что бегуны замедляются",
          "Потому что 2 % закреплено законом"
        ]
      }
    }
  },
  "PACE-115": {
    "u": "Подъём и спуск: темп с поправкой на уклон",
    "sl": {
      "h": "Подъём и спуск",
      "kn": [
        "+ 88 %",
        "Больше усилий при уклоне 10 %"
      ],
      "b": [
        "Подъём требует гораздо больше энергии",
        "Лёгкий спуск самый экономичный",
        "Темп пересчитывается на равнину"
      ],
      "fd": "На холмах важны усилия, а не темп на часах.",
      "q": {
        "q": "Во сколько раз больше энергии нужно при уклоне 10 %?",
        "r": "Почти вдвое",
        "w": [
          "Столько же",
          "Вдвое меньше",
          "Всего на 5 % больше"
        ]
      }
    }
  },
  "PACE-116": {
    "u": "Жара и влажность (WBGT / температура)",
    "sl": {
      "h": "Жара замедляет",
      "kn": [
        "0,3–0,4 %",
        "Потеря темпа на градус выше 15 °C"
      ],
      "b": [
        "Примерно с 15 °C ты становишься медленнее",
        "Медленные бегуны теряют больше",
        "С 28 °C тяжёлые тренировки рискованны"
      ],
      "fd": "В жару планируй более медленный темп и отказывайся от тяжёлых интервалов.",
      "q": {
        "q": "Что происходит с каждым градусом выше примерно 15 °C?",
        "r": "Ты становишься чуть медленнее",
        "w": [
          "Ты становишься быстрее",
          "Ничего",
          "Нужно больше сна"
        ]
      }
    }
  },
  "PACE-117": {
    "u": "Высота над уровнем моря и острая гипоксия",
    "sl": {
      "h": "Разреженный воздух, ниже результат",
      "kn": [
        "6,3 %",
        "Потеря VO₂max на 1 000 м высоты"
      ],
      "b": [
        "Результат падает уже с 300 м",
        "На каждую 1 000 м теряешь около 6 %",
        "Через 1–2 недели частично адаптируешься"
      ],
      "fd": "В горах ты бежишь медленнее, и это нормально.",
      "q": {
        "q": "Сколько VO₂max теряется примерно на 1 000 м высоты?",
        "r": "Около 6 %",
        "w": [
          "Около 0,6 %",
          "Около 60 %",
          "Ничего"
        ]
      }
    }
  },
  "PACE-118": {
    "u": "Анкеты ACSM и PAR-Q+ перед началом тренировок",
    "sl": {
      "h": "Безопасный старт",
      "kn": [
        "в 50 раз",
        "Риск для сердца у неактивных при экстремальной нагрузке"
      ],
      "b": [
        "Непривычно тяжёлая нагрузка опаснее",
        "Короткая анкета защитит тебя",
        "При симптомах максимального теста нет"
      ],
      "fd": "Прежде чем повышать нагрузку, честно ответь на вопросы анкеты о здоровье.",
      "q": {
        "q": "Кому нельзя делать максимальный тест?",
        "r": "Тем, у кого есть симптомы, или неактивным с заболеванием",
        "w": [
          "Всем, кто любит бегать",
          "Только профи",
          "Только старше 18"
        ]
      }
    }
  },
  "PACE-119": {
    "u": "Субмаксимальный тест Рокпорта: ходьба на 1 милю",
    "sl": {
      "h": "Ходьба вместо забега",
      "kn": [
        "r = 0,80",
        "Совпадение с реальной формой"
      ],
      "b": [
        "Достаточно быстро пройти милю",
        "В расчёт входят возраст, вес и пульс",
        "У очень молодых и подготовленных может быть неточным"
      ],
      "fd": "Тест с ходьбой — мягкая проверка формы без максимальной нагрузки.",
      "q": {
        "q": "Для кого предназначен тест с ходьбой на 1 милю?",
        "r": "Для новичков, пожилых и людей с лишним весом",
        "w": [
          "Только для профи",
          "Только для детей",
          "Только для спринтеров"
        ]
      }
    }
  },
  "PACE-120": {
    "u": "Субмаксимальный ступенчатый тест в беге по ЧСС или RPE",
    "sl": {
      "h": "Мягкая проверка формы",
      "kn": [
        "16 мин",
        "Длительность ступенчатого теста"
      ],
      "b": [
        "Три ступени без выкладки на максимум",
        "Можно использовать как разминку",
        "Повторяется каждые 1–2 недели"
      ],
      "fd": "Регулярно проверяй форму без предельной нагрузки.",
      "q": {
        "q": "Как часто можно повторять мягкий ступенчатый тест?",
        "r": "Каждые 1–2 недели",
        "w": [
          "Несколько раз в день",
          "Раз в год",
          "Никогда"
        ]
      }
    }
  },
  "PAUSE-101": {
    "u": "Правило «выше шеи» и сочетания симптомов",
    "sl": {
      "h": "Простуда: тренироваться или нет?",
      "kn": [
        "7 дней",
        "Длительность респираторной инфекции"
      ],
      "b": [
        "Только насморк без температуры: максимум лёгкая тренировка",
        "Температура или ломота: полный отдых",
        "Старая проверка «выше шеи» научно не подтверждена"
      ],
      "fd": "Если это больше, чем лёгкий насморк, дай себе паузу.",
      "q": {
        "q": "Когда лёгкая тренировка при простуде допустима?",
        "r": "Только при лёгком насморке без температуры",
        "w": [
          "При температуре",
          "При ломоте в теле",
          "При кашле и одышке"
        ]
      }
    }
  },
  "PAUSE-102": {
    "u": "Умеренная нагрузка при риновирусной простуде",
    "sl": {
      "h": "Лёгкий бег при насморке",
      "kn": [
        "нет разницы",
        "Длительность и тяжесть симптомов"
      ],
      "b": [
        "Лёгкая тренировка не затягивает насморк",
        "Это верно только без температуры",
        "Если плохо себя чувствуешь, оставайся дома"
      ],
      "fd": "При обычном насморке лёгкая пробежка на 10–30 минут допустима.",
      "q": {
        "q": "Что даёт лёгкая тренировка при обычном насморке?",
        "r": "Она не ухудшает его",
        "w": [
          "Она лечит быстрее",
          "Она делает его опасным",
          "Она помогает только ночью"
        ]
      }
    }
  },
  "PAUSE-103": {
    "u": "Температура и ограничение нагрузки при миокардите (ESC)",
    "sl": {
      "h": "При температуре нужна пауза",
      "kn": [
        "≥ 38 °C",
        "С этого момента спорт под запретом"
      ],
      "b": [
        "При температуре спорт опасно нагружает сердце",
        "Воспаление сердечной мышцы требует месяцев отдыха",
        "Без разрешения врача тренироваться нельзя"
      ],
      "fd": "При температуре не тренируйся, пока врач не разрешит.",
      "q": {
        "q": "Почему спорт при температуре опасен?",
        "r": "Он может опасно нагрузить сердце",
        "w": [
          "От него полнеют",
          "От него устают ноги",
          "Он снижает давление"
        ]
      }
    }
  },
  "PAUSE-104": {
    "u": "Поэтапное возвращение к спорту после вирусной инфекции или COVID-19 (GRTP)",
    "sl": {
      "h": "Возвращение после инфекции по этапам",
      "kn": [
        "6 фаз",
        "Поэтапное возвращение"
      ],
      "b": [
        "Сначала лёгкая выносливость, потом сила",
        "Каждая фаза минимум 24 часа",
        "Нужно оставаться без симптомов"
      ],
      "fd": "После инфекции начни медленно и повышай нагрузку по шагам.",
      "q": {
        "q": "С чего начинать после вирусной инфекции?",
        "r": "С лёгкой выносливости",
        "w": [
          "С тяжёлых приседаний",
          "Со спринтов",
          "С соревнования"
        ]
      }
    }
  },
  "PAUSE-105": {
    "u": "Пауза после исчезновения симптомов (немецкий экспертный консенсус)",
    "sl": {
      "h": "Сколько длится пауза после инфекции?",
      "kn": [
        "3 дня",
        "Без симптомов перед стартом"
      ],
      "b": [
        "При лёгком течении: 3 дня без симптомов",
        "Только потом тренировки с уменьшенной нагрузкой",
        "При среднем течении иди к врачу"
      ],
      "fd": "После последнего симптома подожди ещё 3 дня и только потом тренируйся.",
      "q": {
        "q": "Сколько ждать после последнего симптома лёгкой инфекции?",
        "r": "Минимум 3 дня без симптомов",
        "w": [
          "Полдня",
          "Ровно 3 недели",
          "Не ждать"
        ]
      }
    }
  },
  "PAUSE-106": {
    "u": "Перекрёстный перенос силы при тренировке одной стороны",
    "sl": {
      "h": "Тренируй здоровую сторону",
      "kn": [
        "+ 12 %",
        "Прирост силы на нетренированной стороне"
      ],
      "b": [
        "Тренировка одной стороны укрепляет и другую",
        "Особенно хорошо работает на ногах",
        "Это происходит в основном через нервную систему"
      ],
      "fd": "При травме тренировка здоровой стороны может помочь сохранить силу на травмированной стороне.",
      "q": {
        "q": "Что даёт силовая тренировка здоровой стороны при травме?",
        "r": "Больная сторона тоже немного крепнет",
        "w": [
          "Ничего",
          "Больная сторона слабеет",
          "Выигрывает только голова"
        ]
      }
    }
  },
  "PAUSE-107": {
    "u": "Перекрёстная тренировка для сохранения мышц при иммобилизации",
    "sl": {
      "h": "Защита в гипсе",
      "kn": [
        "13 %",
        "Потеря силы, которую удаётся предотвратить"
      ],
      "b": [
        "Тренировка здоровой стороны защищает от потери мышц",
        "Это работает при настоящей иммобилизации",
        "Нужна тяжёлая нагрузка здоровой стороны"
      ],
      "fd": "При иммобилизации можно продолжать интенсивно тренировать здоровую сторону.",
      "q": {
        "q": "Что защищает от потери мышц в гипсе?",
        "r": "Тяжёлая тренировка здоровой стороны",
        "w": [
          "Только покой",
          "Больше сна",
          "Больше кофе"
        ]
      }
    }
  },
  "PAUSE-108": {
    "u": "Контроль боли: модель «светофор»",
    "sl": {
      "h": "Светофор боли на тренировке",
      "kn": [
        "≤ 5/10",
        "Допустимая боль при реабилитации сухожилий"
      ],
      "b": [
        "Лёгкая боль на тренировке часто допустима",
        "Наутро она не должна усиливаться",
        "При 6/10 и выше остановись"
      ],
      "fd": "Если боль ниже 5 из 10 и на следующий день не хуже, продолжай тренироваться.",
      "q": {
        "q": "Когда прекращать тренировку при боли в сухожилии?",
        "r": "При 6/10 и выше",
        "w": [
          "При 2/10",
          "При любом покалывании",
          "Никогда"
        ]
      }
    }
  },
  "PAUSE-109": {
    "u": "Снижение VO₂max и изменение объёма плазмы",
    "sl": {
      "h": "Как быстро падает выносливость?",
      "kn": [
        "4–7 %",
        "Потеря VO₂max за 2–4 недели"
      ],
      "b": [
        "В первые недели быстро снижается объём крови",
        "Через 4–8 недель спад замедляется",
        "До нуля ты не откатываешься"
      ],
      "fd": "После паузы в 2–4 недели начни с более лёгкой нагрузки, чем до паузы.",
      "q": {
        "q": "Сколько VO₂max теряется после перерыва в 2–4 недели?",
        "r": "4–7 %",
        "w": [
          "50 %",
          "0 %",
          "80 %"
        ]
      }
    }
  },
  "PAUSE-110": {
    "u": "Снижение времени до утомления (TTE) и лактатного порога",
    "sl": {
      "h": "Сначала падает способность держать нагрузку",
      "kn": [
        "– 21 %",
        "Время до отказа после 4 недель перерыва"
      ],
      "b": [
        "Долгий лёгкий бег проседает быстрее, чем VO₂max",
        "Твой порог заметно снижается",
        "После перерыва начинай без темповых"
      ],
      "fd": "После паузы в 3–4 недели в первое время убери темповые и пороговые тренировки.",
      "q": {
        "q": "Что убрать в первые 2 недели после долгого перерыва в беге?",
        "r": "Пороговые и темповые пробежки",
        "w": [
          "Лёгкие пробежки",
          "Прогулки",
          "Растяжку"
        ]
      }
    }
  },
  "PAUSE-111": {
    "u": "Сохранение мышечной массы и максимальной силы до 3 недель",
    "sl": {
      "h": "Мышечная масса сохраняется до 3 недель",
      "kn": [
        "0 %",
        "Настоящая потеря мышц до 3 недель"
      ],
      "b": [
        "Сила и мышцы сохраняются 2–3 недели",
        "Меньший вес на весах — это просто вода",
        "Возвращайся с 75–90 % нагрузки"
      ],
      "fd": "После короткой паузы мышцы сохраняются. Возвращайся с чуть меньшей нагрузкой.",
      "q": {
        "q": "Сколько мышц реально теряется за 2–3 недели перерыва?",
        "r": "Практически нисколько",
        "w": [
          "Половина",
          "Четверть",
          "Все"
        ]
      }
    }
  },
  "PAUSE-112": {
    "u": "Потеря силы и мышц за 4–10 недель паузы",
    "sl": {
      "h": "Чем дольше пауза, тем больше потери",
      "kn": [
        "– 10 %",
        "Размер мышц после 10 недель"
      ],
      "b": [
        "С 3–4 недели сила заметно падает",
        "Мышцы уменьшаются медленнее, чем сила",
        "Пожилые теряют быстрее"
      ],
      "fd": "После 4 недель паузы начни с 60–75 % прежнего веса и сократи число подходов.",
      "q": {
        "q": "Как возвращаться после перерыва в 4 недели и больше?",
        "r": "С 60–75 % прежней нагрузки",
        "w": [
          "Со 100 % прежней нагрузки",
          "С новых рекордов",
          "С удвоенным объёмом"
        ]
      }
    }
  },
  "PAUSE-113": {
    "u": "Неделя полного отдыха в качестве делоуда",
    "sl": {
      "h": "Что меняется после недели паузы",
      "kn": [
        "0",
        "Потеря мышц после 1 недели"
      ],
      "b": [
        "Неделя отдыха не тормозит рост мышц",
        "Потом мышцы часто ощущаются вялыми",
        "Возвращайся примерно с 90 % нагрузки"
      ],
      "fd": "После недели паузы начни примерно с 90 % прежней нагрузки.",
      "q": {
        "q": "Как возвращаться после полной недели отдыха?",
        "r": "Примерно с 90 % нагрузки",
        "w": [
          "С 200 % нагрузки",
          "С максимального теста",
          "С 30 % нагрузки"
        ]
      }
    }
  },
  "PAUSE-114": {
    "u": "Быстрая потеря мышечной массы при иммобилизации (гипс)",
    "sl": {
      "h": "При иммобилизации мышцы быстро теряют объём",
      "kn": [
        "– 23 %",
        "Потеря силы после 14 дней в гипсе"
      ],
      "b": [
        "Сила падает уже через 5 дней",
        "Через 14 дней потеря большая",
        "После разрешения начинай максимум с 50–60 % нагрузки"
      ],
      "fd": "После снятия гипса возвращайся осторожно. Начни не более чем с 50–60 % прежней нагрузки.",
      "q": {
        "q": "Сколько силы теряется за 14 дней в гипсе?",
        "r": "Около пятой части",
        "w": [
          "Нисколько",
          "Около 1 %",
          "Всё"
        ]
      }
    }
  },
  "PAUSE-115": {
    "u": "Эпигенетическая мышечная память и ускоренное возвращение формы",
    "sl": {
      "h": "Мышечная память",
      "kn": [
        "2×",
        "Возврат быстрее, чем в первый раз"
      ],
      "b": [
        "Потерянные мышцы растут быстрее",
        "Тело помнит прежние результаты",
        "Планируй набор примерно в половину перерыва"
      ],
      "fd": "После перерыва в 10 недель на возврат нужно около 5 недель.",
      "q": {
        "q": "Как быстро мышцы возвращаются после перерыва?",
        "r": "Примерно вдвое быстрее, чем в первый набор",
        "w": [
          "Так же медленно",
          "Совсем не возвращаются",
          "Гораздо медленнее"
        ]
      }
    }
  },
  "PAUSE-116": {
    "u": "Ступенчатое снижение нагрузки в силовых после паузы",
    "sl": {
      "h": "Насколько легче после перерыва?",
      "kn": [
        "90 %",
        "Нагрузка после 1 недели перерыва (эмпирика)"
      ],
      "b": [
        "Точные проценты — это опыт, а не жёсткие данные",
        "Меньше подходов и запас помогают",
        "Наращивай нагрузку 1–4 недели"
      ],
      "fd": "Начни чуть легче и оставляй несколько повторений в запасе.",
      "q": {
        "q": "Насколько надёжны точные проценты для возвращения?",
        "r": "Это эмпирические правила, а не жёсткие данные исследований",
        "w": [
          "Они доказаны многими исследованиями",
          "Они закреплены законом",
          "Они случайны"
        ]
      }
    }
  },
  "PAUSE-117": {
    "u": "ACWR и EWMA: как пауза искажает расчёт",
    "sl": {
      "h": "Пауза искажает расчёт нагрузки",
      "kn": [
        "0,8–1,3",
        "Здоровый диапазон отношения нагрузок"
      ],
      "b": [
        "Отношение нагрузок сравнивает эту неделю с недавними",
        "После перерывов оно сходит с ума",
        "Лучше стартуй от значения до перерыва"
      ],
      "fd": "Если пауза в беге длится больше недели, ориентируйся на прежнюю нагрузку: текущее соотношение малоинформативно.",
      "q": {
        "q": "Почему отношение нагрузок бесполезно после перерыва?",
        "r": "Потому что база сравнения почти ноль",
        "w": [
          "Потому что пульс слишком высокий",
          "Потому что ты бежишь слишком быстро",
          "Потому что часы сломаны"
        ]
      }
    }
  },
  "PAUSE-118": {
    "u": "Рост недельного объёма бега: правила < 10 % и < 30 %",
    "sl": {
      "h": "Не наращивай километраж слишком быстро",
      "kn": [
        "< 30 %",
        "Максимальный недельный прирост"
      ],
      "b": [
        "Больше 30 % в неделю повышает риск травм",
        "После травмы или болезни только на 10–15 % больше",
        "После отпуска без ограничений прибавляй не больше 20 %"
      ],
      "fd": "Никогда не повышай недельный километраж на 30 % и больше.",
      "q": {
        "q": "На сколько больше можно бегать в неделю после болезни?",
        "r": "Примерно на 10–15 %",
        "w": [
          "На 50 %",
          "На 100 %",
          "Больше вообще нельзя"
        ]
      }
    }
  },
  "PAUSE-119": {
    "u": "Расход энергии и отказ от дефицита при травме",
    "sl": {
      "h": "Травма: без дефицита калорий",
      "kn": [
        "25–30 ккал/кг",
        "Минимальная цель на килограмм веса"
      ],
      "b": [
        "Дефицит ослабляет защиту мышц",
        "Заживлению нужна дополнительная энергия",
        "Поставь цель на поддержание веса"
      ],
      "fd": "При травме ешь минимум на уровне поддержания.",
      "q": {
        "q": "Что действует при травме в отношении калорий?",
        "r": "Без дефицита, цель — поддержание",
        "w": [
          "Сильно урезать",
          "Голодать",
          "Есть только жидкое"
        ]
      }
    }
  },
  "PAUSE-120": {
    "u": "Анаболическая резистентность и потребность в белке при иммобилизации",
    "sl": {
      "h": "Больше белка при иммобилизации",
      "kn": [
        "2,0–2,5 г/кг",
        "Белок на килограмм веса"
      ],
      "b": [
        "Обездвиженные мышцы хуже используют белок",
        "Больше белка компенсирует это",
        "Раздели его на 4–5 приёмов пищи"
      ],
      "fd": "В гипсе ешь больше белка и распределяй его в течение дня.",
      "q": {
        "q": "Сколько белка нужно при иммобилизации?",
        "r": "2,0–2,5 г на килограмм",
        "w": [
          "0,5 г на килограмм",
          "Совсем не нужен",
          "10 г на килограмм"
        ]
      }
    }
  },
  "PAUSE-121": {
    "u": "Рост основного обмена при повышенной температуре",
    "sl": {
      "h": "При температуре расход энергии выше",
      "kn": [
        "+ 11 %",
        "Больше энергии покоя на градус температуры"
      ],
      "b": [
        "При температуре организм тратит больше энергии",
        "Примерно на 10–13 % больше на градус",
        "Ешь без дефицита, можно и жидкое"
      ],
      "fd": "При температуре не экономь на калориях.",
      "q": {
        "q": "Как температура влияет на потребность в энергии?",
        "r": "Она растёт",
        "w": [
          "Она падает",
          "Не меняется",
          "Падает до нуля"
        ]
      }
    }
  },
  "PAUSE-122": {
    "u": "Белок в отпуске: поддержание веса и дефицит калорий",
    "sl": {
      "h": "Белок в отпуске",
      "kn": [
        "1,6 г/кг",
        "Достаточно без диеты"
      ],
      "b": [
        "Без диеты хватает около 1,6 г на килограмм",
        "В дефиците нужно чуть больше",
        "Порции размером с ладонь подойдут как оценка"
      ],
      "fd": "В отпуске: 1,6 г на килограмм, а в дефиците больше.",
      "q": {
        "q": "Сколько белка хватает в отпуске без диеты?",
        "r": "Около 1,6 г на килограмм",
        "w": [
          "5 г на килограмм",
          "0 г",
          "10 г на килограмм"
        ]
      }
    }
  },
  "PAUSE-123": {
    "u": "Минимум тренировок для сохранения силы и мышц",
    "sl": {
      "h": "Как сохранить силу при минимуме тренировок",
      "kn": [
        "1×/нед",
        "Молодым хватает для сохранения"
      ],
      "b": [
        "Одна тяжёлая тренировка в неделю сохраняет силу",
        "Жёсткость важнее объёма",
        "С 60 лет лучше 2 тренировки"
      ],
      "fd": "Если времени мало, одна тяжёлая тренировка на всё тело в неделю может помочь сохранить силу.",
      "q": {
        "q": "Что важнее всего при минимальных тренировках?",
        "r": "Чтобы они оставались тяжёлыми",
        "w": [
          "Чтобы они были долгими",
          "Чтобы упражнений было много",
          "Чтобы они были утром"
        ]
      }
    }
  },
  "PAUSE-124": {
    "u": "Минимум тренировок для сохранения выносливости",
    "sl": {
      "h": "Короткие интенсивные тренировки для выносливости",
      "kn": [
        "2×/нед",
        "Достаточно, чтобы держать форму"
      ],
      "b": [
        "Две короткие тяжёлые пробежки сохраняют форму",
        "Интенсивность важнее длительности",
        "Только лёгкий бег форму теряет"
      ],
      "fd": "В отпуске хватит двух коротких интенсивных пробежек в неделю.",
      "q": {
        "q": "Как сохранить выносливость в отпуске?",
        "r": "Двумя короткими интенсивными пробежками",
        "w": [
          "Совсем не бегать",
          "Только лёгкими прогулками",
          "Раз в месяц"
        ]
      }
    }
  },
  "PAUSE-125": {
    "u": "Сохранение силы и рост мышц без оборудования: упражнения до отказа",
    "sl": {
      "h": "Тренировка без гантелей",
      "kn": [
        "+ 18 %",
        "Рост мышц груди от отжиманий"
      ],
      "b": [
        "Отжимания дают рост мышц, сравнимый с жимом лёжа",
        "Делай их почти до отказа",
        "Суперсеты экономят время"
      ],
      "fd": "В отпуске хватит отжиманий и тяг, если они тяжёлые.",
      "q": {
        "q": "Когда отжимания наращивают мышцы?",
        "r": "Когда делаешь почти до отказа",
        "w": [
          "Когда делаешь очень быстро",
          "Когда делаешь всего 5",
          "Никогда"
        ]
      }
    }
  },
  "CARB-101": {
    "u": "Углеводы по уровню нагрузки на выносливость",
    "sl": {
      "h": "Углеводы по нагрузке на день",
      "kn": [
        "3–12 г/кг",
        "Диапазон в зависимости от нагрузки"
      ],
      "b": [
        "Больше тренировок — больше углеводов",
        "В дни отдыха нужно заметно меньше",
        "Количество зависит от твоего веса"
      ],
      "fd": "Подстрой количество углеводов под нагрузку на день.",
      "q": {
        "q": "От чего зависит твоя потребность в углеводах?",
        "r": "От длительности и тяжести тренировки",
        "w": [
          "От дня недели",
          "От размера обуви",
          "От цвета волос"
        ]
      }
    }
  },
  "CARB-102": {
    "u": "Питание под нагрузку (Fuel for the Work Required) и порог гликогена",
    "sl": {
      "h": "Углеводы под нагрузку",
      "kn": [
        "100–300",
        "Окно гликогена (ммоль/кг)"
      ],
      "b": [
        "Тяжёлым тренировкам нужны полные запасы",
        "Лёгкие идут с меньшим количеством",
        "Целевая подстройка усиливает эффект тренировок"
      ],
      "fd": "Перед тяжёлыми тренировками ешь больше углеводов. В дни отдыха нужно меньше.",
      "q": {
        "q": "Когда перед тренировкой нужно много углеводов?",
        "r": "Перед тяжёлыми тренировками",
        "w": [
          "В дни отдыха",
          "Перед сном",
          "Никогда"
        ]
      }
    }
  },
  "CARB-103": {
    "u": "Базовая потребность в углеводах для силы и роста мышц",
    "sl": {
      "h": "Для силовых нужно меньше углеводов",
      "kn": [
        "4–7 г/кг",
        "Углеводы в день у бодибилдеров"
      ],
      "b": [
        "Силовая тренировка лишь частично опустошает запасы",
        "Из-за пауз между подходами",
        "Поэтому хватает умеренных количеств"
      ],
      "fd": "В силовом спорте углеводов нужно меньше, чем в беге.",
      "q": {
        "q": "Почему в силовом спорте нужно меньше углеводов?",
        "r": "Из-за пауз между подходами сжигается меньше",
        "w": [
          "Потому что гири сладкие",
          "Потому что ты больше потеешь",
          "Потому что ты больше спишь"
        ]
      }
    }
  },
  "CARB-104": {
    "u": "Порог силовой нагрузки: длительность и число подходов",
    "sl": {
      "h": "Еда перед долгой силовой",
      "kn": [
        "> 45 мин",
        "С этого момента углеводы помогают"
      ],
      "b": [
        "В долгих тренировках получается больший объём",
        "После 8 часов голода тоже помогает",
        "В коротких тренировках почти не влияет"
      ],
      "fd": "Если тренировка длится больше 45 минут, поешь углеводов заранее.",
      "q": {
        "q": "Когда углеводы перед силовой помогают?",
        "r": "В долгих тренировках или после долгого голода",
        "w": [
          "В 15-минутных тренировках",
          "Никогда",
          "Только ночью"
        ]
      }
    }
  },
  "CARB-105": {
    "u": "Истощение запасов гликогена в волокнах II типа после силовой",
    "sl": {
      "h": "После тяжёлых подходов на ноги гликогена в мышцах меньше",
      "kn": [
        "– 38 %",
        "Гликоген в мышце после тяжёлой тренировки"
      ],
      "b": [
        "Тяжёлая тренировка опустошает в основном быстрые волокна",
        "Ты чувствуешь это как локальную усталость",
        "После этого стоит полностью восполнить запасы"
      ],
      "fd": "После тяжёлой тренировки ног запланируй углеводы, чтобы восполнить гликоген.",
      "q": {
        "q": "Что происходит с быстрыми мышечными волокнами после тяжёлой силовой?",
        "r": "Их запасы сильно опустошены",
        "w": [
          "Они сразу растут",
          "Они сами наполняются",
          "Ничего"
        ]
      }
    }
  },
  "CARB-106": {
    "u": "Количество углеводов и рост мышц в долгосрочной перспективе",
    "sl": {
      "h": "Набор мышц: сначала белок",
      "kn": [
        "SMD 0,15",
        "Нет явной пользы от большего количества углеводов"
      ],
      "b": [
        "Больше углеводов не значит больше мышц",
        "Важнее белок и общие калории",
        "При большом объёме они помогают результату"
      ],
      "fd": "Сначала спланируй белок и калории, потом углеводы по объёму тренировок.",
      "q": {
        "q": "Что для набора мышц важнее большого количества углеводов?",
        "r": "Белок и достаточно калорий",
        "w": [
          "Меньше сна",
          "Только сахар",
          "Больше воды"
        ]
      }
    }
  },
  "CARB-107": {
    "u": "Внутренняя нагрузка по session-RPE и TRIMP Эдвардса",
    "sl": {
      "h": "Насколько тяжёлой была тренировка?",
      "kn": [
        "RPE × мин",
        "Нагрузка сессии (время на усилие)"
      ],
      "b": [
        "Усилие на время показывает нагрузку",
        "Пульс помогает в беге",
        "Выше порога день считается умеренным или высоким"
      ],
      "fd": "Оцени усилие и укажи длительность каждой тренировки. Приложение подстроит цель по углеводам.",
      "q": {
        "q": "Как просто посчитать нагрузку тренировки?",
        "r": "Длительность на усилие",
        "w": [
          "Считать только шаги",
          "Только вес",
          "Только время суток"
        ]
      }
    }
  },
  "CARB-108": {
    "u": "TRIMP Банистера по непрерывной записи пульса",
    "sl": {
      "h": "Оценка нагрузки по пульсу",
      "kn": [
        "× 1,15",
        "Надбавка для интервалов"
      ],
      "b": [
        "Высокий пульс считается непропорционально",
        "Средний пульс занижает интервалы",
        "Приложение добавляет надбавку для интервалов"
      ],
      "fd": "Если есть только средний пульс, приложение оценит нагрузку на интервалах чуть выше.",
      "q": {
        "q": "Почему приложение оценивает интервалы выше?",
        "r": "Средний пульс их занижает",
        "w": [
          "Потому что они веселее",
          "Потому что при них потеешь",
          "Потому что они короче"
        ]
      }
    }
  },
  "CARB-109": {
    "u": "Взаимное влияние нагрузок и интервал между двумя тренировками в день",
    "sl": {
      "h": "Бег и силовые в один день",
      "kn": [
        "3–6 ч",
        "Перерыв между тренировками"
      ],
      "b": [
        "Если делать вместе, страдает взрывная сила",
        "С перерывом эффект меньше",
        "Сначала сила, потом еда, потом бег"
      ],
      "fd": "Между силовой и бегом сделай перерыв минимум 3 часа и поешь.",
      "q": {
        "q": "Что помогает при беге и силовой в один день?",
        "r": "Минимум 3 часа перерыва и еда",
        "w": [
          "Обе подряд",
          "Ничего не есть",
          "Только пить"
        ]
      }
    }
  },
  "CARB-110": {
    "u": "Дефицит калорий, белок для сохранения мышц и углеводные рефиды",
    "sl": {
      "h": "Диета с углеводными днями",
      "kn": [
        "1,8–2,7 г/кг",
        "Белок в дефиците на килограмм"
      ],
      "b": [
        "Много белка защищает мышцы",
        "Два дня с большим количеством углеводов помогают",
        "Недельные калории остаются теми же"
      ],
      "fd": "На диете ешь много белка и устраивай углеводные дни на выходных.",
      "q": {
        "q": "Что защищает мышцы на диете?",
        "r": "Много белка",
        "w": [
          "Меньше сна",
          "Только салат",
          "Ничего не есть"
        ]
      }
    }
  },
  "CARB-111": {
    "u": "Углеводы за 1–4 ч до тренировки",
    "sl": {
      "h": "Еда перед тренировкой",
      "kn": [
        "1–4 г/кг",
        "Углеводы за 1–4 часа"
      ],
      "b": [
        "Приём пищи заранее заполняет запасы",
        "Чем ближе к старту, тем меньше и легче",
        "Чувствительным людям нужно подбирать количество"
      ],
      "fd": "Перед долгими тренировками ешь углеводы за 1–4 часа.",
      "q": {
        "q": "Когда есть перед долгой тренировкой?",
        "r": "За 1–4 часа до неё",
        "w": [
          "Прямо перед стартом плотно",
          "Совсем не есть",
          "После тренировки"
        ]
      }
    }
  },
  "CARB-112": {
    "u": "Углеводы во время тренировки в зависимости от её длительности",
    "sl": {
      "h": "Еда во время тренировки",
      "kn": [
        "30–60 г/ч",
        "Для тренировок 1–2,5 часа"
      ],
      "b": [
        "До 45 минут ничего не нужно",
        "В долгих тренировках количество растёт",
        "Зависит от длительности, а не от веса"
      ],
      "fd": "Чем дольше тренировка, тем больше углеводов в час.",
      "q": {
        "q": "Сколько есть в час на 2-часовой тренировке?",
        "r": "30–60 г углеводов",
        "w": [
          "Ничего",
          "200 г",
          "5 г"
        ]
      }
    }
  },
  "CARB-113": {
    "u": "Смеси глюкозы и фруктозы (SGLT1 и GLUT5)",
    "sl": {
      "h": "Смешивай два вида сахара",
      "kn": [
        "> 60 г/ч",
        "С этого момента нужны смеси"
      ],
      "b": [
        "Кишечник усваивает один вид только до предела",
        "Глюкоза плюс фруктоза усваивается лучше",
        "Это даёт лучший результат и меньше проблем с желудком"
      ],
      "fd": "Если нужно больше 60 г в час, бери смесь глюкозы и фруктозы.",
      "q": {
        "q": "Зачем при большом потреблении смешивать два вида сахара?",
        "r": "Кишечник может усвоить больше",
        "w": [
          "Так вкуснее",
          "Так дешевле",
          "Так бодрее"
        ]
      }
    }
  },
  "CARB-114": {
    "u": "Тренировка кишечника для лучшей переносимости питания",
    "sl": {
      "h": "Тренировка кишечника",
      "kn": [
        "6 недель",
        "Время для полной адаптации"
      ],
      "b": [
        "Кишечник привыкает есть на бегу",
        "Начни с 30–40 г в час",
        "Постепенно доведи до 70–90 г"
      ],
      "fd": "Перед стартами 6 недель тренируйся есть на бегу.",
      "q": {
        "q": "Как подготовиться к большому количеству еды на соревновании?",
        "r": "Постепенно наращивать на тренировках",
        "w": [
          "Впервые попробовать в день старта",
          "Не есть",
          "Только пить"
        ]
      }
    }
  },
  "CARB-115": {
    "u": "Жидкость и натрий во время и после тренировки",
    "sl": {
      "h": "Питьё и соль",
      "kn": [
        "2 %",
        "Потеря жидкости, при которой падает результат"
      ],
      "b": [
        "Уже 2 % потери веса из-за пота замедляют",
        "Пей в долгих или жарких тренировках",
        "После тренировки восполни соль и воду"
      ],
      "fd": "Взвесься до и после тренировки, чтобы оценить потерю жидкости.",
      "q": {
        "q": "При какой потере жидкости падает результат?",
        "r": "Примерно с 2 % веса",
        "w": [
          "С 20 %",
          "Никогда",
          "Только с 50 %"
        ]
      }
    }
  },
  "CARB-116": {
    "u": "Восстановление гликогена при двух тренировках в день",
    "sl": {
      "h": "Как быстро восполнить гликоген",
      "kn": [
        "1,0–1,2 г/кг/ч",
        "Углеводы в первые 4 часа"
      ],
      "b": [
        "При двух тренировках в день важен каждый час",
        "Ешь сразу после первой тренировки",
        "С белком можно и с меньшим количеством углеводов"
      ],
      "fd": "Если до второй тренировки меньше 8 ч, поешь сразу после первой.",
      "q": {
        "q": "Что делать между двумя тренировками в один день?",
        "r": "Сразу поесть углеводов",
        "w": [
          "Подождать два часа",
          "Ничего не есть",
          "Выпить только кофе"
        ]
      }
    }
  },
  "CARB-117": {
    "u": "Sleep Low и длительная низкоуглеводная диета (LCHF)",
    "sl": {
      "h": "Тренировка с низким запасом гликогена",
      "kn": [
        "1–2×/нед",
        "Максимум столько раз train low"
      ],
      "b": [
        "Несколько тренировок с малым количеством углеводов могут помочь",
        "Постоянное питание с низким содержанием углеводов вредит результату",
        "Не для тяжёлых интервалов и силовых"
      ],
      "fd": "Используй train low редко и только на лёгких тренировках.",
      "q": {
        "q": "Как часто можно тренироваться с малым количеством углеводов?",
        "r": "Максимум 1–2 раза в неделю",
        "w": [
          "Каждый день",
          "На каждой тяжёлой тренировке",
          "Только на силовых"
        ]
      }
    }
  },
  "CARB-118": {
    "u": "Распад белка и роль лейцина при низком гликогене",
    "sl": {
      "h": "Белок перед тренировкой натощак",
      "kn": [
        "20–30 г",
        "Белок перед лёгкой тренировкой"
      ],
      "b": [
        "С пустыми запасами организм разрушает больше мышечного белка",
        "Белок заранее защищает",
        "Без углеводов стимул тренировки сохраняется"
      ],
      "fd": "Если тренируешься натощак, возьми перед этим немного белка.",
      "q": {
        "q": "Что защищает мышцы при тренировке натощак?",
        "r": "20–30 г белка заранее",
        "w": [
          "Чистый сахар",
          "Только кофе",
          "Ничего"
        ]
      }
    }
  },
  "CARB-119": {
    "u": "Обмен веществ в костной ткани при кратком ограничении углеводов",
    "sl": {
      "h": "Нижняя граница углеводов",
      "kn": [
        "≥ 130 г/день",
        "Минимум для мозга"
      ],
      "b": [
        "Слишком мало углеводов ослабляет кости",
        "Даже в дефиците есть нижняя граница",
        "Минимум 2 г на килограмм в день"
      ],
      "fd": "Никогда не опускайся ниже 2 г углеводов на килограмм, даже в дефиците.",
      "q": {
        "q": "Что происходит с костями при слишком малом количестве углеводов?",
        "r": "Они меньше строятся и больше разрушаются",
        "w": [
          "Они крепнут",
          "Ничего",
          "Они растут быстрее"
        ]
      }
    }
  },
  "CARB-120": {
    "u": "Женская физиология, лютеиновая фаза и тренировки натощак",
    "sl": {
      "h": "Женщинам: без тренировок натощак",
      "kn": [
        "0,32–0,38 г/кг",
        "Белок вокруг тренировки"
      ],
      "b": [
        "Женщины чувствительнее реагируют на нехватку энергии",
        "Во второй половине цикла нужно больше углеводов",
        "Тренировка натощак по умолчанию отключена"
      ],
      "fd": "Женщине лучше поесть перед тренировкой и больше углеводов во второй половине цикла.",
      "q": {
        "q": "Что действует для женщин при тренировке натощак?",
        "r": "Лучше избегать",
        "w": [
          "Всегда хорошо",
          "Только в жару",
          "Только утром"
        ]
      }
    }
  },
  "CARB-121": {
    "u": "Консенсус по REDs и признаки низкой доступности энергии",
    "sl": {
      "h": "Признаки нехватки энергии",
      "kn": [
        "< 30 ккал/кг",
        "Порог тревоги на килограмм обезжиренной массы"
      ],
      "b": [
        "Нехватка энергии вредит циклу, костям и иммунитету",
        "Следи за сном, настроением и болью в костях",
        "При признаках никакого дефицита"
      ],
      "fd": "При тревожных признаках ешь больше и не держи дефицит.",
      "q": {
        "q": "Что является признаком нехватки энергии?",
        "r": "Нарушения цикла или постоянная усталость",
        "w": [
          "Хорошее настроение",
          "Больше мышц",
          "Хороший сон"
        ]
      }
    }
  },
  "CARB-122": {
    "u": "Диабет и границы применения EU MDR: статус медизделия",
    "sl": {
      "h": "Диабет: к врачу",
      "kn": [
        "7–10 ммоль/л",
        "Обычный стартовый сахар крови (только справка)"
      ],
      "b": [
        "Бег и силовая по-разному влияют на сахар в крови",
        "Инсулин и углеводы подбирает врач",
        "Приложение не рассчитывает дозу инсулина"
      ],
      "fd": "При диабете согласуй тренировки с врачом.",
      "q": {
        "q": "Чего приложение не делает при диабете?",
        "r": "Рассчитывает дозы инсулина",
        "w": [
          "Указывает на врача",
          "Равномерно распределяет углеводы",
          "Предлагает тренировки"
        ]
      }
    }
  },
  "FAST-101": {
    "u": "Интервальное голодание и обычное снижение калорий",
    "sl": {
      "h": "Голодание или обычная диета",
      "kn": [
        "–0,33 %",
        "Разница в потере веса с обычной диетой (незначимая)"
      ],
      "b": [
        "За 6–12 месяцев ты худеешь примерно так же, как и на обычной диете",
        "По сравнению с «ничего не менять» помогают оба варианта",
        "Главное — придерживаться своей нормы калорий"
      ],
      "fd": "Интервальное голодание может помочь выстроить режим питания без ускорения обмена веществ.",
      "q": {
        "q": "Как интервальное голодание выглядит рядом с обычным снижением калорий?",
        "r": "В среднем почти без разницы по весу",
        "w": [
          "Оно явно лучше",
          "Оно явно хуже",
          "Оно работает только у мужчин"
        ]
      }
    }
  },
  "FAST-103": {
    "u": "16:8 TRE + снижение калорий против одного снижения калорий за 12 месяцев",
    "sl": {
      "h": "16:8 и цель по калориям: результаты через 12 месяцев",
      "kn": [
        "–1,8 кг",
        "Дополнительная разница через 12 месяцев (неоднозначно)"
      ],
      "b": [
        "8-часовое окно сверх нормы калорий не дало явной пользы",
        "Жировая и мышечная масса почти не отличались",
        "К концу дисциплина падала в обеих группах"
      ],
      "fd": "Режим 16:8 может помочь соблюдать цель по калориям. Сама цель всё равно важна.",
      "q": {
        "q": "Что 16:8 добавило к снижению калорий через 12 месяцев?",
        "r": "Явного дополнительного эффекта не доказано",
        "w": [
          "Заметно больше мышц",
          "Вдвое меньше потери веса",
          "Всегда лучшие анализы"
        ]
      }
    }
  },
  "FAST-108": {
    "u": "Непропорциональная потеря безжировой массы при свободном 16:8",
    "sl": {
      "h": "16:8 без плана",
      "kn": [
        "65 %",
        "Доля безжировой массы в потерянном весе"
      ],
      "b": [
        "Без правил потеря веса была небольшой",
        "Значительная её часть — безжировая масса",
        "Мышцы рук и ног тоже уменьшились"
      ],
      "fd": "Режим 16:8 без силовых и достаточного количества белка может привести к потере мышц.",
      "q": {
        "q": "Из чего примерно на две трети состояла потеря веса при 16:8 без правил?",
        "r": "Из безжировой массы",
        "w": [
          "Из чистого жира",
          "Из воды в кишечнике",
          "Из костей"
        ]
      }
    }
  },
  "FAST-109": {
    "u": "Сохранение мышц и сжигание жира: IF + силовые",
    "sl": {
      "h": "Голодание плюс силовые",
      "kn": [
        "–1,36 кг",
        "Больше потеряно жира, чем при одних тренировках"
      ],
      "b": [
        "С силовыми мышечная масса в среднем сохранялась",
        "Жировая масса падала сильнее, чем при одних тренировках",
        "Исследования длились всего 4–12 недель"
      ],
      "fd": "Силовые тренировки во время интервального голодания помогают сохранить мышцы.",
      "q": {
        "q": "Что показало голодание вместе с силовыми?",
        "r": "Больше потери жира при сохранённых мышцах",
        "w": [
          "Заметная потеря мышц",
          "Потеря силы",
          "Никакой разницы с бездействием"
        ]
      }
    }
  },
  "FAST-113": {
    "u": "Раннее (eTRE) и позднее окно питания (lTRE): чувствительность к инсулину и вес",
    "sl": {
      "h": "Раннее и позднее окно питания",
      "kn": [
        "–1,15 кг",
        "Дополнительная потеря веса при раннем окне"
      ],
      "b": [
        "Раннее окно питания улучшило инсулин и вес сильнее, чем позднее",
        "Важно, когда окно заканчивается",
        "Результаты исследований сильно расходятся"
      ],
      "fd": "Если график позволяет, сдвинь окно питания на более раннее время.",
      "q": {
        "q": "Какое окно лучше повлияло на инсулин и вес?",
        "r": "Раннее",
        "w": [
          "Позднее",
          "Оба одинаково",
          "Ни одно"
        ]
      }
    }
  },
  "FAST-114": {
    "u": "Снижение давления и спонтанный дефицит калорий при eTRE",
    "sl": {
      "h": "Ранний приём пищи и давление",
      "kn": [
        "–214 ккал",
        "Спонтанно меньше энергии в день"
      ],
      "b": [
        "Раннее окно в среднем снижало давление",
        "Участники сами ели чуть меньше",
        "Обычное снижение калорий в целом снижало давление даже чуть сильнее"
      ],
      "fd": "Ранний приём пищи может помочь, но другие режимы тоже могут работать.",
      "q": {
        "q": "Что отметили у раннего окна питания?",
        "r": "Давление снизилось и люди сами ели немного меньше",
        "w": [
          "Давление выросло",
          "Люди ели заметно больше",
          "Сон ухудшился"
        ]
      }
    }
  },
  "FAST-115": {
    "u": "Разные эффекты на триглицериды, ЛПНП и общий холестерин",
    "sl": {
      "h": "Голодание и липиды крови",
      "kn": [
        "< 8 ч",
        "Очень короткие окна повышали холестерин"
      ],
      "b": [
        "Умеренное голодание снижало триглицериды и ЛПНП по сравнению с бездействием",
        "Очень короткие окна и ADF местами давали более высокий холестерин",
        "В начале триглицериды могут ненадолго вырасти"
      ],
      "fd": "При очень узком окне польза для здоровья не подтверждена. Следи за показателями крови.",
      "q": {
        "q": "Что показали очень короткие окна питания короче 8 часов?",
        "r": "Местами более высокий общий холестерин",
        "w": [
          "Всегда лучшие жиры крови",
          "Никакого влияния",
          "Более низкое давление"
        ]
      }
    }
  },
  "FAST-116": {
    "u": "Субъективный голод и насыщение по сравнению с ежедневным снижением калорий",
    "sl": {
      "h": "Голодание снижает голод?",
      "kn": [
        "без разницы",
        "Голод и сытость против обычной диеты"
      ],
      "b": [
        "Голод и сытость не отличались от обычного снижения калорий",
        "Желание поесть тоже осталось похожим",
        "В отдельных исследованиях при раннем питании тяга была слабее"
      ],
      "fd": "Даже при голодании голод может сохраняться. Спланируй приёмы пищи заранее.",
      "q": {
        "q": "Как голодание выглядело по голоду рядом с обычной диетой?",
        "r": "Значимой разницы нет",
        "w": [
          "Голод всегда исчезал",
          "Голод был всегда сильнее",
          "Оно надолго насыщало"
        ]
      }
    }
  },
  "FAST-125": {
    "u": "16:8 TRF у активных женщин",
    "sl": {
      "h": "16:8 у активных женщин",
      "kn": [
        "1,6 г/кг",
        "Белок в сутки в исследовании"
      ],
      "b": [
        "При 16:8 женщины наращивали мышцы и силу как при обычном питании",
        "Преимущество по жиру было только у тех, кто выполнял план",
        "Всего 8 недель"
      ],
      "fd": "В исследовании у активных женщин на 16:8 мышечная масса сохранялась при достаточном количестве белка.",
      "q": {
        "q": "Как показало себя 16:8 у активных женщин с нормой белка?",
        "r": "Рост мышц и силы как при обычном питании",
        "w": [
          "Заметно меньше мышц",
          "Всегда больше потеря жира",
          "Они теряли силу"
        ]
      }
    }
  },
  "FAST-130": {
    "u": "Спринт-интервальная тренировка (SIT) натощак",
    "sl": {
      "h": "Спринты натощак",
      "kn": [
        "–0,7 Вт/кг",
        "Меньшая пиковая мощность натощак"
      ],
      "b": [
        "Натощак пиковая мощность в спринтах была чуть ниже",
        "Выносливость при высокой нагрузке в конце была лучше",
        "Всего 4 недели и только 20 мужчин"
      ],
      "fd": "Тяжёлые спринты обычно лучше идут после еды.",
      "q": {
        "q": "Что произошло со спринтами натощак?",
        "r": "Пиковая мощность была ниже",
        "w": [
          "Она была вдвое выше",
          "Выносливость рухнула",
          "Разницы не было"
        ]
      }
    }
  },
  "FAST-133": {
    "u": "Оптимальная порция белка при 4 приёмах и окне питания",
    "sl": {
      "h": "Белок по приёмам пищи",
      "kn": [
        "0,40–0,55 г/кг",
        "Белок на приём, минимум 4 приёма"
      ],
      "b": [
        "Для максимального роста нужно 1,6–2,2 г белка на кг в день",
        "При 4 приёмах это около 0,40–0,55 г на кг за приём",
        "В коротком окне нужны порции побольше"
      ],
      "fd": "Распредели белок по приёмам пищи так, чтобы в каждом была полноценная порция.",
      "q": {
        "q": "Сколько белка на приём рекомендуют при 4 приёмах пищи?",
        "r": "Около 0,40–0,55 г на кг",
        "w": [
          "Около 0,05 г на кг",
          "Около 3 г на кг",
          "Никаких рекомендаций нет"
        ]
      }
    }
  },
  "FAST-134": {
    "u": "Нет верхнего предела анаболического ответа при 100 г белка",
    "sl": {
      "h": "Есть ли предел белка?",
      "kn": [
        "100 г",
        "Белок в одном приёме после тренировки"
      ],
      "b": [
        "100 г молочного белка стимулировали рост мышц дольше, чем 25 г",
        "Эффект держался больше 12 часов",
        "Только молодые мужчины, молочный белок"
      ],
      "fd": "Организм использует белок и из большой порции.",
      "q": {
        "q": "Что показала порция 100 г после силовой?",
        "r": "Рост мышц дольше, чем при 25 г",
        "w": [
          "Всё сверх 25 г сгорает",
          "Рост был короче",
          "Эффекта не было"
        ]
      }
    }
  },
  "FAST-139": {
    "u": "Количественное восстановление гликогена в мышцах после нагрузки",
    "sl": {
      "h": "Восполнение запасов",
      "kn": [
        "+23,5",
        "ммоль/кг в час больше, чем с водой"
      ],
      "b": [
        "Углеводы пополняют мышечные запасы заметно быстрее воды",
        "Дополнительный белок это не ускоряет",
        "Белок всё равно полезен для роста"
      ],
      "fd": "Для восполнения гликогена особенно важны углеводы после тренировки.",
      "q": {
        "q": "Что быстрее пополняет мышечные запасы после тренировки?",
        "r": "Углеводы",
        "w": [
          "Простая вода",
          "Чистый белок",
          "Кофеин"
        ]
      }
    }
  },
  "FAST-146": {
    "u": "Относительный энергодефицит в спорте (RED-S)",
    "sl": {
      "h": "RED-S: когда не хватает энергии",
      "kn": [
        "7 областей",
        "Цикл, кости, обмен веществ, иммунитет, психика и др."
      ],
      "b": [
        "Слишком мало энергии в спорте может нарушать многие функции организма",
        "Это касается женщин и мужчин",
        "Относись к тревожным признакам серьёзно"
      ],
      "fd": "Если совмещаешь голодание и спорт, следи, чтобы энергии хватало на нагрузку и восстановление.",
      "q": {
        "q": "Что такое RED-S?",
        "r": "Последствия слишком малого потребления энергии в спорте",
        "w": [
          "Новый вид спорта",
          "План набора мышц",
          "Белковый порошок"
        ]
      }
    }
  },
  "FAST-147": {
    "u": "Порог пульсации ЛГ у женщин (< 30 ккал/кг FFM/день)",
    "sl": {
      "h": "Отметка 30 ккал",
      "kn": [
        "30 ккал/кг FFM",
        "Ниже неё гормоны реагируют"
      ],
      "b": [
        "Ниже 30 ккал на кг безжировой массы гормональные сигналы нарушаются уже через 5 дней",
        "При 30 всё ещё было стабильно",
        "Касается 5 дней в небольшом исследовании"
      ],
      "fd": "Для активных женщин ориентир — не ниже примерно 30 ккал на кг безжировой массы.",
      "q": {
        "q": "Где начинается критичная зона для гормонов?",
        "r": "Ниже примерно 30 ккал на кг безжировой массы",
        "w": [
          "Выше 45 ккал",
          "Ровно 100 ккал",
          "При 60 ккал"
        ]
      }
    }
  },
  "FAST-149": {
    "u": "Внутридневной энергодефицит и гормональная ось у спортсменов",
    "sl": {
      "h": "Часы дефицита у мужчин",
      "kn": [
        "Кортизол ↑",
        "Больше гормона стресса при большем дефиците"
      ],
      "b": [
        "Больший дефицит был связан с более высоким кортизолом",
        "Соотношение тестостерон/кортизол тоже было ниже",
        "Небольшое исследование, только связь"
      ],
      "fd": "При тяжёлых тренировках избегай длительных периодов с нехваткой энергии.",
      "q": {
        "q": "Что отметили у мужчин с большим почасовым дефицитом?",
        "r": "Более высокий кортизол и меньшее соотношение",
        "w": [
          "Меньше стресса",
          "Больше тестостерона",
          "Связи нет"
        ]
      }
    }
  },
  "FAST-151": {
    "u": "Долгосрочные эффекты (12 месяцев) 8-часового TRE на половые гормоны",
    "sl": {
      "h": "Гормоны через 12 месяцев",
      "kn": [
        "12 месяцев",
        "8-часовое окно без изменения гормонов"
      ],
      "b": [
        "Тестостерон, ДГЭА и ГСПГ при 8-часовом окне остались стабильны",
        "Касается мужчин и женщин с ожирением",
        "Вес снизился примерно на 4–5 %"
      ],
      "fd": "В этом исследовании 8-часовое окно не ухудшило показатели гормонов.",
      "q": {
        "q": "Что показало 8-часовое окно через 12 месяцев?",
        "r": "Негативных гормональных эффектов нет",
        "w": [
          "Тестостерон упал вдвое",
          "Потерю мышц",
          "Больше стресса"
        ]
      }
    }
  },
  "FAST-152": {
    "u": "Основной обмен и потребность в энергии в лютеиновой фазе",
    "sl": {
      "h": "Больше голода после овуляции",
      "kn": [
        "+30–120 ккал",
        "Дополнительная потребность в лютеиновой фазе в день"
      ],
      "b": [
        "Основной обмен в лютеиновой фазе растёт лишь слегка",
        "Голод всё равно может быть сильнее",
        "Колебания у женщин индивидуальны"
      ],
      "fd": "Больший аппетит в середине цикла — норма, оставь немного запаса.",
      "q": {
        "q": "Сколько примерно дополнительной энергии нужно в лютеиновой фазе?",
        "r": "Около 30–120 ккал в день",
        "w": [
          "Около 1 000 ккал",
          "Меньше, чем раньше",
          "Это неясно"
        ]
      }
    }
  },
  "FAST-156": {
    "u": "Ночная пауза в еде (≥ 14 ч) и риск гиперурикемии и подагры",
    "sl": {
      "h": "Долгая ночная пауза и мочевая кислота",
      "kn": [
        "OR 1,48",
        "Выше шанс повышенной мочевой кислоты"
      ],
      "b": [
        "Кто ночью не ел более 14 ч, чаще имел повышенную мочевую кислоту",
        "Мало приёмов пищи тоже было связано с подагрой",
        "Наблюдательные данные, причина не доказана"
      ],
      "fd": "При склонности к подагре обсуди режим питания с врачом.",
      "q": {
        "q": "Что показал анализ долгих ночных пауз?",
        "r": "Чаще повышенная мочевая кислота",
        "w": [
          "Реже подагра",
          "Связи нет",
          "Больше мышц"
        ]
      }
    }
  },
  "FAST-158": {
    "u": "Острое влияние безкалорийных подсластителей на сахар и инсулин (LES)",
    "sl": {
      "h": "Подсластитель в окне голодания",
      "kn": [
        "–0,02",
        "ммоль/л сахара в крови (практически ноль)"
      ],
      "b": [
        "Подсластители не повышали сахар и инсулин в краткосрочной перспективе",
        "Сравнивали с водой и плацебо",
        "Долгосрочные эффекты открыты"
      ],
      "fd": "В краткосрочных исследованиях напитки с подсластителями не ухудшали показатели сахара в крови.",
      "q": {
        "q": "Что показали подсластители по сахару в крови?",
        "r": "Острого роста нет",
        "w": [
          "Сильный рост",
          "Сильное снижение",
          "Они вызывают выброс инсулина"
        ]
      }
    }
  }
}
```

## D. Technik-Hinweise

`www/cues.js` (`ru`)

```json
{
  "fs": [
    "Локти выше, гриф на плечах",
    "Корпус прямо, грудь выше",
    "Веди колени по линии носков"
  ],
  "pend": [
    "Грудь выше, спина к спинке",
    "Веди колени по линии носков",
    "Опускайся глубоко и плавно"
  ],
  "hack": [
    "Прижми спину к спинке",
    "Стопы на ширине плеч, колени над носками",
    "Вниз плавно, из нижней точки жми вверх"
  ],
  "legpress": [
    "Поясница прижата к спинке",
    "Веди колени наружу, не своди внутрь",
    "Вверху оставляй колени чуть согнутыми"
  ],
  "trap": [
    "Грудь вперёд, спина прямая",
    "Гриф вдоль тела, разгибайся в тазу и коленях",
    "Вверху напряги ягодицы, не прогибайся"
  ],
  "rdl_db": [
    "Таз назад, колени слегка согнуты",
    "Гантели близко к ногам",
    "Спина нейтрально, вниз до растяжения задней поверхности бедра"
  ],
  "hyper45": [
    "Сгибайся в тазобедренных суставах, спина нейтрально",
    "Опускайся медленно",
    "Вверху напряги ягодицы, не прогибайся"
  ],
  "ht": [
    "Лопатки на скамье, подбородок к груди",
    "Голени вертикально вверху",
    "Подними таз, напряги ягодицы"
  ],
  "legext": [
    "Спина прижата, колено на уровне оси",
    "Задержись 1 с вверху",
    "Опускай медленно, 2–3 с"
  ],
  "curl_seated": [
    "Спина к спинке, валик над пятками",
    "Тяни пятки к ягодицам",
    "Разгибай ноги плавно до растяжения"
  ],
  "curl_lying": [
    "Таз не отрывай от скамьи",
    "Тяни пятки к ягодицам",
    "Опускай медленно, 2–3 с"
  ],
  "calf_st": [
    "Опусти пятки, задержись в растяжении на 1 с",
    "Вверху на носки, задержись 1 с",
    "Колени почти прямые, без рывков"
  ],
  "calf_lp": [
    "Только передняя часть стопы на платформе",
    "Пятки вниз до растяжения, пауза 1 с вверху",
    "Колени почти прямые, не блокируй"
  ],
  "calf_smith": [
    "Носки на возвышении",
    "Пятки вниз до растяжения, пауза 1 с вверху",
    "Корпус прямой, без рывков"
  ],
  "calf_se": [
    "Валик на коленях",
    "Опусти пятки, задержись в растяжении на 1 с",
    "Поднимайся полностью, задержись 1 с"
  ],
  "bench": [
    "Сведи и опусти лопатки",
    "Стопы упёрты в пол, лёгкий прогиб",
    "Гриф к нижней части груди, локти под углом ~45°"
  ],
  "smith_bench": [
    "Лопатки сведены, стопы упёрты",
    "Гриф к нижней части груди",
    "Запястья над локтями"
  ],
  "incl": [
    "Скамья 30–45°, лопатки сведены",
    "Жми гантели над верхней частью груди",
    "Опускай под контролем, локти ~45°"
  ],
  "incl_machine": [
    "Спина плотно к опоре, плечи назад",
    "Жми рукояти над верхней частью груди",
    "Возвращайся медленно, держи напряжение"
  ],
  "machine_ohp": [
    "Спина плотно к опоре, рёбра вниз",
    "Жми вверх без прогиба в пояснице",
    "Возвращайся медленно, 2 с"
  ],
  "pullup_w": [
    "Лопатки вниз, грудь к перекладине",
    "Тяни локти к бёдрам",
    "Внизу полный вис, без раскачки"
  ],
  "chinup_w": [
    "Хват снизу, грудь к перекладине",
    "Локти вниз вдоль корпуса",
    "Внизу полный вис, без раскачки"
  ],
  "pullup": [
    "Лопатки вниз, грудь к перекладине",
    "Тяни локти к бёдрам",
    "Внизу полный вис, без раскачки"
  ],
  "neutral_pu": [
    "Нейтральный хват, плечи от ушей",
    "Тяни грудь к рукоятям",
    "Опускайся под контролем, 2–3 с"
  ],
  "chinup": [
    "Хват снизу, грудь к перекладине",
    "Локти вниз вдоль корпуса",
    "Внизу полный вис, без раскачки"
  ],
  "latpd": [
    "Грудь вперёд, гриф к верхней части груди",
    "Локти веди вниз",
    "Вверху дай лопаткам подняться, затем тяни"
  ],
  "row": [
    "Грудь плотно на опоре",
    "Локти назад, своди лопатки",
    "Внизу дай спине растянуться, без рывка"
  ],
  "cable_row": [
    "Сиди ровно, грудь вперёд",
    "Локти назад, своди лопатки",
    "Вытяни руки под контролем, корпус неподвижен"
  ],
  "lat": [
    "Слегка согни локти, поднимай руки до уровня плеч",
    "Плечи держи опущенными",
    "Опускай медленно, без инерции"
  ],
  "lat_cable": [
    "Слегка согни локти, поднимай руки до уровня плеч",
    "Плечи опущены, корпус неподвижен",
    "Возвращайся медленно, держи напряжение"
  ],
  "lat_machine": [
    "Спина к спинке, плечи вниз",
    "Веди локти до уровня плеч",
    "Возвращайся медленно, 2 с"
  ],
  "bayes": [
    "Рука за корпусом, плечо неподвижно",
    "Локоть зафиксирован",
    "Внизу почти выпрями руку до растяжения"
  ],
  "curl": [
    "Локти прижаты к корпусу",
    "Корпус неподвижен, без читинга",
    "Опускай медленно, 2–3 с"
  ],
  "db_curl": [
    "Локти прижаты к корпусу",
    "Запястья прямые, плечи неподвижны",
    "Опускай медленно, 2–3 с"
  ],
  "preacher": [
    "Прижми руки выше локтей к подушке",
    "Вверху на миг напряги бицепс",
    "Внизу медленно, не разгибай рывком"
  ],
  "tri_oh": [
    "Локти близко и направлены вперёд",
    "Плечи неподвижны",
    "Выпрями руки, вернись медленно"
  ],
  "crunch": [
    "Таз неподвижен, округляй спину",
    "Тяни локти к бёдрам",
    "Выдох при скручивании"
  ],
  "decline_crunch": [
    "Подкручивай таз, спина круглая",
    "Вес держи у груди",
    "Опускайся медленно, 3 с"
  ],
  "mb_chest": [
    "Устойчивая стойка, мяч у груди",
    "Резко вытолкни мяч от груди",
    "Полностью выпрями руки, корпус напряжён"
  ],
  "mb_wall": [
    "Начинай бросок движением ног и таза",
    "Бросай взрывно, лови мяч",
    "Корпус напряжён, стойка устойчива"
  ],
  "mb_toss": [
    "Присядь глубоко, мяч между ног",
    "Разогни ноги и таз, брось мяч вперёд",
    "Спина нейтральная, руки расслаблены"
  ],
  "box_squat": [
    "Таз назад, садись на тумбу",
    "Короткая пауза на тумбе, держи напряжение",
    "Вставай резко, дави пятками в пол"
  ],
  "split_squat": [
    "Стопы далеко друг от друга, корпус прямо",
    "Переднее колено идёт по линии носка",
    "Вниз и вверх строго вертикально"
  ],
  "rdl": [
    "Таз назад, колени слегка согнуты",
    "Гриф близко к ногам",
    "Спина нейтрально, вниз до растяжения задней поверхности бедра"
  ],
  "push_press": [
    "Короткий подсед, колени чуть согни",
    "Взрывно толкай ногами",
    "Зафиксируй гриф точно над головой"
  ],
  "neg_pu": [
    "Начни вверху, подбородок над перекладиной",
    "Опускайся медленно, 3–5 с",
    "Лопатки остаются активными"
  ],
  "scap_pu": [
    "Руки прямые",
    "Опусти лопатки",
    "Вверху коротко задержись, возвращайся медленно"
  ],
  "dip_neg": [
    "Начни вверху, плечи опущены",
    "Опускайся медленно, 3–5 с",
    "Корпус слегка вперёд"
  ],
  "pecdeck": [
    "Грудь вперёд, спина на опоре",
    "Своди руки, слегка согнув локти",
    "Возвращайся медленно, растяжка под контролем"
  ],
  "ab_wheel": [
    "Таз подкручен, рёбра вниз",
    "Руки прямо, катись, пока держишь контроль",
    "Возвращайся усилием пресса"
  ],
  "pallof": [
    "Встань боком к тросу, корпус напряжён",
    "Медленно выпрями руки перед грудью",
    "Удерживай корпус от поворота"
  ],
  "row_erg": [
    "Гребок: ноги, корпус, руки",
    "Возврат: руки, корпус, ноги",
    "Спина нейтральная, дыши ровно"
  ],
  "bike_int": [
    "Сиди ровно, плечи расслаблены",
    "На интервалах жми, между ними крути легко",
    "Дыши ровно, держи ритм"
  ],
  "sl_ht": [
    "Лопатки на скамье, таз ровно",
    "Вся стопа на полу, подними таз",
    "Вверху напряги ягодицу, не разворачивайся"
  ],
  "pull_through": [
    "Таз назад, колени слегка согнуты",
    "Спина нейтральная, канат между ног",
    "Выпрямись, вверху напряги ягодицы"
  ],
  "sprint_acc": [
    "Корпус под наклоном, мощно отталкивайся",
    "Шаги короткие, активно работай руками",
    "Сначала разомнись. Между спринтами полностью восстановись"
  ],
  "sprint_fly": [
    "Беги ровно, таз высоко",
    "Расслабься, плечи свободны",
    "Сначала разомнись. Между спринтами полностью восстановись"
  ],
  "bb_curl": [
    "Локти прижаты к корпусу",
    "Корпус неподвижен, без читинга",
    "Опускай медленно, 2–3 с"
  ],
  "cond_chip": [
    "Держи ровный темп с самого начала",
    "Держи технику даже при усталости",
    "Дыши ровно, отдых короткий"
  ],
  "cond_int": [
    "На интервалах ускоряйся, на паузах сбавляй темп",
    "Держи чистую технику",
    "Дыши ровно, дай пульсу снизиться"
  ],
  "scarecrow": [
    "Локти под 90°, руки выше локтей на уровне плеч",
    "Поворачивай предплечья вверх",
    "Лёгкий вес, плечи опущены"
  ],
  "db_kick": [
    "Корпус наклонён, плечо прижато к телу",
    "Разогни руку назад, двигается только предплечье",
    "Вверху задержись 1 с, плечо неподвижно"
  ],
  "sldl": [
    "Ноги почти прямые, таз назад",
    "Спина нейтральная, гриф близко к телу",
    "Опускайся до растяжения задней поверхности бедра"
  ],
  "adduct": [
    "Спина к спинке, таз неподвижен",
    "Своди колени под контролем",
    "Разводи медленно, только в комфортной амплитуде"
  ],
  "situp_w": [
    "Вес прижат к груди",
    "Поднимайся плавно, ноги зафиксированы",
    "Опускайся медленно, 2–3 с"
  ],
  "windmill": [
    "Смотри на вес, рука прямо вверх",
    "Таз уходит назад и в сторону",
    "Спина нейтрально, ниже — пока держишь контроль"
  ],
  "box_fs": [
    "Локти и грудь выше",
    "Таз назад, садись на тумбу",
    "Короткая пауза, вставай с прямым корпусом"
  ],
  "depth_broad": [
    "Спустись с возвышения и мягко приземлись",
    "Коснись пола и сразу прыгни вдаль",
    "Приземляйся мягко на согнутые колени"
  ],
  "sl_hip_ext": [
    "Сгибайся в тазобедренных суставах, тело в одну линию",
    "Поднимайся за счёт ягодицы",
    "Опускайся медленно, без прогиба"
  ],
  "tempo_squat": [
    "Опускайся за 3 с",
    "Внизу держи напряжение, грудь вверх",
    "Резко выпрыгни, приземлись мягко"
  ],
  "hip_9090": [
    "Сиди ровно, спина вытянута",
    "Оба колена согнуты под 90°, меняй сторону",
    "Дыши спокойно, только в комфортной амплитуде"
  ],
  "bb_rollout": [
    "Таз подкручен, рёбра вниз",
    "Руки прямо, катись, пока держишь контроль",
    "Возвращайся усилием пресса"
  ],
  "dragon_neg": [
    "Плечи зафиксированы на скамье, тело прямое",
    "Опускайся медленно, 3–5 с",
    "Подкрути таз, не сгибайся в бёдрах"
  ],
  "lunge_drop": [
    "Из упора прыжком поставь стопы к кистям",
    "Таз низко, грудь вверх",
    "Приземляйся мягко, колени идут по линии носков"
  ],
  "body_saw": [
    "Предплечья на полу, тело прямое",
    "Качайся вперёд-назад с малой амплитудой",
    "Таз подкручен, без прогиба"
  ],
  "pike_pulse": [
    "Таз вверх, ноги прямые",
    "Делай короткие движения плечами",
    "Руки прямо, голова между руками"
  ],
  "front_raise": [
    "Руки почти прямые, до уровня плеч",
    "Корпус неподвижен, не отклоняйся",
    "Опускай медленно, 2–3 с"
  ],
  "floor_press": [
    "Лопатки сведены, стопы упёрты",
    "Локти примерно под 45° к корпусу",
    "На миг коснись пола руками выше локтей"
  ],
  "sa_latpd": [
    "Грудь вперёд, корпус устойчив",
    "Веди локоть вниз к бедру",
    "Вверху выпрями руку под контролем"
  ],
  "cal_press": [
    "Гриф перед собой, лопатки сведены",
    "Опусти гриф к верхней части груди, затем жми над головой",
    "Корпус напряжён, рёбра вниз"
  ]
}
```

`www/cues-ru.js`

```json
{
  "fs": [
    "Гриф на передних дельтах, локти выше, хват свободный.",
    "Садись между пятками. Корпус прямо, колени по линии носков.",
    "Вставай, дави всей стопой в пол, держи локти высоко."
  ],
  "pend": [
    "Спина к спинке, стопы по центру платформы.",
    "Опускайся глубоко и плавно, колени вперёд.",
    "Вставай плавно, вверху оставляй колени чуть согнутыми."
  ],
  "hack": [
    "Прижми спину и таз к спинке. Стопы на ширине плеч.",
    "Опускайся глубоко, пятки на платформе.",
    "Жми серединой стопы, колени не своди."
  ],
  "legpress": [
    "Держи поясницу прижатой к спинке.",
    "Опускай платформу до того, как таз начнёт подкручиваться.",
    "Жми пятками и серединой стопы. Вверху колени чуть согнуты."
  ],
  "goblet": [
    "Гантель у груди, локти вниз.",
    "Садись глубоко между стопами, корпус прямо.",
    "На подъёме веди колени наружу."
  ],
  "trap": [
    "Встань в центр грифа, возьмись за высокие ручки.",
    "Спина нейтрально, грудь вперёд, вес на середине стопы.",
    "Толкай пол ногами, одновременно разгибай таз и колени."
  ],
  "rdl_db": [
    "Слегка согни колени и удерживай угол.",
    "Таз назад, гантели вдоль бёдер, спина нейтрально.",
    "Опустись до растяжения задней поверхности бедра, затем выпрямись."
  ],
  "hyper45": [
    "Расположи валик под тазобедренными суставами.",
    "Опускайся за счёт сгибания в тазобедренных суставах. Спина ровная.",
    "Поднимись ягодицами до прямой линии, без переразгибания."
  ],
  "glute_bridge": [
    "Лопатки на полу, гриф на тазе через мягкую накладку.",
    "Подбородок к груди, рёбра вниз.",
    "Подними таз до прямой линии, напряги ягодицы, пауза 1 с."
  ],
  "ht": [
    "Лопатки на краю скамьи, гриф на тазе.",
    "Вверху голени вертикально, подбородок к груди.",
    "Подними таз до прямой линии, задержись 1 с, опусти плавно."
  ],
  "ht_machine": [
    "Поставь упор на таз.",
    "Подбородок к груди, рёбра вниз.",
    "Подними таз, напряги ягодицы, опусти плавно."
  ],
  "legext": [
    "Ось тренажёра напротив колена, спина к спинке.",
    "Разогни ноги и ненадолго задержись.",
    "Опускай вес плавно."
  ],
  "calf_st": [
    "Передняя часть стопы на краю платформы, колени почти прямые.",
    "Опусти пятки до растяжения, задержись на 2 с.",
    "Поднимайся на носки как можно выше, без пружины."
  ],
  "calf_lp": [
    "Передняя часть стопы на краю платформы, ноги почти прямые.",
    "Опусти пятки до растяжения.",
    "Выжми платформу передней частью стопы."
  ],
  "calf_smith": [
    "Передняя часть стопы на степе, гриф на трапециях.",
    "Опусти пятки до растяжения, задержись внизу.",
    "Поднимись на носки как можно выше, опустись плавно."
  ],
  "calf_se": [
    "Колени под валиком, передняя часть стопы на краю платформы.",
    "Опусти пятки до растяжения.",
    "Поднимись на носки, напряги икры вверху."
  ],
  "bench": [
    "Сведи и опусти лопатки, стопы плотно на полу.",
    "Опускай гриф к нижней части груди, локти под углом 45–70°.",
    "Жми вверх и чуть назад, таз на скамье."
  ],
  "smith_bench": [
    "Поставь скамью так, чтобы гриф шёл к нижней части груди.",
    "Лопатки сведены, локти под углом к корпусу.",
    "Жми плавно, до почти прямых рук."
  ],
  "dip_machine": [
    "Сядь плотно, рукояти по бокам.",
    "Жми рукояти вниз, выпрямляя руки.",
    "Возвращай рукояти плавно до растяжения груди."
  ],
  "incl": [
    "Скамья под углом 30–45°, лопатки сведены.",
    "Опускай гантели к верхней части груди.",
    "Жми вверх по небольшой дуге."
  ],
  "incl_machine": [
    "Выставь сиденье: рукояти на уровне верха груди.",
    "Прижми лопатки к спинке.",
    "Жми до почти прямых рук, возвращай рукояти плавно."
  ],
  "db_ohp": [
    "Прижми спину к спинке, гантели у плеч.",
    "Жми вверх, предплечья вертикально.",
    "Опускай до уровня ушей под контролем."
  ],
  "latpd_heavy": [
    "Зафиксируй бёдра валиком.",
    "Тяни рукоять к верхней части груди, локти вниз.",
    "Отпусти рукоять вверх до растяжения широчайших."
  ],
  "pullup": [
    "Повисни на прямых руках, плечи немного вниз.",
    "Веди локти к рёбрам до выхода подбородка над перекладиной.",
    "Опускайся до прямых рук, без раскачки."
  ],
  "chinup": [
    "Хват снизу, на ширине плеч.",
    "Тянись подбородком над перекладиной.",
    "Опускайся плавно до прямых рук."
  ],
  "latpd": [
    "Сядь ровно, бёдра под валиком.",
    "Тяни к верхней части груди, лопатки вниз.",
    "Отпусти рукоять плавно до растяжения."
  ],
  "row": [
    "Грудь на упоре, руки свободно вниз.",
    "Тяни гантели к нижним рёбрам, своди лопатки.",
    "Опускай до растяжения спины."
  ],
  "face": [
    "Блок на уровне лица, возьмись за канат.",
    "Тяни к лицу, разводи локти и концы каната.",
    "Задержись, затем плавно отпусти канат."
  ],
  "preacher": [
    "Прижми руки выше локтей к опоре.",
    "Сгибай руки в локтях, не отрывая их от опоры.",
    "Опускай плавно, до почти прямых рук."
  ],
  "captain": [
    "Предплечья на упорах, спина прижата к спинке.",
    "Поднимай колени к груди, подкручивай таз.",
    "Опускай плавно."
  ],
  "box": [
    "Встань перед низкой тумбой.",
    "Резко выпрыгни и мягко приземлись на всю стопу.",
    "Спустись шагом."
  ],
  "squat_jump": [
    "Слегка присядь, руки назад.",
    "Выпрыгни как можно выше.",
    "Приземлись мягко, погаси движение."
  ]
}
```

## E. Push-Texte

```ts
    plan: ['План обновлён', 'В плане есть изменения от тренера.'],
    form: ['Видео на проверку', '{n}: видео для проверки техники.'],
    formc: ['Комментарий к технике', 'К твоему видео есть комментарий от тренера.']
```

## F. Datenschutzerklärung RU

```html
<section lang="ru" id="ru">
<h1>Политика конфиденциальности</h1>
<p class="muted">Hybridblock · Последнее обновление: 13 ноября 2026 года</p>
<div class="box"><b>Кратко</b> Hybridblock обрабатывает данные о тренировках, питании и здоровье исключительно для работы приложения. Приложение не показывает рекламу, не отслеживает пользователей и не продаёт данные. Данные о здоровье из Health Connect считываются только с разрешения пользователя и никогда не передаются третьим лицам. Аккаунт и все данные можно в любое время удалить в приложении.</div>

<h2>1. Контролёр персональных данных</h2>
<p><mark>[First and last name]</mark><br><mark>[Street, postcode, city]</mark><br>Электронная почта: <mark>[contact email]</mark></p>

<h2>2. Обрабатываемые данные</h2>
<p>Данные аккаунта обрабатываются только при его создании: имя пользователя, отображаемое имя, язык, хеш пароля, хеш кода восстановления и, по желанию, адрес электронной почты, используемый исключительно для отправки ссылок на сброс пароля. Для управления аккаунтами оператор приложения имеет доступ к имени пользователя, роли, сведениям о тренере, последнем входе и последней синхронизации. Данные о тренировках, питании и здоровье оператору недоступны.</p>
<p>Также обрабатываются записи пользователя (планы, подходы, активности, приёмы пищи, вес и замеры тела, заметки; фотографии прогресса остаются на устройстве), данные о здоровье (ограничения, указанные в анкете, пульс, пульс в покое, HRV, сон, шаги, калории, VO₂max, вес и тренировки из Health Connect), данные о цикле (по желанию, на основании отдельного согласия, в разделе, доступном только пользователю, с передачей тренеру только при включении этой функции), данные о местоположении (маршруты GPS, только во время записи тренировки) и показания пульса в реальном времени с нагрудного Bluetooth-датчика во время записи.</p>
<p><b>Таймер окна питания</b> используется по желанию. Перед включением приложение задаёт вопросы о здоровье, например о беременности, расстройствах пищевого поведения и приёме препаратов от диабета. Ответы не сохраняются и не передаются. Они используются только в момент заполнения, чтобы определить, доступен ли таймер. Приложение хранит дату заполнения анкеты, выбранное окно, время начала и состояние таймера. По возрасту, росту и весу приложение проверяет на устройстве, должен ли таймер оставаться заблокированным (возраст до 18 лет или ИМТ ниже 18,5). Напоминания об окне питания создаются только на устройстве.</p>

<h2>3. Цели и правовые основания обработки</h2>
<p>Предоставление функций приложения осуществляется на основании подпункта (b) пункта 1 статьи 6 Общего регламента ЕС по защите данных (GDPR). Данные о здоровье обрабатываются на основании явного согласия по подпункту (a) пункта 2 статьи 9 GDPR. Согласие можно в любое время отозвать, удалив данные в приложении («Настройки» → «Конфиденциальность»).</p>
<p>Работа с тренером. После принятия приглашения тренеру доступны план, прогресс тренировок, питание, вес и показатели здоровья. Сообщения и фотографии из переписки с тренером хранятся в облаке (Supabase, центр обработки данных во Франкфурте). Доступ к ним есть только у двух участников чата. Фотографии находятся в закрытом хранилище и отображаются только по ссылкам с ограниченным сроком действия. Личные заметки тренера об атлете доступны только тренеру. Голосовые сообщения хранятся в том же закрытом хранилище, что и фотографии. Микрофон используется только во время записи голосового сообщения.</p>
<p>Тренер может настроить автоматические сообщения, например приветствие, напоминание о чек-ине или сообщение после нескольких дней без тренировок. Для этого сервис раз в день проверяет дату последней тренировки и наличие ответа на чек-ин. Ответы на анкету чек-ина и отметки о выполнении привычек хранятся вместе с остальными данными приложения и доступны тренеру. Имя, логотип и видео упражнений, добавленные тренером в профиль, видят только тренер и его атлеты. Видео по внешним ссылкам, например на YouTube, открываются у соответствующего поставщика сервиса. При этом применяется его политика конфиденциальности. В том же облаке хранятся данные о совместных встречах (дата, время, место и статус) и записи тренировок, которые тренер вносит за атлета во время совместной тренировки. Эти данные доступны только двум участникам.</p>
<p>Общий доступ к тренировочным планам. Сохранённые планы хранятся в облаке. Частные планы видны только владельцу, планы с настройкой «Только мои атлеты» — атлетам этого тренера. Общедоступные планы, включая название, описание и отображаемое имя автора, видны всем пользователям, вошедшим в аккаунт. Личные заметки, цели и дата начала не передаются. Любой план в любое время можно снова сделать частным или удалить. По ссылке или коду доступа любой их получатель может просмотреть план (название, описание, отображаемое имя автора и структуру) даже без аккаунта. Ссылку можно отключить в любое время. Если план отправлен на проверку, группа проверки получает к нему доступ и сохраняет результат и его обоснование вместе с планом.</p>
<p>При использовании плана из библиотеки или сообщества фиксируются план, дата начала и последний день использования. Другим пользователям видно только общее число активных пользователей плана за последние 30 дней, начиная с пяти человек. Поставленные звёзды учитываются только в средней оценке. Средняя оценка отображается при наличии как минимум трёх оценок. Учёт использования можно отключить в разделе «Мои планы». При этом данные об использовании удаляются. Правовое основание — подпункт (f) пункта 1 статьи 6 GDPR (законный интерес в обеспечении полезности библиотеки). Пользователь вправе возразить против этой обработки. Данные об использовании удаляются через 180 дней после последнего использования. В общедоступных планах и по ссылкам доступа также видны отображаемое имя автора, наличие у него роли тренера, цель, уровень, место, уровень доказательности и статус проверки.</p>
<p>При подаче жалобы сохраняются её основание, описание и данные аккаунта заявителя для рассмотрения жалобы и уведомления о решении. Личность заявителя автору плана не раскрывается. Жалобы и решения удаляются через 12 месяцев после принятия решения. До этого они хранятся даже при удалении плана. Если план скрыт, основание и обоснование решения сохраняются и предоставляются автору. Автор может обжаловать решение в течение 6 месяцев. Решения принимаются человеком (Акт ЕС о цифровых услугах, статьи 16, 17 и 20). Проверку и модерацию выполняет оператор приложения. Правовым основанием служит подпункт (b) пункта 1 статьи 6 GDPR (исполнение договора) или подпункт (c) того же пункта (исполнение юридической обязанности).</p>

<h2>4. Хранение данных</h2>
<p>Данные хранятся на устройстве. При наличии аккаунта данные также хранятся у Supabase Inc. во Франкфурте-на-Майне, Германия (регион eu-central-1). Supabase Inc. обрабатывает данные по поручению контролёра в соответствии со статьёй 28 GDPR.</p>

<h2>5. Health Connect</h2>
<p>Hybridblock считывает только те типы данных, к которым пользователь разрешил доступ. При наличии разрешения приложение записывает в Health Connect сведения о записанных в нём тренировках (тренировка, маршрут, дистанция, калории, пульс). Использование данных, полученных из Health Connect, соответствует <a href="https://support.google.com/googleplay/android-developer/answer/12991134">правилам предоставления разрешений Health Connect</a>, включая требования об ограниченном использовании (Limited Use). Данные не используются для рекламы и не продаются. Они не передаются третьим лицам, кроме тренера при его наличии.</p>

<h2>6. Другие сервисы</h2>
<p><b>Видео для проверки техники и фотографии чек-ина для тренера</b> обрабатываются только при наличии тренера и только при загрузке видео к упражнению или включении передачи фотографий прогресса (на основании согласия). Видео сохраняются в уменьшенном разрешении и без звука. Место хранения — закрытое хранилище Supabase в центре обработки данных во Франкфурте (ЕС). Доступ предоставляется только пользователю и его тренеру. Материалы удаляются через 90 дней. Пользователь может удалить их в любое время. Правовые основания — подпункты (a) и (b) пункта 1 статьи 6 GDPR.</p>
<p><b>Google Gemini (распознавание еды с помощью ИИ)</b> используется только при выборе «Описать» или «Фото» во время записи еды и при наличии предварительного согласия. Описание или уменьшенная фотография передаются через наш сервер (Supabase, ЕС) в API Gemini компании Google Ireland Ltd. без имени и данных аккаунта. Текст и фотография у нас не сохраняются. Хранятся только записанные пользователем продукты и суточный счётчик для контроля лимита использования (30 дней). Правовое основание — согласие по подпункту (a) пункта 1 статьи 6 GDPR. На платном тарифе API компания Google обрабатывает данные по поручению контролёра и не использует их для обучения своих моделей. Возможна передача данных в США в рамках EU-US Data Privacy Framework. Фотографировать следует только еду, без людей в кадре.</p>
<p><b>Push-уведомления (Firebase Cloud Messaging)</b> используются только в приложении для Android и при наличии разрешения на уведомления. Идентификатор устройства (push-токен) хранится вместе с идентификатором аккаунта и выбранным языком (Supabase, ЕС). При новом сообщении, изменении плана тренером или появлении комментария к проверке техники на устройство через Firebase Cloud Messaging (Google Ireland Ltd.) отправляется краткое уведомление, например «Новое сообщение» с отображаемым именем отправителя. Содержимое сообщений, данные о тренировках и здоровье не отправляются. Возможна передача данных в США в рамках EU-US Data Privacy Framework. Токен удаляется при выходе из аккаунта или удалении аккаунта. Уведомления можно в любое время отключить в настройках Android. Правовые основания — подпункт (b) пункта 1 статьи 6 GDPR (функции работы с тренером) и подпункт (a) пункта 1 статьи 6 GDPR (согласие на уведомления).</p>
<p>Другие сервисы и передаваемые данные: Open Food Facts (штрихкод или поисковый запрос при поиске продукта), картографические тайлы OpenFreeMap и картографические данные © участники OpenStreetMap (IP-адрес без маршрута), изображения упражнений с exercise-dataset.com (IP-адрес), GitHub Pages для веб-версии (технические данные доступа). Если в аккаунте указан адрес электронной почты для сброса пароля, он передаётся почтовому сервису Resend только при запросе ссылки на сброс пароля.</p>

<h2>7. Срок хранения и удаление</h2>
<p>Данные хранятся до их удаления пользователем. В приложении («Настройки» → «Конфиденциальность») можно удалить все данные на устройстве и безвозвратно удалить аккаунт со всеми данными в облаке. По этим вопросам также можно обратиться по указанному выше адресу.</p>

<h2>8. Права субъекта данных</h2>
<p>Предусмотрены права на доступ к данным, исправление, удаление, ограничение обработки, переносимость данных (экспорт в приложении), возражение против обработки и отзыв согласия, а также право подать жалобу в надзорный орган.</p>

<h2>9. Статус приложения</h2>
<p>Hybridblock — приложение для тренировок и питания. Оно не является медицинским изделием и не ставит диагнозы.</p>
</section>
```

## G. Manifest

Тренировки с авторегуляцией, питание с учётом расхода калорий и данные о здоровье из Zepp.

## H. Offene Fragen

- **A, `www/lang-ru.js`.** Alle 5.416 Schlüssel wurden einzeln auf formale Abweichungen und Glossar- bzw. Anredeindikatoren geprüft. Ein vollständiger zweisprachiger Satz-für-Satz-Abgleich der übrigen Texte samt Dialogkontext steht noch aus.
- **B, `www/app.js` (`Satz {n}` + `Meter` bzw. `Wiederholungen`).** Das zusätzliche Vorleselabel in der Satzzeile wird ebenfalls teilweise auf Deutsch zusammengesetzt. Der genaue Schlüssel hängt von der Übungsart ab. Die drei ausdrücklich erfassten Satz-Labels stehen in B.
- **B, `www/nutri.js` (`kcal ·`, `g`, `kcal<small>`).** In der Mahlzeitenkarte gibt es weitere fest codierte Einheiten. Die Zeile `0 / 651 kcal` aus der Stand-Datei entsteht im Filter `nrMeal` in `www/micro.js`.
- **B, `www/planwide.js` (`Ganzkörper A`).** `s.title` kann einen vorgegebenen oder einen selbst vergebenen Namen enthalten. `Всё тело A` ist die vorhandene Übersetzung für den vorgegebenen Namen.
- **C, `www/evidence-ru.json`.** Alle 546 IDs, Kartenstrukturen und Quizoptionen wurden formal abgeglichen. Die Korrekturen umfassen unter anderem die Themen in `PACE-*`, `PAUSE-*` und `CARB-*`, die im Russischen häufig nur mit einer allgemeinen Rubrik bezeichnet waren. Der vollständige fachliche und sprachliche Einzelabgleich aller Lernkarten steht noch aus.
- **D, `dip`, `dip_w`, `dip_assist`.** Die Dateien beschreiben die Tiefe im Verhältnis von Schulter und Ellbogen unterschiedlich. Die bestehenden Tiefenangaben sind bis zum Abgleich mit der vorgesehenen Übungsausführung beibehalten.
- **D, `ham_walk` und `towel_curl`.** Bei `ham_walk` nennt die Vorlage Schritte mit den Händen, während der Übungsname „Hamstring Walkouts“ lautet. Bei `towel_curl` nennt die Registrierung einen Inverted Curl fürs Bizepstraining, der Hinweis fordert aber, die Fersen zum Gesäß zu ziehen. Für die Korrektur fehlt eine eindeutige Bewegungsvorlage.
- **D, `mb_wall`.** `cues.js` beschreibt den Wurf aus Hüfte und Beinen. `cues-ru.js` beschreibt einen Brustpass. Welche Wurfvariante das Demo zeigt, ist offen.
- **F, `www/privacypolicy.html`, Kurzfassung und § 5.** Die englische Kurzfassung schließt eine Weitergabe von Health-Connect-Daten an Dritte aus. § 5 nennt eine Ausnahme für einen vorhandenen Trainer. Die russische Fassung gibt beide Stellen entsprechend der Quelle wieder.
