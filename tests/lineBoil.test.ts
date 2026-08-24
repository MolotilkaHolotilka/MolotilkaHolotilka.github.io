import { describe,expect,it } from 'vitest';
import { lineBoilDelay,lineBoilFrame,nextLocale } from '../app/lineBoil';

describe('line boil timing',()=>{
  it('cycles three distinct visual frames',()=>{
    expect([0,1,2,3,4,5].map(lineBoilFrame)).toEqual([0,1,2,0,1,2]);
  });
  it('pauses after two cycles',()=>{
    expect(lineBoilDelay(5)).toBe(190);
    expect(lineBoilDelay(6)).toBe(1100);
  });
  it('switches locale in both directions',()=>{
    expect(nextLocale('ru')).toBe('en');
    expect(nextLocale('en')).toBe('ru');
  });
});
