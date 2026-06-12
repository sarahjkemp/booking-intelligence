import { writeFile } from "node:fs/promises";
import path from "node:path";

const curatedGenres = {
  pop: `
Taylor Swift
Dua Lipa
Olivia Rodrigo
Billie Eilish
Harry Styles
Charli xcx
Sabrina Carpenter
Chappell Roan
Troye Sivan
Lorde
Lana Del Rey
HAIM
RAYE
Becky Hill
Mabel
Anne-Marie
Ellie Goulding
Zara Larsson
Sigrid
Maisie Peters
Holly Humberstone
Mimi Webb
Tom Grennan
Lewis Capaldi
Benson Boone
Conan Gray
AURORA
Tove Lo
Robyn
Jessie Ware
Griff
Bakar
Lola Young
Rachel Chinouriri
Olivia Dean
Remi Wolf
Clairo
Caroline Polachek
King Princess
Rina Sawayama
Kim Petras
Kylie Minogue
Rita Ora
Jess Glynne
Self Esteem
Nadine Shah
Alessia Cara
Dagny
Maggie Rogers
Nelly Furtado
Kesha
FLO
Tate McRae
L Devine
MUNA
Sky Ferreira
The Japanese House
Broods
Chelsea Cutler
Jade
Tinashe
Shygirl
SG Lewis
Pale Waves
Marina
Foxes
Sophie Ellis-Bextor
Allie X
Dodie
Mxmtoon
Nieve Ella
Maggie Lindemann
Isaac Dunbar
Noah Cyrus
Laufey
Bebe Rexha
Julia Michaels
Ella Henderson
Georgia
MØ
L Devine
Rebecca Black
Victoria Monét
Ravyn Lenae
Sabrina Claudio
Fousheé
`,
  indie: `
Arctic Monkeys
The 1975
Sam Fender
Foals
Wolf Alice
Fontaines D.C.
IDLES
Wet Leg
Inhaler
The Last Dinner Party
Bombay Bicycle Club
The Wombats
Blossoms
Everything Everything
Declan McKenna
The Kooks
The Vaccines
Sea Girls
The Amazons
Sundara Karma
Sports Team
Yard Act
Shame
Squid
Black Country, New Road
black midi
English Teacher
The Murder Capital
The Snuts
Working Men's Club
The Big Moon
Dry Cleaning
Courting
Sleaford Mods
Slowdive
Ride
Wunderhorse
beabadoobee
Alvvays
Franz Ferdinand
Yeah Yeah Yeahs
Future Islands
Japanese Breakfast
Porridge Radio
Nova Twins
The Mysterines
The Lathums
The Reytons
Two Door Cinema Club
White Lies
Editors
Kasabian
The Libertines
The Cribs
The Coral
The Pigeon Detectives
Maximo Park
The Royston Club
Gurriers
The Clockworks
HotWax
Girl and Girl
Coach Party
Sorry
Do Nothing
The Murder Capital
DIIV
Snail Mail
Momma
Blondshell
Pale Blue Eyes
Nation of Language
The Academic
The Beths
Peach Pit
Wallows
Pond
Phoenix
Metric
TV Girl
`,
  rock: `
Queens of the Stone Age
Paramore
Royal Blood
Nothing But Thieves
Biffy Clyro
Muse
Bring Me the Horizon
Sleep Token
Enter Shikari
Don Broco
Frank Carter & The Rattlesnakes
Bob Vylan
Soft Play
Lambrini Girls
High Vis
Amyl and the Sniffers
Viagra Boys
Turnstile
Militarie Gun
PUP
Creeper
Skindred
While She Sleeps
Architects
Bury Tomorrow
Holding Absence
Loathe
Static Dress
Knocked Loose
GEL
Speed
Alkaline Trio
The Hives
Fever 333
Placebo
Interpol
Manic Street Preachers
The National
Pixies
Smashing Pumpkins
Gojira
Mastodon
Deftones
Code Orange
The Armed
Cancer Bats
PVRIS
Palaye Royale
Mallory Knox
Twin Atlantic
You Me At Six
Boston Manor
Trash Boat
Holding Absence
The Hunna
Lower Than Atlantis
The Menzingers
Tigercub
Dead Pony
Kid Kapichi
FIDLAR
The Bronx
Kills Birds
Poppy
Spiritbox
Crossfaith
Malevolence
Hot Milk
Wargasm
The Warning
The Pale White
Dinosaur Pile-Up
Milk Teeth
Turbowolf
The Amazons
`,
  electronic: `
Fred again..
Bicep
Barry Can't Swim
Jamie xx
Four Tet
Bonobo
Jon Hopkins
Overmono
Floating Points
Disclosure
Mall Grab
DJ Seinfeld
Ross From Friends
Caribou
TSHA
salute
Jayda G
Peggy Gou
Honey Dijon
The Blessed Madonna
Ben UFO
Joy Orbison
Skream
Sally C
KI/KI
Daniel Avery
Kelly Lee Owens
Sherelle
I. JORDAN
Elkka
Romy
HAAi
KETTAMA
Confidence Man
Shanti Celeste
Logic1000
Nia Archives
Interplanetary Criminal
Prospa
Hot Since 82
Patrick Topping
Eats Everything
Folamour
Maribou State
Orbital
Underworld
Leftfield
Groove Armada
Ewan McVicar
Denis Sulta
Jaguar
Saoirse
VTSS
Daphni
LSDXOXO
Mount Kimbie
Octo Octa
Avalon Emerson
Bambounou
Bklava
Anz
DJ Boring
Mura Masa
Ross From Friends
Tourist
Seb Wildblood
Logic1000
NERO
Rudimental
Chase & Status
Sub Focus
Wilkinson
CamelPhat
Gorgon City
Elderbrook
Róisín Murphy
`,
  hip_hop: `
Stormzy
Central Cee
Dave
Little Simz
AJ Tracey
Headie One
J Hus
Aitch
Loyle Carner
Skepta
Giggs
Ghetts
Kano
D-Block Europe
Knucks
Nines
Pa Salieu
Digga D
Unknown T
K-Trap
Blanco
Nemzzz
Chip
P Money
Ocean Wisdom
Wretch 32
Kojey Radical
Avelino
Berwyn
Nafe Smallz
M Huncho
NSG
Pete and Bas
The Streets
MIST
Dizzee Rascal
JME
Novelist
Sainté
AntsLive
Lancey Foux
Bawo
JID
Denzel Curry
Tyler, The Creator
Vince Staples
Earl Sweatshirt
Joey Bada$$
Baby Keem
ScHoolboy Q
Danny Brown
Doechii
Megan Thee Stallion
Kendrick Lamar
Little Brother
Tierra Whack
Cordae
Saba
Isaiah Rashad
Run the Jewels
Freddie Gibbs
Mick Jenkins
Wiki
MAVI
redveil
Pusha T
Clipse
Jean Dawson
Aminé
GoldLink
JPEGMafia
Danny Brown
`,
  rnb_soul: `
SZA
Summer Walker
Snoh Aalegra
Brent Faiyaz
Mahalia
Jorja Smith
Cleo Sol
SAULT
Joy Crookes
Raveena
Kali Uchis
Kehlani
Giveon
Ari Lennox
Masego
Tom Misch
Jordan Rakei
Elmiene
Sasha Keable
Erika de Casier
Leon Bridges
H.E.R.
Miguel
Sampha
Pip Millett
Yazmin Lacey
Greentea Peng
Jenevieve
Tiana Major9
Connie Constance
Arlo Parks
Nao
Hope Tala
Sinead Harnett
Syd
Mereba
Durand Bernarr
Mnelia
Destin Conrad
Khamari
RINI
Dijon
Omar Apollo
FLO
Victoria Monét
Sabrina Claudio
Rochelle Jordan
Qendresa
KIRBY
Xenia Manasseh
Jaz Karis
Charlotte Day Wilson
Muni Long
Rochelle Jordan
Biig Piig
Lianne La Havas
Michael Kiwanuka
Gabriels
Jamilah Barry
Rebecca Vasmant
`,
  jazz: `
Ezra Collective
Nubya Garcia
Yussef Dayes
Moses Boyd
Alfa Mist
Kokoroko
Ashley Henry
Joe Armon-Jones
Mammal Hands
Emma-Jean Thackray
Steam Down
Kamaal Williams
Shabaka
Makaya McCraven
The Comet Is Coming
Sons of Kemet
Fergus McCreadie
GoGo Penguin
corto.alto
BADBADNOTGOOD
Brandee Younger
Kamasi Washington
Terrace Martin
Ambrose Akinmusire
Lakecia Benjamin
Nubiyan Twist
Blue Lab Beats
Sarah Tandy
Binker Golding
Elliot Galvin
Hania Rani
Portico Quartet
Poppy Ajudha
Arooj Aftab
Myele Manzanza
Mansur Brown
Theon Cross
DoomCannon
Bex Burch
Yazz Ahmed
The Messthetics
jaimie branch
Makaya McCraven
Braxton Cook
Cory Henry
Kiefer
Julian Lage
Nala Sinephro
Masego
The Bad Plus
`,
  folk: `
Noah Kahan
Adrianne Lenker
Big Thief
Ben Howard
Passenger
Laura Marling
Phoebe Bridgers
Julien Baker
Lucy Dacus
boygenius
Villagers
Flyte
Billie Marten
This Is The Kit
Katherine Priddy
Jessica Pratt
Nick Mulvey
Angie McMahon
Faye Webster
Searows
Aldous Harding
Damien Rice
José González
Gregory Alan Isakov
Bon Iver
Hozier
Daughter
The Staves
Bear's Den
Luke Sital-Singh
Nathaniel Rateliff and the Night Sweats
First Aid Kit
Brandi Carlile
The Tallest Man on Earth
Julia Jacklin
Sufjan Stevens
Cassandra Jenkins
City and Colour
Waxahatchee
Molly Tuttle
CMAT
Kacey Musgraves
Lankum
Gillian Welch
Glen Hansard
The Weather Station
Fionn Regan
Anaïs Mitchell
Foy Vance
The Milk Carton Kids
`,
  afrobeats_global: `
Burna Boy
Wizkid
Tems
Asake
Ayra Starr
Rema
Fireboy DML
Darkoo
Mr Eazi
Omah Lay
Ruger
Oxlade
Tiwa Savage
Adekunle Gold
Yemi Alade
Tyla
Uncle Waffles
Koffee
Protoje
Chronixx
Seun Kuti and Egypt 80
Femi Kuti
Fatoumata Diawara
BCUC
Moonchild Sanelly
M.anifest
Juls
Pheelz
Sarz
Black Sherif
Amaarae
Stonebwoy
Kabaka Pyramid
Lila Iké
Blaqbonez
Bnxn
Shallipopi
Nektunez
The Cavemen.
Sampa the Great
Moliy
Maleek Berry
King Promise
Davido
CKay
Kizz Daniel
Msaki
Oumou Sangaré
Youssou N'Dour
Baloji
`,
  country_roots: `
Maren Morris
Zach Bryan
Chris Stapleton
Tyler Childers
Sierra Ferrell
The War and Treaty
The Cadillac Three
49 Winchester
Jason Isbell and the 400 Unit
Brandy Clark
Margo Price
The Chicks
Sheryl Crow
The Marcus King Band
Charley Crockett
Orville Peck
Morgan Wade
Kip Moore
Ashley McBryde
Turnpike Troubadours
Old Crow Medicine Show
Willie Watson
Yola
Larkin Poe
Colter Wall
Flatland Cavalry
The Dead South
Lord Huron
Nick Shoulders
Hiss Golden Messenger
Brent Cobb
S.G. Goodman
Pony Bradshaw
Shane Smith and the Saints
The Red Clay Strays
Molly Tuttle
Sierra Hull
Katie Pruitt
The Teskey Brothers
Margo Cilker
`,
  punk_metal: `
Amyl and the Sniffers
Turnstile
Bob Vylan
Lambrini Girls
High Vis
Viagra Boys
Militarie Gun
PUP
Creeper
Skindred
Architects
Bury Tomorrow
Holding Absence
Loathe
Static Dress
Knocked Loose
GEL
Speed
Alkaline Trio
The Hives
Placebo
Deftones
Gojira
Mastodon
Code Orange
The Armed
Cancer Bats
PVRIS
Palaye Royale
Twin Atlantic
You Me At Six
Boston Manor
Trash Boat
Malevolence
Hot Milk
Wargasm
Spiritbox
Enter Shikari
Don Broco
While She Sleeps
`
};

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

