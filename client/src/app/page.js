'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import KitchenModal from '@/components/kitchen/KitchenModal';
import Sidebar from '@/components/layout/Sidebar';
import DishCard from '@/components/dish/DishCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AwardsLibrary from '@/components/profile/AwardsLibrary';
import ConversationList from '@/components/messaging/ConversationList';
import MessageArea from '@/components/messaging/MessageArea';
import HomeDashboard from '@/components/home/HomeDashboard';
import DineInFeed from '@/components/dinein/DineInFeed';
import GlobalPage from '@/components/global/GlobalPage';
import SettingsPage from '@/components/settings/SettingsPage';
import { dishService } from '@/services/dish.service';
import { authService } from '@/services/auth.service';
import {
  loadLocalConversations,
  saveLocalConversations,
  loadLocalMessagesMap,
  saveLocalMessagesMap,
  loadActiveConvId,
  saveActiveConvId,
  loadMessagesTab,
  saveMessagesTab
} from '@/lib/messageStorage';

const DEMO_PEER_PROFILES = {
  arjun: {
    _id: 'demo-user-arjun',
    name: 'Arjun Sharma',
    username: 'arjun',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Badminton enthusiast & mechanical engineering student. Always up for sports runs, late night study sessions, and weekend sprints! #Badminton #Gym #Sports #Coding',
    interests: ['Badminton', 'Gym', 'Sports', 'Robotics', 'Coffee'],
    stats: { dishesCreated: 14, dishesJoined: 18, connections: 84 }
  },
  meera: {
    _id: 'demo-user-meera',
    name: 'Meera Patel',
    username: 'meera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Algorithms research & competitive programming sprints in Central Library. Coffee addict & chess player. #DSA #Study #Chess #Coffee',
    interests: ['DSA', 'Study', 'Chess', 'Coffee', 'AI'],
    stats: { dishesCreated: 22, dishesJoined: 31, connections: 112 }
  },
  kabir: {
    _id: 'demo-user-kabir',
    name: 'Kabir Roy',
    username: 'kabir',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2029' },
    bio: 'Campus coffee lover & casual weekend gamer. Exploring machine learning and electric mobility. #Gaming #Coffee #Tech #Music',
    interests: ['Gaming', 'Coffee', 'Music', 'Tech', 'Anime'],
    stats: { dishesCreated: 9, dishesJoined: 15, connections: 56 }
  },
  rohans: {
    _id: 'demo-user-rohan',
    name: 'Rohan Sen',
    username: 'rohans',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Competitive coding sprinter & late-night library study group host. #Study #DSA #Tech',
    interests: ['Study', 'DSA', 'Tech', 'Gaming'],
    stats: { dishesCreated: 8, dishesJoined: 12, connections: 45 }
  },
  ananya_v: {
    _id: 'demo-user-ananya',
    name: 'Ananya Verma',
    username: 'ananya_v',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Evening walk coordinator & badminton doubles player. Host of weekly campus tea meets! #Badminton #ChitChat #Campus',
    interests: ['Badminton', 'ChitChat', 'Campus', 'Music'],
    stats: { dishesCreated: 19, dishesJoined: 24, connections: 98 }
  },
  vikram_s: {
    _id: 'demo-user-vikram',
    name: 'Vikram Seth',
    username: 'vikram_s',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Super Smash Bros & FIFA lounge coordinator. Weekend hackathons and gym workouts. #Gaming #Gym #Coding',
    interests: ['Gaming', 'Gym', 'Coding', 'Sports'],
    stats: { dishesCreated: 16, dishesJoined: 20, connections: 67 }
  },
  alex_cooks: {
    _id: 'demo-user-alex',
    name: 'Alex Rivera',
    username: 'alex_cooks',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Morning runners club organizer & campus sprint coordinator. #Sport #Running #Fitness',
    interests: ['Sport', 'Running', 'Fitness', 'Coffee'],
    stats: { dishesCreated: 11, dishesJoined: 14, connections: 62 }
  },
  mayachef: {
    _id: 'demo-user-maya',
    name: 'Maya Lin',
    username: 'mayachef',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Distributed systems & architecture sprints in campus library. Coffee & chess. #Study #Tech #Chess',
    interests: ['Study', 'Tech', 'Chess', 'Coffee'],
    stats: { dishesCreated: 15, dishesJoined: 26, connections: 89 }
  },
  priyabakes: {
    _id: 'demo-user-priya',
    name: 'Priya Patel',
    username: 'priyabakes',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Badminton doubles player & late evening tea circle host. #Badminton #Campus #Tea',
    interests: ['Badminton', 'Campus', 'Tea', 'Music'],
    stats: { dishesCreated: 13, dishesJoined: 19, connections: 77 }
  },
  amans: {
    _id: 'demo-user-amans',
    name: 'Aman Sharma',
    username: 'amans',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    pronouns: 'They/Them',
    institute: { name: 'IIT MADRAS', year: '2028' },
    bio: "Campus peer active in live dish cooking, study sprints, and sports sessions. Let's cook! #Badminton #Study #Campus",
    interests: ['Campus', 'DSA', 'Study', 'Badminton'],
    stats: { dishesCreated: 17, dishesJoined: 19, connections: 84 },
    dishes: {
      active: {
        _id: 'dish-amans-active',
        description: 'Badminton doubles friendly rally & drills session at SAC indoor sports courts. Looking for 1 partner to join!',
        category: 'sport',
        status: 'cooking',
        joinMode: 'auto',
        capacity: { max: 4 },
        participants: [{ user: { name: 'Aman Sharma', username: 'amans' } }, { user: { name: 'Alex Rivera', username: 'alex_cooks' } }, { user: { name: 'Priya Patel', username: 'priyap' } }],
        timing: { cookStart: 'Today at 6:30 PM' },
        creator: { name: 'Aman Sharma', username: 'amans', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' }
      },
      previous: [
        {
          _id: 'dish-amans-prev-1',
          description: 'Late night competitive programming sprint: Graph algorithms & DP problem solving in Central Library.',
          category: 'study',
          status: 'cooked',
          capacity: { max: 4 },
          participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
        },
        {
          _id: 'dish-amans-prev-2',
          description: 'Early morning 5km jog around campus stadium track followed by fresh fruit juice at the cafe.',
          category: 'sport',
          status: 'cooked',
          capacity: { max: 5 },
          participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }]
        },
        {
          _id: 'dish-amans-prev-3',
          description: 'Campus tea meet & casual discussion on machine learning project ideas near Himalaya Mess.',
          category: 'social',
          status: 'cooked',
          capacity: { max: 3 },
          participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
        }
      ],
      activeJoined: {
        _id: 'dish-amans-joined-active',
        description: 'DSA Trees & Graphs mock interview sprint in Library Study Room 4. Hosted by Rohan Sen.',
        category: 'study',
        creator: { name: 'Rohan Sen', username: 'rohans' },
        status: 'cooking',
        joinMode: 'auto',
        capacity: { max: 4 },
        participants: [{ user: { name: 'Rohan Sen', username: 'rohans' } }, { user: { name: 'Aman Sharma', username: 'amans' } }],
        timing: { cookStart: 'Tomorrow at 4:00 PM' }
      },
      previousJoined: [
        {
          _id: 'dish-amans-joined-prev-1',
          description: 'Weekend FIFA & Mario Kart gaming tournament in student center common room.',
          category: 'gaming',
          creator: { name: 'Vikram Seth', username: 'vikram_s' },
          status: 'cooked',
          capacity: { max: 6 },
          participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }, { user: '6' }]
        },
        {
          _id: 'dish-amans-joined-prev-2',
          description: 'Casual badminton mixed doubles rally at the campus indoor arena.',
          category: 'sport',
          creator: { name: 'Priya Patel', username: 'priyabakes' },
          status: 'cooked',
          capacity: { max: 4 },
          participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
        },
        {
          _id: 'dish-amans-joined-prev-3',
          description: 'Sunset campus photography walk through deer park and lake trail.',
          category: 'creative',
          creator: { name: 'Ananya Verma', username: 'ananya_v' },
          status: 'cooked',
          capacity: { max: 5 },
          participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }]
        }
      ]
    }
  },
  priyap: {
    _id: 'demo-user-priyap',
    name: 'Priya Patel',
    username: 'priyap',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Badminton enthusiast & campus foodie. Host of weekend morning rally sessions! #Badminton #Fitness #Campus',
    interests: ['Badminton', 'Fitness', 'Campus', 'Music'],
    stats: { dishesCreated: 13, dishesJoined: 21, connections: 79 }
  },
  rohanv: {
    _id: 'demo-user-rohanv',
    name: 'Rohan Verma',
    username: 'rohanv',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Full stack builder & late-night code sprint organizer. Coffee & systems programming. #Tech #DSA #Coffee',
    interests: ['Tech', 'DSA', 'Coffee', 'Gaming'],
    stats: { dishesCreated: 15, dishesJoined: 18, connections: 68 }
  },
  vikramj: {
    _id: 'demo-user-vikramj',
    name: 'Vikram Joshi',
    username: 'vikramj',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: "Competitive coding sprinter & chess lover. Let's conquer algorithms together! #Study #DSA #Chess",
    interests: ['Study', 'DSA', 'Chess', 'Tech'],
    stats: { dishesCreated: 11, dishesJoined: 16, connections: 64 }
  },
  ananyar: {
    _id: 'demo-user-ananyar',
    name: 'Ananya Roy',
    username: 'ananyar',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    pronouns: 'She/Her',
    institute: { name: 'IIT Madras', year: '2028' },
    bio: 'Badminton doubles player & weekend running enthusiast. #Badminton #Running #Campus',
    interests: ['Badminton', 'Running', 'Campus', 'Music'],
    stats: { dishesCreated: 14, dishesJoined: 22, connections: 88 }
  },
  karthikr: {
    _id: 'demo-user-karthikr',
    name: 'Karthik Ram',
    username: 'karthikr',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2027' },
    bio: 'Robotics lab explorer and casual gamer. #Robotics #Gaming #AI',
    interests: ['Robotics', 'Gaming', 'AI', 'Coffee'],
    stats: { dishesCreated: 12, dishesJoined: 15, connections: 59 }
  },
  devs: {
    _id: 'demo-user-devs',
    name: 'Dev Sharma',
    username: 'devs',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    pronouns: 'He/Him',
    institute: { name: 'IIT Madras', year: '2029' },
    bio: 'Late evening football & gym sessions. Coffee lover. #Football #Gym #Coffee',
    interests: ['Football', 'Gym', 'Coffee', 'Sports'],
    stats: { dishesCreated: 10, dishesJoined: 14, connections: 52 }
  }
};

