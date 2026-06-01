import type * as BlocklyType from 'blockly'

export type Background = 'sky' | 'night' | 'ocean' | 'space' | 'forest'

export interface SpriteState {
  x: number
  y: number
  direction: number
  visible: boolean
  size: number
  speech: string | null
  bg: Background
}

const STAGE_W = 480
const STAGE_H = 360

export function defaultSpriteState(): SpriteState {
  return { x: 0, y: 0, direction: 90, visible: true, size: 100, speech: null, bg: 'sky' }
}

// ── Canvas rendering ──────────────────────────────────────────────

const SPRITE_SVG = `<svg viewBox="-18 -18 306 378" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#E8A818" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#FFC947" stroke-width="16" fill="none" stroke-linecap="round"/>
  <circle cx="222" cy="161" r="16" fill="#FFE090"/><circle cx="222" cy="161" r="9" fill="rgba(255,255,255,.6)"/>
  <ellipse cx="22" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(-12 22 222)"/>
  <ellipse cx="22" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(-12 22 222)"/>
  <circle cx="16" cy="246" r="14" fill="#E8A818"/><circle cx="16" cy="246" r="10" fill="#FFC947"/>
  <ellipse cx="240" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(12 240 222)"/>
  <ellipse cx="240" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(12 240 222)"/>
  <circle cx="246" cy="246" r="14" fill="#E8A818"/><circle cx="246" cy="246" r="10" fill="#FFC947"/>
  <rect x="16" y="60" width="228" height="224" rx="68" fill="#FFC947"/>
  <line x1="16" y1="130" x2="244" y2="130" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <line x1="16" y1="200" x2="244" y2="200" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <line x1="88" y1="60" x2="88" y2="284" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <line x1="172" y1="60" x2="172" y2="284" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <rect x="26" y="70" width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
  <rect x="97" y="70" width="66" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
  <rect x="181" y="70" width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
  <path d="M52,78 C36,52 30,16 64,8 C86,3 108,50 104,68 Z" fill="#E8A818"/>
  <path d="M60,74 C48,54 44,30 64,20 C78,14 98,52 96,68 Z" fill="#FFCB8A" opacity=".9"/>
  <path d="M208,78 C224,52 230,16 196,8 C174,3 152,50 156,68 Z" fill="#E8A818"/>
  <path d="M200,74 C212,54 216,30 196,20 C182,14 162,52 164,68 Z" fill="#FFCB8A" opacity=".9"/>
  <circle cx="90" cy="156" r="11" fill="#1A0A00"/><circle cx="90" cy="156" r="8.5" fill="#2C1208"/>
  <circle cx="170" cy="156" r="11" fill="#1A0A00"/><circle cx="170" cy="156" r="8.5" fill="#2C1208"/>
  <circle cx="130" cy="182" r="9" fill="#D4882A"/><circle cx="133" cy="179" r="3" fill="white" opacity=".6"/>
  <path d="M117 194 Q124 202 130 194 Q136 202 143 194" stroke="#1A0A00" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="90" cy="302" rx="40" ry="23" fill="#E8A818"/><ellipse cx="90" cy="297" rx="34" ry="19" fill="#FFC947"/>
  <circle cx="79" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="90" cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="101" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
  <ellipse cx="170" cy="302" rx="40" ry="23" fill="#E8A818"/><ellipse cx="170" cy="297" rx="34" ry="19" fill="#FFC947"/>
  <circle cx="159" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="170" cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="181" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
</svg>`

let cachedSpriteImage: HTMLImageElement | null = null

export function getSpriteImageExport(): Promise<HTMLImageElement> {
  return getSpriteImage()
}

function getSpriteImage(): Promise<HTMLImageElement> {
  if (cachedSpriteImage) return Promise.resolve(cachedSpriteImage)
  return new Promise((resolve) => {
    const blob = new Blob([SPRITE_SVG], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      cachedSpriteImage = img
      resolve(img)
    }
    img.src = url
  })
}

