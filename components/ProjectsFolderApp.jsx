import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Folder from './Folder/Folder.jsx';
import CircularCarousel from './CircularCarousel.jsx';
import { PROJECTS_DATA } from './projects-data.js';
import './ProjectsFolderApp.css';

export default function ProjectsFolderApp() {
  const [viewMode, setViewMode] = useState('dossier'); // 'dossier' | 'grid'
  const [activeIndex, setActiveIndex] = useState(0);
  const [folderMode, setFolderMode] = useState('flap'); // 'flap' | 'book'
  const [folderVariant, setFolderVariant] = useState('solid'); // 'solid' | 'glass'
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [hasScrolledNear, setHasScrolledNear] = useState(false);
  const [inspectingProject, setInspectingProject] = useState(null);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const folderRef = useRef(null);
  const carouselRef = useRef(null);

  // Monitor scroll to trigger folder entrance animation when scrolling near the projects section
  useEffect(() => {
    if (hasScrolledNear) return;

    let observer = null;
    let pollInterval = null;

    const checkPosition = () => {
      const target = document.getElementById('projects') || document.getElementById('projects-folder-root');
      if (!target) {
        setHasScrolledNear(true);
        return true;
      }
      const rect = target.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.75 && rect.bottom > 0) {
        setHasScrolledNear(true);
        return true;
      }
      return false;
    };

    if (checkPosition()) return;

    const targetEl = document.getElementById('projects') || document.getElementById('projects-folder-root');
    if (targetEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight * 0.75) {
              setHasScrolledNear(true);
              observer.disconnect();
            }
          });
        },
        { root: null, rootMargin: '0px 0px -20% 0px', threshold: 0.05 }
      );
      observer.observe(targetEl);
    }

    const onScroll = () => {
      if (checkPosition()) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (observer) observer.disconnect();
        if (pollInterval) clearInterval(pollInterval);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    pollInterval = setInterval(() => {
      if (checkPosition()) {
        clearInterval(pollInterval);
        window.removeEventListener('scroll', onScroll);
        if (observer) observer.disconnect();
      }
    }, 250);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (observer) observer.disconnect();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [hasScrolledNear]);

  // Monitor screen width for responsive view switching
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;

  // Compute folder scale dynamically for desktop/tablet view
  const folderScale = useMemo(() => {
    if (screenWidth >= 1200) return 1.45;
    if (screenWidth >= 992) return 1.25;
    return 1.05;
  }, [screenWidth]);

  const handleSelectProject = (index) => {
    setActiveIndex(index);
    if (!isMobile && folderRef.current) {
      if (folderRef.current.setFocus) {
        folderRef.current.setFocus(index);
      } else {
        folderRef.current.select(index);
      }
    } else if (isMobile && carouselRef.current) {
      carouselRef.current.focusIndex?.(index);
    }
  };

  // Helper to render high-fidelity Dossier Card (shared by Folder and CircularCarousel)
  const renderCardJSX = (proj, isCardActive, isForCarousel = false) => (
    <div
      className={`folder-full-dossier-card ${isCardActive ? 'is-focused' : ''}`}
      style={{
        '--card-accent': proj.accent,
        borderColor: isCardActive ? proj.accent : '#151616'
      }}
    >
      {/* Dossier Header Strip */}
      <div className="dossier-strip" style={{ background: proj.accent }}>
        <div className="dossier-strip-left">
          <span className="dossier-file-tag">FILE #{proj.index}</span>
          <span className="dossier-category-tag">{proj.category}</span>
        </div>
        <div className="dossier-strip-badges">
          {proj.badges.map((b, bIdx) => (
            <span key={bIdx} className="dossier-mini-badge">
              {b.text}
            </span>
          ))}
          {!isForCarousel && (
            <button
              type="button"
              className="dossier-card-reset-btn cursor-target"
              title="Reset all cards into folder"
              aria-label="Reset cards"
              onClick={(e) => {
                e.stopPropagation();
                folderRef.current?.reset();
              }}
            >
              <i className="material-icons">refresh</i>
            </button>
          )}
        </div>
      </div>

      {/* Dossier Card Scrollable Content Area */}
      <div className="dossier-card-content">
        {/* Title & Action Links */}
        <div className="dossier-title-section">
          <h3 className="dossier-main-title">
            <a
              href={proj.titleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target"
              onClick={(e) => e.stopPropagation()}
            >
              {proj.title}
            </a>
          </h3>

          <div className="dossier-actions-row">
            {proj.links.map((link, lIdx) => (
              <a
                key={lIdx}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="dossier-action-btn cursor-target"
                data-video={link.dataVideo}
                data-title={link.dataTitle}
                onClick={(e) => {
                  e.stopPropagation();
                  if (link.dataVideo) {
                    e.preventDefault();
                    window.openVideoLightbox?.(link.dataVideo, link.dataTitle || proj.title);
                  }
                }}
              >
                {link.icon && <i className="material-icons">{link.icon}</i>}
                <span>{link.text}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Description Paragraph */}
        <p className="dossier-paragraph">{proj.desc}</p>

        {/* Photos Preview */}
        {proj.thumbs && proj.thumbs.length > 0 && (
          <div className="dossier-photos-block">
            <span className="dossier-photos-label">Photos:</span>
            <div className="dossier-photos-row">
              {proj.thumbs.map((thumb, tIdx) => (
                <div
                  key={tIdx}
                  className="dossier-photo-thumb cursor-target"
                  data-img={thumb.img}
                  data-title={thumb.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.openLightbox?.(thumb.img, thumb.title);
                  }}
                >
                  <img src={thumb.img} alt={thumb.alt} loading="lazy" />
                  <div className="dossier-photo-zoom">
                    <i className="material-icons">zoom_in</i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architectural Highlights */}
        <div className="dossier-bullets-block">
          <div className="dossier-bullets-header">KEY ARCHITECTURAL HIGHLIGHTS</div>
          <ul className="dossier-bullets-list">
            {proj.highlights.map((h, hIdx) => (
              <li key={hIdx}>{h}</li>
            ))}
          </ul>
        </div>

        {/* Tech Stack Tags */}
        <div className="dossier-tech-tags">
          {proj.tech.map((t, tIdx) => (
            <span key={tIdx} className="dossier-tech-tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer Hint */}
      <div className="dossier-card-footer">
        <span className="dossier-footer-hint">
          {isCardActive ? '✦ Focused in 3D · Click again to minimize' : '✦ Click to magnify in 3D · Drag to move'}
        </span>
      </div>
    </div>
  );

  // Mobile 3D Circular Carousel Spotlight Card (Clean Archival Dossier - No Image)
  const renderCarouselCardJSX = (proj, isCardActive) => {
    return (
      <div
        className={`carousel-spotlight-card ${isCardActive ? 'is-active' : ''}`}
        style={{
          '--card-accent': proj.accent
        }}
        onClick={() => {
          if (isCardActive) {
            setInspectingProject(proj);
          }
        }}
      >
        {/* Top Header Strip with Brand Accent */}
        <div className="spotlight-header-strip" style={{ background: proj.accent }}>
          <div className="spotlight-strip-left">
            <span className="spotlight-file-tag">FILE #{proj.index}</span>
            <span className="spotlight-category-tag">{proj.category}</span>
          </div>
          <div className="spotlight-badges">
            {proj.badges.map((b, bIdx) => (
              <span key={bIdx} className="spotlight-status-badge">
                {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div className="spotlight-body">
          <h3 className="spotlight-title">{proj.title}</h3>
          <p className="spotlight-desc">{proj.desc}</p>

          {/* Key Architectural Highlights (clean, concise 3 bullets) */}
          {proj.highlights && proj.highlights.length > 0 && (
            <ul className="spotlight-bullets">
              {proj.highlights.slice(0, 3).map((highlight, hIdx) => (
                <li key={hIdx}>{highlight}</li>
              ))}
            </ul>
          )}

          {/* Key Tech Tags */}
          <div className="spotlight-tech-row">
            {proj.tech.slice(0, 3).map((tag, tIdx) => (
              <span key={tIdx} className="spotlight-tech-pill">
                {tag}
              </span>
            ))}
            {proj.tech.length > 3 && (
              <span className="spotlight-tech-more">+{proj.tech.length - 3}</span>
            )}
          </div>
        </div>

        {/* Card Footer Actions & Click Hint */}
        <div className="spotlight-footer">
          <div className="spotlight-actions">
            {proj.links.slice(0, 2).map((link, lIdx) => (
              <a
                key={lIdx}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="spotlight-btn cursor-target"
                onClick={(e) => {
                  e.stopPropagation();
                  if (link.dataVideo) {
                    e.preventDefault();
                    window.openVideoLightbox?.(link.dataVideo, link.dataTitle || proj.title);
                  }
                }}
              >
                {link.icon && <i className="material-icons">{link.icon}</i>}
                <span>{link.text}</span>
              </a>
            ))}
          </div>

          <span
            className="spotlight-click-hint cursor-target"
            title="Click to view dossier"
            onClick={(e) => {
              e.stopPropagation();
              setInspectingProject(proj);
            }}
          >
            <span>click to view</span>
            <i className="material-icons">arrow_forward</i>
          </span>
        </div>
      </div>
    );
  };

  // Desktop 3D Folder cards arranged in center-out focal hierarchy: [5, 3, 1, 2, 4, 6]
  // Focal center has #01 & #02, flanked symmetrically by #03 & #04, and outer wings #05 & #06
  const desktopProjects = useMemo(() => {
    const DESKTOP_PROJECT_INDICES = [4, 2, 0, 1, 3, 5];
    return DESKTOP_PROJECT_INDICES.map(i => PROJECTS_DATA[i]);
  }, []);

  const folderItems = useMemo(() => {
    return desktopProjects.map((proj, idx) => ({
      content: renderCardJSX(proj, idx === activeIndex, false)
    }));
  }, [activeIndex, desktopProjects]);

  // Phone Circular Carousel items with rich 3D cards (memoized statically)
  const carouselItems = useMemo(() => {
    return PROJECTS_DATA.map((proj) => ({
      id: proj.id,
      index: proj.index,
      title: proj.title,
      subtitle: proj.category,
      alt: proj.title,
      accent: proj.accent,
      src: proj.thumbs?.[0]?.img || './images/mentorconnect1.jpg',
      card: (isActive) => renderCarouselCardJSX(proj, isActive)
    }));
  }, []);

  return (
    <div className="projects-folder-app-container">
      {/* Top Header Switcher Controls */}
      <div className="projects-stage-header">
        <div className="view-toggle-pills" role="tablist" aria-label="Projects view mode">
          <button
            type="button"
            className={`view-btn cursor-target ${viewMode === 'dossier' ? 'active' : ''}`}
            onClick={() => setViewMode('dossier')}
          >
            <i className="material-icons">{isMobile ? 'view_carousel' : 'folder_special'}</i>
            <span>{isMobile ? '3D Circular Carousel' : '3D Magnified Archive'}</span>
          </button>
          <button
            type="button"
            className={`view-btn cursor-target ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <i className="material-icons">grid_view</i>
            <span>All Projects Grid</span>
          </button>
        </div>
      </div>

      {/* 3D Archive View Mode */}
      {viewMode === 'dossier' && (
        <>
          {/* Desktop / Tablet View (≥ 768px): 3D Magnified Archive Folder */}
          {!isMobile ? (
            <div className="magnified-dossier-wrapper">
              <div className="magnified-folder-stage">
                <div
                  className="folder-interactive-anchor"
                  style={{ minHeight: `${folderScale * 350}px` }}
                >
                  {hasScrolledNear && (
                    <Folder
                      ref={folderRef}
                      label="PROJECTS"
                      items={folderItems}
                      mode={folderMode}
                      variant={folderVariant}
                      color="#705cf6"
                      paperColor="#FCF9F3"
                      tabPosition="right"
                      layout="spread"
                      size={folderScale}
                      open={isFolderOpen}
                      onOpenChange={setIsFolderOpen}
                      onItemClick={(item, index) => {
                        setActiveIndex(index);
                      }}
                      draggable={true}
                      zoomOnClick={true}
                      peek={true}
                      tilt={0.65}
                      bounce={0.4}
                      frost={0.3}
                      closeOnOutsideClick={false}
                    />
                  )}
                </div>

                <div className="stage-interaction-hint">
                  <i className="material-icons">touch_app</i>
                  <span>
                    {isFolderOpen
                      ? 'Click any card to magnify in 3D · Drag cards freely onto desk'
                      : 'Click folder to open & explore projects · Drag cards freely onto desk'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Phone View (< 768px): 3D Circular Cylinder Carousel with Cards */
            <div className="mobile-circular-dossier-wrapper">
              <div className="mobile-carousel-container">
                <CircularCarousel
                  items={carouselItems}
                  preset="cylinder"
                  cardWidth={245}
                  aspectRatio={0.88}
                  gap={20}
                  tilt={-5}
                  perspective={2200}
                  fitMode="height"
                  zoom={0.92}
                  depthFade={0.25}
                  fadeColor="transparent"
                  innerShade={0.15}
                  backfaces={true}
                  cornerRadius={14}
                  captions={false}
                  autoplay="off"
                  onChange={(index) => {
                    setActiveIndex(typeof index === 'number' ? index : 0);
                  }}
                  onItemClick={(item, index) => {
                    const idx = typeof index === 'number' ? index : 0;
                    setActiveIndex(idx);
                    if (PROJECTS_DATA[idx]) {
                      setInspectingProject(PROJECTS_DATA[idx]);
                    }
                  }}
                />
              </div>

              {/* Bottom Sheet Modal for Detailed Project Dossier */}
              {inspectingProject && (
                <div
                  className="mobile-dossier-modal-overlay"
                  onClick={() => setInspectingProject(null)}
                >
                  <div
                    className="mobile-dossier-modal-card"
                    onClick={(e) => e.stopPropagation()}
                    style={{ '--modal-accent': inspectingProject.accent }}
                  >
                    {/* Modal Header */}
                    <div
                      className="dossier-modal-header"
                      style={{ background: inspectingProject.accent }}
                    >
                      <div className="dossier-modal-header-left">
                        <span className="dossier-file-tag">FILE #{inspectingProject.index}</span>
                        <span className="dossier-category-tag">{inspectingProject.category}</span>
                      </div>
                      <button
                        type="button"
                        className="dossier-modal-close-btn cursor-target"
                        aria-label="Close dossier"
                        onClick={() => setInspectingProject(null)}
                      >
                        <i className="material-icons">close</i>
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="dossier-modal-content">
                      <div className="dossier-modal-badges">
                        {inspectingProject.badges.map((b, bIdx) => (
                          <span key={bIdx} className={b.className}>
                            {b.text}
                          </span>
                        ))}
                      </div>

                      <h2 className="dossier-modal-title">
                        <a
                          href={inspectingProject.titleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-target"
                        >
                          {inspectingProject.title}
                        </a>
                      </h2>

                      {/* Modal Action Links */}
                      <div className="dossier-modal-links">
                        {inspectingProject.links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            className="dossier-action-btn cursor-target"
                            onClick={(e) => {
                              if (link.dataVideo) {
                                e.preventDefault();
                                window.openVideoLightbox?.(
                                  link.dataVideo,
                                  link.dataTitle || inspectingProject.title
                                );
                              }
                            }}
                          >
                            {link.icon && <i className="material-icons">{link.icon}</i>}
                            <span>{link.text}</span>
                          </a>
                        ))}
                      </div>

                      <p className="dossier-modal-desc">{inspectingProject.desc}</p>

                      {/* Photo Gallery if present */}
                      {inspectingProject.thumbs && inspectingProject.thumbs.length > 0 && (
                        <div className="dossier-modal-gallery">
                          <span className="dossier-modal-gallery-title">Archival Evidence & Photos:</span>
                          <div className="dossier-modal-thumbs-row">
                            {inspectingProject.thumbs.map((thumb, tIdx) => (
                              <div
                                key={tIdx}
                                className="dossier-modal-thumb cursor-target"
                                title={thumb.title}
                                onClick={() => window.openLightbox?.(thumb.img, thumb.title)}
                              >
                                <img src={thumb.img} alt={thumb.alt} loading="lazy" />
                                <div className="dossier-modal-zoom">
                                  <i className="material-icons">zoom_in</i>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Highlights */}
                      <div className="dossier-modal-highlights">
                        <h4>KEY ARCHITECTURAL HIGHLIGHTS</h4>
                        <ul>
                          {inspectingProject.highlights.map((h, hIdx) => (
                            <li key={hIdx}>{h}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech Stack */}
                      <div className="dossier-modal-tech">
                        {inspectingProject.tech.map((tag, tIdx) => (
                          <span key={tIdx} className="tech-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Grid View Mode: Complete 6-card grid with exact portfolio layout */}
      {viewMode === 'grid' && (
        <div className="projects">
          {PROJECTS_DATA.map(project => (
            <div key={project.id} className="timeline-item project-card cursor-target">
              <div className="project-card-top">
                <div className="project-badges">
                  {project.badges.map((b, i) => (
                    <span key={i} className={b.className}>
                      {b.text}
                    </span>
                  ))}
                </div>
                <h3>
                  <a href={project.titleLink} target="_blank" rel="noopener noreferrer">
                    {project.title}
                  </a>
                </h3>
                <div className="project-links">
                  {project.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className={link.className}
                      data-video={link.dataVideo}
                      data-title={link.dataTitle}
                      onClick={e => {
                        if (link.dataVideo) {
                          e.preventDefault();
                          window.openVideoLightbox?.(link.dataVideo, link.dataTitle || project.title);
                        }
                      }}
                    >
                      {link.icon && <i className="material-icons">{link.icon}</i>}
                      <span>{link.text}</span>
                    </a>
                  ))}
                </div>
              </div>

              <p>{project.desc}</p>

              {project.thumbs && project.thumbs.length > 0 && (
                <div className="project-thumb-preview">
                  <span className="project-thumb-preview-label">Photos:</span>
                  {project.thumbs.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="project-thumb-item cursor-target"
                      data-img={thumb.img}
                      data-title={thumb.title}
                      onClick={() => window.openLightbox?.(thumb.img, thumb.title)}
                    >
                      <img src={thumb.img} alt={thumb.alt} loading="lazy" />
                      <div className="thumb-overlay">
                        <i className="material-icons">zoom_in</i>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ul className="project-highlights">
                {project.highlights.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>

              <div className="tech-stack">
                {project.tech.map((tag, idx) => (
                  <span key={idx} className="tech-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Auto mount if container exists in DOM
if (typeof document !== 'undefined') {
  const mountApp = () => {
    const rootEl = document.getElementById('projects-folder-root');
    if (rootEl && !rootEl.dataset.mounted) {
      rootEl.dataset.mounted = 'true';
      const root = ReactDOM.createRoot(rootEl);
      root.render(<ProjectsFolderApp />);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    mountApp();
  }
}
