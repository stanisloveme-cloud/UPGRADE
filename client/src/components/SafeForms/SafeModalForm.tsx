import { useRef } from 'react';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { notification, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ErrorBoundary } from '../ErrorBoundary';

export interface SafeModalFormProps<T = Record<string, any>> extends ModalFormProps<T> {
    submitText?: string;
    cancelText?: string;
    onDelete?: () => void;
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
    onDelete,
    onFinish,
    ...props
}: SafeModalFormProps<T>) => {
    const defaultFormRef = useRef<any>(null);
    const actualFormRef = props.formRef || defaultFormRef;

    return (
        <ModalForm<T>
            {...props}
            formRef={actualFormRef as any}
            onFinish={async (values) => {
                if (!onFinish) return true;
                try {
                    return await onFinish(values);
                } catch (error: any) {
                    console.error("SafeModalForm intercepted backend error:", error);
                    notification.error({
                        message: 'Ошибка при сохранении',
                        description: error.response?.data?.message || error.message || 'Произошла ошибка при отправке данных на сервер',
                        duration: 8,
                    });
                    return false; // Prevent form from closing
                }
            }}
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

                    const doms = [...defaultDoms];

                    if (onDelete) {
                        doms.unshift(
                            <Popconfirm
                                key="delete"
                                title="Удаление"
                                description="Вы уверены, что хотите удалить эту запись?"
                                onConfirm={(e: any) => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    return onDelete();
                                }}
                                onCancel={(e: any) => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                }}
                                okText="Удалить"
                                cancelText="Отмена"
                                okType="danger"
                            >
                                <Button
                                    type="primary"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                />
                            </Popconfirm>
                        );
                    }

                    return doms;
                }
            }}
        >
            <ErrorBoundary fallbackMessage="Форма не может быть загружена из-за поврежденных данных. Попробуйте обновить страницу.">
                {typeof children === 'function' ? (children as any) : children}
            </ErrorBoundary>
        </ModalForm>
    );
};
