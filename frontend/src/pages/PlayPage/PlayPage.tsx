import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import type * as BlocklyType from 'blockly'
import s from './PlayPage.module.css'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import ShareModal from '../../components/ShareModal/ShareModal'
import { getProject, getProjects, type Project } from '../../api/projects'
import { toggleLike } from '../../api/likes'
import { useAuth } from '../../context/AuthContext'
import { GameEngine, defaultSpriteEntity, migrateProjectData, renderStage, getSpriteImageExport, type SpriteEntity } from '../EditorPage/spriteRuntime'
import { registerBlocks } from '../EditorPage/blockDefs'

registerBlocks()

export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toastVisible, toastMessage, toastType } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [authorProjects, setAuthorProjects] = useState<Project[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const entitiesRef = useRef<SpriteEntity[]>([defaultSpriteEntity()])

  // 초기 캔버스 렌더
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const entity = defaultSpriteEntity()
    getSpriteImageExport('cat').then(img => {
      renderStage(canvas, [entity], new Map([['cat', img]]), 'sky')
    })
  }, [])

  // 프로젝트 로드
  useEffect(() => {
    if (!id) return
    getProject(id).then((data) => {
      setProject(data)
      setLikeCount(data.likes)

      // 같은 작성자 다른 공개 프로젝트
      getProjects().then((all) => {
        setAuthorProjects(all.filter(p => p.authorId === data.authorId && p.id !== data.id))
      }).catch(() => {})

      // Parse multi-sprite format
      const { bg, sprites } = migrateProjectData(data.blocks_json ?? {})
      entitiesRef.current = sprites

      // Render initial preview
      const canvas = canvasRef.current
      if (!canvas) return
      const uniqueIds = [...new Set(sprites.map(e => e.state.spriteId))]
      Promise.all(uniqueIds.map(sid => getSpriteImageExport(sid).then(img => [sid, img] as const)))
        .then(pairs => {
          renderStage(canvas, sprites, new Map(pairs), bg)
        })
    }).catch(() => {})
  }, [id])

  const handlePlay = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    engineRef.current?.stop()
    setIsRunning(true)

    const entities = entitiesRef.current
    void (async () => {
      const Blockly = await import('blockly')
      const wsMap = new Map<string, BlocklyType.WorkspaceSvg>()
      for (const entity of entities) {
        const ws = new Blockly.Workspace() as unknown as BlocklyType.WorkspaceSvg
        if (Object.keys(entity.workspaceData).length > 0) {
          Blockly.serialization.workspaces.load(entity.workspaceData as Parameters<typeof Blockly.serialization.workspaces.load>[0], ws)
        }
        wsMap.set(entity.id, ws)
      }

      const engine = new GameEngine(canvas, [...entities], () => {})
      engineRef.current = engine
      await engine.run(wsMap)
      setIsRunning(false)
    })()
  }, [])

  const handleStop = useCallback(() => {
    engineRef.current?.stop()
    setIsRunning(false)
    // Re-render with original entities
    const canvas = canvasRef.current
    if (!canvas) return
    const entities = entitiesRef.current
    const bg = entities[0]?.state.bg ?? 'sky'
    const uniqueIds = [...new Set(entities.map(e => e.state.spriteId))]
    Promise.all(uniqueIds.map(sid => getSpriteImageExport(sid).then(img => [sid, img] as const)))
      .then(pairs => { renderStage(canvas, entities, new Map(pairs), bg) })
  }, [])

  useEffect(() => {
    return () => { engineRef.current?.stop() }
  }, [])

  return (
    <>
      <nav className={s.nav}>
        <Link to="/explore" className={s.navBack}>← 탐색으로</Link>
        <div className={s.navDiv}/>
        <Link to="/" className={s.navLogo}>
          <div className={s.navLogoIcon}>🧇</div>
          <span className={s.navLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <div className={s.navDiv}/>
        <div>
          <div className={s.navProjectTitle}>{project?.title || ''}</div>
          <div className={s.navAuthor}>by {project?.author || ''}</div>
        </div>
        <div className={s.navSpacer}/>
        {user ? (
          <Link to="/dashboard" className={s.navUser}>
            <span className={s.navUserName}>{user.nickname}</span>
            <div className={s.navUserAvatar}>{user.avatar}</div>
          </Link>
        ) : (
          <Link to="/login" className={`${s.btn} ${s.btnGhost}`} style={{ fontSize: 13 }}>로그인</Link>
        )}
        <Link to={user ? '/editor/new' : '/login'} className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 13 }}>+ 만들기</Link>
      </nav>

      <div className={s.main}>
        {/* LEFT: Stage + Info */}
        <div>
          <div className={s.stageWrapper}>
            <canvas
              ref={canvasRef}
              width={480}
              height={360}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
            {!isRunning && (
              <div className={s.playOverlay} onClick={handlePlay}>
                <div className={s.playBtn}>▶</div>
              </div>
            )}
            {isRunning && (
              <button
                onClick={handleStop}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  fontWeight: 800, fontSize: 13,
                }}
              >
                ⏹ 멈추기
              </button>
            )}
          </div>

          <div className={s.stageActions}>
            <button
              className={`${s.actionBtn} ${s.abLike} ${isLiked ? s.liked : ''}`}
              onClick={async () => {
                const newLiked = !isLiked
                setIsLiked(newLiked)
                setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
                if (id && user) {
                  try {
                    const result = await toggleLike(id)
                    setLikeCount(result.likes)
                    setIsLiked(result.liked)
                  } catch {
                    // revert on failure
                    setIsLiked(!newLiked)
                    setLikeCount(prev => newLiked ? prev - 1 : prev + 1)
                  }
                }
              }}
            >
              {isLiked ? '❤️' : '🤍'} 좋아요 <span className={s.abCount}>{likeCount.toLocaleString()}</span>
            </button>
            <button className={`${s.actionBtn} ${s.abShare}`} onClick={() => setShareOpen(true)}>🔗 공유</button>
            <div className={s.actionSpacer}/>
            <button className={s.fullscreenBtn} title="전체화면">⛶</button>
          </div>

          <div className={s.infoCard}>
            <h1 className={s.infoTitle}>{project?.title || ''} {project?.emoji || ''}</h1>
            <div className={s.authorRow}>
              <div className={s.authorAvatar}>{project?.emoji || '🐱'}</div>
              <div>
                <div className={s.authorName}>{project?.author || ''}</div>
                <div className={s.authorSub}>2026년 5월 작성</div>
              </div>
            </div>
            <p className={s.infoDesc}>{project?.description || ''}</p>
            <div className={s.infoTags}>
              {project?.tags.map((tag, idx) => (
                <span key={idx} className={s.infoTag}>{tag}</span>
              ))}
            </div>
            <div className={s.infoStats}>
              <div className={s.infoStat}><span className={s.infoStatN}>{likeCount.toLocaleString()}</span><span className={s.infoStatL}>❤️ 좋아요</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT: Side panel */}
        <div>
          <div className={s.card}>
            <div className={s.cardTitle}>📋 조작 방법</div>
            <div className={s.cardBody}>
              <span className={s.keyChip}>↑</span> 위로 이동<br/>
              <span className={s.keyChip}>↓</span> 아래로 이동<br/>
              <span className={s.keyChip}>←</span><span className={s.keyChip}>→</span> 좌우 이동<br/>
              <span className={s.keyChip}>Space</span> 점프!
            </div>
          </div>

          {project && (
            <div className={s.creatorCard}>
              <div className={s.creatorRow}>
                <div className={s.creatorAvatar}>{project.emoji}</div>
                <div>
                  <div className={s.creatorName}>{project.author}</div>
                  <div className={s.creatorSub}>작품 {authorProjects.length + 1}개</div>
                </div>
              </div>
              <div className={s.creatorStats}>
                <div className={s.cs}><span className={s.csN}>{authorProjects.length + 1}</span><span className={s.csL}>🎮 작품</span></div>
                <div className={s.cs}><span className={s.csN}>{(project.likes + authorProjects.reduce((acc, p) => acc + p.likes, 0)).toLocaleString()}</span><span className={s.csL}>❤️ 좋아요</span></div>
              </div>
            </div>
          )}

          {authorProjects.length > 0 && (
            <div className={s.card}>
              <div className={s.cardTitle}>🎨 이 친구의 다른 작품</div>
              <div className={s.miniGrid}>
                {authorProjects.slice(0, 4).map((p, i) => (
                  <Link key={p.id} to={`/play/${p.id}`} className={s.miniCard}>
                    <div className={`${s.miniThumb} ${[s.mt1, s.mt2, s.mt3, s.mt4][i % 4]}`}>{p.emoji}</div>
                    <div className={s.miniTitle}>{p.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
      <ShareModal
        isOpen={shareOpen}
        projectId={project?.id || ''}
        projectTitle={project?.title || ''}
        onClose={() => setShareOpen(false)}
      />
    </>
  )
}
