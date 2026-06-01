// icons.jsx - toate iconitele SVG folosite in aplicatie
// Le-am pus pe toate intr-un singur fisier ca sa nu le caut prin tot proiectul
// Fiecare icon primeste un prop 'size' ca sa pot controla marimea
// IconShell e wrapper-ul comun - il reutilizez la toate pentru a nu repeta codul

// ---- LOGO PRINCIPAL - DOI OMULETI ----
// Reprezinta pe Iulian (stanga) si Laur (dreapta)
// Inima dintre ei arata ca suntem o echipa / duo
// Se afiseaza in sidebar, landing page si login page

export function LailaLogoIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* omulețul din stânga - Iulian */}
      {/* cap */}
      <circle cx="6" cy="6.5" r="2.8" />
      {/* corp - dreptunghi rotunjit care arata ca silueta unui om */}
      <rect x="3" y="10" width="6" height="11.5" rx="3" />

      {/* inimioară între ei doi */}
      <path d="M 12,17.5 C 12,17.5 10,15.2 10,13.8 C 10,12.9 10.7,12.5 11.2,12.9 C 11.5,12.6 12,12.5 12,13.5 C 12,12.5 12.5,12.6 12.8,12.9 C 13.3,12.5 14,12.9 14,13.8 C 14,15.2 12,17.5 12,17.5 Z" />

      {/* omulețul din dreapta - Laur */}
      {/* cap */}
      <circle cx="18" cy="6.5" r="2.8" />
      {/* corp */}
      <rect x="15" y="10" width="6" height="11.5" rx="3" />
    </svg>
  );
}

// ---- WRAPPER COMUN ----
// toate iconitele trec prin el, el pune proprietatile SVG de baza

export function IconShell({ size = 18, children, strokeWidth = 1.9 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ---- ICONITE PENTRU NAVIGARE (sidebar + command palette) ----

export function DashboardIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="3" width="7" height="7" rx="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.7" />
      <rect x="14" y="14" width="7" height="7" rx="1.7" />
    </IconShell>
  );
}

export function AccountsIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M4 6.5 12 3l8 3.5-8 3.5L4 6.5Z" />
      <path d="M4 12.5 12 16l8-3.5" />
      <path d="M4 17.5 12 21l8-3.5" />
    </IconShell>
  );
}

export function TransactionsIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h10" />
      <path d="M7 13h6" />
    </IconShell>
  );
}

export function CashFlowIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M4 19V5" />
      <path d="M9 19v-7" />
      <path d="M14 19v-4" />
      <path d="M19 19V8" />
      <path d="M3 19h18" />
    </IconShell>
  );
}

export function ReportsIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M3 3v18h18" />
      <path d="M7 15l3-4 4 2 4-7" />
      <path d="M18 6h-4" />
      <path d="M18 6v4" />
    </IconShell>
  );
}

export function BudgetIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <path d="M7 6v12" />
      <path d="M17 6v12" />
    </IconShell>
  );
}

export function RecurringIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M17 1.5 21 5.5 17 9.5" />
      <path d="M3 11V9.5a4 4 0 0 1 4-4h14" />
      <path d="M7 22.5 3 18.5 7 14.5" />
      <path d="M21 13v1.5a4 4 0 0 1-4 4H3" />
    </IconShell>
  );
}

export function GoalsIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </IconShell>
  );
}

export function InvestmentsIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </IconShell>
  );
}

export function ForecastingIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
      <path d="M8 17c2.5-2 5.5-2 8 0" />
    </IconShell>
  );
}

export function AdviceIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
      <path d="M12 22a10 10 0 1 0-10-10" />
      <path d="M2 22l2-6" />
    </IconShell>
  );
}

// iconite pentru tipurile de conturi/moduri
export function UserIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M20 21v-2a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19v2" />
      <circle cx="12" cy="7" r="4" />
    </IconShell>
  );
}

export function CoupleIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 20.5l8.8-8.8a5 5 0 0 0 0-7.1Z" />
    </IconShell>
  );
}

export function BusinessIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </IconShell>
  );
}

// ---- ICONITE PENTRU BUTOANE SI ACTIUNI ----

export function PlusIcon({ size = 18 }) {
  return (
    <IconShell size={size} strokeWidth={2.2}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconShell>
  );
}

export function SearchIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </IconShell>
  );
}

export function LogoutIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconShell>
  );
}

export function EditIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </IconShell>
  );
}

export function TrashIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconShell>
  );
}

export function CheckIcon({ size = 16 }) {
  return (
    <IconShell size={size} strokeWidth={2.4}>
      <path d="M20 6 9 17l-5-5" />
    </IconShell>
  );
}

export function AlertIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
    </IconShell>
  );
}

// iconita pentru AI si sugestii (steluta cu scantei)
export function SparkIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
      <path d="M19 15l.8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2.8-2Z" />
    </IconShell>
  );
}

export function CalendarIcon({ size = 18 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </IconShell>
  );
}

// sageata directional - direction poate fi: right, left, up, down
export function ChevronIcon({ size = 16, direction = 'right' }) {
  const rotation = direction === 'down' ? 90 : direction === 'up' ? -90 : direction === 'left' ? 180 : 0;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: `rotate(${rotation}deg)` }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function WalletIconFallback({ size = 18 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M16 12h5" />
      <circle cx="17.5" cy="13.5" r="1" />
      <path d="M6 6V4h12v2" />
    </IconShell>
  );
}

// ---- ICONITE PENTRU CATEGORII DE CHELTUIELI ----

export function FoodIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M4 3v7a2 2 0 0 0 2 2h1v9" />
      <path d="M8 3v18" />
      <path d="M12 3v7a2 2 0 0 0 2 2h1v9" />
      <path d="M20 3v18" />
    </IconShell>
  );
}

export function TransportIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M5 16h14" />
      <path d="M5 16l1.4-6.2A2.4 2.4 0 0 1 8.7 8h6.6a2.4 2.4 0 0 1 2.3 1.8L19 16" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
    </IconShell>
  );
}

export function UtilitiesIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M13 2 5 13h7l-1 9 8-12h-7l1-8Z" />
    </IconShell>
  );
}

export function EntertainmentIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 5v14" />
      <path d="M16 5v14" />
      <path d="M3 10h5" />
      <path d="M16 10h5" />
      <path d="M3 14h5" />
      <path d="M16 14h5" />
    </IconShell>
  );
}

export function HealthIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M22 12h-4l-3 8L9 4l-3 8H2" />
    </IconShell>
  );
}

export function ShoppingIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M6 7h12l-1 14H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </IconShell>
  );
}

// ---- ICONITE PENTRU CATEGORII DE VENITURI ----

export function IncomeIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M12 14v3" />
      <path d="M9.5 15.5H14" />
    </IconShell>
  );
}

export function CodeIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M8 18 2 12l6-6" />
      <path d="M16 6l6 6-6 6" />
    </IconShell>
  );
}

export function GiftIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13" />
      <path d="M3 12h18" />
      <path d="M12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8Z" />
      <path d="M12 8h4.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8Z" />
    </IconShell>
  );
}

// ---- ICONITE PENTRU CATEGORII BUSINESS ----

export function InvoiceIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </IconShell>
  );
}

export function EquipmentIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </IconShell>
  );
}

export function MarketingIcon({ size = 16 }) {
  return (
    <IconShell size={size}>
      <path d="M4 11v2a2 2 0 0 0 2 2h2l8 4V5L8 9H6a2 2 0 0 0-2 2Z" />
      <path d="M18 9a3 3 0 0 1 0 6" />
    </IconShell>
  );
}
