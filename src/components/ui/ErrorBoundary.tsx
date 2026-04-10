import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card p-10 text-center space-y-6 border-rose-500/20">
            <div className="h-20 w-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">Ops! Algo deu errado</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ocorreu um erro inesperado na aplicação.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40 border border-white/5">
                <code className="text-xs text-rose-400 font-mono break-all">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw size={18} />
                Tentar Novamente
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
              >
                <Home size={18} />
                Voltar para o Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
