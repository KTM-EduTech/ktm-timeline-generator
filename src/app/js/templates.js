/* KTM Timeline — starter templates. Sample content is editable; dates are well-established figures. */
(function (K) {
  'use strict';
  function e(type, start, end, label, sortYear, title, desc, icon, cat, hl) {
    return { date: { type: type, start: start || '', end: end || '', label: label || '', sortYear: sortYear == null ? '' : String(sortYear) }, title: title, description: desc, icon: icon, categoryId: cat || '', highlight: !!hl };
  }
  var Y = function (y, t, d, i, c, h) { return e('year', String(y), '', '', '', t, d, i, c, h); };
  var R = function (a, b, t, d, i, c, h) { return e('range', String(a), String(b), '', '', t, d, i, c, h); };
  var L = function (lab, sy, t, d, i, c, h) { return e('label', '', '', lab, sy, t, d, i, c, h); };

  var list = [
    { id: 'computers', name: 'History of Computers', icon: 'fa-solid fa-computer', theme: 'ktm', layout: 'alternating',
      meta: { title: 'The History of Computers', subtitle: 'From mechanical calculators to everyday AI' },
      categories: [['mech', 'Mechanical era', '#8C5A3C'], ['elec', 'Electronic era', '#2563EB'], ['pers', 'Personal & connected', '#16A34A']],
      events: [
        Y(1822, 'Difference Engine proposed', 'Charles Babbage designs a mechanical calculator to compute and print mathematical tables without human error.', 'fa-solid fa-gears', 'mech'),
        Y(1843, 'Ada Lovelace publishes her Notes', 'Lovelace\'s notes on the Analytical Engine include a method for calculating Bernoulli numbers, widely regarded as the first published computer program.', 'fa-solid fa-feather', 'mech', true),
        Y(1936, 'Turing describes the universal machine', 'Alan Turing\'s paper "On Computable Numbers" sets out an abstract machine that defines what can be computed.', 'fa-solid fa-brain', 'elec'),
        Y(1946, 'ENIAC unveiled', 'One of the first general-purpose electronic computers is presented to the public at the University of Pennsylvania. It filled a large room and used about 18,000 vacuum tubes.', 'fa-solid fa-server', 'elec', true),
        Y(1947, 'The transistor', 'Researchers at Bell Labs demonstrate the transistor, which later replaces bulky vacuum tubes and makes smaller computers possible.', 'fa-solid fa-microchip', 'elec'),
        Y(1971, 'First commercial microprocessor', 'Intel releases the 4004, placing a complete central processing unit on a single chip.', 'fa-solid fa-microchip', 'elec'),
        Y(1981, 'The IBM Personal Computer', 'The IBM PC brings computers into offices and homes and sets a standard many manufacturers follow.', 'fa-solid fa-desktop', 'pers'),
        R(1989, 1991, 'The World Wide Web', 'Tim Berners-Lee proposes the Web in 1989 at CERN; the first website goes online in 1991.', 'fa-solid fa-globe', 'pers', true),
        Y(2007, 'Touchscreen smartphones go mainstream', 'Pocket-sized computers with touchscreens, apps and mobile internet become part of daily life.', 'fa-solid fa-mobile-screen', 'pers'),
        L('Early 2020s', 2022, 'AI assistants for everyone', 'Large language models become widely available tools for writing, coding and learning.', 'fa-solid fa-robot', 'pers')
      ] },
    { id: 'world', name: 'World History', icon: 'fa-solid fa-earth-asia', theme: 'historical', layout: 'single', layoutOpts: { single: { linePosition: 'center' } }, datePosition: 'line',
      meta: { title: 'Turning Points in World History', subtitle: 'Selected events that shaped the modern world' },
      categories: [['anc', 'Ancient', '#8C5A3C'], ['med', 'Medieval & early modern', '#C9A227'], ['mod', 'Modern', '#3D5A80']],
      events: [
        L('c. 3200 BCE', -3200, 'Writing develops in Mesopotamia', 'Sumerians develop cuneiform, one of the earliest known writing systems, pressed into clay tablets.', 'fa-solid fa-scroll', 'anc', true),
        L('776 BCE', -776, 'First recorded Olympic Games', 'The ancient Greeks hold athletic contests at Olympia in honour of Zeus.', 'fa-solid fa-medal', 'anc'),
        Y(1215, 'Magna Carta', 'English barons force King John to accept limits on royal power, an early milestone for the rule of law.', 'fa-solid fa-landmark', 'med'),
        L('c. 1440', 1440, 'Gutenberg\'s printing press', 'Movable-type printing spreads across Europe, making books cheaper and ideas travel faster.', 'fa-solid fa-print', 'med', true),
        Y(1492, 'Columbus reaches the Americas', 'The voyage begins sustained contact between Europe and the Americas, with lasting and often devastating consequences.', 'fa-solid fa-ship', 'med'),
        Y(1789, 'The French Revolution', 'Revolution in France challenges monarchy and spreads ideas of liberty, equality and citizenship.', 'fa-solid fa-flag', 'mod'),
        R(1914, 1918, 'The First World War', 'A global conflict centred in Europe transforms politics, borders and societies.', 'fa-solid fa-shield-halved', 'mod'),
        R(1939, 1945, 'The Second World War', 'The deadliest conflict in human history ends with the founding of the United Nations in 1945.', 'fa-solid fa-dove', 'mod', true),
        Y(1969, 'First crewed Moon landing', 'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin walk on the Moon.', 'fa-solid fa-moon', 'mod'),
        Y(1989, 'Fall of the Berlin Wall', 'The opening of the wall becomes a symbol of the end of the Cold War in Europe.', 'fa-solid fa-person-walking', 'mod')
      ] },
    { id: 'lifecycle', name: 'Life Cycle', icon: 'fa-solid fa-bug', theme: 'pastel', layout: 'cards', layoutOpts: { cards: { columns: 4 } }, markerContent: 'number',
      meta: { title: 'Life Cycle of a Butterfly', subtitle: 'Complete metamorphosis in four stages' },
      categories: [],
      events: [
        L('Stage 1', 1, 'Egg', 'A female butterfly lays tiny eggs on a leaf the caterpillars will be able to eat.', 'fa-solid fa-egg'),
        L('Stage 2', 2, 'Larva (caterpillar)', 'The caterpillar hatches and eats almost constantly, shedding its skin several times as it grows.', 'fa-solid fa-leaf'),
        L('Stage 3', 3, 'Pupa (chrysalis)', 'Inside a protective chrysalis the caterpillar\'s body is reorganised into a butterfly.', 'fa-solid fa-hourglass-half', '', true),
        L('Stage 4', 4, 'Adult butterfly', 'The adult emerges, dries its wings and flies off to feed on nectar and find a mate, starting the cycle again.', 'fa-solid fa-dove')
      ] },
    { id: 'roadmap', name: 'Project Roadmap', icon: 'fa-solid fa-route', theme: 'blue', layout: 'roadmap', layoutOpts: { roadmap: { progress: 3, perRow: 3, path: 'curved' } },
      meta: { title: 'School Website Project Roadmap', subtitle: 'Sample plan — edit the milestones to match your project' },
      categories: [['plan', 'Planning', '#2563EB'], ['build', 'Build', '#F59E0B'], ['launch', 'Launch', '#16A34A']],
      events: [
        L('Week 1–2', 1, 'Discovery', 'Interview staff and students, list requirements and agree on success measures.', 'fa-solid fa-magnifying-glass', 'plan'),
        L('Week 3', 3, 'Site map & wireframes', 'Plan the pages and sketch layouts for the most important screens.', 'fa-solid fa-sitemap', 'plan'),
        L('Week 4–6', 4, 'Content and design', 'Write page content, gather photos and apply the school\'s brand colours.', 'fa-solid fa-palette', 'build'),
        L('Week 7–8', 7, 'Build & test', 'Build the pages, check accessibility and test on phones, tablets and Chromebooks.', 'fa-solid fa-screwdriver-wrench', 'build', true),
        L('Week 9', 9, 'Feedback round', 'Share a preview with a pilot group and fix the issues they find.', 'fa-solid fa-comments', 'build'),
        L('Week 10', 10, 'Launch', 'Publish the site and announce it to the school community.', 'fa-solid fa-rocket', 'launch', true)
      ] },
    { id: 'learning', name: 'Learning Journey', icon: 'fa-solid fa-graduation-cap', theme: 'classroom', layout: 'single',
      meta: { title: 'My Python Learning Journey', subtitle: 'A term of programming, one step at a time' },
      categories: [['basics', 'Basics', '#3D5A80'], ['proj', 'Projects', '#EE6C4D']],
      events: [
        L('Week 1', 1, 'Hello, Python', 'Install an editor, write the first print statement and learn how to run a program.', 'fa-solid fa-code', 'basics'),
        L('Week 2', 2, 'Variables and input', 'Store values in variables and ask the user questions with input().', 'fa-solid fa-keyboard', 'basics'),
        L('Week 3–4', 3, 'Decisions and loops', 'Use if statements and for/while loops to control what a program does.', 'fa-solid fa-repeat', 'basics'),
        L('Week 5', 5, 'Mini project: quiz game', 'Combine everything so far to build a multiple-choice quiz with a score.', 'fa-solid fa-gamepad', 'proj', true),
        L('Week 6–7', 6, 'Lists and functions', 'Organise data in lists and break programs into reusable functions.', 'fa-solid fa-list', 'basics'),
        L('Week 8', 8, 'Final project showcase', 'Present a finished program to the class and reflect on what was learned.', 'fa-solid fa-trophy', 'proj', true)
      ] },
    { id: 'biography', name: 'Personal Biography', icon: 'fa-solid fa-user', theme: 'minimal', layout: 'horizontal',
      meta: { title: 'About Me: Alex Rivera', subtitle: 'A sample biography — replace with real milestones' },
      categories: [['life', 'Life', '#111827'], ['school', 'School', '#6B7280']],
      events: [
        Y(2012, 'Born in Cebu City', 'The first chapter of the story.', 'fa-solid fa-baby', 'life'),
        Y(2017, 'Started primary school', 'Learned to read, write and make lifelong friends.', 'fa-solid fa-school', 'school'),
        Y(2020, 'Moved to Thailand', 'A new country, a new language and a new home by the sea.', 'fa-solid fa-plane', 'life', true),
        Y(2023, 'First coding club', 'Built a first Scratch game and discovered a love of programming.', 'fa-solid fa-laptop-code', 'school'),
        Y(2025, 'Science fair award', 'Won a prize for a project on solar-powered water filters.', 'fa-solid fa-award', 'school', true),
        L('Next', 2030, 'Future goals', 'Study computer science and build tools that help other students learn.', 'fa-solid fa-rocket', 'life')
      ] },
    { id: 'science', name: 'Scientific Discoveries', icon: 'fa-solid fa-flask', theme: 'dark', layout: 'horizontal',
      meta: { title: 'Great Scientific Discoveries', subtitle: 'Ideas that changed how we understand the universe' },
      categories: [['phys', 'Physics', '#FEDC69'], ['bio', 'Biology & medicine', '#4ADE80'], ['chem', 'Chemistry', '#60A5FA']],
      events: [
        Y(1687, 'Newton\'s laws of motion and gravitation', 'Isaac Newton publishes the Principia, describing motion and universal gravitation.', 'fa-solid fa-apple-whole', 'phys', true),
        Y(1859, 'Theory of evolution by natural selection', 'Charles Darwin publishes On the Origin of Species.', 'fa-solid fa-dna', 'bio'),
        Y(1869, 'The periodic table', 'Dmitri Mendeleev arranges the elements by atomic weight and predicts elements not yet discovered.', 'fa-solid fa-table-cells', 'chem'),
        Y(1905, 'Special relativity', 'Albert Einstein shows that space and time are linked and introduces E = mc².', 'fa-solid fa-atom', 'phys'),
        Y(1928, 'Penicillin discovered', 'Alexander Fleming notices that a mould kills bacteria, leading to the first widely used antibiotic.', 'fa-solid fa-capsules', 'bio', true),
        Y(1953, 'Structure of DNA', 'Watson and Crick, using X-ray images by Rosalind Franklin, describe the double helix.', 'fa-solid fa-dna', 'bio'),
        Y(2012, 'Higgs boson confirmed', 'Experiments at CERN\'s Large Hadron Collider detect the long-predicted particle.', 'fa-solid fa-atom', 'phys'),
        Y(2015, 'Gravitational waves detected', 'LIGO detects ripples in spacetime from two merging black holes (announced in 2016).', 'fa-solid fa-satellite-dish', 'phys')
      ] },
    { id: 'tech', name: 'Technology Evolution', icon: 'fa-solid fa-microchip', theme: 'mono', layout: 'compact',
      meta: { title: 'How Communication Technology Evolved', subtitle: 'From wires to wireless' },
      categories: [],
      events: [
        Y(1876, 'Telephone patented', 'Alexander Graham Bell receives a patent for the telephone.', 'fa-solid fa-phone'),
        Y(1895, 'Radio signals', 'Guglielmo Marconi begins experiments sending wireless telegraph signals.', 'fa-solid fa-radio'),
        Y(1927, 'Electronic television', 'Philo Farnsworth transmits the first image with a fully electronic television system.', 'fa-solid fa-tv'),
        Y(1962, 'Telstar satellite', 'The first satellite to relay live television across the Atlantic.', 'fa-solid fa-satellite'),
        Y(1973, 'First handheld mobile phone call', 'Martin Cooper of Motorola makes a call on a prototype handheld phone.', 'fa-solid fa-mobile-screen', '', true),
        Y(1983, 'The internet adopts TCP/IP', 'ARPANET switches to TCP/IP, the protocols the internet still uses.', 'fa-solid fa-network-wired'),
        Y(1991, 'The first website', 'The World Wide Web becomes publicly available.', 'fa-solid fa-globe', '', true),
        Y(1999, 'Wi-Fi certification begins', 'The Wi-Fi Alliance starts certifying wireless networking products.', 'fa-solid fa-wifi'),
        Y(2007, 'Smartphones', 'Touchscreen phones put the internet in everyone\'s pocket.', 'fa-solid fa-mobile-screen'),
        Y(2019, '5G networks launch', 'The first commercial 5G mobile networks switch on.', 'fa-solid fa-tower-cell')
      ] }
  ];

  function build(tid) {
    var M = K.model, t = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === tid) t = list[i];
    var P = M.defaultProject(t ? t.name : 'Blank timeline');
    if (!t) { P.meta.title = 'My timeline'; P.meta.subtitle = ''; return P; }
    P.meta.title = t.meta.title; P.meta.subtitle = t.meta.subtitle;
    P.layout.type = t.layout;
    if (t.layoutOpts) M.deepMerge(P.layout, t.layoutOpts);
    K.themes.apply(P.design, t.theme);
    if (t.datePosition) P.design.structure.datePosition = t.datePosition;
    if (t.markerContent) P.design.structure.markerContent = t.markerContent;
    var catMap = {};
    P.categories = t.categories.map(function (c) { var id = M.uid('cat'); catMap[c[0]] = id; return { id: id, name: c[1], color: c[2] }; });
    P.events = t.events.map(function (x, n) { var ev = M.createEvent(x); ev.categoryId = x.categoryId ? catMap[x.categoryId] : ''; ev.order = n; return ev; });
    return P;
  }
  K.templates = { list: list, build: build };
})(window.KTM = window.KTM || {});
