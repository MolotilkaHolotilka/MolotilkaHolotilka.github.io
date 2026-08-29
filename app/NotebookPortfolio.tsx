'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { contactUrls } from './contacts';
import { copy, type Locale, type Project, projects } from './content';
import { lineBoilDelay, lineBoilFrame, nextLocale } from './lineBoil';

function useLineBoil() {
  const [frame,setFrame] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tick=0; let timer=0;
    const step=()=>{ tick+=1; setFrame(lineBoilFrame(tick)); timer=window.setTimeout(step,lineBoilDelay(tick)); };
    timer=window.setTimeout(step,190); return()=>window.clearTimeout(timer);
  },[]);
  return frame;
}

function LineBoilTitle({lines,id}:{lines:readonly string[];id:string}) {
  const frame=useLineBoil();
  return <><h2 id={id} className="sr-only">{lines.join(' ')}</h2><div className="line-boil" data-frame={frame} aria-hidden="true">{[0,1,2].map(variant=><div className={`line-boil__frame line-boil__frame--${variant}`} key={variant}>{lines.map((line,index)=><span className={index===lines.length-1?'marker-highlight':''} key={line}>{line}</span>)}</div>)}</div></>;
}

function Attachment({project,locale,selected,onSelect}:{project:Project;locale:Locale;selected:boolean;onSelect:()=>void}) {
  return <button className={`project-sticker project-sticker--${project.accent}${selected?' is-selected':''}`} data-project-id={project.id} onClick={onSelect} aria-pressed={selected}><span className="project-sticker__kind">{project.kind}</span><strong>{project.title[locale]}</strong><span>{project.summary[locale]}</span><span className="project-sticker__open">↗</span></button>;
}

function ProjectCarousel({locale,selectedId,onSelect}:{locale:Locale;selectedId:string;onSelect:(project:Project)=>void}) {
  return <div className="project-carousel" aria-label={locale==='ru'?'Карусель проектов':'Project carousel'}><div className="project-carousel__track">{projects.map(project=><div className="project-carousel__item" key={project.id}><Attachment project={project} locale={locale} selected={selectedId===project.id} onSelect={()=>onSelect(project)}/></div>)}</div></div>;
}

