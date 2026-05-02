import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Focus, Check, Copy, Droplets, Paintbrush, ImageIcon, LayoutTemplate, Layers, MousePointer2, ChevronRight, Zap, Shield, BarChart3, Code2, X, ChevronDown } from 'lucide-react';
import { extractDistinctColors, assignSemanticRoles, getContrast, generatePalette, ColorRoles } from './colors';

const ROLE_TRANSLATIONS: Record<keyof ColorRoles, string> = {
  background: 'Fundo',
  text: 'Texto',
  primary: 'Primária',
  secondary: 'Secundária',
  accent: 'Destaque'
};

const CATS = [
  { id: 'fundos', label: 'Fundos Animados' },
  { id: 'textos', label: 'Efeitos de Texto' },
  { id: 'cards', label: 'Cards Interativos' },
  { id: 'interacoes', label: 'Botões & Interações' },
  { id: 'imagens', label: 'Mídia & Zoom' },
];

const ANIMATIONS_DB = [
  {
    id: 'fundo-1',
    category: 'fundos',
    name: 'Gradiente Dinâmico',
    className: 'bg-gradient',
    render: (roles: ColorRoles) => (
      <div 
        className="w-full h-full"
        style={{
          background: `linear-gradient(-45deg, ${roles.primary}, ${roles.secondary}, ${roles.accent})`,
          backgroundSize: '400% 400%',
          animation: 'gradPulse 5s ease infinite'
        }}
      />
    ),
    code: (roles: ColorRoles) => `.bg-gradient {
  background: linear-gradient(-45deg, ${roles.primary}, ${roles.secondary}, ${roles.accent});
  background-size: 400% 400%;
  animation: gradPulse 5s ease infinite;
}`
  },
  {
    id: 'fundo-2',
    category: 'fundos',
    name: 'Malha (Mesh) Suave',
    className: 'mesh-bg',
    render: (roles: ColorRoles) => (
      <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
         <div className="absolute top-0 left-0 w-full h-full blur-[40px] opacity-60" style={{ background: `radial-gradient(circle at 100% 0%, ${roles.primary} 0%, transparent 60%), radial-gradient(circle at 0% 100%, ${roles.secondary} 0%, transparent 60%)` }} />
      </div>
    ),
    code: (roles: ColorRoles) => `.mesh-bg {
  background: radial-gradient(circle at 100% 0%, ${roles.primary} 0%, transparent 60%),
              radial-gradient(circle at 0% 100%, ${roles.secondary} 0%, transparent 60%);
  filter: blur(40px);
  opacity: 0.6;
}`
  },
  {
    id: 'texto-1',
    category: 'textos',
    name: 'Glow Pulsante',
    className: 'glow-text',
    render: (roles: ColorRoles) => (
      <div className="w-full h-full flex items-center justify-center bg-[#09090b]">
        <span className="text-xl md:text-2xl font-bold font-display" style={{ 
          color: roles.text,
          textShadow: `0 0 10px ${roles.primary}80`,
          animation: 'pulseGlow 2s infinite alternate'
        }}>Glow Text</span>
      </div>
    ),
    code: (roles: ColorRoles) => `.glow-text {
  color: ${roles.text};
  text-shadow: 0 0 10px ${roles.primary}80;
  animation: pulseGlow 2s infinite alternate;
}`
  },
  {
    id: 'texto-2',
    category: 'textos',
    name: 'Gradiente Estático',
    className: 'gradient-text',
    render: (roles: ColorRoles) => (
      <div className="w-full h-full flex items-center justify-center bg-[#09090b]">
        <span className="text-xl md:text-2xl font-bold font-display text-transparent !bg-clip-text" style={{ 
          backgroundImage: `linear-gradient(to right, ${roles.primary}, ${roles.secondary})`
        }}>Hello World</span>
      </div>
    ),
    code: (roles: ColorRoles) => `.gradient-text {
  background-image: linear-gradient(to right, ${roles.primary}, ${roles.secondary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}`
  },
  {
    id: 'card-1',
    category: 'cards',
    name: 'Holographic Hover',
    className: 'holographic-card',
    render: (roles: ColorRoles) => (
      <div className="w-full h-full flex items-center justify-center bg-[#09090b] p-6">
        <div className="w-full h-full rounded-2xl transition-all duration-500 relative group overflow-hidden"
             style={{ backgroundColor: `${roles.background}80`, border: `1px solid ${roles.text}20` }}
        >
           <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, ${roles.primary}40, transparent 70%)` }}
           />
           <div className="absolute inset-0 flex items-center justify-center font-bold text-sm tracking-widest transition-colors z-10 uppercase" style={{ color: `${roles.text}80` }}>Holo Card</div>
        </div>
      </div>
    ),
    code: (roles: ColorRoles) => `.holographic-card {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background-color: ${roles.background}80;
  border: 1px solid ${roles.text}20;
}
.holographic-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, ${roles.primary}40, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}
.holographic-card:hover::before {
  opacity: 1;
}`
  },
  {
    id: 'interacoes-1',
    category: 'interacoes',
    name: 'Neon Button',
    className: 'neon-button',
    render: (roles: ColorRoles) => (
      <div className="w-full h-full flex items-center justify-center bg-[#09090b]">
          <button className="px-6 py-3 font-bold rounded-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    color: roles.primary,
                    border: `2px solid ${roles.primary}`,
                    boxShadow: `0 0 15px ${roles.primary}30`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = roles.primary;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${roles.primary}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = roles.primary;
                    e.currentTarget.style.boxShadow = `0 0 15px ${roles.primary}30`;
                  }}
          >
            Hover Me
          </button>
      </div>
    ),
    code: (roles: ColorRoles) => `.neon-button {
  color: ${roles.primary};
  border: 2px solid ${roles.primary};
  box-shadow: 0 0 15px ${roles.primary}30;
  transition: all 0.3s ease;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
}
.neon-button:hover {
  background-color: ${roles.primary};
  color: #fff;
  box-shadow: 0 10px 30px ${roles.primary}80;
  transform: translateY(-4px);
}`
  },
  {
    id: 'imagens-1',
    category: 'imagens',
    name: 'Zoom & Overlay',
    className: 'image-zoom',
    render: (roles: ColorRoles) => (
      <div className="w-full h-full p-6 bg-[#09090b] flex items-center justify-center">
        <div className="w-full h-full relative overflow-hidden rounded-2xl group bg-black shadow-2xl">
           <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop" alt="Demo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-100" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
              <span className="text-white font-bold text-lg" style={{ color: roles.accent }}>Feature</span>
           </div>
        </div>
      </div>
    ),
    code: (roles: ColorRoles) => `.image-zoom {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
}
.image-zoom img {
  transition: transform 0.7s ease-out, opacity 0.7s;
  opacity: 0.7;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-zoom:hover img {
  transform: scale(1.1);
  opacity: 1;
}
.image-zoom .overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
}
.image-zoom:hover .overlay {
  opacity: 1;
}`
  }
];

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [roles, setRoles] = useState<ColorRoles | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [activeEffects, setActiveEffects] = useState<Record<string, string>>({});
  const [modalAnim, setModalAnim] = useState<typeof ANIMATIONS_DB[0] | null>(null);

  // Ambient backdrop colors
  const ambient1 = roles?.primary || "#8b5cf6";
  const ambient2 = roles?.accent || "#3b82f6";
  const ambient3 = roles?.background || "#09090b";

  const handleProcessImage = async (url: string) => {
    setIsProcessing(true);
    setImageUrl(url);
    try {
      const colors = await extractDistinctColors(url, 5);
      setExtractedColors(colors);
      setRoles(assignSemanticRoles(colors));
    } catch (e) {
      console.error("Failed to extract colors", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      handleProcessImage(url);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleProcessImage(url);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const activeEffectsStyles = roles 
    ? Object.values(activeEffects)
        .map(id => ANIMATIONS_DB.find(a => a.id === id)?.code(roles) || "")
        .join("\n") 
    : "";

  return (
    <div className="relative min-h-screen w-full selection:bg-white/20 overflow-x-hidden pt-24 pb-4 px-2 lg:px-4">
      <style>{`
        @keyframes gradPulse {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          from { opacity: 0.8; filter: brightness(1); }
          to { opacity: 1; filter: brightness(1.3); text-shadow: 0 0 20px currentColor; }
        }
        ${activeEffectsStyles}
      `}</style>
      {/* Ambient Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-black/40">
        <motion.div
           animate={{ 
             backgroundColor: ambient1,
             x: [0, 50, -50, 0],
             y: [0, 30, -30, 0],
             scale: [1, 1.1, 0.9, 1]
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-20 mix-blend-screen" 
        />
        <motion.div
           animate={{ 
             backgroundColor: ambient2,
             x: [0, -60, 40, 0],
             y: [0, -40, 60, 0],
             scale: [1, 0.8, 1.2, 1]
           }}
           transition={{ duration: 18, delay: 0.2, repeat: Infinity, ease: "linear" }}
           className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 mix-blend-screen" 
        />
        <motion.div
           animate={{ 
             backgroundColor: ambient3,
             x: [0, 30, -40, 0],
             y: [0, 50, -20, 0],
             scale: [1, 1.2, 0.9, 1]
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full blur-[160px] opacity-40 mix-blend-multiply" 
        />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center p-6 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl pointer-events-auto">
          <Droplets className="w-5 h-5 text-white" />
          <span className="font-display font-bold tracking-tight text-white">Chroma UI</span>
          <div className="w-[1px] h-4 bg-white/20 mx-2" />
          <span className="text-xs font-medium text-zinc-400">Inteligência em Cores</span>
        </div>
      </header>

      <div className="w-full max-w-[1920px] lg:px-4 mx-auto space-y-8">
        
        {/* Upload State */}
        <AnimatePresence mode="wait">
          {!imageUrl && (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/40">
                  Extraia a essência.
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
                  Arraste uma imagem. Nós cuidamos da matemática, quantização e mapeamento 
                  semântico para construir uma paleta UI pronta em segundos.
                </p>
              </div>

              <motion.label 
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    group relative flex flex-col items-center justify-center w-full max-w-2xl h-80 rounded-[32px] 
                    border-2 border-dashed cursor-pointer transition-all duration-500 overflow-hidden backdrop-blur-xl
                    ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                  `}
                >
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <div className="flex flex-col items-center gap-8 z-10 pointer-events-none">
                    <div className={`p-4 rounded-full transition-colors duration-500 ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-zinc-400'}`}>
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                     <p className="text-lg font-medium text-white mb-2">Arraste e solte uma imagem</p>
                     <p className="text-sm text-zinc-500">Suporta JPG, PNG, WEBP</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.label>
            </motion.div>
          )}

          {/* Results State */}
          {imageUrl && roles && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 lg:gap-6"
            >
              {/* Left Column: Analysis & Controls */}
              <div className="space-y-4">
                
                {/* Source Image */}
                <motion.div 
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/5 backdrop-blur-[20px] rounded-[32px] p-2 border border-white/10 shadow-2xl relative group overflow-hidden"
                >
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-xs font-semibold px-4 py-2 rounded-full z-10 flex items-center gap-2">
                    <Focus className="w-4 h-4" /> Origem
                  </div>
                  <img src={imageUrl} alt="Source" className="w-full h-72 object-cover rounded-[24px] brightness-90 group-hover:brightness-100 transition-all" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all cursor-pointer rounded-[32px]">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <span className="text-white text-sm font-medium flex items-center gap-2 bg-black/40 px-6 py-3 rounded-full backdrop-blur-md">
                       <ImageIcon className="w-5 h-5" /> Trocar Imagem
                    </span>
                  </label>
                </motion.div>

                {/* Live Mapper */}
                <motion.div 
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/5 backdrop-blur-[20px] rounded-[24px] p-5 border border-white/10 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paintbrush className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-display font-semibold text-base">Funções Semânticas</h3>
                    </div>
                  </div>
                  <p className="text-[11px] lg:text-xs text-zinc-400 leading-normal font-medium">
                    Atribua as cores para funções de layout. O Preview em Tempo Real recalcula o contraste instantaneamente.
                  </p>
                  
                  <div className="space-y-2">
                    {(Object.keys(roles) as Array<keyof ColorRoles>).map((role) => (
                      <div key={role} className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5">
                        <span className="capitalize font-medium text-xs text-zinc-300">{ROLE_TRANSLATIONS[role as keyof ColorRoles]}</span>
                        <div className="flex gap-1 bg-black/40 p-1 rounded-full">
                          {extractedColors.map(color => (
                            <button
                              key={color}
                              onClick={() => setRoles(r => r ? { ...r, [role]: color } : null)}
                              className={`w-5 h-5 rounded-full shadow-sm transition-all duration-300 ${roles[role as keyof ColorRoles] === color ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-[#1a1a1ab3]' : 'opacity-50 hover:opacity-100 hover:scale-110'}`}
                              style={{ backgroundColor: color }}
                              title={`Atribuir ${color} à função ${ROLE_TRANSLATIONS[role as keyof ColorRoles]}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                 {/* NOVO: PALETA GERADA (Movido para a esquerda) */}
                 <motion.div 
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 30 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-zinc-950/40 backdrop-blur-[20px] border border-white/5 rounded-[24px] p-5 shadow-2xl flex flex-col relative overflow-hidden"
                 >
                    <div className="relative z-10 w-full">
                        <div className="mb-4">
                            <h2 className="text-lg md:text-xl font-display font-bold mb-1 text-white/95 tracking-tight">Paleta Gerada</h2>
                            <p className="text-zinc-400 text-[10px] md:text-xs font-medium leading-normal">
                                As cores são quantizadas e recebem funções baseadas no nível de contraste e saturação.
                            </p>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {(Object.keys(roles) as Array<keyof ColorRoles>).map((role) => {
                                const hex = roles[role as keyof ColorRoles];
                                const shades = generatePalette(hex);
                                const textColor = getContrast(hex);
                                const isLight = textColor === '#000000';
                                
                                return (
                                    <div key={role} className="flex-1 flex flex-col h-[140px] lg:h-[160px] rounded-xl overflow-hidden shadow-base border border-black/20 group cursor-pointer transition-transform hover:-translate-y-0.5 bg-[#1a1a1a]" onClick={() => copyToClipboard(hex)}>
                                        {/* Main Color Area */}
                                        <div className="flex-1 flex flex-col relative pt-3 pb-3 px-1" style={{ backgroundColor: hex }}>
                                            <div className="flex justify-center w-full">
                                                <span className={`text-[7px] lg:text-[8px] font-bold px-1.5 py-1 rounded-sm tracking-widest uppercase backdrop-blur-md shadow-sm transition-colors ${isLight ? 'bg-black/10 text-black/70' : 'bg-white/20 text-white/90'}`}>
                                                    {ROLE_TRANSLATIONS[role as keyof ColorRoles]}
                                                </span>
                                            </div>

                                            {/* Copied Feedback */}
                                            <AnimatePresence>
                                                {copiedHex === hex && (
                                                    <motion.div
                                                       initial={{ opacity: 0, y: 10 }}
                                                       animate={{ opacity: 1, y: 0 }}
                                                       exit={{ opacity: 0, scale: 0.8 }}
                                                       className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-md rounded-t-xl"
                                                    >
                                                        <div className="bg-black/60 text-white p-1.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-base">
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            <div className="mt-auto text-center font-mono text-[9px] lg:text-[10px] tracking-widest font-bold" style={{ color: textColor }}>
                                                {hex.toUpperCase()}
                                            </div>
                                        </div>
                                        {/* Tints Strip */}
                                        <div className="h-4 lg:h-6 w-full flex">
                                            {shades.map((shade, i) => (
                                                <div key={i} className="flex-1 h-full hover:flex-[1.5] transition-all" style={{ backgroundColor: shade }} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="w-full h-px bg-white/5 my-4" />

                        <div className="space-y-3">
                            <h3 className="text-[9px] lg:text-[10px] font-bold tracking-widest uppercase text-zinc-500">Cores Base Rápidas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {(Object.keys(roles) as Array<keyof ColorRoles>).map((role) => {
                                    const hex = roles[role as keyof ColorRoles];
                                    return (
                                        <button
                                            key={`fast-${role}`}
                                            onClick={() => copyToClipboard(hex)}
                                            className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group w-full"
                                        >
                                            <div className="w-5 h-5 rounded-md shadow-sm border border-black/10 shrink-0" style={{ backgroundColor: hex }} />
                                            <span className="font-mono text-[8px] lg:text-[9px] text-zinc-400 group-hover:text-white transition-colors truncate">{hex}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                 </motion.div>
                 
                 {/* Catálogo de Efeitos (Movido para a esquerda) */}
                 <motion.div 
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 30 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-zinc-950/40 backdrop-blur-[20px] border border-white/5 rounded-[24px] p-5 shadow-2xl flex flex-col relative overflow-hidden"
                 >
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-lg md:text-xl font-display font-bold text-white/95 tracking-tight">Catálogo de Efeitos</h3>
                        </div>
                        <p className="text-zinc-400 text-[10px] md:text-xs font-medium leading-normal">
                            Microinterações exclusivas. Clique para ver e copiar.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {CATS.map(cat => {
                           const isActive = openCategory === cat.id;
                           const categoryAnims = ANIMATIONS_DB.filter(a => a.category === cat.id);
                           
                           return (
                             <div key={cat.id} className="rounded-xl overflow-hidden border transition-all duration-500 bg-[#1a1a1a] border-white/5">
                                <button 
                                  onClick={() => setOpenCategory(isActive ? null : cat.id)}
                                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                  <h3 className="text-sm font-bold font-display text-white">{cat.label}</h3>
                                  <div className="p-1 rounded-full bg-white/5 text-white/50">
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'rotate-180' : ''}`} />
                                  </div>
                                </button>
                                <AnimatePresence>
                                   {isActive && (
                                     <motion.div
                                       initial={{ height: 0, opacity: 0 }}
                                       animate={{ height: "auto", opacity: 1 }}
                                       exit={{ height: 0, opacity: 0 }}
                                       className="overflow-hidden border-t border-white/5"
                                     >
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                                          {categoryAnims.map(anim => (
                                             <div 
                                               key={anim.id}
                                               onClick={() => setActiveEffects(prev => ({ ...prev, [anim.category]: prev[anim.category] === anim.id ? "" : anim.id }))}
                                               className={`group relative h-24 rounded-lg overflow-hidden cursor-pointer border hover:border-indigo-500/50 transition-all shadow-md hover:shadow-lg bg-black box-border ${activeEffects[anim.category] === anim.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-white/10'}`}
                                             >
                                               <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity">
                                                  {anim.render(roles)}
                                               </div>
                                               
                                               <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                  <span className="text-xs font-bold text-white tracking-wider text-center px-1 drop-shadow-md">{anim.name}</span>
                                               </div>
                                               {activeEffects[anim.category] === anim.id && (
                                                   <button onClick={(e) => { e.stopPropagation(); setModalAnim(anim); }} className="absolute bottom-2 right-2 p-1.5 bg-indigo-500 rounded text-white shadow hover:scale-110 transition-transform">
                                                       <Code2 className="w-3 h-3" />
                                                   </button>
                                               )}
                                             </div>
                                          ))}
                                          {categoryAnims.length === 0 && (
                                              <div className="col-span-full py-4 text-center text-[10px] font-bold tracking-widest uppercase text-white/30">
                                                  Mais...
                                              </div>
                                          )}
                                       </div>
                                     </motion.div>
                                   )}
                                </AnimatePresence>
                             </div>
                           );
                        })}
                    </div>
                 </motion.div>
              </div>

               {/* Right Column: Premium Live SaaS Preview */}
              <motion.div 
                 whileInView={{ opacity: 1, scale: 1 }}
                 initial={{ opacity: 0, scale: 0.95 }}
                 viewport={{ once: false, amount: 0.1 }}
                 transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                 className="h-full flex flex-col gap-8 w-full min-w-0"
              >
                 
                 <div className="flex items-center gap-3 ml-2">
                    <LayoutTemplate className="w-5 h-5 text-white/50" />
                    <span className="font-display font-semibold text-lg text-white/70">Preview em Tempo Real</span>
                 </div>

                 {/* The Fake Interface Frame */}
                 <div 
                    className="w-full flex-1 rounded-[40px] overflow-hidden shadow-2xl ring-1 transition-colors duration-700 ease-out flex flex-col relative"
                    style={{ 
                      backgroundColor: roles.background, 
                      color: roles.text,
                      boxShadow: `0 35px 60px -15px ${roles.primary}40`,
                      borderColor: `${roles.text}10`
                    }}
                  >
                    {/* Glowing Orbs within Preview Background */}
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 blur-[100px] rounded-full mix-blend-screen opacity-20 pointer-events-none transition-colors duration-700" style={{ backgroundColor: roles.primary }} />
                    <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 blur-[100px] rounded-full mix-blend-screen opacity-20 pointer-events-none transition-colors duration-700" style={{ backgroundColor: roles.secondary }} />

                    {/* Fake Browser Toolbar */}
                    <div className="h-12 w-full flex items-center px-6 gap-2 z-10 relative" style={{ backgroundColor: `${roles.text}08`, borderBottom: `1px solid ${roles.text}10`, backdropFilter: 'blur(10px)' }}>
                       <div className="flex gap-1.5">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${roles.text}20` }} />
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${roles.text}20` }} />
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${roles.text}20` }} />
                       </div>
                       <div className="mx-auto rounded-md px-24 py-1 text-xs font-medium opacity-50 flex items-center gap-2" style={{ backgroundColor: `${roles.text}10` }}>
                          <LockIcon /> acme.inc
                       </div>
                    </div>

                    {/* SaaS Navbar */}
                    <nav className="flex items-center justify-between px-8 py-6 z-10 relative" style={{ borderBottom: `1px solid ${roles.text}05` }}>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: roles.primary, boxShadow: `0 0 20px ${roles.primary}60` }}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getContrast(roles.primary) }} />
                         </div>
                         <strong className="font-display text-xl transition-colors duration-500 font-bold tracking-tight" style={{ color: roles.text }}>Acme</strong>
                      </div>
                      <div className="hidden md:flex items-center gap-8 font-medium text-sm transition-colors duration-500" style={{ color: `${roles.text}80` }}>
                        <span className="hover:opacity-100 cursor-pointer transition-opacity">Produto</span>
                        <span className="hover:opacity-100 cursor-pointer transition-opacity">Soluções</span>
                        <span className="hover:opacity-100 cursor-pointer transition-opacity">Preços</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden sm:block cursor-pointer transition-opacity hover:opacity-100" style={{ color: `${roles.text}80` }}>Login</span>
                        <button 
                          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center"
                          style={{ backgroundColor: roles.text, color: getContrast(roles.text) }}
                        >
                          Registrar
                        </button>
                      </div>
                    </nav>

                    {/* SaaS Content */}
                                         <main className={`flex-1 px-8 py-16 flex flex-col items-center justify-center text-center z-10 relative overflow-y-auto ${activeEffects['fundos'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['fundos'])?.className : ''}`} style={!activeEffects['fundos'] ? { backgroundColor: `${roles.text}03` } : undefined}>
                           {/* Hero Badge */}
                       <motion.div 
                            whileInView={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 20 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase border flex items-center gap-2 transition-colors duration-500 shadow-sm backdrop-blur-md"
                            style={{ color: roles.accent, borderColor: `${roles.accent}40`, backgroundColor: `${roles.accent}15` }}>
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: roles.accent }} />
                          Versão 2.0 Disponível
                       </motion.div>

                       <motion.h1 
                          whileInView={{ opacity: 1, y: 0 }}
                          initial={{ opacity: 0, y: 20 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={`text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight max-w-4xl leading-[1.1] mb-8 ${activeEffects['textos'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['textos'])?.className : ''}`}
                        >
                          <span style={!activeEffects['textos'] ? { color: roles.text } : undefined}>Construa o futuro </span>
                          <span style={!activeEffects['textos'] ? { color: roles.primary, backgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: `linear-gradient(to right, ${roles.primary}, ${roles.secondary})` } : undefined}>mais rápido</span>
                        </motion.h1>
                       <motion.p 
                         whileInView={{ opacity: 1, y: 0 }}
                         initial={{ opacity: 0, y: 20 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.5, delay: 0.2 }}
                         className="text-lg md:text-xl max-w-2xl font-medium mb-12" style={{ color: `${roles.text}80` }}>
                         Demonstração de landing page premium. Clique nos efeitos à esquerda para aplicá-los instantaneamente a estes elementos.
                       </motion.p>
                       
                        <motion.div 
                           whileInView={{ opacity: 1, y: 0 }}
                           initial={{ opacity: 0, y: 20 }}
                           viewport={{ once: true }}
                           transition={{ duration: 0.5, delay: 0.3 }}
                           className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center mb-24 relative z-20"
                        >
                           <button 
                             className={`px-8 py-4 font-bold transition-all flex items-center gap-2 whitespace-nowrap text-lg ${activeEffects['interacoes'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['interacoes'])?.className : 'rounded-2xl hover:scale-105 shadow-2xl'}`}
                             style={!activeEffects['interacoes'] ? { backgroundColor: roles.primary, color: getContrast(roles.primary), boxShadow: `0 10px 40px -10px ${roles.primary}` } : undefined}
                           >
                             Começar agora
                             <ChevronRight className="w-5 h-5 ml-1" />
                           </button>
                           
                           <button 
                             className={`px-8 py-4 font-bold transition-all flex items-center gap-2 whitespace-nowrap text-lg ${activeEffects['interacoes'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['interacoes'])?.className : 'rounded-2xl hover:bg-black/5 border-2'}`}
                             style={!activeEffects['interacoes'] ? { color: roles.text, borderColor: `${roles.text}20` } : undefined}
                           >
                             Ver documentação
                           </button>
                        </motion.div>

                        <div className="w-full max-w-5xl mb-24 grid grid-cols-1 md:grid-cols-2 gap-6 text-left relative z-20">
                            <div className={`aspect-[4/3] rounded-3xl w-full flex-1 overflow-hidden bg-black/10 ${activeEffects['imagens'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['imagens'])?.className : ''}`}>
                               <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop" alt="Demo" className={!activeEffects['imagens'] ? 'w-full h-full object-cover rounded-3xl' : ''} />
                               {activeEffects['imagens'] && (
                                   <div className="overlay">
                                        <span className="text-white font-bold text-lg" style={{ color: roles.accent }}>Feature</span>
                                   </div>
                               )}
                            </div>
                            <div className="flex flex-col justify-center px-4 md:px-12">
                               <h3 className={`text-3xl font-display font-bold mb-4 ${activeEffects['textos'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['textos'])?.className : ''}`} style={!activeEffects['textos'] ? { color: roles.text } : undefined}>Efeitos de Imagem</h3>
                               <p className="text-xl font-medium leading-relaxed" style={{ color: `${roles.text}80` }}>Teste microinterações e imagens clicando na categoria Mídia & Zoom.</p>
                            </div>
                        </div>

                        {/* Bento Features Mock */}
                        <div className="w-full max-w-5xl rounded-[32px] p-2 border shadow-2xl relative mb-12" style={{ backgroundColor: `${roles.background}80`, borderColor: `${roles.text}10`, boxShadow: `0 30px 60px -12px ${roles.secondary}30`, backdropFilter: 'blur(20px)' }}>
                           <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[32px] pointer-events-none" />
                           
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {/* Feature 1 */}
                              <div className={`p-8 text-left transition-colors duration-500 overflow-hidden relative ${activeEffects['cards'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['cards'])?.className : 'rounded-[24px]'}`} style={!activeEffects['cards'] ? { backgroundColor: roles.background } : undefined}>
                                 <div className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-20 rounded-full pointer-events-none" style={{ backgroundColor: roles.accent }} />
                                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md relative z-10" style={{ backgroundColor: `${roles.accent}15` }}>
                                    <Zap className="w-6 h-6" style={{ color: roles.accent }} />
                                 </div>
                                 <h3 className="text-xl font-bold mb-3 relative z-10" style={{ color: roles.text }}>Desempenho</h3>
                                 <p className="text-base font-medium leading-relaxed relative z-10" style={{ color: `${roles.text}70` }}>
                                    Otimizado para renderizar a 60fps constantes.
                                 </p>
                              </div>
                              
                              {/* Feature 2 */}
                              <div className={`p-8 text-left transition-colors duration-500 overflow-hidden relative ${activeEffects['cards'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['cards'])?.className : 'rounded-[24px]'}`} style={!activeEffects['cards'] ? { backgroundColor: roles.background } : undefined}>
                                 <div className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-20 rounded-full pointer-events-none" style={{ backgroundColor: roles.secondary }} />
                                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md relative z-10" style={{ backgroundColor: `${roles.secondary}15` }}>
                                    <Shield className="w-6 h-6" style={{ color: roles.secondary }} />
                                 </div>
                                 <h3 className="text-xl font-bold mb-3 relative z-10" style={{ color: roles.text }}>Segurança</h3>
                                 <p className="text-base font-medium leading-relaxed relative z-10" style={{ color: `${roles.text}70` }}>
                                    Isolamento de dados por padrão com criptografia.
                                 </p>
                              </div>

                              {/* Feature 3 */}
                              <div className={`p-8 text-left transition-colors duration-500 overflow-hidden relative ${activeEffects['cards'] ? ANIMATIONS_DB.find(a => a.id === activeEffects['cards'])?.className : 'rounded-[24px]'}`} style={!activeEffects['cards'] ? { backgroundColor: roles.background } : undefined}>
                                 <div className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-20 rounded-full pointer-events-none" style={{ backgroundColor: roles.primary }} />
                                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md relative z-10" style={{ backgroundColor: `${roles.primary}15` }}>
                                    <BarChart3 className="w-6 h-6" style={{ color: roles.primary }} />
                                 </div>
                                 <h3 className="text-xl font-bold mb-3 relative z-10" style={{ color: roles.text }}>Análise</h3>
                                 <p className="text-base font-medium leading-relaxed relative z-10" style={{ color: `${roles.text}70` }}>
                                    Entenda o comportamento e escale suas taxas.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </main>
                 </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
           {modalAnim && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 lg:p-8"
                onClick={() => setModalAnim(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full"
                >
                  <div className="flex items-center justify-between p-6 border-b border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                           <Code2 className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-xl font-display font-bold text-white">{modalAnim.name}</h2>
                           <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{modalAnim.category}</span>
                        </div>
                     </div>
                     <button onClick={() => setModalAnim(null)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-0 flex flex-col md:flex-row">
                     {/* Preview area in modal */}
                     <div className="flex-1 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative min-h-[300px]" style={{ backgroundColor: roles.background }}>
                        {modalAnim.render(roles)}
                     </div>
                     
                     {/* Code block area */}
                     <div className="w-full md:w-[45%] flex flex-col bg-zinc-950">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Código</span>
                            <button onClick={() => {
                                 navigator.clipboard.writeText(modalAnim.code(roles));
                               }} 
                               className="flex items-center gap-2 text-xs font-bold transition-all px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
                            >
                               <Copy className="w-3 h-3" /> Copiar Regras
                            </button>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-300">
                              <code>{modalAnim.code(roles)}</code>
                            </pre>
                        </div>
                     </div>
                  </div>
                </motion.div>
              </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Small UI Utility
function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  )
}

