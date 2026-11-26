import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { errMsg } from "../api/client";

// Memuat data setiap layar difokuskan. `refresh` dipakai untuk tarik-untuk-muat-ulang.
export default function useLoad(loader, pollMs = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [refreshing, setRefreshing] = useState(false);
  const ref = useRef(loader);
  ref.current = loader;

  const run = useCallback(async () => {
    try {
      const data = await ref.current();
      setState({ data, loading: false, error: "" });
    } catch (e) {
      setState((p) => ({
        ...p,
        loading: false,
        error: errMsg(e, "Gagal memuat data."),
      }));
    }
  }, []);

  // Muat saat layar fokus, dan (opsional) ulangi tiap pollMs selama layar aktif.
  useFocusEffect(
    useCallback(() => {
      run();
      if (!pollMs) return undefined;
      const t = setInterval(run, pollMs);
      return () => clearInterval(t);
    }, [run, pollMs]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  }, [run]);

  return { ...state, refreshing, refresh, reload: run };
}
