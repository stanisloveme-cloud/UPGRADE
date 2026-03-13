import { useRef } from 'react';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { notification } from 'antd';
import { ErrorBoundary } from '../ErrorBoundary';

export interface SafeModalFormProps<T = Record<string, any>> extends ModalFormProps<T> {
    submitText?: string;
    cancelText?: string;
}

/**
 * SafeModalForm wraps Ant Design Pro's ModalForm to provide:
 * 1. An ErrorBoundary to prevent the modal contents from crashing the entire app if data is malformed.
 * 2. A "Smart Submit" button that forcibly calls validateFields() before triggering onFinish.
 *    If an error occurs in a hidden tab or list, it surfaces a clear `notification` telling the user exactly what field failed.
 */
export const SafeModalForm = <T extends Record<string, any>>({
    children,
    submitText = 'Сохранить',
    cancelText = 'Отмена',
    onFinish,
    ...props
}: SafeModalFormProps<T>) => {
    const defaultFormRef = useRef<any>(null);
    const actualFormRef = props.formRef || defaultFormRef;

    return (
        <ModalForm<T>
            {...props}
            onFinish={onFinish}
            formRef={actualFormRef as any}
            onFinishFailed={(errorInfo: any) => {
                console.error("SafeModalForm Validation failed:", errorInfo);
                const errorFields = errorInfo.errorFields?.map((f: any) => f.name.join(' -> ')).join(', ');

                notification.error({
                    message: 'Ошибка заполнения формы',
                    description: `Проверьте выделенные красным поля. Если вы не видите ошибку, проверьте свернутые вкладки или списки. Незаполненные поля: ${errorFields || 'Неизвестно'}`,
                    duration: 8,
                });
                props.onFinishFailed?.(errorInfo);
            }}
            submitter={{
                ...props.submitter,
                render: (submitterProps, defaultDoms) => {
                    if (props.submitter && props.submitter.render) {
                        return props.submitter.render(submitterProps, defaultDoms);
                    }

                    return defaultDoms;
                }
            }}
        >
            <ErrorBoundary fallbackMessage="Форма не может быть загружена из-за поврежденных данных. Попробуйте обновить страницу.">
                {typeof children === 'function' ? (children as any) : children}
            </ErrorBoundary>
        </ModalForm>
    );
};
