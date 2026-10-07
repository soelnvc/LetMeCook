const bcrypt = require('bcryptjs');
const User = require('../models/User');

const PEERS = [
  {
    username: 'alex_cooks',
    name: 'Alex Rivera',
    email: 'alex_cooks@campus.iitm.ac.in',
    mobile: '+919876500001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Morning runners club organizer & campus sprint coordinator. #Sport #Running #Fitness',
    interests: ['Sport', 'Running', 'Fitness', 'Coffee'],
    age: 20
  },
  {
    username: 'priyap',
    name: 'Priya Patel',
    email: 'priyap@campus.iitm.ac.in',
    mobile: '+919876500002',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Badminton enthusiast & campus foodie. Host of weekend morning rally sessions! #Badminton #Fitness #Campus',
    interests: ['Badminton', 'Fitness', 'Campus', 'Music'],
    age: 20
  },
  {
    username: 'arjun',
    name: 'Arjun Sharma',
    email: 'arjun@campus.iitm.ac.in',
    mobile: '+919876500003',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Badminton enthusiast & mechanical engineering student. Always up for sports runs, late night study sessions, and weekend sprints! #Badminton #Gym #Sports #Coding',
    interests: ['Badminton', 'Gym', 'Sports', 'Robotics', 'Coffee'],
    age: 20
  },
  {
    username: 'meera',
    name: 'Meera Patel',
    email: 'meera@campus.iitm.ac.in',
    mobile: '+919876500004',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Algorithms research & competitive programming sprints in Central Library. Coffee addict & chess player. #DSA #Study #Chess #Coffee',
    interests: ['DSA', 'Study', 'Chess', 'Coffee', 'AI'],
    age: 21
  },
  {
    username: 'kabir',
    name: 'Kabir Roy',
    email: 'kabir@campus.iitm.ac.in',
    mobile: '+919876500005',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2029' },
    bio: 'Campus coffee lover & casual weekend gamer. Exploring machine learning and electric mobility. #Gaming #Coffee #Tech #Music',
    interests: ['Gaming', 'Coffee', 'Music', 'Tech', 'Anime'],
    age: 19
  },
  {
    username: 'rohans',
    name: 'Rohan Sen',
    email: 'rohans@campus.iitm.ac.in',
    mobile: '+919876500006',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Competitive coding sprinter & late-night library study group host. #Study #DSA #Tech',
    interests: ['Study', 'DSA', 'Tech', 'Gaming'],
    age: 20
  },
  {
    username: 'ananya_v',
    name: 'Ananya Verma',
    email: 'ananya_v@campus.iitm.ac.in',
    mobile: '+919876500007',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Evening walk coordinator & badminton doubles player. Host of weekly campus tea meets! #Badminton #ChitChat #Campus',
    interests: ['Badminton', 'ChitChat', 'Campus', 'Music'],
    age: 20
  },
  {
    username: 'vikram_s',
    name: 'Vikram Seth',
    email: 'vikram_s@campus.iitm.ac.in',
    mobile: '+919876500008',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Super Smash Bros & FIFA lounge coordinator. Weekend hackathons and gym workouts. #Gaming #Gym #Coding',
    interests: ['Gaming', 'Gym', 'Coding', 'Sports'],
    age: 21
  },
  {
    username: 'mayachef',
    name: 'Maya Lin',
    email: 'mayachef@campus.iitm.ac.in',
    mobile: '+919876500009',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Distributed systems & architecture sprints in campus library. Coffee & chess. #Study #Tech #Chess',
    interests: ['Study', 'Tech', 'Chess', 'Coffee'],
    age: 21
  },
  {
    username: 'amans',
    name: 'Aman Sharma',
    email: 'amans@campus.iitm.ac.in',
    mobile: '+919876500010',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    pronouns: 'They/Them',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: "Campus peer active in live dish cooking, study sprints, and sports sessions. Let's cook! #Badminton #Study #Campus",
    interests: ['Campus', 'DSA', 'Study', 'Badminton'],
    age: 20
  }
];

const seedPeers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('CampusPeer@123', salt);

    for (const peer of PEERS) {
      await User.findOneAndUpdate(
        { username: peer.username.toLowerCase() },
        {
          $setOnInsert: {
            username: peer.username.toLowerCase(),
            email: peer.email.toLowerCase(),
            mobile: peer.mobile,
            passwordHash,
            emailVerified: true,
            mobileVerified: true,
            age: peer.age
          },
          $set: {
            name: peer.name,
            avatar: peer.avatar,
            pronouns: peer.pronouns,
            institute: peer.institute,
            bio: peer.bio,
            interests: peer.interests
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[Seed] Campus peer profiles verified and seeded in MongoDB.');
  } catch (error) {
    console.error('[Seed] Error seeding campus peers:', error.message);
  }
};

module.exports = seedPeers;
