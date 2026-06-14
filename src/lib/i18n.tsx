'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { formatMoney } from './format'

export type Locale = 'es' | 'en'

const en = {
  // auth / onboarding
  signin_tagline: 'One shared monthly budget for two. Sign in to keep it private and synced.',
  signin_google: 'Continue with Google',
  signin_footer: 'Free, private, no ads. Your data is yours.',
  onb_title: 'Your shared budget',
  onb_subtitle: 'One monthly budget for two. Create it and invite your partner, or join with their code.',
  onb_create: 'Create',
  onb_join: 'Join',
  onb_name_ph: 'Budget name (e.g. Home)',
  onb_create_btn: 'Create budget',
  onb_code_ph: 'Paste invite code',
  onb_not_found: 'Budget not found. Check the code.',
  onb_join_btn: 'Join budget',
  // nav
  tab_fixed: 'Fixed',
  tab_extras: 'Extras',
  tab_balance: 'Balance',
  tab_savings: 'Savings',
  tab_history: 'History',
  // header
  invite: 'Invite',
  invite_help: 'Share this code with your partner so they can join:',
  copy: 'Copy',
  loading: 'Loading…',
  // fixed
  fixed_paid: 'Fixed paid',
  paid_count: '{n}/{total} paid',
  fixed_not_loaded: "Your fixed expenses aren't loaded for this month yet.",
  fixed_load: "Load this month's fixed expenses",
  fixed_empty: "No fixed expenses yet. Add rent, utilities, subscriptions — they'll repeat every month.",
  add_fixed: 'Add fixed expense',
  new_fixed: 'New fixed expense',
  edit_fixed: 'Edit fixed expense',
  fixed_name_ph: 'Name (e.g. Rent, Internet)',
  // extras
  extras_title: 'Extra expenses',
  extras_empty: 'No extras this month. Add groceries, outings, repairs — anything outside the fixed bills.',
  add_extra: 'Add extra expense',
  new_extra: 'New extra expense',
  add_expense: 'Add expense',
  edit_expense: 'Edit expense',
  extra_name_ph: 'What was it? (e.g. Groceries)',
  // balance
  month_total: 'Month total',
  fair_share: 'of {amount} fair share',
  settle_up: 'To settle up',
  no_expenses: 'No expenses yet this month.',
  all_even: 'Even — nobody owes anything. 🎉',
  paid_amount: 'Paid {amount}',
  pending_amount: '{amount} pending',
  all_paid: 'All paid',
  // savings
  joint_savings: 'Joint savings',
  deposited: 'Deposited {amount}',
  withdrawn: 'Withdrawn {amount}',
  savings_empty: 'No savings yet. Start your shared fund together.',
  withdrawal: 'Withdrawal',
  deposit: 'Deposit',
  add_savings: 'Add to savings',
  savings_title: 'Savings',
  deposit_label: 'Deposit',
  withdraw_label: 'Withdraw',
  savings_note_ph: 'Note (e.g. Vacation fund)',
  deposit_btn: '＋ Deposit',
  withdraw_btn: '－ Withdraw',
  add_to_savings: 'Add to savings',
  // history
  history_title: 'History',
  history_empty: 'No history yet. Closed months will show up here.',
  history_line: '{count} expenses · paid {amount}',
  even: 'even',
  // expense row / sheet
  who_pays: 'Who pays?',
  half_half: '½ Half & half',
  half_half_label: 'Half & half',
  unassigned: 'Unassigned',
  you: 'You',
  paid: 'Paid',
  pending: 'Pending',
  delete: 'Delete',
  cancel: 'Cancel',
  amount: 'Amount',
  name: 'Name',
  save_changes: 'Save changes',
  // categories
  cat_food: 'Food',
  cat_groceries: 'Groceries',
  cat_transport: 'Transport',
  cat_home: 'Home',
  cat_health: 'Health',
  cat_fun: 'Fun',
  cat_shopping: 'Shopping',
  cat_bills: 'Bills',
  cat_other: 'Other',
  // settings
  settings: 'Settings',
  done: 'Done',
  currency: 'Currency',
  currency_ars: 'Argentine peso',
  currency_usd: 'US dollar',
  language: 'Language',
  categories: 'Categories',
  category_name_ph: 'Category name',
}

