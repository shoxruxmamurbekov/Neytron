import type { HouseType, ObjectKind, RoomType, WallSide, MountType } from '../types';

export const HOUSE_TYPES: { value: HouseType; label: string }[] = [
  { value: 'apartment', label: 'Kvartira' },
  { value: 'house', label: 'Shahar uyi' },
  { value: 'country', label: 'Dacha / qishloq uyi' },
  { value: 'single_room', label: 'Alohida xona' },
];

export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'living_room', label: 'Mehmonxona' },
  { value: 'bedroom', label: 'Yotoqxona' },
  { value: 'kitchen', label: 'Oshxona' },
  { value: 'bathroom', label: 'Hammom' },
  { value: 'hallway', label: 'Dahliz' },
  { value: 'corridor', label: 'Koridor' },
  { value: 'storage', label: 'Omborxona' },
  { value: 'utility', label: 'Xo‘jalik xonasi' },
  { value: 'other', label: 'Boshqa' },
];

export const MOUNT_TYPES: { value: MountType; label: string; hint: string }[] = [
  { value: 'concealed', label: 'Yashirin (devor ichida)', hint: 'Simlar devor yoki shift ichidan o‘tadi' },
  { value: 'surface', label: 'Ochiq (devor ustida)', hint: 'Kanal yoki quvur ustida o‘rnatiladi' },
];

export const WALL_LABELS: Record<WallSide, string> = {
  N: 'Shimoliy (yuqori)',
  E: 'Sharqiy (o‘ng)',
  S: 'Janubiy (pastki)',
  W: 'G‘arbiy (chap)',
};

export const FURNITURE_OPTIONS: { tag: string; label: string }[] = [
  { tag: 'tv', label: 'Televizor' },
  { tag: 'sofa', label: 'Divan' },
  { tag: 'bed', label: 'Krovat' },
  { tag: 'wardrobe', label: 'Shkaf' },
  { tag: 'desk', label: 'Stol (ish joyi)' },
  { tag: 'dining_table', label: 'Ovqatlanish stoli' },
  { tag: 'kitchen_set', label: 'Oshxona jihozlari' },
  { tag: 'fridge', label: 'Muzlatgich' },
  { tag: 'washer', label: 'Kir yuvish mashinasi' },
  { tag: 'boiler', label: 'Suv isitgich (bojler)' },
  { tag: 'bathtub', label: 'Vanna' },
  { tag: 'shower', label: 'Dush' },
];

export interface ObjectCatalogItem {
  kind: ObjectKind;
  label: string;
  shortLabel: string;
  /** Devorga o‘rnatiladimi (eng yaqin devorga “yopishadi”) */
  wallMounted: boolean;
  defaultHeight: (roomHeight: number) => number;
  defaultGroup: string;
  defaultCircuit: string;
  defaultName: string;
}

export const OBJECT_CATALOG: Record<ObjectKind, ObjectCatalogItem> = {
  ceiling_light: {
    kind: 'ceiling_light',
    label: 'Shiftdagi chiroq',
    shortLabel: 'Chiroq',
    wallMounted: false,
    defaultHeight: (h) => h,
    defaultGroup: 'Yoritish',
    defaultCircuit: 'Yoritish-1',
    defaultName: 'Shiftdagi chiroq',
  },
  spotlight: {
    kind: 'spotlight',
    label: 'Spot chiroq',
    shortLabel: 'Spot',
    wallMounted: false,
    defaultHeight: (h) => h,
    defaultGroup: 'Yoritish',
    defaultCircuit: 'Yoritish-1',
    defaultName: 'Spot chiroq',
  },
  switch: {
    kind: 'switch',
    label: 'Kalit',
    shortLabel: 'Kalit',
    wallMounted: true,
    defaultHeight: () => 1.0,
    defaultGroup: 'Yoritish',
    defaultCircuit: 'Yoritish-1',
    defaultName: 'Kalit',
  },
  socket: {
    kind: 'socket',
    label: 'Oddiy rozetka',
    shortLabel: 'Rozetka',
    wallMounted: true,
    defaultHeight: () => 0.3,
    defaultGroup: 'Rozetka',
    defaultCircuit: 'Rozetka-1',
    defaultName: 'Rozetka',
  },
  double_socket: {
    kind: 'double_socket',
    label: 'Ikki o‘rinli rozetka',
    shortLabel: '2x Rozetka',
    wallMounted: true,
    defaultHeight: () => 0.3,
    defaultGroup: 'Rozetka',
    defaultCircuit: 'Rozetka-1',
    defaultName: 'Ikki o‘rinli rozetka',
  },
  appliance_outlet: {
    kind: 'appliance_outlet',
    label: 'Maxsus jihoz uchun rozetka',
    shortLabel: 'Maxsus',
    wallMounted: true,
    defaultHeight: () => 0.3,
    defaultGroup: 'Maxsus jihoz',
    defaultCircuit: 'Maxsus-1',
    defaultName: 'Maxsus rozetka',
  },
  distribution_board: {
    kind: 'distribution_board',
    label: 'Taqsimot shchiti',
    shortLabel: 'Shchit',
    wallMounted: true,
    defaultHeight: () => 1.5,
    defaultGroup: 'Shchit',
    defaultCircuit: 'Asosiy',
    defaultName: 'Taqsimot shchiti',
  },
};

export const POINT_KINDS = Object.keys(OBJECT_CATALOG) as ObjectKind[];

export const MIN_ROOM_DIM = 0.5;
export const MAX_ROOM_DIM = 40;
export const MIN_ROOM_HEIGHT = 2;
export const MAX_ROOM_HEIGHT = 6;
export const DEFAULT_ROOM_HEIGHT = 2.8;
export const DEFAULT_FLOOR_HEIGHT = 3;
