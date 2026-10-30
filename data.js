// A teljes tartalom egy helyen. A {hu, en} párok a nyelvváltáskor cserélődnek.
window.DATA = {
  name: { hu: 'Máró Sándor', en: 'Sándor Máró' },
  role: { hu: 'Mobil- és backend fejlesztő', en: 'Mobile & backend developer' },
  version: '1.0.0',
  status: { hu: 'Elérhető új projektekre', en: 'Available for new projects' },
  photo: 'profile.webp', // a profilkép útvonala. null = monogram
  photoAlt: { hu: 'Máró Sándor karikatúra-portréja', en: 'Cartoon portrait of Sándor Máró' },

  githubUser: 'MaroSandor', // ezzel működik a repos és a git log parancs
  formEndpoint: null, // pl. 'https://formspree.io/f/xxxxxxx': ezzel küld a send parancs

  about: {
    hu: [
      'Máró Sándor vagyok, pályakezdő mobilalkalmazás- és backend fejlesztő. Java, C# és Python alapokon építek alkalmazásokat, a szakdolgozatomban mobilfejlesztéssel foglalkoztam.',
      'A feladatokban a működő, jól karbantartható megoldást tartom a legfontosabbnak.',
      'Az LLM-eket a fejlesztés egészében használom, a kódot viszont mindig átnézem, a biztonsági és architektúra-döntéseket pedig magam hozom.',
      'Junior pozíciót keresek.',
    ],
    en: [
      "I'm Sándor Máró, an entry-level mobile app and backend developer. I build applications on Java, C# and Python, and my thesis was about mobile development.",
      'In my tasks, a working, maintainable solution matters most to me.',
      'I use LLMs throughout development, but I always review the code and make the security and architecture decisions myself.',
      "I'm looking for a junior position.",
    ],
  },
  // level: szavas szint. share: a nyelv aránya a GitHub-repóim kódjában (%), null = nem mérhető
  skills: [
    { name: 'JavaScript', level: { hu: 'Fő nyelv', en: 'Main language' }, share: 55 },
    { name: 'HTML', level: { hu: 'Napi használat', en: 'Daily use' }, share: 11 },
    { name: 'CSS', level: { hu: 'Napi használat', en: 'Daily use' }, share: 6 },
    { name: 'Java', level: { hu: 'Magabiztos', en: 'Confident' }, share: 11 },
    { name: 'C#', level: { hu: 'Magabiztos', en: 'Confident' }, share: 11 },
    { name: 'Python', level: { hu: 'Alapok', en: 'Basics' }, share: 3 },
    { name: 'Git', level: { hu: 'Napi használat', en: 'Daily use' }, share: null },
  ],
  // A GitHub-fiók öt legnagyobb önálló projektje (a repók kódmennyisége alapján).
  // demo: élő demó útvonala (relatív) vagy https címe. shot: opcionális képernyőkép útvonala
  projects: [
    {
      id: 'rf4', stack: 'JavaScript', url: 'https://github.com/MaroSandor/rf4-magyar-forum', demo: null, shot: null,
      title: { hu: 'RF4 magyar fórum', en: 'RF4 Hungarian forum' },
      desc: { hu: 'A Russian Fishing 4 magyar közösségének fóruma: képek megosztása, tippek és spotok feltöltése.', en: 'Forum for the Hungarian Russian Fishing 4 community: share photos, tips and fishing spots.' },
    },
    {
      id: 'konyvtar', stack: 'C#, HTML, CSS', url: 'https://github.com/MaroSandor/konyvtar-kezelo-webapp', demo: null, shot: null,
      title: { hu: 'Könyvtárkezelő webapp', en: 'Library management web app' },
      desc: { hu: 'Webalkalmazás könyvtári állomány kezelésére, C# háttérrel.', en: 'A web application for managing a library collection, with a C# backend.' },
    },
    {
      id: 'szakdolgozat', stack: 'Java, Swift, TypeScript', url: 'https://github.com/MaroSandor/szakdolgozat', demo: null, shot: null,
      title: { hu: 'Szakdolgozat', en: 'Thesis project' },
      desc: { hu: 'Mobilalkalmazás-fejlesztés témájú szakdolgozat több platformon.', en: 'A thesis on mobile app development across several platforms.' },
    },
    {
      id: 'algoritmusok', stack: 'Java', url: 'https://github.com/MaroSandor/java-algorithms', demo: null, shot: null,
      title: { hu: 'Java algoritmusok', en: 'Java algorithms' },
      desc: { hu: 'Algoritmusok és adatszerkezetek gyakorlása Java nyelven.', en: 'Practising algorithms and data structures in Java.' },
    },
    {
      id: 'hibajegy', stack: 'Python', url: 'https://github.com/MaroSandor/hibajegy-lacinak', demo: null, shot: null,
      title: { hu: 'Hibajegykezelő', en: 'Bug ticket tracker' },
      desc: { hu: 'Python alapú hibajegykezelő szoftver.', en: 'A bug ticket tracking tool written in Python.' },
    },
  ],
  contact: { email: 'marosandor2001@gmail.com', github: 'https://github.com/MaroSandor', linkedin: null },
};
