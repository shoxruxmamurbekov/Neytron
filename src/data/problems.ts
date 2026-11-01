import type { Problem } from '../types';

export const problems: Problem[] = [
  {
    id: 'breaker-trips',
    title: 'Avtomat tez-tez uchib qolyapti',
    summary: 'Avtomatik himoya (avtomat) yuklama yoki qisqa tutashuv tufayli o‘chadi.',
    category: 'Himoya',
    emergency: false,
    description:
      'Avtomat (MCB yoki RCD) bir necha marta o‘chib, qayta ulanganda yana uchsa, bu zanjirda ortiqcha yuklama yoki nosozlik borligini bildiradi.',
    possibleCauses: [
      'Bir vaqtda juda ko‘p quvvatli jihoz ulangan (isitgich, choynak, konditsioner)',
      'Ulanish nuqtasida qisqa tutashuv yoki izolyatsiya shikastlanishi',
      'Namlik yoki ifloslik tufayli rozetka/vilkada nosozlik',
      'Avtomat eskirgan yoki mos emas',
    ],
    warningSigns: [
      'Avtomat tegiga qo‘l tegsa issiq',
      'Rozetka yoki vilkadan kuyish hidi',
      'Avtomat qayta ulanganda darhol uchsa',
    ],
    safeObservations: [
      'Avtomat o‘chganda qaysi xonadagi jihozlar ulangan edi, yozib qo‘ying',
      'Barcha jihozlarni o‘chirib, avtomatni qayta ulab ko‘ring (faqat quruq qo‘l bilan va yuklamani kamaytirib)',
      'Bitta-bitta jihoz ulab, qaysi biri uchirishini aniqlang',
    ],
    nextSteps: [
      'Shubhali jihozni vaqtincha ishlatmang',
      'Avtomat darhol uchsa — qayta-qayta ulamang',
      'Muammo takrorlansa, malakali elektrikni chaqiring',
    ],
    contactElectrician: [
      'Avtomat qayta ulanganda ham darhol uchsa',
      'Avtomat yoki rozetka qiziyotgan bo‘lsa',
      'Ulanishda kuyish hidi yoki ko‘rinadigan shikastlanish bo‘lsa',
    ],
  },
  {
    id: 'outlet-dead',
    title: 'Rozetka ishlamayapti',
    summary: 'Rozetkaga ulangan jihoz quvvat olmayapti.',
    category: 'Rozetka',
    emergency: false,
    description:
      'Rozetkaga ulangan jihoz ishlamayotgan bo‘lsa, sabab rozetkaning o‘zida, avtomatda yoki boshqa ulanish nuqtasida bo‘lishi mumkin.',
    possibleCauses: [
      'Avtomat yoki RCD o‘chib qolgan',
      'Rozetka ortidagi ulanish bo‘shashgan',
      'Jihoz yoki vilka nosoz',
      'Bir nechta rozetka bitta zanjirda va u o‘chgan',
    ],
    warningSigns: [
      'Rozetka atrofida qorayish yoki erish izi',
      'Vilka iliq yoki kuyish hidi',
      'Rozetka qisman ishlaydi, vilka tebransa uziladi',
    ],
    safeObservations: [
      'Boshqa jihoz shu rozetkaga ulanganda ishlayaptimi, tekshiring',
      'Shu xonadagi boshqa rozetkalar ishlayaptimi, tekshiring',
      'Shchitdagi (taqsimot qutisi) avtomat va RCD holatini ko‘ring',
    ],
    nextSteps: [
      'Agar RCD o‘chgan bo‘lsa, uni bir marta qayta ulab ko‘ring',
      'Rozetka qoraygan bo‘lsa, undan foydalanmang',
      'Rozetka ichiga hech narsa tiqmang va qopqog‘ini ochishga urinmang',
    ],
    contactElectrician: [
      'Avtomat/RCD qayta ulanmasa',
      'Rozetka atrofida kuyish izi yoki hid bo‘lsa',
      'Bir nechta rozetka bir vaqtda ishlamasa',
    ],
  },
  {
    id: 'lights-flicker',
    title: 'Chiroqlar miltillayapti',
    summary: 'Yorug‘lik beqaror: miltillaydi, pasayadi yoki o‘chib yonadi.',
    category: 'Yoritish',
    emergency: false,
    description:
      'Chiroqlar miltillashi ko‘pincha kuchlanishning beqarorligi, bo‘shashgan kontakt yoki yaroqsiz lampa bilan bog‘liq bo‘ladi.',
    possibleCauses: [
      'Lampa yoki chiroq eskirgan',
      'Dimmer yoki stabilizator mos emas',
      'Bo‘shashgan ulanish yoki kontakt',
      'Bir vaqtda katta yuklama ulanganda kuchlanish tushishi',
    ],
    warningSigns: [
      'Chiroq yoki kalit atrofida qorayish',
      'Kalit yoki chiroqdan g‘ichirlash yoki kuchli shovqin',
      'Miltillash faqat katta jihoz ishlaganda kuchayadi',
    ],
    safeObservations: [
      'Boshqa lampani shu patronga o‘rnatib ko‘ring (faqat o‘chirilgan holatda)',
      'Miltillash faqat bitta xonadami yoki hammasidami, aniqlang',
      'Muammo qachon boshlanganini yozib qo‘ying',
    ],
    nextSteps: [
      'Avval lampani almashtirib ko‘ring',
      'Muammo davom etsa, boshqa jihozlar ta’sirini kuzating',
    ],
    contactElectrician: [
      'Miltillash butun uy bo‘ylab bo‘lsa',
      'Kalit yoki patronda qorayish yoki hid bo‘lsa',
      'Muammo lampa almashtirilgandan keyin ham davom etsa',
    ],
  },
  {
    id: 'overheating',
    title: 'Elektr jihozi qizib ketyapti',
    summary: 'Jihoz odatdan tashqari issiq bo‘lib, ortiqcha yuklama belgisi bo‘lishi mumkin.',
    category: 'Isitish',
    emergency: false,
    description:
      'Jihozning normal haroratdan yuqori qizishi ortiqcha yuklama, shamollatishning yo‘qligi yoki ichki nosozlik belgisi bo‘lishi mumkin.',
    possibleCauses: [
      'Quvvat sig‘imidan ortiq yuklama',
      'Shamollatish teshiklari yopiq',
      'Kabel yoki vilka eskirgan',
      'Jihoz ichidagi komponent nosoz',
    ],
    warningSigns: [
      'Vilka, kabel yoki rozetka juda issiq',
      'Plastmassa erish hidi',
      'Jihoz ishlaganda tez-tez o‘chadi',
    ],
    safeObservations: [
      'Jihozni o‘chirib, sovutib ko‘ring',
      'Shamollatish teshiklarini tekshiring',
      'Jihoz nominal quvvatini (W) etiketkadan o‘qing',
    ],
    nextSteps: [
      'Qizigan jihozni ishlatishni to‘xtating',
      'Uzaytirgichga ko‘p jihoz ulanmagan bo‘lsin',
      'Jihozni ishlatishdan oldin sovitib qo‘ying',
    ],
    contactElectrician: [
      'Vilka yoki rozetka erisa yoki qorayib qolsa',
      'Kuyish hidi bo‘lsa',
      'Jihoz qizishi davom etsa',
    ],
  },
  {
    id: 'burning-smell',
    title: 'Kuyish hidi yoki tutun',
    summary: 'FAVQULODDA: kuyish hidi, tutun yoki uchqun — xavf darajasi yuqori.',
    category: 'Himoya',
    emergency: true,
    description:
      'Elektr jihozidan kuyish hidi yoki tutun chiqsa, bu yong‘in xavfi belgisi. Avval xavfsizlikni ta’minlang.',
    possibleCauses: [
      'Izolyatsiya erigan yoki kuygan',
      'Ulanish nuqtasida kuchli qizish',
      'Ortiqcha yuklama yoki qisqa tutashuv',
    ],
    warningSigns: [
      'Tutun yoki yonish hidi',
      'Uchqun yoki sakrash ovozi',
      'Rozetka yoki avtomat qora tusga kirgan',
    ],
    safeObservations: [
      'Tutun yoki olov bor-yo‘qligini uzoqdan ko‘ring',
      'Agar xavfsiz bo‘lsa, shu zanjirga tegishli avtomatni o‘chiring',
    ],
    nextSteps: [
      'Darhol elektr energiyasini o‘chiring (asosiy avtomat) — faqat xavfsiz bo‘lsa',
      'Olov bo‘lsa — 101 ga qo‘ng‘iroq qiling, suv bilan elektr jihozga purkamang',
      'Xonani tark eting va 112 yoki 103 ga qo‘ng‘iroq qiling',
      'Qayta yoqmang, jihozga tegmang',
    ],
    contactElectrician: [
      'Har qanday holatda — kuyish hidi bo‘lsa, malakali mutaxassis tekshiruvi shart',
    ],
  },
  {
    id: 'partial-outage',
    title: 'Uyning bir qismida elektr yo‘q',
    summary: 'Bir xona yoki zona quvvatsiz, boshqa joylar ishlayapti.',
    category: 'Quvvat',
    emergency: false,
    description:
      'Faqat bir qism quvvatsiz bo‘lsa, odatda bitta avtomat yoki RCD o‘chgan bo‘ladi. Butun uy o‘chgan bo‘lsa, sabab boshqa.',
    possibleCauses: [
      'Tegishli avtomat yoki RCD uchgan',
      'Zanjirda qisqa tutashuv',
      'Ulanish nuqtasida uzilish',
      'Tashqi tarmoqda uzilish (qo‘shni xonalar ham o‘chgan bo‘lsa)',
    ],
    warningSigns: [
      'Avtomat yoki RCD qayta ulanmasa',
      'Shchitdan kuyish hidi',
      'Quvvat yo‘q joyda ayni paytda qo‘shni xonalar ham o‘chgan',
    ],
    safeObservations: [
      'Shchitdagi avtomat va RCD holatini ko‘ring (uchgan holatini aniqlang)',
      'Boshqa xonalarda quvvat borligini tekshiring',
      'Qo‘shnilarda ham o‘chganmi, bilib oling',
    ],
    nextSteps: [
      'Uchgan avtomatni bir marta qayta ulab ko‘ring',
      'Qayta ulanmasa, o‘sha zanjirdagi jihozlarni o‘chirib turing',
      'Butun mahallada o‘chgan bo‘lsa, ta’minot tashkilotiga murojaat qiling',
    ],
    contactElectrician: [
      'Avtomat qayta ulanmasa',
      'Shchitda kuyish izi yoki hid bo‘lsa',
      'Muammo bir necha marta takrorlansa',
    ],
  },
];

export const problemCategories = [
  'Barchasi',
  'Himoya',
  'Rozetka',
  'Yoritish',
  'Isitish',
  'Quvvat',
] as const;
