import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Folder,
  Volume2,
  Sliders,
  Film,
  Scissors,
  Magnet,
  Link2,
  Bookmark,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  Eye,
  Lock,
  Music,
  Video,
  Sparkles,
  SendHorizontal
} from 'lucide-react';

export const ResolveEditorMockup: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'pool' | 'effects'>('pool');
  const [selectedClip, setSelectedClip] = useState<string>('A002_CloseUp_Take3');
  const [playheadPos, setPlayheadPos] = useState<number>(44); // percentage across timeline

  // Advance playhead smoothly when in play mode
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setPlayheadPos((prev) => (prev >= 96 ? 10 : prev + 1));
    }, 120);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div
      style={{
        maxWidth: '1180px',
        margin: '0 auto',
        backgroundColor: '#121213',
        border: '1px solid #2B2C30',
        borderRadius: '8px',
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'var(--font-sans)',
      }}
      className="resolve-editor-container"
    >
      {/* ====================================================================
          1. TOP WINDOW BAR (Davinci Studio Session & Status)
          ==================================================================== */}
      <div
        style={{
          height: '34px',
          backgroundColor: '#18181B',
          borderBottom: '1px solid #28292D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.85rem',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#8E8F94',
        }}
      >
        {/* Left window control dots & project label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
            <span style={{ color: '#E4E4E7', fontWeight: 600 }}>DaVinci Resolve Studio 19</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span style={{ color: '#A1A1AA' }}>ShortFilm_Hero_Edit_Master.drp</span>
          </div>
        </div>

        {/* Center Workspace Mode Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#131315',
            borderRadius: '4px',
            padding: '2px',
            border: '1px solid #26272B',
            fontSize: '10.5px',
          }}
          className="workspace-toggle-tabs"
        >
          <button
            type="button"
            onClick={() => setActiveMediaTab('pool')}
            style={{
              padding: '2px 8px',
              borderRadius: '3px',
              backgroundColor: activeMediaTab === 'pool' ? '#26272B' : 'transparent',
              color: activeMediaTab === 'pool' ? '#F4F4F5' : '#8E8F94',
              cursor: 'pointer',
              border: 'none',
              fontWeight: activeMediaTab === 'pool' ? 600 : 400,
            }}
          >
            Media Pool
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab('effects')}
            style={{
              padding: '2px 8px',
              borderRadius: '3px',
              backgroundColor: activeMediaTab === 'effects' ? '#26272B' : 'transparent',
              color: activeMediaTab === 'effects' ? '#F4F4F5' : '#8E8F94',
              cursor: 'pointer',
              border: 'none',
              fontWeight: activeMediaTab === 'effects' ? 600 : 400,
            }}
          >
            Effects Library
          </button>
        </div>

        {/* Right Info: Color Space & Timecode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#71717A', fontSize: '10px' }}>DaVinci YRGB Color Managed</span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#111113',
              padding: '2px 8px',
              borderRadius: '3px',
              border: '1px solid #2B2C30',
              color: '#F43F5E',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F43F5E' }} />
            <span>01:00:14:18</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MAIN TOP WORKSPACE (Media Pool / Bin Tree + Viewer Monitor + Inspector)
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 220px',
          height: '320px',
          backgroundColor: '#151517',
          borderBottom: '1px solid #26272A',
        }}
        className="editor-top-grid"
      >
        {/* LEFT COLUMN: MEDIA POOL & BINS */}
        <div
          style={{
            borderRight: '1px solid #26272A',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141416',
          }}
          className="media-pool-panel"
        >
          {/* Bin Header */}
          <div
            style={{
              height: '28px',
              backgroundColor: '#1A1A1D',
              borderBottom: '1px solid #26272A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.65rem',
              fontSize: '10.5px',
              color: '#9CA3AF',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FolderOpen size={12} style={{ color: '#E53935' }} />
              <span style={{ color: '#E4E4E7', fontWeight: 600 }}>Master Bins</span>
            </div>
            <span>4 Bins</span>
          </div>

          {/* Bin Tree */}
          <div
            style={{
              padding: '0.4rem',
              borderBottom: '1px solid #222326',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {[
              { name: '01_A-Roll_Footage', count: '8 clips', active: true },
              { name: '02_B-Roll_Cinematic', count: '14 clips', active: false },
              { name: '03_Audio_Stems_Sync', count: '6 files', active: false },
              { name: '04_VFX_Fusion_Plates', count: '3 comps', active: false },
            ].map((bin) => (
              <div
                key={bin.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: bin.active ? '#202125' : 'transparent',
                  color: bin.active ? '#F4F4F5' : '#9CA3AF',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Folder size={11} style={{ color: bin.active ? '#38BDF8' : '#71717A' }} />
                  <span>{bin.name}</span>
                </div>
                <span style={{ fontSize: '9px', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{bin.count}</span>
              </div>
            ))}
          </div>

          {/* Clip List with Thumbnails */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            {[
              { id: 'A001_Wide_Establishing', type: '4K BRAW', fps: '24.00', dur: '00:03:12', tag: '#2563EB' },
              { id: 'A002_CloseUp_Take3', type: '4K BRAW', fps: '24.00', dur: '00:01:45', tag: '#38BDF8' },
              { id: 'B012_Drone_Sunset_Pass', type: 'ProRes 422', fps: '60.00', dur: '00:00:54', tag: '#F97316' },
              { id: 'DX_Dialogue_Master_96k', type: 'WAV 24b', fps: 'Audio', dur: '00:04:20', tag: '#10B981' },
            ].map((clip) => {
              const isSelected = selectedClip === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 6px',
                    borderRadius: '3px',
                    backgroundColor: isSelected ? '#1E232B' : '#18181A',
                    border: `1px solid ${isSelected ? '#38BDF8' : '#222326'}`,
                    cursor: 'pointer',
                    transition: 'background-color 100ms',
                  }}
                >
                  {/* Clip Color Swatch */}
                  <div
                    style={{
                      width: '4px',
                      height: '24px',
                      borderRadius: '1px',
                      backgroundColor: clip.tag,
                    }}
                  />

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        color: isSelected ? '#38BDF8' : '#E4E4E7',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {clip.id}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: '#71717A',
                      }}
                    >
                      <span>{clip.type}</span>
                      <span>•</span>
                      <span>{clip.fps}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#9CA3AF' }}>
                    {clip.dur}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: TIMELINE VIEWER / PROGRAM MONITOR */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0E0E10',
            position: 'relative',
          }}
        >
          {/* Monitor Top Status Bar */}
          <div
            style={{
              height: '28px',
              backgroundColor: '#18181B',
              borderBottom: '1px solid #242528',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.85rem',
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: '#8E8F94',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#F4F4F5', fontWeight: 600 }}>Timeline 1 (Single Viewer)</span>
              <span style={{ color: '#52525B' }}>|</span>
              <span>3840x2160 UHD • 24.00 fps</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ color: '#10B981', fontSize: '9.5px', backgroundColor: '#064E3B', padding: '1px 5px', borderRadius: '2px' }}>
                FULL 100%
              </span>
              <Maximize2 size={11} style={{ color: '#71717A', cursor: 'pointer' }} />
            </div>
          </div>

          {/* The Live Video Canvas Screen (Realistic Cinematic Post-Production Frame) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#080809',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Cinematic 16:9 Video Aspect Canvas */}
            <div
              style={{
                width: '88%',
                height: '84%',
                backgroundColor: '#0F1217',
                position: 'relative',
                boxShadow: '0 0 35px rgba(0, 0, 0, 0.9)',
                border: '1px solid #23252A',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Cinematic Simulated Shot: Dark Anamorphic Studio Grading */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 40% 40%, rgba(245, 158, 11, 0.25) 0%, rgba(229, 57, 53, 0.15) 30%, rgba(14, 165, 233, 0.15) 60%, #080A0E 90%)',
                }}
              />

              {/* Anamorphic Blue Horizontal Flare Streak */}
              <div
                style={{
                  position: 'absolute',
                  top: '38%',
                  left: '-10%',
                  width: '120%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.7) 40%, #ffffff 50%, rgba(56, 189, 248, 0.7) 60%, transparent 100%)',
                  filter: 'blur(1px)',
                  opacity: 0.85,
                }}
              />

              {/* Simulated Camera Subject Silhouette / Crosshairs */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '4px', height: '4px', backgroundColor: '#EF4444', borderRadius: '50%' }} />
                <span style={{ position: 'absolute', top: '-14px', fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'rgba(255, 255, 255, 0.6)' }}>
                  AF TRACK [L-EYE]
                </span>
              </div>

              {/* Safe Title & Safe Action Border Lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: '8%',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  pointerEvents: 'none',
                }}
              />

              {/* Monitor HUD Overlay Tags */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: 'rgba(243, 243, 240, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span>ISO 800 • T2.0 • 180.0° SHUTTER</span>
                <span style={{ color: '#F59E0B' }}>BLACKMAGIC RAW 5:1</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: '#10B981',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                REC.709 SCENE • CALIBRATED
              </div>
            </div>
          </div>

          {/* Monitor Transport Toolbar (In, Out, Step, Play, Loop, Timecode) */}
          <div
            style={{
              height: '36px',
              backgroundColor: '#18181B',
              borderTop: '1px solid #242528',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.85rem',
            }}
          >
            {/* Left Transport controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                title="Mark In ([)"
                style={{
                  padding: '4px 6px',
                  backgroundColor: '#202125',
                  border: '1px solid #2A2B2E',
                  borderRadius: '3px',
                  color: '#9CA3AF',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                [ In
              </button>
              <button
                type="button"
                title="Mark Out (])"
                style={{
                  padding: '4px 6px',
                  backgroundColor: '#202125',
                  border: '1px solid #2A2B2E',
                  borderRadius: '3px',
                  color: '#9CA3AF',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                Out ]
              </button>

              <div style={{ width: '1px', height: '16px', backgroundColor: '#2B2C30', margin: '0 4px' }} />

              <button
                type="button"
                title="Step Back 1 Frame (Left Arrow)"
                style={{
                  padding: '4px 6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#A1A1AA',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                title={isPlaying ? 'Pause (Space)' : 'Play Forward (Space / L)'}
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  padding: '5px 12px',
                  backgroundColor: isPlaying ? '#E53935' : '#27272A',
                  border: `1px solid ${isPlaying ? '#EF4444' : '#3F3F46'}`,
                  borderRadius: '3px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  transition: 'all 120ms',
                }}
              >
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                type="button"
                title="Step Forward 1 Frame (Right Arrow)"
                style={{
                  padding: '4px 6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#A1A1AA',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Center Scrubber Bar / In-Out Region readout */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                color: '#71717A',
                display: 'flex',
                gap: '8px',
              }}
              className="monitor-timecode-readout"
            >
              <span>IN: <strong style={{ color: '#D4D4D8' }}>01:00:08:12</strong></span>
              <span>OUT: <strong style={{ color: '#D4D4D8' }}>01:00:22:04</strong></span>
              <span>DUR: <strong style={{ color: '#F43F5E' }}>00:00:13:16</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR PANEL */}
        <div
          style={{
            borderLeft: '1px solid #26272A',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#141416',
          }}
          className="inspector-panel"
        >
          {/* Inspector Header */}
          <div
            style={{
              height: '28px',
              backgroundColor: '#1A1A1D',
              borderBottom: '1px solid #26272A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.65rem',
              fontSize: '10.5px',
              color: '#9CA3AF',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: '#F4F4F5', fontWeight: 600 }}>Inspector</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ color: '#E53935', fontWeight: 600 }}>Video</span>
              <span style={{ color: '#52525B' }}>Audio</span>
            </div>
          </div>

          {/* Inspector Attributes */}
          <div
            style={{
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#A1A1AA',
            }}
          >
            <div style={{ paddingBottom: '0.4rem', borderBottom: '1px solid #222326' }}>
              <div style={{ color: '#E4E4E7', fontWeight: 600, marginBottom: '4px' }}>TRANSFORM</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <div style={{ backgroundColor: '#1A1A1D', padding: '3px 6px', borderRadius: '2px', border: '1px solid #27282D' }}>
                  <span style={{ color: '#71717A' }}>Zoom X: </span>
                  <span style={{ color: '#F4F4F5' }}>1.000</span>
                </div>
                <div style={{ backgroundColor: '#1A1A1D', padding: '3px 6px', borderRadius: '2px', border: '1px solid #27282D' }}>
                  <span style={{ color: '#71717A' }}>Zoom Y: </span>
                  <span style={{ color: '#F4F4F5' }}>1.000</span>
                </div>
                <div style={{ backgroundColor: '#1A1A1D', padding: '3px 6px', borderRadius: '2px', border: '1px solid #27282D' }}>
                  <span style={{ color: '#71717A' }}>Pos X: </span>
                  <span style={{ color: '#F4F4F5' }}>0.0</span>
                </div>
                <div style={{ backgroundColor: '#1A1A1D', padding: '3px 6px', borderRadius: '2px', border: '1px solid #27282D' }}>
                  <span style={{ color: '#71717A' }}>Pos Y: </span>
                  <span style={{ color: '#F4F4F5' }}>0.0</span>
                </div>
              </div>
            </div>

            <div style={{ paddingBottom: '0.4rem', borderBottom: '1px solid #222326' }}>
              <div style={{ color: '#E4E4E7', fontWeight: 600, marginBottom: '4px' }}>COMPOSITING</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A1A1D', padding: '3px 6px', borderRadius: '2px', border: '1px solid #27282D' }}>
                <span style={{ color: '#71717A' }}>Opacity:</span>
                <span style={{ color: '#10B981' }}>100.0%</span>
              </div>
            </div>

            <div>
              <div style={{ color: '#E4E4E7', fontWeight: 600, marginBottom: '4px' }}>RETIME & SCALING</div>
              <div style={{ backgroundColor: '#1A1A1D', padding: '3px 6px', borderRadius: '2px', border: '1px solid #27282D' }}>
                <span style={{ color: '#71717A' }}>Speed: </span>
                <span style={{ color: '#F4F4F5' }}>100% (Normal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. TIMELINE TOOLBAR (Edit Tools: Selection, Trim, Blade, Snapping, Flags)
          ==================================================================== */}
      <div
        style={{
          height: '32px',
          backgroundColor: '#18181A',
          borderBottom: '1px solid #26272B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.85rem',
        }}
      >
        {/* Left: Essential Editing Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Arrow / Selection Mode (A) */}
          <button
            type="button"
            title="Selection Mode (A)"
            style={{
              padding: '3px 7px',
              backgroundColor: '#27282E',
              border: '1px solid #3F4046',
              borderRadius: '3px',
              color: '#F4F4F5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
              fontWeight: 600,
            }}
          >
            <span>A</span>
            <span style={{ color: '#A1A1AA', fontSize: '9px' }}>Select</span>
          </button>

          {/* Trim Edit Mode (T) */}
          <button
            type="button"
            title="Trim Edit Mode (T)"
            style={{
              padding: '3px 7px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '3px',
              color: '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
            }}
          >
            <span>T</span>
            <span style={{ color: '#71717A', fontSize: '9px' }}>Trim</span>
          </button>

          {/* Blade Razor (B) */}
          <button
            type="button"
            title="Blade Edit Mode (B)"
            style={{
              padding: '3px 7px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '3px',
              color: '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
            }}
          >
            <Scissors size={12} />
            <span style={{ color: '#71717A', fontSize: '9px' }}>Blade (B)</span>
          </button>

          <div style={{ width: '1px', height: '14px', backgroundColor: '#2C2D32', margin: '0 4px' }} />

          {/* Magnet / Snapping Toggle (N) */}
          <button
            type="button"
            title="Snapping (N)"
            style={{
              padding: '3px 6px',
              backgroundColor: '#1E232B',
              border: '1px solid #2B4C6F',
              borderRadius: '3px',
              color: '#38BDF8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
            }}
          >
            <Magnet size={11} />
            <span>N</span>
          </button>

          {/* Linked Selection Toggle */}
          <button
            type="button"
            title="Linked Selection (Ctrl+Shift+L)"
            style={{
              padding: '3px 6px',
              backgroundColor: '#1E232B',
              border: '1px solid #2B4C6F',
              borderRadius: '3px',
              color: '#38BDF8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
            }}
          >
            <Link2 size={11} />
          </button>

          {/* Marker Flag (M) */}
          <button
            type="button"
            title="Add Marker (M)"
            style={{
              padding: '3px 6px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: '#38BDF8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bookmark size={12} fill="currentColor" />
          </button>
        </div>

        {/* Right: Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ZoomOut size={12} style={{ color: '#71717A', cursor: 'pointer' }} />
          <div
            style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#27282D',
              borderRadius: '2px',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '45%',
                height: '100%',
                backgroundColor: '#71717A',
                borderRadius: '2px',
              }}
            />
          </div>
          <ZoomIn size={12} style={{ color: '#71717A', cursor: 'pointer' }} />
        </div>
      </div>

      {/* ====================================================================
          4. THE TIMELINE (Timecode Ruler + Track Headers + Multi-Track Clips)
          ==================================================================== */}
      <div
        style={{
          backgroundColor: '#111113',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* TIMECODE RULER */}
        <div
          style={{
            height: '24px',
            backgroundColor: '#151518',
            borderBottom: '1px solid #26272C',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Header spacer matches track header width */}
          <div
            style={{
              width: '90px',
              height: '100%',
              borderRight: '1px solid #26272C',
              backgroundColor: '#17171A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              color: '#71717A',
            }}
          >
            TIMELINE
          </div>

          {/* Ruler tick markers (interactive scrubber) */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
              setPlayheadPos(percent);
            }}
            title="Click to scrub playhead"
            style={{
              flex: 1,
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              color: '#71717A',
              paddingLeft: '1rem',
              cursor: 'pointer',
            }}
          >
            {/* In-Out Range Highlight on Ruler */}
            <div
              style={{
                position: 'absolute',
                left: '20%',
                width: '48%',
                top: 0,
                bottom: 0,
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                borderLeft: '2px solid #38BDF8',
                borderRight: '2px solid #38BDF8',
              }}
            />

            <span style={{ position: 'absolute', left: '4%' }}>01:00:00:00</span>
            <span style={{ position: 'absolute', left: '20%' }}>01:00:05:00</span>
            <span style={{ position: 'absolute', left: '38%' }}>01:00:10:00</span>
            <span style={{ position: 'absolute', left: '56%' }}>01:00:15:00</span>
            <span style={{ position: 'absolute', left: '74%' }}>01:00:20:00</span>
            <span style={{ position: 'absolute', left: '90%' }}>01:00:25:00</span>
          </div>
        </div>

        {/* TIMELINE TRACKS CONTAINER */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '4px 0',
          }}
        >
          {/* THE RED RESOLVE PLAYHEAD NEEDLE */}
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              bottom: 0,
              left: `calc(90px + ${playheadPos}%)`,
              zIndex: 30,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Red Playhead top arrow cursor */}
            <div
              style={{
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid #E53935',
              }}
            />
            {/* Laser Line */}
            <div
              style={{
                width: '1.5px',
                flex: 1,
                backgroundColor: '#E53935',
                boxShadow: '0 0 6px rgba(229, 57, 53, 0.7)',
              }}
            />
          </div>

          {/* ==================== TRACK V3 (Titles & Motion Graphics) ==================== */}
          <div style={{ display: 'flex', height: '26px' }}>
            <div
              style={{
                width: '90px',
                backgroundColor: '#19191C',
                borderRight: '1px solid #26272C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#A1A1AA',
              }}
            >
              <span style={{ fontWeight: 600 }}>V3</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <Eye size={10} style={{ color: '#10B981' }} />
                <Lock size={10} style={{ color: '#52525B' }} />
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', padding: '1px 0' }}>
              {/* Title Clip (Purple / Fusion) */}
              <div
                style={{
                  position: 'absolute',
                  left: '28%',
                  width: '32%',
                  height: '24px',
                  backgroundColor: '#581C87',
                  border: '1px solid #7E22CE',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: '#F3E8FF',
                  overflow: 'hidden',
                }}
              >
                <Sparkles size={10} style={{ marginRight: '4px', color: '#D8B4FE' }} />
                <span style={{ whiteSpace: 'nowrap' }}>Title_Cinematic_LowerThird.drfx</span>
              </div>
            </div>
          </div>

          {/* ==================== TRACK V2 (B-Roll Overlays) ==================== */}
          <div style={{ display: 'flex', height: '26px' }}>
            <div
              style={{
                width: '90px',
                backgroundColor: '#19191C',
                borderRight: '1px solid #26272C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#A1A1AA',
              }}
            >
              <span style={{ fontWeight: 600 }}>V2</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <Eye size={10} style={{ color: '#10B981' }} />
                <Lock size={10} style={{ color: '#52525B' }} />
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', padding: '1px 0' }}>
              {/* B-Roll Clip (Orange / Amber) */}
              <div
                style={{
                  position: 'absolute',
                  left: '42%',
                  width: '24%',
                  height: '24px',
                  backgroundColor: '#9A3412',
                  border: '1px solid #EA580C',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: '#FFEDD5',
                  overflow: 'hidden',
                }}
              >
                <Film size={10} style={{ marginRight: '4px', color: '#FDBA74' }} />
                <span style={{ whiteSpace: 'nowrap' }}>B012_Anamorphic_Flare_Cut</span>
              </div>
            </div>
          </div>

          {/* ==================== TRACK V1 (Primary A-Roll Footage) ==================== */}
          <div style={{ display: 'flex', height: '32px' }}>
            <div
              style={{
                width: '90px',
                backgroundColor: '#19191C',
                borderRight: '1px solid #26272C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#E4E4E7',
              }}
            >
              <span style={{ fontWeight: 700, color: '#38BDF8' }}>V1 [TGT]</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <Eye size={10} style={{ color: '#10B981' }} />
                <Lock size={10} style={{ color: '#52525B' }} />
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '2px', padding: '1px 0' }}>
              {/* V1 Clip 1 (Classic DaVinci Teal / Navy Color) */}
              <div
                style={{
                  width: '26%',
                  height: '30px',
                  backgroundColor: '#1E3A5F',
                  border: '1px solid #2563EB',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 6px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: '#DBEAFE',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Video size={10} />
                  <span style={{ fontWeight: 600 }}>A001_Establishing_Master</span>
                </div>
                <span style={{ fontSize: '8px', opacity: 0.6 }}>4K BRAW 24fps [Rec.709]</span>
              </div>

              {/* V1 Clip 2 (Selected / Current Clip) */}
              <div
                style={{
                  width: '38%',
                  height: '30px',
                  backgroundColor: '#1E3A5F',
                  border: '1px solid #60A5FA',
                  boxShadow: 'inset 0 0 0 1px #38BDF8',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 6px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: '#EFF6FF',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Video size={10} style={{ color: '#93C5FD' }} />
                  <span style={{ fontWeight: 700 }}>A002_CloseUp_Take3</span>
                </div>
                <span style={{ fontSize: '8px', color: '#93C5FD' }}>4K BRAW 24fps • In: 01:00:08:12</span>
              </div>

              {/* V1 Clip 3 */}
              <div
                style={{
                  width: '35%',
                  height: '30px',
                  backgroundColor: '#1E3A5F',
                  border: '1px solid #2563EB',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 6px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: '#DBEAFE',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Video size={10} />
                  <span style={{ fontWeight: 600 }}>A003_OverTheShoulder</span>
                </div>
                <span style={{ fontSize: '8px', opacity: 0.6 }}>4K BRAW 24fps</span>
              </div>
            </div>
          </div>

          {/* Divider between Video and Audio tracks */}
          <div style={{ height: '1px', backgroundColor: '#2B2C31', margin: '2px 0' }} />

          {/* ==================== TRACK A1 (Dialogue with Audio Waveform) ==================== */}
          <div style={{ display: 'flex', height: '30px' }}>
            <div
              style={{
                width: '90px',
                backgroundColor: '#19191C',
                borderRight: '1px solid #26272C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#10B981',
              }}
            >
              <span style={{ fontWeight: 700 }}>A1 2.0</span>
              <div style={{ display: 'flex', gap: '2px', fontSize: '8.5px' }}>
                <span style={{ padding: '1px 3px', backgroundColor: '#064E3B', borderRadius: '2px', color: '#34D399' }}>M</span>
                <span style={{ padding: '1px 3px', backgroundColor: '#27272A', borderRadius: '2px', color: '#71717A' }}>S</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '2px', padding: '1px 0' }}>
              {/* Audio Clip 1 with waveform bars */}
              <div
                style={{
                  width: '26%',
                  height: '28px',
                  backgroundColor: '#064E3B',
                  border: '1px solid #059669',
                  borderRadius: '2px',
                  padding: '2px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: '#A7F3D0' }}>DX_A001_Sync</span>
                {/* Simulated Audio Waveform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: '12px' }}>
                  {[3, 6, 8, 12, 10, 7, 4, 9, 11, 8, 4, 3, 5, 8, 11, 9, 5, 3, 7, 10, 6, 4].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}px`, backgroundColor: '#34D399', opacity: 0.8, borderRadius: '0.5px' }} />
                  ))}
                </div>
              </div>

              {/* Audio Clip 2 */}
              <div
                style={{
                  width: '38%',
                  height: '28px',
                  backgroundColor: '#064E3B',
                  border: '1px solid #10B981',
                  borderRadius: '2px',
                  padding: '2px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: '#D1FAE5', fontWeight: 600 }}>DX_Dialogue_Hero_Take3.wav</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: '12px' }}>
                  {[4, 9, 12, 11, 8, 5, 8, 12, 10, 6, 3, 2, 7, 11, 12, 9, 4, 8, 12, 11, 7, 3, 6, 10, 8, 4, 3, 6, 9].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}px`, backgroundColor: '#6EE7B7', opacity: 0.9, borderRadius: '0.5px' }} />
                  ))}
                </div>
              </div>

              {/* Audio Clip 3 */}
              <div
                style={{
                  width: '35%',
                  height: '28px',
                  backgroundColor: '#064E3B',
                  border: '1px solid #059669',
                  borderRadius: '2px',
                  padding: '2px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: '#A7F3D0' }}>DX_A003_Sync</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: '12px' }}>
                  {[2, 5, 8, 11, 7, 4, 6, 9, 8, 5, 3, 6, 9, 11, 7, 4, 5, 8, 10, 6, 3, 5, 8, 4].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}px`, backgroundColor: '#34D399', opacity: 0.8, borderRadius: '0.5px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== TRACK A2 (Music / Soundtrack) ==================== */}
          <div style={{ display: 'flex', height: '26px' }}>
            <div
              style={{
                width: '90px',
                backgroundColor: '#19191C',
                borderRight: '1px solid #26272C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#38BDF8',
              }}
            >
              <span style={{ fontWeight: 600 }}>A2 [MX]</span>
              <div style={{ display: 'flex', gap: '2px', fontSize: '8.5px' }}>
                <span style={{ padding: '1px 3px', backgroundColor: '#1E293B', borderRadius: '2px', color: '#71717A' }}>M</span>
                <span style={{ padding: '1px 3px', backgroundColor: '#1E293B', borderRadius: '2px', color: '#71717A' }}>S</span>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', padding: '1px 0' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '10%',
                  width: '85%',
                  height: '24px',
                  backgroundColor: '#0C4A6E',
                  border: '1px solid #0284C7',
                  borderRadius: '2px',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Music size={10} style={{ color: '#38BDF8' }} />
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#BAE6FD' }}>
                    MX_Cinematic_Modular_Score_Stereo.wav (-6.0 dB)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '10px', width: '120px' }}>
                  {[2, 4, 3, 5, 4, 6, 7, 5, 4, 6, 5, 7, 8, 6, 5, 7, 6, 8, 7, 5, 4, 6, 5, 4, 3].map((h, idx) => (
                    <div key={idx} style={{ flex: 1, height: `${h}px`, backgroundColor: '#38BDF8', opacity: 0.6, borderRadius: '0.5px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          5. THE ICONIC DAVINCI RESOLVE PAGE SWITCHER BAR (BOTTOM)
          ==================================================================== */}
      <div
        style={{
          height: '42px',
          backgroundColor: '#141416',
          borderTop: '1px solid #28292E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 1rem',
          position: 'relative',
        }}
      >
        {/* Project Name Left */}
        <div
          style={{
            position: 'absolute',
            left: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#71717A',
          }}
          className="bottom-project-tag"
        >
          <span>Project: <strong style={{ color: '#A1A1AA' }}>ShortFilm_Master</strong></span>
        </div>

        {/* The 7 Iconic DaVinci Resolve Page Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {[
            { id: 'media', label: 'Media', icon: <Folder size={13} />, active: false },
            { id: 'cut', label: 'Cut', icon: <Scissors size={13} />, active: false },
            { id: 'edit', label: 'Edit', icon: <Film size={13} />, active: true },
            { id: 'fusion', label: 'Fusion', icon: <Sparkles size={13} />, active: false },
            { id: 'color', label: 'Color', icon: <Sliders size={13} />, active: false },
            { id: 'fairlight', label: 'Fairlight', icon: <Volume2 size={13} />, active: false },
            { id: 'deliver', label: 'Deliver', icon: <SendHorizontal size={13} />, active: false },
          ].map((page) => (
            <div
              key={page.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 12px',
                borderRadius: '4px',
                backgroundColor: page.active ? '#202126' : 'transparent',
                border: page.active ? '1px solid #38393F' : '1px solid transparent',
                color: page.active ? '#FFFFFF' : '#71717A',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 120ms',
              }}
            >
              {page.active && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '25%',
                    right: '25%',
                    height: '2px',
                    backgroundColor: '#E53935',
                    borderRadius: '1px',
                  }}
                />
              )}
              {page.icon}
              <span
                style={{
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: page.active ? 700 : 500,
                  color: page.active ? '#F4F4F5' : '#71717A',
                }}
              >
                {page.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right Help / Layout Tag */}
        <div
          style={{
            position: 'absolute',
            right: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#71717A',
          }}
          className="bottom-fps-tag"
        >
          <span style={{ color: '#E53935' }}>●</span> 24.000 FPS • ALL EDITS SAVED
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .editor-top-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .media-pool-panel, .inspector-panel {
            display: none !important;
          }
          .bottom-project-tag, .bottom-fps-tag {
            display: none !important;
          }
          .workspace-toggle-tabs {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .monitor-timecode-readout {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
