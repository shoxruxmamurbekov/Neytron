import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ImagePlus, RotateCcw, Send, X, Bot, User } from 'lucide-react';
import { Badge, Button, Card, Disclaimer, PageHeader, Select, Spinner } from '../components/ui';
import { assistantCategories, defaultMockReply, exampleQuestions, mockReplies } from '../data/assistant';
import type { ChatMessage } from '../types';

const MAX_CHARS = 500;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

function mockAnswer(question: string): string {
  const q = question.toLowerCase();
  const hit = mockReplies.find((m) => m.keywords.some((k) => q.includes(k)));
  return hit ? hit.reply : defaultMockReply;
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<string>(assistantCategories[0]);
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  // Revoke object URL on change/unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, [image]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  const onFile = (file: File | undefined) => {
    setImageError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setImageError('Faqat PNG, JPG yoki WEBP rasm yuklash mumkin');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Rasm hajmi 5 MB dan oshmasligi kerak');
      return;
    }
    setImage({ file, url: URL.createObjectURL(file) });
  };

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean && !image) {
      setInputError('Savol yoki rasm kiriting');
      return;
    }
    if (clean.length > MAX_CHARS) {
      setInputError(`Savol ${MAX_CHARS} belgidan oshmasin`);
      return;
    }
    setInputError(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: category !== 'Umumiy' ? `[${category}] ${clean}` : clean || 'Rasm yuborildi',
      imageName: image?.file.name,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setImage(null);
    setPending(true);

    timer.current = window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: mockAnswer(clean),
          simulated: true,
        },
      ]);
      setPending(false);
    }, 900);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pending) send(input);
  };

  const newChat = () => {
    window.clearTimeout(timer.current);
    setMessages([]);
    setPending(false);
    setInput('');
    setInputError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI elektr yordamchisi"
        description="Savolingizni yozing, kategoriya tanlang yoki rasm yuklang."
        actions={
          <Button variant="secondary" onClick={newChat} disabled={messages.length === 0 && !pending}>
            <RotateCcw className="size-4" aria-hidden /> Yangi suhbat
          </Button>
        }
      />

      <Disclaimer>
        Bu prototip: javoblar <strong>simulyatsiya</strong> qilinadi va haqiqiy AI emas. Xavfli holatda malakali elektrikka murojaat qiling.
      </Disclaimer>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Chat */}
        <Card className="flex min-h-[460px] flex-col p-0">
          <div ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length === 0 && !pending ? (
              <div className="m-auto flex max-w-md flex-col items-center gap-3 text-center">
                <Bot className="size-10 text-brand-500" aria-hidden />
                <p className="font-medium">Suhbat hali boshlanmagan</p>
                <p className="text-sm text-[var(--text-muted)]">Quyidagi namunalardan birini tanlang yoki o‘zingiz yozing.</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${
                      m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-[var(--surface-muted)] text-brand-600 dark:text-brand-100'
                    }`}
                    aria-hidden
                  >
                    {m.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-[var(--surface-muted)]'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.imageName && <p className="mt-1 text-xs opacity-80">📎 {m.imageName}</p>}
                    {m.simulated && (
                      <p className="mt-2">
                        <Badge tone="warning">Simulyatsiya</Badge>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            {pending && (
              <div className="flex gap-3">
                <div className="grid size-8 place-items-center rounded-full bg-[var(--surface-muted)]" aria-hidden>
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                  <Spinner label="Javob tayyorlanmoqda…" />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={onSubmit} className="border-t border-[var(--border)] p-4">
            {image && (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-[var(--border)] p-2">
                <img src={image.url} alt="Yuklangan rasm oldindan ko‘rinishi" className="size-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{image.file.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{(image.file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="Rasmni olib tashlash"
                  className="grid size-8 place-items-center rounded-lg hover:bg-[var(--surface-muted)]"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Rasm yuklash"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-muted)]"
              >
                <ImagePlus className="size-5" aria-hidden />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  onFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor="question" className="sr-only">
                  Elektr savoli
                </label>
                <textarea
                  id="question"
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!pending) send(input);
                    }
                  }}
                  placeholder="Masalan: avtomatim nega uchyapti?"
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? 'question-error' : undefined}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {inputError && (
                  <p id="question-error" role="alert" className="text-xs text-danger">
                    {inputError}
                  </p>
                )}
                <p className="text-right text-xs text-[var(--text-muted)]">
                  {input.length}/{MAX_CHARS}
                </p>
              </div>
              <Button type="submit" disabled={pending} aria-label="Yuborish" className="h-11">
                <Send className="size-4" aria-hidden />
                <span className="hidden sm:inline">Yuborish</span>
              </Button>
            </div>
            {imageError && (
              <p role="alert" className="mt-2 text-xs text-danger">
                {imageError}
              </p>
            )}
          </form>
        </Card>

        {/* Side panel */}
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <label htmlFor="category" className="text-sm font-medium">
              Muammo kategoriyasi
            </label>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {assistantCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Card>

          <Card className="flex flex-col gap-3">
            <p className="text-sm font-medium">Namunaviy savollar</p>
            <div className="flex flex-col gap-2">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={pending}
                  onClick={() => send(q)}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm transition-colors hover:border-brand-500/50 hover:bg-[var(--surface-muted)] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>

          <p className="px-1 text-xs text-[var(--text-muted)]">Maks. rasm hajmi: 5 MB · PNG, JPG, WEBP</p>
        </aside>
      </div>
    </div>
  );
}
