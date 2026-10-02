export type FacilityClass = 1 | 2 | 3 | 4;

export interface FacilityType {
  code: string,
  name: string,
  class: FacilityClass
}

export const facilityTypes: FacilityType[] = [
  { code: 'ABL',  name: 'Advisory Bike Lane',              class: 2 },
  { code: 'BL',   name: 'Bike Lane',                       class: 2 },
  { code: 'BBBL', name: 'Bike Lane Buffered by Bus Lane',  class: 2 },
  { code: 'BBL',  name: 'Buffered Bike Lane',              class: 2 },
  { code: 'ESR',  name: 'Enhanced Shared Roadway',         class: 3 },
  { code: 'LSB',  name: 'Local Service Bikeway',           class: 3 },
  { code: 'NG',   name: 'Neighborhood Greenway',           class: 1 },
  { code: 'PBL',  name: 'Protected Bike Lane',             class: 4 },
  { code: 'SBBL', name: 'Shared Bus-Bike Lane',            class: 2 },
  { code: 'SIR',  name: 'Separated in-roadway',            class: 4 },
  { code: 'TRL',  name: 'Off-Street Path/Trail',           class: 1 },
];

export const facilityNameByCode: Record<string, string> = Object.fromEntries(
  facilityTypes.map((f) => [f.code, f.name]),
);

export function getClassColors(): Record<FacilityClass, string> {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string) => css.getPropertyValue(name).trim();
  return {
    1: read('--color-class-1'),
    2: read('--color-class-2'),
    3: read('--color-class-3'),
    4: read('--color-class-4'),
  }
}