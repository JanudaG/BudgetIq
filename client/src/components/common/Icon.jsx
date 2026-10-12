// Small inline SVG icon set. Each icon is a tiny component that wraps its
// shapes in the shared <Svg> below, so they all get the same size/stroke and
// inherit the surrounding text colour (stroke="currentColor").

function Svg({ children, size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

// ---- Navigation ----
export function IconGrid(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  )
}

export function IconPie(props) {
  return (
    <Svg {...props}>
      <path d="M21 12A9 9 0 1 1 12 3" />
      <path d="M12 3v9h9" />
    </Svg>
  )
}

export function IconReceipt(props) {
  return (
    <Svg {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </Svg>
  )
}

export function IconAnalytics(props) {
  return (
    <Svg {...props}>
      <polyline points="3 17 9 11 13 15 21 7" />
      <path d="M15 7h6v6" />
    </Svg>
  )
}

export function IconCard(props) {
  return (
    <Svg {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  )
}

export function IconSliders(props) {
  return (
    <Svg {...props}>
      <path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </Svg>
  )
}

// ---- Header / actions ----
export function IconSearch(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  )
}

export function IconPlus(props) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

export function IconPlusCircle(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </Svg>
  )
}

export function IconBell(props) {
  return (
    <Svg {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  )
}

export function IconCalendar(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </Svg>
  )
}

export function IconChevronDown(props) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function IconArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function IconTrendUp(props) {
  return (
    <Svg {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </Svg>
  )
}

export function IconBolt(props) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </Svg>
  )
}

// ---- Category icons ----
export function IconHome(props) {
  return (
    <Svg {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </Svg>
  )
}

export function IconFood(props) {
  return (
    <Svg {...props}>
      <path d="M5 2v7a3 3 0 0 0 6 0V2M8 2v20" />
      <path d="M17 2c-2 2-3 4.5-3 8 0 2 1 3 3 3v9" />
    </Svg>
  )
}

export function IconCar(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="10" width="18" height="8" rx="2" />
      <path d="M5 10 7 4h10l2 6" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </Svg>
  )
}

export function IconDevice(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20h8M12 16v4" />
    </Svg>
  )
}

export function IconBank(props) {
  return (
    <Svg {...props}>
      <path d="M3 10 12 3l9 7Z" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M3 21h18" />
    </Svg>
  )
}

export function IconDumbbell(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </Svg>
  )
}

export function IconBag(props) {
  return (
    <Svg {...props}>
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </Svg>
  )
}

export function IconShield(props) {
  return (
    <Svg {...props}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    </Svg>
  )
}

export function IconPlane(props) {
  return (
    <Svg {...props}>
      <path d="M21 3 3 10l7 3 3 7 8-17Z" />
    </Svg>
  )
}

export function IconGift(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M5 12v9h14v-9" />
      <path d="M12 8c-1-3-5-3-5 0s3 0 5 0c2 0 5 3 5 0s-4-3-5 0" />
    </Svg>
  )
}

export function IconTag(props) {
  return (
    <Svg {...props}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </Svg>
  )
}
