import apiClient from './client';

export interface AppContentSection {
  title: string;
  body: string;
}

export interface AppContentFaq {
  question: string;
  answer: string;
}

export interface AppContentContact {
  label: string;
  value: string;
  kind: 'email' | 'phone' | 'website' | 'chat';
  target?: string;
}

export interface AppContentLink {
  label: string;
  url: string;
}

export interface PublicAppContent {
  appName: string;
  brandTagline: string;
  supportEmail: string;
  supportPhone?: string;
  privacyPolicy: {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: AppContentSection[];
  };
  helpSupport: {
    title: string;
    intro: string;
    faqs: AppContentFaq[];
    contacts: AppContentContact[];
  };
  rateApp: {
    title: string;
    subtitle: string;
    description: string;
    highlights: string[];
    primaryLabel: string;
    secondaryLabel: string;
    androidUrl: string;
    androidWebUrl: string;
    iosUrl?: string;
    webFallbackUrl?: string;
    feedbackEmail: string;
  };
  aboutUs: {
    title: string;
    headline: string;
    summary: string;
    mission: string;
    values: Array<{ title: string; description: string }>;
    quickFacts: Array<{ label: string; value: string }>;
    links: AppContentLink[];
    footer: string;
  };
  salon: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    about?: string;
    tagline?: string;
    logo?: string;
  };
}

export async function getPublicAppContent(): Promise<PublicAppContent> {
  const res = await apiClient.get('/api/public/app-content');
  return res.data.data ?? res.data;
}