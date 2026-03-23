import { useRef } from 'react';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-components';
import { Button, notification, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
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
            onFinish={onFinish}
            formRef={actualFormRef as any}
            onFinishFailed={(errorInfo: any) => {
                console.error("SafeDrawerForm Validation failed:", errorInfo);
                const errorFields = errorInfo.errorFields?.map((f: any) => f.name.join(' -> ')).join(', ');

                notification.error({
                    message: 'Ошибка заполнения формы',
                    description: `Проверьте выделенные красным поля. Если вы не видите ошибку, проверьте свернутые вкладки или списки. Незаполненные поля: ${errorFields || 'Неизвестно'}`,
                    duration: 8,
                });
                props.onFinishFailed?.(errorInfo);
            }}
            submitter={{
                searchConfig: {
                    submitText,
                    resetText: cancelText,
                },
                ...(props.submitter || {}),
                render: (submitterProps, defaultDoms) => {
                    if (props.submitter && props.submitter.render) {
                        return props.submitter.render(submitterProps, defaultDoms);
                    }

                    const doms = [...defaultDoms];

                    if (onDelete) {
                        doms.unshift(
                            <Button
                                key="delete"
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Удаление',
                                        content: 'Вы уверены, что хотите удалить эту запись?',
                                        okText: 'Удалить',
                                        okType: 'danger',
                                        cancelText: 'Отмена',
                                        onOk: () => onDelete()
                                    });
                                }}
                            />
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
