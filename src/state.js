// ═══════════════════════════════════════════════
// GAME STATE – single source of truth
// ═══════════════════════════════════════════════

export const G = {
  gold: 150,
  reputation: 0,
  totalCrafted: 0,
  day: 1,
  dayTime: 0,
  tick: 0,

  resources: {
    scrap:  { name:'Fémhulladék', icon:'🔩', val:20, max:200, quality:45, baseRate:0.15 },
    coal:   { name:'Szén/Koksz',  icon:'🪨', val:15, max:150, quality:60, baseRate:0.06 },
    wood:   { name:'Fa / Nyél',   icon:'🪵', val:10, max:100, quality:55, baseRate:0.04 },
    binder: { name:'Szurok',      icon:'⬛', val:5,  max:80,  quality:50, baseRate:0.015 }
  },

  stations: [
    { id:'smelter',  name:'OLVASZTÓ',         icon:'🔥', sub:'Scrap → Fémtömb',        locked:false, active:false, progress:0, progressMax:3000,  inputSlots:[null,null], outputSlots:[null],      inputReq:{scrap:5,coal:2},       outputItem:{name:'Fémtömb',icon:'🧱',quality:0},          description:'3s',  bottleneck:false },
    { id:'anvil',    name:'KOVÁCSÁLLVÁNY',     icon:'⚒', sub:'Fémtömb → Alkatrész',    locked:false, active:false, progress:0, progressMax:8000,  inputSlots:[null,null], outputSlots:[null,null], inputReq:{ingot:1},              outputItem:{name:'Alkatrész',icon:'⚙️',quality:0},        description:'8s',  bottleneck:false },
    { id:'grinder',  name:'CSISZOLÓ / EDZŐ',  icon:'⚡', sub:'Alkatrész → Edzett',     locked:true,  active:false, progress:0, progressMax:14000, inputSlots:[null],       outputSlots:[null],      inputReq:{part:1},               outputItem:{name:'Edzett rész',icon:'🗡️',quality:0},      description:'14s', bottleneck:false },
    { id:'assembly', name:'ÖSSZESZERELÓ',      icon:'🔧', sub:'Edzett + Nyél → Termék', locked:true,  active:false, progress:0, progressMax:22000, inputSlots:[null,null], outputSlots:[null,null], inputReq:{hardened:1,wood:2},    outputItem:{name:'Kész Fegyver',icon:'⚔️',quality:0},     description:'22s', bottleneck:false },
    { id:'qc',       name:'QC ÁLLOMÁS',        icon:'🔍', sub:'Minőség ellenőrzés',     locked:true,  active:false, progress:0, progressMax:10000, inputSlots:[null],       outputSlots:[null],      inputReq:{product:1},            outputItem:{name:'Ellenőrzött',icon:'✅',quality:0},       description:'10s', bottleneck:false }
  ],

  inventory: { ingot:0, part:0, hardened:0, product:0 },
  orders: [],
  orderIdCounter: 0,
  maxOrderSlots: 2,

  upgrades: [
    { id:'u_sm1', name:'Jobb Olvasztótégely', desc:'Olvasztó: -30% idő',        cost:80,   bought:false, station:'smelter',  effect:'stationSpeed', target:'smelter',  mult:0.7 },
    { id:'u_sm2', name:'Dupla Olvasztó',      desc:'Olvasztó: -25% idő',        cost:250,  bought:false, station:'smelter',  effect:'stationSpeed', target:'smelter',  mult:0.75 },
    { id:'u_sm3', name:'Automata Adagoló',    desc:'Olvasztó: -20% idő',        cost:600,  bought:false, station:'smelter',  effect:'stationSpeed', target:'smelter',  mult:0.8 },
    { id:'u_an1', name:'Acél Kalapács',       desc:'Állvány: -25% idő',         cost:150,  bought:false, station:'anvil',    effect:'stationSpeed', target:'anvil',    mult:0.75 },
    { id:'u_an2', name:'Rugós Ütőmű',         desc:'Állvány: -25% idő',         cost:400,  bought:false, station:'anvil',    effect:'stationSpeed', target:'anvil',    mult:0.75 },
    { id:'u_an3', name:'Gőzkalapács',         desc:'Állvány: -30% idő',         cost:900,  bought:false, station:'anvil',    effect:'stationSpeed', target:'anvil',    mult:0.7 },
    { id:'u3',    name:'Csiszoló Felold',     desc:'Csiszoló aktiválása',        cost:200,  bought:false, station:null,       effect:'unlockGrinder' },
    { id:'u_gr1', name:'Durvább Csiszolókő',  desc:'Csiszoló: -30% idő',        cost:350,  bought:false, station:'grinder',  effect:'stationSpeed', target:'grinder',  mult:0.7 },
    { id:'u_gr2', name:'Elektromos Edző',     desc:'Csiszoló: -30% idő',        cost:750,  bought:false, station:'grinder',  effect:'stationSpeed', target:'grinder',  mult:0.7 },
    { id:'u6',    name:'Összeszereló Felold', desc:'Összeszereló aktiválása',    cost:400,  bought:false, station:null,       effect:'unlockAssembly' },
    { id:'u_as1', name:'Szerelőpad Bővítés',  desc:'Összeszereló: -20% idő',    cost:500,  bought:false, station:'assembly', effect:'stationSpeed', target:'assembly', mult:0.8 },
    { id:'u_as2', name:'Jig & Fixture Szett', desc:'Összeszereló: -25% idő',    cost:1100, bought:false, station:'assembly', effect:'stationSpeed', target:'assembly', mult:0.75 },
    { id:'u8',    name:'QC Állomás Felold',   desc:'QC aktiválása',              cost:600,  bought:false, station:null,       effect:'unlockQC' },
    { id:'u_qc1', name:'Mérőeszköz Csomag',   desc:'QC: -30% idő',              cost:700,  bought:false, station:'qc',       effect:'stationSpeed', target:'qc',       mult:0.7 },
    { id:'u_g1',  name:'Scrap Szorter',       desc:'+10% scrap minőség',        cost:250,  bought:false, station:null,       effect:'scrapQuality' },
    { id:'u_g2',  name:'Raktár Bővítés',      desc:'Összes max +50%',            cost:300,  bought:false, station:null,       effect:'storageUp' },
    { id:'u_g3',  name:'Extra Szénbehordó',   desc:'+0.3 szén/min',             cost:120,  bought:false, station:null,       effect:'coalRate' },
    { id:'u_g4',  name:'Mesterkovács Oktatás',desc:'+15% összes minőség',       cost:800,  bought:false, station:null,       effect:'allQuality' },
    { id:'u_os1', name:'3. Vevő Slot',        desc:'Max 3 megrendelés',         cost:180,  bought:false, station:null,       effect:'orderSlot' },
    { id:'u_os2', name:'4. Vevő Slot',        desc:'Max 4 megrendelés',         cost:380,  bought:false, station:null,       effect:'orderSlot' },
    { id:'u_os3', name:'5. Vevő Slot',        desc:'Max 5 megrendelés',         cost:650,  bought:false, station:null,       effect:'orderSlot' },
    { id:'u_os4', name:'6. Vevő Slot',        desc:'Max 6 megrendelés',         cost:1000, bought:false, station:null,       effect:'orderSlot' }
  ],

  multipliers: {
    smelterSpeed:1, anvilSpeed:1, grinderSpeed:1, assemblySpeed:1, qcSpeed:1,
    scrapQuality:0, allQuality:0
  }
};

