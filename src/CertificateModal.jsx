import { useState, useEffect, useRef } from "react";

// ─── CERTIFICATE MODAL ────────────────────────────────────────────────────────
// Canvas-based completion certificate. Download as PNG + LinkedIn share.
// Props:
//   isOpen       — boolean
//   onClose      — () => void
//   pathTitle    — string (e.g. "First Principles: NLP → Production")
//   pathColor    — hex string (e.g. "#8b5cf6")
//   pathAbbr     — string (e.g. "FP")
//   user         — Supabase user object or null
//   stepsCompleted — number
//   totalSteps   — number

export default function CertificateModal({
  isOpen, onClose, pathTitle, pathColor = "#06b6d4",
  pathAbbr = "GSL", user, stepsCompleted = 0, totalSteps = 0
}) {
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const userName = user?.user_metadata?.full_name
    || (user?.email ? user.email.split("@")[0].replace(/[._-]/g, " ") : null)
    || "AI Engineer";

  const completionDate = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    drawCertificate(canvasRef.current);
  }, [isOpen, pathTitle, pathColor, pathAbbr, userName, completionDate]);

  function drawCertificate(canvas) {
    const W = 900, H = 560;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = "#0c0a08";
    ctx.fillRect(0, 0, W, H);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Inner border (path-colored)
    ctx.strokeStyle = pathColor + "50";
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Top accent bar
    const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
    grad.addColorStop(0, pathColor + "00");
    grad.addColorStop(0.3, pathColor + "cc");
    grad.addColorStop(0.7, pathColor + "cc");
    grad.addColorStop(1, pathColor + "00");
    ctx.fillStyle = grad;
    ctx.fillRect(40, 40, W - 80, 3);

    // Bottom accent bar
    ctx.fillRect(40, H - 43, W - 80, 3);

    // ── VERIFIED BADGE (top-left) ────────────────────────────────────────────
    ctx.fillStyle = pathColor + "18";
    ctx.strokeStyle = pathColor + "50";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(50, 55, 90, 22, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = pathColor;
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("✓ VERIFIED", 62, 70);

    // GSL brand (top-right)
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("GenAI Systems Lab", W - 50, 70);

    // ── MAIN CONTENT ─────────────────────────────────────────────────────────
    // "Certificate of Completion" label
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "0.15em";
    ctx.fillText("C E R T I F I C A T E   O F   C O M P L E T I O N", W / 2, 140);

    // Decorative line
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, 155); ctx.lineTo(W / 2 + 120, 155);
    ctx.stroke();

    // Path name (main title)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";

    // Handle long path names with word wrap
    const maxWidth = W - 140;
    const words = pathTitle.split(" ");
    let line = ""; const lines = [];
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line); line = word;
      } else { line = test; }
    }
    lines.push(line);
    const lineH = 42;
    const startY = lines.length > 1 ? 210 : 230;
    lines.forEach((l, i) => {
      ctx.fillText(l, W / 2, startY + i * lineH);
    });

    // "Awarded to" label
    const awardedY = startY + lines.length * lineH + 30;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillText("AWARDED TO", W / 2, awardedY);

    // User name
    ctx.fillStyle = pathColor;
    ctx.font = "italic bold 26px Georgia, 'Times New Roman', serif";
    ctx.fillText(userName, W / 2, awardedY + 36);

    // Steps completed
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillText(`${stepsCompleted} of ${totalSteps} steps completed`, W / 2, awardedY + 65);

    // ── BOTTOM SECTION ────────────────────────────────────────────────────────
    const bottomY = H - 75;

    // Date (left)
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText("DATE COMPLETED", 50, bottomY);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText(completionDate, 50, bottomY + 18);

    // Path abbr badge (center)
    ctx.textAlign = "center";
    ctx.fillStyle = pathColor + "18";
    ctx.strokeStyle = pathColor + "50";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 24, bottomY - 8, 48, 30, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = pathColor;
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText(pathAbbr, W / 2, bottomY + 12);

    // URL (right)
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText("genai-systems-lab-ivory.vercel.app", W - 50, bottomY + 18);
  }

  function handleDownload() {
    if (!canvasRef.current) return;
    setDownloading(true);
    const safeName = pathTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase().replace(/-+/g, "-");
    const link = document.createElement("a");
    link.download = `gsl-certificate-${safeName}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setTimeout(() => setDownloading(false), 800);
  }

  function handleLinkedIn() {
    const url = encodeURIComponent("https://genai-systems-lab-ivory.vercel.app");
    const text = encodeURIComponent(
      `Just completed "${pathTitle}" on GenAI Systems Lab — a free platform for AI engineering interview prep. Covered production RAG, agents, evals, and LLMOps with hands-on failure simulations. #AIEngineering #GenAI`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank");
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rounded-2xl overflow-hidden max-w-3xl w-full"
        style={{ background: "#0f0e0c", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 64px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: pathColor }}>
              Certificate Ready
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        {/* Canvas preview */}
        <div className="p-4 flex items-center justify-center" style={{ background: "#080706" }}>
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg"
            style={{ maxWidth: 680, display: "block" }}
          />
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-center gap-3 border-t border-zinc-800/60">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
            style={{ background: pathColor, color: "#000" }}
          >
            {downloading ? "Downloading..." : "Download PNG"}
          </button>
          <button
            onClick={handleLinkedIn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(10,102,194,0.15)", border: "1px solid rgba(10,102,194,0.4)", color: "#60a5fa" }}
          >
            Share on LinkedIn
          </button>
          <p className="text-[11px] text-zinc-600 sm:ml-auto text-center sm:text-right">
            Download the PNG and attach it when sharing — LinkedIn's share button links to the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
