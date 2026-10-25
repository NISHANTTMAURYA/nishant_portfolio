import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Folder from './Folder/Folder.jsx';
import { PROJECTS_DATA } from './projects-data.js';
import './ProjectsFolderApp.css';

export default function ProjectsFolderApp() {
  const [viewMode, setViewMode] = useState('dossier'); // 'dossier' | 'grid'
  const [activeIndex, setActiveIndex] = useState(0);
  const [folderMode, setFolderMode] = useState('flap'); // 'flap' | 'book'
  const [folderVariant, setFolderVariant] = useState('solid'); // 'solid' | 'glass'
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const folderRef = useRef(null);

  // Monitor screen width for responsive folder scaling
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute folder scale dynamically
  const folderScale = useMemo(() => {
    if (screenWidth >= 1200) return 1.45;
    if (screenWidth >= 992) return 1.25;
    if (screenWidth >= 768) return 1.05;
    if (screenWidth >= 480) return 0.85;
    return 0.72;
  }, [screenWidth]);

  const handleSelectProject = (index) => {
    setActiveIndex(index);
    if (folderRef.current) {
      folderRef.current.select(index);
    }
  };

  // Build magnified, complete dossier cards for all 6 projects
  const folderItems = useMemo(() => {
    return PROJECTS_DATA.map((proj, idx) => {
      const isFocused = idx === activeIndex;
      return {
        content: (
          <div
            className={`folder-full-dossier-card ${isFocused ? 'is-focused' : ''}`}
            style={{
              '--card-accent': proj.accent,
              borderColor: isFocused ? proj.accent : '#151616'
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

              {/* Photos Preview for MentorConnect */}
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
                {isFocused ? '✦ Focused in 3D · Click again to minimize' : '✦ Click to magnify in 3D · Drag to move'}
              </span>
            </div>
          </div>
        )
      };
    });
  }, [activeIndex]);

  return (
    <div className="projects-app-container">
      {/* View Switcher: Only Switch Buttons, No Background Card */}
      <div className="projects-toolbar">
        <div className="view-switch-group">
          <button
            type="button"
            className={`view-btn cursor-target ${viewMode === 'dossier' ? 'active' : ''}`}
            onClick={() => setViewMode('dossier')}
          >
            <i className="material-icons">folder_special</i>
            <span>3D Magnified Archive</span>
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

      {/* 3D Magnified Archive Mode (Full-Width Hero Centerpiece) */}
      {viewMode === 'dossier' && (
        <div className="magnified-dossier-wrapper">
          {/* Full-Width 3D Folder Stage */}
          <div className="magnified-folder-stage">
            <div className="folder-interactive-anchor">
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
              />
            </div>

            <div className="stage-interaction-hint">
              <i className="material-icons">touch_app</i>
              <span>Click any card to magnify in 3D & view full dossier · Drag cards freely onto desk</span>
            </div>
          </div>
        </div>
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
