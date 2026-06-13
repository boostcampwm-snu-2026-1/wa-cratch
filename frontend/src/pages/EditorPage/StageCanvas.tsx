import { useState, useEffect, type RefObject } from 'react'
import { getSpriteImageExport, SPRITE_LIBRARY } from './spriteRuntime'
import type { SpriteEntity, Background } from './spriteRuntime'
import s from './StageCanvas.module.css'

interface Props {
  entities: SpriteEntity[]
  activeEntityId: string
  selectedBg: Background
  canvasRef: RefObject<HTMLCanvasElement | null>
  onSelectEntity: (id: string) => void
  onAddSprite: (spriteId: string) => void
  onDeleteEntity: (id: string) => void
  onRenameEntity: (id: string, name: string) => void
  onBgChange: (bg: Background) => void
}

const BG_OPTIONS: { key: Background; label: string }[] = [
  { key: 'white', label: '흰색' },
  { key: 'sky', label: '하늘' },
  { key: 'night', label: '밤' },
  { key: 'ocean', label: '바다' },
  { key: 'space', label: '우주' },
  { key: 'forest', label: '숲' },
]

const LIBRARY_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'basic', label: '기본' },
  { key: 'breakout', label: '벽돌깨기' },
  { key: 'platformer', label: '플랫포머' },
  { key: 'shooter', label: '슈팅' },
  { key: 'janggi', label: '장기' },
  { key: 'common', label: '공통' },
] as const

type LibCategory = (typeof LIBRARY_CATEGORIES)[number]['key']

export default function StageCanvas({
  entities,
  activeEntityId,
  selectedBg,
  canvasRef,
  onSelectEntity,
  onAddSprite,
  onDeleteEntity,
  onRenameEntity,
  onBgChange,
}: Props) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libCategory, setLibCategory] = useState<LibCategory>('all')
  const [spriteImgUrls, setSpriteImgUrls] = useState<Record<string, string>>({})
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // 스프라이트 라이브러리 이미지 프리로드
  useEffect(() => {
    const ids = Object.keys(SPRITE_LIBRARY)
    Promise.all(
      ids.map((id) => getSpriteImageExport(id).then((img) => [id, img.src] as const))
    ).then((pairs) => {
      setSpriteImgUrls(Object.fromEntries(pairs))
    })
  }, [])

  const activeEntity = entities.find((e) => e.id === activeEntityId)

  const filteredEntries = Object.entries(SPRITE_LIBRARY).filter(([, entry]) =>
    libCategory === 'all' || entry.category === libCategory
  )

  return (
    <div className={s.stagePanel}>
      <div className={s.stageControls}>
        <span className={s.stageTitle}>🎬 스테이지</span>
        <div className={s.stageBtns}>
          <button className={s.sBtn} title="전체화면">⛶</button>
          <button className={s.sBtn} title="설정">⚙</button>
        </div>
      </div>

      <div className={s.stageCanvasWrap}>
        <canvas
          ref={canvasRef as RefObject<HTMLCanvasElement>}
          width={480}
          height={360}
          className={s.canvas}
        />
      </div>

      <div className={s.stageCoords}>
        <span className={s.coordChip}>x: {Math.round(activeEntity?.state.x ?? 0)}</span>
        <span className={s.coordChip}>y: {Math.round(activeEntity?.state.y ?? 0)}</span>
      </div>

      <div className={s.spriteSection}>
        <div className={s.spriteSectionHeader}>
          <span className={s.spriteSectionTitle}>🐾 스프라이트</span>
          <button className={s.addSprite} title="스프라이트 추가" onClick={() => setLibraryOpen(true)}>+</button>
        </div>
        <div className={s.spriteList}>
          {entities.map((entity) => {
            const entry = SPRITE_LIBRARY[entity.state.spriteId] ?? SPRITE_LIBRARY.cat
            return (
              <div
                key={entity.id}
                className={`${s.spriteThumb} ${entity.id === activeEntityId ? s.active : ''}`}
                onClick={() => onSelectEntity(entity.id)}
              >
                {entities.length > 1 && (
                  <button
                    className={s.deleteThumb}
                    onClick={(e) => { e.stopPropagation(); onDeleteEntity(entity.id) }}
                    title="삭제"
                  >×</button>
                )}
                {spriteImgUrls[entity.state.spriteId]
                  ? <img src={spriteImgUrls[entity.state.spriteId]} className={s.sIcon} alt={entry.name} />
                  : <span className={s.sIcon}>🐾</span>
                }
                {editingNameId === entity.id ? (
                  <input
                    className={s.nameInput}
                    value={editingName}
                    autoFocus
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => { onRenameEntity(entity.id, editingName.trim() || entity.name); setEditingNameId(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { onRenameEntity(entity.id, editingName.trim() || entity.name); setEditingNameId(null) } }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={s.sName}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingNameId(entity.id); setEditingName(entity.name) }}
                  >{entity.name}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className={s.bgSectionHeader}>
          <span className={s.bgSectionTitle}>🖼 배경</span>
        </div>
        <div className={s.bgList}>
          {BG_OPTIONS.map(({ key, label }) => {
            const bgCls = `bg${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof s
            return (
              <div
                key={key}
                className={`${s.bgThumb} ${s[bgCls] ?? ''} ${selectedBg === key ? s.active : ''}`}
                title={label}
                onClick={() => onBgChange(key)}
              />
            )
          })}
        </div>
      </div>

      {/* 스프라이트 라이브러리 모달 */}
      {libraryOpen && (
        <div className={s.libraryOverlay} onClick={() => setLibraryOpen(false)}>
          <div className={s.libraryModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.libraryHeader}>
              <span className={s.libraryTitle}>🎨 스프라이트 선택</span>
              <button className={s.libraryClose} onClick={() => setLibraryOpen(false)}>✕</button>
            </div>
            <div className={s.libraryTabs}>
              {LIBRARY_CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  className={`${s.libraryTab} ${libCategory === key ? s.libraryTabActive : ''}`}
                  onClick={() => setLibCategory(key)}
                >{label}</button>
              ))}
            </div>
            <div className={s.libraryGrid}>
              {filteredEntries.map(([id, entry]) => (
                <button
                  key={id}
                  className={s.libraryItem}
                  onClick={() => { onAddSprite(id); setLibraryOpen(false) }}
                >
                  {spriteImgUrls[id]
                    ? <img src={spriteImgUrls[id]} className={s.libraryImg} alt={entry.name} />
                    : <span className={s.libraryImgPlaceholder}>🐾</span>
                  }
                  <span className={s.libraryItemName}>{entry.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
