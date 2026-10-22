import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'zh' | 'fr';
const translations: Record<string, [string, string]> = {
  'Art map':['艺术地图','Carte artistique'], 'Explore Downtown':['探索市中心','Explorer le centre-ville'], 'visited':['已参观','visitées'],
  'Search title, artist, place, material…':['搜索作品名、艺术家、地点、材料…','Rechercher un titre, un artiste, un lieu, un matériau…'],
  'Search artworks':['搜索艺术作品','Rechercher des œuvres'], 'No artworks match. Try another word or clear the filters.':['没有符合条件的作品。请换个词或清除筛选。','Aucune œuvre ne correspond. Essayez un autre terme ou effacez les filtres.'],
  'Back home':['返回首页','Retour à l’accueil'], 'Back to Explore':['返回探索','Retour à l’exploration'], 'Show my location':['显示我的位置','Afficher ma position'],
  'Stop showing my location':['停止显示我的位置','Masquer ma position'], 'Change language':['更改语言','Changer de langue'], 'English':['英语','Anglais'], '中文':['中文','中文'], 'Français':['法语','Français'],
  'Walking tour':['步行导览','Visite à pied'], 'Tour progress':['导览进度','Progression de la visite'], 'Start here':['从这里开始','Commencer ici'], 'Next stop':['下一站','Prochain arrêt'],
  'Tour complete 🎉':['导览完成 🎉','Visite terminée 🎉'], 'See your walk summary':['查看步行摘要','Voir le résumé de votre promenade'], 'Reset tour progress':['重置导览进度','Réinitialiser la progression'],
  'Close story':['关闭故事','Fermer l’histoire'], 'Previous stop':['上一站','Arrêt précédent'], 'Next stop →':['下一站 →','Prochain arrêt →'], 'Stop':['停止','Arrêt'], 'of':['共','sur'],
  'See photos on City registry ↗':['在市政名录查看照片 ↗','Voir les photos dans le registre municipal ↗'], 'curator credit':['策展人补充署名','crédit ajouté par les commissaires'],
  'Visited':['已参观','Visité'], 'Look for it:':['寻找位置：','À repérer :'], 'Walking directions ↗':['步行路线 ↗','Itinéraire à pied ↗'], 'You’re here!':['您已到达！','Vous êtes ici !'],
  'Pause narration':['暂停朗读','Mettre la narration en pause'], 'Listen to the story':['聆听故事','Écouter l’histoire'], 'Pause':['暂停','Pause'], 'Resume':['继续','Reprendre'], 'Listen':['聆听','Écouter'], 'Stop narration':['停止朗读','Arrêter la narration'],
  'Audio isn’t supported in this browser — the transcript below has the full story.':['此浏览器不支持音频，完整故事见下方文字。','Le navigateur ne prend pas en charge l’audio. Le récit complet figure ci-dessous.'],
  'The registry doesn’t include a written description for this work yet. Visit it and tell its story your own way.':['名录暂未提供这件作品的文字介绍。欢迎亲自到访，讲述您眼中的故事。','Le registre ne contient pas encore de description écrite. Visitez l’œuvre et racontez son histoire à votre façon.'],
  'Show less':['收起','Réduire'], 'Read full transcript':['阅读完整文字','Lire la transcription complète'], 'Material':['材料','Matériau'], 'Owner':['所有者','Propriétaire'], 'Registry ID':['名录编号','ID du registre'], 'Mark as visited':['标记为已参观','Marquer comme visitée'],
  'Look closer':['仔细观察','Regardez de plus près'], 'I spotted it':['我发现了','Je l’ai repéré'], 'Spotted it':['已发现','Repéré'], 'Nice eye!':['观察得真仔细！','Bien observé !'], 'Not quite.':['不太对。','Pas tout à fait.'], 'The answer is':['答案是','La réponse est'],
  'Walk complete':['步行完成','Promenade terminée'], 'artworks':['件艺术作品','œuvres'], 'walked':['步行距离','parcourus'], 'challenges':['挑战','défis'], 'Share your walk':['分享您的步行之旅','Partager votre promenade'], 'Close':['关闭','Fermer'],
  'Your personal city art storyteller':['您的城市艺术故事向导','Votre guide des récits artistiques de la ville'], 'Every corner has a story.':['每个街角都有故事。','Chaque coin de rue a son histoire.'], 'Go find it':['去发现吧','Partez à sa découverte'], 'Wander freely':['自由漫步','Flânez librement'],
  'Your guide':['您的向导','Votre guide'], 'Make it yours':['打造您的专属体验','Personnalisez votre expérience'], 'Recommend more of':['推荐更多','Recommander davantage'], 'Accessibility route preferences':['无障碍路线偏好','Préférences d’accessibilité'],
  'Picked for you':['为您精选','Choisi pour vous'], 'A few more to find':['还有更多待发现','Quelques autres à découvrir'], 'Community':['社区','Communauté'], 'Suggest an artwork':['推荐一件艺术作品','Suggérer une œuvre'],
  'Submit suggestion':['提交推荐','Envoyer la suggestion'], 'Location or address':['地点或地址','Lieu ou adresse'], 'What should we know?':['请告诉我们详情','Que devons-nous savoir ?'], 'Your name':['您的姓名','Votre nom'], 'Create profile':['创建个人资料','Créer un profil'], 'Update':['更新','Mettre à jour'], 'About the work':['关于作品','À propos de l’œuvre'], 'From the project statement':['摘自项目陈述','Extrait de la déclaration du projet'],
  'All artworks':['所有艺术作品','Toutes les œuvres'], 'est. walk':['预计步行','marche estimée'], 'walk':['步行','marche'], 'min with stops':['分钟（含停留）','min avec arrêts'], 'from you':['距您','de vous'],
  'stops':['站','arrêts'],
  'Walk Score':['步行评分','Score Walk'], 'Walk Score estimate':['步行评分估算','Estimation du score Walk'], 'min':['分钟','min'], 'audio':['音频','audio'],
  'Walking routes':['步行路线','Itinéraires à pied'], 'Walk stops':['步行路线景点','Arrêts des promenades'],
  'Explore artworks':['探索艺术作品','Explorer les œuvres'], 'Pick a themed walk, listen to the story behind each artwork as you arrive, and look closer with small observation challenges along the way.':['选择主题步行路线，到达时聆听每件作品背后的故事，并通过沿途的小观察挑战看得更仔细。','Choisissez une promenade thématique, écoutez l’histoire de chaque œuvre à votre arrivée et observez de plus près grâce à de petits défis.'],
  'A local demo profile personalizes suggestions and keeps your preferences on this device.':['本地演示资料可个性化推荐，并将偏好保存在此设备上。','Un profil de démonstration local personnalise les suggestions et conserve vos préférences sur cet appareil.'],
  'Prefer step-free paths':['优先选择无台阶路线','Privilégier les itinéraires sans marche'], 'Avoid stairs':['避开楼梯','Éviter les escaliers'], 'Prefer quieter, less crowded stops':['优先选择安静、人少的地点','Privilégier les arrêts calmes et peu fréquentés'],
  'Share a public artwork or a correction for the team to review.':['分享公共艺术作品或更正信息，供团队审核。','Partagez une œuvre publique ou une correction à examiner par l’équipe.'], 'Artwork name':['作品名称','Nom de l’œuvre'], 'Location':['地点','Lieu'], 'Details':['详情','Détails'],
  'Choose a walk':['选择一条路线','Choisissez une promenade'], 'public artworks':['件公共艺术作品','œuvres d’art public'], 'curated walks':['条精选路线','promenades conçues'], 'artworks visited by you':['件您已参观的作品','œuvres que vous avez visitées'],
  'Pick a walk':['选择一条路线','Choisissez une promenade'], 'Two curated routes through Downtown, each under an hour.':['市中心两条精选路线，每条不到一小时。','Deux itinéraires au centre-ville, chacun de moins d’une heure.'],
  'Listen as you arrive':['到达时聆听','Écoutez en arrivant'], 'Every stop has a narrated story with a readable transcript.':['每一站都有语音讲述和可阅读的文字稿。','Chaque arrêt propose un récit audio et sa transcription.'],
  'Spot details, answer a question, and collect each stop.':['发现细节、回答问题，并记录每一站。','Repérez des détails, répondez à une question et validez chaque arrêt.'], 'How ArtWalk works':['ArtWalk 使用指南','Comment fonctionne ArtWalk'],
  'All {count} artworks on one map — filter, search, and find what’s nearest to you.':['全部 {count} 件作品尽在一张地图上，可筛选、搜索并查找离您最近的作品。','Les {count} œuvres sur une carte : filtrez, recherchez et trouvez l’œuvre la plus proche de vous.'],
};

