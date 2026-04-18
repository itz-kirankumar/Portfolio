// types/index.ts

export type BlockType =
  | 'text'
  | 'image'
  | 'youtube'
  | 'instagram'
  | 'linkedin'
  | 'map'
  | 'pdf'
  | 'testimonial'
  | 'service'
  | 'button'
  | 'blog'
  | 'skills'
  | 'project'
  | 'social'
  | 'divider'
  | 'contact'
  | 'experience'

export type AnimationType = 'none' | 'fadeIn' | 'slideUp' | 'slideLeft' | 'zoomIn'

export interface Block {
  id: string
  type: BlockType
  order: number
  visible: boolean
  animation: AnimationType
  content: BlockContent
  settings: BlockSettings
  createdAt: number
  updatedAt: number
}

export type BlockContent =
  | TextContent
  | ImageContent
  | YouTubeContent
  | InstagramContent
  | LinkedInContent
  | MapContent
  | PDFContent
  | TestimonialContent
  | ServiceContent
  | ButtonContent
  | BlogContent
  | SkillsContent
  | ProjectContent
  | SocialContent
  | DividerContent

export interface TextContent {
  html: string
}

export interface ImageContent {
  url: string
  caption?: string
  alt?: string
  link?: string
}

export interface YouTubeContent {
  url: string
  title?: string
  autoplay?: boolean
}

export interface InstagramContent {
  url: string
}

export interface LinkedInContent {
  url: string
}

export interface MapContent {
  lat: number
  lng: number
  zoom: number
  label?: string
  address?: string
}

export interface PDFContent {
  url: string
  filename: string
}

export interface TestimonialContent {
  quote: string
  name: string
  role: string
  company?: string
  avatar?: string
  rating?: number
}

export interface ServiceContent {
  title: string
  description: string
  price: number
  currency: 'INR' | 'USD'
  duration?: string
  features: string[]
  ctaText: string
  calendlyUrl?: string
  isActive: boolean
}

export interface ButtonContent {
  label: string
  url: string
  style: 'primary' | 'secondary' | 'outline' | 'ghost'
  icon?: string
  openInNewTab?: boolean
}

export interface BlogContent {
  title: string
  excerpt: string
  html: string
  coverImage?: string
  tags?: string[]
  publishedAt?: number
  slug?: string
  id?: string
}

export interface SkillItem {
  name: string
  level: number // 0-100
  color?: string
}

export interface SkillsContent {
  title?: string
  skills: SkillItem[]
  displayStyle: 'bars' | 'chips' | 'grid'
}

export interface ProjectContent {
  title: string
  description: string
  thumbnail?: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
  featured?: boolean
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface SocialContent {
  links: SocialLink[]
  displayStyle: 'icons' | 'buttons' | 'list'
}

export interface DividerContent {
  style: 'line' | 'space' | 'dots' | 'wave'
  height?: number
}

export interface BlockSettings {
  paddingTop?: number
  paddingBottom?: number
  backgroundColor?: string
  textColor?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
  alignment?: 'left' | 'center' | 'right'
  borderRadius?: number
  shadow?: boolean

  // Grouping & Layout
  groupWithPrevious?: boolean
  displayMode?: 'single' | 'grid-2' | 'grid-3' | 'masonry' | 'carousel'
  sectionTitle?: string
  sectionDescription?: string
}

// User & Profile
export interface UserProfile {
  uid: string
  email: string
  username: string
  displayName: string
  bio?: string
  avatar?: string
  coverImage?: string
  location?: string
  website?: string
  theme: PortfolioTheme
  seo: SEOSettings
  createdAt: number
  updatedAt: number
  isPublic: boolean

  // Hero & Navbar editable fields
  heroTagline?: string
  hireMeUrl?: string
  hireMeLabel?: string
  getInTouchUrl?: string
  navBrandName?: string
  navLinks?: NavLink[]
  heroPrimaryLabel?: string
  heroPrimaryUrl?: string
  heroSecondaryLabel?: string
  heroSecondaryUrl?: string
}

export interface PortfolioTheme {
  preset: string
  primaryColor: string
  accentColor: string
  bgColor: string
  surfaceColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  darkMode: boolean
  customCSS?: string
  backdropStyle?: string
}

export interface SEOSettings {
  title?: string
  description?: string
  ogImage?: string
  keywords?: string[]
}

export interface NavLink {
  label: string
  href: string
}

// Razorpay
export interface PaymentOrder {
  orderId: string
  amount: number
  currency: string
  serviceId: string
  userId: string
  customerName: string
  customerEmail: string
}

export interface ExperienceItem {
  role: string
  company: string
  duration: string
  description: string
}

export interface ExperienceContent {
  title?: string
  items: ExperienceItem[]
}