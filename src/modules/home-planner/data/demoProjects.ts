import type { Project, Room } from '../types';
import { TEMPLATE_BY_ID } from './templates';
import { applyTemplateToRoom, createFloor, createOpening, createProject, createRoom } from '../utils/factory';

/**
 * Namunaviy loyihalar. Faqat demo maqsadida; foydalanuvchi ularni tahrirlashi yoki o‘chirishi mumkin.
 */
export function buildDemoProjects(now: Date = new Date()): Project[] {
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

  const tpl = (room: Room, id: string): Room => {
    const t = TEMPLATE_BY_ID.get(id);
    return t ? applyTemplateToRoom(room, t) : room;
  };

  // 1) Ikki qavatli oilaviy uy
  const living = tpl(
    createRoom({
      name: 'Mehmonxona',
      type: 'living_room',
      length: 5.2,
      width: 4,
      mountType: 'concealed',
      furniture: ['tv', 'sofa'],
      openings: [
        createOpening('door', 'W', 0.8, 0.9, 2.1),
        createOpening('window', 'N', 1.5, 1.8, 1.4, 0.9),
      ],
    }),
    'living-standard',
  );
  const kitchen = tpl(
    createRoom({
      name: 'Oshxona',
      type: 'kitchen',
      length: 3.5,
      width: 2.8,
      x: 5.7,
      furniture: ['kitchen_set', 'fridge'],
      openings: [createOpening('window', 'N', 0.6, 1.2, 1.2, 1.0)],
    }),
    'kitchen-standard',
  );
  const bath = tpl(
    createRoom({
      name: 'Hammom',
      type: 'bathroom',
      length: 2,
      width: 1.8,
      x: 9.2,
      mountType: 'concealed',
      furniture: ['bathtub', 'boiler', 'washer'],
      openings: [createOpening('door', 'S', 0.3, 0.7, 2.0)],
    }),
    'bathroom-protected',
  );
  const hall = tpl(
    createRoom({
      name: 'Dahliz',
      type: 'hallway',
      length: 2.4,
      width: 1.2,
      x: 0,
      y: 4.5,
      furniture: ['wardrobe'],
    }),
    'hallway-two-way',
  );
  const bedroom1 = tpl(
    createRoom({
      name: 'Yotoqxona 1',
      type: 'bedroom',
      length: 4.2,
      width: 3.6,
      furniture: ['bed', 'wardrobe', 'desk'],
    }),
    'bedroom-standard',
  );
  const bedroom2 = createRoom({
    name: 'Yotoqxona 2',
    type: 'bedroom',
    length: 3.8,
    width: 3.2,
    x: 4.7,
    furniture: ['bed'],
  });

  const house = createProject({
    name: 'Oilaviy uy — 2 qavat',
    houseType: 'house',
    description: 'Namunaviy ikki qavatli uy. Ba’zi xonalar shablon bilan to‘ldirilgan, ba’zilari hali bo‘sh.',
    dimensions: { length: 12, width: 8 },
    now: daysAgo(6),
    demo: true,
    floorCount: 0,
  });
  house.floors = [
    { ...createFloor('1-qavat'), rooms: [living, kitchen, bath, hall] },
    { ...createFloor('2-qavat'), height: 3, rooms: [bedroom1, bedroom2] },
  ];

  // 2) Dacha — bitta qavat, qisman tayyor
  const dacha = tpl(
    createRoom({
      name: 'Mehmonxona',
      type: 'living_room',
      length: 6,
      width: 4.5,
      furniture: ['sofa', 'dining_table', 'tv'],
      openings: [createOpening('window', 'E', 1.0, 1.6, 1.4, 0.9)],
    }),
    'living-spot',
  );
  const dachaBed = createRoom({
    name: 'Yotoqxona',
    type: 'bedroom',
    length: 3.5,
    width: 3,
    x: 6.5,
    furniture: ['bed', 'wardrobe'],
  });
  const dachaBath = createRoom({
    name: 'Hammom',
    type: 'bathroom',
    length: 2,
    width: 2,
    x: 0,
    y: 4.8,
    mountType: 'concealed',
    furniture: ['shower', 'boiler'],
  });

  const country = createProject({
    name: 'Dacha — 1 qavat',
    houseType: 'country',
    description: 'Namunaviy dacha. Yotoqxona va hammom hali shablonsiz.',
    dimensions: { length: 10, width: 7 },
    now: daysAgo(2),
    demo: true,
    floorCount: 0,
  });
  country.floors = [{ ...createFloor('Asosiy qavat'), rooms: [dacha, dachaBed, dachaBath] }];

  return [house, country];
}

/** Xonalar ro‘yxatini (faqat tekshiruv uchun) qaytaradi. */
export const roomsOf = (p: Project): Room[] => p.floors.flatMap((f) => f.rooms);
