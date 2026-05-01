import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import app, { auth, db } from "@/lib/firebase";

export type UserRole = "NGO" | "Volunteer";

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  signup: (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string,
    specialties?: string[],
    serviceAreas?: string[],
    skillsBio?: string,
    locationZone?: string,
    ngoId?: string,
  ) => Promise<UserRole>;
  logout: () => Promise<void>;

  // Backward-compatible aliases for existing components.
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<UserRole>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoleForUid = async (uid: string): Promise<UserRole> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("User role profile not found.");
    }

    const rawRole = userDoc.data()?.role as string | undefined;
    const normalizedRole = rawRole?.toLowerCase();
    if (normalizedRole !== "ngo" && normalizedRole !== "volunteer") {
      throw new Error("Invalid user role in database.");
    }

    return normalizedRole === "ngo" ? "NGO" : "Volunteer";
  };

  const syncVolunteerFcmToken = async (uid: string) => {
    try {
      if (typeof window === "undefined" || typeof Notification === "undefined") {
        return;
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
      if (!vapidKey) {
        console.warn("Missing VITE_FIREBASE_VAPID_KEY. Skipping FCM token sync.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
      if ("serviceWorker" in navigator) {
        serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const swReady = await navigator.serviceWorker.ready;

        swReady.active?.postMessage({
          type: "FIREBASE_CONFIG",
          payload: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          },
        });
      }

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey,
        ...(serviceWorkerRegistration ? { serviceWorkerRegistration } : {}),
      });

      if (!token) {
        return;
      }

      await setDoc(
        doc(db, "users", uid),
        {
          fcmToken: token,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("FCM token setup failed:", error);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setCurrentUser(u);
        if (u) {
          const role = await fetchRoleForUid(u.uid);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Failed to resolve authenticated user role:", error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const role = await fetchRoleForUid(credential.user.uid);

    if (role === "Volunteer") {
      await syncVolunteerFcmToken(credential.user.uid);
    }

    setCurrentUser(credential.user);
    setUserRole(role);
    return role;
  };

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string,
    specialties?: string[],
    serviceAreas?: string[],
    skillsBio?: string,
    locationZone?: string,
    ngoId?: string,
  ): Promise<UserRole> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const basePayload = {
      email,
      fullName: fullName || "",
      role: role === "NGO" ? "ngo" : "volunteer",
    };

    if (role === "NGO") {
      await setDoc(doc(db, "users", credential.user.uid), {
        ...basePayload,
        specialties: specialties || [],
        serviceAreas: serviceAreas || [],
        activeEmergenciesCount: 0,
      });
    } else {
      await setDoc(doc(db, "users", credential.user.uid), {
        ...basePayload,
        ngoId: ngoId || "ngo_001",
        skillsBio: skillsBio || "",
        locationZone: locationZone || "",
        tasksAssigned: 0,
        tasksCompleted: 0,
        totalResponseTimeMins: 0,
        clusterLabel: "Newcomer",
      });
    }

    setCurrentUser(credential.user);
    setUserRole(role);
    return role;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
  };

  const register = (email: string, password: string) => signup(email, password, "NGO");
  const setRole = (role: UserRole) => setUserRole(role);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        isLoading,
        login,
        signup,
        logout,
        user: currentUser,
        role: userRole,
        loading: isLoading,
        register,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
