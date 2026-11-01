export const exampleQuestions = [
  'Avtomatim nega tez-tez uchib qolyapti?',
  'Rozetkadan quvvat chiqmayapti, nima qilay?',
  'Ohm qonuni nima va u qanday ishlaydi?',
  'Hammomda RCD nima uchun kerak?',
];

export const assistantCategories = [
  'Umumiy',
  'Himoya (avtomat, RCD)',
  'Rozetka va ulanish',
  'Yoritish',
  'Isitish va quvvat',
  'Hisob-kitob',
] as const;

/** Frontend demo uchun: haqiqiy AI javobi emas, oldindan yozilgan namunalar. */
export const mockReplies: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['avtomat', 'uchib', 'uchyapti'],
    reply:
      'Avtomat tez-tez uchsa, odatda zanjirda ortiqcha yuklama yoki qisqa tutashuv bor. Avval barcha jihozlarni o‘chirib, avtomatni qayta ulab ko‘ring. Agar u darhol uchsa yoki avtomat/rozetka qiziyotgan bo‘lsa, malakali elektrikni chaqiring.',
  },
  {
    keywords: ['rozetka', 'quvvat', 'ishlamay'],
    reply:
      'Avval boshqa jihoz shu rozetkada ishlayaptimi, tekshiring. So‘ng shchitdagi avtomat va RCD holatini ko‘ring. Rozetka qoraygan yoki hid chiqsa, undan foydalanmang va mutaxassisni chaqiring.',
  },
  {
    keywords: ['ohm', 'om'],
    reply:
      'Ohm qonuni: U = I × R. Kuchlanish toka va qarshilikka to‘g‘ri proporsional. Bu qonunni Kalkulyatorlar bo‘limida sinab ko‘rishingiz mumkin.',
  },
  {
    keywords: ['rcd', 'hammom', 'namlik'],
    reply:
      'RCD tokning yerga yoki odam tanasi orqali oqishini aniqlaydi va zanjirni bir zumda uzadi. Namlik bor xonalarda (hammom, oshxona) u ayniqsa muhim. Uni oyda bir marta sinash tugmasi orqali tekshiring.',
  },
];

export const defaultMockReply =
  'Bu prototip javobi. Haqiqiy AI integratsiyasi keyingi bosqichda qo‘shiladi. Hozircha savolingizni “Diagnostika” yoki “O‘quv markazi” bo‘limlarida ham ko‘rishingiz mumkin. Elektr xavfi bo‘lsa, malakali mutaxassisga murojaat qiling.';
