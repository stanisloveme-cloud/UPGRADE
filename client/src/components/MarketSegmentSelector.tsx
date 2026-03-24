import React, { useEffect, useState } from 'react';
import { Row, Col, Checkbox, Typography, Spin } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

interface SegmentNode {
    id: number;
    name: string;
    children?: SegmentNode[];
}

interface MarketSegmentSelectorProps {
    value?: number[] | any[]; // ProForm sometimes passes an array of arrays if it was previously Cascader
    onChange?: (val: number[]) => void;
    maxSelection?: number;
    disabled?: boolean;
}

export const MarketSegmentSelector: React.FC<MarketSegmentSelectorProps> = ({ value = [], onChange, maxSelection, disabled }) => {
    const [tree, setTree] = useState<SegmentNode[]>([]);
    const [loading, setLoading] = useState(true);

    const safeValue = (Array.isArray(value) ? value : []).flat().map(Number).filter(v => !isNaN(v));

    useEffect(() => {
        axios.get('/api/market-segments/tree').then(res => {
            let data = res.data;
            if (data?.data) data = data.data; // Handle wrapped or unwrapped
            setTree(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleCheck = (id: number, checked: boolean) => {
        let newValue = [...safeValue];
        if (checked) {
            if (maxSelection && newValue.length >= maxSelection) return;
            newValue.push(id);
        } else {
            newValue = newValue.filter(v => v !== id);
        }
        onChange?.(newValue);
    };

    if (loading) return <Spin />;

    return (
        <div style={{ background: '#f0f4f8', padding: '24px', borderRadius: '8px', marginBottom: 24, width: '100%' }}>
            <Title level={5} style={{ marginBottom: 16 }}>Сегменты рынка:</Title>
            <Row gutter={[32, 24]}>
                {tree.map(topLevel => (
                    <Col xs={24} md={12} lg={8} key={topLevel.id}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: 12 }}>{topLevel.name}</div>
                        {topLevel.children?.map(sub => (
                            <div key={sub.id} style={{ marginBottom: 12 }}>
                                {sub.children && sub.children.length > 0 ? (
                                    <>
                                        <Text italic style={{ display: 'block', marginBottom: 6, color: '#555' }}>{sub.name}</Text>
                                        <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {sub.children.map(leaf => (
                                                <Checkbox
                                                    key={leaf.id}
                                                    checked={safeValue.includes(leaf.id)}
                                                    onChange={e => handleCheck(leaf.id, e.target.checked)}
                                                    disabled={disabled || (!safeValue.includes(leaf.id) && maxSelection !== undefined && safeValue.length >= maxSelection)}
                                                >
                                                    {leaf.name}
                                                </Checkbox>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Checkbox
                                        checked={safeValue.includes(sub.id)}
                                        onChange={e => handleCheck(sub.id, e.target.checked)}
                                        disabled={disabled || (!safeValue.includes(sub.id) && maxSelection !== undefined && safeValue.length >= maxSelection)}
                                    >
                                        {sub.name}
                                    </Checkbox>
                                )}
                            </div>
                        ))}
                    </Col>
                ))}
            </Row>
        </div>
    );
};
