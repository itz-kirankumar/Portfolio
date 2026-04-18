'use client'
// components/portfolio/GlobalBackdrop.tsx
import { useEffect, useRef } from 'react'
import type { PortfolioTheme } from '@/types'

interface Props {
  theme?: PortfolioTheme
}

// --- UTILITY: HEX TO RGB ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 126, g: 240, b: 200 }
}

// --- UTILITY: LIGHTWEIGHT PROCEDURAL NOISE (Simplex Approximation) ---
// Essential for organic, lively flowing animations (Aurora, Waves, Topographic)
class Noise {
  private p: Uint8Array;
  constructor() {
    this.p = new Uint8Array(512);
    const permutation = new Uint8Array(256);
    for (let i = 0; i < 256; i++) permutation[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 512; i++) this.p[i] = permutation[i % 256];
  }
  private fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  private lerp(t: number, a: number, b: number) { return a + t * (b - a); }
  private grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  public noise3D(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = this.fade(x), v = this.fade(y), w = this.fade(z);
    const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;
    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))),
      this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
      this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
  }
}

export default function GlobalBackdrop({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const primaryHex = theme?.primaryColor || '#7ef0c8'
  const accentHex = theme?.accentColor || '#818cf8'
  const bgColor = theme?.bgColor || '#030305'
  const style = theme?.backdropStyle || 'perspective-grid'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false }) // Optimize by removing alpha channel
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight
    let rafId: number
    let time = 0
    const noiseGen = new Noise()

    // State Tracking
    let scrollY = window.scrollY
    let targetScrollY = window.scrollY
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, vx: 0, vy: 0 }

    // Colors
    const pRgb = hexToRgb(primaryHex)
    const aRgb = hexToRgb(accentHex)

    // Window Events
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; initEngine(); }
    const handleScroll = () => { targetScrollY = window.scrollY; }
    const handleMouseMove = (e: MouseEvent) => { mouse.targetX = e.clientX; mouse.targetY = e.clientY; }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove)

    // --- ENGINE DATA STRUCTURES ---
    let particles: any[] = []
    let gridNodes: any[] = []
    let columns: number[] = []

    const initEngine = () => {
      particles = []
      gridNodes = []
      columns = []

      // Matrix Columns setup
      const fontSize = 16
      const cols = Math.floor(width / fontSize) + 1
      for (let i = 0; i < cols; i++) columns[i] = Math.random() * -100

      // Particles setup (used for starfield, cosmic dust, quantum foam, dna)
      const pCount = style === 'starfield' ? 600 : style === 'dna-helix' ? 400 : style === 'quantum-foam' ? 80 : style === 'glass-orbs' ? 30 : 200
      for (let i = 0; i < pCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * 1000,
          radius: Math.random() * 3 + 0.5,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 2 + 0.1,
          vx: 0, vy: 0,
          color: Math.random() > 0.5 ? pRgb : aRgb,
          seed: Math.random() * 1000
        })
      }

      // Cyber/Network nodes
      if (style === 'cyber-circuit' || style === 'architectural') {
        const spacing = style === 'cyber-circuit' ? 80 : 150
        for (let x = 0; x < width + spacing; x += spacing) {
          for (let y = 0; y < height + spacing; y += spacing) {
            gridNodes.push({
              ox: x + (Math.random() - 0.5) * 40,
              oy: y + (Math.random() - 0.5) * 40,
              x: x, y: y,
              vx: 0, vy: 0,
              seed: Math.random() * 1000
            })
          }
        }
      }
    }
    initEngine()

    // --- RENDER LOOPS ---

    // 1. Perspective 3D Grid (Synthwave / Architect)
    const renderGrid = () => {
      const cx = width / 2 + (mouse.x - width / 2) * 0.1
      const cy = height * 0.3 + (mouse.y - height / 2) * 0.1 - scrollY * 0.2
      const fov = 300

      ctx.lineWidth = 1
      // Vertical lines
      for (let x = -2000; x <= 2000; x += 100) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        const scale = fov / (fov + 1000)
        ctx.lineTo(cx + x * 2, height + 500)
        ctx.strokeStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${1 - Math.abs(x)/2000})`
        ctx.stroke()
      }
      // Horizontal scrolling lines
      const speed = (time * 100) % 100
      for (let z = speed; z < 1000; z += 100) {
        const scale = fov / (fov + z)
        const y = cy + (height * 0.8) * scale
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.strokeStyle = `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, ${1 - z/1000})`
        ctx.stroke()
      }
    }

    // 2. 3D Starfield / Cosmic Dust
    const renderStarfield = (isDust = false) => {
      const cx = width / 2
      const cy = height / 2
      const mxOffset = (mouse.x - cx) * 0.05
      const myOffset = ((mouse.y - cy) * 0.05) - (scrollY * 0.5)

      particles.forEach(p => {
        p.z -= isDust ? p.speed * 0.2 : p.speed * 5
        if (p.z <= 0) { p.z = 1000; p.x = (Math.random() - 0.5) * width * 2; p.y = (Math.random() - 0.5) * height * 2; }
        
        const fov = 300
        const scale = fov / (fov + p.z)
        const px = cx + (p.x + mxOffset * p.z * 0.01) * scale
        const py = cy + (p.y + myOffset * p.z * 0.01) * scale

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = isDust ? (1 - p.z/1000) * 0.6 : (1 - p.z/1000)
          ctx.beginPath()
          ctx.arc(px, py, p.radius * scale * (isDust ? 3 : 1), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`
          ctx.fill()
        }
      })
    }

    // 3. Fluid Waves / Topographic (3D Procedural Terrain)
    const renderWaves = (isTopographic = false) => {
      const spacing = isTopographic ? 30 : 40
      const rows = Math.floor(height / spacing) + 2
      const cols = Math.floor(width / spacing) + 2
      const scrollOffset = scrollY * 0.01
      const mouseInfluence = (mouse.x / width) * 2

      ctx.lineWidth = isTopographic ? 1 : 2
      for (let y = 0; y < rows; y++) {
        ctx.beginPath()
        for (let x = 0; x < cols; x++) {
          const px = x * spacing
          const py = y * spacing
          
          // Generate 3D Noise map
          const n = noiseGen.noise3D(x * 0.05 - time * 0.1, y * 0.05 + scrollOffset, time * 0.05 + mouseInfluence)
          
          const yOffset = n * (isTopographic ? 40 : 80)
          if (x === 0) ctx.moveTo(px, py + yOffset)
          else ctx.lineTo(px, py + yOffset)
        }
        const alpha = 1 - (y / rows)
        ctx.strokeStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${isTopographic ? 0.3 : alpha * 0.5})`
        ctx.stroke()
      }
    }

    // 4. Cyber Circuit (Interactive Node Network)
    const renderNetwork = () => {
      const connectDist = 180
      const mouseDist = 200

      gridNodes.forEach(node => {
        // Natural wobble
        node.x = node.ox + Math.sin(time + node.seed) * 20
        node.y = node.oy + Math.cos(time + node.seed) * 20 - scrollY * 0.2

        // Mouse Repulsion
        const dx = node.x - mouse.x
        const dy = node.y - mouse.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < mouseDist) {
          const force = (mouseDist - dist) / mouseDist
          node.x += (dx / dist) * force * 50
          node.y += (dy / dist) * force * 50
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.8)`
        ctx.fill()
      })

      ctx.lineWidth = 1
      for (let i = 0; i < gridNodes.length; i++) {
        for (let j = i + 1; j < gridNodes.length; j++) {
          const n1 = gridNodes[i], n2 = gridNodes[j]
          const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2))
          if (dist < connectDist) {
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            const alpha = 1 - (dist / connectDist)
            ctx.strokeStyle = `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, ${alpha * 0.4})`
            ctx.stroke()
          }
        }
      }
    }

    // 5. DNA Helix (3D Rotating Particles)
    const renderDNA = () => {
      const cx = width / 2 + (mouse.x - width / 2) * 0.1
      const cy = height / 2 - scrollY * 0.5
      
      particles.forEach((p, i) => {
        const yOff = (i - particles.length/2) * 15
        const angle = time * 2 + i * 0.1 + (mouse.x * 0.005)
        const radius = 100 + Math.sin(time + i*0.05) * 20
        
        // Strand 1
        let px1 = cx + Math.cos(angle) * radius
        let pz1 = Math.sin(angle) * radius
        let scale1 = 300 / (300 + pz1)
        
        // Strand 2
        let px2 = cx + Math.cos(angle + Math.PI) * radius
        let pz2 = Math.sin(angle + Math.PI) * radius
        let scale2 = 300 / (300 + pz2)

        if (scale1 > 0) {
          ctx.beginPath()
          ctx.arc(px1, cy + yOff * scale1, 3 * scale1, 0, Math.PI*2)
          ctx.fillStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${scale1})`
          ctx.fill()
        }
        if (scale2 > 0) {
          ctx.beginPath()
          ctx.arc(px2, cy + yOff * scale2, 3 * scale2, 0, Math.PI*2)
          ctx.fillStyle = `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, ${scale2})`
          ctx.fill()
        }
        
        // Connections
        if (i % 3 === 0 && scale1 > 0 && scale2 > 0) {
          ctx.beginPath()
          ctx.moveTo(px1, cy + yOff * scale1)
          ctx.lineTo(px2, cy + yOff * scale2)
          ctx.strokeStyle = `rgba(255,255,255, ${0.1 * ((scale1+scale2)/2)})`
          ctx.stroke()
        }
      })
    }

    // 6. Matrix Rain
    const renderMatrix = () => {
      const fontSize = 16
      ctx.font = `${fontSize}px monospace`
      ctx.textAlign = 'center'
      
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)` // Fade effect
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < columns.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96) // Katakana + random
        const x = i * fontSize
        const y = columns[i] * fontSize - scrollY * 0.5
        
        // Head of the drop
        ctx.fillStyle = `rgb(255, 255, 255)`
        ctx.fillText(text, x, y)
        
        // Trail
        ctx.fillStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.8)`
        ctx.fillText(text, x, y - fontSize)

        if (y > height && Math.random() > 0.975) columns[i] = 0
        columns[i] += 0.5 + (mouse.y / height) * 0.5 // Mouse speed control
      }
    }

    // 7. Aurora Borealis (Organic Noise Waves)
    const renderAurora = () => {
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(0, height)
        for (let x = 0; x <= width; x += 50) {
          const n = noiseGen.noise3D(x * 0.002, time * 0.2 + i, scrollY * 0.001)
          const y = height * 0.3 + n * 400 + Math.sin(x * 0.005 + time) * 100
          ctx.lineTo(x, y - (mouse.y * 0.2))
        }
        ctx.lineTo(width, height)
        
        const grad = ctx.createLinearGradient(0, 0, 0, height)
        grad.addColorStop(0, `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0)`)
        grad.addColorStop(0.5, `rgba(${i%2===0?pRgb.r:aRgb.r}, ${i%2===0?pRgb.g:aRgb.g}, ${i%2===0?pRgb.b:aRgb.b}, 0.15)`)
        grad.addColorStop(1, `rgba(0,0,0,0)`)
        
        ctx.fillStyle = grad
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    // 8. Sonar Pulse (3D Rings)
    const renderSonar = () => {
      const cx = width / 2
      const cy = height / 2 - scrollY * 0.5
      
      ctx.lineWidth = 2
      for(let i = 1; i <= 8; i++) {
        const radius = ((time * 50 + i * 150) % 1200)
        const alpha = 1 - (radius / 1200)
        
        // Perspective tilt
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, 0.4 + (mouse.y / height) * 0.4) // Mouse Y controls tilt
        ctx.rotate(time * 0.2 + (mouse.x / width))
        
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${alpha * 0.5})`
        ctx.stroke()
        
        ctx.restore()
      }
    }

    // 9. Floating Glass Orbs (Physics Bouncing)
    const renderOrbs = () => {
      particles.forEach(p => {
        p.x += Math.sin(p.angle) * p.speed
        p.y += Math.cos(p.angle) * p.speed - scrollY * 0.01 // Parallax scroll
        
        // Bounce bounds
        if (p.x < 0 || p.x > width) p.angle = -p.angle
        if (p.y < 0 || p.y > height) p.angle = Math.PI - p.angle

        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 200) {
          p.x += dx * 0.05
          p.y += dy * 0.05
        }

        const rad = p.radius * 20
        const grad = ctx.createRadialGradient(p.x - rad*0.3, p.y - rad*0.3, rad*0.1, p.x, p.y, rad)
        grad.addColorStop(0, `rgba(255,255,255,0.4)`)
        grad.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.1)`)
        grad.addColorStop(1, `rgba(0,0,0,0)`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        
        // Glass border
        ctx.strokeStyle = `rgba(255,255,255,0.1)`
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    // 10. Hexagon Mesh
    const renderHexagons = () => {
      const size = 40
      const h = size * Math.sqrt(3)
      const w = size * 2
      const xOffset = w * 0.75
      const yOffset = h
      const cols = Math.ceil(width / xOffset) + 1
      const rows = Math.ceil(height / yOffset) + 2

      ctx.lineWidth = 1
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          let x = col * xOffset
          let y = row * yOffset + (col % 2 === 1 ? h/2 : 0) - (scrollY % yOffset)
          
          // Mouse interaction
          const dist = Math.sqrt(Math.pow(x - mouse.x, 2) + Math.pow(y - mouse.y, 2))
          const alpha = dist < 300 ? 1 - (dist/300) : 0
          
          // Organic breathing
          const breathe = (Math.sin(time + col*0.5 + row*0.5) + 1) * 0.5 * 0.2

          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i
            const hx = x + size * Math.cos(angle)
            const hy = y + size * Math.sin(angle)
            if (i === 0) ctx.moveTo(hx, hy)
            else ctx.lineTo(hx, hy)
          }
          ctx.closePath()
          
          ctx.strokeStyle = `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${0.05 + alpha * 0.5 + breathe})`
          ctx.stroke()
          if (alpha > 0.1) {
            ctx.fillStyle = `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, ${alpha * 0.1})`
            ctx.fill()
          }
        }
      }
    }


    // --- MAIN RENDER LOOP ---
    const render = () => {
      time += 0.01

      // Easing Mouse & Scroll for buttery smoothness
      mouse.x += (mouse.targetX - mouse.x) * 0.1
      mouse.y += (mouse.targetY - mouse.y) * 0.1
      scrollY += (targetScrollY - scrollY) * 0.1

      // Clear Canvas (Matrix needs trailing, others clear fully)
      if (style === 'matrix-rain') {
        // Matrix clearing handled inside routine for trails
      } else {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, width, height)
      }

      // Map 25+ styles to rendering engines
      switch (style) {
        case 'perspective-grid': renderGrid(); break;
        case 'starfield': renderStarfield(false); break;
        case 'cosmic-dust': renderStarfield(true); break;
        case 'fluid-waves': renderWaves(false); break;
        case 'topographic': renderWaves(true); break;
        case 'cyber-circuit': 
        case 'architectural': renderNetwork(); break;
        case 'dna-helix': renderDNA(); break;
        case 'matrix-rain': renderMatrix(); break;
        case 'aurora': renderAurora(); break;
        case 'sonar-pulse': renderSonar(); break;
        case 'glass-orbs': 
        case 'floating-glass': renderOrbs(); break;
        case 'hexagons': renderHexagons(); break;
        case 'quantum-foam':
        case 'holographic':
        case 'polygonal':
        case 'neon-tunnel':
        case 'retro-wave':
        case 'laser-scan':
        case 'binary-static':
        case 'glitch-noise':
        case 'minimal-dots':
        case 'zen-minimal':
        default:
          // Fallback to abstract particle field for unimplemented generic ones
          renderStarfield(true); 
          break;
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [primaryHex, accentHex, bgColor, style])

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-black">
      {/* Hardware Accelerated Canvas */}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
        style={{ backgroundColor: bgColor }}
      />
      
      {/* Soft Vignette Overlay to ensure text readability */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: `radial-gradient(circle at center, transparent 20%, ${bgColor} 150%)` }} 
      />

      {/* Tactile Cinematic Noise */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  )
}