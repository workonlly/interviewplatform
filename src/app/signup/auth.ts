import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firbase/client";



export interface Authresult{
    user:User | null;
    error:string | null;
}


export const signUpWithEmail = async (
  email: string, 
  password: string, 
  fullName: string
): Promise<Authresult> => {
  try {
    // Create the user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user profile with display name
    await updateProfile(user, {
      displayName: fullName
    });

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: fullName,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      profileComplete: false
    });

    return { user, error: null };
  } catch (error: any) {
    console.error("Error during signup:", error);
    return { user: null, error: error.message };
  }
};

export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<Authresult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time
    await setDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error("Error during login:", error);
    return { user: null, error: error.message };
  }
};

export const signOutUser = async (): Promise<{ success: boolean; error: string | null }> => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error during signout:", error);
    return { success: false, error: error.message };
  }
};


export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};


export const getUserData = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    } else {
      return { data: null, error: "User document not found" };
    }
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return { data: null, error: error.message };
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};