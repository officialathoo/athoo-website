import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link, ImageIcon, Film, Minus, Type, Palette, Eye, EyeOff, AlignLeft,
} from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const COLORS = [
  "#000000","#374151","#6b7280","#ef4444","#f97316","#eab308",
  "#22c55e","#0057FF","#8b5cf6","#ec4899","#ffffff","#fef08a",
];

function getVideoEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const ytShort = url.match(/youtube\.com\/shorts\/([^?&\s]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  if (url.includes("facebook.com/") && url.includes("/videos/")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
  }
  return url;
}

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);
  const [showColors, setShowColors] = useState<"text" | "bg" | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || "";
      initialized.current = true;
      countWords();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function countWords() {
    const text = editorRef.current?.textContent || "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);
  }

  function emit() {
    if (editorRef.current) { onChange(editorRef.current.innerHTML); countWords(); }
  }

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val ?? undefined);
    editorRef.current?.focus();
    emit();
  }

  function insertLink() {
    const saved = window.getSelection()?.getRangeAt(0);
    const url = window.prompt("Enter link URL:", "https://");
    if (!url) return;
    if (saved) { const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(saved); }
    exec("createLink", url);
    editorRef.current?.querySelectorAll("a:not([target])").forEach((a) => {
      a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer");
    });
  }

  function insertImage() {
    const url = window.prompt("Image URL:", "https://");
    if (!url) return;
    const alt = window.prompt("Alt text (describe the image):", "") || "";
    exec("insertHTML",
      `<figure style="margin:1.5rem 0;text-align:center"><img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:0.5rem;display:inline-block" loading="lazy" />${alt ? `<figcaption style="color:#6b7280;font-size:0.85em;margin-top:0.5rem">${alt}</figcaption>` : ""}</figure>`
    );
  }

  function insertVideo() {
    const url = window.prompt("Video URL (YouTube, TikTok, Facebook, Instagram):", "https://");
    if (!url) return;
    if (url.includes("tiktok.com") || url.includes("instagram.com")) {
      exec("insertHTML",
        `<div style="text-align:center;margin:1.5rem 0"><a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:0.6rem 1.5rem;background:#0057FF;color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:700;font-size:0.9rem">▶ Watch Video</a></div>`
      );
      return;
    }
    const embedUrl = getVideoEmbed(url);
    exec("insertHTML",
      `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;border-radius:0.75rem;background:#000"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy" title="Embedded video"></iframe></div>`
    );
  }

  function btn(title: string, onClick: () => void, icon: React.ReactNode) {
    return (
      <button type="button" title={title}
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        className="rounded p-1.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none"
      >{icon}</button>
    );
  }

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (preview) {
    return (
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Preview Mode</span>
          <button type="button" onClick={() => setPreview(false)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0057FF] hover:bg-blue-50">
            <EyeOff className="h-3.5 w-3.5" /> Back to Editor
          </button>
        </div>
        <div
          className="prose prose-sm prose-blue max-w-none p-6 prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white" onClick={() => setShowColors(null)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 p-2">
        <select
          title="Block format"
          className="mr-1 h-8 rounded border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 focus:outline-none"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) exec("formatBlock", v);
            (e.target as HTMLSelectElement).value = "";
          }}
        >
          <option value="">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Code Block</option>
        </select>

        <div className="mx-1 h-5 w-px bg-gray-200" />
        {btn("Bold (Ctrl+B)", () => exec("bold"), <Bold className="h-3.5 w-3.5" />)}
        {btn("Italic (Ctrl+I)", () => exec("italic"), <Italic className="h-3.5 w-3.5" />)}
        {btn("Underline (Ctrl+U)", () => exec("underline"), <Underline className="h-3.5 w-3.5" />)}
        {btn("Strikethrough", () => exec("strikeThrough"), <Strikethrough className="h-3.5 w-3.5" />)}

        <div className="mx-1 h-5 w-px bg-gray-200" />
        {btn("Bullet List", () => exec("insertUnorderedList"), <List className="h-3.5 w-3.5" />)}
        {btn("Numbered List", () => exec("insertOrderedList"), <ListOrdered className="h-3.5 w-3.5" />)}

        <div className="mx-1 h-5 w-px bg-gray-200" />
        {btn("Insert Link", insertLink, <Link className="h-3.5 w-3.5" />)}
        {btn("Insert Image", insertImage, <ImageIcon className="h-3.5 w-3.5" />)}
        {btn("Embed Video", insertVideo, <Film className="h-3.5 w-3.5" />)}
        {btn("Divider", () => exec("insertHTML", "<hr style='margin:2rem 0;border:none;border-top:2px solid #e5e7eb' />"), <Minus className="h-3.5 w-3.5" />)}

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Text color */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {btn("Text Color", () => setShowColors(c => c === "text" ? null : "text"), <Type className="h-3.5 w-3.5" />)}
          {showColors === "text" && (
            <div className="absolute left-0 top-8 z-50 flex flex-wrap gap-1 rounded-xl border bg-white p-2 shadow-xl" style={{ width: 148 }}>
              {COLORS.map((c) => (
                <button key={c} type="button"
                  onMouseDown={(e) => { e.preventDefault(); exec("foreColor", c); setShowColors(null); }}
                  className="h-5 w-5 rounded-full border border-gray-300 transition-transform hover:scale-125"
                  style={{ background: c }} title={c} />
              ))}
            </div>
          )}
        </div>

        {/* Highlight color */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {btn("Highlight Color", () => setShowColors(c => c === "bg" ? null : "bg"), <Palette className="h-3.5 w-3.5" />)}
          {showColors === "bg" && (
            <div className="absolute left-0 top-8 z-50 flex flex-wrap gap-1 rounded-xl border bg-white p-2 shadow-xl" style={{ width: 148 }}>
              {COLORS.map((c) => (
                <button key={c} type="button"
                  onMouseDown={(e) => { e.preventDefault(); exec("hiliteColor", c); setShowColors(null); }}
                  className="h-5 w-5 rounded-full border border-gray-300 transition-transform hover:scale-125"
                  style={{ background: c }} title={c} />
              ))}
            </div>
          )}
        </div>

        {btn("Clear Formatting", () => exec("removeFormat"), <AlignLeft className="h-3.5 w-3.5" />)}

        {/* Right side: word count + preview */}
        <div className="ml-auto flex items-center gap-2 pl-2">
          <span className="text-xs text-gray-400">{wordCount} words · ~{readTime} min</span>
          <button type="button" onClick={() => setPreview(true)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyDown={(e) => {
          if (e.key === "Tab") { e.preventDefault(); exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;"); }
        }}
        className="blog-editor-content min-h-[280px] p-5 text-gray-800 outline-none"
        data-placeholder="Start writing your blog post here..."
      />
    </div>
  );
}
