export interface ProfileType {
    name: string;
    bio: string;
    about_me: string;
    interests: string[];
    location: string;
    height: number;
    gender: string;
    work: string;
    relationship_type: string;
  }
  
  export interface FormData {
    name: string;
    bio: string;
    about_me: string;
    interests: string[];
    image: File | null;
    location: string;
    height: string;
    gender: string;
    work: string;
    relationship_type: string;
  }
  