const BG_DRAWS: Record<Background, (ctx: CanvasRenderingContext2D) => void> = {
  sky: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#87CEEB')
    g.addColorStop(0.6, '#B0E0F8')
    g.addColorStop(0.8, '#98D8C4')
    g.addColorStop(1, '#7BC8A0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    // ground
    const gg = ctx.createLinearGradient(0, STAGE_H * 0.72, 0, STAGE_H)
    gg.addColorStop(0, '#7BC8A0')
    gg.addColorStop(1, '#5DAF84')
    ctx.fillStyle = gg
    ctx.fillRect(0, STAGE_H * 0.72, STAGE_W, STAGE_H)
    // clouds
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    drawCloud(ctx, 80, 65, 80, 28)
    drawCloud(ctx, 350, 45, 60, 22)
    drawCloud(ctx, 260, 100, 50, 18)
  },
  night: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#1a1a2e')
    g.addColorStop(1, '#16213e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    // stars
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137) % STAGE_W)
      const sy = ((i * 97) % (STAGE_H * 0.7))
      const r = i % 3 === 0 ? 2 : 1
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill()
    }
  },
  ocean: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#0077B6')
    g.addColorStop(0.5, '#00B4D8')
    g.addColorStop(1, '#90E0EF')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  },
  space: (ctx) => {
    const g = ctx.createRadialGradient(STAGE_W * 0.3, STAGE_H * 0.4, 0, STAGE_W * 0.5, STAGE_H * 0.5, STAGE_W)
    g.addColorStop(0, '#2d1b69')
    g.addColorStop(1, '#000000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 173) % STAGE_W)
      const sy = ((i * 113) % STAGE_H)
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill()
    }
  },
  forest: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#87CEEB')
    g.addColorStop(0.5, '#228B22')
    g.addColorStop(1, '#006400')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  },
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath()
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.fill()
}

