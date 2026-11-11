import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Check, TriangleAlert } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(0);

  const toast = useCallback((message, tone = "ok") => {
    const id = nextId.current++;
    setItems((list) => [...list, { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col gap-2 sm:right-8 sm:bottom-8"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="anim-pop pointer-events-auto flex items-center gap-3 rounded-lg bg-night px-4 py-3 text-sm text-white"
          >
            {t.tone === "ok" ? (
              <Check size={16} className="text-amber" />
            ) : (
              <TriangleAlert size={16} className="text-amber" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
