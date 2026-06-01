import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import s from './PlayPage.module.css'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import ShareModal from '../../components/ShareModal/ShareModal'
import { getProject, getProjects, type Project } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'

export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [authorProjects, setAuthorProjects] = useState<Project[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const { toastVisible, toastMessage, toastType, showToast } = useToast()

  useEffect(() => {
    if (!id) return
    getProject(id).then((data) => {
      setProject(data)
      setLikeCount(data.likes)
      // 같은 작성자의 다른 공개 프로젝트 로드
      getProjects().then((all) => {
        setAuthorProjects(all.filter(p => p.authorId === data.authorId && p.id !== data.id))
      }).catch(() => {})
    }).catch(() => {})
  }, [id])

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
          <Link to="/dashboard" className={`${s.btn} ${s.btnGhost}`} style={{ fontSize: 13 }}>{user.avatar} {user.nickname}</Link>
        ) : (
          <Link to="/login" className={`${s.btn} ${s.btnGhost}`} style={{ fontSize: 13 }}>로그인</Link>
        )}
        <Link to={user ? '/editor/new' : '/login'} className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 13 }}>+ 만들기</Link>
      </nav>

      <div className={s.main}>
        {/* LEFT: Stage + Info */}
        <div>
          <div className={s.stageWrapper}>
            <div className={s.stageCanvas}>
              <div className={`${s.cloud} ${s.c1}`}/>
              <div className={`${s.cloud} ${s.c2}`}/>
              <div className={`${s.cloud} ${s.c3}`}/>
              <div className={s.ground}/>
              <div className={s.sprite}>🧇</div>
              <div className={s.speech}>안녕냥~ 🧇</div>
            </div>
            {!isPlaying && (
              <div className={s.playOverlay} onClick={() => setIsPlaying(true)}>
                <div className={s.playBtn}>▶</div>
              </div>
            )}
          </div>

          <div className={s.stageActions}>
            <button
              className={`${s.actionBtn} ${s.abLike} ${isLiked ? s.liked : ''}`}
              onClick={() => {
                setIsLiked(prev => !prev)
                setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
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
            <p className={s.infoDesc}>
              {project?.description || ''}
            </p>
            <div className={s.infoTags}>
              {project?.tags.map((tag, idx) => (
                <span key={idx} className={s.infoTag}>{tag}</span>
              ))}
            </div>
            <div className={s.infoStats}>
              <div className={s.infoStat}><span className={s.infoStatN}>{(project?.likes || 0).toLocaleString()}</span><span className={s.infoStatL}>❤️ 좋아요</span></div>
              <div className={s.infoStat}><span className={s.infoStatN}>{(project?.views || 0).toLocaleString()}</span><span className={s.infoStatL}>👁️ 조회</span></div>
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
                <div className={s.cs}><span className={s.csN}>{(project.likes + authorProjects.reduce((s, p) => s + p.likes, 0)).toLocaleString()}</span><span className={s.csL}>❤️ 좋아요</span></div>
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
