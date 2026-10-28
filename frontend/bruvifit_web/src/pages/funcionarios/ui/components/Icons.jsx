
const shapes = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  box: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/></>,
  stock: <><rect x="3" y="8" width="8" height="8" rx="2"/><rect x="13" y="8" width="8" height="8" rx="2"/><rect x="8" y="2" width="8" height="8" rx="2"/><path d="M7 12h2m8 0h2m-8-6h2"/></>,
  sale: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 5V3h8v2M8 11c0 5 8 5 8 0"/></>,
  users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  truck: <><path d="M3 5h11v13H3zM14 9h4l3 4v5h-7"/><circle cx="7.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></>,
  wallet: <><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 9V5a2 2 0 0 1 2-2h13M16 14h5M17.5 14h.01"/></>,
  chart: <><path d="M3 21V14l5-5 4 3 8-9M3 21h19M8 14v7m5-5v5m5-12v12"/></>,
  id: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 4V2m8 2V2M3 9h18"/><circle cx="12" cy="13" r="2"/><path d="M8 19c.3-2.5 7.7-2.5 8 0"/></>,
  settings: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.9l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.9-.34l-1.01.42v2.2h-2.7v-2.2l-1.01-.42a1.7 1.7 0 0 0-1.9.34l-.06.06-1.9-1.9.06-.06a1.7 1.7 0 0 0 .34-1.9l-.42-1.01H5v-2.7h2.2l.42-1.01a1.7 1.7 0 0 0-.34-1.9l-.06-.06 1.9-1.9.06.06a1.7 1.7 0 0 0 1.9.34l1.01-.42V4h2.7v2.2l1.01.42a1.7 1.7 0 0 0 1.9-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 0 0-.34 1.9l.42 1.01H22v2.7h-2.2Z" transform="translate(-.9 -.5) scale(.98)"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  pencil: <><path d="m4 16-1 5 5-1L20 8l-4-4L4 16Z"/><path d="m14 6 4 4"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  alert: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></>,
  inbox: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/></>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  left: <path d="m14 6-6 6 6 6M9 12h11"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="M6 6l12 12M18 6 6 18"/>,
};
export default function Icon({ name, size = 19, strokeWidth = 1.8, ...rest }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{shapes[name] ?? shapes.info}</svg>;
}
