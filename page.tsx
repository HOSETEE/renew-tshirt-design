'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Layers, Package, ShoppingCart, BarChart3,
  Brain, Users, Globe, Monitor,
  ArrowRight, Phone,
  CheckCircle, XCircle, Zap, TrendingUp,
  ClipboardList, MapPin, ScanLine,
  CreditCard, Gift, Award, Star,
  RefreshCw, Wifi, Loader2, Barcode,
  User, Crown, ChevronRight, Plus, Minus
} from 'lucide-react'
import SolutionsHeader from '@/components/SolutionsHeader'

// ───────────────────────────────────────────
// Animation helpers
// ───────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
}

const fadeInScale = {
  initial: { opacity: 0, scale: 0.94 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

function scrollToContact() {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

// ───────────────────────────────────────────
// Animated Number Counter
// ───────────────────────────────────────────

function AnimatedCounter({ target, duration = 1500, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ───────────────────────────────────────────
// Prototype A: SKU 爆炸 vs 解耦 互動展示
// ───────────────────────────────────────────

function SkuPrototype() {
  const [action, setAction] = useState<null | 'adding'>(null)
  const [traditionalOps, setTraditionalOps] = useState(0)
  const [hoseteeOps, setHoseteeOps] = useState(0)
  const [done, setDone] = useState(false)

  const simulate = () => {
    if (action === 'adding') return
    setAction('adding')
    setDone(false)
    setTraditionalOps(0)
    setHoseteeOps(0)
    let t = 0
    const interval = setInterval(() => {
      t += 1
      setTraditionalOps(t * 10)
      if (t >= 100) {
        clearInterval(interval)
        setHoseteeOps(1)
        setDone(true)
        setAction(null)
      }
    }, 18)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 w-full max-w-sm mx-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">互動示範：新增一款底衫</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-pantone/5 border border-red-pantone/20 rounded-xl p-3 text-center">
          <p className="text-xs text-red-pantone font-medium mb-1">傳統模式</p>
          <p className="text-2xl font-bold text-red-pantone tabular-nums">{traditionalOps.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">次操作</p>
        </div>
        <div className="bg-cerulean/5 border border-cerulean/20 rounded-xl p-3 text-center">
          <p className="text-xs text-cerulean font-medium mb-1">Hosetee</p>
          <p className="text-2xl font-bold text-cerulean tabular-nums">{hoseteeOps}</p>
          <p className="text-xs text-gray-400 mt-1">次操作</p>
        </div>
      </div>
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-cerulean/10 text-cerulean text-xs font-medium rounded-lg px-3 py-2 mb-3 text-center"
          >
            ✓ 1,000 件作品全部自動上線
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={simulate}
        disabled={action === 'adding'}
        className="w-full flex items-center justify-center gap-2 bg-berkeley-blue text-white text-sm font-medium py-2.5 rounded-xl hover:bg-cerulean transition-colors disabled:opacity-60"
      >
        {action === 'adding' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        {action === 'adding' ? '模擬中...' : '點擊：新增一款底衫'}
      </button>
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype B: 庫存採購建議（含安全庫存視覺化）
// ───────────────────────────────────────────

const INVENTORY_ROWS = [
  { name: '白色 S', current: 3,  safety: 10, preorder: 5, transit: 2 },
  { name: '黑色 M', current: 0,  safety: 10, preorder: 8, transit: 0 },
  { name: '藍色 L', current: 7,  safety: 10, preorder: 0, transit: 3 },
  { name: '灰色 XL',current: 1,  safety: 10, preorder: 3, transit: 0 },
]

// 庫存量視覺化 bar：安全庫存線 + 現有庫存填充
function StockBar({ current, safety, animated }: { current: number; safety: number; animated: boolean }) {
  const MAX_DISPLAY = safety * 1.5
  const pctCurrent = Math.min((current / MAX_DISPLAY) * 100, 100)
  const pctSafety  = Math.min((safety  / MAX_DISPLAY) * 100, 100)
  const isBelowSafety = current < safety

  return (
    <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-visible mt-1">
      {/* Current stock fill */}
      <motion.div
        className={`absolute left-0 top-0 h-full rounded-full ${isBelowSafety ? 'bg-red-pantone/70' : 'bg-cerulean/70'}`}
        initial={{ width: 0 }}
        animate={animated ? { width: `${pctCurrent}%` } : { width: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {/* Safety stock line */}
      <div
        className="absolute top-0 h-full w-0.5 bg-amber-400 z-10"
        style={{ left: `${pctSafety}%` }}
        title={`安全庫存 ${safety}`}
      />
      {/* Safety label */}
      <span
        className="absolute -top-4 text-[9px] text-amber-500 font-bold whitespace-nowrap"
        style={{ left: `${pctSafety}%`, transform: 'translateX(-50%)' }}
      >
        安全 {safety}
      </span>
    </div>
  )
}

function InventoryPrototype() {
  const [step, setStep] = useState<'idle' | 'bars' | 'formula' | 'done'>('idle')
  const [loading, setLoading] = useState(false)

  const getSuggestion = (r: typeof INVENTORY_ROWS[0]) =>
    Math.max(0, r.preorder + r.safety - r.current - r.transit)

  const runAnimation = () => {
    if (step !== 'idle') return
    setLoading(true)
    // Step 1: show bars
    setTimeout(() => { setStep('bars'); setLoading(false) }, 500)
    // Step 2: show formula columns
    setTimeout(() => setStep('formula'), 1400)
    // Step 3: show suggestion
    setTimeout(() => setStep('done'), 2200)
  }

  const reset = () => setStep('idle')

  const showBars    = step !== 'idle'
  const showFormula = step === 'formula' || step === 'done'
  const showResult  = step === 'done'

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 w-full max-w-sm mx-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">庫存採購建議試算</p>

      {/* Formula legend */}
      <AnimatePresence>
        {showFormula && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2 text-[10px] mb-3 bg-gray-50 rounded-xl px-3 py-2"
          >
            <span className="text-amber-500 font-bold">▌安全庫存</span>
            <span className="text-gray-400">+</span>
            <span className="text-orange-400 font-bold">預購欠客</span>
            <span className="text-gray-400">-</span>
            <span className="text-cerulean font-bold">現有庫存</span>
            <span className="text-gray-400">-</span>
            <span className="text-purple-500 font-bold">在途未到</span>
            <span className="text-gray-400">=</span>
            <span className="text-berkeley-blue font-bold">建議採購量</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {INVENTORY_ROWS.map((r, i) => {
          const suggestion = getSuggestion(r)
          const isCritical = r.current === 0
          return (
            <div key={r.name} className={`rounded-xl p-3 border ${isCritical ? 'border-red-pantone/30 bg-red-pantone/5' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-berkeley-blue">{r.name}</span>
                {isCritical && (
                  <span className="text-[10px] bg-red-pantone/10 text-red-pantone font-bold px-2 py-0.5 rounded-full">缺貨</span>
                )}
              </div>

              {/* Stock bar */}
              <div className="pt-4 pb-1">
                <StockBar current={r.current} safety={r.safety} animated={showBars} />
              </div>

              {/* Formula row */}
              <AnimatePresence>
                {showFormula && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-1.5 text-[10px] mt-2 flex-wrap"
                  >
                    <span className="text-amber-500 font-bold">{r.safety}</span>
                    <span className="text-gray-300">+</span>
                    <span className="text-orange-400 font-bold">{r.preorder}</span>
                    <span className="text-gray-300">-</span>
                    <span className="text-cerulean font-bold">{r.current}</span>
                    <span className="text-gray-300">-</span>
                    <span className="text-purple-500 font-bold">{r.transit}</span>
                    <span className="text-gray-300">=</span>
                    <AnimatePresence>
                      {showResult && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, delay: i * 0.1 }}
                          className={`font-black text-sm px-2 py-0.5 rounded-lg ${suggestion > 0 ? 'bg-cerulean text-white' : 'bg-green-100 text-green-600'}`}
                        >
                          {suggestion > 0 ? `採購 ${suggestion}` : '充足'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <button
        onClick={step === 'idle' ? runAnimation : reset}
        disabled={loading || (step !== 'idle' && step !== 'done')}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-berkeley-blue text-white text-sm font-medium py-2.5 rounded-xl hover:bg-cerulean transition-colors disabled:opacity-60"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />分析中...</>
          : step === 'done'
            ? <><RefreshCw className="w-4 h-4" />重新示範</>
            : step !== 'idle'
              ? <><Loader2 className="w-4 h-4 animate-spin" />計算中...</>
              : <><ClipboardList className="w-4 h-4" />一鍵計算採購建議</>
        }
      </button>
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype C: POS 掃碼結帳
// ───────────────────────────────────────────

function PosPrototype() {
  const [items, setItems] = useState<{ name: string; price: number }[]>([])
  const [scanning, setScanning] = useState(false)
  const [checked, setChecked] = useState(false)

  const SCAN_ITEMS = [
    { name: '🎨 膠膜 - 貓咪圖案 (A4)', price: 0 },
    { name: '👕 白色 T-Shirt (M)', price: 590 },
  ]

  const scan = () => {
    if (scanning || items.length > 0) return
    setScanning(true)
    setTimeout(() => {
      setItems([SCAN_ITEMS[0]])
      setTimeout(() => {
        setItems(SCAN_ITEMS)
        setScanning(false)
      }, 500)
    }, 700)
  }

  const reset = () => { setItems([]); setChecked(false) }
  const total = items.reduce((s, i) => s + i.price, 0)

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl p-5 w-full max-w-sm mx-auto text-white">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">POS 收銀端</span>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">● 已連線</span>
      </div>

      <div className="bg-gray-800 rounded-xl min-h-[90px] mb-4 p-3">
        {items.length === 0 && !scanning && (
          <p className="text-gray-500 text-xs text-center mt-4">等待掃碼...</p>
        )}
        {scanning && (
          <div className="flex items-center gap-2 text-cerulean text-xs">
            <Loader2 className="w-3 h-3 animate-spin" /> 讀取中...
          </div>
        )}
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center text-xs py-1.5 border-b border-gray-700 last:border-0"
            >
              <span className="text-gray-200">{item.name}</span>
              <span className={item.price === 0 ? 'text-gray-500' : 'text-white font-bold'}>
                {item.price === 0 ? '含於組合' : `$${item.price}`}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 2 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-600"
          >
            <span>合計</span>
            <span className="text-non-photo-blue">${total}</span>
          </motion.div>
        )}
      </div>

      {!checked ? (
        <div className="flex gap-2">
          <button
            onClick={scan}
            disabled={scanning || items.length > 0}
            className="flex-1 flex items-center justify-center gap-1.5 bg-cerulean text-white text-xs font-medium py-2.5 rounded-xl hover:bg-cerulean/80 transition-colors disabled:opacity-40"
          >
            <Barcode className="w-4 h-4" /> 掃碼
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setChecked(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-medium py-2.5 rounded-xl hover:bg-green-600 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> 結帳
            </button>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <p className="text-green-400 font-bold text-sm mb-2">✓ 結帳完成！庫存已扣減</p>
          <button onClick={reset} className="text-xs text-gray-500 underline">重新示範</button>
        </motion.div>
      )}
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype D: 銷售情報儀表板
// ───────────────────────────────────────────

const CHART_DATA = [
  { month: '1月', revenue: 42, cost: 28 },
  { month: '2月', revenue: 58, cost: 35 },
  { month: '3月', revenue: 73, cost: 40 },
  { month: '4月', revenue: 65, cost: 38 },
  { month: '5月', revenue: 89, cost: 48 },
  { month: '6月', revenue: 95, cost: 50 },
]

function SalesPrototype() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 w-full max-w-sm mx-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">銷售情報儀表板</p>
      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">本月營收</p>
          <p className="text-xl font-bold text-berkeley-blue">$<AnimatedCounter target={95800} duration={1200} /></p>
        </div>
        <div>
          <p className="text-xs text-gray-500">毛利率</p>
          <p className="text-xl font-bold text-cerulean"><AnimatedCounter target={47} duration={1000} />%</p>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {CHART_DATA.map((d, i) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
            <motion.div
              className="w-full bg-cerulean/20 rounded-t"
              initial={{ height: 0 }}
              animate={inView ? { height: `${(d.cost / 100) * 96}px` } : { height: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            />
            <motion.div
              className="w-full bg-cerulean rounded-t"
              style={{ marginTop: 'auto' }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div style={{ height: `${(d.revenue / 100) * 96 - (d.cost / 100) * 96}px` }} className="w-full bg-cerulean rounded-t" />
            </motion.div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 mt-1">
        {CHART_DATA.map(d => (
          <div key={d.month} className="flex-1 text-center text-[10px] text-gray-400">{d.month}</div>
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-cerulean inline-block" />毛利</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-cerulean/20 inline-block" />成本</div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype E: AI 智能報價
// ───────────────────────────────────────────

const AI_QUOTE_LINES = [
  '分析訂單：T-Shirt × 200件...',
  '套用數量折扣階梯...',
  '計算膠膜印製成本...',
  '比對歷史客戶報價...',
  '✓ 報價完成：$58,000（含稅）',
]

function AiQuotePrototype() {
  const [started, setStarted] = useState(false)
  const [lines, setLines] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  const start = () => {
    if (running) return
    setStarted(true)
    setRunning(true)
    setLines([])
    AI_QUOTE_LINES.forEach((line, i) => {
      setTimeout(() => {
        setLines(prev => [...prev, line])
        if (i === AI_QUOTE_LINES.length - 1) setRunning(false)
      }, i * 600)
    })
  }

  const reset = () => { setStarted(false); setLines([]) }

  return (
    <div className="bg-gray-950 rounded-2xl shadow-xl p-5 w-full max-w-sm mx-auto font-mono">
      <p className="text-xs text-gray-500 mb-3">AI 報價引擎</p>
      {!started ? (
        <div className="space-y-2 mb-4">
          {[['商品', 'T-Shirt 客製印刷'], ['數量', '200 件'], ['客戶', '台北品牌商']].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-200">{v}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[90px] mb-4 space-y-1">
          <AnimatePresence>
            {lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs ${line.startsWith('✓') ? 'text-green-400 font-bold text-sm' : 'text-gray-400'}`}
              >
                {!line.startsWith('✓') && <span className="text-cerulean mr-1">{'>'}</span>}
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
          {running && <span className="text-cerulean animate-pulse text-xs">▍</span>}
        </div>
      )}
      {!lines.some(l => l.startsWith('✓')) ? (
        <button
          onClick={start}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 bg-cerulean text-white text-xs font-medium py-2.5 rounded-xl hover:bg-cerulean/80 transition-colors disabled:opacity-60"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {running ? 'AI 分析中...' : '啟動 AI 智能報價'}
        </button>
      ) : (
        <button onClick={reset} className="w-full text-xs text-gray-500 underline py-1">重新示範</button>
      )}
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype F: CRM 會員卡
// ───────────────────────────────────────────

function CrmPrototype() {
  const [points, setPoints] = useState(1240)
  const [credits, setCredits] = useState(320)
  const [tier, setTier] = useState<'silver' | 'gold'>('silver')
  const [buying, setBuying] = useState(false)

  const buy = () => {
    setBuying(true)
    setTimeout(() => {
      setPoints(p => p + 180)
      setCredits(c => c + 45)
      if (points + 180 >= 1350) setTier('gold')
      setBuying(false)
    }, 800)
  }

  const tierConfig = {
    silver: { label: '銀卡會員', color: 'from-gray-400 to-gray-600', icon: Award },
    gold: { label: '金卡會員', color: 'from-yellow-400 to-amber-600', icon: Crown },
  }
  const { label, color, icon: TierIcon } = tierConfig[tier]

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      {/* Card */}
      <motion.div
        animate={{ background: tier === 'gold' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #1d3557, #457b9d)' }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-5 text-white shadow-xl"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-white/60">HOSETEE 會員</p>
            <p className="font-bold text-lg">王小明</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <TierIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{label}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-0.5">購物金</p>
            <p className="text-xl font-bold tabular-nums">${credits}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-0.5">點數</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold tabular-nums">{points.toLocaleString()}</p>
              <span className="text-xs text-white/60">/ 2,000 升鑽</span>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${Math.min((points / 2000) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      <button
        onClick={buy}
        disabled={buying}
        className="w-full flex items-center justify-center gap-2 bg-berkeley-blue text-white text-sm font-medium py-2.5 rounded-xl hover:bg-cerulean transition-colors disabled:opacity-60"
      >
        {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
        {buying ? '結帳中...' : '模擬一筆消費 (+180 點, +$45 購物金)'}
      </button>
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype G: O2O 庫存同步
// ───────────────────────────────────────────

function O2oPrototype() {
  const [webStock, setWebStock] = useState(24)
  const [posStock, setPosStock] = useState(24)
  const [syncing, setSyncing] = useState<'web' | 'pos' | null>(null)

  const webOrder = () => {
    if (syncing) return
    setSyncing('web')
    setWebStock(s => Math.max(0, s - 1))
    setTimeout(() => {
      setPosStock(s => Math.max(0, s - 1))
      setSyncing(null)
    }, 700)
  }

  const posOrder = () => {
    if (syncing) return
    setSyncing('pos')
    setPosStock(s => Math.max(0, s - 1))
    setTimeout(() => {
      setWebStock(s => Math.max(0, s - 1))
      setSyncing(null)
    }, 700)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 w-full max-w-sm mx-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">O2O 即時庫存同步</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: '🌐 線上商城', stock: webStock, onClick: webOrder, side: 'web' as const },
          { label: '🏪 實體 POS', stock: posStock, onClick: posOrder, side: 'pos' as const },
        ].map(c => (
          <div key={c.side} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">{c.label}</p>
            <motion.p
              key={c.stock}
              initial={{ scale: 1.3, color: '#457b9d' }}
              animate={{ scale: 1, color: '#1d3557' }}
              className="text-2xl font-bold text-berkeley-blue tabular-nums mb-2"
            >
              {c.stock}
            </motion.p>
            <button
              onClick={c.onClick}
              disabled={!!syncing || c.stock === 0}
              className="text-xs bg-berkeley-blue text-white px-3 py-1.5 rounded-lg hover:bg-cerulean transition-colors disabled:opacity-40 w-full"
            >
              下單 -1
            </button>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {syncing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-cerulean text-xs bg-cerulean/10 rounded-lg py-2"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            {syncing === 'web' ? '線上訂單 → 同步門市庫存...' : '門市訂單 → 同步線上庫存...'}
          </motion.div>
        )}
        {!syncing && webStock !== 24 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-green-600 text-xs bg-green-50 rounded-lg py-2"
          >
            <CheckCircle className="w-3.5 h-3.5" /> 雙通路庫存已同步
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ───────────────────────────────────────────
// Prototype H: Kiosk 衣服點餐機
// ───────────────────────────────────────────

const KIOSK_COLORS = [
  { name: '白色', hex: '#F8F8F8', border: '#ddd' },
  { name: '黑色', hex: '#1a1a1a', border: '#555' },
  { name: '藍色', hex: '#457b9d', border: '#457b9d' },
  { name: '灰色', hex: '#9ca3af', border: '#9ca3af' },
]
const KIOSK_SIZES = ['XS', 'S', 'M', 'L', 'XL']

function TshirtPreview({ color }: { color: string }) {
  return (
    <div className="relative w-24 h-24 drop-shadow-lg" aria-hidden="true">
      <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="shirtShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>
        <path
          d="M28 18L38 12H58L68 18L80 28L72 40L66 35V80H30V35L24 40L16 28L28 18Z"
          fill={color}
          stroke="#1d3557"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M38 12C40.5 17 43.8 19.5 48 19.5C52.2 19.5 55.5 17 58 12"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M30 36L19 29"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M66 35L77 29"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M34 28H62C62 28 59.5 38 48 38C36.5 38 34 28 34 28Z"
          fill="url(#shirtShine)"
          opacity="0.65"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center -translate-y-1">
        <span className="text-3xl leading-none drop-shadow-sm">🐱</span>
      </div>
    </div>
  )
}

function KioskPrototype() {
  const [color, setColor] = useState(0)
  const [size, setSize] = useState('')
  const [ordered, setOrdered] = useState(false)

  const order = () => {
    if (!size) return
    setOrdered(true)
    setTimeout(() => { setOrdered(false); setSize('') }, 2200)
  }

  return (
    <div className="bg-gray-100 rounded-2xl shadow-xl overflow-hidden w-full max-w-sm mx-auto border-4 border-gray-300">
      {/* Kiosk header */}
      <div className="bg-berkeley-blue text-white px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-bold">HOSETEE Kiosk</span>
        <Monitor className="w-5 h-5 text-white/60" />
      </div>

      <div className="p-5">
        {!ordered ? (
          <>
            {/* Artwork preview */}
            <div className="relative rounded-xl h-36 mb-4 overflow-hidden shadow-inner transition-colors duration-300" style={{ backgroundColor: KIOSK_COLORS[color].hex, border: `2px solid ${KIOSK_COLORS[color].border}` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/30 blur-2xl"
                    animate={{ scale: [0.92, 1.05, 0.92] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <TshirtPreview color={KIOSK_COLORS[color].hex} />
                  </motion.div>
                </div>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-berkeley-blue shadow-sm">
                SVG T-shirt 預覽
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-2">選擇顏色</p>
            <div className="flex gap-2 mb-4">
              {KIOSK_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColor(i)}
                  title={c.name}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: color === i ? '#e63946' : c.border,
                    transform: color === i ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === i ? '0 0 0 2px #e63946' : 'none',
                  }}
                />
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-2">選擇尺寸</p>
            <div className="flex gap-2 mb-5">
              {KIOSK_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${size === s
                    ? 'bg-berkeley-blue text-white border-berkeley-blue'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-cerulean'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={order}
              disabled={!size}
              className="w-full bg-red-pantone text-white font-semibold text-sm py-3 rounded-xl hover:bg-red-pantone/80 transition-colors disabled:opacity-40"
            >
              {size ? `確認點餐 · ${KIOSK_COLORS[color].name} ${size}` : '請選擇尺寸'}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-bold text-berkeley-blue mb-1">點餐完成！</p>
            <p className="text-xs text-gray-500">小白單已自動列印，請至櫃台取件</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────
// Feature section data (B-H with prototypes)
// ───────────────────────────────────────────

const FEATURES_BH = [
  {
    id: 'inventory',
    tag: 'B',
    title: '優越庫存管理系統',
    subtitle: '一鍵完成上千種商品的採購任務',
    painPoint: '手動計算安全庫存、在途採購量、預購欠客數——每次進貨都像一場噩夢。多店多倉更加倍複雜度。',
    solution: '系統自動計算淨需求量，整合安全庫存、在途訂單與預購資料。一鍵產生採購建議單，大幅節省人力。',
    highlights: ['自動採購建議：安全庫存 + 在途採購 + 預購欠客', '多店庫存管理與儲位定位', '盲盤快速盤點系統，杜絕人為作弊'],
    Prototype: InventoryPrototype,
  },
  {
    id: 'pos',
    tag: 'C',
    title: '專業 POS 收銀系統',
    subtitle: 'Film × Blank 完美結帳流程',
    painPoint: '一般 POS 無法處理「膠膜 + 底衫」的雙實體結帳邏輯，收銀員需手動組合計價，容易出錯且速度緩慢。',
    solution: '專為服飾轉印業設計的 POS 系統，掃碼即可自動帶出膠膜與底衫組合、套用價格，一步完成結帳。',
    highlights: ['掃碼即帶出完整商品組合', '支援部分付款與多元金流', '即時庫存扣減，零延遲'],
    Prototype: PosPrototype,
  },
  {
    id: 'sales',
    tag: 'D',
    title: '企業級銷售情報',
    subtitle: '即時掌握營銷成本與獲利狀況',
    painPoint: '銷售資料散落各處，無法即時了解哪些作品、哪個門市、哪段時間的營收與獲利。決策只能憑直覺。',
    solution: '完整的銷售儀表板，從作品、載體、門市、時段等多維度即時呈現營收、成本與毛利分析。',
    highlights: ['多維度營收分析：作品 × 載體 × 門市 × 時段', '即時毛利率追蹤', '自動產生經營報表'],
    Prototype: SalesPrototype,
  },
  {
    id: 'ai',
    tag: 'E',
    title: 'AI 智能報價系統',
    subtitle: '企業訂單快速精準報價',
    painPoint: '企業客戶訂單量大、品項多，人工報價耗時且容易出錯，報價延遲直接影響成交率。',
    solution: 'AI 依據訂單數量、品項組合、客戶歷史自動產生精準報價，縮短回覆時間，提升成交率。',
    highlights: ['秒級自動報價', '智能價格策略建議', '歷史報價追蹤管理'],
    Prototype: AiQuotePrototype,
  },
  {
    id: 'crm',
    tag: 'F',
    title: '會員 CRM 系統',
    subtitle: '購物金 × 點數 × 贈品兌換',
    painPoint: '缺乏會員經營工具，顧客回購率低。紙本集點卡容易遺失，無法追蹤消費行為。',
    solution: '完整的數位會員系統，自動累積購物金與點數、等級升降、贈品兌換，所有交易留下完整稽核軌跡。',
    highlights: ['會員等級自動升降', '點數換贈品系統', '購物金折抵，稽核透明'],
    Prototype: CrmPrototype,
  },
  {
    id: 'ecommerce',
    tag: 'G',
    title: '線上購物網站',
    subtitle: '完美虛實結合 O2O 整合',
    painPoint: '線上線下各自為政——庫存不同步、會員資料不互通、促銷活動無法跨通路。',
    solution: '統一後端架構，線上商城與實體門市共享庫存、會員、訂單、促銷規則，真正實現 O2O 整合。',
    highlights: ['線上線下庫存即時同步', '跨通路會員統一歸戶', '促銷規則全通路適用'],
    Prototype: O2oPrototype,
  },
  {
    id: 'kiosk',
    tag: 'H',
    title: 'Kiosk 點餐機系統',
    subtitle: '全台首創衣服點餐系統',
    painPoint: '實體門市消費者需仰賴店員介紹、翻閱目錄。高峰時段排隊等候，購物體驗不佳。',
    solution: '全台唯一的衣服點餐機——消費者自助瀏覽作品、選擇載體與尺寸、即時預覽效果，大幅優化門市消費體驗。',
    highlights: ['自助式觸控操作，分流排隊人潮', '即時預覽作品上身效果', '自動列印小白單，無縫接軌 POS'],
    Prototype: KioskPrototype,
  },
]

// ───────────────────────────────────────────
// Page Component
// ───────────────────────────────────────────

const FEATURES_BH_placeholder = null // kept for ts

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SolutionsHeader />

      {/* ── Hero Section ── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-br from-berkeley-blue via-cerulean to-non-photo-blue text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              服飾品牌的
              <span className="block text-honeydew mt-2">數位轉型解決方案</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-4 leading-relaxed">
              您的公司有 1,000 件作品嗎？每次上架新款式或下架舊顏色，
              <br className="hidden md:block" />
              都得逐一操作上千支商品？
            </p>
            <p className="text-base md:text-lg text-white/70 mb-10">
              Hosetee 從根本改變遊戲規則——作品與載體解耦，一鍵搞定所有變更。
            </p>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 bg-honeydew text-berkeley-blue font-semibold px-8 py-4 rounded-full text-lg hover:bg-white transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              立即聯繫我們
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Feature A: SKU 爆炸 ── */}
      <section className="py-20 md:py-28 bg-honeydew/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <span className="inline-block bg-berkeley-blue/10 text-berkeley-blue text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">模組 A</span>
            <h2 className="text-3xl md:text-4xl font-bold text-berkeley-blue mb-4">作品×載體智慧管理</h2>
            <p className="text-lg text-cerulean max-w-2xl mx-auto">徹底解決 SKU 爆炸問題</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-6xl mx-auto">
            {/* Left: description */}
            <motion.div className="flex-1" {...fadeInUp}>
              <div className="bg-red-pantone/5 border-l-4 border-red-pantone/40 rounded-r-lg px-5 py-4 mb-6">
                <p className="text-sm font-semibold text-red-pantone mb-1">核心痛點</p>
                <p className="text-gray-600 leading-relaxed">
                  傳統模式：<strong>1,000 件作品 × 5 款載體 × 10 色 × 6 碼 = <span className="text-red-pantone font-mono text-lg">300,000</span> 筆 SKU</strong><br />
                  新增或下架任何一款——都需逐一操作 1,000+ 次，維護成本完全失控。
                </p>
              </div>
              <div className="bg-cerulean/5 border-l-4 border-cerulean/40 rounded-r-lg px-5 py-4 mb-8">
                <p className="text-sm font-semibold text-cerulean mb-1">解決方案</p>
                <p className="text-gray-600 leading-relaxed">
                  作品與載體完全解耦——新增一款底衫，<strong className="text-cerulean">全部作品自動適配</strong>。一鍵完成，永遠可維護。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '傳統操作次數', value: '1,000+', color: 'text-red-pantone' },
                  { label: 'Hosetee 操作次數', value: '1', color: 'text-cerulean' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Right: prototype */}
            <motion.div className="w-full lg:w-auto lg:flex-shrink-0" {...fadeInScale}>
              <SkuPrototype />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features B-H ── */}
      {FEATURES_BH.map((feature, index) => {
        const isEven = index % 2 === 0
        const { Prototype } = feature
        return (
          <section
            key={feature.id}
            className={`py-20 md:py-24 ${isEven ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}>
                {/* Text side */}
                <motion.div className="flex-1" {...fadeInUp}>
                  <span className="inline-block bg-berkeley-blue/10 text-berkeley-blue text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                    模組 {feature.tag}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-berkeley-blue mb-2">{feature.title}</h2>
                  <p className="text-lg text-cerulean font-medium mb-6">{feature.subtitle}</p>

                  <div className="bg-red-pantone/5 border-l-4 border-red-pantone/30 rounded-r-lg px-5 py-4 mb-4">
                    <p className="text-sm font-semibold text-red-pantone mb-1">痛點</p>
                    <p className="text-gray-600">{feature.painPoint}</p>
                  </div>

                  <div className="bg-cerulean/5 border-l-4 border-cerulean/30 rounded-r-lg px-5 py-4 mb-6">
                    <p className="text-sm font-semibold text-cerulean mb-1">解決方案</p>
                    <p className="text-gray-600">{feature.solution}</p>
                  </div>

                  <ul className="space-y-3">
                    {feature.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-3 text-berkeley-blue">
                        <CheckCircle className="w-5 h-5 text-cerulean flex-shrink-0" />
                        <span className="font-medium">{h}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Prototype side */}
                <motion.div className="w-full lg:w-auto lg:flex-shrink-0" {...fadeInScale}>
                  <Prototype />
                </motion.div>
              </div>
            </div>
          </section>
        )
      })}

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-berkeley-blue to-cerulean text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">準備好讓您的服飾品牌升級了嗎？</h2>
            <p className="text-lg text-white/80 mb-8">已有數十家品牌透過 Hosetee 大幅降低營運成本、提升管理效率</p>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 bg-honeydew text-berkeley-blue font-semibold px-8 py-4 rounded-full text-lg hover:bg-white transition-colors duration-300 shadow-lg"
            >
              聯繫我們，了解更多
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="py-20 md:py-28 bg-honeydew">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-berkeley-blue mb-4">立即聯繫我們</h2>
            <p className="text-lg text-gray-600 mb-12">
              無論您是想了解系統功能、預約展示，或是討論客製化需求，歡迎直接來電
            </p>
            <a
              href="tel:0952-918018"
              className="inline-flex items-center gap-3 bg-berkeley-blue text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-cerulean transition-colors duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <Phone className="w-6 h-6" />
              0952-918018
            </a>
            <p className="mt-8 text-gray-500 text-sm">營業時間：週一至週五 09:00 - 18:00</p>
          </motion.div>
        </div>
      </section>

      {/* ── Simplified Footer ── */}
      <footer className="py-8 bg-berkeley-blue text-white/60 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} HOSETEE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
