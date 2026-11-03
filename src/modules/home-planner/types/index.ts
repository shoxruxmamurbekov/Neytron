/**
 * Uy loyihasi (Home Planner) ma'lumot modeli.
 *
 * Barcha uzunliklar metrda saqlanadi. Xona koordinatalari xonaning
 * yuqori-chap burchagidan boshlanadi: x — uzunlik bo‘ylab (0..length),
 * y — kenglik bo‘ylab (0..width). Devor tomonlari: N (yuqori, y=0),
 * S (pastki, y=width), W (chap, x=0), E (o‘ng, x=length).
 */

export type HouseType = 'apartment' | 'house' | 'country' | 'single_room';

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'hallway'
  | 'corridor'
  | 'storage'
  | 'utility'
  | 'other';

export type MountType = 'concealed' | 'surface';

export type WallSide = 'N' | 'E' | 'S' | 'W';

export type OpeningKind = 'door' | 'window';

export interface Opening {
  id: string;
  kind: OpeningKind;
  wall: WallSide;
  /** Devor boshidan masofa, m */
  offset: number;
  /** Teshik kengligi, m */
  width: number;
  /** Teshik balandligi, m */
  height: number;
  /** Derazaning pol sathidan parapeti, m (faqat derazalar uchun) */
  sillHeight: number;
}

export type ObjectKind =
  | 'ceiling_light'
  | 'spotlight'
  | 'switch'
  | 'socket'
  | 'double_socket'
  | 'appliance_outlet'
  | 'distribution_board';

export type LightType = 'ceiling' | 'spot';

export interface ElectricalObject {
  id: string;
  kind: ObjectKind;
  name: string;
  x: number;
  y: number;
  /** 0, 90, 180, 270 — belgining aylanishi (faqat ko‘rinish uchun) */
  rotation: number;
  /** O‘rnatish balandligi, pol sathidan, m */
  mountingHeight: number;
  /** Elektr guruhi (masalan: Yoritish, Rozetka) */
  group: string;
  /** Zanjir nomi (masalan: Yoritish-1). Kabel va himoya tanlanmaydi. */
  circuit: string;
  notes: string;
  /** Chiroqlar uchun: bog‘liq kalit ob’ekti id’si */
  switchId?: string;
  lightType?: LightType;
}

export interface Point {
  x: number;
  y: number;
}

export interface CableRoute {
  id: string;
  name: string;
  points: Point[];
  circuit: string;
  notes: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  length: number;
  width: number;
  height: number;
  mountType: MountType;
  furniture: string[];
  openings: Opening[];
  objects: ElectricalObject[];
  routes: CableRoute[];
  /** Qavatdagi joylashuvi (plan uchun), m */
  x: number;
  y: number;
  /** Qo‘llangan shablon id’si (ixtiyoriy) */
  templateId?: string;
}

export interface Floor {
  id: string;
  name: string;
  /** Qavat balandligi, m */
  height: number;
  rooms: Room[];
}

export interface Project {
  id: string;
  name: string;
  houseType: HouseType;
  description: string;
  /** Umumiy o‘lchamlar (ixtiyoriy), m */
  dimensions?: { length: number; width: number };
  floors: Floor[];
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
}

export type TemplateVerification = 'demo' | 'pending';

export interface TemplateObjectSpec {
  kind: ObjectKind;
  name: string;
  /** Xona uzunligi va kengligiga nisbatan (0..1) joylashuv */
  fx: number;
  fy: number;
  lightType?: LightType;
  notes?: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  roomType: RoomType;
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  mountType: MountType | 'any';
  lighting: string;
  sockets: string;
  switches: string;
  furnitureTags: string[];
  installationNotes: string[];
  safetyNotes: string[];
  version: string;
  verification: TemplateVerification;
  objects: TemplateObjectSpec[];
}

export interface TemplateMatch {
  template: LayoutTemplate;
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface MaterialsSummary {
  ceilingLights: number;
  spotlights: number;
  switches: number;
  sockets: number;
  doubleSockets: number;
  applianceOutlets: number;
  distributionBoards: number;
  cableLengthM: number;
  circuits: string[];
}
