import { useRef } from 'react';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-components';
import { Button, notification } from 'antd';
import { ErrorBoundary } from '../ErrorBoundary';

export interface SafeDrawerFormProps<T = Record<string, any>> extends DrawerFormProps<T> {
    submitText?: string;
    cancelText?: string;
    onDelete?: () => void; // Optional generic delete handler injected into submitter
}

/**
 * SafeDrawerForm wraps Ant Design Pro's DrawerForm to provide:
 * 1. An ErrorBoundary to prevent the drawer contents from crashing the entire app if data is malformed.
 * 2. A "Smart Submit" button that forcibly calls validateFields() before triggering onFinish.
 *    If an error occurs in a hidden tab or list, it surfaces a clear `notification` telling the user exactly what field failed.
 */
export const SafeDrawerForm = <T extends Record<string, any>>({
    children,
    submitText = 'Сохранить',
    cancelText = 'Отмена',
    onDelete,
    onFinish,
    ...props
}: SafeDrawerFormProps<T>) => {
    const defaultFormRef = useRef<any>(null);
    const actualFormRef = props.formRef || defaultFormRef;

    return (
        <DrawerForm<T>
            {...props}
            formRef={actualFormRef as any}
            submitter={{
                ...props.submitter,
                render: (submitterProps, defaultDoms) => {
                    if (props.submitter && props.submitter.render) {
                        return props.submitter.render(submitterProps, defaultDoms);
                    }

                    const doms = [
                        <Button key="cancel" onClick={() => submitterProps.onReset?.()}>
                            {cancelText}
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={async () => {
                                try {
                                    await submitterProps.form?.validateFields();
                                    submitterProps.submit?.();
                                } catch (e: any) {
                                    console.error("SafeDrawerForm Validation failed:", e);
                                    const errorFields = e.errorFields?.map((f: any) => f.name.join(' -> ')).join(', ');

                                    notification.error({
                                        message: 'Ошибка заполнения формы',
                                        description: `Проверьте выделенные красным поля. Если вы не видите ошибку, проверьте свернутые вкладки или списки. Незаполненные поля: ${errorFields || 'Неизвестно'}`,
                                        duration: 8,
                                    });
                                }
                            }}
                        >
                            {submitText}
                        </Button>
                    ];

                    if (onDelete) {
                        doms.unshift(
                            <Button
                                key="delete"
                                type="primary"
                                danger
                                onClick={() => {
                                    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
                                        onDelete();
                                    }
                                }}
                            >
                                Удалить
                            </Button>
                        );
                    }

                    return doms;
                }
            }}
        >
            <ErrorBoundary fallbackMessage="Информация не может быть загружена из-за поврежденных данных. Попробуйте обновить страницу.">
                {typeof children === 'function' ? (children as any) : children}
            </ErrorBoundary>
        </DrawerForm>
    );
};
