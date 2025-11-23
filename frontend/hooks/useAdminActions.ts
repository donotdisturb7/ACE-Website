import { api } from '@/lib/api';
import { AdminTeam } from './useAdminData';

export function useAdminActions(
  teams: AdminTeam[],
  updateTeam: (teamId: string, updates: Partial<AdminTeam>) => void
) {
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inscriptions-ace.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  };

  const handleAssignRoom = async (teamId: string, roomNumber: number) => {
    try {
      await api.post('/admin/rooms/assign', {
        assignments: [{ teamId, roomNumber }],
      });
      updateTeam(teamId, { roomNumber });
    } catch (error) {
      console.error('Error assigning room:', error);
      throw error;
    }
  };

  const handleUpdateRoomName = async (roomNumber: number, name: string) => {
    try {
      await api.post('/admin/rooms/names', { roomNumber, name });
    } catch (error) {
      console.error('Error updating room name:', error);
      throw error;
    }
  };

  const handleAddRoom = async () => {
    try {
      await api.post('/admin/rooms');
    } catch (error) {
      console.error('Error adding room:', error);
      throw error;
    }
  };

  const handleDeleteRoom = async (roomNumber: number) => {
    try {
      await api.delete(`/admin/rooms/${roomNumber}`);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  return { handleExportCSV, handleAssignRoom, handleUpdateRoomName, handleAddRoom, handleDeleteRoom };
}

