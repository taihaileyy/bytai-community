/**
 * Photo library.
 *
 * - New Orleans photos (`local`) ship inside the app from assets/photos/.
 *   They came from the design reference and are preview resolution; drop
 *   full-size files over them with the same names and nothing else changes.
 * - The rest are Unsplash photos (https://unsplash.com/license, free to use),
 *   loaded from Unsplash's CDN with a blurhash preview while they load.
 */
import type { ImageSourcePropType } from 'react-native';

export type PhotoKey =
  | 'streetcar'
  | 'youthMural'
  | 'balcony'
  | 'giveSign'
  | 'produce'
  | 'laptop'
  | 'books'
  | 'deskLaptop'
  | 'river'
  | 'lights'
  | 'bonfireCircle'
  | 'campfire'
  | 'coffeeSmile'
  | 'family'
  | 'toast'
  | 'concert'
  | 'garden'
  | 'elder'
  | 'pumpkins'
  | 'sax'
  | 'trumpet'
  | 'skyline'
  | 'skylineTall'
  | 'crowd'
  | 'neonCity';

export interface Photo {
  alt: string;
  credit: string;
  local?: ImageSourcePropType;
  id?: string;
  blurhash?: string;
}

export const PHOTOS: Record<PhotoKey, Photo> = {
  streetcar: { local: require('../../assets/photos/nola-streetcar.jpg'), alt: "Red streetcar on a palm-lined New Orleans avenue at dusk", credit: 'ByTAI design reference' },
  youthMural: { local: require('../../assets/photos/nola-youth-mural.jpg'), alt: "Young man in front of a \u201cNOLA Youth Thrive\u201d mural", credit: 'ByTAI design reference' },
  balcony: { local: require('../../assets/photos/nola-balcony.jpg'), alt: "Wrought-iron French Quarter balconies with hanging plants at night", credit: 'ByTAI design reference' },
  giveSign: { local: require('../../assets/photos/nola-give-sign.jpg'), alt: "Neon \u201cGive Back to NOLA\u201d sign on a brick wall", credit: 'ByTAI design reference' },
  produce: { id: 'photo-1745367228695-a1c7a12df13f', blurhash: "LRDSp}M{o#bHIVxuoeR*0KogadjY", alt: "A produce stand sells fresh fruits and vegetables", credit: "Mason C on Unsplash" },
  laptop: { id: 'photo-1743945968054-088cff86a63a', blurhash: "LJMGx2%hu6ax?bVst7t8JBIA9Fxu", alt: "Laptop, camera, and phone on a wooden table", credit: "Howard Bouchevereau on Unsplash" },
  books: { id: 'photo-1745594618508-6e3abfce30ef', blurhash: "LaJk+PDg?H%M?cM{WBt7obSORjbI", alt: "Books are stacked on a small white table", credit: "Karl Joshua Bernal on Unsplash" },
  deskLaptop: { id: 'photo-1438262267532-2db13fcceca2', blurhash: "LMG[m04:9#rB_N9FsoNF-?%2E1RP", alt: "Silver laptop computer and yellow-and-red petaled flowers", credit: "Alexander Filonchik on Unsplash" },
  river: { id: 'photo-1498534405718-957b7b84b009', blurhash: "LEBWl0a%00IU_3ogD%Ri?ctQD%M{", alt: "River between green leafed trees", credit: "Jacalyn Beales on Unsplash" },
  lights: { id: 'photo-1543784625-b74a37b5b03d', blurhash: "LZJ721oz0goJxaxas:WB9bxZofNH", alt: "Selective focus photography of gold-colored hanging decor with string lights", credit: "Luca Florio on Unsplash" },
  bonfireCircle: { id: 'photo-1572930621326-f5297aeccc6b', blurhash: "L88fT1=c5SNd5lS3xZR+0~Nb-ToJ", alt: "People sitting around bonfire", credit: "Jack Cohen on Unsplash" },
  campfire: { id: 'photo-1444210971048-6130cf0c46cf', blurhash: "LkGlCtjroeof?wf5WVj[59WBR-az", alt: "Group of people setting up campfire", credit: "Kimson Doan on Unsplash" },
  coffeeSmile: { id: 'photo-1745433972680-6f4d34b602c3', blurhash: "LZHT{k0zWBM{t+#mozRkxtkCRjof", alt: "A smiling woman holds a coffee cup and wears a hat", credit: "Brooke Balentine on Unsplash" },
  family: { id: 'photo-1475503572774-15a45e5d60b9', blurhash: "L#KxM9ofRkj[u6fkRjayRkayWBay", alt: "Man, woman and child holding hands on seashore", credit: "Natalya Zaritskaya on Unsplash" },
  toast: { id: 'photo-1744836239470-f1cfcbb9d691', blurhash: "LOH-iRx^sDE%~WWA$*bwxtn+WXJ7", alt: "People are toasting with colorful glasses of beer", credit: "Look Again Digital on Unsplash" },
  concert: { id: 'photo-1745792820182-bba49ed8a0a4', blurhash: "L65=9I-?ITMv-=xvWAac4mIT%Mxw", alt: "Concert stage with lights and a crowd", credit: "kofa boyah on Unsplash" },
  garden: { id: 'photo-1591857177580-dc82b9ac4e1e', blurhash: "LOFQW@oz8|IC8$%fadIU%fxuO8M{", alt: "Green plants on black metal train rail during daytime", credit: "Markus Spiske on Unsplash" },
  elder: { id: 'photo-1746310920320-b4d078257303', blurhash: "LFBCoR$20gkBZ$bISixD69ae,:bb", alt: "An elderly woman with a scarf looks directly at viewer", credit: "Matthew Stephenson on Unsplash" },
  pumpkins: { id: 'photo-1475348794581-d7dfb1194435', blurhash: "LHLC-3}=0#9b-TbvIVj@JVE1xV%1", alt: "Selective focus photography of pumpkins", credit: "Aaron Burden on Unsplash" },
  sax: { id: 'photo-1553203659-551ca1d4d7c3', blurhash: "LOExtuIuxWI@~Vs.Rjt5%LWVRjj[", alt: "Man playing saxophone photography", credit: "Yunming Wang on Unsplash" },
  trumpet: { id: 'photo-1573871669414-010dbf73ca84', blurhash: "LoLz1Xs:M|oe~TbHafazIWjZRkaz", alt: "Brass-colored trumpet", credit: "Hal Gatewood on Unsplash" },
  skyline: { id: 'photo-1437149310981-0f2690a6069d', blurhash: "L88D3MEeNf-U=*W,$+WZ$,s;s;xI", alt: "City at night under purple and orange cloudy sky", credit: "Drew on Unsplash" },
  skylineTall: { id: 'photo-1562351778-a451cb11dc90', blurhash: "L43lUCofMxa}*0j[V?j[tnazadj@", alt: "Cityscape at nighttime", credit: "Andre Benz on Unsplash" },
  crowd: { id: 'photo-1571525030628-dbccfb5223b6', blurhash: "LHAmF$Rj0g-.-oaeIpt70gkC-nRj", alt: "Man playing guitar in front of crowd", credit: "Blake Carpenter on Unsplash" },
  neonCity: { id: 'photo-1443175679639-685643a7fd62', blurhash: "LB7nqDMy4mxuD$ofxvbaNaWBxuV@", alt: "Aerial photo of city lights at night time", credit: "TEDDY2 H on Unsplash" },
};

/** Image source sized for the slot (Unsplash resizes server-side). */
export function photoSource(key: PhotoKey, width = 900): ImageSourcePropType | { uri: string } {
  const p = PHOTOS[key];
  if (p.local) return p.local;
  return { uri: `https://images.unsplash.com/${p.id}?w=${width}&q=75&auto=format&fit=crop` };
}

/** Covers an admin can pick for new events. */
export const EVENT_COVERS: PhotoKey[] = ['crowd', 'streetcar', 'balcony', 'sax', 'produce', 'river', 'lights', 'bonfireCircle'];