const genreProfiles = {
  pop: { maxDrawLow: 250, maxDrawHigh: 2600, feeLow: 900, feeHigh: 12000 },
  indie: { maxDrawLow: 180, maxDrawHigh: 1800, feeLow: 700, feeHigh: 9000 },
  rock: { maxDrawLow: 200, maxDrawHigh: 2200, feeLow: 800, feeHigh: 10000 },
  electronic: { maxDrawLow: 150, maxDrawHigh: 1600, feeLow: 600, feeHigh: 8500 },
  hip_hop: { maxDrawLow: 180, maxDrawHigh: 2200, feeLow: 800, feeHigh: 11000 },
  rnb_soul: { maxDrawLow: 150, maxDrawHigh: 1400, feeLow: 700, feeHigh: 8000 },
  jazz: { maxDrawLow: 120, maxDrawHigh: 900, feeLow: 500, feeHigh: 5000 },
  folk: { maxDrawLow: 120, maxDrawHigh: 850, feeLow: 450, feeHigh: 4500 },
  afrobeats_global: { maxDrawLow: 160, maxDrawHigh: 1800, feeLow: 700, feeHigh: 9500 },
  country_roots: { maxDrawLow: 150, maxDrawHigh: 1400, feeLow: 650, feeHigh: 7000 },
  punk_metal: { maxDrawLow: 150, maxDrawHigh: 1600, feeLow: 650, feeHigh: 8000 }
};

