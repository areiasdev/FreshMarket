import { Component, type ReactNode } from "react";

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

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Algo correu mal
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Ocorreu um erro inesperado. Por favor recarregue a página.
            Se o problema persistir, contacte-nos.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
