import { describe,expect,it } from 'vitest';
import { contactUrls } from '../app/contacts';
import { copy,projects } from '../app/content';

describe('portfolio content',()=>{
  it('keeps Content Factory first and exposes seven bilingual projects',()=>{
    expect(projects).toHaveLength(7);
    expect(projects[0].id).toBe('content-factory');
    for(const project of projects){
      expect(project.title.ru.length).toBeGreaterThan(0);
      expect(project.title.en.length).toBeGreaterThan(0);
      expect(project.summary.ru.length).toBeGreaterThan(0);
      expect(project.summary.en.length).toBeGreaterThan(0);
      expect(project.stack.length).toBeGreaterThan(0);
    }
  });
  it('keeps both locales structurally aligned',()=>{
    expect(copy.ru.tabs).toHaveLength(4);
    expect(copy.en.tabs).toHaveLength(4);
    expect(copy.ru.process).toHaveLength(4);
    expect(copy.en.process).toHaveLength(4);
  });
  it('exposes verified, actionable contact destinations',()=>{
    expect(contactUrls.telegram).toBe('https://t.me/iluxakokojambo');
    expect(contactUrls.email).toBe('mailto:iliayaschenko37@gmail.com');
    expect(contactUrls.call).toBe(contactUrls.telegram);
    expect(Object.values(contactUrls).every(url=>!url.startsWith('#'))).toBe(true);
  });
});
