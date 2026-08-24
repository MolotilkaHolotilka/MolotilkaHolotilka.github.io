import type { Metadata } from 'next';
import { Caveat, Permanent_Marker } from 'next/font/google';
import './globals.css';

const caveat = Caveat({ variable: '--font-hand', subsets: ['cyrillic', 'latin'], display: 'swap' });
const permanentMarker = Permanent_Marker({ variable: '--font-marker', subsets: ['latin'], weight: '400', display: 'swap' });

export const metadata: Metadata = {
  title: 'Илья Ященко — инженер AI-продуктов',
  description: 'Личная записная книжка Ильи Ященко: agent systems, автоматизации, игры и выпущенные цифровые продукты.',
  themeColor: '#756f65',
  openGraph: {
    title: 'Илья Ященко — инженер AI-продуктов',
    description: 'Семь проектов на стыке AI, автоматизации, игр и реального мира.',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary',
    title: 'Илья Ященко — инженер AI-продуктов',
    description: 'Личная записная книжка инженера и разработчика.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body className={`${caveat.variable} ${permanentMarker.variable}`}>{children}</body></html>;
}
