import {
  IconHome,
  IconFood,
  IconCar,
  IconDevice,
  IconBank,
  IconDumbbell,
  IconBag,
  IconShield,
  IconPlane,
  IconGift,
  IconTag,
} from './Icon.jsx'

// Maps a category name to an icon component. Components are values, so an
// object can hold them just like strings or numbers.
const CATEGORY_ICONS = {
  Income: IconBank,
  'Housing & Utilities': IconHome,
  'Food & Dining': IconFood,
  Transportation: IconCar,
  'Tech & Media': IconDevice,
  'Health & Wellness': IconDumbbell,
  Shopping: IconBag,
  Insurance: IconShield,
  Travel: IconPlane,
  Gifts: IconGift,
}

// Usage: <CategoryIcon category="Food & Dining" size={18} />
// Any extra props (size, className...) are passed straight to the icon.
function CategoryIcon({ category, ...props }) {
  const Icon = CATEGORY_ICONS[category] || IconTag // unknown category -> generic tag
  return <Icon {...props} />
}

export default CategoryIcon
