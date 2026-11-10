// Srpski nazivi i ručno proverene dopune izvornih podataka.
// Glavni gradovi: identitet grada iz mledoze/countries (ODbL), ovde samo prevod na ćirilicu.
// Činjenice o kontinentima i okeanima: opšte poznate geografske činjenice, izvor naveden uz svaku.

// Nazivi država kada prosta transliteracija naziva iz mledoze/countries (srp) nije dobra za dete.
exports.nameOverride = {
  COD: { n: 'ДР Конго', full: 'Демократска Република Конго' },
  COG: { n: 'Конго', full: 'Република Конго' },
  USA: { n: 'САД', full: 'Сједињене Америчке Државе' },
  GBR: { n: 'Велика Британија', full: 'Уједињено Краљевство' },
  ARE: { n: 'Емирати', full: 'Уједињени Арапски Емирати' },
  CAF: { n: 'Централноафричка Република' },
  BIH: { n: 'Босна и Херцеговина' },
  KNA: { n: 'Свети Китс и Невис' },
  VCT: { n: 'Свети Винсент и Гренадини' },
  STP: { n: 'Сао Томе и Принсипе' },
  ZAF: { n: 'Јужна Африка', full: 'Јужноафричка Република' },
  NLD: { n: 'Холандија' },
};

exports.capital = {
  AFG:'Кабул',AGO:'Луанда',ALB:'Тирана',AND:'Андора ла Веља',ARE:'Абу Даби',ARG:'Буенос Ајрес',ARM:'Јереван',
  ATG:'Сент Џонс',AUS:'Канбера',AUT:'Беч',AZE:'Баку',BDI:'Гитега',BEL:'Брисел',BEN:'Порто Ново',BFA:'Уагадугу',
  BGD:'Дака',BGR:'Софија',BHR:'Манама',BHS:'Насау',BIH:'Сарајево',BLR:'Минск',BLZ:'Белмопан',BOL:'Сукре',
  BRA:'Бразилија',BRB:'Бриџтаун',BRN:'Бандар Сери Бегаван',BTN:'Тимпу',BWA:'Габороне',CAF:'Бангуи',CAN:'Отава',
  CHE:'Берн',CHL:'Сантијаго',CHN:'Пекинг',CIV:'Јамусукро',CMR:'Јаунде',COD:'Киншаса',COG:'Бразавил',COL:'Богота',
  COM:'Морони',CPV:'Праја',CRI:'Сан Хосе',CUB:'Хавана',CYP:'Никозија',CZE:'Праг',DEU:'Берлин',DJI:'Џибути',
  DMA:'Розо',DNK:'Копенхаген',DOM:'Санто Доминго',DZA:'Алжир',ECU:'Кито',EGY:'Каиро',ERI:'Асмара',ESP:'Мадрид',
  EST:'Талин',ETH:'Адис Абеба',FIN:'Хелсинки',FJI:'Сува',FRA:'Париз',FSM:'Паликир',GAB:'Либревил',GBR:'Лондон',
  GEO:'Тбилиси',GHA:'Акра',GIN:'Конакри',GMB:'Банжул',GNB:'Бисао',GNQ:'Сијудад де ла Паз',GRC:'Атина',GRD:'Сент Џорџиз',
  GTM:'Гватемала',GUY:'Џорџтаун',HND:'Тегусигалпа',HRV:'Загреб',HTI:'Порт о Пренс',HUN:'Будимпешта',IDN:'Џакарта',
  IND:'Њу Делхи',IRL:'Даблин',IRN:'Техеран',IRQ:'Багдад',ISL:'Рејкјавик',ISR:'Јерусалим',ITA:'Рим',JAM:'Кингстон',
  JOR:'Аман',JPN:'Токио',KAZ:'Астана',KEN:'Најроби',KGZ:'Бишкек',KHM:'Пном Пен',KIR:'Јужна Тарава',KNA:'Бастер',
  KOR:'Сеул',KWT:'Кувајт',LAO:'Вијентијан',LBN:'Бејрут',LBR:'Монровија',LBY:'Триполи',LCA:'Кастри',LIE:'Вадуз',
  LKA:'Коломбо',LSO:'Масеру',LTU:'Вилњус',LUX:'Луксембург',LVA:'Рига',MAR:'Рабат',MCO:'Монако',MDA:'Кишињев',
  MDG:'Антананариво',MDV:'Мале',MEX:'Мексико Сити',MHL:'Мајуро',MKD:'Скопље',MLI:'Бамако',MLT:'Валета',MMR:'Нејпјидо',
  MNE:'Подгорица',MNG:'Улан Батор',MOZ:'Мапуто',MRT:'Нуакшот',MUS:'Порт Луј',MWI:'Лилонгве',MYS:'Куала Лумпур',
  NAM:'Виндхук',NER:'Нијамеј',NGA:'Абуџа',NIC:'Манагва',NLD:'Амстердам',NOR:'Осло',NPL:'Катманду',NRU:'Јарен',
  NZL:'Велингтон',OMN:'Мускат',PAK:'Исламабад',PAN:'Панама',PER:'Лима',PHL:'Манила',PLW:'Нгерулмуд',PNG:'Порт Морсби',
  POL:'Варшава',PRK:'Пјонгјанг',PRT:'Лисабон',PRY:'Асунсион',PSE:'Рамала',QAT:'Доха',ROU:'Букурешт',RUS:'Москва',
  RWA:'Кигали',SAU:'Ријад',SDN:'Картум',SEN:'Дакар',SGP:'Сингапур',SLB:'Хонијара',SLE:'Фритаун',SLV:'Сан Салвадор',
  SMR:'Сан Марино',SOM:'Могадиш',SRB:'Београд',SSD:'Џуба',STP:'Сао Томе',SUR:'Парамарибо',SVK:'Братислава',
  SVN:'Љубљана',SWE:'Стокхолм',SWZ:'Лобамба',SYC:'Викторија',SYR:'Дамаск',TCD:'Нџамена',TGO:'Ломе',THA:'Бангкок',
  TJK:'Душанбе',TKM:'Ашхабад',TLS:'Дили',TON:'Нукуалофа',TTO:'Порт оф Спејн',TUN:'Тунис',TUR:'Анкара',TUV:'Фунафути',
  TZA:'Додома',UGA:'Кампала',UKR:'Кијев',URY:'Монтевидео',USA:'Вашингтон',UZB:'Ташкент',VAT:'Ватикан',VCT:'Кингстаун',
  VEN:'Каракас',VNM:'Ханој',VUT:'Порт Вила',WSM:'Апија',YEM:'Сана',ZAF:'Преторија',ZMB:'Лусака',ZWE:'Хараре',
};

