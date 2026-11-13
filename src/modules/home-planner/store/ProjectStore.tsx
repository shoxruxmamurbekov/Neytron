import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Floor, Project, Room } from '../types';
import { buildDemoProjects } from '../data/demoProjects';

const STORAGE_KEY = 'neytron.homePlanner.v1';

type ProjectPatch = Partial<Pick<Project, 'name' | 'houseType' | 'description' | 'dimensions'>>;

type Action =
  | { type: 'replaceAll'; projects: Project[] }
  | { type: 'addProject'; project: Project }
  | { type: 'updateProject'; projectId: string; patch: ProjectPatch }
  | { type: 'deleteProject'; projectId: string }
  | { type: 'addFloor'; projectId: string; floor: Floor }
  | { type: 'updateFloor'; projectId: string; floorId: string; patch: Partial<Pick<Floor, 'name' | 'height'>> }
  | { type: 'deleteFloor'; projectId: string; floorId: string }
  | { type: 'addRoom'; projectId: string; floorId: string; room: Room }
  | { type: 'updateRoom'; projectId: string; floorId: string; room: Room }
  | { type: 'deleteRoom'; projectId: string; floorId: string; roomId: string }
  | { type: 'resetDemo' };

const touch = (p: Project): Project => ({ ...p, updatedAt: new Date().toISOString() });

function mapProject(projects: Project[], projectId: string, fn: (p: Project) => Project): Project[] {
  return projects.map((p) => (p.id === projectId ? touch(fn(p)) : p));
}

function mapFloor(p: Project, floorId: string, fn: (f: Floor) => Floor): Project {
  return { ...p, floors: p.floors.map((f) => (f.id === floorId ? fn(f) : f)) };
}

export function reducer(state: Project[], action: Action): Project[] {
  switch (action.type) {
    case 'replaceAll':
      return action.projects;
    case 'addProject':
      return [action.project, ...state];
    case 'updateProject':
      return mapProject(state, action.projectId, (p) => ({ ...p, ...action.patch }));
    case 'deleteProject':
      return state.filter((p) => p.id !== action.projectId);
    case 'addFloor':
      return mapProject(state, action.projectId, (p) => ({ ...p, floors: [...p.floors, action.floor] }));
    case 'updateFloor':
      return mapProject(state, action.projectId, (p) =>
        mapFloor(p, action.floorId, (f) => ({ ...f, ...action.patch })),
      );
    case 'deleteFloor':
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        floors: p.floors.filter((f) => f.id !== action.floorId),
      }));
    case 'addRoom':
      return mapProject(state, action.projectId, (p) =>
        mapFloor(p, action.floorId, (f) => ({ ...f, rooms: [...f.rooms, action.room] })),
      );
    case 'updateRoom':
      return mapProject(state, action.projectId, (p) =>
        mapFloor(p, action.floorId, (f) => ({
          ...f,
          rooms: f.rooms.map((r) => (r.id === action.room.id ? action.room : r)),
        })),
      );
    case 'deleteRoom':
      return mapProject(state, action.projectId, (p) =>
        mapFloor(p, action.floorId, (f) => ({ ...f, rooms: f.rooms.filter((r) => r.id !== action.roomId) })),
      );
    case 'resetDemo': {
      const kept = state.filter((p) => !p.demo);
      return [...buildDemoProjects(), ...kept];
    }
  }
}

function isProjectList(v: unknown): v is Project[] {
  return (
    Array.isArray(v) &&
    v.every(
      (p) =>
        p &&
        typeof p === 'object' &&
        typeof (p as Project).id === 'string' &&
        Array.isArray((p as Project).floors),
    )
  );
}

/** localStorage’dan o‘qiydi. Buzilgan yoki yo‘q bo‘lsa demo loyihalarga qaytadi. */
export function loadProjects(): Project[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isProjectList(parsed)) return parsed;
    }
  } catch {
    /* buzilgan ma’lumot — demo bilan davom etamiz */
  }
  return buildDemoProjects();
}

function saveProjects(projects: Project[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    /* saqlash imkoni yo‘q (masalan, maxfiy rejim) — joriy sessiyada ishlaydi */
  }
}

export interface ProjectStoreApi {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  addProject: (p: Project) => void;
  updateProject: (id: string, patch: ProjectPatch) => void;
  deleteProject: (id: string) => void;
  addFloor: (projectId: string, floor: Floor) => void;
  updateFloor: (projectId: string, floorId: string, patch: Partial<Pick<Floor, 'name' | 'height'>>) => void;
  deleteFloor: (projectId: string, floorId: string) => void;
  addRoom: (projectId: string, floorId: string, room: Room) => void;
  updateRoom: (projectId: string, floorId: string, room: Room) => void;
  deleteRoom: (projectId: string, floorId: string, roomId: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<ProjectStoreApi | null>(null);

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [projects, dispatch] = useReducer(reducer, undefined, loadProjects);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const api = useMemo<ProjectStoreApi>(
    () => ({
      projects,
      getProject: (id) => projects.find((p) => p.id === id),
      addProject: (project) => dispatch({ type: 'addProject', project }),
      updateProject: (projectId, patch) => dispatch({ type: 'updateProject', projectId, patch }),
      deleteProject: (projectId) => dispatch({ type: 'deleteProject', projectId }),
      addFloor: (projectId, floor) => dispatch({ type: 'addFloor', projectId, floor }),
      updateFloor: (projectId, floorId, patch) => dispatch({ type: 'updateFloor', projectId, floorId, patch }),
      deleteFloor: (projectId, floorId) => dispatch({ type: 'deleteFloor', projectId, floorId }),
      addRoom: (projectId, floorId, room) => dispatch({ type: 'addRoom', projectId, floorId, room }),
      updateRoom: (projectId, floorId, room) => dispatch({ type: 'updateRoom', projectId, floorId, room }),
      deleteRoom: (projectId, floorId, roomId) => dispatch({ type: 'deleteRoom', projectId, floorId, roomId }),
      resetDemo: () => dispatch({ type: 'resetDemo' }),
    }),
    [projects],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProjectStore(): ProjectStoreApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProjectStore ProjectStoreProvider ichida ishlatilishi kerak');
  return ctx;
}

/** Bitta loyiha uchun qulay yordamchi (yo‘q bo‘lsa undefined). */
export function useProject(projectId: string | undefined) {
  const store = useProjectStore();
  const project = useMemo(
    () => (projectId ? store.projects.find((p) => p.id === projectId) : undefined),
    [store.projects, projectId],
  );
  const updateRoomCb = useCallback(
    (floorId: string, room: Room) => store.updateRoom(projectId ?? '', floorId, room),
    [store, projectId],
  );
  return { project, store, updateRoom: updateRoomCb };
}
