import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Automatically reload the page if it's a chunk loading error (happens after new deployments)
        const isChunkLoadFailed = error?.message?.match(/Failed to fetch dynamically imported module|Importing a module script failed/i);
        
        if (isChunkLoadFailed) {
            console.warn('Chunk load failed. Reloading page to fetch latest version...');
            window.location.reload();
            return;
        }

        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 text-red-600 bg-red-50 h-screen flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <pre className="bg-white p-4 rounded border border-red-200 max-w-full overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
