export const EVENT_CATEGORIES = [
  'Tech & AI',
  'Climate & Sustainability',
  'Health & Wellness',
  'Food & Drink',
  'Arts & Culture',
  'Music',
  'Community',
  'Sports',
  'Business & Professional',
  'Education',
  'Others',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]
