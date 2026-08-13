import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">!</div>
      <h1 className="font-display text-2xl font-bold text-primary-900">{t('errors.generic')}</h1>
      <button type="button" className="btn-primary" onClick={onReset}>
        {t('common.retry')}
      </button>
    </div>
  );
}