// Teritorije koje nisu države (prikazuju se na mapi bez kartice države).
exports.territory = {
  GRL:'Гренланд',PRI:'Порторико',FLK:'Фокландска Острва',ESH:'Западна Сахара',TWN:'Тајван',NCL:'Нова Каледонија',
  PYF:'Француска Полинезија',FRO:'Фарска Острва',HKG:'Хонгконг',MAC:'Макао',BMU:'Бермуди',GUM:'Гвам',
  SGS:'Јужна Џорџија',ATF:'Француске јужне земље',ATA:'Антарктик',ALA:'Оланд',IMN:'Острво Ман',JEY:'Џерзи',GGY:'Гернзи',
  ABW:'Аруба',CUW:'Курасао',SXM:'Свети Мартин',MAF:'Свети Мартин',BLM:'Свети Бартоломеј',CYM:'Кајманска Острва',
  TCA:'Туркс и Кајкос',VGB:'Британска Девичанска Острва',VIR:'Америчка Девичанска Острва',AIA:'Ангвила',MSR:'Монтсерат',
  ASM:'Америчка Самоа',MNP:'Северна Маријанска Острва',SHN:'Света Јелена',PCN:'Питкерн',NIU:'Ниуе',COK:'Кукова Острва',
  SPM:'Сен Пјер и Микелон',WLF:'Валис и Футуна',HMD:'Херд и Макдоналд',NFK:'Норфолк',IOT:'Британска територија Индијског океана',
};
// Kome teritorija pripada (sovereign država), za karticu „Ово припада држави …“.
exports.territorySov = { US1:'USA', GB1:'GBR', NZ1:'NZL', NL1:'NLD', FR1:'FRA', FI1:'FIN', DN1:'DNK', CH1:'CHN', AU1:'AUS' };

// Spajanja po međunarodno priznatom stanju kako ga vodi Republika Srbija.
exports.merge = { KOS:'SRB', CYN:'CYP', SOL:'SOM' };

