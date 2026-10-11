/**
 * Photo library for the demo.
 *
 * All photos are from Unsplash (https://unsplash.com/license — free to use,
 * no attribution required; credits kept here anyway). They load from
 * Unsplash's image CDN, so the phone needs internet; each has a blurhash
 * that renders instantly as a soft preview while the photo loads, and as a
 * fallback if it can't.
 *
 * To use a client's own photos later, swap `uri` for a bundled image
 * (`require('../../assets/photos/x.jpg')`) or a Supabase Storage URL.
 */

export type PhotoKey =

  | 'hero'
  | 'beekeepers'
  | 'campfire'
  | 'bonfireCircle'
  | 'produce'
  | 'lego'
  | 'legoFig'
  | 'coffeeSmile'
  | 'laptop'
  | 'elder'
  | 'books'
  | 'tools'
  | 'pumpkins'
  | 'lights'
  | 'garden'
  | 'deskLaptop'
  | 'river'
  | 'snowTrail'
  | 'butterfly'
  | 'family'
  | 'toast'
  | 'concert';

export interface Photo {
  id: string;
  width: number;
  height: number;
  blurhash: string;
  alt: string;
  credit: string;
}

export const PHOTOS: Record<PhotoKey, Photo> = {
  hero: { id: 'photo-1446569971295-057569541991', width: 5392, height: 3453, blurhash: "LLGG|xxaELf6yFS#nhni11WXw]ae", alt: "People sitting on seashore while watching golden hour", credit: "Cristina  Cerda on Unsplash" },
  beekeepers: { id: 'photo-1556316830-8fce5824a0f7', width: 5335, height: 3557, blurhash: "LVMtX9_49Z-=I:xwR+Rix^bIRPax", alt: "Four people in anti-bee bite suit holding honeycomb during daylight", credit: "Douglas Raggio on Unsplash" },
  campfire: { id: 'photo-1444210971048-6130cf0c46cf', width: 4426, height: 2943, blurhash: "LkGlCtjroeof?wf5WVj[59WBR-az", alt: "Group of people setting up campfire", credit: "Kimson Doan on Unsplash" },
  bonfireCircle: { id: 'photo-1572930621326-f5297aeccc6b', width: 5319, height: 3541, blurhash: "L88fT1=c5SNd5lS3xZR+0~Nb-ToJ", alt: "People sitting around bonfire", credit: "Jack Cohen on Unsplash" },
  produce: { id: 'photo-1745367228695-a1c7a12df13f', width: 4243, height: 6364, blurhash: "LRDSp}M{o#bHIVxuoeR*0KogadjY", alt: "A produce stand sells fresh fruits and vegetables", credit: "Mason C on Unsplash" },
  lego: { id: 'photo-1567413697149-685997231da5', width: 9504, height: 6336, blurhash: "L_GvVJRjkCf+4mn~f6jsobkCWBae", alt: "Lego character", credit: "Bence Balla-Schottner on Unsplash" },
  legoFig: { id: 'photo-1547834754-2c47b3537aa2', width: 4000, height: 6000, blurhash: "L35rGPj]8^j[WBj[t7f6DifP-;f7", alt: "Selective focus photography of of Lego minifig toy", credit: "Rishabh Pammi on Unsplash" },
  coffeeSmile: { id: 'photo-1745433972680-6f4d34b602c3', width: 4000, height: 6000, blurhash: "LZHT{k0zWBM{t+#mozRkxtkCRjof", alt: "A smiling woman holds a coffee cup and wears a hat", credit: "Brooke Balentine on Unsplash" },
  laptop: { id: 'photo-1743945968054-088cff86a63a', width: 7728, height: 5152, blurhash: "LJMGx2%hu6ax?bVst7t8JBIA9Fxu", alt: "Laptop, camera, and phone on a wooden table", credit: "Howard Bouchevereau on Unsplash" },
  elder: { id: 'photo-1746310920320-b4d078257303', width: 7008, height: 4672, blurhash: "LFBCoR$20gkBZ$bISixD69ae,:bb", alt: "An elderly woman with a scarf looks directly at viewer", credit: "Matthew Stephenson on Unsplash" },
  books: { id: 'photo-1745594618508-6e3abfce30ef', width: 6240, height: 4160, blurhash: "LaJk+PDg?H%M?cM{WBt7obSORjbI", alt: "Books are stacked on a small white table", credit: "Karl Joshua Bernal on Unsplash" },
  tools: { id: 'photo-1556912743-90a361c19b16', width: 2176, height: 3264, blurhash: "LcIhgP~CxuW;o$V?R+t7%gNHozRj", alt: "Pair of work boots beside gloves and handheld tools", credit: "Sven Brandsma on Unsplash" },
  pumpkins: { id: 'photo-1475348794581-d7dfb1194435', width: 4592, height: 3448, blurhash: "LHLC-3}=0#9b-TbvIVj@JVE1xV%1", alt: "Selective focus photography of pumpkins", credit: "Aaron Burden on Unsplash" },
  lights: { id: 'photo-1543784625-b74a37b5b03d', width: 4895, height: 3268, blurhash: "LZJ721oz0goJxaxas:WB9bxZofNH", alt: "Selective focus photography of gold-colored hanging decor with string lights", credit: "Luca Florio on Unsplash" },
  garden: { id: 'photo-1591857177580-dc82b9ac4e1e', width: 3500, height: 2333, blurhash: "LOFQW@oz8|IC8$%fadIU%fxuO8M{", alt: "Green plants on black metal train rail during daytime", credit: "Markus Spiske on Unsplash" },
  deskLaptop: { id: 'photo-1438262267532-2db13fcceca2', width: 6016, height: 4016, blurhash: "LMG[m04:9#rB_N9FsoNF-?%2E1RP", alt: "Silver laptop computer and yellow-and-red petaled flowers", credit: "Alexander Filonchik on Unsplash" },
  river: { id: 'photo-1498534405718-957b7b84b009', width: 6000, height: 4000, blurhash: "LEBWl0a%00IU_3ogD%Ri?ctQD%M{", alt: "River between green leafed trees", credit: "Jacalyn Beales on Unsplash" },
  snowTrail: { id: 'photo-1445543949571-ffc3e0e2f55e', width: 6016, height: 4016, blurhash: "LlIi8{%MMxaI?wnhoLs,IqV?t7s:", alt: "Green pine trees during snow season", credit: "Ian Schneider on Unsplash" },
  butterfly: { id: 'photo-1516683345437-ba658903a76a', width: 4690, height: 3276, blurhash: "LII{:r$y559t}^EKW5-o9RIlt1-q", alt: "Person holding yellow and black butterfly", credit: "David Clode on Unsplash" },
  family: { id: 'photo-1475503572774-15a45e5d60b9', width: 3861, height: 2574, blurhash: "L#KxM9ofRkj[u6fkRjayRkayWBay", alt: "Man, woman and child holding hands on seashore", credit: "Natalya Zaritskaya on Unsplash" },
  toast: { id: 'photo-1744836239470-f1cfcbb9d691', width: 4896, height: 3264, blurhash: "LOH-iRx^sDE%~WWA$*bwxtn+WXJ7", alt: "People are toasting with colorful glasses of beer", credit: "Look Again Digital on Unsplash" },
  concert: { id: 'photo-1745792820182-bba49ed8a0a4', width: 2800, height: 1867, blurhash: "L65=9I-?ITMv-=xvWAac4mIT%Mxw", alt: "Concert stage with lights and a crowd", credit: "kofa boyah on Unsplash" },
};

/** Unsplash CDN URL sized for the slot (Unsplash resizes server-side). */
export function photoUri(key: PhotoKey, width = 900) {
  return `https://images.unsplash.com/${PHOTOS[key].id}?w=${width}&q=75&auto=format&fit=crop`;
}

/** Covers an admin can pick for new events. */
export const EVENT_COVERS: PhotoKey[] = ['bonfireCircle', 'campfire', 'garden', 'pumpkins', 'lights', 'river', 'books', 'toast'];
