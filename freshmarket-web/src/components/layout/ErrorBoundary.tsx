import { Component, type ReactNode } from "react";
import i18n from "../../i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = (key: string) => i18n.t(key);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {t("error.title")}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {t("error.message")}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {t("error.reload")}
          </button>
        </div>
      </div>
    );
  }
}
