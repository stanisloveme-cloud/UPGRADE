import { useRef } from 'react';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { Button, notification } from 'antd';
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
            submitter={{
                ...props.submitter,
                render: (submitterProps, defaultDoms) => {
                    // If the user provided a completely custom submitter render, use it (though they lose safety)
                    if (props.submitter && props.submitter.render) {
                        return props.submitter.render(submitterProps, defaultDoms);
                    }

                    return [
                        <Button key="cancel" onClick={() => submitterProps.onReset?.()}>
                            {cancelText}
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={async () => {
                                try {
                                    // Force validation of all fields, even hidden ones
                                    await submitterProps.form?.validateFields();
                                    // If successful, hand over to the default submit handler
                                    submitterProps.form?.submit();
                                } catch (e: any) {
                                    console.error("SafeModalForm Validation failed:", e);

                                    // Extract field names that failed validation
                                    const errorFields = e.errorFields?.map((f: any) => f.name.join(' -> ')).join(', ');

                                    notification.error({
                                        message: 'Ошибка заполнения формы',
                                        description: `Проверьте выделенные красным поля. Если вы не видите ошибку, проверьте свернутые вкладки или списки. Незаполненные поля: ${errorFields || 'Неизвестно'}`,
                                        duration: 8, // stay open longer so user can read it
                                    });
                                }
                            }}
                        >
                            {submitText}
                        </Button>
                    ];
                }
            }}
        >
            <ErrorBoundary fallbackMessage="Форма не может быть загружена из-за поврежденных данных. Попробуйте обновить страницу.">
                {typeof children === 'function' ? (children as any) : children}
            </ErrorBoundary>
        </ModalForm>
    );
};
