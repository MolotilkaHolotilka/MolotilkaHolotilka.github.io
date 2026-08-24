export const lineBoilFrame = (tick:number) => tick % 3;
export const lineBoilDelay = (tick:number) => tick > 0 && tick % 6 === 0 ? 1100 : 190;
export const nextLocale = (locale:'ru'|'en') => locale === 'ru' ? 'en' : 'ru';
