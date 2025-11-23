import { useState } from 'react';
import { MapPin, Edit2, Check, X } from 'lucide-react';

interface AdminTeam {
  id: string;
  name: string;
  memberCount: number;
  isComplete: boolean;
  roomNumber: number | null;
  currentScore: number;
  rank: number | null;
}

interface AdminRoomsManagementProps {
  teams: AdminTeam[];
  onAssignRoom: (teamId: string, roomNumber: number) => void;
  roomNames: Record<number, string>;
  onUpdateRoomName: (roomNumber: number, name: string) => void;
}

export default function AdminRoomsManagement({
  teams,
  onAssignRoom,
  roomNames,
  onUpdateRoomName
}: AdminRoomsManagementProps) {
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (roomNum: number, currentName: string) => {
    setEditingRoom(roomNum);
    setEditName(currentName);
  };

  const saveRoomName = (roomNum: number) => {
    if (editName.trim()) {
      onUpdateRoomName(roomNum, editName.trim());
    }
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Gestion des Salles</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((roomNum) => {
          const roomTeams = teams.filter((t) => t.roomNumber === roomNum);
          const roomName = roomNames[roomNum] || `Salle ${roomNum}`;
          const isEditing = editingRoom === roomNum;

          return (
            <div key={roomNum} className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-surface border border-white/20 rounded px-3 py-1 text-white focus:outline-none focus:border-neon-rose"
                      autoFocus
                    />
                    <button
                      onClick={() => saveRoomName(roomNum)}
                      className="p-1 hover:bg-green-500/20 text-green-400 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingRoom(null)}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    {roomName}
                    <button
                      onClick={() => startEditing(roomNum, roomName)}
                      className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </h3>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {roomTeams.length > 0 ? (
                  roomTeams.map((team) => (
                    <div key={team.id} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                      <div>
                        <p className="font-medium text-white">{team.name}</p>
                        <p className="text-sm text-gray-400">{team.memberCount} membres</p>
                      </div>
                      <button
                        onClick={() => onAssignRoom(team.id, 0)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">Aucune équipe assignée</p>
                )}
              </div>

              {roomTeams.length < 5 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onAssignRoom(e.target.value, roomNum);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-rose/50"
                >
                  <option value="">Assigner une équipe...</option>
                  {teams
                    .filter((t) => !t.roomNumber)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.memberCount} membres)
                      </option>
                    ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

