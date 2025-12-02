export interface UserStats {
    totalPlants: number;
    wateringSessions: number;
    successRate: number;
}

export interface UserAchievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string | null;
    status: 'locked' | 'unlocked';
}

export interface UserProfile {
    uuid: string;
    email: string;
    username: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    joinDate: string;
    lastLogin?: string;
    stats: UserStats;
}

export interface ProfileUpdateRequest {
    fullName?: string;
    phone?: string;
    bio?: string;
    location?: string;
}

export interface AvatarUploadResponse {
    avatarUrl: string;
}

export interface ValidationError {
    error: string;
    message: string;
    details: Record<string, string>;
}

export interface AchievementsResponse {
    achievements: UserAchievement[];
}