function parseNames(block) {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildCuratedRecords(targetCount = 500) {
  const rows = [];
  const seen = new Set();
  let runningIndex = 0;

  for (const [genre, block] of Object.entries(curatedGenres)) {
    const names = parseNames(block);
    const genreProfile = genreProfiles[genre] ?? genreProfiles.indie;
    const maxIndex = Math.max(names.length - 1, 1);

    names.forEach((artistName, genreIndex) => {
      const dedupeKey = artistName.toLowerCase();

      if (seen.has(dedupeKey)) {
        return;
      }

      seen.add(dedupeKey);
      runningIndex += 1;

      const tier = 1 - genreIndex / maxIndex;
      const popularity = clamp(Math.round(28 + tier * 58), 24, 86);
      const followers = Math.round(14000 + tier * 860000);
      const localDemandScore = clamp(Math.round(22 + tier * 54 + (runningIndex % 5)));
      const momentumScore = clamp(Math.round(24 + tier * 52 + (runningIndex % 7)));
      const estimatedDraw = Math.round(
        genreProfile.maxDrawLow + tier * (genreProfile.maxDrawHigh - genreProfile.maxDrawLow)
      );
      const minCapacity = Math.max(100, Math.round((estimatedDraw * 0.65) / 25) * 25);
      const maxCapacity = Math.max(minCapacity + 100, Math.round((estimatedDraw * 1.2) / 25) * 25);
      const feeMin = Math.round((genreProfile.feeLow + tier * (genreProfile.feeHigh - genreProfile.feeLow)) / 10) * 10;
      const feeMax = Math.round((feeMin * 1.8) / 10) * 10;

      rows.push({
        artistName,
        spotifyArtistId: null,
        spotifyUrl: null,
        catalogueStatus: "curated",
        genre: genre.replace(/_/g, " "),
        genres: [genre.replace(/_/g, " ")],
        spotifyFollowers: followers,
        spotifyPopularity: popularity,
        imageUrl: null,
        estimatedFeeRange: {
          min: feeMin,
          max: feeMax,
          currency: "GBP"
        },
        localDemandScore,
        momentumScore,
        recentNearbyEvents: [],
        venueCapacityFit: {
          min: minCapacity,
          max: maxCapacity
        },
        futureSignals: {
          bandsintownEventHistoryReady: false,
          residentAdvisorReady: false
        }
      });
    });
  }

  return rows.slice(0, targetCount);
}

async function main() {
  const records = buildCuratedRecords(500);
  const filePath = path.join(process.cwd(), "data", "db", "artists.json");
  await writeFile(filePath, JSON.stringify(records, null, 2));
  console.log(`Wrote ${records.length} curated artist records to ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
