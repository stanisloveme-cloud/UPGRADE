import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';

const { Paragraph, Text } = Typography;

interface Props {
    children?: ReactNode;
    fallbackMessage?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in form/component:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    public handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Произошла ошибка отображения компонента"
                    subTitle={this.props.fallbackMessage || "Форма или её часть не может быть отображена из-за внутренней ошибки данных."}
                    extra={[
                        <Button type="primary" key="console" onClick={this.handleReset}>
                            Попробовать снова
                        </Button>,
                    ]}
                >
                    <div className="desc">
                        <Paragraph>
                            <Text strong style={{ fontSize: 16 }}>
                                Технические детали ошибки:
                            </Text>
                        </Paragraph>
                        <Paragraph style={{ background: '#fafafa', padding: 12, borderRadius: 4, fontFamily: 'monospace', maxHeight: 200, overflow: 'auto' }}>
                            <Text type="danger">{this.state.error?.toString()}</Text>
                            <br />
                            <Text type="secondary" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                                {this.state.errorInfo?.componentStack}
                            </Text>
                        </Paragraph>
                    </div>
                </Result>
            );
        }

        return this.props.children;
    }
}