exports.continents = {
  EU:{ n:'Европа', c:'#7FB3E0', facts:[
    'Европа је други најмањи континент.',
    'Највиша планина Европе је Елбрус (5.642 m), на Кавказу.',
    'Дунав протиче кроз више држава него било која друга река на свету.',
  ], src:'Енциклопедија Британика, Wikipedia (Seven Summits, Danube)' },
  AS:{ n:'Азија', c:'#F2C46B', facts:[
    'Азија је највећи континент и на њој живи највише људи.',
    'Највиша планина на свету, Монт Еверест (8.849 m), налази се у Азији.',
    'Најдубље језеро на свету, Бајкалско језеро, налази се у Азији.',
  ], src:'Енциклопедија Британика, Wikipedia (Mount Everest, Lake Baikal)' },
  AF:{ n:'Африка', c:'#E89B6A', facts:[
    'Африка је други највећи континент.',
    'Сахара је највећа врела пустиња на свету.',
    'Највиша планина Африке је Килиманџаро (5.895 m).',
  ], src:'Енциклопедија Британика, Wikipedia (Sahara, Kilimanjaro)' },
  NA:{ n:'Северна Америка', c:'#9FD08A', facts:[
    'Северна Америка се пружа од леденог севера до топлих острва Кариба.',
    'Највеће острво на свету, Гренланд, налази се у Северној Америци.',
    'Највиша планина Северне Америке је Денали (6.190 m), на Аљасци.',
  ], src:'Енциклопедија Британика, Wikipedia (Greenland, Denali)' },
  SA:{ n:'Јужна Америка', c:'#C9A0DC', facts:[
    'Амазонска прашума у Јужној Америци је највећа прашума на свету.',
    'Анди су најдужи планински ланац на копну.',
    'Највиша планина Јужне Америке је Аконкагва (6.961 m).',
  ], src:'Енциклопедија Британика, Wikipedia (Amazon rainforest, Andes, Aconcagua)' },
  OC:{ n:'Аустралија и Океанија', c:'#F0A3B5', facts:[
    'Аустралија је најмањи континент.',
    'Велики корални гребен код Аустралије највећи је корални гребен на свету.',
    'Кенгури и коале живе само у Аустралији.',
  ], src:'Енциклопедија Британика, Wikipedia (Great Barrier Reef, Kangaroo, Koala)' },
  AN:{ n:'Антарктик', c:'#E6EEF5', facts:[
    'Антарктик је најхладнији континент на свету.',
    'Готово цео Антарктик је прекривен дебелим ледом.',
    'На Антарктику нема држава. Тамо живе научници и пингвини.',
  ], src:'Енциклопедија Британика, Wikipedia (Antarctica)' },
};

// Položaj natpisa okeana [lon, lat] i činjenice.
exports.oceans = [
  { id:'PAC', n:'Тихи океан', at:[[-140,8],[165,18]], facts:[
    'Тихи океан је највећи и најдубљи океан на свету.',
    'Најдубље место на Земљи, Маријански ров, налази се у Тихом океану.',
    'Тихи океан је већи од целог копна на Земљи заједно.' ], src:'Енциклопедија Британика, Wikipedia (Pacific Ocean, Mariana Trench)' },
  { id:'ATL', n:'Атлантски океан', at:[[-38,25]], facts:[
    'Атлантски океан је други највећи океан.',
    'Он раздваја Европу и Африку од Северне и Јужне Америке.' ], src:'Енциклопедија Британика, Wikipedia (Atlantic Ocean)' },
  { id:'IND', n:'Индијски океан', at:[[78,-22]], facts:[
    'Индијски океан је трећи највећи океан.',
    'То је најтоплији океан на свету.' ], src:'Енциклопедија Британика, Wikipedia (Indian Ocean)' },
  { id:'SOU', n:'Јужни океан', at:[[20,-60]], facts:[
    'Јужни океан окружује Антарктик.',
    'У њему живе пингвини, фоке и китови.' ], src:'Енциклопедија Британика, Wikipedia (Southern Ocean)' },
  { id:'ARC', n:'Северни ледени океан', at:[[10,80]], facts:[
    'Северни ледени океан је најмањи и најхладнији океан.',
    'Велики део године прекривен је ледом. Ту живе бели медведи.' ], src:'Енциклопедија Британика, Wikipedia (Arctic Ocean, Polar bear)' },
];