// ═══════════════════════════════════════════════
// ORDER TEMPLATES  (minRep = szükséges hírnév)
// ═══════════════════════════════════════════════
export const ORDER_TEMPLATES = [
  // ALAP (rep 0+)
  { faction:'Kéregmanók', product:'Fémtömb',       icon:'🧱', type:'normal', reward:12, timeLimit:900,  needs:'ingot',    minRep:0,  qty:[1,3] },
  { faction:'Kéregmanók', product:'Alkatrész',     icon:'⚙️', type:'normal', reward:18, timeLimit:1200, needs:'part',     minRep:0,  qty:[1,4] },
  { faction:'Vasbosszú',  product:'Fémtömb',       icon:'🧱', type:'normal', reward:12, timeLimit:800,  needs:'ingot',    minRep:0,  qty:[2,5] },
  { faction:'Acélkarmok', product:'Alkatrész',     icon:'⚙️', type:'normal', reward:18, timeLimit:1000, needs:'part',     minRep:0,  qty:[1,3] },
  { faction:'Kéregmanók', product:'Scrap ékszer',  icon:'💍', type:'normal', reward:15, timeLimit:1800, needs:'ingot',    minRep:0,  qty:[2,4] },
  { faction:'Acélkarmok', product:'Csavar csomag', icon:'🔩', type:'normal', reward:10, timeLimit:1500, needs:'ingot',    minRep:0,  qty:[3,5] },
  // KÖZÉP (rep 10+)
  { faction:'Vasbosszú',  product:'Lándzsa hegy',  icon:'🗡️', type:'urgent', reward:55, timeLimit:400,  needs:'hardened', minRep:10, qty:[1,2] },
  { faction:'Acélkarmok', product:'Csákány fej',   icon:'⛏️', type:'normal', reward:40, timeLimit:900,  needs:'hardened', minRep:10, qty:[1,3] },
  { faction:'Kéregmanók', product:'Kulcscsomó',    icon:'🔑', type:'normal', reward:30, timeLimit:1200, needs:'part',     minRep:10, qty:[2,4] },
  { faction:'Vasbosszú',  product:'Edzett csat',   icon:'🪝', type:'urgent', reward:65, timeLimit:350,  needs:'hardened', minRep:10, qty:[1,2] },
  // HALADÓ (rep 25+)
  { faction:'Acélkarmok', product:'Kard',          icon:'⚔️', type:'normal', reward:70, timeLimit:600,  needs:'product',  minRep:25, qty:[1,2] },
  { faction:'Kéregmanók', product:'Csákány',       icon:'⛏️', type:'normal', reward:55, timeLimit:800,  needs:'product',  minRep:25, qty:[1,3] },
  { faction:'Vasbosszú',  product:'Tomahawk',      icon:'🪓', type:'urgent', reward:90, timeLimit:300,  needs:'product',  minRep:25, qty:[1,2] },
  // VIP (rep 50+)
  { faction:'Acélkarmok', product:'Páncél darab',  icon:'🛡️', type:'vip',    reward:180,timeLimit:240,  needs:'product',  minRep:50, qty:[1,2] },
  { faction:'Acélkarmok', product:'Kézigránát tok',icon:'💣', type:'vip',    reward:220,timeLimit:180,  needs:'product',  minRep:50, qty:[1,1] },
  { faction:'Vasbosszú',  product:'Harci szekerce',icon:'🪓', type:'vip',    reward:200,timeLimit:200,  needs:'product',  minRep:50, qty:[1,2] }
];

// ═══════════════════════════════════════════════
// RENDER FLAGS – shared mutable flag object
// game.js sets flags, main.js reads and clears them
// ═══════════════════════════════════════════════
export const needFullRender = {
  pipeline:  false,
  orders:    false,
  resources: false,
  upgrades:  false
};