export function renderStage(canvas: HTMLCanvasElement, state: SpriteState, img?: HTMLImageElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // background
  BG_DRAWS[state.bg](ctx)

  if (!state.visible) return

  const spriteW = 72 * (state.size / 100)
  const spriteH = 88 * (state.size / 100)
  const cx = STAGE_W / 2 + state.x
  const cy = STAGE_H / 2 - state.y

  if (img) {
    ctx.save()
    ctx.translate(cx, cy)
    if (state.direction > 180) ctx.scale(-1, 1)
    ctx.drawImage(img, -spriteW / 2, -spriteH / 2, spriteW, spriteH)
    ctx.restore()
  }

  // speech bubble
  if (state.speech) {
    ctx.save()
    ctx.font = 'bold 13px Nunito, sans-serif'
    const padding = 10
    const tw = ctx.measureText(state.speech).width
    const bw = tw + padding * 2
    const bh = 30
    const bx = cx - bw / 2
    const by = cy - spriteH / 2 - bh - 10
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#FFE0D6'
    ctx.lineWidth = 2.5
    roundRect(ctx, bx, by, bw, bh, 10)
    ctx.fill()
    ctx.stroke()
    // tail
    ctx.beginPath()
    ctx.moveTo(cx - 8, by + bh)
    ctx.lineTo(cx + 4, by + bh)
    ctx.lineTo(cx - 4, by + bh + 8)
    ctx.closePath()
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.fillStyle = '#2C1810'
    ctx.fillText(state.speech, bx + padding, by + bh / 2 + 5)
    ctx.restore()
  }

  // coordinate display
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '11px monospace'
  ctx.fillText(`x: ${Math.round(state.x)}  y: ${Math.round(state.y)}`, 8, STAGE_H - 6)
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Execution engine ─────────────────────────────────────────────

type Block = BlocklyType.Block

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export class SpriteRuntime {
  state: SpriteState
  private canvas: HTMLCanvasElement
  private img: HTMLImageElement | null = null
  private keysDown: Set<string> = new Set()
  private stopFlag = false
  private mouseClickHandlers: (() => void)[] = []
  private onStateChange?: (s: SpriteState) => void
  private animRaf: number | null = null

  constructor(canvas: HTMLCanvasElement, initialState: SpriteState, onStateChange?: (s: SpriteState) => void) {
    this.state = { ...initialState }
    this.canvas = canvas
    this.onStateChange = onStateChange
    getSpriteImage().then((img) => {
      this.img = img
      this.render()
    })
  }

  render() {
    renderStage(this.canvas, this.state, this.img ?? undefined)
    this.onStateChange?.({ ...this.state })
  }

  // track keyboard
  attachKeyListeners() {
    const kd = (e: KeyboardEvent) => this.keysDown.add(e.key)
    const ku = (e: KeyboardEvent) => this.keysDown.delete(e.key)
    document.addEventListener('keydown', kd)
    document.addEventListener('keyup', ku)
    return () => {
      document.removeEventListener('keydown', kd)
      document.removeEventListener('keyup', ku)
    }
  }

  stop() {
    this.stopFlag = true
    if (this.animRaf !== null) {
      cancelAnimationFrame(this.animRaf)
      this.animRaf = null
    }
    // remove mouse handlers
    this.mouseClickHandlers.forEach((h) => document.removeEventListener('click', h))
    this.mouseClickHandlers = []
  }

  async run(workspace: BlocklyType.WorkspaceSvg) {
    this.stopFlag = false
    const topBlocks = workspace.getTopBlocks(true) as Block[]

    const promises: Promise<void>[] = []

    const KEY_HAT_MAP: Record<string, string> = {
      wc_key_hat_up: 'ArrowUp',
      wc_key_hat_down: 'ArrowDown',
      wc_key_hat_left: 'ArrowLeft',
      wc_key_hat_right: 'ArrowRight',
      wc_key_hat_space: ' ',
    }

    for (const block of topBlocks) {
      if (block.type === 'wc_start') {
        promises.push(this.executeStack(block.getNextBlock()))
      } else if (block.type in KEY_HAT_MAP) {
        promises.push(this.runKeyHat(KEY_HAT_MAP[block.type], block.getNextBlock()))
      } else if (block.type === 'wc_mouse_click_hat') {
        promises.push(this.runMouseHat(block.getNextBlock()))
      }
    }

    await Promise.allSettled(promises)
  }

  private async runKeyHat(key: string, firstBlock: Block | null) {
    return new Promise<void>((resolve) => {
      const handler = async (e: KeyboardEvent) => {
        if (e.key === key && !this.stopFlag) {
          document.removeEventListener('keydown', handler)
          await this.executeStack(firstBlock)
          resolve()
        }
      }
      if (this.stopFlag) { resolve(); return }
      document.addEventListener('keydown', handler)
    })
  }

  private async runMouseHat(firstBlock: Block | null) {
    return new Promise<void>((resolve) => {
      const handler = async () => {
        if (!this.stopFlag) {
          this.canvas.removeEventListener('click', handler)
          await this.executeStack(firstBlock)
          resolve()
        }
      }
      if (this.stopFlag) { resolve(); return }
      this.canvas.addEventListener('click', handler)
    })
  }

  private async executeStack(block: Block | null) {
    let cur: Block | null = block
    while (cur && !this.stopFlag) {
      await this.executeBlock(cur)
      cur = cur.getNextBlock() as Block | null
    }
  }

  private async executeBlock(block: Block) {
    if (this.stopFlag) return
    switch (block.type) {
      // ── CONTROL ──
      case 'wc_wait': {
        const secs = Number(block.getFieldValue('SECS'))
        await sleep(secs * 1000)
        break
      }
      case 'wc_repeat': {
        const times = Number(block.getFieldValue('TIMES'))
        const inner = block.getInputTargetBlock('DO') as Block | null
        for (let i = 0; i < times && !this.stopFlag; i++) {
          await this.executeStack(inner)
        }
        break
      }
      case 'wc_repeat_until': {
        const inner = block.getInputTargetBlock('DO') as Block | null
        const condBlock = block.getInputTargetBlock('COND') as Block | null
        while (!this.stopFlag) {
          const cond = condBlock ? await this.evalBool(condBlock) : false
          if (cond) break
          await this.executeStack(inner)
          await sleep(0)
        }
        break
      }
      case 'wc_forever': {
        const inner = block.getInputTargetBlock('DO') as Block | null
        while (!this.stopFlag) {
          await this.executeStack(inner)
          await sleep(0)
        }
        break
      }
      case 'wc_if': {
        const condBlock = block.getInputTargetBlock('COND') as Block | null
        const cond = condBlock ? await this.evalBool(condBlock) : false
        if (cond) {
          const inner = block.getInputTargetBlock('DO') as Block | null
          await this.executeStack(inner)
        }
        break
      }
      case 'wc_if_else': {
        const condBlock = block.getInputTargetBlock('COND') as Block | null
        const cond = condBlock ? await this.evalBool(condBlock) : false
        if (cond) {
          await this.executeStack(block.getInputTargetBlock('DO') as Block | null)
        } else {
          await this.executeStack(block.getInputTargetBlock('ELSE') as Block | null)
        }
        break
      }
      case 'wc_stop_all':
        this.stopFlag = true
        break

      // ── MOTION ──
      case 'wc_move_steps': {
        const steps = Number(block.getFieldValue('STEPS'))
        const rad = ((this.state.direction - 90) * Math.PI) / 180
        this.state.x += steps * Math.cos(rad)
        this.state.y += steps * Math.sin(rad)
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_move_dir': {
        const dir = block.getFieldValue('DIR') as string
        const steps = Number(block.getFieldValue('STEPS'))
        const delta: Record<string, [number, number]> = {
          UP: [0, steps], DOWN: [0, -steps], RIGHT: [steps, 0], LEFT: [-steps, 0],
        }
        const [dx, dy] = delta[dir] ?? [0, 0]
        this.state.x += dx
        this.state.y += dy
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_go_to': {
        this.state.x = Number(block.getFieldValue('X'))
        this.state.y = Number(block.getFieldValue('Y'))
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_rotate': {
        this.state.direction = (this.state.direction + Number(block.getFieldValue('DEGREES'))) % 360
        this.render()
        await sleep(16)
        break
      }
      case 'wc_reset_pos': {
        this.state.x = 0
        this.state.y = 0
        this.state.direction = 90
        this.render()
        await sleep(16)
        break
      }
      case 'wc_change_x': {
        this.state.x += Number(block.getFieldValue('DX'))
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_change_y': {
        this.state.y += Number(block.getFieldValue('DY'))
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_set_direction': {
        this.state.direction = Number(block.getFieldValue('DIR'))
        this.render()
        await sleep(16)
        break
      }
      case 'wc_bounce_wall': {
        const maxX = STAGE_W / 2 - 36
        const maxY = STAGE_H / 2 - 44
        if (Math.abs(this.state.x) >= maxX) {
          this.state.direction = 180 - this.state.direction
        }
        if (Math.abs(this.state.y) >= maxY) {
          this.state.direction = -this.state.direction
        }
        this.state.direction = ((this.state.direction % 360) + 360) % 360
        this.render()
        await sleep(16)
        break
      }
      case 'wc_glide_to': {
        const secs = Number(block.getFieldValue('SECS'))
        const targetX = Number(block.getFieldValue('X'))
        const targetY = Number(block.getFieldValue('Y'))
        const startX = this.state.x
        const startY = this.state.y
        const frames = Math.max(1, Math.round(secs * 30))
        for (let i = 1; i <= frames && !this.stopFlag; i++) {
          const t = i / frames
          this.state.x = startX + (targetX - startX) * t
          this.state.y = startY + (targetY - startY) * t
          this.render()
          await sleep(1000 / 30)
        }
        break
      }

      // ── SPEECH ──
      case 'wc_say': {
        this.state.speech = block.getFieldValue('TEXT')
        this.render()
        break
      }
      case 'wc_say_for': {
        this.state.speech = block.getFieldValue('TEXT')
        this.render()
        const secs = Number(block.getFieldValue('SECS'))
        await sleep(secs * 1000)
        this.state.speech = null
        this.render()
        break
      }
      case 'wc_clear_speech': {
        this.state.speech = null
        this.render()
        break
      }

      // ── LOOKS ──
      case 'wc_show':
        this.state.visible = true
        this.render()
        break
      case 'wc_hide':
        this.state.visible = false
        this.render()
        break
      case 'wc_set_size':
        this.state.size = Number(block.getFieldValue('SIZE'))
        this.render()
        break
      case 'wc_change_size':
        this.state.size = Math.max(10, this.state.size + Number(block.getFieldValue('DELTA')))
        this.render()
        break

      // ── SOUND (no-op) ──
      case 'wc_play_sound':
      case 'wc_stop_sound':
        break
    }
  }

  private async evalBool(block: Block): Promise<boolean> {
    if (block.type === 'wc_wall_touching') {
      return this.isTouchingWall()
    }
    if (block.type === 'wc_key_pressed') {
      const key = block.getFieldValue('KEY') as string
      return this.keysDown.has(key)
    }
    return false
  }

  private isTouchingWall(): boolean {
    const spriteW = 36 * (this.state.size / 100)
    const spriteH = 44 * (this.state.size / 100)
    return (
      this.state.x - spriteW < -STAGE_W / 2 ||
      this.state.x + spriteW > STAGE_W / 2 ||
      this.state.y - spriteH < -STAGE_H / 2 ||
      this.state.y + spriteH > STAGE_H / 2
    )
  }

  private clampToWall() {
    const maxX = STAGE_W / 2 - 36
    const maxY = STAGE_H / 2 - 44
    this.state.x = Math.max(-maxX, Math.min(maxX, this.state.x))
    this.state.y = Math.max(-maxY, Math.min(maxY, this.state.y))
  }
}
