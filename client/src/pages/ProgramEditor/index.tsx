import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, message, Tabs, Checkbox } from 'antd';
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
            console.log(`[ProgramEditor] Fetching data for eventId: ${eventId}`);
            const [scheduleRes, speakersRes] = await Promise.all([
                axios.get(`/api/events/${eventId}/full-structure`),
                axios.get('/api/speakers')
            ]);
            console.log('[ProgramEditor] API Response:', scheduleRes.data);
            setData(scheduleRes.data);
            setSpeakers(speakersRes.data);
        } catch (err) {
            console.error('[ProgramEditor] Failed to fetch data:', err);
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

    const handleDeleteTrack = async (trackId: number) => {
        try {
            await axios.delete(`/api/tracks/${trackId}`);
            message.success('Трек удален');
            setTrackModalVisible(false);
            fetchData();
        } catch (error) {
            console.error('Failed to delete track:', error);
            message.error('Ошибка удаления трека');
        }
    };

    const handleTrackClick = (track: any) => {
        setCurrentTrackHallId(track.hallId);
        setCurrentTrack(track);
        setTrackModalVisible(true);
    };

    const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);
    const [gridFilters, setGridFilters] = useState({
        hideSessions: false, // Not implemented fully yet
        hideSpeakers: false,
        showPresenceStatus: false
    });

    const availableDays = useMemo(() => {
        if (!data?.halls) return [];
        const days = new Set<string>();
        data.halls.forEach((hall: any) => {
            hall.tracks?.forEach((track: any) => {
                if (track.day) {
                    const dateStr = new Date(track.day).toISOString().split('T')[0];
                    days.add(dateStr);
                }
            });
        });
        return Array.from(days).sort();
    }, [data]);

    useEffect(() => {
        if (availableDays.length > 0 && (!selectedDay || !availableDays.includes(selectedDay))) {
            setSelectedDay(availableDays[0]);
        }
    }, [availableDays, selectedDay]);

    const filteredData = useMemo(() => {
        if (!data) return null;
        if (!selectedDay) return data;

        const halls = data.halls.map((hall: any) => ({
            ...hall,
            tracks: hall.tracks?.filter((track: any) => {
                if (!track.day) return true;
                const dateStr = new Date(track.day).toISOString().split('T')[0];
                return dateStr === selectedDay;
            })
        }));

        return { ...data, halls };
    }, [data, selectedDay]);

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
        <PageContainer title={data?.name || "Загрузка..."}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
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
            </div>

            <div style={{ marginBottom: 16, background: '#fff', padding: '12px 24px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <Checkbox
                        checked={gridFilters.hideSessions}
                        onChange={(e: any) => setGridFilters(prev => ({ ...prev, hideSessions: e.target.checked }))}>
                        Скрыть сессии
                    </Checkbox>
                    <Checkbox
                        checked={gridFilters.hideSpeakers}
                        onChange={(e: any) => setGridFilters(prev => ({ ...prev, hideSpeakers: e.target.checked }))}>
                        Скрыть бейджи спикеров
                    </Checkbox>
                    <Checkbox
                        checked={gridFilters.showPresenceStatus}
                        onChange={(e: any) => setGridFilters(prev => ({ ...prev, showPresenceStatus: e.target.checked }))}>
                        Показать статусы присутствия
                    </Checkbox>
                </div>

                {availableDays.length > 0 && (
                    <Tabs
                        activeKey={selectedDay}
                        onChange={setSelectedDay}
                        items={availableDays.map(day => ({
                            key: day,
                            label: new Date(day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                        }))}
                        style={{ marginBottom: -16 }} // Reduce gap to grid
                    />
                )}
            </div>

            <ScheduleGrid
                data={filteredData}
                loading={loading}
                filters={gridFilters}
                onSessionClick={handleSessionClick}
                onEmptySlotClick={handleEmptySlotClick}
                onAddTrack={handleAddTrack}
                onTrackClick={handleTrackClick}
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
                speakers={speakers.map(s => ({
                    label: `${s.lastName} ${s.firstName}${s.company ? ` (${s.company})` : ''}`,
                    value: s.id
                }))}
            />

            <TrackModal
                visible={trackModalVisible}
                onClose={() => setTrackModalVisible(false)}
                onFinish={handleSaveTrack}
                onDelete={handleDeleteTrack}
                initialValues={currentTrack}
                hallId={currentTrackHallId}
                eventId={Number(eventId)}
            />
        </PageContainer>
    );
};

export default ProgramEditor;
