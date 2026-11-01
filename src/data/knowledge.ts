import type { KnowledgeEntry } from '../types';

export const knowledgeEntries: KnowledgeEntry[] = [
  { id: 'k1', term: 'Avtomat (MCB)', category: 'Himoya', definition: 'Ortiqcha tok va qisqa tutashuvdan himoya qiluvchi avtomatik uzgich.' },
  { id: 'k2', term: 'RCD (RCCB)', category: 'Himoya', definition: 'Qoldiq (differensial) tokni o‘lchab, odamni elektr urishidan saqlaydigan qurilma.' },
  { id: 'k3', term: 'Shchit (taqsimot qutisi)', category: 'Jihoz', definition: 'Avtomat, RCD va boshqa himoya qurilmalari joylashgan quti.' },
  { id: 'k4', term: 'Rozetka', category: 'Komponent', definition: 'Iste’molchi jihozni tarmoqqa ulash uchun mo‘ljallangan ulagich.' },
  { id: 'k5', term: 'Kalit (vyklyuchatel)', category: 'Komponent', definition: 'Zanjirni ochish yoki yopish uchun ishlatiladigan qurilma.' },
  { id: 'k6', term: 'Kabel', category: 'Komponent', definition: 'Tokni uzatish uchun izolyatsiyalangan o‘tkazgichlar to‘plami.' },
  { id: 'k7', term: 'Multimetr', category: 'Asbob', definition: 'Kuchlanish, tok va qarshilikni o‘lchash uchun asbob. Ishlatishdan oldin qo‘llanmani o‘qing.' },
  { id: 'k8', term: 'Kuchlanish indikatori', category: 'Asbob', definition: 'Simda kuchlanish bor-yo‘qligini ko‘rsatuvchi oddiy asbob.' },
  { id: 'k9', term: 'Qisqa tutashuv', category: 'Nosozlik', definition: 'Faza va nol (yoki yer) to‘g‘ridan-to‘g‘ri ulanib, tok keskin oshishi.' },
  { id: 'k10', term: 'Ortiqcha yuklama', category: 'Nosozlik', definition: 'Zanjirga simning chegarasidan ortiq quvvatli jihozlar ulanishi.' },
  { id: 'k11', term: 'Izolyatsiya', category: 'Atama', definition: 'Tokni o‘tkazgichdan tashqariga chiqarmaydigan material yoki qatlam.' },
  { id: 'k12', term: 'PE (himoya yer simi)', category: 'Atama', definition: 'Metall korpuslarni yerga ulash uchun xizmat qiladigan sim.' },
  { id: 'k13', term: 'Stabilizator', category: 'Jihoz', definition: 'Tarmoq kuchlanishini belgilangan chegarada ushlab turuvchi qurilma.' },
  { id: 'k14', term: 'Dimmer', category: 'Jihoz', definition: 'Yorug‘lik yoki quvvatni boshqarish uchun ishlatiladigan regulyator.' },
  { id: 'k15', term: 'PLC (dasturlanuvchi mantiqiy kontroller)', category: 'Jihoz', definition: 'Sanoat avtomatlashtirishida jarayonni boshqaruvchi kompyuter qurilmasi.' },
];

export const knowledgeCategories = ['Barchasi', 'Jihoz', 'Komponent', 'Asbob', 'Himoya', 'Nosozlik', 'Atama'] as const;
