import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import Icon from "../components/ui/Icon";
import { IconCreditCard, IconCheck, IconX, IconArrowRight } from "../components/ui/icons";

type Status = "loading" | "success" | "error";

export default function PaymentResultPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const [status, setStatus]     = useState<Status>("loading");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const run = async () => {
      const sessionId = params.get("session_id");
      if (!sessionId) { setStatus("error"); return; }
      try {
        await client.post(endpoints.payments.confirm, { externalTransactionId: sessionId });
        setStatus("success");
      } catch { setStatus("error"); }
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    if (countdown === 0) { navigate("/orders"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8 text-center">

        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5 animate-pulse">
              <Icon icon={IconCreditCard} size={22} className="text-blue-400" stroke={1.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">A confirmar pagamento</h2>
            <p className="text-sm text-slate-400">Por favor aguarda um momento...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <Icon icon={IconCheck} size={22} className="text-emerald-700" stroke={2.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Pagamento confirmado</h2>
            <p className="text-sm text-slate-400 mb-6">
              A tua encomenda está a ser processada.
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 mb-5">
              <p className="text-xs text-emerald-700 font-medium tabular">
                A redirecionar em {countdown}s...
              </p>
            </div>
            <button onClick={() => navigate("/orders")} className="btn-primary w-full justify-center bg-emerald-700 flex items-center gap-2">
              Ver encomendas
              <Icon icon={IconArrowRight} size={14} />
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Icon icon={IconX} size={22} className="text-red-500" stroke={2.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Erro no pagamento</h2>
            <p className="text-sm text-slate-400 mb-6">
              Não conseguimos confirmar o pagamento. Tenta novamente ou contacta-nos.
            </p>
            <div className="space-y-2">
              <button onClick={() => navigate("/cart")}
                className="btn-primary w-full justify-center bg-amber-500 hover:bg-amber-400">
                Tentar novamente
              </button>
              <button onClick={() => navigate("/orders")} className="btn-secondary w-full justify-center">
                Ver encomendas
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