// Reke: srpski naziv i nazivi delova u Natural Earth podacima.
exports.rivers = [
  { id:'nil', n:'Нил', seg:['Nile','Victoria Nile','Albert Nile','Bahr el Jebel','El Bahr el Abyad','Rosetta Branch','Damietta Branch','Kagera','El Bahr el Azraq','Abay'],
    fact:'Нил је једна од две најдуже реке на свету.' },
  { id:'amazon', n:'Амазон', seg:['Amazonas','Ucayali'], fact:'Амазон носи више воде од било које друге реке на свету.' },
  { id:'jangce', n:'Јангцекјанг', seg:['Yangtze','Chang Jiang','Jinsha','Tongtian','Tuotuo'], fact:'Јангцекјанг је најдужа река Азије.' },
  { id:'misisipi', n:'Мисисипи', seg:['Mississippi'] },
  { id:'misuri', n:'Мисури', seg:['Missouri','Madison'] },
  { id:'jenisej', n:'Јенисеј', seg:['Yenisey','Verkhniy Yenisey','Malyy Yenisey'] },
  { id:'ob', n:'Об', seg:['Ob'] },
  { id:'irtis', n:'Иртиш', seg:['Irtysh','Ertis','Ertix'] },
  { id:'lena', n:'Лена', seg:['Lena'] },
  { id:'amur', n:'Амур', seg:['Amur','Heilong Jiang','Argun’'] },
  { id:'huanghe', n:'Хуангхе', seg:['Huang'] },
  { id:'kongo', n:'Конго', seg:['Congo','Lualaba'] },
  { id:'niger', n:'Нигер', seg:['Niger'] },
  { id:'zambezi', n:'Замбези', seg:['Zambezi'] },
  { id:'ganges', n:'Ганг', seg:['Ganges'] },
  { id:'ind', n:'Инд', seg:['Indus'] },
  { id:'mekong', n:'Меконг', seg:['Mekong','Lancang'] },
  { id:'eufrat', n:'Еуфрат', seg:['Euphrates','Firat','Al Furat','Shatt al-Arab'] },
  { id:'tigar', n:'Тигар', seg:['Tigris','Dicle'] },
  { id:'volga', n:'Волга', seg:['Volga'], fact:'Волга је најдужа река у Европи.' },
  { id:'dunav', n:'Дунав', thruAdd:['MDA'], seg:['Danube','Donau','Bratul Chillia','Bratul Sfântu Gheorghe','Bratul Sulina','Borcea'],
    fact:'Дунав протиче кроз Београд и улива се у Црно море.' },
  { id:'rajna', n:'Рајна', seg:['Rhine','Rhein','Rhin'] },
  { id:'dnjepar', n:'Дњепар', seg:['Dnipro'] },
  { id:'temza', n:'Темза', seg:['Thames'] },
  { id:'sena', n:'Сена', seg:['Seine'] },
  { id:'ural', n:'Урал', seg:['Ural'] },
  { id:'orinoko', n:'Ориноко', seg:['Orinoco'] },
  { id:'parana', n:'Парана', seg:['Paraná'] },
  { id:'marej', n:'Мареј', seg:['Murray'] },
  { id:'jukon', n:'Јукон', seg:['Yukon'] },
  { id:'makenzi', n:'Макензи', seg:['Mackenzie'] },
  { id:'kolorado', n:'Колорадо', seg:['Colorado'] },
  // Reke Srbije iz detaljnijeg (10m) skupa
  { id:'sava', n:'Сава', seg10:['Sava'], fact:'Сава се улива у Дунав у Београду.' },
  { id:'tisa', n:'Тиса', seg10:['Tisa'] },
  { id:'drina', n:'Дрина', seg10:['Drina'] },
  { id:'morava', n:'Морава', seg10:['Morava'], box:[19.5,42,23,45] },
];

// Velika jezera (Natural Earth 50m, naziv → srpski).
exports.lakes = {
  'Lake Baikal':'Бајкалско језеро','Lake Victoria':'Викторијино језеро','Lake Tanganyika':'Тангањика',
  'Lake Superior':'Горње језеро','Lake Michigan':'Мичиген','Lake Huron':'Хјурон','Lake Malawi':'Малави',
  'Lago Titicaca':'Титикака','Lake Balkhash':'Балхаш','Lake Ladoga':'Ладога','Caspian Sea':'Каспијско језеро',
  'Lake Chad':'Чад','Great Bear Lake':'Велико медвеђе језеро','Great Slave Lake':'Велико ропско језеро',
};