const es: typeof en = {
  signin_tagline: 'Un presupuesto mensual compartido de a dos. Iniciá sesión para mantenerlo privado y sincronizado.',
  signin_google: 'Continuar con Google',
  signin_footer: 'Gratis, privado, sin anuncios. Tus datos son tuyos.',
  onb_title: 'Su presupuesto compartido',
  onb_subtitle: 'Un presupuesto mensual de a dos. Crealo e invitá a tu pareja, o unite con su código.',
  onb_create: 'Crear',
  onb_join: 'Unirse',
  onb_name_ph: 'Nombre del presupuesto (ej. Casa)',
  onb_create_btn: 'Crear presupuesto',
  onb_code_ph: 'Pegá el código de invitación',
  onb_not_found: 'No se encontró el presupuesto. Revisá el código.',
  onb_join_btn: 'Unirse al presupuesto',
  tab_fixed: 'Fijos',
  tab_extras: 'Extras',
  tab_balance: 'Balance',
  tab_savings: 'Ahorros',
  tab_history: 'Historial',
  invite: 'Invitar',
  invite_help: 'Compartí este código con tu pareja para que se una:',
  copy: 'Copiar',
  loading: 'Cargando…',
  fixed_paid: 'Fijos pagados',
  paid_count: '{n}/{total} pagados',
  fixed_not_loaded: 'Todavía no cargaste los gastos fijos de este mes.',
  fixed_load: 'Cargar los fijos de este mes',
  fixed_empty: 'Aún no hay gastos fijos. Agregá alquiler, servicios, suscripciones — se repiten cada mes.',
  add_fixed: 'Agregar gasto fijo',
  new_fixed: 'Nuevo gasto fijo',
  edit_fixed: 'Editar gasto fijo',
  fixed_name_ph: 'Nombre (ej. Alquiler, Internet)',
  extras_title: 'Gastos extra',
  extras_empty: 'No hay extras este mes. Agregá mercado, salidas, reparaciones — todo fuera de los fijos.',
  add_extra: 'Agregar gasto extra',
  new_extra: 'Nuevo gasto extra',
  add_expense: 'Agregar gasto',
  edit_expense: 'Editar gasto',
  extra_name_ph: '¿Qué fue? (ej. Mercado)',
  month_total: 'Total del mes',
  fair_share: 'de {amount} que te toca',
  settle_up: 'Para emparejar',
  no_expenses: 'Aún no hay gastos este mes.',
  all_even: 'A mano — nadie debe nada. 🎉',
  paid_amount: 'Pagado {amount}',
  pending_amount: '{amount} pendiente',
  all_paid: 'Todo pagado',
  joint_savings: 'Ahorro común',
  deposited: 'Depositado {amount}',
  withdrawn: 'Retirado {amount}',
  savings_empty: 'Aún no hay ahorros. Empiecen su fondo común juntos.',
  withdrawal: 'Retiro',
  deposit: 'Depósito',
  add_savings: 'Agregar al ahorro',
  savings_title: 'Ahorros',
  deposit_label: 'Depósito',
  withdraw_label: 'Retiro',
  savings_note_ph: 'Nota (ej. Fondo vacaciones)',
  deposit_btn: '＋ Depositar',
  withdraw_btn: '－ Retirar',
  add_to_savings: 'Agregar al ahorro',
  history_title: 'Historial',
  history_empty: 'Aún no hay historial. Los meses cerrados aparecerán acá.',
  history_line: '{count} gastos · pagado {amount}',
  even: 'a mano',
  who_pays: '¿Quién paga?',
  half_half: '½ Mitad y mitad',
  half_half_label: 'Mitad y mitad',
  unassigned: 'Sin asignar',
  you: 'Vos',
  paid: 'Pagado',
  pending: 'Pendiente',
  delete: 'Borrar',
  cancel: 'Cancelar',
  amount: 'Monto',
  name: 'Nombre',
  save_changes: 'Guardar cambios',
  cat_food: 'Comida',
  cat_groceries: 'Mercado',
  cat_transport: 'Transporte',
  cat_home: 'Hogar',
  cat_health: 'Salud',
  cat_fun: 'Ocio',
  cat_shopping: 'Compras',
  cat_bills: 'Servicios',
  cat_other: 'Otros',
  settings: 'Ajustes',
  done: 'Listo',
  currency: 'Moneda',
  currency_ars: 'Peso argentino',
  currency_usd: 'Dólar',
  language: 'Idioma',
  categories: 'Categorías',
  category_name_ph: 'Nombre de categoría',
}

const DICT: Record<Locale, typeof en> = { en, es }
export type TKey = keyof typeof en

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => en[key] ?? key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')

  useEffect(() => {
    const saved = localStorage.getItem('locale')
    if (saved === 'es' || saved === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem('locale', next)
    } catch {}
  }

  const t = (key: TKey, vars?: Record<string, string | number>) => {
    let str: string = DICT[locale][key] ?? en[key] ?? key
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        str = str.replace(`{${name}}`, String(value))
      }
    }
    return str
  }

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

const CurrencyContext = createContext<string>('ARS')

export function CurrencyProvider({ value, children }: { value: string; children: ReactNode }) {
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useMoney() {
  const { locale } = useI18n()
  const currency = useContext(CurrencyContext)
  return (cents: number) => formatMoney(cents, currency, locale)
}

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  return (
    <button
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      aria-label="Toggle language"
      className={`rounded-full border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-300 active:bg-white/5 ${className}`}
    >
      {locale === 'es' ? 'ES' : 'EN'}
    </button>
  )
}