export default function NotebookPortfolio({initialLocale='ru'}:{initialLocale?:Locale}) {
  const [locale,setLocale]=useState<Locale>(initialLocale);
  const [selectedId,setSelectedId]=useState('content-factory');
  const [activeSection,setActiveSection]=useState('about');
  const hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const selected=useMemo(()=>projects.find(project=>project.id===selectedId)??projects[0],[selectedId]);
  const t=copy[locale];
  useEffect(()=>{
    const saved=window.localStorage.getItem('portfolio-locale');
    if(window.location.pathname==='/' && (saved==='ru'||saved==='en')) {
      window.history.replaceState(null,'',`/${saved}${window.location.hash}`);
      const timer=window.setTimeout(()=>setLocale(saved),0);
      return()=>window.clearTimeout(timer);
    }
  },[]);
  useEffect(()=>{ document.documentElement.lang=locale; window.localStorage.setItem('portfolio-locale',locale); },[locale]);
  useEffect(()=>{
    const sections=['about','projects','skills','contact'].map(id=>document.getElementById(id)).filter((item):item is HTMLElement=>Boolean(item));
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible?.target.id) setActiveSection(visible.target.id);
    },{rootMargin:'-18% 0px -56% 0px',threshold:[0,.1,.35,.6]});
    sections.forEach(section=>observer.observe(section));
    return()=>observer.disconnect();
  },[]);
  const changeLocale=()=>{ const next=nextLocale(locale); setLocale(next); window.history.replaceState(null,'',`/${next}${window.location.hash}`); };
  const chooseProject=(project:Project)=>{ setSelectedId(project.id); window.setTimeout(()=>{ const heading=document.getElementById('selected-case-title'); heading?.focus({preventScroll:true}); document.getElementById('project-case')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); },0); };

  return <main id="main" className="site-shell" data-ready={hydrated}>
    <nav className="notebook-tabs" aria-label={locale==='ru'?'Разделы записной книжки':'Notebook sections'}>{['about','projects','skills','contact'].map((id,index)=><a key={id} href={`#${id}`} data-active={activeSection===id} aria-current={activeSection===id?'location':undefined}>{t.tabs[index]}</a>)}<button onClick={changeLocale} aria-label={locale==='ru'?'Switch to English':'Переключить на русский'}>{locale.toUpperCase()} ↔</button></nav>
    <section className="notebook-cover" aria-labelledby="cover-title"><div className="cover-seam" aria-hidden="true"/><p className="cover-kicker">notebook of built things / 2024—2026</p><h1 id="cover-title">Илья<br/>Ященко</h1><p className="cover-role">{t.role}</p><Image className="cover-portrait" src="/ilya-cover-cutout-v2.png" alt="Илья Ященко" width={950} height={1656} sizes="(max-width: 760px) 55vw, 32vw" priority unoptimized/><span aria-hidden="true" className="cover-sticker cover-sticker--taganrog"><span>TAGANROG</span><span>LAB</span></span><span aria-hidden="true" className="cover-sticker cover-sticker--agent"><span>AGENT</span><span>BUILDER</span></span><span aria-hidden="true" className="cover-sticker cover-sticker--ship"><span>SHIP THE</span><span>WEIRD!</span></span><a className="open-note" href="#about">{t.open}</a></section>

    <section id="about" className="notebook spread" aria-labelledby="about-title"><article className="page page--left"><p className="page-kicker">{locale==='ru'?'запись №01 / кто я вообще?':'entry №01 / who am I?'}</p><LineBoilTitle lines={t.aboutTitle} id="about-title"/><p className="handwritten intro-copy">{t.about}</p><aside className="margin-note">{locale==='ru'?<>да, тут есть и AI,<br/>и crypto,<br/>и датчики мышц!</>:<>yes, that means AI,<br/>crypto,<br/>and muscle sensors!</>}</aside><span className="round-sticker" aria-hidden="true">CURIOUS<br/>BY DEFAULT</span><span className="page-number">— 01 —</span></article><article className="page page--right"><p className="page-kicker">{locale==='ru'?'несколько фактов на полях':'a few notes in the margin'}</p><div className="polaroid" role="img" aria-label={locale==='ru'?'Рисованное рабочее место разработчика':'Illustrated developer workspace'}><div className="desk-photo" aria-hidden="true"><span className="monitor">agent.run()</span><span className="status">✓ shipped</span></div><p>{locale==='ru'?'обычный вечер @ Bots-n-bones':'an ordinary evening @ Bots-n-bones'}</p></div><div className="tape tape--photo" aria-hidden="true"/><ul className="fact-notes">{t.facts.map((fact,index)=><li className={`paper-note paper-note--${['yellow','blue','pink'][index]}`} key={fact}>{fact}</li>)}</ul><p className="next-note">{locale==='ru'?'дальше — семь проектов →':'next — seven projects →'}</p><span className="page-number">— 02 —</span></article></section>

    <section id="projects" className="notebook spread projects-spread" aria-labelledby="projects-title"><article className="page page--left"><p className="page-kicker">{locale==='ru'?'индекс проектов / 01—07':'project index / 01—07'}</p><h2 id="projects-title" className="marker-title">{t.projectsTitle}</h2><p className="handwritten spread-intro">{t.projectsIntro}</p><ProjectCarousel locale={locale} selectedId={selectedId} onSelect={chooseProject}/><span className="page-number">— 03 —</span></article><article className="page page--right"><p className="red-note">{locale==='ru'?'каждый проект движется по своему маршруту →':'each project moves on its own route →'}</p><span className="project-count-sticker" aria-hidden="true">7<br/>SHIPPED<br/>THINGS</span><span className="page-number">— 04 —</span></article></section>

    <section id="project-case" className={`notebook spread case-spread case-spread--${selected.accent}`} aria-labelledby="selected-case-title"><article className="page page--left"><p className="page-kicker">{locale==='ru'?'лист проекта / выбранное дело':'project sheet / selected case'}</p><p className="case-kind">{selected.kind}</p><h2 id="selected-case-title" tabIndex={-1} className="marker-title case-title">{selected.title[locale]}</h2><p className="handwritten case-summary">{selected.summary[locale]}</p><div className={`case-photo${selected.id==='content-factory'?' case-photo--content-factory':''}`}>{selected.id==='content-factory'&&<Image className="case-photo__image" src="/content-factory-conveyor.png" alt={locale==='ru'?'Конвейер превращает идею в пост, короткое видео и AI-видео':'A conveyor turns one idea into a post, a short video, and an AI video'} fill sizes="(max-width: 760px) 85vw, 42vw" unoptimized/>}<span>{selected.kind}</span><strong>{selected.title[locale]}</strong><i aria-hidden="true">◎</i></div><div className="tape tape--case" aria-hidden="true"/><span className="role-stamp">{selected.role[locale]}</span><span className="page-number">— 05 —</span></article><article className="page page--right"><div className="case-notes">{[selected.problem[locale],selected.solution[locale],selected.result[locale],selected.role[locale]].map((value,index)=><article className={`case-note case-note--${index+1}`} key={t.caseLabels[index]}><h3>{t.caseLabels[index]}</h3><p>{value}</p></article>)}</div><div className="tech-stickers">{selected.stack.map(item=><span key={item}>{item}</span>)}</div><a className="ask-project" href="#contact">{t.ask}</a><span className="page-number">— 06 —</span></article></section>

    <section id="skills" className="notebook spread" aria-labelledby="skills-title"><article className="page page--left"><p className="page-kicker">{locale==='ru'?'карта инструментов':'tool map'}</p><h2 id="skills-title" className="marker-title">{t.skillsTitle}</h2><div className="skill-map"><span className="skill skill--core">AGENT<br/>SYSTEMS</span><span className="skill skill--rag">RAG · Wiki LLM</span><span className="skill skill--automation">n8n · Airtable · Supabase</span><span className="skill skill--code">TypeScript · JavaScript · Java · C++</span><span className="skill skill--web3">Solidity · Web3</span></div><span className="page-number">— 07 —</span></article><article className="page page--right"><p className="page-kicker">{locale==='ru'?'рабочий процесс':'working process'}</p><h2 className="marker-title">{t.processTitle}</h2><ol className="process-list">{t.process.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,'0')}</span>{step}</li>)}</ol><p className="process-note">{locale==='ru'?'не магия — просто много хороших итераций':'not magic — just many good iterations'}</p><span className="page-number">— 08 —</span></article></section>

    <section id="contact" className="notebook spread contact-spread" aria-labelledby="contact-title"><article className="page page--left"><p className="page-kicker">{locale==='ru'?'последняя запись':'last entry'}</p><LineBoilTitle lines={[t.contactTitle]} id="contact-title"/><p className="handwritten contact-copy">{t.contactText}</p><span className="contact-sticker" aria-hidden="true">LET&apos;S<br/>BUILD</span><span className="page-number">— 09 —</span></article><article className="page page--right"><div id="contact-links" className="contact-links"><a data-contact="telegram" href={contactUrls.telegram}>{t.telegram}<span>↗</span></a><a data-contact="email" href={contactUrls.email}>{t.email}<span>↗</span></a><a data-contact="call" href={contactUrls.call}>{t.call}<span>↗</span></a></div><p className="contact-footnote">RU / EN · Taganrog · available for ambitious builds</p><span className="page-number">— 10 —</span></article></section>
    <noscript><section className="no-js-projects" aria-label={locale==='ru'?'Все проекты':'All projects'}><h2>{t.projectsTitle}</h2>{projects.map(project=><article key={project.id}><h3>{project.title[locale]}</h3><p>{project.summary[locale]}</p><p><strong>{t.caseLabels[1]}:</strong> {project.solution[locale]}</p><p><strong>{t.caseLabels[2]}:</strong> {project.result[locale]}</p></article>)}</section></noscript>
  </main>;
}
