import type { LearningTopicData } from '../types';

export const learningTopics: LearningTopicData[] = [
  {
    slug: 'kuchlanish',
    title: 'Kuchlanish (Voltage)',
    level: 'Boshlang\'ich',
    summary: 'Zaryad oqimini harakatga keltiruvchi “bosim”. Birligi — volt (V).',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Kuchlanish — ikki nuqta orasidagi elektr potensiallar farqi. Suv quvuridagi bosimga o‘xshatiladi: bosim qanchalik katta bo‘lsa, suv shunchalik kuchli oqadi.',
          'O‘zbekiston maishiy tarmog‘ida odatda 220 V o‘zgaruvchan kuchlanish ishlatiladi.',
        ],
      },
      {
        heading: 'Nima uchun muhim?',
        body: [
          'Jihozlar mo‘ljallangan kuchlanishda ishlashi kerak. Ortiqcha kuchlanish jihozni yoqishi, past kuchlanish esa ishlamasligiga olib kelishi mumkin.',
        ],
      },
    ],
    example: 'Tarmoq kuchlanishi 220 V bo‘lsa, unga ulangan lampa shu kuchlanish bilan ishlaydi.',
    keyPoints: ['Birlik: volt (V)', 'Maishiy tarmoq: ~220 V', 'Manba va iste’molchi orasidagi potensiallar farqi'],
  },
  {
    slug: 'tok',
    title: 'Tok (Current)',
    level: 'Boshlang\'ich',
    summary: 'Vaqt birligida o‘tayotgan elektr zaryadi miqdori. Birligi — amper (A).',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Tok — o‘tkazgich kesimidan vaqt birligida o‘tayotgan zaryad. Suv quvuridagi oqim tezligiga o‘xshatiladi.',
          'Tok qancha katta bo‘lsa, o‘tkazgich shuncha ko‘p qiziydi. Shu sababli simlar va avtomatlar aniq tok chegarasiga mo‘ljallanadi.',
        ],
      },
    ],
    example: 'Quvvati 2200 W bo‘lgan choynak 220 V da taxminan 10 A tok oladi (I = P / U).',
    keyPoints: ['Birlik: amper (A)', 'Tok ortishi — qizish ortishi', 'Avtomat tok chegarasi bilan tanlanadi'],
  },
  {
    slug: 'qarshilik',
    title: 'Qarshilik (Resistance)',
    level: 'Boshlang\'ich',
    summary: 'Tokning o‘tishiga to‘siq. Birligi — om (Ω).',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Qarshilik material tokka qanchalik to‘siq qo‘yishini ko‘rsatadi. Qalin va sifatli mis simning qarshiligi kichik, ingichka yoki yomon ulanish esa katta bo‘ladi.',
          'Ortiqcha qarshilik ulanish nuqtasida qizishga olib keladi — bu ko‘pgina yong‘in xavfining sababi.',
        ],
      },
    ],
    example: 'Bo‘shashgan kontakt qarshiligi oshadi va u nuqtada qizish paydo bo‘ladi.',
    keyPoints: ['Birlik: om (Ω)', 'Yomon ulanish = qarshilik = qizish', 'Materialga va kesimga bog‘liq'],
  },
  {
    slug: 'quvvat',
    title: 'Elektr quvvati (Power)',
    level: 'Boshlang\'ich',
    summary: 'Vaqt birligida sarflanayotgan yoki uzatilayotgan energiya. Birligi — vatt (W).',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Quvvat P = U × I formulasi bilan hisoblanadi. Jihoz qancha ko‘p quvvat olsa, u shuncha ko‘p energiya sarflaydi.',
        ],
      },
      {
        heading: 'Kundalik hayotda',
        body: [
          'Jihoz etiketkasidagi W qiymati uning quvvati. Bir nechta yuqori quvvatli jihozni bitta rozetkaga ulash avtomatni o‘chirishi mumkin.',
        ],
      },
    ],
    example: '220 V da 1000 W isitgich 1000 / 220 ≈ 4,5 A tok oladi.',
    keyPoints: ['Birlik: vatt (W), kilovatt (kW)', 'P = U × I', 'Energiya = quvvat × vaqt'],
  },
  {
    slug: 'ac-dc',
    title: 'O‘zgaruvchan va doimiy tok (AC / DC)',
    level: 'Boshlang‘ich',
    summary: 'DC — yo‘nalishi o‘zgarmas tok; AC — yo‘nalishi davriy o‘zgaradigan tok.',
    sections: [
      {
        heading: 'DC (doimiy tok)',
        body: [
          'Batareya va quyosh panellari DC beradi. Tok bir tomonga doimiy oqadi.',
        ],
      },
      {
        heading: 'AC (o‘zgaruvchan tok)',
        body: [
          'Uy tarmog‘idagi tok AC. Yo‘nalish soniyada ko‘p marta almashinadi (O‘zbekistonda chastota odatda 50 Hz).',
          'AC uzoq masofaga uzatish uchun qulay, shuning uchun elektr stansiyalarida ishlatiladi.',
        ],
      },
    ],
    example: 'Telefon zaryadlovchisi AC ni DC ga aylantiradi, batareya esa DC bilan zaryadlanadi.',
    keyPoints: ['DC — bir yo‘nalishli', 'AC — davriy o‘zgaradi', 'Maishiy tarmoq: AC'],
  },
  {
    slug: 'zanjir',
    title: 'Elektr zanjiri',
    level: 'Boshlang‘ich',
    summary: 'Manbadan iste’molchiga va orqaga yopiq yo‘l.',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Elektr zanjiri manba, o‘tkazgichlar, boshqaruv (kalit) va iste’molchidan iborat yopiq yo‘ldir. Zanjir uzilsa, tok oqmaydi.',
        ],
      },
    ],
    example: 'Kalit bosilganda zanjir yopiladi va lampa yonadi.',
    keyPoints: ['Yopiq yo‘l kerak', 'Kalit — zanjirni ochadi/yopadi', 'Ketma-ket va parallel ulanish'],
  },
  {
    slug: 'avtomat',
    title: 'Avtomat (Circuit breaker)',
    level: 'Boshlang‘ich',
    summary: 'Ortiqcha tok yoki qisqa tutashuvda zanjirni avtomatik uzuvchi himoya qurilmasi.',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Avtomat simlarni ortiqcha tokdan saqlaydi. Tok belgilangan chegaradan oshsa, u o‘chadi.',
          'Avtomat tanlash simning kesimi va yuklamaga bog‘liq. Bu hisob-kitob malakali mutaxassis tomonidan bajarilishi kerak.',
        ],
      },
    ],
    example: 'Avtomat tez-tez uchsa, zanjirda ortiqcha yuklama yoki nosozlik bor.',
    keyPoints: ['Ortiqcha yuklama va qisqa tutashuvdan himoya', 'Qayta ulash mumkin', 'Tanlash — mutaxassis ishi'],
  },
  {
    slug: 'rcd',
    title: 'RCD / RCCB (qoldiq tok qurilmasi)',
    level: 'O‘rta',
    summary: 'Tok qayerdadir “yo‘qolsa” (odamga yoki yerga oqsa) zanjirni millisekundlarda uzadi.',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'RCD fazadan kirgan va nolga qaytgan toklar farqini o‘lchaydi. Farq paydo bo‘lsa — bu tokning biror yerga, masalan odam tanasi orqali, oqayotganini bildiradi.',
          'U elektr toki urishidan hayotni saqlashga yordam beradi. Shuning uchun namlik bor xonalarda (hammom, oshxona) RCD ishlatiladi.',
        ],
      },
      {
        heading: 'Muhim',
        body: [
          'RCD ni sinash tugmasi orqali oyda bir marta tekshirish tavsiya etiladi. Agar u tez-tez uchsa, sababni aniqlash kerak — uni shunchaki “ulab qo‘yish” xavfli.',
        ],
      },
    ],
    example: 'Hammomdagi namlik tufayli tok oqsa, RCD bir zumda zanjirni uzadi.',
    keyPoints: ['Qoldiq (differensial) tokni o‘lchaydi', 'Odam hayotini himoya qiladi', 'Oyda bir marta sinash tavsiya etiladi'],
  },
  {
    slug: 'yerga-ulash',
    title: 'Yerga ulash (Grounding / Earthing)',
    level: 'O‘rta',
    summary: 'Metall qismlarni yer bilan ulash — xavfli kuchlanishni xavfsiz yo‘naltirish uchun.',
    sections: [
      {
        heading: 'Nima bu?',
        body: [
          'Yerga ulash (PE sim) jihoz korpusi ishlamay qolganda uning ustidagi kuchlanish odamga emas, yerga o‘tishini ta’minlaydi.',
          'Yerga ulash tizimi sifati mutaxassis tomonidan o‘lchanadi. Uy ichida yerga ulanmagan rozetkalardan foydalanmang.',
        ],
      },
    ],
    example: 'Metall korpusli choynakdagi nosozlik PE sim orqali yerga oqib, RCD ni ishga tushiradi.',
    keyPoints: ['PE (himoya) sim', 'Odamni xavfli kuchlanishdan saqlaydi', 'Sifatini mutaxassis tekshiradi'],
  },
  {
    slug: 'uy-simlari',
    title: 'Uy elektr simlari',
    level: 'O‘rta',
    summary: 'Faza, nol va yer simlarining vazifasi va ranglari.',
    sections: [
      {
        heading: 'Asosiy simlar',
        body: [
          'Faza (L) — tokni tarmoqdan olib keladi. Nol (N) — tokni qaytaradi. Yer (PE) — himoya uchun.',
          'Ranglar mamlakat standartiga bog‘liq; odatda yer sim sariq-yashil rangda bo‘ladi. Ranglarga tayanib o‘zingiz ulash xavfli.',
        ],
      },
    ],
    example: 'Rozetkaning ulanishi uchta teshik bilan: faza, nol va yer.',
    keyPoints: ['L — faza', 'N — nol', 'PE — yer (himoya)'],
  },
  {
    slug: 'xavfsizlik',
    title: 'Elektr xavfsizligi',
    level: 'Boshlang‘ich',
    summary: 'Elektr bilan ishlashda eng muhim qoidalar.',
    sections: [
      {
        heading: 'Asosiy qoidalar',
        body: [
          'Suv va elektr hech qachon aralashmasin — ho‘l qo‘l bilan vilka yoki rozetkaga tegmang.',
          'Shikastlangan kabel yoki vilkadan foydalanmang.',
          'Rozetkaga bir nechta yuqori quvvatli jihoz ulamang.',
          'Elektr tokiga urilgan odamga tegishdan oldin tokni o‘chiring; agar imkon bo‘lmasa, quruq yog‘och yoki izolyatsiyalangan narsa bilan uzib oling.',
        ],
      },
    ],
    example: 'Shikastlangan kabelni lenta bilan o‘rab ishlatish o‘rniga, uni almashtiring.',
    keyPoints: ['Ho‘l qo‘l — xavf', 'Shikastlangan jihoz — ishlatilmaydi', 'Shubha bo‘lsa — mutaxassis'],
  },
];