const Context = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (text: string) => string }>({ language: 'en', setLanguage: () => {}, t: (text) => text });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('artwalk:language') as Language) || 'en');
  const setLanguage = (next: Language) => { localStorage.setItem('artwalk:language', next); setLanguageState(next); };
  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-Hans' : language; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (text: string) => language === 'en' ? text : translations[text]?.[language === 'zh' ? 0 : 1] ?? text }), [language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useLanguage = () => useContext(Context);

const TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined;
const hashText = (text: string) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(36);
};

/** Translate registry supplied text on demand, caching public registry copy per browser. */
export function useTranslatedTexts(texts: string[]) {
  const { language } = useLanguage();
  const [result, setResult] = useState<{ key: string; values: string[]; loading: boolean }>({ key: '', values: texts, loading: false });
  const textSignature = texts.join('\u0000');
  const source = useMemo(() => texts.filter(Boolean), [textSignature]);
  const key = `${language}:${source.map(hashText).join(':')}`;

  useEffect(() => {
    if (language === 'en' || !source.length) {
      setResult({ key, values: source, loading: false });
      return;
    }
    let cancelled = false;
    const cacheKey = `artwalk:translations:${key}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setResult({ key, values: JSON.parse(cached) as string[], loading: false });
        return;
      }
    } catch { /* use online translation when cache is unavailable */ }

    if (!TRANSLATE_API_KEY) {
      setResult({ key, values: source, loading: false });
      return;
    }
    setResult({ key, values: source, loading: true });
    const body = new URLSearchParams({ target: language === 'zh' ? 'zh-CN' : 'fr', source: 'en', format: 'text', key: TRANSLATE_API_KEY });
    source.forEach((text) => body.append('q', text));
    fetch('https://translation.googleapis.com/language/translate/v2', { method: 'POST', body })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Translation request failed')))
      .then((data: { data?: { translations?: { translatedText: string }[] } }) => {
        const values = data.data?.translations?.map((entry) => entry.translatedText);
        if (!values || values.length !== source.length) throw new Error('Incomplete translation response');
        if (cancelled) return;
        setResult({ key, values, loading: false });
        try { localStorage.setItem(cacheKey, JSON.stringify(values)); } catch { /* translation remains available for this view */ }
      })
      .catch(() => { if (!cancelled) setResult({ key, values: source, loading: false }); });
    return () => { cancelled = true; };
  }, [key, language]);

  return { values: result.key === key ? result.values : source, loading: result.key === key && result.loading, configured: !!TRANSLATE_API_KEY };
}
