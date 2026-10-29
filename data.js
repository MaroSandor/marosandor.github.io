// A teljes tartalom egy helyen. A {hu, en} párok a nyelvváltáskor cserélődnek.
window.DATA = {
  name: { hu: 'Máró Sándor', en: 'Sándor Máró' },
  role: { hu: 'Frontend fejlesztő', en: 'Frontend developer' },
  version: '1.0.0',
  status: { hu: 'Elérhető új projektekre', en: 'Available for new projects' },
  photo: 'profile.webp', // a profilkép útvonala. null = monogram
  photoAlt: { hu: 'Máró Sándor karikatúra-portréja', en: 'Cartoon portrait of Sándor Máró' },

  githubUser: null,   // pl. 'sajatnev': ezzel működik a repos és a git log parancs
  formEndpoint: null, // pl. 'https://formspree.io/f/xxxxxxx': ezzel küld a send parancs

  about: {
    hu: [
      'Máró Sándor vagyok, frontend fejlesztő. Tiszta kódot, gyors oldalakat és átgondolt felületeket építek.',
      'Keretrendszer nélkül dolgozom, a böngésző alapjaira építve: HTML, CSS és JavaScript.',
    ],
    en: [
      "I'm Sándor Máró, a frontend developer. I build clean code, fast pages and thoughtful interfaces.",
      'I work without frameworks, building on the platform itself: HTML, CSS and JavaScript.',
    ],
  },
  skills: [
    { name: 'HTML', level: 90 },
    { name: 'CSS', level: 85 },
    { name: 'JavaScript', level: 80 },
    { name: 'Git', level: 70 },
  ],
  // demo: élő demó útvonala (relatív) vagy https címe. shot: opcionális képernyőkép útvonala
  projects: [
    {
      id: 'etterem', stack: 'HTML, CSS', url: '#', demo: null, shot: null,
      title: { hu: 'Éttermi weboldal', en: 'Restaurant website' },
      desc: { hu: 'Reszponzív bemutatkozó oldal étlappal és asztalfoglalással.', en: 'Responsive landing page with a menu and table booking.' },
    },
    {
      id: 'todo', stack: 'JavaScript, localStorage', url: '#', demo: 'projects/todo/index.html', shot: null,
      title: { hu: 'Teendő lista', en: 'Todo list' },
      desc: { hu: 'Feladatkezelő, amely akkor is emlékszik, ha bezárod a böngészőt.', en: 'A task manager that remembers even after you close the browser.' },
    },
    {
      id: 'idojaras', stack: 'JavaScript, API', url: '#', demo: null, shot: null,
      title: { hu: 'Időjárás app', en: 'Weather app' },
      desc: { hu: 'Városkereső nyilvános időjárás API-val.', en: 'City search backed by a public weather API.' },
    },
  ],
  contact: { email: 'marosandor2001@gmail.com', github: null, linkedin: null },
};
