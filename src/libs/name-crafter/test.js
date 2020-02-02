const NameCrafter = require('./index');

const nc = new NameCrafter();


nc.pattern = 1
nc.list = [
    'icare',
    'pulsar',
    'osadis',
    'ocasis',
    'scribe',
    'geaude',
    'agorha',
    'thales',
    'crogend',
    'gendcom',
    'agecap',
    'oscar',
    'foves',
    'solaris',
    'resogend',
    'rubis',
    'vulcain',
    'reuni',
    'chorus',
    'aramis',
    'athena',
    'fnaeg',
    'helios',
    'escort',
    'heliops',
    'sic',
    'osic',
    'thanatos',
    'pandore',
    'eucaris',
    'marinetraffic',
    'ifados',
    'dracar',
    'bicycode',
    'stitch',
    'interpol',
    'europol',
    'faed',
    'fojag',
    'minautore',
    'clepsydre'
];



// nc.setList([
// 'Sacha',
// 'Nolan',
// 'Timéo',
// 'Maël',
// 'Arthur',
// 'Théo',
// 'Gabin',
// 'Nathan',
// 'Paul',
// 'Mohamed',
// 'Gabriel',
// 'Adam',
// 'Raphaël',
// 'Léo',
// 'Jules',
// 'Ethan',
// 'Tom',
// 'Lucas',
// 'Liam',
// 'Hugo',
// 'Enzo',
// 'Noé',
// 'Louis',
// 'Nicolas',
// 'Mathias',
// 'Lorenzo',
// 'Noah',
// 'Amaury',
// 'Gualbert',
// 'Gratian',
// 'Tonin',
// 'Haciba',
// 'Jeoffray',
// 'Enric',
// 'Jocelin',
// 'Alibert',
// 'Roderick',
// 'Nicolas',
// 'Edwin',
// 'Erdogan',
// 'Erevan',
// 'Janique',
// 'Gert',
// 'Sinclair',
// 'Hadrian',
// 'Hamadi',
// 'Gwanael',
// 'Erique',
// 'Irchad',
// 'Lyonel',
// 'Seydou',
// 'Emerik',
// 'Fereol',
// 'Gareth',
// 'Gaylor',
// 'Ramzy',
// 'Kevyn',
// 'Housni',
// 'Godfroy',
// 'Geordie',
// 'Eloic',
// 'Godwin',
// 'Gwenhaël',
// 'Dwight',
// 'Eitan',
// 'Roy',
// 'Ernst',
// 'Frederich',
// 'Enso',
// 'Ersan',
// 'Eray',
// 'Téophile',
// 'Hendrick',
// 'Gianny',
// 'Guillermo',
// 'Gontrand',
// 'Alexan',
// 'Erwen',
// 'Luiz',
// 'Vidal',
// 'Rudolph',
// 'Hervey',
// 'Ervan',
// 'Cheick',
// 'Dempsey',
// 'Guilio',
// 'Childeric',
// 'Geofrey',
// 'Gwenegan',
// 'Gülcan',
// 'Gudrun',
// 'Elmehdi',
// 'Gerry',
// 'Christophe'
// ]);



function getRandomLength() {
    return Math.floor(Math.random() * 3 + 1) + Math.floor(Math.random() * 3 + 1) + Math.floor(Math.random() * 3 + 1);
}



console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()));
console.log(nc.generate(getRandomLength()*2));


