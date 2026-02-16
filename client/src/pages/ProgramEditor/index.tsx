import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import HallsModal from './HallsModal';
import SessionModal from './SessionModal';
import TrackModal from './TrackModal';
import ScheduleGrid from '../../components/ScheduleGrid';

const ProgramEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const eventId = id || 1;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hallsModalVisible, setHallsModalVisible] = useState(false);
    const [speakers, setSpeakers] = useState<any[]>([]);

    // Session Modal State
    const [sessionModalVisible, setSessionModalVisible] = useState(false);
    const [currentSession, setCurrentSession] = useState<any>(null);

    // Track Modal State
    const [trackModalVisible, setTrackModalVisible] = useState(false);
    const [currentTrackHallId, setCurrentTrackHallId] = useState<number | undefined>(undefined);
    const [currentTrack, setCurrentTrack] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [scheduleRes, speakersRes] = await Promise.all([
                axios.get(`/api/events/${eventId}/full-structure`),
                axios.get('/api/speakers')
            ]);
            setData(scheduleRes.data);
            setSpeakers(speakersRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            message.error('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchData();
        }
    }, [eventId]);

    const handleSessionClick = (session: any) => {
        setCurrentSession(session);
        setSessionModalVisible(true);
    };

    const handleCreateSession = () => {
        setCurrentSession(null);
        setSessionModalVisible(true);
    };

    const handleEmptySlotClick = (_hallId: number, startTime: string) => {
        // Find if there is a track in this hall at this time?
        // Or just open modal with startTime and let user pick track.
        // We could filter tracksOptions to only show tracks in this hall?
        // For now, simple:
        setCurrentSession({
            startTime: startTime,
            // default duration 30 min?
            endTime: startTime // User picks end time
        });
        setSessionModalVisible(true);
    };

    const handleSaveSession = async (values: any) => {
        try {
            if (values.id) {
                await axios.patch(`/api/sessions/${values.id}`, values);
                message.success('Сессия обновлена');
            } else {
                await axios.post('/api/sessions', values);
                message.success('Сессия создана');
            }
            fetchData(); // Refresh grid
            return true;
        } catch (error) {
            console.error('Failed to save session:', error);
            message.error('Ошибка сохранения');
            return false;
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        try {
            await axios.delete(`/api/sessions/${sessionId}`);
            message.success('Сессия удалена');
            setSessionModalVisible(false);
            fetchData();
        } catch (error) {
            console.error('Failed to delete session:', error);
            message.error('Ошибка удаления');
        }
    };

    // Track Handlers
    const handleAddTrack = (hallId: number) => {
        setCurrentTrackHallId(hallId);
        setCurrentTrack(null);
        setTrackModalVisible(true);
    };

    const handleSaveTrack = async (values: any) => {
        try {
            if (values.id) {
                await axios.patch(`/api/tracks/${values.id}`, values);
                message.success('Трек обновлен');
            } else {
                await axios.post('/api/tracks', values);
                message.success('Трек создан');
            }
            setTrackModalVisible(false);
            fetchData();
            return true;
        } catch (error) {
            console.error('Failed to save track:', error);
            message.error('Ошибка сохранения трека');
            return false;
        }
    };

    // Extract tracks for selection in modal
    const tracksOptions = useMemo(() => {
        if (!data?.halls) return [];
        const options: { value: number; label: string }[] = [];
        data.halls.forEach((hall: any) => {
            hall.tracks?.forEach((track: any) => {
                options.push({
                    value: track.id,
                    label: `${hall.name} - ${track.name}`
                });
            });
        });
        return options;
    }, [data]);

    return (
        <PageContainer title="New Retail Forum 2025">
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Button
                    icon={<SettingOutlined />}
                    onClick={() => setHallsModalVisible(true)}
                >
                    Управление залами
                </Button>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateSession}
                >
                    Создать сессию
                </Button>
            </div>

            <ScheduleGrid
                data={data}
                loading={loading}
                onSessionClick={handleSessionClick}
                onEmptySlotClick={handleEmptySlotClick}
                onAddTrack={handleAddTrack}
            />

            <HallsModal
                visible={hallsModalVisible}
                onClose={() => {
                    setHallsModalVisible(false);
                    fetchData(); // Refresh in case halls changed
                }}
                eventId={Number(eventId)}
            />

            <SessionModal
                visible={sessionModalVisible}
                onClose={() => setSessionModalVisible(false)}
                onFinish={handleSaveSession}
                onDelete={handleDeleteSession}
                initialValues={currentSession}
                tracks={tracksOptions}
                speakers={speakers.map(s => ({ label: `${s.firstName} ${s.lastName}`, value: s.id }))}
            />

            <TrackModal
                visible={trackModalVisible}
                onClose={() => setTrackModalVisible(false)}
                onFinish={handleSaveTrack}
                initialValues={currentTrack}
                hallId={currentTrackHallId}
                eventId={Number(eventId)}
            />
        </PageContainer>
    );
};

export default ProgramEditor;