const getTabLabel = (tab) => {
  switch (tab) {
    case 'home':
      return 'Home';
    case 'dine_in':
    case 'dine-in':
      return 'Dine-In';
    case 'global':
      return 'Global';
    case 'messages':
      return 'Messages';
    case 'settings':
      return 'Settings';
    case 'profile':
      return 'My Profile';
    default:
      return 'Feed';
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Navigation strictly per Section 12 of PRODUCT.md: Home, Dine-in, Kitchen, Messages, Profile
  const [activeTab, setActiveTab] = useState('home'); 
  const [viewingProfileUser, setViewingProfileUser] = useState(null); 
  const [profilePreviousTab, setProfilePreviousTab] = useState('home'); 
  const [profileHistory, setProfileHistory] = useState([]);
  const [convMessagesMap, setConvMessagesMap] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [registerAge, setRegisterAge] = useState('');

  // Dine-in states
  const [dishes, setDishes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dineInTab, setDineInTab] = useState('join_to_cook'); // 'join_to_cook', 'cooking', 'global', 'my_dishes'
  const [expandedDishes, setExpandedDishes] = useState({});
  const [navHovered, setNavHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [themePreference, setThemePreference] = useState('light');

  // Kitchen states
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);

  // Messages states
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const selectedConvIdRef = useRef(null);
  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
  }, [selectedConvId]);
  const [convMessages, setConvMessages] = useState([]);
  const [msgReceiverId, setMsgReceiverId] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [messagesTab, setMessagesTab] = useState('message'); // 'message' | 'requests'
  const [searchMsgQuery, setSearchMsgQuery] = useState('');

  // Hydrate persistent messaging cache on client mount (Instagram/WhatsApp style persistence)
  useEffect(() => {
    const cachedConvs = loadLocalConversations();
    const cachedMap = loadLocalMessagesMap();
    const cachedActiveId = loadActiveConvId();
    const cachedTab = loadMessagesTab();

    if (cachedConvs && cachedConvs.length > 0) {
      setConversations(cachedConvs);
    }
    if (cachedMap && Object.keys(cachedMap).length > 0) {
      setConvMessagesMap(cachedMap);
    }
    if (cachedActiveId) {
      setSelectedConvId(cachedActiveId);
      selectedConvIdRef.current = cachedActiveId;
      if (cachedMap && cachedMap[cachedActiveId]) {
        setConvMessages(cachedMap[cachedActiveId]);
      }
    }
    if (cachedTab) {
      setMessagesTab(cachedTab);
    }
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      saveLocalConversations(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    if (convMessagesMap && Object.keys(convMessagesMap).length > 0) {
      saveLocalMessagesMap(convMessagesMap);
    }
  }, [convMessagesMap]);

  useEffect(() => {
    if (selectedConvId) {
      saveActiveConvId(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    if (messagesTab) {
      saveMessagesTab(messagesTab);
    }
  }, [messagesTab]);

  // Profile & Settings states
  const [bio, setBio] = useState('');
  const [instituteName, setInstituteName] = useState('IIT MADRAS');
  const [instituteYear, setInstituteYear] = useState('2029');
  const [secondaryInstituteName, setSecondaryInstituteName] = useState('SST');
  const [secondaryInstituteYear, setSecondaryInstituteYear] = useState('2029');
  const [profileName, setProfileName] = useState('');
  const [pronouns, setPronouns] = useState('He/Him');
  const [interests, setInterests] = useState(['music', 'Gym', 'Sports', 'Anime', 'Coffee']);
  const [newTagInput, setNewTagInput] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editAvatar, setEditAvatar] = useState('');
  const [profileActiveTab, setProfileActiveTab] = useState('dishes'); // 'dishes' | 'joined' | 'awards'
  const [searchUsername, setSearchUsername] = useState('');
  const [searchedProfile, setSearchedProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);

  // Privacy Settings form states
  const [bioVisibility, setBioVisibility] = useState('everyone');
  const [instituteVisibility, setInstituteVisibility] = useState('institute');
  const [avatarVisibility, setAvatarVisibility] = useState('everyone');
  const [invitePermission, setInvitePermission] = useState('everyone');
  const [messagePermission, setMessagePermission] = useState('everyone');
  const [globalDiscovery, setGlobalDiscovery] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState(true);

  // Check auth session
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/auth/me');
      setUser(res.data);
      setProfileName(res.data.name || '');
      setPronouns(res.data.pronouns || 'He/Him');
      setBio(res.data.bio || '');
      setEditAvatar(res.data.avatar || '');
      setInstituteName(res.data.institute?.name || 'IIT MADRAS');
      setInstituteYear(res.data.institute?.year ? String(res.data.institute.year) : '2029');
      setSecondaryInstituteName(res.data.secondaryInstitute?.name || 'SST');
      setSecondaryInstituteYear(res.data.secondaryInstitute?.year ? String(res.data.secondaryInstitute.year) : '2029');
      if (res.data.interests && res.data.interests.length > 0) {
        setInterests(res.data.interests);
      } else {
        setInterests(['music', 'Gym', 'Sports', 'Anime', 'Coffee']);
      }
      if (res.data.privacy) {
        setBioVisibility(res.data.privacy.bioVisibility || 'everyone');
        setInstituteVisibility(res.data.privacy.instituteVisibility || 'institute');
        setAvatarVisibility(res.data.privacy.avatarVisibility || 'everyone');
        setInvitePermission(res.data.privacy.invitePermission || 'everyone');
        setMessagePermission(res.data.privacy.messagePermission || 'everyone');
        setGlobalDiscovery(res.data.privacy.globalDiscovery ?? true);
        setActivityVisibility(res.data.privacy.activityVisibility ?? true);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchDishes = async () => {
    try {
      const res = await dishService.getDishes({ category: categoryFilter, status: 'all' });
      setDishes(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}hrs ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mon ago`;
  };

  const fetchConversations = async (forceConvId) => {
    try {
      const res = await apiFetch('/messages/conversations');
      let data = res.data || [];
      if (data.length === 0) {
        data = [
          {
            conversationId: 'demo-conv-1',
            user: {
              _id: 'demo-user-arjun',
              name: 'Arjun Sharma',
              username: 'arjun',
              avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' },
              bio: 'Badminton enthusiast & mechanical engineering student. Always up for sports runs!'
            },
            lastMessage: { content: 'See you at the indoor courts at 5 PM!', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            unreadCount: 1,
            isRequest: false
          },
          {
            conversationId: 'demo-conv-2',
            user: {
              _id: 'demo-user-meera',
              name: 'Meera Patel',
              username: 'meera',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' },
              bio: 'Algorithms research & competitive programming sprints in Central Library.'
            },
            lastMessage: { content: 'Shared the DSA graph traversal notes in study room 4.', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            unreadCount: 0,
            isRequest: false
          },
          {
            conversationId: 'demo-conv-3',
            user: {
              _id: 'demo-user-kabir',
              name: 'Kabir Roy',
              username: 'kabir',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' },
              bio: 'Campus coffee lover & casual weekend gamer.'
            },
            lastMessage: { content: 'Wanna join the cold brew table at Campus Square?', createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
            unreadCount: 0,
            isRequest: false
          },
          {
            conversationId: 'demo-req-1',
            user: {
              _id: 'demo-user-alex',
              name: 'Alex Rivera',
              username: 'alex_cooks',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' },
              bio: 'Morning runners club organizer & campus sprint coordinator.'
            },
            lastMessage: { content: 'Hey! Are you down for the morning 5k track run tomorrow?', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            unreadCount: 1,
            isRequest: true,
            requestStatus: 'pending',
            requestSender: 'alex_cooks'
          }
        ];
      }
      setConversations((prev) => {
        const local = loadLocalConversations();
        const mergedMap = new Map();

        // 1. Add incoming server data
        for (const item of data) {
          mergedMap.set(String(item.conversationId), item);
        }

        // 2. Overlay locally cached conversations (persisting newly created threads)
        const localPool = [...local, ...prev];
        for (const item of localPool) {
          const key = String(item.conversationId);
          if (!mergedMap.has(key)) {
            mergedMap.set(key, item);
          } else {
            const existing = mergedMap.get(key);
            mergedMap.set(key, {
              ...existing,
              ...item,
              user: item.user || existing.user
            });
          }
        }

        const mergedList = Array.from(mergedMap.values());
        saveLocalConversations(mergedList);
        return mergedList;
      });

      const targetId = forceConvId || selectedConvIdRef.current || selectedConvId || loadActiveConvId();
      if (targetId) {
        selectedConvIdRef.current = targetId;
        setSelectedConvId(targetId);
      } else if (data.length > 0) {
        const first = data.find(c => !c.isRequest) || data[0];
        if (first) {
          handleOpenConversation(first.conversationId);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await apiFetch('/connections');
      let data = res.data || [];
      if (data.length === 0) {
        data = [
          {
            _id: 'conn-1',
            user: {
              _id: 'demo-conn-arjun',
              name: 'Arjun Sharma',
              username: 'arjun',
              avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' }
            }
          },
          {
            _id: 'conn-2',
            user: {
              _id: 'demo-conn-meera',
              name: 'Meera Patel',
              username: 'meera',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' }
            }
          },
          {
            _id: 'conn-3',
            user: {
              _id: 'demo-conn-kabir',
              name: 'Kabir Roy',
              username: 'kabir',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              institute: { name: 'IIT Madras' }
            }
          }
        ];
      }
      setConnections(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'home' || activeTab === 'dine-in' || activeTab === 'global') fetchDishes();
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'profile') {
      fetchConnections();
      fetchDishes();
    }
  }, [user, activeTab, categoryFilter]);

  // Age restriction check: Only 18+ users can access Global features and tickets
  const isAdult = Boolean(user && user.age !== undefined && user.age !== null && Number(user.age) >= 18);

  // Guard: If an underaged user attempts to access the Global tab, redirect them to Home
  useEffect(() => {
    if (user && !isAdult && activeTab === 'global') {
      setActiveTab('home');
    }
  }, [user, isAdult, activeTab]);

  // Filter global tickets for underage users across the app
  const visibleDishes = useMemo(() => {
    if (isAdult) return dishes;
    return dishes.filter((d) => d.visibility !== 'global' && d.location?.scope !== 'nearby');
  }, [dishes, isAdult]);

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    setError('');
    setMessage('');
    setIsAuthSubmitting(true);
    try {
      let res;
      if (isLogin) {
        res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password })
        });
      } else {
        if (!registerAge || isNaN(Number(registerAge))) {
          throw new Error('Age is mandatory and must be entered during account creation');
        }
        res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            name,
            email,
            mobile,
            password,
            age: Number(registerAge)
          })
        });
      }
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setMessage('Authenticated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMessage('Logged out');
  };

  // Kitchen Create Dish (Sequential Flow)
  const handleCreateDish = async (payload) => {
    setError('');
    setMessage('');
    setIsSubmittingDish(true);
    try {
      const res = await dishService.createDish(payload);
      setMessage(`Dish published: ${res.data._id}`);
      setShowKitchenModal(false);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmittingDish(false);
    }
  };

  // Dish Operations
  const handleJoinDish = async (dishId) => {
    setError('');
    setMessage('');
    try {
      if (String(dishId).startsWith('dish-') || String(dishId).startsWith('demo-') || String(dishId).startsWith('active-')) {
        setMessage('Joined dish successfully!');
        return;
      }
      const res = await dishService.joinDish(dishId);
      setMessage(`Join status: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      if (String(dishId).startsWith('dish-') || String(dishId).startsWith('demo-')) {
        setMessage('Joined dish successfully!');
      } else {
        setError(err.message);
      }
    }
  };

  const handleLeaveDish = async (dishId) => {
    setError('');
    setMessage('');
    try {
      const res = await dishService.leaveDish(dishId);
      setMessage(res.data.message);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (dishId, status) => {
    setError('');
    setMessage('');
    try {
      const res = await dishService.updateStatus(dishId, status);
      setMessage(`Dish status: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveRequest = async (dishId, requestId) => {
    setError('');
    setMessage('');
    try {
      const res = await dishService.approveRequest(dishId, requestId);
      setMessage(`Approved join request: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectRequest = async (dishId, requestId) => {
    setError('');
    setMessage('');
    try {
      await dishService.rejectRequest(dishId, requestId);
      setMessage(`Rejected join request`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  // Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setError('');
    setMessage('');

    const activeConv = conversations.find((c) => c.conversationId === selectedConvId);
    const targetUser = activeConv?.user;
    const isPending = activeConv?.requestStatus === 'pending';
    const currentList = convMessagesMap[selectedConvId] || convMessages || [];
    const mySent = currentList.filter(
      (m) =>
        (m.sender?._id || m.sender?.username || m.sender) ===
        (user?._id || user?.username)
    );

    // Instagram Rule: If pending invitation, strictly allow only 1 message from sender
    if (isPending && mySent.length >= 1) {
      setMessage(`Wait till @${targetUser?.username || 'user'} accepts your message.`);
      return;
    }

    const optimisticMsg = {
      _id: `msg-${Date.now()}`,
      sender: user,
      content: msgContent.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [...currentList, optimisticMsg];
    setConvMessages(updated);
    setConvMessagesMap((prev) => {
      const nextMap = { ...prev, [selectedConvId]: updated };
      saveLocalMessagesMap(nextMap);
      return nextMap;
    });

    setConversations((prev) => {
      const nextList = prev.map((c) =>
        c.conversationId === selectedConvId
          ? {
              ...c,
              lastMessage: { content: msgContent.trim(), createdAt: new Date().toISOString() },
              updatedAt: new Date().toISOString()
            }
          : c
      );
      saveLocalConversations(nextList);
      return nextList;
    });

    const sentText = msgContent.trim();
    setMsgContent('');

    // Persist to backend MongoDB
    const targetReceiver = targetUser?._id || targetUser?.username || msgReceiverId;
    if (targetReceiver) {
      try {
        await apiFetch('/messages', {
          method: 'POST',
          body: JSON.stringify({ receiverId: targetReceiver, content: sentText })
        });
      } catch (err) {
        console.warn('Backend message sync error (persisted locally):', err.message);
      }
    }
  };

  const handleOpenConversation = async (convId) => {
    selectedConvIdRef.current = convId;
    setSelectedConvId(convId);
    saveActiveConvId(convId);

    if (convMessagesMap[convId] && convMessagesMap[convId].length > 0) {
      setConvMessages(convMessagesMap[convId]);
      return;
    }

    const cachedMap = loadLocalMessagesMap();
    if (cachedMap[convId] && cachedMap[convId].length > 0) {
      setConvMessages(cachedMap[convId]);
      setConvMessagesMap((prev) => ({ ...prev, [convId]: cachedMap[convId] }));
      return;
    }

    if (String(convId).startsWith('conv-')) {
      setConvMessages([]);
      return;
    }

    if (String(convId).startsWith('demo-req-')) {
      const conv = conversations.find((c) => c.conversationId === convId);
      const reqMessages = [
        {
          _id: `${convId}-m1`,
          sender: conv?.user,
          content: conv?.lastMessage?.content || 'Hey! Are you down for the morning 5k track run tomorrow?',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        }
      ];
      setConvMessages(reqMessages);
      setConvMessagesMap((prev) => {
        const next = { ...prev, [convId]: reqMessages };
        saveLocalMessagesMap(next);
        return next;
      });
      return;
    }

    if (String(convId).startsWith('demo-')) {
      const conv = conversations.find((c) => c.conversationId === convId);
      const demoUser = conv?.user || {
        name: 'Arjun Sharma',
        username: 'arjun',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
      };
      const initialDemo = [
        {
          _id: `${convId}-m1`,
          sender: demoUser,
          content: conv?.lastMessage?.content || 'Hey! Ready for the session?',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          _id: `${convId}-m2`,
          sender: user,
          content: 'Sounds great! I will be there on time.',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        }
      ];
      setConvMessages(initialDemo);
      setConvMessagesMap((prev) => {
        const next = { ...prev, [convId]: initialDemo };
        saveLocalMessagesMap(next);
        return next;
      });
      return;
    }

    try {
      const res = await apiFetch(`/messages/conversations/${convId}`);
      if (res.data) {
        setConvMessages(res.data);
        setConvMessagesMap((prev) => {
          const next = { ...prev, [convId]: res.data };
          saveLocalMessagesMap(next);
          return next;
        });
      }
    } catch (err) {
      // Keep existing messages
    }
  };

  const handleRespondMessageRequest = async (convId, status) => {
    setError('');
    setMessage('');
    if (String(convId).startsWith('demo-') || String(convId).startsWith('conv-')) {
      if (status === 'accepted') {
        handleAcceptMessageRequest(convId);
      } else if (status === 'rejected') {
        handleRejectMessageRequest(convId);
      } else if (status === 'blocked') {
        const conv = conversations.find((c) => c.conversationId === convId);
        handleBlockMessageRequest(convId, conv?.user?.username);
      }
      return;
    }
    try {
      const res = await apiFetch(`/messages/requests/${convId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      setMessage(`Request response: ${res.data.requestStatus}`);
      fetchConversations();
    } catch (err) {
      if (status === 'accepted') {
        handleAcceptMessageRequest(convId);
      } else {
        handleRejectMessageRequest(convId);
      }
    }
  };

  const handleAcceptMessageRequest = async (convId) => {
    setConversations((prev) => {
      const next = prev.map((c) =>
        c.conversationId === convId
          ? { ...c, isRequest: false, requestStatus: 'accepted' }
          : c
      );
      saveLocalConversations(next);
      return next;
    });
    const conv = conversations.find((c) => c.conversationId === convId);
    setMessage(`Accepted message request from @${conv?.user?.username || 'user'}. You can now chat freely!`);
    try {
      await apiFetch(`/messages/requests/${convId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ status: 'accepted' })
      });
    } catch {}
  };

  const handleRejectMessageRequest = async (convId) => {
    const conv = conversations.find((c) => c.conversationId === convId);
    setConversations((prev) => {
      const next = prev.filter((c) => c.conversationId !== convId);
      saveLocalConversations(next);
      return next;
    });
    setSelectedConvId(null);
    saveActiveConvId(null);
    setConvMessages([]);
    setMessage(`Declined message request from @${conv?.user?.username || 'user'}.`);
    try {
      await apiFetch(`/messages/requests/${convId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ status: 'rejected' })
      });
    } catch {}
  };

  const handleBlockMessageRequest = async (convId, targetUsername) => {
    if (targetUsername) {
      handleBlockUser(targetUsername);
    }
    setConversations((prev) => {
      const next = prev.filter((c) => c.conversationId !== convId);
      saveLocalConversations(next);
      return next;
    });
    setSelectedConvId(null);
    saveActiveConvId(null);
    setConvMessages([]);
    try {
      await apiFetch(`/messages/requests/${convId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ status: 'blocked' })
      });
    } catch {}
  };

  // Profile & Settings
  const handleUpdateUser = async (updatedFields) => {
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updatedFields)
      });
      setUser(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      if (updatedFields.avatar !== undefined) {
        setEditAvatar(res.data.avatar || '');
      }
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileName,
          pronouns,
          bio,
          interests,
          avatar: editAvatar || user?.avatar || null,
          institute: { name: instituteName, year: Number(instituteYear) || 2029 },
          secondaryInstitute: { name: secondaryInstituteName, year: Number(secondaryInstituteYear) || 2029 }
        })
      });
      setUser(res.data);
      setShowEditProfile(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNavigateToProfile = (targetUser, fromTab) => {
    if (!targetUser) return;
    const targetId = targetUser._id ? String(targetUser._id) : null;
    const targetUsername = targetUser.username ? String(targetUser.username).toLowerCase() : null;
    const myId = user?._id ? String(user._id) : null;
    const myUsername = user?.username ? String(user.username).toLowerCase() : null;

    const isOwn = (targetId && myId && targetId === myId) || (targetUsername && myUsername && targetUsername === myUsername);

    const origin = fromTab || (activeTab === 'profile' ? profilePreviousTab : activeTab) || 'home';
    setProfilePreviousTab(origin);

    if (isOwn) {
      setViewingProfileUser(null);
      setProfileHistory([]);
    } else {
      if (viewingProfileUser && viewingProfileUser.username && viewingProfileUser.username.toLowerCase() !== targetUsername) {
        setProfileHistory((prev) => [...prev, viewingProfileUser]);
      }
      const key = targetUsername ? Object.keys(DEMO_PEER_PROFILES).find(k => k.toLowerCase() === targetUsername) : null;
      const demoEnriched = key ? { ...DEMO_PEER_PROFILES[key], ...targetUser } : targetUser;
      setViewingProfileUser(demoEnriched);

      if (targetUsername) {
        apiFetch(`/users/${targetUsername}`)
          .then((res) => {
            if (res.data) {
              setViewingProfileUser((prev) => (prev ? { ...prev, ...res.data } : res.data));
            }
          })
          .catch(() => {});
      }
    }
    setProfileActiveTab('dishes');
    setActiveTab('profile');
  };

  const handleBackFromProfile = () => {
    if (profileHistory.length > 0) {
      const prevPeer = profileHistory[profileHistory.length - 1];
      setProfileHistory((prev) => prev.slice(0, -1));
      setViewingProfileUser(prevPeer);
      setProfileActiveTab('dishes');
      return;
    }
    const returnTab = profilePreviousTab || 'home';
    setViewingProfileUser(null);
    setProfileHistory([]);
    setActiveTab(returnTab);
  };

  const handleMessageFromProfile = (targetUser) => {
    if (!targetUser) return;
    const existing = conversations.find(
      (c) =>
        (c.user?._id && targetUser._id && String(c.user._id) === String(targetUser._id)) ||
        (c.user?.username && targetUser.username && c.user.username.toLowerCase() === targetUser.username.toLowerCase())
    );
    setViewingProfileUser(null);
    setProfileHistory([]);

    if (existing) {
      selectedConvIdRef.current = existing.conversationId;
      setSelectedConvId(existing.conversationId);
      saveActiveConvId(existing.conversationId);
      const tab = existing.isRequest ? 'requests' : 'message';
      setMessagesTab(tab);
      saveMessagesTab(tab);
      handleOpenConversation(existing.conversationId);
    } else {
      const uname = targetUser.username || targetUser.name?.replace(/\s+/g, '_').toLowerCase() || 'user';
      const newConvId = `conv-${uname}`;
      const newConv = {
        conversationId: newConvId,
        user: targetUser,
        lastMessage: { content: 'No messages yet', createdAt: new Date().toISOString() },
        unreadCount: 0,
        isRequest: false,
        requestStatus: 'pending',
        requestSender: user?.username || 'soelnvc'
      };
      selectedConvIdRef.current = newConvId;
      saveActiveConvId(newConvId);
      setConversations((prev) => {
        const next = [newConv, ...prev.filter(c => c.conversationId !== newConvId)];
        saveLocalConversations(next);
        return next;
      });
      setSelectedConvId(newConvId);
      setMessagesTab('message');
      saveMessagesTab('message');
      setConvMessages([]);
      setConvMessagesMap((prev) => {
        const next = { ...prev, [newConvId]: [] };
        saveLocalMessagesMap(next);
        return next;
      });
    }
    setActiveTab('messages');
  };

  const handleToggleConnectPeer = async (targetUser) => {
    const targetId = targetUser._id || targetUser.id;
    const isConn = connections.some(c => {
      const u = c.user || c;
      return (u._id && targetId && String(u._id) === String(targetId)) ||
             (u.username && targetUser.username && u.username.toLowerCase() === targetUser.username.toLowerCase());
    });

    if (isConn) {
      setConnections(prev => prev.filter(c => {
        const u = c.user || c;
        return !(
          (u._id && targetId && String(u._id) === String(targetId)) ||
          (u.username && targetUser.username && u.username.toLowerCase() === targetUser.username.toLowerCase())
        );
      }));
      setMessage(`Disconnected from @${targetUser.username || 'user'}`);
    } else {
      const newConn = {
        _id: `conn-${Date.now()}`,
        user: targetUser
      };
      setConnections(prev => [newConn, ...prev]);
      setMessage(`Connected with @${targetUser.username || 'user'}`);
    }
  };

  const handleBlockUser = async (targetUsername) => {
    try {
      await apiFetch('/users/me/block', {
        method: 'POST',
        body: JSON.stringify({ username: targetUsername })
      });
      setMessage(`@${targetUsername} has been blocked.`);
    } catch (err) {
      setMessage(`@${targetUsername} has been blocked.`);
    }
    handleBackFromProfile();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          privacy: {
            bioVisibility,
            instituteVisibility,
            avatarVisibility,
            invitePermission,
            messagePermission,
            globalDiscovery,
            activityVisibility
          }
        })
      });
      setUser(res.data);
      setMessage('Privacy settings saved');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSearchedProfile(null);
    try {
      const res = await apiFetch(`/users/${searchUsername}`);
      setSearchedProfile(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 20, fontFamily: "'Inter', sans-serif" }}>Checking session...</div>;
  }

  // Unauthenticated View
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#e6dfe4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
        <GlassContainer radius={28} style={{ width: '100%', maxWidth: 460 }} innerStyle={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 22, fontWeight: 700 }}>LetMeCook — Auth Test</h2>
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              style={{ fontWeight: isLogin ? 'bold' : 'normal', marginRight: 8, padding: '4px 8px', cursor: 'pointer' }}
            >
              [Sign In]
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              style={{ fontWeight: !isLogin ? 'bold' : 'normal', padding: '4px 8px', cursor: 'pointer' }}
            >
              [Register]
            </button>
          </div>

          {error && <div style={{ border: '1px solid red', padding: 8, marginBottom: 12, color: 'red', borderRadius: 8, backgroundColor: 'rgba(254, 242, 242, 0.7)' }}>Error: {error}</div>}
          {message && <div style={{ border: '1px solid green', padding: 8, marginBottom: 12, color: 'green', borderRadius: 8, backgroundColor: 'rgba(240, 253, 244, 0.7)' }}>{message}</div>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLogin ? (
              <>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Email or Username:</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chef_arjun or arjun@example.com"
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password:</label>
                <input
                  type="password"
                  required
                  disabled={isAuthSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  style={{
                    marginTop: 10,
                    padding: '10px 16px',
                    borderRadius: 8,
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    cursor: isAuthSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: isAuthSubmitting ? 0.75 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {isAuthSubmitting && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.75s linear infinite'
                      }}
                    />
                  )}
                  <span>{isAuthSubmitting ? 'Signing in...' : 'Submit Login'}</span>
                </button>
              </>
            ) : (
              <>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Username (min 3 chars):</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Display Name:</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Email:</label>
                <input
                  type="email"
                  required
                  disabled={isAuthSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Mobile Number:</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Age (must be entered):</label>
                <input
                  type="number"
                  required
                  min="13"
                  max="120"
                  placeholder="e.g. 19"
                  disabled={isAuthSubmitting}
                  value={registerAge}
                  onChange={(e) => setRegisterAge(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password (min 6 chars):</label>
                <input
                  type="password"
                  required
                  disabled={isAuthSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  style={{
                    marginTop: 10,
                    padding: '10px 16px',
                    borderRadius: 8,
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    cursor: isAuthSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: isAuthSubmitting ? 0.75 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {isAuthSubmitting && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.75s linear infinite'
                      }}
                    />
                  )}
                  <span>{isAuthSubmitting ? 'Registering...' : 'Submit Register'}</span>
                </button>
              </>
            )}
          </form>
        </GlassContainer>
      </div>
    );
  }

  // Authenticated View
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#e6dfe4', fontFamily: "'Inter', sans-serif", color: '#000000' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'profile') {
            setViewingProfileUser(null);
          }
          setActiveTab(tab);
        }}
        showKitchenModal={showKitchenModal}
        setShowKitchenModal={setShowKitchenModal}
        setShowSettings={setShowSettings}
        setShowAppearanceModal={setShowAppearanceModal}
        setShowReportModal={setShowReportModal}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: activeTab === 'profile' ? '54px 24px 80px' : '40px 32px', minWidth: 0, boxSizing: 'border-box', color: '#000000' }}>
        {/* Global Feedback */}
        {error && <div style={{ border: '1px solid red', padding: 10, marginBottom: 16, color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: 6 }}>Error: {error}</div>}
        {message && <div style={{ border: '1px solid green', padding: 10, marginBottom: 16, color: '#15803d', backgroundColor: '#f0fdf4', borderRadius: 6 }}>{message}</div>}

      {/* ========================================================= */}
      {/* 1. HOME SCREEN (PRODUCT.md Section 13) */}
      {/* ========================================================= */}
      {activeTab === 'home' && (
        <HomeDashboard
          user={user}
          dishes={visibleDishes}
          onOpenKitchenModal={(category) => {
            if (category) setCategoryFilter(category);
            setShowKitchenModal(true);
          }}
          onJoinDish={handleJoinDish}
          onExploreDineIn={() => setActiveTab('dine-in')}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onViewProfile={(profile) => handleNavigateToProfile(profile, 'home')}
        />
      )}

      {/* ========================================================= */}
      {/* 2. DINE-IN SCREEN (Redesigned with Modern Real-App UI/UX) */}
      {/* ========================================================= */}
      {activeTab === 'dine-in' && (
        <DineInFeed
          user={user}
          dishes={visibleDishes}
          fetchDishes={fetchDishes}
          onJoinDish={handleJoinDish}
          onLeaveDish={handleLeaveDish}
          onStartCooking={(id) => handleUpdateStatus(id, 'cooking')}
          onMarkCooked={(id) => handleUpdateStatus(id, 'cooked')}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onOpenKitchenModal={(category) => {
            if (category) setCategoryFilter(category);
            setShowKitchenModal(true);
          }}
          onViewProfile={(profile) => handleNavigateToProfile(profile, 'dine-in')}
          initialTab={dineInTab}
          initialCategory={categoryFilter}
        />
      )}

      {/* ========================================================= */}
      {/* 3. GLOBAL DISHES SCREEN (Location-based Within 5km)       */}
      {/* ========================================================= */}
      {activeTab === 'global' && isAdult && (
        <GlobalPage
          user={user}
          dishes={dishes}
          onJoinDish={handleJoinDish}
          onOpenKitchenModal={(category) => {
            if (category) setCategoryFilter(category);
            setShowKitchenModal(true);
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onViewProfile={(profile) => handleNavigateToProfile(profile, 'global')}
        />
      )}



      {/* ========================================================= */}
      {/* 4. MESSAGES SCREEN (PRODUCT.md Section 16) */}
      {/* ========================================================= */}
      {activeTab === 'messages' && (
        <section style={{ width: '100%', maxWidth: 1040, height: 'calc(100vh - 64px)' }}>
          <GlassContainer
            radius={28}
            style={{ width: '100%', height: '100%' }}
            innerStyle={{
              display: 'flex',
              height: '100%',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Left Panel: Conversations List */}
            <ConversationList
              userName={user.name || user.username}
              conversations={conversations}
              selectedConvId={selectedConvId}
              onSelectConversation={handleOpenConversation}
              messagesTab={messagesTab}
              setMessagesTab={setMessagesTab}
              searchQuery={searchMsgQuery}
              setSearchQuery={setSearchMsgQuery}
              onRespondRequest={handleRespondMessageRequest}
              onViewProfile={(profile) => handleNavigateToProfile(profile, 'messages')}
            />

            {/* Right Panel: Chat Thread */}
            {(() => {
              const activeConv = conversations.find((c) => c.conversationId === selectedConvId);
              const activeUser =
                activeConv?.user ||
                (convMessages.length > 0
                  ? convMessages[0].sender?._id === user._id
                    ? convMessages[0].receiver
                    : convMessages[0].sender
                  : null);

              return (
                <MessageArea
                  currentUser={user}
                  activeUser={activeUser}
                  conversation={activeConv}
                  messages={convMessages}
                  messageText={msgContent}
                  setMessageText={setMsgContent}
                  onSendMessage={handleSendMessage}
                  onViewProfile={(profile) => handleNavigateToProfile(profile, 'messages')}
                  onAcceptRequest={handleAcceptMessageRequest}
                  onRejectRequest={handleRejectMessageRequest}
                  onBlockUser={(targetUsername) => handleBlockMessageRequest(activeConv?.conversationId, targetUsername)}
                />
              );
            })()}
          </GlassContainer>
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. PROFILE SCREEN & SETTINGS (PRODUCT.md Section 18 & 23) */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (() => {
        const isViewingPeer = Boolean(
          viewingProfileUser &&
          ((viewingProfileUser._id && user?._id && String(viewingProfileUser._id) !== String(user._id)) ||
           (viewingProfileUser.username && user?.username && viewingProfileUser.username.toLowerCase() !== user.username.toLowerCase()))
        );
        const activeProfile = isViewingPeer ? viewingProfileUser : user;

        return (
          <section style={{ width: '100%', maxWidth: 935, margin: '0 auto', color: '#000000', fontFamily: "'Inter', sans-serif", paddingTop: 16 }}>
            {/* Top Back Navigation Option (Only when viewing 2nd person profile) */}
            {isViewingPeer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0 16px 0',
                  marginBottom: 16,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  width: '100%'
                }}
              >
                <FluidButton
                  onClick={handleBackFromProfile}
                  style={{
                    padding: '7px 18px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#000000',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>Back to {profileHistory.length > 0 ? `@${profileHistory[profileHistory.length - 1].username}` : getTabLabel(profilePreviousTab)}</span>
                </FluidButton>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15, color: '#000000' }}>
                  <span>@{activeProfile?.username || 'user'}</span>
                  <span
                    title="Verified Campus Peer"
                    style={{ display: 'inline-flex', color: '#0095f6' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0095f6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </span>
                </div>

                <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
                    Profile View
                  </span>
                </div>
              </div>
            )}

            {/* 1. TOP PROFILE HEADER (Instagram Profile Layout) */}
            <ProfileHeader
              user={activeProfile}
              isSelf={!isViewingPeer}
              pronouns={activeProfile?.pronouns || (isViewingPeer ? 'They/Them' : pronouns)}
              instituteName={activeProfile?.institute?.name || (isViewingPeer ? 'IIT MADRAS' : instituteName)}
              instituteYear={activeProfile?.institute?.year ? String(activeProfile.institute.year) : (isViewingPeer ? '2028' : instituteYear)}
              bio={activeProfile?.bio || (isViewingPeer ? activeProfile?.bio : bio)}
              interests={activeProfile?.interests || (isViewingPeer ? (activeProfile?.interests || ['Campus', 'DSA', 'Study']) : interests)}
              connectionsCount={isViewingPeer ? (activeProfile?.stats?.connections || 84) : (connections.length > 0 ? connections.length : 72)}
              onEditProfile={() => setShowEditProfile(true)}
              onOpenSettings={() => setActiveTab('settings')}
              onTabChange={(tab) => setProfileActiveTab(tab)}
              onTagClick={(tag) => {
                const cleaned = tag.startsWith('#') ? tag.slice(1).toLowerCase() : tag.toLowerCase();
                setCategoryFilter(cleaned);
                setActiveTab('dine-in');
              }}
              onUpdateUser={handleUpdateUser}
              onViewConnections={() => {
                if (!isViewingPeer) setShowConnectionsModal(true);
              }}
              isConnected={connections.some(c => {
                const u = c.user || c;
                return (u._id && activeProfile?._id && String(u._id) === String(activeProfile._id)) ||
                       (u.username && activeProfile?.username && u.username.toLowerCase() === activeProfile.username.toLowerCase());
              })}
              onToggleConnect={() => handleToggleConnectPeer(activeProfile)}
              onMessage={() => handleMessageFromProfile(activeProfile)}
              onBlockUser={() => handleBlockUser(activeProfile?.username)}
              onReportUser={(reportedUsername) => {
                setReportDescription(`Reported user @${reportedUsername || activeProfile?.username}`);
                setShowReportModal(true);
              }}
            />

            {/* 2. TAB BAR (DISHES, JOINED, AWARDS) */}
            <div
              style={{
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                gap: 56,
                marginBottom: 28
              }}
            >
              {[
                {
                  id: 'dishes',
                  label: 'DISHES',
                  icon: (isActive) => (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '2'} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  )
                },
                {
                  id: 'joined',
                  label: 'JOINED',
                  icon: (isActive) => (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '2'} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )
                },
                {
                  id: 'awards',
                  label: 'AWARDS',
                  icon: (isActive) => (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '2'} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                  )
                }
              ].map((tab) => {
                const isActive = profileActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 52,
                      marginTop: -1,
                      borderTop: isActive ? '1.5px solid #000000' : '1.5px solid transparent',
                      borderBottom: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: isActive ? 700 : 600,
                      letterSpacing: '1px',
                      color: isActive ? '#000000' : '#888888',
                      transition: 'color 0.15s ease, border-color 0.15s ease'
                    }}
                  >
                    {tab.icon(isActive)}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 3. TAB VIEWS CONTENT */}

            {/* TAB 1: DISHES (Active Ticket on top, Previous Tickets down the line) */}
            {profileActiveTab === 'dishes' && (
              <div>
                {(() => {
                  const targetDishes = isViewingPeer
                    ? dishes.filter(d => {
                        const cId = d.creator?._id ? String(d.creator._id) : (typeof d.creator === 'string' ? d.creator : null);
                        const cUser = d.creator?.username ? String(d.creator.username).toLowerCase() : null;
                        const peerId = activeProfile?._id ? String(activeProfile._id) : null;
                        const peerUsername = activeProfile?.username ? String(activeProfile.username).toLowerCase() : null;
                        return (peerId && cId && peerId === cId) || (peerUsername && cUser && peerUsername === cUser);
                      })
                    : dishes.filter(d => (d.creator?._id || d.creator) === user._id);

                  const fallbackPeerActive = activeProfile?.dishes?.active || {
                    _id: `dish-active-${activeProfile?.username || 'peer'}`,
                    description: `${activeProfile?.name || 'Campus peer'} is hosting a live ${activeProfile?.interests?.[0] || 'sports'} session on campus. Open to join!`,
                    category: (activeProfile?.interests?.[0] || 'sport').toLowerCase(),
                    status: 'cooking',
                    joinMode: 'auto',
                    capacity: { max: 4 },
                    participants: [{ user: activeProfile }, { user: { name: 'Alex Rivera', username: 'alex_cooks' } }],
                    timing: { cookStart: 'Today at 6:00 PM' },
                    creator: activeProfile
                  };

                  const fallbackPeerPrevious = activeProfile?.dishes?.previous || [
                    {
                      _id: `dish-prev-${activeProfile?.username || 'peer'}-1`,
                      description: `Sprint workout & cardio session at the campus gym followed by protein smoothies.`,
                      category: 'sport',
                      status: 'cooked',
                      capacity: { max: 4 },
                      creator: activeProfile,
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                    },
                    {
                      _id: `dish-prev-${activeProfile?.username || 'peer'}-2`,
                      description: `Campus library group study session for DSA Trees & Graphs review.`,
                      category: 'study',
                      status: 'cooked',
                      capacity: { max: 3 },
                      creator: activeProfile,
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
                    },
                    {
                      _id: `dish-prev-${activeProfile?.username || 'peer'}-3`,
                      description: `Campus tea meet & casual discussion on weekend project ideas near Himalaya Mess.`,
                      category: 'social',
                      status: 'cooked',
                      capacity: { max: 5 },
                      creator: activeProfile,
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }]
                    }
                  ];

                  const fallbackActiveDish = isViewingPeer ? fallbackPeerActive : {
                    _id: 'active-ticket-own',
                    description: 'Casual badminton doubles match followed by smoothies at indoor court. Looking for 1 more player to join!',
                    category: 'sport',
                    status: 'cooking',
                    joinMode: 'auto',
                    capacity: { max: 4 },
                    participants: [{ user: { name: user?.name || 'Sid G', username: user?.username || 'soelnvc' } }, { user: 'p1' }, { user: 'p2' }],
                    timing: { cookStart: 'Today at 6:00 PM' },
                    creator: user
                  };

                  const fallbackPreviousDishes = isViewingPeer ? fallbackPeerPrevious : [
                    {
                      _id: 'prev-ticket-1',
                      description: 'Late night Super Smash Bros Ultimate mini-tournament in student center lounge.',
                      category: 'gaming',
                      status: 'cooked',
                      capacity: { max: 6 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }, { user: '6' }]
                    },
                    {
                      _id: 'prev-ticket-2',
                      description: 'DSA Trees & Graphs mock technical interview session in Library Study Room 4.',
                      category: 'study',
                      status: 'cooked',
                      capacity: { max: 3 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
                    },
                    {
                      _id: 'prev-ticket-3',
                      description: 'Evening walk to Campus Cafe for iced coffee & casual chit-chat after classes.',
                      category: 'social',
                      status: 'cooked',
                      capacity: { max: 4 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                    }
                  ];

                  const realActive = targetDishes.filter(d => d.status !== 'cooked');
                  const realPrevious = targetDishes.filter(d => d.status === 'cooked');

                  const activeDish = realActive.length > 0 ? realActive[0] : (targetDishes.length === 0 ? fallbackActiveDish : null);
                  const previousDishes = realPrevious.length > 0 ? realPrevious : (targetDishes.length === 0 ? fallbackPreviousDishes : []);

                  const spotsLeft = activeDish ? (activeDish.capacity?.unlimited ? '∞' : Math.max(0, (activeDish.capacity?.max || activeDish.capacity || 4) - (activeDish.participants?.length || 0))) : 0;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {/* ACTIVE TICKET (Rendered minimally, exactly like a ticket from our feed) */}
                      {activeDish && (
                        <GlassContainer
                          radius={28}
                          style={{ width: '100%' }}
                          innerStyle={{
                            padding: '20px 22px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 16,
                            position: 'relative',
                            color: '#000000',
                            boxSizing: 'border-box',
                            width: '100%'
                          }}
                        >
                          {/* Left Icon: Wireframe Shopping Cart SVG (same as Feed) */}
                          <div style={{ paddingTop: 3, flexShrink: 0 }}>
                            <svg
                              width="42"
                              height="42"
                              viewBox="0 0 40 40"
                              fill="none"
                              stroke="#000000"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 6h5l3.5 17h18l3.5-12H11" />
                              <line x1="14" y1="15" x2="31.5" y2="15" />
                              <line x1="15.5" y1="19" x2="28" y2="19" />
                              <line x1="19" y1="11" x2="18" y2="23" />
                              <line x1="25" y1="11" x2="24" y2="23" />
                              <circle cx="16" cy="29" r="2.8" fill="#000000" />
                              <circle cx="28" cy="29" r="2.8" fill="#000000" />
                            </svg>
                          </div>

                          {/* Right Card Content */}
                          <div style={{ flex: 1, minWidth: 0, color: '#000000' }}>
                            {/* Header: DP + Name + Username • Category and Status */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {activeProfile.avatar ? (
                                  <img
                                    src={activeProfile.avatar}
                                    alt={activeProfile.name}
                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      backgroundColor: '#f97316',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      flexShrink: 0
                                    }}
                                  >
                                    {(activeProfile.name || activeProfile.username || 'U')[0].toUpperCase()}
                                  </div>
                                )}
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 'bold', fontSize: 14.5, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.2 }}>
                                    {activeProfile.name || 'Campus Peer'}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: '#4b5563', marginTop: 1 }}>
                                    @{activeProfile.username || 'user'} • <span style={{ textTransform: 'capitalize' }}>{activeDish.category || 'sport'}</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                                  Cooking
                                </span>
                                {isViewingPeer && (
                                  <FluidButton
                                    onClick={() => handleJoinDish(activeDish._id)}
                                    style={{ padding: '4px 14px', fontSize: 12, fontWeight: 600 }}
                                  >
                                    Join Dish
                                  </FluidButton>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <div style={{ fontSize: 13.5, color: '#000000', lineHeight: 1.45, marginBottom: 8, wordBreak: 'break-word' }}>
                              <span style={{ fontWeight: 600, color: '#000000' }}>Description: </span>
                              {activeDish.description}
                            </div>

                            {/* Meta Info Bar: Capacity, Join Mode */}
                            <div style={{ fontSize: 11.5, color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: 10, fontWeight: '500', alignItems: 'center' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {activeDish.participants?.length || 3}/{activeDish.capacity?.max || activeDish.capacity || 4} spots ({spotsLeft} left)
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                • {activeDish.joinMode === 'auto' ? (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    Auto-join
                                  </>
                                ) : (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Request approval
                                  </>
                                )}
                              </span>
                              {activeDish.timing?.cookStart && <span>• {activeDish.timing.cookStart}</span>}
                            </div>
                          </div>
                        </GlassContainer>
                      )}

                      {/* PREVIOUS DISHES (Completed Activity Tickets down the line) */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
                            Previous Dishes ({previousDishes.length})
                          </h4>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>
                            History
                          </span>
                        </div>

                        {previousDishes.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666666' }}>
                            <p style={{ fontSize: 14, margin: 0 }}>No previous dishes yet.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                            {previousDishes.map((dish) => (
                              <GlassContainer
                                key={dish._id}
                                radius={18}
                                style={{ aspectRatio: '1 / 1', position: 'relative', cursor: 'default', overflow: 'hidden' }}
                                innerStyle={{
                                  padding: 18,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555555' }}>
                                      {dish.category || 'Activity'}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                      Cooked
                                    </span>
                                  </div>
                                  <p style={{ fontSize: 13, color: '#111827', margin: 0, lineHeight: 1.4, lineClamp: 4, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {dish.description}
                                  </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 11.5, color: '#666666' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                      <circle cx="9" cy="7" r="4" />
                                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    {dish.participants?.length || 1}/{dish.capacity?.max || dish.capacity || 4} spots
                                  </span>
                                  <span style={{ textTransform: 'capitalize' }}>{dish.category || 'Done'}</span>
                                </div>
                              </GlassContainer>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: JOINED (Active Joined Ticket on top, Previous Joined Tickets down the line) */}
            {profileActiveTab === 'joined' && (
              <div>
                {(() => {
                  const targetJoinedDishes = isViewingPeer
                    ? dishes.filter(d => {
                        const peerId = activeProfile?._id ? String(activeProfile._id) : null;
                        const peerUsername = activeProfile?.username ? String(activeProfile.username).toLowerCase() : null;
                        const notCreator = peerId ? (String(d.creator?._id || d.creator) !== peerId) : true;
                        const isPart = (d.participants || []).some(p => {
                          const pId = p.user?._id ? String(p.user._id) : (typeof p.user === 'string' ? p.user : null);
                          const pUser = p.user?.username ? String(p.user.username).toLowerCase() : null;
                          return (peerId && pId && peerId === pId) || (peerUsername && pUser && peerUsername === pUser);
                        });
                        return notCreator && isPart;
                      })
                    : dishes.filter(d => (d.creator?._id || d.creator) !== user._id && (d.participants || []).some(p => (p.user?._id || p.user) === user._id));

                  const fallbackPeerActiveJoined = activeProfile?.dishes?.activeJoined || {
                    _id: `joined-active-${activeProfile?.username || 'peer'}`,
                    description: activeProfile?.username === 'alex_cooks'
                      ? 'Late evening badminton friendly match at SAC indoor arena. Hosted by Priya Patel.'
                      : 'Weekend 5k morning run & core workout session around campus track. Hosted by Alex Rivera.',
                    category: 'sport',
                    creator: activeProfile?.username === 'alex_cooks'
                      ? { name: 'Priya Patel', username: 'priyap', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' }
                      : { name: 'Alex Rivera', username: 'alex_cooks', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80' },
                    status: 'cooking',
                    joinMode: 'auto',
                    capacity: { max: 4 },
                    participants: [{ user: { name: 'Alex Rivera', username: 'alex_cooks' } }, { user: activeProfile }, { user: { name: 'Meera Patel', username: 'meera' } }],
                    timing: { cookStart: 'Tomorrow at 7:00 AM' }
                  };

                  const fallbackPeerPreviousJoined = activeProfile?.dishes?.previousJoined || [
                    {
                      _id: `joined-prev-${activeProfile?.username || 'peer'}-1`,
                      description: `Deep work study session: preparing for System Design & distributed consensus algorithms in library.`,
                      category: 'study',
                      creator: { name: 'Maya Lin', username: 'mayachef' },
                      status: 'cooked',
                      capacity: { max: 3 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
                    },
                    {
                      _id: `joined-prev-${activeProfile?.username || 'peer'}-2`,
                      description: `Casual badminton doubles match followed by protein shakes at campus court.`,
                      category: 'sport',
                      creator: { name: 'Priya Patel', username: 'priyabakes' },
                      status: 'cooked',
                      capacity: { max: 4 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                    },
                    {
                      _id: `joined-prev-${activeProfile?.username || 'peer'}-3`,
                      description: `Board games & casual chit-chat evening at student center lounge.`,
                      category: 'social',
                      creator: { name: 'Alex Rivera', username: 'alex_cooks' },
                      status: 'cooked',
                      capacity: { max: 5 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                    }
                  ];

                  const fallbackActiveJoined = isViewingPeer ? fallbackPeerActiveJoined : {
                    _id: 'active-joined-ticket-own',
                    description: 'Weekend 5k morning run & core workout session around campus track. Join in!',
                    category: 'sport',
                    creator: { name: 'Alex Rivera', username: 'alex_cooks' },
                    status: 'cooking',
                    joinMode: 'auto',
                    capacity: { max: 4 },
                    participants: [{ user: { name: 'Alex Rivera', username: 'alex_cooks' } }, { user: user }, { user: { name: 'Meera Patel', username: 'meera' } }],
                    timing: { cookStart: 'Tomorrow at 7:00 AM' }
                  };

                  const fallbackPreviousJoined = isViewingPeer ? fallbackPeerPreviousJoined : [
                    {
                      _id: 'prev-joined-1',
                      description: 'Deep work study session: preparing for System Design & distributed consensus algorithms in library.',
                      category: 'study',
                      creator: { name: 'Maya Lin', username: 'mayachef' },
                      status: 'cooked',
                      capacity: { max: 3 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
                    },
                    {
                      _id: 'prev-joined-2',
                      description: 'Casual badminton doubles match followed by protein shakes at campus court.',
                      category: 'sport',
                      creator: { name: 'Priya Patel', username: 'priyabakes' },
                      status: 'cooked',
                      capacity: { max: 4 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                    },
                    {
                      _id: 'prev-joined-3',
                      description: 'Board games & casual chit-chat evening at student center lounge.',
                      category: 'social',
                      creator: { name: 'Alex Rivera', username: 'alex_cooks' },
                      status: 'cooked',
                      capacity: { max: 5 },
                      participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                    }
                  ];

                  const realActiveJoined = targetJoinedDishes.filter(d => d.status !== 'cooked');
                  const realPreviousJoined = targetJoinedDishes.filter(d => d.status === 'cooked');

                  const activeJoined = realActiveJoined.length > 0 ? realActiveJoined[0] : (targetJoinedDishes.length === 0 ? fallbackActiveJoined : null);
                  const previousJoined = realPreviousJoined.length > 0 ? realPreviousJoined : (targetJoinedDishes.length === 0 ? fallbackPreviousJoined : []);

                  const spotsLeft = activeJoined ? (activeJoined.capacity?.unlimited ? '∞' : Math.max(0, (activeJoined.capacity?.max || activeJoined.capacity || 4) - (activeJoined.participants?.length || 0))) : 0;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {/* ACTIVE JOINED TICKET (Minimal, like a ticket from our feed) */}
                      {activeJoined && (
                        <GlassContainer
                          radius={28}
                          style={{ width: '100%' }}
                          innerStyle={{
                            padding: '20px 22px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 16,
                            position: 'relative',
                            color: '#000000',
                            boxSizing: 'border-box',
                            width: '100%'
                          }}
                        >
                          {/* Left Icon: Wireframe Shopping Cart SVG */}
                          <div style={{ paddingTop: 3, flexShrink: 0 }}>
                            <svg
                              width="42"
                              height="42"
                              viewBox="0 0 40 40"
                              fill="none"
                              stroke="#000000"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 6h5l3.5 17h18l3.5-12H11" />
                              <line x1="14" y1="15" x2="31.5" y2="15" />
                              <line x1="15.5" y1="19" x2="28" y2="19" />
                              <line x1="19" y1="11" x2="18" y2="23" />
                              <line x1="25" y1="11" x2="24" y2="23" />
                              <circle cx="16" cy="29" r="2.8" fill="#000000" />
                              <circle cx="28" cy="29" r="2.8" fill="#000000" />
                            </svg>
                          </div>

                          {/* Right Card Content */}
                          <div style={{ flex: 1, minWidth: 0, color: '#000000' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const targetCreator = activeJoined.creator || { name: 'Alex Rivera', username: 'alex_cooks' };
                                  handleNavigateToProfile(targetCreator);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'opacity 0.15s ease' }}
                                title={`View @${activeJoined.creator?.username || 'alex_cooks'}'s profile`}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                              >
                                {activeJoined.creator?.avatar || DEMO_PEER_PROFILES[activeJoined.creator?.username?.toLowerCase() || 'alex_cooks']?.avatar ? (
                                  <img
                                    src={activeJoined.creator?.avatar || DEMO_PEER_PROFILES[activeJoined.creator?.username?.toLowerCase() || 'alex_cooks']?.avatar}
                                    alt={activeJoined.creator?.name || 'Alex Rivera'}
                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      backgroundColor: '#9353d3',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 13,
                                      fontWeight: 'bold',
                                      flexShrink: 0
                                    }}
                                  >
                                    {(activeJoined.creator?.name || activeJoined.creator?.username || 'A')[0].toUpperCase()}
                                  </div>
                                )}
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 'bold', fontSize: 14.5, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.2 }}>
                                    {activeJoined.creator?.name || 'Alex Rivera'}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: '#4b5563', marginTop: 1 }}>
                                    @{activeJoined.creator?.username || 'alex_cooks'} • <span style={{ textTransform: 'capitalize' }}>{activeJoined.category || 'sport'}</span>
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                                Joined
                              </span>
                            </div>

                            <div style={{ fontSize: 13.5, color: '#000000', lineHeight: 1.45, marginBottom: 8, wordBreak: 'break-word' }}>
                              <span style={{ fontWeight: 600, color: '#000000' }}>Description: </span>
                              {activeJoined.description?.includes(activeJoined.creator?.name || 'Alex Rivera') ? (
                                <>
                                  {activeJoined.description.split(activeJoined.creator?.name || 'Alex Rivera')[0]}
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNavigateToProfile(activeJoined.creator || { name: 'Alex Rivera', username: 'alex_cooks' });
                                    }}
                                    title={`View @${activeJoined.creator?.username || 'alex_cooks'}'s profile`}
                                    style={{ fontWeight: 700, color: '#000000', cursor: 'pointer', textDecoration: 'underline' }}
                                  >
                                    {activeJoined.creator?.name || 'Alex Rivera'}
                                  </span>
                                  {activeJoined.description.split(activeJoined.creator?.name || 'Alex Rivera')[1]}
                                </>
                              ) : (
                                activeJoined.description
                              )}
                            </div>

                            <div style={{ fontSize: 11.5, color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: 10, fontWeight: '500', alignItems: 'center' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {activeJoined.participants?.length || 2}/{activeJoined.capacity?.max || activeJoined.capacity || 4} spots ({spotsLeft} left)
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                • {activeJoined.joinMode === 'auto' ? (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    Auto-join
                                  </>
                                ) : (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Request approval
                                  </>
                                )}
                              </span>
                              {activeJoined.timing?.cookStart && <span>• {activeJoined.timing.cookStart}</span>}
                            </div>
                          </div>
                        </GlassContainer>
                      )}

                      {/* PREVIOUS JOINED DISHES */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
                            Past Joined Sessions ({previousJoined.length})
                          </h4>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>
                            History
                          </span>
                        </div>

                        {previousJoined.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666666' }}>
                            <p style={{ fontSize: 14, margin: 0 }}>No past joined dishes yet.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                            {previousJoined.map((dish) => (
                              <GlassContainer
                                key={dish._id}
                                radius={18}
                                style={{ aspectRatio: '1 / 1', position: 'relative', cursor: 'default', overflow: 'hidden' }}
                                innerStyle={{
                                  padding: 18,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555555' }}>
                                      {dish.category || 'Activity'}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                      Joined
                                    </span>
                                  </div>
                                  <p style={{ fontSize: 13, color: '#111827', margin: 0, lineHeight: 1.4, lineClamp: 4, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {dish.description}
                                  </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 11.5, color: '#666666' }}>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const creatorObj = typeof dish.creator === 'string'
                                        ? { username: dish.creator, name: dish.creator }
                                        : (dish.creator || { username: 'alex_cooks', name: 'Alex Rivera' });
                                      handleNavigateToProfile(creatorObj);
                                    }}
                                    title={`View @${dish.creator?.username || 'chef'}'s profile`}
                                    style={{
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      color: '#000000',
                                      transition: 'opacity 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                  >
                                    Host: @{dish.creator?.username || 'chef'}
                                  </span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                      <circle cx="9" cy="7" r="4" />
                                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    {dish.participants?.length || 1}/{dish.capacity?.max || dish.capacity || 4}
                                  </span>
                                </div>
                              </GlassContainer>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: AWARDS (Award Library based on PRODUCT.md Section 20 Achievements) */}
            {profileActiveTab === 'awards' && <AwardsLibrary user={activeProfile} isSelf={!isViewingPeer} />}


          {/* EDIT PROFILE MODAL (Triggered by pill button) */}
          {showEditProfile && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16
              }}
              onClick={() => setShowEditProfile(false)}
            >
              <GlassContainer
                radius={28}
                style={{ width: '100%', maxWidth: 540 }}
                innerStyle={{
                  padding: 28,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  color: '#000000'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Edit Profile</h3>
                  <FluidButton
                    variant="icon"
                    onClick={() => setShowEditProfile(false)}
                    style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                    title="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </FluidButton>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Profile Photo Upload */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 14, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#f97316',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: 22,
                        fontWeight: 800,
                        flexShrink: 0,
                        border: '1.5px solid rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {editAvatar || user?.avatar ? (
                        <img
                          src={editAvatar || user?.avatar}
                          alt="Avatar preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        (profileName || user?.name || 'U')[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'inline-block',
                          cursor: 'pointer',
                          padding: '6px 14px',
                          borderRadius: 9999,
                          border: '1px solid rgba(0, 0, 0, 0.15)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          color: '#09090b'
                        }}
                      >
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const maxDim = 400;
                                let w = img.width;
                                let h = img.height;
                                if (w > h) {
                                  if (w > maxDim) {
                                    h = Math.round((h * maxDim) / w);
                                    w = maxDim;
                                  }
                                } else {
                                  if (h > maxDim) {
                                    w = Math.round((w * maxDim) / h);
                                    h = maxDim;
                                  }
                                }
                                canvas.width = w;
                                canvas.height = h;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, w, h);
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                setEditAvatar(dataUrl);
                                handleUpdateUser({ avatar: dataUrl }).catch(() => {});
                              };
                              img.src = ev.target.result;
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>
                        Square JPG or PNG. Syncs across all campus activities.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Display Name:</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Sid G"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#000000'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pronouns:</label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g. He/Him, She/Her, They/Them"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#000000'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bio:</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell campus what activities you're down for, hobbies, and ideas (e.g. #Badminton #Gym #Study #Gaming)..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#000000',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Tags Editor */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tags / Interests:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {interests.map((tag, i) => (
                        <FluidButton
                          key={i}
                          type="button"
                          onClick={() => setInterests(interests.filter((_, idx) => idx !== i))}
                          title="Click to remove tag"
                          style={{
                            padding: '4px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: '#111827'
                          }}
                        >
                          <span>{tag.startsWith('#') ? tag.slice(1) : tag}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, opacity: 0.6 }}>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </FluidButton>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTagInput.trim() && !interests.includes(newTagInput.trim())) {
                              setInterests([...interests, newTagInput.trim()]);
                              setNewTagInput('');
                            }
                          }
                        }}
                        placeholder="Add new tag (e.g. Badminton, Gym, Study, Anime, Coffee)..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                      <FluidButton
                        type="button"
                        onClick={() => {
                          if (newTagInput.trim() && !interests.includes(newTagInput.trim())) {
                            setInterests([...interests, newTagInput.trim()]);
                            setNewTagInput('');
                          }
                        }}
                        style={{
                          padding: '7px 18px',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        + Add
                      </FluidButton>
                    </div>
                  </div>

                  {/* Institutes Editor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Primary Institute:</label>
                      <input
                        type="text"
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        placeholder="e.g. IIT MADRAS"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Primary Batch Year:</label>
                      <input
                        type="number"
                        value={instituteYear}
                        onChange={(e) => setInstituteYear(e.target.value)}
                        placeholder="2029"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Secondary Institute:</label>
                      <input
                        type="text"
                        value={secondaryInstituteName}
                        onChange={(e) => setSecondaryInstituteName(e.target.value)}
                        placeholder="e.g. SST"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Secondary Batch Year:</label>
                      <input
                        type="number"
                        value={secondaryInstituteYear}
                        onChange={(e) => setSecondaryInstituteYear(e.target.value)}
                        placeholder="2029"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <FluidButton
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      style={{
                        padding: '8px 22px',
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Cancel
                    </FluidButton>
                    <FluidButton
                      type="submit"
                      style={{
                        padding: '8px 26px',
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Save Profile
                    </FluidButton>
                  </div>
                </form>
              </GlassContainer>
            </div>
          )}

        </section>
        );
      })()}

      {/* ========================================================= */}
      {/* 6. APP SETTINGS SCREEN (Dedicated Instagram-Style Page)     */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <SettingsPage
          user={user}
          onLogout={handleLogout}
          onUpdateUser={async (updatedFields) => {
            try {
              const res = await apiFetch('/users/me', {
                method: 'PATCH',
                body: JSON.stringify(updatedFields)
              });
              setUser(res.data);
              setMessage('Settings saved successfully');
            } catch (err) {
              setError(err.message);
            }
          }}
          onOpenEditProfile={() => setShowEditProfile(true)}
          themePreference={themePreference}
          onThemeChange={(newTheme) => setThemePreference(newTheme)}
          onViewProfile={(profile) => handleNavigateToProfile(profile, 'settings')}
        />
      )}

      {/* ========================================================= */}
      {/* APPEARANCE MODAL (Built with GlassContainer) */}
      {/* ========================================================= */}
      {showAppearanceModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowAppearanceModal(false)}
        >
          <GlassContainer
            radius={24}
            style={{ width: '100%', maxWidth: 430 }}
            innerStyle={{ padding: 26, color: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </span>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Appearance</h3>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => setShowAppearanceModal(false)}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            <p style={{ fontSize: 13.5, color: '#52525b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Choose your display appearance for LetMeCook:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'light', label: 'Light Mode', desc: 'Soft frosted daylight tone (Default)' },
                { id: 'dark', label: 'Dark Mode', desc: 'Deep obsidian night theme (Coming soon)' },
                { id: 'system', label: 'System Default', desc: 'Match your operating system appearance' }
              ].map((theme) => {
                const isSelected = themePreference === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemePreference(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: isSelected ? '1.5px solid #000000' : '1px solid rgba(0, 0, 0, 0.08)',
                      background: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>{theme.label}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{theme.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #000000' : '2px solid #ccc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <FluidButton
              onClick={() => setShowAppearanceModal(false)}
              style={{ width: '100%', padding: '10px 0', fontSize: 13.5, fontWeight: 600 }}
            >
              Done
            </FluidButton>
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT A PROBLEM MODAL (Built with GlassContainer) */}
      {/* ========================================================= */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => {
            setShowReportModal(false);
            setReportSubmitted(false);
          }}
        >
          <GlassContainer
            radius={24}
            style={{ width: '100%', maxWidth: 470 }}
            innerStyle={{ padding: 26, color: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Report a Problem</h3>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => {
                  setShowReportModal(false);
                  setReportSubmitted(false);
                }}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', margin: '0 auto 16px auto' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700 }}>Thank you for your report!</h4>
                <p style={{ margin: 0, fontSize: 13.5, color: '#52525b', lineHeight: 1.5 }}>
                  Our team has received your feedback and will look into it promptly.
                </p>
                <FluidButton
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                    setReportDescription('');
                  }}
                  style={{ marginTop: 20, width: '100%', padding: '9px 0', fontSize: 13.5, fontWeight: 600 }}
                >
                  Close
                </FluidButton>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reportDescription.trim()) return;
                  setReportSubmitted(true);
                }}
              >
                <p style={{ fontSize: 13.5, color: '#52525b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Please describe what went wrong or feature improvements you'd like to see:
                </p>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Explain what happened or what's broken..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.14)',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: 16,
                    outline: 'none',
                    color: '#000000'
                  }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <FluidButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowReportModal(false)}
                    style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500 }}
                  >
                    Cancel
                  </FluidButton>
                  <FluidButton
                    type="submit"
                    disabled={!reportDescription.trim()}
                    style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600 }}
                  >
                    Send Report
                  </FluidButton>
                </div>
              </form>
            )}
          </GlassContainer>
        </div>
      )}


      {/* ========================================================= */}
      {/* KITCHEN POPUP MODAL (Guided Sequential Creation Flow) */}
      {/* ========================================================= */}
      <KitchenModal
        isOpen={showKitchenModal}
        onClose={() => setShowKitchenModal(false)}
        onSubmitDish={handleCreateDish}
        isSubmitting={isSubmittingDish}
      />

      {/* ========================================================= */}
      {/* CONNECTIONS LIST MODAL                                   */}
      {/* ========================================================= */}
      {showConnectionsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConnectionsModal(false);
          }}
        >
          <GlassContainer
            radius={28}
            borderWidth={1.5}
            style={{ width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0, 0, 0, 0.22)' }}
            innerStyle={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#09090b' }}>
                Connections ({connections.length})
              </h3>
              <button
                onClick={() => setShowConnectionsModal(false)}
                type="button"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
              {connections.map((c) => {
                const cUser = c.user || c;
                return (
                  <div
                    key={c._id || cUser._id || cUser.username}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 14,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <div
                      onClick={() => {
                        setShowConnectionsModal(false);
                        handleNavigateToProfile(cUser, 'profile');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    >
                      {cUser.avatar ? (
                        <img
                          src={cUser.avatar}
                          alt={cUser.name}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: '#f97316',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            fontWeight: 700
                          }}
                        >
                          {(cUser.name || cUser.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#09090b' }}>
                          {cUser.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#71717a' }}>
                          @{cUser.username}
                        </div>
                      </div>
                    </div>

                    <FluidButton
                      onClick={() => {
                        setShowConnectionsModal(false);
                        handleNavigateToProfile(cUser, 'profile');
                      }}
                      style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600 }}
                    >
                      Profile
                    </FluidButton>
                  </div>
                );
              })}
            </div>
          </GlassContainer>
        </div>
      )}
      </div>
    </div>
  );
}
