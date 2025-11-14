// This script is used to seed the Firestore database with initial anime data.
// To run it, you need to have Node.js installed.
// 1. Install dependencies: npm install firebase-admin
// 2. IMPORTANT: Download your Firebase service account key JSON file.
//    - Go to Firebase Console > Project Settings > Service accounts.
//    - Click "Generate new private key".
//    - Save the file as 'serviceAccountKey.json' in the root of this project.
//    - !! DO NOT COMMIT THIS FILE TO GIT !! Add it to your .gitignore.
// 3. Run the script: node seed.mjs

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

const animes = [
    {
      id: '1',
      title: 'Attack on Titan',
      description:
        'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
      coverImage: 'https://placehold.co/400x600/9D4EDD/FFFFFF',
      dataAiHint: 'anime action',
      genres: ['Action', 'Fantasy', 'Horror'],
      year: 2013,
      rating: 9.0,
    },
    {
      id: '2',
      title: 'Steins;Gate',
      description:
        'A group of friends have customized their microwave into a device that can send text messages to the past. As they perform different experiments, an organization named SERN who has been doing their own research on time travel tracks them down.',
      coverImage: 'https://placehold.co/400x600/560BAD/FFFFFF',
      dataAiHint: 'anime sci-fi',
      genres: ['Sci-Fi', 'Thriller'],
      year: 2011,
      rating: 9.1,
    },
    {
      id: '3',
      title: 'Jujutsu Kaisen',
      description:
        "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
      coverImage: 'https://placehold.co/400x600/9d4edd/ffffff',
      dataAiHint: 'anime supernatural',
      genres: ['Action', 'Supernatural'],
      year: 2020,
      rating: 8.7,
    },
    {
      id: '4',
      title: 'Fullmetal Alchemist: Brotherhood',
      description:
        'Two brothers search for a Philosopher\'s Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.',
      coverImage: 'https://placehold.co/400x600/560bad/ffffff',
      dataAiHint: 'anime adventure',
      genres: ['Action', 'Adventure', 'Fantasy'],
      year: 2009,
      rating: 9.2,
    },
    {
      id: '5',
      title: 'Your Lie in April',
      description:
        'A piano prodigy who lost his ability to play after suffering a traumatic event in his childhood is forced back into the spotlight by an eccentric girl with a secret of her own.',
      coverImage: 'https://placehold.co/400x600/9d4edd/ffffff',
      dataAiHint: 'anime drama',
      genres: ['Drama', 'Music', 'Romance'],
      year: 2014,
      rating: 8.6,
    },
    {
      id: '6',
      title: 'K-On!',
      description:
        'A group of high school girls form a light music club to save it from being disbanded. However, they are the only members of the club.',
      coverImage: 'https://placehold.co/400x600/560bad/ffffff',
      dataAiHint: 'anime slice life',
      genres: ['Slice of Life', 'Comedy', 'Music'],
      year: 2009,
      rating: 7.8,
    },
    {
      id: '7',
      title: 'Cowboy Bebop',
      description:
        'The futuristic misadventures and tragedies of an easygoing bounty hunter and his partners.',
      coverImage: 'https://placehold.co/400x600/9d4edd/ffffff',
      dataAiHint: 'anime space',
      genres: ['Action', 'Adventure', 'Sci-Fi'],
      year: 1998,
      rating: 8.9,
    },
    {
      id: '8',
      title: 'Demon Slayer: Kimetsu no Yaiba',
      description:
        "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
      coverImage: 'https://placehold.co/400x600/560bad/ffffff',
      dataAiHint: 'anime fantasy',
      genres: ['Action', 'Fantasy'],
      year: 2019,
      rating: 8.7,
    },
    {
      id: '9',
      title: 'My Hero Academia',
      description:
        'A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy and learn what it really means to be a hero.',
      coverImage: 'https://placehold.co/400x600/9d4edd/ffffff',
      dataAiHint: 'anime superhero',
      genres: ['Action', 'Comedy', 'Adventure'],
      year: 2016,
      rating: 8.4,
    },
    {
      id: '10',
      title: 'Violet Evergarden',
      description:
        'In the aftermath of a great war, Violet Evergarden, a young ex-soldier, gets a job at a writers\' agency and goes on journeys to discover herself and write letters that can connect people.',
      coverImage: 'https://placehold.co/400x600/560bad/ffffff',
      dataAiHint: 'anime emotional',
      genres: ['Drama', 'Fantasy', 'Slice of Life'],
      year: 2018,
      rating: 8.6,
    },
     {
      id: '11',
      title: 'Naruto',
      description:
        'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village\'s leader and strongest ninja.',
      coverImage: 'https://placehold.co/400x600/9d4edd/ffffff',
      dataAiHint: 'anime ninja',
      genres: ['Action', 'Adventure', 'Fantasy'],
      year: 2002,
      rating: 8.4,
    },
     {
      id: '12',
      title: 'One Piece',
      description:
        'Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger. The famous mystery treasure named "One Piece".',
      coverImage: 'https://placehold.co/400x600/560bad/ffffff',
      dataAiHint: 'anime pirate',
      genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
      year: 1999,
      rating: 8.9,
    },
];

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seedDatabase() {
  const animesCollection = db.collection('animes');
  console.log('Starting to seed animes...');

  const batch = db.batch();

  for (const anime of animes) {
    const { id, ...animeData } = anime;
    const docRef = animesCollection.doc(id);
    batch.set(docRef, animeData);
  }

  await batch.commit();
  console.log(`Seeded ${animes.length} animes successfully.`);
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
});
