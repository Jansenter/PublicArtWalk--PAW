import { useEffect, type ReactNode } from 'react';
import ExploreView from './components/ExploreView';
import Home from './components/Home';
import TourView from './components/TourView';
import CommunityHub from './components/CommunityHub';
import { ProfileButton } from './components/Shell';
import { tourById } from './data/tours';
import { href, useRoute } from './lib/router';
import { personalTour, usePersonalWalks } from './lib/profile';
import { LanguageProvider } from './lib/language';

export default function App() {
  const route = useRoute();
  const [walks] = usePersonalWalks();

  useEffect(() => {
    window.speechSynthesis?.cancel();
    if (route.view === 'home' || route.view === 'profile') window.scrollTo(0, 0);
  }, [route.view]);

  let content: ReactNode;
  if (route.view === 'profile') {
    content = (
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex items-center justify-between gap-3"><a className="font-semibold underline" href={href({ view: 'home' })}>← Home</a><ProfileButton /></div>
        <h1 className="mt-6 font-display text-3xl font-semibold">My ArtWalk</h1>
        <CommunityHub />
      </main>
    );
  } else if (route.view === 'tour') {
    const walk = walks.find((item) => item.id === route.tourId);
    const tour = tourById(route.tourId) ?? (walk ? personalTour(walk) : undefined);
    content = tour ? <TourView key={`${tour.id}:${walk?.updatedAt ?? ''}`} tour={tour} artId={route.art} /> : <Home />;
  } else if (route.view === 'explore') {
    content = <ExploreView artId={route.art} />;
  } else {
    content = <Home />;
  }

  return <LanguageProvider>{content}</LanguageProvider>;
}
