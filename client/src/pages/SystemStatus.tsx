import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Statistic, Tag, Spin, Button, message, Alert } from 'antd';
import { DatabaseOutlined, HddOutlined, DashboardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

interface HealthResponse {
  status: 'ok' | 'error' | 'shutting_down';
  info: any;
  error: any;
  details: any;
}

const SystemStatus: React.FC = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      // Direct call since this is unprotected right now, or through an API client
      const response = await fetch('/api/v1/health', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      message.error('Сбой при получении статуса системы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const intervalId = setInterval(fetchHealth, 15000); // 15 seconds auto-refresh
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'up') return 'success';
    if (status === 'down') return 'error';
    return 'default';
  };

  const getStatusText = (status: string) => {
    if (status === 'up') return 'Работает';
    if (status === 'down') return 'Ошибка';
    return 'Неизвестно';
  };

  const dbStatus = data?.details?.database?.status || 'unknown';
  const memHeapStatus = data?.details?.memory_heap?.status || 'unknown';
  const memRssStatus = data?.details?.memory_rss?.status || 'unknown';
  const storageStatus = data?.details?.storage?.status || 'unknown';
  const storageStatus = data?.details?.storage?.status || 'unknown';

  return (
    <PageContainer 
      header={{ title: 'Мониторинг Системы', subTitle: 'Состояние основных узлов серверов и баз данных' }}
      extra={[
        <Button key="refresh" type="primary" onClick={fetchHealth} loading={loading}>
          Обновить
        </Button>
      ]}
    >
      {!data && loading && <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />}
      
      {data && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Alert 
                message="Статус приложения" 
                description={`Текущее состояние бэкенда: ${data.status.toUpperCase()}`}
                type={data.status === 'ok' ? 'success' : 'error'}
                showIcon 
                style={{ marginBottom: 16 }}
              />
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Card bordered={false}>
                <Statistic
                  title="База данных (PostgreSQL)"
                  value={getStatusText(dbStatus)}
                  valueStyle={{ color: dbStatus === 'up' ? '#3f8600' : '#cf1322' }}
                  prefix={<DatabaseOutlined />}
                  suffix={<Tag color={getStatusColor(dbStatus)} style={{ marginLeft: 8 }}>{dbStatus}</Tag>}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Card bordered={false}>
                <Statistic
                  title="Загрузка памяти (Heap)"
                  value={getStatusText(memHeapStatus)}
                  valueStyle={{ color: memHeapStatus === 'up' ? '#3f8600' : '#cf1322' }}
                  prefix={<DashboardOutlined />}
                  suffix={<Tag color={getStatusColor(memHeapStatus)} style={{ marginLeft: 8 }}>{memHeapStatus}</Tag>}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Card bordered={false}>
                <Statistic
                  title="Загрузка памяти (RSS)"
                  value={getStatusText(memRssStatus)}
                  valueStyle={{ color: memRssStatus === 'up' ? '#3f8600' : '#cf1322' }}
                  prefix={<DashboardOutlined />}
                  suffix={<Tag color={getStatusColor(memRssStatus)} style={{ marginLeft: 8 }}>{memRssStatus}</Tag>}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Card bordered={false}>
                <Statistic
                  title="Свободное место на диске"
                  value={getStatusText(storageStatus)}
                  valueStyle={{ color: storageStatus === 'up' ? '#3f8600' : '#cf1322' }}
                  prefix={<HddOutlined />}
                  suffix={<Tag color={getStatusColor(storageStatus)} style={{ marginLeft: 8 }}>{storageStatus}</Tag>}
                />
              </Card>
            </Col>


          </Row>
        </>
      )}
    </PageContainer>
  );
};

export default SystemStatus;