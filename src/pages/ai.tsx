/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-type-assertion, @next/next/no-img-element */
import { NextSeo } from "next-seo";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

declare global {
  interface Window {
    tf: any;
    mobilenet: any;
    toxicity: any;
    cocoSsd: any;
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const STOPWORDS = new Set(
  [
    "a",
    "an",
    "and",
    "the",
    "is",
    "are",
    "of",
    "to",
    "in",
    "for",
    "on",
    "with",
    "as",
    "by",
    "at",
    "from",
    "that",
    "this",
    "it",
    "be",
    "or",
    "was",
    "were",
    "has",
    "had",
    "have",
    "but",
    "not",
    "we",
    "you",
    "they",
    "he",
    "she",
    "them",
    "his",
    "her",
    "their",
    "our",
    "can",
    "will",
    "would",
    "should",
    "could",
    "if",
    "so",
    "than",
    "then",
    "into",
    "about",
    "over",
    "after",
    "before",
  ]
);

const POSITIVE_WORDS = new Set([
  "good",
  "great",
  "excellent",
  "amazing",
  "positive",
  "happy",
  "love",
  "like",
  "wonderful",
  "fantastic",
  "best",
  "enjoy",
  "pleased",
  "success",
]);

const NEGATIVE_WORDS = new Set([
  "bad",
  "terrible",
  "awful",
  "hate",
  "dislike",
  "sad",
  "angry",
  "worst",
  "horrible",
  "negative",
  "problem",
  "issue",
  "fail",
  "broken",
]);

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function extractiveSummarize(text: string, compression: number): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "";
  const tokensBySentence = sentences.map((s) =>
    tokenize(s).filter((t) => !STOPWORDS.has(t))
  );
  const freq = new Map<string, number>();
  for (const toks of tokensBySentence) {
    for (const t of toks) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  const scores = tokensBySentence.map((toks) =>
    toks.reduce((acc, t) => acc + (freq.get(t) ?? 0), 0)
  );
  const targetCount = Math.max(1, Math.floor(sentences.length * (1 - compression)));
  const ranked = sentences
    .map((s, i) => ({ s, i, score: scores[i] ?? 0 }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, targetCount)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return ranked.join(" ");
}

function keywordExtract(text: string, topN = 10): string[] {
  const tokens = tokenize(text).filter((t) => !STOPWORDS.has(t));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);
}

function lexiconSentiment(text: string) {
  const toks = tokenize(text);
  let pos = 0;
  let neg = 0;
  for (const t of toks) {
    if (POSITIVE_WORDS.has(t)) pos += 1;
    if (NEGATIVE_WORDS.has(t)) neg += 1;
  }
  const score = pos - neg;
  const label = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  return { score, pos, neg, label };
}

export default function AIPlaygroundPage() {
  const [text, setText] = useState("");
  const [compression, setCompression] = useState(0.5);
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const sentiment = useMemo(() => lexiconSentiment(text), [text]);

  // TTS
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => setVoices(synth.getVoices());
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }, []);
  const speak = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!text.trim()) return;
    const utter = new SpeechSynthesisUtterance(text);
    const selected = voices.find((v) => v.name === voiceName);
    if (selected) utter.voice = selected;
    utter.onend = () => setTtsSpeaking(false);
    setTtsSpeaking(true);
    window.speechSynthesis.speak(utter);
  }, [text, voiceName, voices]);
  const stopSpeak = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setTtsSpeaking(false);
  }, []);

  // STT
  const [sttSupported, setSttSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Rec) setSttSupported(true);
  }, []);
  const startListening = useCallback(() => {
    if (!sttSupported) return;
    const Rec = (window.SpeechRecognition || window.webkitSpeechRecognition) as any;
    const rec = new Rec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        finalText += res[0].transcript;
      }
      setTranscript(finalText);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [sttSupported]);
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    setListening(false);
  }, []);

  // TFJS models
  const [tfReady, setTfReady] = useState(false);
  const [mobilenetReady, setMobilenetReady] = useState(false);
  const [toxicityReady, setToxicityReady] = useState(false);
  const [toxThreshold, setToxThreshold] = useState(0.85);
  const mobilenetModelRef = useRef<any>(null);
  const toxicityModelRef = useRef<any>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imgPreds, setImgPreds] = useState<{ className: string; probability: number }[]>(
    []
  );
  const [toxInput, setToxInput] = useState("");
  const [toxResults, setToxResults] = useState<any[]>([]);

  const loadMobilenet = useCallback(async () => {
    if (!tfReady || typeof window === "undefined") return;
    if (mobilenetModelRef.current) {
      setMobilenetReady(true);
      return;
    }
    try {
      mobilenetModelRef.current = await window.mobilenet.load();
      setMobilenetReady(true);
    } catch {
      setMobilenetReady(false);
    }
  }, [tfReady]);

  const classifyImage = useCallback(async () => {
    if (!mobilenetModelRef.current || !imageRef.current) return;
    const preds = await mobilenetModelRef.current.classify(imageRef.current);
    setImgPreds(preds);
  }, []);

  const loadToxicity = useCallback(async () => {
    if (!tfReady || typeof window === "undefined") return;
    if (toxicityModelRef.current) {
      setToxicityReady(true);
      return;
    }
    try {
      toxicityModelRef.current = await window.toxicity.load(toxThreshold);
      setToxicityReady(true);
    } catch {
      setToxicityReady(false);
    }
  }, [tfReady, toxThreshold]);

  const runToxicity = useCallback(async () => {
    if (!toxicityModelRef.current || !toxInput.trim()) return;
    const res = await toxicityModelRef.current.classify([toxInput]);
    setToxResults(res);
  }, [toxInput]);

  const onSelectImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImgPreds([]);
  }, []);

  const generateSummary = useCallback(() => {
    setSummary(extractiveSummarize(text, compression));
  }, [text, compression]);

  const generateKeywords = useCallback(() => {
    setKeywords(keywordExtract(text, 12));
  }, [text]);

  return (
    <>
      <NextSeo
        title="AI Playground — In-browser demos"
        description="Try AI features that run in your browser: summarization, sentiment, keywords, speech, toxicity, and image classification."
        openGraph={{
          title: "AI Playground — In-browser demos",
          description: "Try AI features that run in your browser: summarization, sentiment, keywords, speech, toxicity, and image classification.",
        }}
      />

      {/* Load TFJS libs only on this page */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"
        strategy="lazyOnload"
        onLoad={() => setTfReady(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.min.js"
        strategy="lazyOnload"
      />

      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <Section
          title="AI Playground"
          subtitle="All demos run client-side in your browser. No server calls for core functionality."
          className="bg-white"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Summarization (extractive)">
              <div className="space-y-3">
                <Textarea
                  rows={5}
                  placeholder="Paste text to summarize..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-neutral-600">
                    Compression: {(compression * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min={0.2}
                    max={0.8}
                    step={0.05}
                    value={compression}
                    onChange={(e) => setCompression(parseFloat(e.target.value))}
                  />
                  <Button onClick={generateSummary}>Summarize</Button>
                </div>
                {summary && (
                  <div className="rounded-[var(--radius-md)] border bg-neutral-50 p-3 text-sm">
                    {summary}
                  </div>
                )}
              </div>
            </Card>

            <Card title="Keyword extraction">
              <div className="space-y-3">
                <Textarea
                  rows={5}
                  placeholder="Paste text..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={generateKeywords}>
                    Extract
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-[var(--radius-sm)] bg-neutral-100 px-2 py-1 text-xs"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card title="Sentiment (lexicon-based)">
              <div className="space-y-3">
                <Textarea
                  rows={4}
                  placeholder="Type a sentence..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="text-sm text-neutral-700">
                  <div>
                    Label: <span className="font-medium">{sentiment.label}</span>
                  </div>
                  <div>Score: {sentiment.score}</div>
                  <div>
                    Pos: {sentiment.pos} / Neg: {sentiment.neg}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Text-to-Speech (TTS)">
              <div className="space-y-3">
                <Textarea
                  rows={3}
                  placeholder="Enter text to speak..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-[var(--radius-md)] border px-2 py-1 text-sm"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                  >
                    <option value="">Default voice</option>
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} {v.lang ? `(${v.lang})` : ""}
                      </option>
                    ))}
                  </select>
                  {!ttsSpeaking ? (
                    <Button onClick={speak}>Speak</Button>
                  ) : (
                    <Button variant="secondary" onClick={stopSpeak}>
                      Stop
                    </Button>
                  )}
                </div>
                {typeof window !== "undefined" && !("speechSynthesis" in window) && (
                  <p className="text-xs text-red-600">
                    Your browser does not support Speech Synthesis.
                  </p>
                )}
              </div>
            </Card>

            <Card title="Speech-to-Text (STT)">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {!listening ? (
                    <Button onClick={startListening} disabled={!sttSupported}>
                      Start
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={stopListening}>
                      Stop
                    </Button>
                  )}
                  {!sttSupported && (
                    <span className="text-xs text-red-600">
                      STT not supported in this browser.
                    </span>
                  )}
                </div>
                <div className="rounded-[var(--radius-md)] border bg-neutral-50 p-3 text-sm min-h-16">
                  {transcript || "Transcript will appear here..."}
                </div>
              </div>
            </Card>

            <Card title="Image classification (MobileNet)">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" onChange={onSelectImage} />
                  <Button onClick={loadMobilenet} disabled={!tfReady}>
                    {mobilenetReady ? "Model loaded" : "Load model"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={classifyImage}
                    disabled={!mobilenetReady || !imagePreview}
                  >
                    Classify
                  </Button>
                </div>
                {imagePreview && (
                  <div className="flex items-start gap-4">
                    <img
                      ref={imageRef}
                      src={imagePreview}
                      alt="preview"
                      className="h-40 w-40 rounded-[var(--radius-md)] object-cover"
                    />
                    <div className="space-y-1 text-sm">
                      {imgPreds.length === 0 && <div>No predictions yet.</div>}
                      {imgPreds.map((p, idx) => (
                        <div key={idx}>
                          {p.className} — {(p.probability * 100).toFixed(1)}%
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!tfReady && (
                  <p className="text-xs text-neutral-600">Loading TFJS in the background…</p>
                )}
              </div>
            </Card>

            <Card title="Toxicity classification">
              <div className="space-y-3">
                <Textarea
                  rows={3}
                  placeholder="Type text to analyze for toxicity..."
                  value={toxInput}
                  onChange={(e) => setToxInput(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-neutral-600">
                    Threshold: {(toxThreshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={0.95}
                    step={0.01}
                    value={toxThreshold}
                    onChange={(e) => setToxThreshold(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={loadToxicity} disabled={!tfReady}>
                    {toxicityReady ? "Model loaded" : "Load model"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={runToxicity}
                    disabled={!toxicityReady || !toxInput.trim()}
                  >
                    Analyze
                  </Button>
                </div>
                {toxResults.length > 0 && (
                  <div className="rounded-[var(--radius-md)] border bg-neutral-50 p-3 text-sm">
                    {toxResults.map((r: any) => {
                      const m = r.results?.[0];
                      const prob = m?.match ? m.probabilities[1] : m?.probabilities?.[0] ?? 0;
                      return (
                        <div key={r.label} className="flex items-center justify-between">
                          <span className="capitalize">{r.label.replace(/_/g, " ")}</span>
                          <span>{((prob ?? 0) * 100).toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Section>
      </main>
    </>
  );
}


